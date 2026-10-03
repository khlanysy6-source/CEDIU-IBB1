/**
 * Canonical System User Accounts & User Profiles
 * Derived strictly from the Verified Officials Sheet & Institutional Registry (SSoT)
 * Zero Assumptions - Real Names, Official Titles, Real Phone Numbers & Scopes
 */

import { UserProfile, EnterpriseRole, OrganizationType } from '../core/auth/types';
import { UserRole, RolePermissions, ROLE_PERMISSIONS } from '../types';
import { getAllStoredOfficials, INITIAL_OFFICIALS, OfficialProfile } from './officialsRegistry';

export interface PredefinedAccount {
  id: string;
  email: string;
  phone?: string; // رقم الهاتف الجوال المعتمد للجهة أو المسئول
  passwordHash: string; // "Ebb2026@Pass"
  name: string;
  roleKey: EnterpriseRole;
  uiRole: UserRole;
  position: string; // المنصب والصفة الرسمية
  organization: string; // الجهة الرسمية
  organizationType: OrganizationType;
  governorate: string; // "محافظة إب"
  districtScope: string; // نطاق المسؤولية والاختصاص
  assignedDistricts: string[]; // المديريات المخصصة
  assignedInitiativeIds?: string[]; // المبادرات المخصصة
  avatarUrl: string;
}

const AVATAR_PALETTE = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80'
];

/**
 * Convert an OfficialProfile directly into an authentic PredefinedAccount
 * Retaining exact real name, exact official position/job title, phone, organization, and scope
 */
export function officialToPredefinedAccount(official: OfficialProfile, index: number = 0): PredefinedAccount {
  const cleanPhone = official.phone ? official.phone.replace(/[^0-9]/g, '') : '';
  const email = official.email && official.email.includes('@')
    ? official.email
    : (cleanPhone ? `${cleanPhone}@ebb.gov.ye` : `official_${official.id.replace(/[^a-zA-Z0-9]/g, '_')}@ebb.gov.ye`);

  let orgType: OrganizationType = 'CENTRAL_UNIT';
  let roleKey: EnterpriseRole = 'FIELD_ENGINEER';
  let uiRole: UserRole = 'engineer_inspector';

  const title = (official.jobTitle || '').toLowerCase();
  const org = (official.organization || '').toLowerCase();
  const roleStr = (official.role || '').toLowerCase();

  if (official.permissionLevel === 'admin' || official.id === 'off_008' || official.phone === '772730696' || official.email === 'eesaalqadri25@gmail.com') {
    orgType = 'CENTRAL_UNIT';
    roleKey = 'SUPER_ADMIN';
    uiRole = 'admin';
  } else if (title.includes('رئيس وحدة') || official.id === 'off_001') {
    orgType = 'CENTRAL_UNIT';
    roleKey = 'UNIT_HEAD';
    uiRole = 'central_unit';
  } else if (title.includes('تنفيذي') || official.id === 'off_002') {
    orgType = 'CENTRAL_UNIT';
    roleKey = 'EXECUTIVE_MANAGER';
    uiRole = 'central_unit';
  } else if (title.includes('ممثل وحدة') || official.id === 'off_003') {
    orgType = 'CENTRAL_UNIT';
    roleKey = 'UNIT_REPRESENTATIVE';
    uiRole = 'central_unit';
  } else if (title.includes('محافظ') || roleStr.includes('محلفظ') || official.id === 'off_004') {
    orgType = 'LOCAL_AUTHORITY';
    roleKey = 'GOVERNOR';
    uiRole = 'governorate';
  } else if (title.includes('مدير إدارة الاشراف') || title.includes('مدير إدارة الإشراف') || official.id === 'off_005') {
    orgType = 'SPECIALIZED_DEPT';
    roleKey = 'SUPERVISION_MANAGER';
    uiRole = 'central_unit';
  } else if (title.includes('دراسات') && (title.includes('مدير') || official.id === 'off_006')) {
    orgType = 'SPECIALIZED_DEPT';
    roleKey = 'STUDIES_MANAGER';
    uiRole = 'central_unit';
  } else if (title.includes('مساهمات عينية') || official.id === 'off_007') {
    orgType = 'SPECIALIZED_DEPT';
    roleKey = 'SUPERVISION_MANAGER';
    uiRole = 'central_unit';
  } else if (roleStr.includes('مدير المديرية') || title.includes('مدير مديرية')) {
    orgType = 'LOCAL_AUTHORITY';
    roleKey = 'DISTRICT_MANAGER';
    uiRole = 'district_director';
  } else if (roleStr.includes('جمعية') || title.includes('جمعية')) {
    orgType = 'COOPERATIVE_SOCIETY';
    roleKey = 'COOPERATIVE_ADMIN';
    uiRole = 'cooperative_association';
  } else if (roleStr.includes('مهندس') || title.includes('مختص المتابعة') || title.includes('مسؤول الدراسات') || official.permissionLevel === 'field') {
    orgType = 'FIELD_TEAMS';
    roleKey = 'FIELD_ENGINEER';
    uiRole = 'engineer_inspector';
  } else if (official.permissionLevel === 'executive') {
    orgType = 'LOCAL_AUTHORITY';
    roleKey = 'DISTRICT_MANAGER';
    uiRole = 'district_director';
  } else if (official.permissionLevel === 'supervisory') {
    orgType = 'SPECIALIZED_DEPT';
    roleKey = 'SUPERVISION_ENGINEER';
    uiRole = 'engineer_inspector';
  }

  const assignedDistricts = official.district
    ? official.district.split('،').map(d => d.trim()).filter(Boolean)
    : ['كامل المديريات'];

  return {
    id: official.id.startsWith('usr_') ? official.id : `usr_${official.id}`,
    email,
    phone: official.phone || '',
    passwordHash: 'Ebb2026@Pass',
    name: official.fullName,
    roleKey,
    uiRole,
    position: official.jobTitle || official.role || 'مسؤول مؤسسي معتمد',
    organization: official.organization || 'محافظة إب',
    organizationType: orgType,
    governorate: official.governorate || 'إب',
    districtScope: official.scope || official.district || 'إب',
    assignedDistricts,
    assignedInitiativeIds: official.assignedInitiativeIds || [],
    avatarUrl: AVATAR_PALETTE[index % AVATAR_PALETTE.length]
  };
}

