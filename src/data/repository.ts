/**
 * Data Repository Layer
 * Firestore is the authoritative source of initiative records.
 * LocalStorage/IndexedDB remain a temporary offline/preview cache only.
 */

import { Initiative } from '../types';
import { generatedInitiatives } from './generated/initiatives725';
import { canonicalizeInitiativeRecord } from './normalizeInitiative';
import { safeLocalStorage, getFromIndexedDB, saveToIndexedDB } from '../utils/safeStorage';
import { collection, getDocs, doc, setDoc, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebaseAuth';
import { writeInitiativeMutation, archiveInitiative } from './initiativeHistory';

const STORAGE_KEY = 'cooperative_initiatives_data';
const VERSION_KEY = 'cooperative_initiatives_version';
const CURRENT_DATA_VERSION = '2026.09.26.725.final';
const FIRESTORE_COLLECTION = 'cooperative_initiatives';
const FIRESTORE_BOOTSTRAP_MARKER = 'cooperative_settings/firestore_bootstrap';

let inMemoryCache: Initiative[] | null = null;
let bootstrapPromise: Promise<Initiative[]> | null = null;

function canonicalizeList(items: any[]): Initiative[] {
  return items.map((item, idx) => canonicalizeInitiativeRecord(item, idx + 1));
}

function cacheInitiatives(list: Initiative[]): Initiative[] {
  inMemoryCache = canonicalizeList(list);
  try {
    const serialized = JSON.stringify(inMemoryCache);
    safeLocalStorage.setItem(STORAGE_KEY, serialized);
    safeLocalStorage.setItem(VERSION_KEY, CURRENT_DATA_VERSION);
    saveToIndexedDB(STORAGE_KEY, serialized).catch(() => {});
  } catch (e) {
    console.warn('[Repository] Cache write notice:', e);
  }
  return inMemoryCache;
}

function getCachedInitiatives(): Initiative[] {
  if (inMemoryCache && inMemoryCache.length > 0) return inMemoryCache;
  try {
    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    const storedVer = safeLocalStorage.getItem(VERSION_KEY);
    if (raw && storedVer === CURRENT_DATA_VERSION) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return cacheInitiatives(parsed);
    }
  } catch (e) {
    console.warn('[Repository] Local cache read notice:', e);
  }
  return [];
}

/**
 * Synchronous bootstrap for the first React render.
 * It deliberately does not claim that local data is authoritative.
 */
export function getInitialInitiatives(): Initiative[] {
  const cached = getCachedInitiatives();
  if (cached.length > 0) return cached;
  return cacheInitiatives(generatedInitiatives);
}

/**
 * Loads initiatives from Firestore first. If Firestore is unavailable or empty,
 * the canonical 725 dataset is used as a safe local fallback.
 */
export async function loadInitiativesAsync(): Promise<Initiative[]> {
  if (db) {
    try {
      const snapshot = await getDocs(collection(db, FIRESTORE_COLLECTION));
      if (!snapshot.empty) {
        const remote = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        return cacheInitiatives(remote);
      }
    } catch (e) {
      console.warn('[Repository] Firestore read failed; using local fallback:', e);
    }
  }

  const cached = getCachedInitiatives();
  if (cached.length > 0) return cached;

  try {
    const idbData = await getFromIndexedDB<string>(STORAGE_KEY);
    if (idbData && typeof idbData === 'string') {
      const parsed = JSON.parse(idbData);
      if (Array.isArray(parsed) && parsed.length > 0) return cacheInitiatives(parsed);
    }
  } catch (e) {
    console.warn('[Repository] IndexedDB read notice:', e);
  }

  return cacheInitiatives(generatedInitiatives);
}

/**
 * Seeds Firestore once from the canonical 725 dataset when explicitly called
 * by an authenticated central administrator. Existing Firestore data is never
 * overwritten by this bootstrap.
 */
