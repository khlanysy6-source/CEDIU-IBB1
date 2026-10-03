/**
 * Schema and Provenance Types for Initiatives
 * Ibb Road Community Platform
 */

import { Initiative } from '../types';

export interface DataSourceTag {
  sheetName: string;
  rowNumber?: number;
  columnName?: string;
  sourceSheet?: string;
}

export interface FieldWithProvenance<T> {
  value: T;
  source?: string;
  dataSource?: DataSourceTag;
  provenanceNote?: string;
  verified?: boolean;
  [key: string]: any;
}

export interface InitiativeSchema {
  canonicalId: string;
  initiativeNumber: string;
  name: string;
  district: string;
  subDistrict?: string;
  village?: string;
  status: 'completed' | 'ongoing' | 'stagnant' | 'stopped' | 'pending';
  completionRate: number;
}
