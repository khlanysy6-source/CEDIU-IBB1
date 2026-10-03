/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnterpriseRole } from './types';

export type InstitutionalModule =
  | 'initiatives'
  | 'assessments'
  | 'decisions'
  | 'reports'
  | 'studies'
  | 'supervision'
  | 'users';

export type InstitutionalAction = 'view' | 'create' | 'update' | 'approve' | 'delete';

export type AccessScopeRule =
  | 'ALL'                   // كافة المحافظات والمبادرات (القيادة العليا)
  | 'GOVERNORATE'           // محافظة محددة (المحافظ / ممثل الوحدة)
  | 'DISTRICT'              // مديرية واحدة أو مديريات مسندة
  | 'ASSIGNED_DISTRICTS'    // المديريات المكلف بها فقط
  | 'ASSIGNED_INITIATIVES'  // المبادرات المكلف بها فقط
  | 'ASSOCIATION'           // نطاق الجمعية والمديرية
  | 'PUBLIC'                // بيانات عامة وشفافية
  | 'NONE';                 // محظور

export interface PermissionRule {
  allowed: boolean;
  scope: AccessScopeRule;
  notes?: string;
}

export type RoleModulePermissions = Record<InstitutionalModule, Record<InstitutionalAction, PermissionRule>>;

/**
 * Institutional Permission Matrix for Central Emergency Development Interventions Unit
 */