export async function bootstrapFirestoreFromCanonicalDataset(): Promise<Initiative[]> {
  if (!db) throw new Error('Firestore is not initialized.');
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const markerRef = doc(db, FIRESTORE_BOOTSTRAP_MARKER);
    const marker = await getDoc(markerRef).catch(() => null);

    const existing = await getDocs(collection(db, FIRESTORE_COLLECTION));
    if (!existing.empty || marker?.exists()) {
      const loaded = await loadInitiativesAsync();
      return loaded;
    }

    const canonical = canonicalizeList(generatedInitiatives);
    const chunkSize = 450;

    for (let start = 0; start < canonical.length; start += chunkSize) {
      const batch = writeBatch(db);
      const chunk = canonical.slice(start, start + chunkSize);
      for (const initiative of chunk) {
        const initiativeId = String(initiative.id || initiative.initiativeNumber);
        batch.set(doc(db, FIRESTORE_COLLECTION, initiativeId), initiative);
      }
      await batch.commit();
    }

    await setDoc(markerRef, {
      status: 'completed',
      datasetVersion: CURRENT_DATA_VERSION,
      initiativeCount: canonical.length,
      createdAt: new Date().toISOString()
    });

    return cacheInitiatives(canonical);
  })();

  try {
    return await bootstrapPromise;
  } finally {
    bootstrapPromise = null;
  }
}

/** Saves a single initiative to Firestore and refreshes the local cache. */
export async function saveInitiativeRecordRemote(record: Initiative, kind: 'create' | 'update' = 'update'): Promise<Initiative> {
  if (!db) throw new Error('Firestore is not initialized.');
  const canonical = canonicalizeInitiativeRecord(record);
  const initiativeId = String(canonical.id || canonical.initiativeNumber);
  await writeInitiativeMutation(canonical, kind);
  cacheInitiatives([
    ...(getCachedInitiatives().filter(i => i.id !== canonical.id && i.initiativeNumber !== canonical.initiativeNumber)),
    canonical
  ]);
  return canonical;
}

/** Archives an initiative instead of physically deleting it; history remains recoverable. */
export async function deleteInitiativeRecordRemote(id: string): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized.');
  const current = getCachedInitiatives().find(i => i.id === id);
  await archiveInitiative(id, current ?? null);
  cacheInitiatives(getCachedInitiatives().filter(i => i.id !== id));
}

/** Legacy synchronous cache save retained for offline/import workflows. */
export function saveAllInitiatives(initiatives: Initiative[]): void {
  cacheInitiatives(initiatives);
}

export function saveInitiativeRecord(record: Initiative): Initiative[] {
  const current = getCachedInitiatives();
  const canonical = canonicalizeInitiativeRecord(record);
  const index = current.findIndex(i => i.id === canonical.id || i.initiativeNumber === canonical.initiativeNumber);
  const updated = index >= 0
    ? current.map((item, idx) => idx === index ? { ...item, ...canonical, updatedAt: new Date().toISOString() } : item)
    : [canonical, ...current];
  cacheInitiatives(updated);
  return updated;
}

export function deleteInitiativeRecord(id: string): Initiative[] {
  const updated = getCachedInitiatives().filter(i => i.id !== id);
  cacheInitiatives(updated);
  return updated;
}

export function resetToCanonicalDataset(): Initiative[] {
  return cacheInitiatives(generatedInitiatives);
}

export function findInitiativeById(id: string): Initiative | undefined {
  return getInitialInitiatives().find(i => i.id === id || i.initiativeNumber === id);
}

export function queryInitiatives(filter: { district?: string; status?: string; searchQuery?: string; }): Initiative[] {
  let list = getInitialInitiatives();

  if (filter.district && filter.district !== 'all' && filter.district !== 'جميع مديريات المحافظة') {
    list = list.filter(i => i.district === filter.district || i.district?.includes(filter.district!));
  }

  if (filter.status && filter.status !== 'all') {
    list = list.filter(i => i.status === filter.status);
  }

  if (filter.searchQuery && filter.searchQuery.trim()) {
    const q = filter.searchQuery.trim().toLowerCase();
    list = list.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.initiativeNumber.toLowerCase().includes(q) ||
      i.village.toLowerCase().includes(q) ||
      i.subDistrict.toLowerCase().includes(q) ||
      i.district.toLowerCase().includes(q)
    );
  }

  return list;
}
