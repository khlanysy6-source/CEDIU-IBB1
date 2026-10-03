/**
 * Permission Service for Core Authentication Layer
 * Combines role-based tab access, capability checking, and resource data scoping.
 */

import { UserRole, RolePermissions, ROLE_PERMISSIONS, Initiative } from '../../types';
import { DataScope } from './types';
import { TabId, hasTabAccess, ROLE_TAB_ACCESS } from '../../permissions';
import { PermissionService as SecurityPermissionService } from '../../security/permissionService';

export class PermissionService {
  /**
   * Check if role has access to specific navigation tab
   */
  static hasTabAccess(role: UserRole | string, tabId: string, roleConfig?: Record<string, TabId[]>): boolean {
    return hasTabAccess(role as UserRole, tabId as TabId, roleConfig || ROLE_TAB_ACCESS);
  }

  /**
   * Check if role has specific capability permission
   */
  static hasPermission(role: UserRole | string, permissionKey: keyof RolePermissions): boolean {
    const permissions = ROLE_PERMISSIONS[role as UserRole] || ROLE_PERMISSIONS.visitor;
    return !!permissions[permissionKey];
  }

  /**
   * Can user edit a specific initiative?
   */
  static canEditInitiative(role: any, scope: DataScope, initiative?: Initiative): boolean {
    return SecurityPermissionService.canEditInitiative(role, scope as any, initiative);
  }

  /**
   * Can user approve an initiative?
   */
  static canApproveInitiative(role: any, scope: DataScope, initiative?: Initiative): boolean {
    return SecurityPermissionService.canApproveInitiative(role, scope as any, initiative);
  }

  /**
   * Can user assign support?
   */
  static canAssignSupport(role: any, scope: DataScope, initiative?: Initiative): boolean {
    return SecurityPermissionService.canAssignSupport(role, scope as any, initiative);
  }

  /**
   * Can user classify initiative?
   */
  static canClassifyInitiative(role: any, scope: DataScope, initiative?: Initiative): boolean {
    return SecurityPermissionService.canClassifyInitiative(role, scope as any, initiative);
  }

  /**
   * Can user view executive data?
   */
  static canViewExecutiveData(role: UserRole): boolean {
    return SecurityPermissionService.canViewExecutiveData(role);
  }

  /**
   * Can user view field data?
   */
  static canViewFieldData(role: UserRole): boolean {
    return SecurityPermissionService.canViewFieldData(role);
  }

  /**
   * Can user view reports?
   */
  static canViewReports(role: UserRole): boolean {
    return SecurityPermissionService.canViewReports(role);
  }

  /**
   * Can user manage settings?
   */
  static canManageSettings(role: UserRole): boolean {
    return SecurityPermissionService.canManageSettings(role);
  }
}