export const INSTITUTIONAL_PERMISSION_MATRIX: Record<EnterpriseRole, RoleModulePermissions> = {
  SUPER_ADMIN: {
    initiatives: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: true, scope: 'ALL' } },
    assessments: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: true, scope: 'ALL' } },
    decisions: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: true, scope: 'ALL' } },
    reports: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: true, scope: 'ALL' } },
    studies: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: true, scope: 'ALL' } },
    supervision: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: true, scope: 'ALL' } },
    users: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: true, scope: 'ALL' } },
  },

  UNIT_HEAD: {
    initiatives: { view: { allowed: true, scope: 'ALL' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: false, scope: 'NONE' } },
    assessments: { view: { allowed: true, scope: 'ALL' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    decisions: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: false, scope: 'NONE' } },
    reports: { view: { allowed: true, scope: 'ALL' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: false, scope: 'NONE' } },
    studies: { view: { allowed: true, scope: 'ALL' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: false, scope: 'NONE' } },
    supervision: { view: { allowed: true, scope: 'ALL' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    users: { view: { allowed: true, scope: 'ALL' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
  },

  EXECUTIVE_MANAGER: {
    initiatives: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: false, scope: 'NONE' } },
    assessments: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: false, scope: 'NONE' } },
    decisions: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: false, scope: 'NONE' } },
    reports: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: false, scope: 'NONE' } },
    studies: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: false, scope: 'NONE' } },
    supervision: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: false, scope: 'NONE' } },
    users: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: false, scope: 'NONE' } },
  },

  UNIT_REPRESENTATIVE: {
    initiatives: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: true, scope: 'GOVERNORATE' }, update: { allowed: true, scope: 'GOVERNORATE' }, approve: { allowed: true, scope: 'GOVERNORATE' }, delete: { allowed: false, scope: 'NONE' } },
    assessments: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: true, scope: 'GOVERNORATE' }, update: { allowed: true, scope: 'GOVERNORATE' }, approve: { allowed: true, scope: 'GOVERNORATE' }, delete: { allowed: false, scope: 'NONE' } },
    decisions: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: true, scope: 'GOVERNORATE' }, update: { allowed: true, scope: 'GOVERNORATE' }, approve: { allowed: true, scope: 'GOVERNORATE' }, delete: { allowed: false, scope: 'NONE' } },
    reports: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: true, scope: 'GOVERNORATE' }, update: { allowed: true, scope: 'GOVERNORATE' }, approve: { allowed: true, scope: 'GOVERNORATE' }, delete: { allowed: false, scope: 'NONE' } },
    studies: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: true, scope: 'GOVERNORATE' }, update: { allowed: true, scope: 'GOVERNORATE' }, approve: { allowed: true, scope: 'GOVERNORATE' }, delete: { allowed: false, scope: 'NONE' } },
    supervision: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: true, scope: 'GOVERNORATE' }, update: { allowed: true, scope: 'GOVERNORATE' }, approve: { allowed: true, scope: 'GOVERNORATE' }, delete: { allowed: false, scope: 'NONE' } },
    users: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
  },

  SUPERVISION_MANAGER: {
    initiatives: { view: { allowed: true, scope: 'ALL' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    assessments: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: false, scope: 'NONE' } },
    decisions: { view: { allowed: true, scope: 'ALL' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    reports: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: false, scope: 'NONE' } },
    studies: { view: { allowed: true, scope: 'ALL' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    supervision: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: false, scope: 'NONE' } },
    users: { view: { allowed: true, scope: 'ALL' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
  },

  PROVINCIAL_SUPERVISION_MANAGER: {
    initiatives: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: true, scope: 'GOVERNORATE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    assessments: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: true, scope: 'GOVERNORATE' }, update: { allowed: true, scope: 'GOVERNORATE' }, approve: { allowed: true, scope: 'GOVERNORATE' }, delete: { allowed: false, scope: 'NONE' } },
    decisions: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    reports: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: true, scope: 'GOVERNORATE' }, update: { allowed: true, scope: 'GOVERNORATE' }, approve: { allowed: true, scope: 'GOVERNORATE' }, delete: { allowed: false, scope: 'NONE' } },
    studies: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    supervision: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: true, scope: 'GOVERNORATE' }, update: { allowed: true, scope: 'GOVERNORATE' }, approve: { allowed: true, scope: 'GOVERNORATE' }, delete: { allowed: false, scope: 'NONE' } },
    users: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
  },

  SUPERVISION_ENGINEER: {
    initiatives: { view: { allowed: true, scope: 'ASSIGNED_DISTRICTS' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: true, scope: 'ASSIGNED_DISTRICTS' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    assessments: { view: { allowed: true, scope: 'ASSIGNED_DISTRICTS' }, create: { allowed: true, scope: 'ASSIGNED_DISTRICTS' }, update: { allowed: true, scope: 'ASSIGNED_DISTRICTS' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    decisions: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    reports: { view: { allowed: true, scope: 'ASSIGNED_DISTRICTS' }, create: { allowed: true, scope: 'ASSIGNED_DISTRICTS' }, update: { allowed: true, scope: 'ASSIGNED_DISTRICTS' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    studies: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    supervision: { view: { allowed: true, scope: 'ASSIGNED_DISTRICTS' }, create: { allowed: true, scope: 'ASSIGNED_DISTRICTS' }, update: { allowed: true, scope: 'ASSIGNED_DISTRICTS' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    users: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
  },

  STUDIES_MANAGER: {
    initiatives: { view: { allowed: true, scope: 'ALL' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    assessments: { view: { allowed: true, scope: 'ALL' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    decisions: { view: { allowed: true, scope: 'ALL' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    reports: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: false, scope: 'NONE' } },
    studies: { view: { allowed: true, scope: 'ALL' }, create: { allowed: true, scope: 'ALL' }, update: { allowed: true, scope: 'ALL' }, approve: { allowed: true, scope: 'ALL' }, delete: { allowed: false, scope: 'NONE' } },
    supervision: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    users: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
  },

  PROVINCIAL_STUDIES_MANAGER: {
    initiatives: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: true, scope: 'GOVERNORATE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    assessments: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    decisions: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    reports: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: true, scope: 'GOVERNORATE' }, update: { allowed: true, scope: 'GOVERNORATE' }, approve: { allowed: true, scope: 'GOVERNORATE' }, delete: { allowed: false, scope: 'NONE' } },
    studies: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: true, scope: 'GOVERNORATE' }, update: { allowed: true, scope: 'GOVERNORATE' }, approve: { allowed: true, scope: 'GOVERNORATE' }, delete: { allowed: false, scope: 'NONE' } },
    supervision: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    users: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
  },

  STUDIES_ENGINEER: {
    initiatives: { view: { allowed: true, scope: 'ASSIGNED_INITIATIVES' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    assessments: { view: { allowed: true, scope: 'ASSIGNED_INITIATIVES' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    decisions: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    reports: { view: { allowed: true, scope: 'ASSIGNED_INITIATIVES' }, create: { allowed: true, scope: 'ASSIGNED_INITIATIVES' }, update: { allowed: true, scope: 'ASSIGNED_INITIATIVES' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    studies: { view: { allowed: true, scope: 'ASSIGNED_INITIATIVES' }, create: { allowed: true, scope: 'ASSIGNED_INITIATIVES' }, update: { allowed: true, scope: 'ASSIGNED_INITIATIVES' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    supervision: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    users: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
  },

  GOVERNOR: {
    initiatives: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: true, scope: 'GOVERNORATE' }, delete: { allowed: false, scope: 'NONE' } },
    assessments: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    decisions: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: true, scope: 'GOVERNORATE' }, update: { allowed: true, scope: 'GOVERNORATE' }, approve: { allowed: true, scope: 'GOVERNORATE' }, delete: { allowed: false, scope: 'NONE' } },
    reports: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    studies: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    supervision: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    users: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
  },

  GOVERNOR_VIEWER: {
    initiatives: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    assessments: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    decisions: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    reports: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    studies: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    supervision: { view: { allowed: true, scope: 'GOVERNORATE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    users: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
  },

  DISTRICT_MANAGER: {
    initiatives: { view: { allowed: true, scope: 'DISTRICT' }, create: { allowed: true, scope: 'DISTRICT' }, update: { allowed: true, scope: 'DISTRICT' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    assessments: { view: { allowed: true, scope: 'DISTRICT' }, create: { allowed: true, scope: 'DISTRICT' }, update: { allowed: true, scope: 'DISTRICT' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    decisions: { view: { allowed: true, scope: 'DISTRICT' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    reports: { view: { allowed: true, scope: 'DISTRICT' }, create: { allowed: true, scope: 'DISTRICT' }, update: { allowed: true, scope: 'DISTRICT' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    studies: { view: { allowed: true, scope: 'DISTRICT' }, create: { allowed: true, scope: 'DISTRICT' }, update: { allowed: true, scope: 'DISTRICT' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    supervision: { view: { allowed: true, scope: 'DISTRICT' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    users: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
  },

  COOPERATIVE_ADMIN: {
    initiatives: { view: { allowed: true, scope: 'ASSOCIATION' }, create: { allowed: true, scope: 'ASSOCIATION' }, update: { allowed: true, scope: 'ASSOCIATION' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    assessments: { view: { allowed: true, scope: 'ASSOCIATION' }, create: { allowed: true, scope: 'ASSOCIATION' }, update: { allowed: true, scope: 'ASSOCIATION' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    decisions: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    reports: { view: { allowed: true, scope: 'ASSOCIATION' }, create: { allowed: true, scope: 'ASSOCIATION' }, update: { allowed: true, scope: 'ASSOCIATION' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    studies: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    supervision: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    users: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
  },

  FIELD_ENGINEER: {
    initiatives: { view: { allowed: true, scope: 'ASSOCIATION' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: true, scope: 'ASSIGNED_INITIATIVES' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    assessments: { view: { allowed: true, scope: 'ASSOCIATION' }, create: { allowed: true, scope: 'ASSIGNED_INITIATIVES' }, update: { allowed: true, scope: 'ASSIGNED_INITIATIVES' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    decisions: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    reports: { view: { allowed: true, scope: 'ASSOCIATION' }, create: { allowed: true, scope: 'ASSIGNED_INITIATIVES' }, update: { allowed: true, scope: 'ASSIGNED_INITIATIVES' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    studies: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    supervision: { view: { allowed: true, scope: 'ASSOCIATION' }, create: { allowed: true, scope: 'ASSIGNED_INITIATIVES' }, update: { allowed: true, scope: 'ASSIGNED_INITIATIVES' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    users: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
  },

  VISITOR: {
    initiatives: { view: { allowed: true, scope: 'PUBLIC' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    assessments: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    decisions: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    reports: { view: { allowed: true, scope: 'PUBLIC' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    studies: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    supervision: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
    users: { view: { allowed: false, scope: 'NONE' }, create: { allowed: false, scope: 'NONE' }, update: { allowed: false, scope: 'NONE' }, approve: { allowed: false, scope: 'NONE' }, delete: { allowed: false, scope: 'NONE' } },
  },
};

export class InstitutionalPermissionMatrixService {
  /**
   * Check rule for a given role, module and action
   */
  static checkPermission(
    role: EnterpriseRole,
    module: InstitutionalModule,
    action: InstitutionalAction
  ): PermissionRule {
    const roleMap = INSTITUTIONAL_PERMISSION_MATRIX[role] || INSTITUTIONAL_PERMISSION_MATRIX.VISITOR;
    const moduleMap = roleMap[module];
    if (!moduleMap) {
      return { allowed: false, scope: 'NONE' };
    }
    return moduleMap[action] || { allowed: false, scope: 'NONE' };
  }
}
