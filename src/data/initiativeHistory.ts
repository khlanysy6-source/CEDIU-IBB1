/**
 * Immutable initiative history and audit support.
 * Every runtime initiative mutation is recorded as an event before the
 * current document is changed. History is never used as the live state.
 */

import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { auth, db } from '../utils/firebaseAuth';
import { Initiative } from '../types';

const INITIATIVES_COLLECTION = 'cooperative_initiatives';
const HISTORY_COLLECTION = 'history';
const AUDIT_COLLECTION = 'audit_logs';

export type InitiativeMutationKind =
  | 'create'
  | 'update'
  | 'archive'
  | 'restore'
  | 'import';

export interface InitiativeChange {
  path: string;
  before: unknown;
  after: unknown;
}

function cleanForFirestore(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(cleanForFirestore);
  }
  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(source)) {
      if (item !== undefined && typeof item !== 'function') {
        result[key] = cleanForFirestore(item);
      }
    }
    return result;
  }
  return value;
}

function buildChanges(
  before: unknown,
  after: unknown,
  path = ''
): InitiativeChange[] {
  if (Object.is(before, after)) return [];

  const beforeObject =
    before && typeof before === 'object' && !Array.isArray(before)
      ? (before as Record<string, unknown>)
      : null;
  const afterObject =
    after && typeof after === 'object' && !Array.isArray(after)
      ? (after as Record<string, unknown>)
      : null;

  if (!beforeObject || !afterObject) {
    return [{ path: path || 'record', before, after }];
  }

  const keys = new Set([
    ...Object.keys(beforeObject),
    ...Object.keys(afterObject),
  ]);

  const changes: InitiativeChange[] = [];
  for (const key of keys) {
    changes.push(
      ...buildChanges(
        beforeObject[key],
        afterObject[key],
        path ? `${path}.${key}` : key
      )
    );
  }
  return changes;
}

function actor() {
  const user = auth?.currentUser;
  return {
    uid: user?.uid ?? 'unknown',
    email: user?.email ?? null,
    displayName: user?.displayName ?? null,
  };
}

export async function writeInitiativeMutation(
  record: Initiative,
  kind: InitiativeMutationKind,
  before: Initiative | null = null
): Promise<Initiative> {
  if (!db) throw new Error('Firestore is not initialized.');

  const initiativeId = String(record.id || record.initiativeNumber);
  if (!initiativeId) throw new Error('Initiative ID is required.');

  const after = cleanForFirestore(record) as DocumentData;
  const beforeClean = cleanForFirestore(before) as DocumentData | null;
  const changes = buildChanges(beforeClean, after);
  const eventId = doc(collection(db, AUDIT_COLLECTION)).id;
  const historyRef = doc(
    collection(doc(db, INITIATIVES_COLLECTION, initiativeId), HISTORY_COLLECTION),
    eventId
  );
  const auditRef = doc(db, AUDIT_COLLECTION, eventId);
  const user = actor();
  const changedAtClient = new Date().toISOString();
  const event = {
    eventId,
    initiativeId,
    initiativeNumber: record.initiativeNumber,
    kind,
    actor: user,
    changedAt: serverTimestamp(),
    changedAtClient,
    changes,
    before: beforeClean,
    after,
  };

  await runTransaction(db, async transaction => {
    const initiativeRef = doc(db, INITIATIVES_COLLECTION, initiativeId);
    const currentSnap = await transaction.get(initiativeRef);
    const current = currentSnap.exists()
      ? (cleanForFirestore(currentSnap.data()) as Initiative)
      : beforeClean;

    const effectiveChanges =
      kind === 'update' || kind === 'archive' || kind === 'restore'
        ? buildChanges(current, after)
        : changes;

    transaction.set(initiativeRef, after, { merge: true });
    transaction.set(historyRef, { ...event, before: current, changes: effectiveChanges });
    transaction.set(auditRef, { ...event, before: current, changes: effectiveChanges });
  });

  return record;
}

export async function archiveInitiative(
  initiativeId: string
): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized.');
  const ref = doc(db, INITIATIVES_COLLECTION, initiativeId);
  await runTransaction(db, async transaction => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) return null;
    const current = cleanForFirestore(snap.data()) as Initiative;
    const archived = {
      ...current,
      isArchived: true,
      archivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Initiative & Record<string, unknown>;
    const eventId = doc(collection(db, AUDIT_COLLECTION)).id;
    const historyRef = doc(collection(ref, HISTORY_COLLECTION), eventId);
    const auditRef = doc(db, AUDIT_COLLECTION, eventId);
    const currentChanges = buildChanges(current, archived);
    const event = {
      eventId,
      initiativeId,
      initiativeNumber: current.initiativeNumber,
      kind: 'archive' as InitiativeMutationKind,
      actor: actor(),
      changedAt: serverTimestamp(),
      changedAtClient,
      changedAtClient,
      changes: currentChanges,
      before: current,
      after: archived,
    };
    transaction.set(ref, cleanForFirestore(archived) as DocumentData, { merge: true });
    transaction.set(historyRef, event);
    transaction.set(auditRef, event);
    return archived;
  });
}

export async function restoreInitiative(
  initiativeId: string
): Promise<Initiative | null> {
  if (!db) throw new Error('Firestore is not initialized.');
  const ref = doc(db, INITIATIVES_COLLECTION, initiativeId);
  let restored: Initiative | null = null;
  await runTransaction(db, async transaction => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) return;
    const current = cleanForFirestore(snap.data()) as Initiative & Record<string, unknown>;
    const next = { ...current, isArchived: false, restoredAt: new Date().toISOString() };
    const eventId = doc(collection(db, AUDIT_COLLECTION)).id;
    const historyRef = doc(collection(ref, HISTORY_COLLECTION), eventId);
    const auditRef = doc(db, AUDIT_COLLECTION, eventId);
    const event = {
      eventId,
      initiativeId,
      initiativeNumber: current.initiativeNumber,
      kind: 'restore' as InitiativeMutationKind,
      actor: actor(),
      changedAt: serverTimestamp(),
      changes: buildChanges(current, next),
      before: current,
      after: next,
    };
    transaction.set(ref, next, { merge: true });
    transaction.set(historyRef, event);
    transaction.set(auditRef, event);
    restored = next as Initiative;
  });
  return restored;
}


export async function loadInitiativeHistory(initiativeId: string): Promise<Array<Record<string, unknown>>> {
  if (!db) throw new Error('Firestore is not initialized.');
  const snapshot = await import('firebase/firestore').then(({ getDocs }) =>
    getDocs(collection(doc(db, INITIATIVES_COLLECTION, initiativeId), HISTORY_COLLECTION))
  );
  return snapshot.docs
    .map(item => item.data() as Record<string, unknown>)
    .sort((a, b) => String(a.changedAtClient ?? '').localeCompare(String(b.changedAtClient ?? '')));
}

export async function getInitiativeSnapshotAt(
  initiativeId: string,
  at: Date
): Promise<Initiative | null> {
  const history = await loadInitiativeHistory(initiativeId);
  const cutoff = at.toISOString();
  let snapshot: Initiative | null = null;
  for (const event of history) {
    const changedAt = String(event.changedAtClient ?? '');
    if (changedAt && changedAt <= cutoff) {
      const after = event.after;
      if (after && typeof after === 'object') snapshot = after as Initiative;
    }
  }
  return snapshot;
}