/**
 * Baseline Canonical Predefined Accounts
 * Derived strictly from the official institutional registry (50 officials from sheet)
 */
export const PREDEFINED_ACCOUNTS: PredefinedAccount[] = INITIAL_OFFICIALS.map((off, idx) => officialToPredefinedAccount(off, idx));

const ACCOUNTS_STORAGE_KEY = 'canonical_user_accounts_v4';

/**
 * Returns user accounts strictly derived from the current officials sheet (SSoT)
 * Excludes any non-existing or fictitious accounts.
 */
export function getAllStoredAccounts(): PredefinedAccount[] {
  try {
    // 1. First priority: dynamically generate accounts directly from the active stored officials list (SSoT)
    const storedOfficials = getAllStoredOfficials();
    if (Array.isArray(storedOfficials) && storedOfficials.length > 0) {
      return storedOfficials.map((off, idx) => officialToPredefinedAccount(off, idx));
    }

    // 2. Fallback to localStorage accounts if available
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load stored user accounts:', e);
  }
  return PREDEFINED_ACCOUNTS;
}

export function saveStoredAccounts(accounts: PredefinedAccount[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    }
  } catch (e) {
    console.error('Failed to save user accounts:', e);
  }
}

export function saveSingleAccount(acc: PredefinedAccount): PredefinedAccount[] {
  const current = getAllStoredAccounts();
  const index = current.findIndex(a => a.id === acc.id || a.email.toLowerCase() === acc.email.toLowerCase());
  let updated: PredefinedAccount[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...acc };
  } else {
    updated = [...current, acc];
  }
  saveStoredAccounts(updated);
  return updated;
}

export function deleteStoredAccount(accId: string): PredefinedAccount[] {
  const current = getAllStoredAccounts();
  const updated = current.filter(a => a.id !== accId);
  saveStoredAccounts(updated);
  return updated;
}

export function resetStoredAccountsToDefault(): PredefinedAccount[] {
  saveStoredAccounts(PREDEFINED_ACCOUNTS);
  return PREDEFINED_ACCOUNTS;
}

export function findPredefinedAccount(identifier: string): PredefinedAccount | undefined {
  if (!identifier) return undefined;
  const clean = identifier.trim().toLowerCase();
  const cleanPhone = clean.replace(/[^0-9]/g, '');
  const accounts = getAllStoredAccounts();

  // Alias mappings for standard test shortcuts:
  const aliasMap: Record<string, string> = {
    'admin': 'eesaalqadri25@gmail.com',
    'super': 'eesaalqadri25@gmail.com',
    'eesa': 'eesaalqadri25@gmail.com',
    'kyan': 'kyanalqadry884@gmail.com',
    'unit.head': 'unit_head@ebb.gov.ye',
    'unit_head': 'unit_head@ebb.gov.ye',
    'executive.manager': 'exec_mgr@ebb.gov.ye',
    'exec.mgr': 'exec_mgr@ebb.gov.ye',
    'exec_mgr': 'exec_mgr@ebb.gov.ye',
    'unit.rep': 'unit_rep@ebb.gov.ye',
    'unit_rep': 'unit_rep@ebb.gov.ye',
    'supervision.manager': 'super_mgr@ebb.gov.ye',
    'super_mgr': 'super_mgr@ebb.gov.ye',
    'governor': 'governor@ebb.gov.ye',
    'district.manager': 'dhisufal_mgr@ebb.gov.ye',
    'district_mgr': 'dhisufal_mgr@ebb.gov.ye',
    'cooperative.admin': 'coop_dhisufal@ebb.gov.ye',
    'coop_admin': 'coop_dhisufal@ebb.gov.ye',
    'field.engineer': 'eng_dhisufal@ebb.gov.ye',
    'field_eng': 'eng_dhisufal@ebb.gov.ye'
  };

  const targetEmail = aliasMap[clean] || (clean.includes('@') ? clean : `${clean}@ebb.gov.ye`);

  return accounts.find(a => 
    a.email.toLowerCase() === clean || 
    a.email.toLowerCase() === targetEmail || 
    a.id.toLowerCase() === clean ||
    (cleanPhone && a.phone && a.phone.replace(/[^0-9]/g, '') === cleanPhone) ||
    a.name.toLowerCase().includes(clean)
  );
}

export function accountToUserProfile(acc: PredefinedAccount): UserProfile {
  const now = new Date().toISOString();
  return {
    uid: acc.id,
    email: acc.email,
    phone: acc.phone,
    name: acc.name,
    role: acc.roleKey,
    organizationType: acc.organizationType,
    organizationId: 'org_ebb_01',
    governorateId: 'IBB',
    districtIds: acc.assignedDistricts,
    assignedDistricts: acc.assignedDistricts,
    assignedInitiatives: acc.assignedInitiativeIds || [],
    permissions: Object.keys(ROLE_PERMISSIONS[acc.uiRole] || {}),
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: now,
    lastLogin: now,
    organization: acc.organization,
    position: acc.position,
    district: acc.districtScope,
    assignedInitiativeIds: acc.assignedInitiativeIds || []
  };
}

