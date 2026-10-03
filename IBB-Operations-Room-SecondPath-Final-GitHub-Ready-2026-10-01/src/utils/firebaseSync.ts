import { collection, doc, deleteDoc, getDoc, getDocs, setDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigValid, auth } from './firebaseAuth';
import { Initiative, Knight } from '../types';
import { safeLocalStorage } from './safeStorage';
import { persistCanonicalInitiatives, sanitizeLocalCaches } from './CanonicalInitiativesRepository';
import { isBootstrapAdminEmail } from '../security/adminBootstrap';

const COLLECTION_NAME = 'cooperative_initiatives';

/**
 * Resolves trusted admin credentials if the current user is authenticated and authorized.
 * Returns null if not logged in or unauthorized (safe for non-throwing background checks).
 */
export async function getTrustedAdminOrNull(): Promise<{ uid: string; email: string | null } | null> {
  try {
    const user = auth?.currentUser;
    if (!user) return null;
    
    const isBootstrap = isBootstrapAdminEmail(user.email);
    if (!user.emailVerified && !isBootstrap) return null;

    const tokenResult = await user.getIdTokenResult?.().catch(() => null);
    const role = tokenResult?.claims?.role;
    const isClaimAdmin = role === 'SUPER_ADMIN' || role === 'admin' || isBootstrap;
    if (!isClaimAdmin) return null;

    return { uid: user.uid, email: user.email || null };
  } catch {
    return null;
  }
}

/**
 * Client-side guard for cloud writes. Firestore Rules remain the final
 * authority; this guard prevents the UI from attempting privileged writes and
 * prevents false-positive "success" messages for ordinary users.
 */
export async function requireTrustedAdmin(): Promise<{ uid: string; email: string | null }> {
  const user = auth?.currentUser;
  if (!user) {
    throw new Error('يجب تسجيل الدخول بحساب موثق قبل إجراء التعديلات في السحابة.');
  }

  const isBootstrap = isBootstrapAdminEmail(user.email);
  if (!user.emailVerified && !isBootstrap) {
    throw new Error('يجب توثيق البريد الإلكتروني للحساب قبل الكتابة إلى السحابة.');
  }

  const tokenResult = await user.getIdTokenResult?.().catch(() => null);
  const role = tokenResult?.claims?.role;
  const isClaimAdmin = role === 'SUPER_ADMIN' || role === 'admin' || isBootstrap;
  if (!isClaimAdmin) {
    throw new Error('ليس لديك صلاحية إدارية للكتابة إلى السحابة.');
  }

  return { uid: user.uid, email: user.email || null };
}


export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

/**
 * Handles Firestore errors cleanly with diagnostic log payload.
 */
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Cloud Sync Note (Offline/Fallback Mode):', errInfo.error);
}

/**
 * Wraps a promise with a safety timeout to prevent hanging when Firestore backend is unreachable.
 */
function withTimeout<T>(promise: Promise<T>, ms = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore backend timeout - using local cache')), ms)
    )
  ]);
}

/**
 * Syncs the local initiatives list with Firestore cloud database.
 * Uses a smart merge strategy:
 * 1. If cloud is empty, seed it with local data (if user is admin).
 * 2. If cloud has stale data while local dataset has more initiatives, replace cloud (if admin).
 * 3. Resolve conflicts using an `updatedAt` timestamp.
 */
