/**
 * Data Repository Layer
 * Manages Reading, Writing, Querying, and Persistence for the Initiatives Dataset.
 */

import { Initiative } from '../types';
import { generatedInitiatives } from './generated/initiatives725';
import { canonicalizeInitiativeRecord } from './normalizeInitiative';
import { safeLocalStorage, getFromIndexedDB, saveToIndexedDB } from '../utils/safeStorage';

const STORAGE_KEY = 'cooperative_initiatives_data';
const VERSION_KEY = 'cooperative_initiatives_version';
const CURRENT_DATA_VERSION = '2026.09.26.725.final';

let inMemoryCache: Initiative[] | null = null;

/**
 * Synchronously retrieves initial initiatives from memory, localStorage, or canonical 725 dataset.
 */
export function getInitialInitiatives(): Initiative[] {
  if (inMemoryCache && inMemoryCache.length > 0) {
    return inMemoryCache;
  }

  try {
    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    const storedVer = safeLocalStorage.getItem(VERSION_KEY);

    if (raw && storedVer === CURRENT_DATA_VERSION) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryCache = parsed.map((item, idx) => canonicalizeInitiativeRecord(item, idx + 1));
        return inMemoryCache;
      }
    }
  } catch (e) {
    console.warn('[Repository] Failed to read cached initiatives from storage, falling back to SSOT:', e);
  }

  inMemoryCache = generatedInitiatives.map((item, idx) => canonicalizeInitiativeRecord(item, idx + 1));
  
  // Persist canonical data with current version
  try {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(inMemoryCache));
    safeLocalStorage.setItem(VERSION_KEY, CURRENT_DATA_VERSION);
  } catch (e) {
    console.warn('[Repository] Initial cache write error:', e);
  }

  return inMemoryCache;
}

/**
 * Asynchronously loads initiatives, with IndexedDB check if localStorage is missing or stale.
 */
export async function loadInitiativesAsync(): Promise<Initiative[]> {
  const syncData = getInitialInitiatives();
  if (syncData.length >= 725) {
    return syncData;
  }

  try {
    const idbData = await getFromIndexedDB<string>(STORAGE_KEY);
    if (idbData && typeof idbData === 'string') {
      const parsed = JSON.parse(idbData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryCache = parsed.map((item, idx) => canonicalizeInitiativeRecord(item, idx + 1));
        return inMemoryCache;
      }
    }
  } catch (e) {
    console.warn('[Repository] IndexedDB read error:', e);
  }

  return syncData;
}

/**
 * Atomically saves full initiatives array to memory, localStorage, and IndexedDB.
 */
export function saveAllInitiatives(initiatives: Initiative[]): void {
  const canonicalList = initiatives.map((item, idx) => canonicalizeInitiativeRecord(item, idx + 1));
  inMemoryCache = canonicalList;
  const serialized = JSON.stringify(canonicalList);
  safeLocalStorage.setItem(STORAGE_KEY, serialized);
  safeLocalStorage.setItem(VERSION_KEY, CURRENT_DATA_VERSION);
  saveToIndexedDB(STORAGE_KEY, serialized).catch(() => {});
}

/**
 * Updates or inserts a single initiative record.
 */
export function saveInitiativeRecord(record: Initiative): Initiative[] {
  const current = getInitialInitiatives();
  const canonical = canonicalizeInitiativeRecord(record);
  const index = current.findIndex(i => i.id === canonical.id || i.initiativeNumber === canonical.initiativeNumber);

  let updated: Initiative[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...canonical, updatedAt: new Date().toISOString() };
  } else {
    updated = [canonical, ...current];
  }

  saveAllInitiatives(updated);
  return updated;
}

/**
 * Deletes an initiative by ID.
 */
export function deleteInitiativeRecord(id: string): Initiative[] {
  const current = getInitialInitiatives();
  const updated = current.filter(i => i.id !== id);
  saveAllInitiatives(updated);
  return updated;
}

/**
 * Resets local data back to the canonical 725 Master Dataset.
 */
export function resetToCanonicalDataset(): Initiative[] {
  inMemoryCache = generatedInitiatives.map((item, idx) => canonicalizeInitiativeRecord(item, idx + 1));
  saveAllInitiatives(inMemoryCache);
  return inMemoryCache;
}

/**
 * Finds an initiative by its unique ID.
 */
export function findInitiativeById(id: string): Initiative | undefined {
  const all = getInitialInitiatives();
  return all.find(i => i.id === id || i.initiativeNumber === id);
}

/**
 * Filters initiatives by query criteria.
 */
export function queryInitiatives(filter: {
  district?: string;
  status?: string;
  searchQuery?: string;
}): Initiative[] {
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
