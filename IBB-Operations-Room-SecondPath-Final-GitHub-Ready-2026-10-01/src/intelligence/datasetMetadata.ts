/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Initiative } from '../types';

export interface DatasetMetadata {
  datasetId: string;
  initiativeCount: number;
  source: string;
  version: string;
  lastUpdated: string;
  schemaVersion: string;
}

/**
 * Central Metadata Source for the Canonical Initiative Dataset.
 * Dynamically computes initiative count from actual dataset records.
 */
export function getDatasetMetadata(initiatives?: Initiative[]): DatasetMetadata {
  const actualCount = Array.isArray(initiatives) ? initiatives.length : 0;
  
  return {
    datasetId: 'ib_governorate_canonical_initiatives_v2',
    initiativeCount: actualCount,
    source: 'Google Sheets Unified Dataset & Governorate Field Registry',
    version: '2.0.0',
    lastUpdated: '2026-08-10',
    schemaVersion: '2.0'
  };
}

export const CANONICAL_DATASET_ID = 'ib_governorate_canonical_initiatives_v2';