export async function syncInitiativesWithCloud(localData: Initiative[]): Promise<Initiative[]> {
  if (!isFirebaseConfigValid || !db) {
    console.log('Firebase config not configured or invalid, skipping cloud sync.');
    return localData;
  }

  try {
    const initiativesCol = collection(db, COLLECTION_NAME);
    
    let snapshot;
    try {
      snapshot = await withTimeout(getDocs(initiativesCol), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, COLLECTION_NAME);
      return localData;
    }

    const cloudData: Initiative[] = [];
    
    snapshot.forEach((docSnap) => {
      const docId = docSnap.id;
      if (docId) {
        cloudData.push({ id: docId, ...docSnap.data() } as Initiative);
      }
    });

    const trustedAdmin = await getTrustedAdminOrNull();

    if (cloudData.length === 0) {
      if (localData.length > 0 && trustedAdmin) {
        console.log('Cloud database is empty. Seeding Firestore with local initiatives data...');
        try {
          await uploadAllToCloud(localData);
        } catch (seedErr) {
          console.warn('Cloud seeding notice:', seedErr);
        }
      }
      return localData;
    }

    // 1. If local data has MORE initiatives than cloud (e.g. 725 local vs 190 cloud),
    // local dataset is authoritative. Replace cloud with local dataset if user has admin credentials.
    if (localData.length > cloudData.length) {
      if (trustedAdmin) {
        console.log(`[Cloud Sync] Local dataset (${localData.length} items) is larger than cloud dataset (${cloudData.length} items). Replacing cloud with local dataset...`);
        try {
          await replaceCloudCollection(localData);
        } catch (replaceErr) {
          console.warn('Cloud collection replacement notice:', replaceErr);
        }
      }
      return localData;
    }

    // 2. If cloud data has MORE initiatives than local (e.g. 725 cloud vs 190 local),
    // cloud dataset is authoritative. Update local cache with cloud dataset.
    if (cloudData.length > localData.length) {
      console.log(`[Cloud Sync] Cloud dataset (${cloudData.length} items) is larger than local dataset (${localData.length} items). Updating local state with cloud dataset...`);
      safeLocalStorage.setItem('cooperative_initiatives_data', JSON.stringify(cloudData));
      return cloudData;
    }

    const mergedMap = new Map<string, Initiative>();
    
    // 3. Both datasets have equal count: perform smart merge based on timestamps
    cloudData.forEach(item => {
      mergedMap.set(item.id, item);
    });

    for (const localItem of localData) {
      const cloudItem = mergedMap.get(localItem.id);
      if (!cloudItem) {
        mergedMap.set(localItem.id, localItem);
        if (trustedAdmin) {
          saveInitiativeToCloud(localItem).catch(err => console.warn('Save initiative to cloud notice:', err));
        }
      } else {
        const localTime = new Date(localItem.updatedAt || localItem.createdAt || 0).getTime();
        const cloudTime = new Date(cloudItem.updatedAt || cloudItem.createdAt || 0).getTime();
        
        if (localTime > cloudTime || (!localItem.updatedAt && !cloudItem.updatedAt && localItem.status !== cloudItem.status)) {
          mergedMap.set(localItem.id, localItem);
          if (trustedAdmin) {
            saveInitiativeToCloud(localItem).catch(err => console.warn('Save updated initiative to cloud notice:', err));
          }
        }
      }
    }

    const finalMerged = Array.from(mergedMap.values());
    return finalMerged;
  } catch (error: any) {
    console.warn('Data synchronization with Firestore notice (offline/local mode):', error?.message || error);
    return localData;
  }
}

/**
 * Saves a single initiative to the Firestore cloud database.
 */
export async function saveInitiativeToCloud(initiative: Initiative): Promise<void> {
  if (!isFirebaseConfigValid || !db) return;
  const trusted = await requireTrustedAdmin();
  
  const docRef = doc(db, COLLECTION_NAME, initiative.id);
  const updatedInit = {
    ...initiative,
    ownerId: initiative.ownerId || trusted.uid,
    updatedAt: new Date().toISOString()
  };

  const cleanedInit = JSON.parse(JSON.stringify(updatedInit));

  try {
    await setDoc(docRef, cleanedInit, { merge: true });
    console.log(`Saved initiative ID ${initiative.id} to cloud.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${initiative.id}`);
  }
}

/**
 * Uploads/syncs all local initiatives to the Firestore cloud database in batches.
 */
