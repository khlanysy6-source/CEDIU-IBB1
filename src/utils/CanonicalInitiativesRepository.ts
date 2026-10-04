/**
 * Canonical Initiatives Repository
 * Single Source of Truth for the currently loaded 725 verified initiatives. The approved 786-row target is not claimed until the missing source rows are actually imported.
 * Ensures consistent data flow across all components, decision engines, and persistence layers.
 */

import { Initiative } from '../types';
import { INITIAL_INITIATIVES } from '../data';
import { safeLocalStorage } from './safeStorage';
import { isExcludedDuplicateInitiative, resolveInitiativeSector } from '../data/sectorClassification';

export interface DatasetMetadata {
  datasetVersion: string;
  rowCount: number;
  uniqueCount: number;
  source: string;
  generatedAt: string;
  checksum: string;
  schemaVersion: string;
}

export const CANONICAL_DATASET_METADATA: DatasetMetadata = {
  datasetVersion: '5.0.0-canonical-sector-classified-2026-10-05',
  rowCount: 725,
  uniqueCount: 725,
  source: 'مصفوفة الفرز — تصنيف القطاعات المعتمد للمسار التنفيذي الثاني',
  generatedAt: '2026-09-26T12:00:00Z',
  checksum: 'sha256-ibb-initiatives-725-canonical-v4.0-final',
  schemaVersion: 'v2.1',
};

const STORAGE_KEYS = {
  CANONICAL_CACHE: 'cooperative_initiatives_data',
  LEGACY_CACHE_V2: 'ebb_initiatives_v2',
  GOVERNORATE_CACHE_V3: 'ebb_governorate_local_dataset_v3',
  OFFLINE_CACHE: 'ebb_offline_initiatives_cache',
  METADATA: 'ebb_canonical_dataset_metadata',
};

/**
 * Validates dataset integrity against the Canonical Schema.
 */
export function validateInitiativeData(initiatives: Initiative[]): {
  isValid: boolean;
  totalCount: number;
  uniqueCount: number;
  invalidRecordsCount: number;
  errors: string[];
} {
  const errors: string[] = [];
  if (!Array.isArray(initiatives)) {
    return {
      isValid: false,
      totalCount: 0,
      uniqueCount: 0,
      invalidRecordsCount: 1,
      errors: ['Dataset is not an array'],
    };
  }

  const seenIds = new Set<string>();
  let invalidRecordsCount = 0;

  initiatives.forEach((item, index) => {
    if (!item.id) {
      invalidRecordsCount++;
      errors.push(`Record at index ${index} is missing a required 'id' field.`);
    } else if (seenIds.has(item.id)) {
      invalidRecordsCount++;
      errors.push(`Duplicate ID detected: ${item.id} at index ${index}.`);
    } else {
      seenIds.add(item.id);
    }

    if (!item.name || item.name.trim().length === 0) {
      invalidRecordsCount++;
      errors.push(`Record ${item.id || index} has empty 'name'.`);
    }

    if (!item.district) {
      invalidRecordsCount++;
      errors.push(`Record ${item.id || index} has empty 'district'.`);
    }
  });

  return {
    isValid: invalidRecordsCount === 0 && initiatives.length >= 725,
    totalCount: initiatives.length,
    uniqueCount: seenIds.size,
    invalidRecordsCount,
    errors,
  };
}

/**
 * Returns the Canonical 725 Initiatives Dataset.
 * Prioritizes validated local cache if valid and matching canonical statuses.
 */
export function getCanonicalInitiatives(): Initiative[] {
  try {
    const cachedRaw = safeLocalStorage.getItem(STORAGE_KEYS.CANONICAL_CACHE);
    if (cachedRaw) {
      const parsed = JSON.parse(cachedRaw);
      if (Array.isArray(parsed) && parsed.length >= 725) {
        // Ensure cache is not stale with unclassified status
        const completedInCache = parsed.filter((i: any) => i.status === 'completed').length;
        if (completedInCache > 0) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Error reading canonical local cache, falling back to static snapshot:', err);
  }

  // Fallback to static initiatives snapshot
  return INITIAL_INITIATIVES;
}

/**
 * Persists updated initiatives to local storage cache only if it maintains or exceeds canonical count (725).
 */
export function persistCanonicalInitiatives(initiatives: Initiative[]): boolean {
  if (!Array.isArray(initiatives) || initiatives.length < 725) {
    console.warn(
      `Refusing to persist truncated dataset (${initiatives?.length || 0} items). Canonical minimum is 725.`
    );
    return false;
  }

  const validation = validateInitiativeData(initiatives);
  if (validation.invalidRecordsCount > 0) {
    console.warn(`Dataset contains ${validation.invalidRecordsCount} invalid records. Persisting with caution.`);
  }

  try {
    const jsonStr = JSON.stringify(initiatives);
    safeLocalStorage.setItem(STORAGE_KEYS.CANONICAL_CACHE, jsonStr);
    safeLocalStorage.setItem(STORAGE_KEYS.LEGACY_CACHE_V2, jsonStr);
    safeLocalStorage.setItem(STORAGE_KEYS.GOVERNORATE_CACHE_V3, jsonStr);
    safeLocalStorage.setItem(STORAGE_KEYS.OFFLINE_CACHE, jsonStr);
    safeLocalStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(CANONICAL_DATASET_METADATA));
    return true;
  } catch (err) {
    console.error('Failed to persist canonical dataset to LocalStorage:', err);
    return false;
  }
}

/**
 * Clears legacy, truncated, or unclassified local storage caches.
 */
export function sanitizeLocalCaches(): void {
  const keysToCheck = [
    STORAGE_KEYS.CANONICAL_CACHE,
    STORAGE_KEYS.LEGACY_CACHE_V2,
    STORAGE_KEYS.GOVERNORATE_CACHE_V3,
    STORAGE_KEYS.OFFLINE_CACHE,
  ];

  keysToCheck.forEach((key) => {
    try {
      const item = safeLocalStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        const completedInCache = Array.isArray(parsed) ? parsed.filter((i: any) => i.status === 'completed').length : 0;
        if (!Array.isArray(parsed) || parsed.length < 725 || completedInCache === 0) {
          console.log(`[Cache Sanitization] Removing stale or unclassified cache key '${key}'.`);
          safeLocalStorage.removeItem(key);
        }
      }
    } catch (e) {
      safeLocalStorage.removeItem(key);
    }
  });

  // Ensure current storage has the full canonical dataset
  persistCanonicalInitiatives(INITIAL_INITIATIVES);
}

/**
 * Returns dataset metadata.
 */
export function getDatasetMetadata(): DatasetMetadata {
  return { ...CANONICAL_DATASET_METADATA };
}

/**
 * Canonical Initiatives Repository Object Interface
 */
export const CanonicalInitiativesRepository = {
  getAll: getCanonicalInitiatives,
  validate: validateInitiativeData,
  persist: persistCanonicalInitiatives,
  sanitize: sanitizeLocalCaches,
  getMetadata: getDatasetMetadata,
};
