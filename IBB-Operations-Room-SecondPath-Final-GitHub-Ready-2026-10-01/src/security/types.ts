/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole, RolePermissions, Initiative } from '../types';

export type { UserRole, RolePermissions };

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  customClaims?: Record<string, any>;
  governorate?: string;
  district?: string;
  associationName?: string;
  assignedDistricts?: string[];
  assignedInitiativeIds?: string[];
}

export type DataScopeType = 
  | 'all' 
  | 'central_unit' 
  | 'governorate' 
  | 'district' 
  | 'association' 
  | 'engineer' 
  | 'public';

export interface DataScope {
  type: DataScopeType;
  governorate?: string;
  district?: string;
  associationName?: string;
  assignedDistricts?: string[];
  assignedInitiativeIds?: string[];
}

export interface SecurityPermissions {
  canReadInitiative: boolean;
  canEditInitiative: boolean;
  canApproveInitiative: boolean;
  canAssignSupport: boolean;
  canClassifyInitiative: boolean;
  canApproveTransfer: boolean;
  canCloseInitiative: boolean;
  canViewExecutiveData: boolean;
  canViewFieldData: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
}

export interface AuthContextType {
  currentUser: AuthUser | null;
  authenticatedRole: UserRole;
  effectiveRole: UserRole;
  dataScope: DataScope;
  isDemoMode: boolean;
  demoRole: UserRole;
  setDemoRole: (role: UserRole) => void;
  setDemoMode: (enabled: boolean) => void;
  googleSignIn: () => Promise<{ user: any; accessToken: string } | null>;
  logout: () => Promise<void>;
  // Security resolvers
  canReadInitiative: (initiative?: Initiative) => boolean;
  canEditInitiative: (initiative?: Initiative) => boolean;
  canApproveInitiative: (initiative?: Initiative) => boolean;
  canAssignSupport: (initiative?: Initiative) => boolean;
  canClassifyInitiative: (initiative?: Initiative) => boolean;
  canApproveTransfer: (initiative?: Initiative) => boolean;
  canCloseInitiative: (initiative?: Initiative) => boolean;
  canViewExecutiveData: () => boolean;
  canViewFieldData: () => boolean;
  canViewReports: () => boolean;
  canManageSettings: () => boolean;
}
