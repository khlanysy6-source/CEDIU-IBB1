/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole, RolePermissions, Initiative } from '../../types';

export type OrganizationType =
  | 'CENTRAL_UNIT'         // وحدة التدخلات المركزية التنموية الطارئة
  | 'SPECIALIZED_DEPT'     // الإدارات التخصصية (إشراف / دراسات)
  | 'LOCAL_AUTHORITY'      // السلطة المحلية (المحافظة / المديرية)
  | 'COOPERATIVE_SOCIETY'  // الجمعيات التعاونية
  | 'FIELD_TEAMS'          // فرسان الهندسة / الفرق الميدانية
  | 'PUBLIC';              // العامة والزوار

export type EnterpriseRole =
  // القيادة العليا لوحدة التدخلات
  | 'UNIT_HEAD'                      // رئيس الوحدة
  | 'EXECUTIVE_MANAGER'              // المدير التنفيذي للوحدة
  | 'UNIT_REPRESENTATIVE'            // ممثل الوحدة بالمحافظة (مدير فرع الوحدة بالمحافظة)
  // إدارة الإشراف
  | 'SUPERVISION_MANAGER'            // مدير الإشراف
  | 'PROVINCIAL_SUPERVISION_MANAGER' // مدير الإشراف بالمحافظة
  | 'SUPERVISION_ENGINEER'           // مهندس إشراف
  // إدارة الدراسات
  | 'STUDIES_MANAGER'                // مدير الدراسات
  | 'PROVINCIAL_STUDIES_MANAGER'     // مدير الدراسات بالمحافظة
  | 'STUDIES_ENGINEER'               // مهندس دراسات
  // الجهات المحلية والشركاء
  | 'GOVERNOR'                       // المحافظ
  | 'GOVERNOR_VIEWER'                // المحافظ (موازي)
  | 'DISTRICT_MANAGER'               // مدير المديرية
  | 'COOPERATIVE_ADMIN'              // الجمعية التعاونية
  | 'FIELD_ENGINEER'                 // فرسان الهندسة (ضمن الجمعية والمديرية)
  | 'VISITOR'                        // الزائر
  | 'SUPER_ADMIN';                   // مدير النظام الأعلى

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: EnterpriseRole;
  organizationType?: OrganizationType;
  organizationId?: string;
  governorateId?: string;           // e.g. 'IBB' or 'محافظة إب'
  districtIds?: string[];            // e.g. ['district001'] or ['مديرية ذي السفال']
  assignedDistricts?: string[];      // e.g. ['مديرية ذي السفال', 'مديرية جبلة']
  assignedInitiatives?: string[];    // e.g. ['init-101', 'init-102']
  permissions?: string[];
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  // Legacy optional compatibility fields
  organization?: string;
  position?: string;
  district?: string;
  assignedInitiativeIds?: string[];
}

export interface AuthUser {
  uid: string;
  email: string | null;
  phone?: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  profile?: UserProfile | null;
  customClaims?: CustomClaims;
  governorateId?: string;
  districtIds?: string[];
  governorate?: string;
  district?: string;
  organization?: string;
}

export interface CustomClaims {
  role: EnterpriseRole;
  organizationType?: OrganizationType;
  governorateId?: string;
  districtIds?: string[];
  [key: string]: any;
}

export interface DataScope {
  type:
    | 'all'
    | 'central_unit'
    | 'governorate'
    | 'district'
    | 'association'
    | 'engineer'
    | 'public';
  governorateId?: string;
  governorate?: string;
  districtIds?: string[];
  district?: string;
  organizationType?: OrganizationType;
  organizationId?: string;
  organization?: string;
  assignedDistricts?: string[];
  assignedInitiativeIds?: string[];
  assignedInitiatives?: string[];
}

export interface AuthContextType {
  currentUser: AuthUser | null;
  userProfile: UserProfile | null;
  authenticatedEnterpriseRole: EnterpriseRole;
  authenticatedRole: UserRole;
  effectiveEnterpriseRole: EnterpriseRole;
  effectiveRole: UserRole;
  dataScope: DataScope;
  isDemoMode: boolean;
  demoRole: UserRole;
  isLoading: boolean;
  setDemoRole: (role: UserRole) => void;
  setDemoMode: (enabled: boolean) => void;
  googleSignIn: () => Promise<any>;
  signInWithEmail: (email: string, password?: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  hasTabAccess: (tabId: string) => boolean;
  hasPermission: (permissionKey: keyof RolePermissions) => boolean;
  canEditInitiative: (initiative?: Initiative) => boolean;
  canApproveInitiative: (initiative?: Initiative) => boolean;
}
