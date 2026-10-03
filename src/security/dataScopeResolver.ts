/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Initiative, UserRole } from '../types';
import { AuthUser, DataScope } from './types';

/**
 * Normalizes district names for robust comparison
 */
function normalizeDistrictName(district: string | undefined): string {
  if (!district) return '';
  let clean = district.trim().replace(/^مديرية\s+/, '');
  if (
    clean.includes('ريف اب') || 
    clean.includes('ريف إب')
  ) {
    return 'ريف إب';
  }
  return clean;
}

/**
 * Resolves the DataScope for a role and optional user context
 */
export function resolveDataScope(
  role: UserRole,
  user?: AuthUser | null,
  meta?: {
    governorate?: string;
    district?: string;
    associationName?: string;
    assignedDistricts?: string[];
    assignedInitiativeIds?: string[];
  }
): DataScope {
  switch (role) {
    case 'admin':
      return { type: 'all' };

    case 'central_unit':
      return {
        type: 'central_unit',
        governorate: meta?.governorate || user?.governorate || 'إب'
      };

    case 'governorate':
      return {
        type: 'governorate',
        governorate: meta?.governorate || user?.governorate || 'إب'
      };

    case 'district_director':
      return {
        type: 'district',
        governorate: meta?.governorate || user?.governorate || 'إب',
        district: meta?.district || user?.district || 'مديرية ذي السفال'
      };

    case 'cooperative_association':
      return {
        type: 'association',
        governorate: meta?.governorate || user?.governorate || 'إب',
        district: meta?.district || user?.district,
        associationName: meta?.associationName || user?.associationName
      };

    case 'engineer_inspector':
      return {
        type: 'engineer',
        assignedDistricts: meta?.assignedDistricts || user?.assignedDistricts || [],
        assignedInitiativeIds: meta?.assignedInitiativeIds || user?.assignedInitiativeIds || []
      };

    case 'visitor':
    default:
      return { type: 'public' };
  }
}

/**
 * Checks if a specific initiative falls within the given DataScope
 */
export function isInitiativeInScope(initiative: Initiative, scope: DataScope): boolean {
  if (!initiative) return false;

  switch (scope.type) {
    case 'all':
      return true;

    case 'central_unit':
      // Central Unit oversees all initiatives in their assigned governorate (or all if none specified)
      if (!scope.governorate) return true;
      return !initiative.governorate || initiative.governorate.includes(scope.governorate) || scope.governorate.includes(initiative.governorate);

    case 'governorate':
      if (!scope.governorate) return true;
      return !initiative.governorate || initiative.governorate.includes(scope.governorate) || scope.governorate.includes(initiative.governorate);

    case 'district':
      if (!scope.district) return true;
      const targetDistClean = normalizeDistrictName(scope.district);
      const initDistClean = normalizeDistrictName(initiative.district);
      return initDistClean === targetDistClean || initiative.district?.includes(targetDistClean) || scope.district.includes(initiative.district);

    case 'association':
      if (scope.district) {
        const targetDistClean = normalizeDistrictName(scope.district);
        const initDistClean = normalizeDistrictName(initiative.district);
        if (initDistClean !== targetDistClean && !initiative.district?.includes(targetDistClean)) {
          return false;
        }
      }
      return true;

    case 'engineer':
      // If specific assigned initiative IDs exist, check ID match
      if (scope.assignedInitiativeIds && scope.assignedInitiativeIds.length > 0) {
        if (scope.assignedInitiativeIds.includes(initiative.id)) {
          return true;
        }
      }
      // If assigned districts exist, check district match
      if (scope.assignedDistricts && scope.assignedDistricts.length > 0) {
        const initDistClean = normalizeDistrictName(initiative.district);
        const matchesDistrict = scope.assignedDistricts.some(d => normalizeDistrictName(d) === initDistClean);
        if (matchesDistrict) return true;
      }
      // If no explicit restrictions assigned, engineers can inspect field initiatives
      return true;

    case 'public':
    default:
      // Visitors can read all public initiatives (read-only)
      return true;
  }
}

/**
 * Filters an array of initiatives based on DataScope
 */
export function filterInitiativesByScope(initiatives: Initiative[], scope: DataScope): Initiative[] {
  if (!Array.isArray(initiatives)) return [];
  if (scope.type === 'all') return initiatives;
  return initiatives.filter(init => isInitiativeInScope(init, scope));
}
