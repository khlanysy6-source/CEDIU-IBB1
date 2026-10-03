/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Initiative, UserRole, ROLE_PERMISSIONS } from '../types';
import { DataScope, SecurityPermissions } from './types';
import { isInitiativeInScope } from './dataScopeResolver';

/**
 * Central Permission Resolver Service
 * Evaluates functional capabilities by combining UserRole, DataScope, and Target Resource.
 */
export class PermissionService {
  /**
   * Resolves top-level security permissions for a role
   */
  static getRolePermissions(role: UserRole): SecurityPermissions {
    const base = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.visitor;

    return {
      canReadInitiative: true, // All roles can read public/scoped initiatives
      canEditInitiative: role === 'admin' || role === 'central_unit' || role === 'cooperative_association' || role === 'engineer_inspector' || role === 'district_director',
      canApproveInitiative: !!base.canApproveInitiative,
      canAssignSupport: !!base.canAllocateSupport,
      canClassifyInitiative: !!base.canClassifyStatus,
      canApproveTransfer: !!base.canApproveTransfers,
      canCloseInitiative: !!base.canCloseInitiative,
      canViewExecutiveData: !!base.canViewExecutiveReports,
      canViewFieldData: !!base.canSubmitEngineerReport || !!base.canDocumentContributions,
      canViewReports: !!base.canViewExecutiveReports,
      canManageSettings: !!base.canEditSettings,
    };
  }

  /**
   * Can user read a specific initiative?
   */
  static canReadInitiative(role: UserRole, scope: DataScope, initiative?: Initiative): boolean {
    if (!initiative) return true;
    return isInitiativeInScope(initiative, scope);
  }

  /**
   * Can user edit a specific initiative?
   */
  static canEditInitiative(role: UserRole, scope: DataScope, initiative?: Initiative): boolean {
    if (role === 'visitor') return false;
    if (role === 'admin' || role === 'central_unit') return true;
    
    const perms = this.getRolePermissions(role);
    if (!perms.canEditInitiative) return false;

    if (initiative) {
      return isInitiativeInScope(initiative, scope);
    }
    return true;
  }

  /**
   * Can user approve an initiative?
   */
  static canApproveInitiative(role: UserRole, scope: DataScope, initiative?: Initiative): boolean {
    const base = this.getRolePermissions(role);
    if (!base.canApproveInitiative) return false;
    if (initiative) return isInitiativeInScope(initiative, scope);
    return true;
  }

  /**
   * Can user assign/allocate cement and diesel support?
   */
  static canAssignSupport(role: UserRole, scope: DataScope, initiative?: Initiative): boolean {
    const base = this.getRolePermissions(role);
    if (!base.canAssignSupport) return false;
    if (initiative) return isInitiativeInScope(initiative, scope);
    return true;
  }

  /**
   * Can user classify initiative lifecycle stage and decision category?
   */
  static canClassifyInitiative(role: UserRole, scope: DataScope, initiative?: Initiative): boolean {
    const base = this.getRolePermissions(role);
    if (!base.canClassifyInitiative) return false;
    if (initiative) return isInitiativeInScope(initiative, scope);
    return true;
  }

  /**
   * Can user approve cement/diesel transfers between initiatives?
   */
  static canApproveTransfer(role: UserRole, scope: DataScope, initiative?: Initiative): boolean {
    const base = this.getRolePermissions(role);
    if (!base.canApproveTransfer) return false;
    if (initiative) return isInitiativeInScope(initiative, scope);
    return true;
  }

  /**
   * Can user close an initiative upon full completion and documentation?
   */
  static canCloseInitiative(role: UserRole, scope: DataScope, initiative?: Initiative): boolean {
    const base = this.getRolePermissions(role);
    if (!base.canCloseInitiative) return false;
    if (initiative) return isInitiativeInScope(initiative, scope);
    return true;
  }

  /**
   * Can user view executive data and dashboards?
   */
  static canViewExecutiveData(role: UserRole): boolean {
    return this.getRolePermissions(role).canViewExecutiveData;
  }

  /**
   * Can user view field assessment data and submissions?
   */
  static canViewFieldData(role: UserRole): boolean {
    return this.getRolePermissions(role).canViewFieldData;
  }

  /**
   * Can user view periodic reports?
   */
  static canViewReports(role: UserRole): boolean {
    return this.getRolePermissions(role).canViewReports;
  }

  /**
   * Can user manage system settings and configuration?
   */
  static canManageSettings(role: UserRole): boolean {
    return this.getRolePermissions(role).canManageSettings;
  }
}
