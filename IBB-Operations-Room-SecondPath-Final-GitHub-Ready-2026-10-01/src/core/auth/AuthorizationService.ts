/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnterpriseRole, UserProfile, DataScope, AuthUser } from './types';
import { UserRole, Initiative } from '../../types';
import { RoleService } from './RoleService';

export class AuthorizationService {
  /**
   * Resolves the Data Scope (Geographic, Organizational & Operational Scope) for an Enterprise user
   */
  static resolveDataScope(
    role: EnterpriseRole | UserRole,
    userProfile?: UserProfile | null,
    authUser?: AuthUser | null
  ): DataScope {
    const eRole = RoleService.toEnterpriseRole(role);

    const govId = userProfile?.governorateId || authUser?.governorateId || 'IBB';
    const govName = userProfile?.district || authUser?.governorate || 'محافظة إب';
    const distIds = userProfile?.districtIds || authUser?.districtIds || ['district_001'];
    const distName = userProfile?.district || authUser?.district || 'مديرية ذي السفال';
    const assignedDistricts = userProfile?.assignedDistricts || (distName ? [distName] : []);
    const assignedInits = userProfile?.assignedInitiatives || userProfile?.assignedInitiativeIds || [];

    switch (eRole) {
      case 'SUPER_ADMIN':
      case 'UNIT_HEAD':
      case 'EXECUTIVE_MANAGER':
      case 'SUPERVISION_MANAGER':
      case 'STUDIES_MANAGER':
        return {
          type: 'all',
          governorateId: 'ALL',
          governorate: 'كافة المحافظات',
          organizationType: 'CENTRAL_UNIT',
        };

      case 'UNIT_REPRESENTATIVE':
      case 'PROVINCIAL_SUPERVISION_MANAGER':
      case 'PROVINCIAL_STUDIES_MANAGER':
      case 'GOVERNOR':
      case 'GOVERNOR_VIEWER':
        return {
          type: 'governorate',
          governorateId: govId,
          governorate: govName,
          organizationType: eRole === 'GOVERNOR' || eRole === 'GOVERNOR_VIEWER' ? 'LOCAL_AUTHORITY' : 'CENTRAL_UNIT',
        };

      case 'DISTRICT_MANAGER':
        return {
          type: 'district',
          governorateId: govId,
          governorate: govName,
          districtIds: distIds,
          district: distName,
          organizationType: 'LOCAL_AUTHORITY',
        };

      case 'COOPERATIVE_ADMIN':
        return {
          type: 'association',
          governorateId: govId,
          governorate: govName,
          districtIds: distIds,
          district: distName,
          organizationType: 'COOPERATIVE_SOCIETY',
          organizationId: userProfile?.organizationId,
          organization: userProfile?.organization || 'الجمعية التعاونية',
        };

      case 'SUPERVISION_ENGINEER':
      case 'STUDIES_ENGINEER':
      case 'FIELD_ENGINEER':
        return {
          type: 'engineer',
          governorateId: govId,
          governorate: govName,
          districtIds: distIds,
          district: distName,
          organizationType: eRole === 'FIELD_ENGINEER' ? 'FIELD_TEAMS' : 'SPECIALIZED_DEPT',
          assignedDistricts: assignedDistricts,
          assignedInitiativeIds: assignedInits,
          assignedInitiatives: assignedInits,
        };

      case 'VISITOR':
      default:
        return {
          type: 'public',
          organizationType: 'PUBLIC',
        };
    }
  }

  /**
   * Checks if an initiative falls within the given DataScope
   */
  static isInitiativeInScope(initiative: Initiative, scope: DataScope): boolean {
    if (scope.type === 'all') return true;
    if (scope.type === 'public') return true; // Public view for transparency portal

    // Governorate scope check
    if (scope.governorateId && scope.governorateId !== 'ALL') {
      const initGov = initiative.governorate || 'محافظة إب';
      if (scope.governorate && initGov && !initGov.includes(scope.governorate) && !scope.governorate.includes(initGov)) {
        return false;
      }
    }

    // District scope check
    if (scope.type === 'district' && scope.district && initiative.district) {
      const match = initiative.district.includes(scope.district) || scope.district.includes(initiative.district);
      if (!match) return false;
    }

    // Association scope check
    if (scope.type === 'association') {
      if (scope.district && initiative.district) {
        const match = initiative.district.includes(scope.district) || scope.district.includes(initiative.district);
        if (!match) return false;
      }
    }

    // Engineer assigned scope check
    if (scope.type === 'engineer') {
      // If assigned specifically to certain initiative IDs
      if (scope.assignedInitiativeIds && scope.assignedInitiativeIds.length > 0) {
        if (!scope.assignedInitiativeIds.includes(initiative.id)) {
          return false;
        }
      }
      // Or assigned to specific districts
      else if (scope.assignedDistricts && scope.assignedDistricts.length > 0 && initiative.district) {
        const inAssignedDist = scope.assignedDistricts.some(
          d => initiative.district.includes(d) || d.includes(initiative.district)
        );
        if (!inAssignedDist) return false;
      }
    }

    return true;
  }
}