export async function uploadAllToCloud(initiatives: Initiative[]): Promise<void> {
  if (!isFirebaseConfigValid || !db) return;
  const trusted = await requireTrustedAdmin();
  
  // Batch Firestore writes in chunks of 400 (limit is 500)
  for (let i = 0; i < initiatives.length; i += 400) {
    const batch = writeBatch(db);
    const chunk = initiatives.slice(i, i + 400);
    chunk.forEach(item => {
      const docRef = doc(db, COLLECTION_NAME, item.id);
      const updatedItem = {
        ...item,
        ownerId: item.ownerId || trusted.uid,
        updatedAt: new Date().toISOString()
      };
      const cleanedItem = JSON.parse(JSON.stringify(updatedItem));
      batch.set(docRef, cleanedItem, { merge: true });
    });

    try {
      await batch.commit();
      console.log(`Uploaded batch of ${chunk.length} initiatives to cloud.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    }
  }
}

/**
 * Completely replaces all documents in the Firestore initiatives collection with a new dataset.
 * Deletes all existing documents first, then batch inserts the new initiatives.
 */
export async function replaceCloudCollection(newInitiatives: Initiative[]): Promise<void> {
  safeLocalStorage.setItem('cooperative_initiatives_data', JSON.stringify(newInitiatives));
  safeLocalStorage.setItem('cooperative_last_cloud_replace_timestamp', new Date().toISOString());

  if (!isFirebaseConfigValid || !db) return;
  const trusted = await requireTrustedAdmin();

  try {
    console.log(`Starting safe cloud replacement with ${newInitiatives.length} initiatives...`);
    const collectionRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(collectionRef);
    const existingIds = new Set(snapshot.docs.map(d => d.id));
    const incomingIds = new Set(newInitiatives.map(item => item.id));

    // Write the replacement dataset first. This avoids the previous
    // delete-first failure mode where a transient error could erase the
    // entire collection before the new dataset was accepted.
    for (let i = 0; i < newInitiatives.length; i += 400) {
      const batch = writeBatch(db);
      const chunk = newInitiatives.slice(i, i + 400);
      chunk.forEach(item => {
        const docRef = doc(db, COLLECTION_NAME, item.id);
        const updatedItem = {
          ...item,
          ownerId: item.ownerId || trusted.uid,
          updatedAt: new Date().toISOString()
        };
        batch.set(docRef, JSON.parse(JSON.stringify(updatedItem)));
      });
      await batch.commit();
    }

    // Delete only documents no longer present, and only after all new data
    // has been successfully written.
    const staleDocs = snapshot.docs.filter(d => !incomingIds.has(d.id));
    for (let i = 0; i < staleDocs.length; i += 400) {
      const batch = writeBatch(db);
      staleDocs.slice(i, i + 400).forEach(d => batch.delete(d.ref));
      await batch.commit();
    }

    const metaRef = doc(db, 'cooperative_settings', 'sync_meta');
    await setDoc(metaRef, {
      lastReplaceAt: new Date().toISOString(),
      itemCount: newInitiatives.length,
      replacedBy: trusted.uid
    }, { merge: true });

    console.log(`Successfully replaced cloud collection with ${newInitiatives.length} initiatives.`);
  } catch (error) {
    console.error('Failed to replace cloud collection in Firestore:', error);
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    throw error;
  }
}

/**
 * Direct helper to force-wipe Firestore initiatives collection and upload fresh initiatives.
 * Returns detailed status for UI feedback.
 */
export async function wipeAndReplaceCloudInitiatives(newInitiatives: Initiative[]): Promise<{ success: boolean; count: number; message: string }> {
  // 1. Immediately update local storage
  safeLocalStorage.setItem('cooperative_initiatives_data', JSON.stringify(newInitiatives));
  safeLocalStorage.setItem('cooperative_last_cloud_replace_timestamp', new Date().toISOString());

  if (!isFirebaseConfigValid || !db) {
    return {
      success: true,
      count: newInitiatives.length,
      message: `تم تحديث التخزين المحلي بنجاح برصيد (${newInitiatives.length}) مبادرة (وضع العمل المحلي/غير المتصل).`
    };
  }

  try {
    console.log(`Executing direct wipe and replace for ${newInitiatives.length} initiatives...`);
    await replaceCloudCollection(newInitiatives);
    return {
      success: true,
      count: newInitiatives.length,
      message: `تم مسح الـ 190 مبادرة القديمة من السحابة بنجاح، وتثبيت ومزامنة الـ (${newInitiatives.length}) مبادرة الجديدة مع حسابك!`
    };
  } catch (err: any) {
    console.warn('Wipe and replace cloud initiatives failed:', err);
    return {
      success: false,
      count: newInitiatives.length,
      message: `تم حفظ البيانات محلياً، لكن لم يتم اعتمادها في السحابة: ${err?.message || 'خطأ غير معروف'}`
    };
  }
}

/**
 * Deletes a single initiative document from Firestore.
 */
export async function deleteInitiativeFromCloud(id: string): Promise<void> {
  if (!isFirebaseConfigValid || !db) return;
  await requireTrustedAdmin();
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    console.log(`Deleted initiative ID ${id} from cloud.`);
  } catch (error) {
    console.warn(`Failed to delete initiative ID ${id} from cloud:`, error);
  }
}

/**
 * Synchronizes custom text overrides with the cloud database.
 */
export async function syncTextOverridesWithCloud(localOverrides: Record<string, string>): Promise<Record<string, string>> {
  if (!isFirebaseConfigValid || !db) {
    return localOverrides;
  }
  try {
    const docRef = doc(db, 'cooperative_settings', 'text_overrides');
    const docSnap = await withTimeout(getDoc(docRef), 3000);
    const trustedAdmin = await getTrustedAdminOrNull();
    if (docSnap.exists()) {
      const cloudOverrides = docSnap.data() as Record<string, string>;
      const merged = { ...localOverrides, ...cloudOverrides };
      if (trustedAdmin && JSON.stringify(merged) !== JSON.stringify(cloudOverrides)) {
        try {
          await setDoc(docRef, merged, { merge: true });
        } catch (e) {
          console.warn('Text overrides sync notice:', e);
        }
      }
      return merged;
    } else {
      if (trustedAdmin && Object.keys(localOverrides).length > 0) {
        try {
          await setDoc(docRef, localOverrides);
        } catch (e) {
          console.warn('Text overrides seed notice:', e);
        }
      }
      return localOverrides;
    }
  } catch (err) {
    console.warn('Failed to sync text overrides with cloud:', err);
    return localOverrides;
  }
}

/**
 * Saves custom text overrides directly to the cloud.
 */
export async function saveTextOverridesToCloud(overrides: Record<string, string>): Promise<void> {
  if (!isFirebaseConfigValid || !db) return;
  await requireTrustedAdmin();
  try {
    const docRef = doc(db, 'cooperative_settings', 'text_overrides');
    await setDoc(docRef, overrides);
    console.log('Saved custom text overrides to cloud settings.');
  } catch (err) {
    console.warn('Failed to save text overrides to cloud:', err);
  }
}

/**
 * Synchronizes the list of available Knights with the cloud database.
 */
export async function syncKnightsWithCloud(localKnights: Knight[]): Promise<Knight[]> {
  if (!isFirebaseConfigValid || !db) {
    return localKnights;
  }
  try {
    const docRef = doc(db, 'cooperative_settings', 'knights_directory');
    const docSnap = await withTimeout(getDoc(docRef), 3000);
    const trustedAdmin = await getTrustedAdminOrNull();
    if (docSnap.exists()) {
      const data = docSnap.data();
      const cloudKnights = (data.knights || []) as Knight[];
      
      // Combine them: items in cloud take precedence, but keep unique local ones too
      const mergedMap = new Map<string, Knight>();
      localKnights.forEach(k => mergedMap.set(k.id, k));
      cloudKnights.forEach(k => mergedMap.set(k.id, k));
      
      const mergedList = Array.from(mergedMap.values());
      
      if (trustedAdmin && JSON.stringify(mergedList) !== JSON.stringify(cloudKnights)) {
        try {
          await setDoc(docRef, { knights: mergedList }, { merge: true });
        } catch (e) {
          console.warn('Knights sync notice:', e);
        }
      }
      return mergedList;
    } else {
      if (trustedAdmin && localKnights.length > 0) {
        try {
          await setDoc(docRef, { knights: localKnights });
        } catch (e) {
          console.warn('Knights seed notice:', e);
        }
      }
      return localKnights;
    }
  } catch (err) {
    console.warn('Failed to sync knights with cloud:', err);
    return localKnights;
  }
}

/**
 * Saves the Knights directory list directly to the cloud.
 */
export async function saveKnightsToCloud(knights: Knight[]): Promise<void> {
  if (!isFirebaseConfigValid || !db) return;
  await requireTrustedAdmin();
  try {
    const docRef = doc(db, 'cooperative_settings', 'knights_directory');
    await setDoc(docRef, { knights });
    console.log('Saved knights directory to cloud settings.');
  } catch (err) {
    console.warn('Failed to save knights directory to cloud:', err);
  }
}

/**
 * Synchronizes entity role permissions settings with the cloud database.
 */
export async function syncRolePermissionsWithCloud(
  localPermissions: Record<string, string[]>
): Promise<Record<string, string[]>> {
  if (!isFirebaseConfigValid || !db) {
    return localPermissions;
  }
  try {
    const docRef = doc(db, 'cooperative_settings', 'role_tab_permissions');
    const docSnap = await withTimeout(getDoc(docRef), 3000);
    const trustedAdmin = await getTrustedAdminOrNull();
    if (docSnap.exists()) {
      const cloudData = docSnap.data() as Record<string, string[]>;
      if (cloudData && Object.keys(cloudData).length > 0) {
        return cloudData;
      }
    } else {
      if (trustedAdmin && Object.keys(localPermissions).length > 0) {
        try {
          await setDoc(docRef, localPermissions);
        } catch (e) {
          console.warn('Role permissions seed notice:', e);
        }
      }
    }
    return localPermissions;
  } catch (err) {
    console.warn('Failed to sync role permissions with cloud:', err);
    return localPermissions;
  }
}

/**
 * Saves entity role permissions directly to the cloud.
 */
export async function saveRolePermissionsToCloud(
  permissions: Record<string, string[]>
): Promise<void> {
  if (!isFirebaseConfigValid || !db) return;
  await requireTrustedAdmin();
  try {
    const docRef = doc(db, 'cooperative_settings', 'role_tab_permissions');
    await setDoc(docRef, permissions);
    console.log('Saved role permissions settings to cloud.');
  } catch (err) {
    console.warn('Failed to save role permissions to cloud:', err);
  }
}

/**
 * Subscribes to real-time role permission changes in Firestore.
 */
export function subscribeToRolePermissions(
  onUpdate: (permissions: Record<string, string[]>) => void
): () => void {
  if (!isFirebaseConfigValid || !db) {
    return () => {};
  }
  try {
    const docRef = doc(db, 'cooperative_settings', 'role_tab_permissions');
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Record<string, string[]>;
          if (data && Object.keys(data).length > 0) {
            onUpdate(data);
          }
        }
      },
      (error) => {
        console.warn('Role permissions real-time subscription error:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to role permissions:', err);
    return () => {};
  }
}
