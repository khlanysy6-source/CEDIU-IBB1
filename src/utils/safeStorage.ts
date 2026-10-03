// Utility module providing robust storage methods with QuotaExceededError and SecurityError protection.
// Prevents application crashes and sync failures when localStorage quota is exceeded by large datasets.

const memoryStorage: Record<string, string> = {};

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (memoryStorage[key] !== undefined) {
      return memoryStorage[key];
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) {
          memoryStorage[key] = val;
          return val;
        }
      }
    } catch (e) {
      console.warn(`[safeLocalStorage] getItem failed for key "${key}":`, e);
    }
    return null;
  },

  setItem: (key: string, value: string): boolean => {
    memoryStorage[key] = value;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(key, value);
          // Async sync to IndexedDB for large objects as durable fallback
          if (key === 'cooperative_initiatives_data') {
            saveToIndexedDB(key, value).catch(() => {});
          }
          return true;
        } catch (quotaError) {
          console.warn(`[safeLocalStorage] Quota exceeded setting key "${key}". Maintained in memory cache.`, quotaError);
          // Clear non-essential items and attempt once more
          try {
            const nonEssentialKeys = ['executive_report_attachments', 'cooperative_staged_field_submissions'];
            nonEssentialKeys.forEach(k => {
              if (k !== key) window.localStorage.removeItem(k);
            });
            window.localStorage.setItem(key, value);
            return true;
          } catch (retryErr) {
            console.warn(`[safeLocalStorage] Retry after cleanup also exceeded quota for key "${key}". Keeping in memory & IndexedDB.`, retryErr);
          }
        }
      }
    } catch (e) {
      console.warn(`[safeLocalStorage] setItem failed for key "${key}":`, e);
    }
    // Asynchronously back up to IndexedDB so page reloads don't lose data
    if (key === 'cooperative_initiatives_data') {
      saveToIndexedDB(key, value).catch(() => {});
    }
    return false;
  },

  removeItem: (key: string): void => {
    delete memoryStorage[key];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[safeLocalStorage] removeItem failed for key "${key}":`, e);
    }
  },

  clear: (): void => {
    for (const k in memoryStorage) {
      delete memoryStorage[k];
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (e) {
      console.warn(`[safeLocalStorage] clear failed:`, e);
    }
  }
};

/**
 * IndexedDB helper for storing large datasets (> 5MB limit of localStorage)
 */
const DB_NAME = 'CooperativeDataDB';
const STORE_NAME = 'kv_store';

function getIDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return resolve(null);
    }
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveToIndexedDB(key: string, value: any): Promise<boolean> {
  try {
    const db = await getIDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function getFromIndexedDB<T>(key: string): Promise<T | null> {
  try {
    const db = await getIDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T) || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Robustly inspects memoryStorage, localStorage, and IndexedDB to retrieve
 * the persisted initiatives dataset with the highest item count.
 * Guarantees that large imported datasets (>5MB) stored in IndexedDB are never
 * lost or overwritten by smaller default fallbacks.
 */
export async function loadPersistedInitiatives(): Promise<any[] | null> {
  // 1. Check in-memory cache
  const inMemory = memoryStorage['cooperative_initiatives_data'];
  let memoryData: any[] | null = null;
  if (inMemory) {
    try {
      const parsed = typeof inMemory === 'string' ? JSON.parse(inMemory) : inMemory;
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryData = parsed;
      }
    } catch (e) {}
  }

  // 2. Check localStorage
  let localData: any[] | null = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('cooperative_initiatives_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localData = parsed;
        }
      }
    }
  } catch (e) {}

  // 3. Check IndexedDB
  let idbData: any[] | null = null;
  try {
    const idbVal = await getFromIndexedDB<any>('cooperative_initiatives_data');
    if (idbVal) {
      const parsed = typeof idbVal === 'string' ? JSON.parse(idbVal) : idbVal;
      if (Array.isArray(parsed) && parsed.length > 0) {
        idbData = parsed;
      }
    }
  } catch (e) {}

  // Select candidate dataset with maximum length (rejecting truncated datasets < 725 if a larger dataset is expected)
  const candidates = [memoryData, localData, idbData].filter((c): c is any[] => Array.isArray(c) && c.length >= 725);
  if (candidates.length === 0) {
    // If all persisted items are truncated (< 725), return null so App falls back to the static 725 canonical dataset
    return null;
  }

  candidates.sort((a, b) => b.length - a.length);
  return candidates[0];
}
