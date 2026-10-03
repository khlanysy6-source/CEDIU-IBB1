/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole } from '../../types';
import { EnterpriseRole, UserProfile, AuthUser, OrganizationType } from './types';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebaseAuth';
import { isBootstrapAdminEmail } from '../../security/adminBootstrap';

export const ENTERPRISE_ROLES: EnterpriseRole[] = [
  'SUPER_ADMIN',
  'UNIT_HEAD',
  'EXECUTIVE_MANAGER',
  'UNIT_REPRESENTATIVE',
  'SUPERVISION_MANAGER',
  'PROVINCIAL_SUPERVISION_MANAGER',
  'SUPERVISION_ENGINEER',
  'STUDIES_MANAGER',
  'PROVINCIAL_STUDIES_MANAGER',
  'STUDIES_ENGINEER',
  'GOVERNOR',
  'GOVERNOR_VIEWER',
  'DISTRICT_MANAGER',
  'COOPERATIVE_ADMIN',
  'FIELD_ENGINEER',
  'VISITOR',
];

/**
 * Mapping between Enterprise roles and UI UserRole for presentation
 */
export const ENTERPRISE_TO_UI_ROLE_MAP: Record<EnterpriseRole, UserRole> = {
  SUPER_ADMIN: 'admin',
  UNIT_HEAD: 'central_unit',
  EXECUTIVE_MANAGER: 'central_unit',
  UNIT_REPRESENTATIVE: 'central_unit',
  SUPERVISION_MANAGER: 'central_unit',
  PROVINCIAL_SUPERVISION_MANAGER: 'governorate',
  SUPERVISION_ENGINEER: 'engineer_inspector',
  STUDIES_MANAGER: 'central_unit',
  PROVINCIAL_STUDIES_MANAGER: 'governorate',
  STUDIES_ENGINEER: 'engineer_inspector',
  GOVERNOR: 'governorate',
  GOVERNOR_VIEWER: 'governorate',
  DISTRICT_MANAGER: 'district_director',
  COOPERATIVE_ADMIN: 'cooperative_association',
  FIELD_ENGINEER: 'engineer_inspector',
  VISITOR: 'visitor',
};

export const UI_TO_ENTERPRISE_ROLE_MAP: Record<UserRole, EnterpriseRole> = {
  admin: 'SUPER_ADMIN',
  central_unit: 'EXECUTIVE_MANAGER',
  governorate: 'GOVERNOR',
  district_director: 'DISTRICT_MANAGER',
  cooperative_association: 'COOPERATIVE_ADMIN',
  engineer_inspector: 'FIELD_ENGINEER',
  visitor: 'VISITOR',
};

export class RoleService {
  /**
   * Convert Enterprise Role to UI Role
   */
  static toUIRole(eRole: EnterpriseRole | string): UserRole {
    if (eRole in ENTERPRISE_TO_UI_ROLE_MAP) {
      return ENTERPRISE_TO_UI_ROLE_MAP[eRole as EnterpriseRole];
    }
    if (['admin', 'central_unit', 'governorate', 'district_director', 'cooperative_association', 'engineer_inspector', 'visitor'].includes(eRole)) {
      return eRole as UserRole;
    }
    return 'visitor';
  }

  /**
   * Convert UI Role to Enterprise Role
   */
  static toEnterpriseRole(uiRole: UserRole | string): EnterpriseRole {
    if (uiRole in UI_TO_ENTERPRISE_ROLE_MAP) {
      return UI_TO_ENTERPRISE_ROLE_MAP[uiRole as UserRole];
    }
    if (ENTERPRISE_ROLES.includes(uiRole as EnterpriseRole)) {
      return uiRole as EnterpriseRole;
    }
    return 'VISITOR';
  }

  /**
   * Resolve default OrganizationType for an EnterpriseRole
   */
  static getDefaultOrgType(role: EnterpriseRole): OrganizationType {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'UNIT_HEAD':
      case 'EXECUTIVE_MANAGER':
      case 'UNIT_REPRESENTATIVE':
        return 'CENTRAL_UNIT';
      case 'SUPERVISION_MANAGER':
      case 'PROVINCIAL_SUPERVISION_MANAGER':
      case 'SUPERVISION_ENGINEER':
      case 'STUDIES_MANAGER':
      case 'PROVINCIAL_STUDIES_MANAGER':
      case 'STUDIES_ENGINEER':
        return 'SPECIALIZED_DEPT';
      case 'GOVERNOR':
      case 'GOVERNOR_VIEWER':
      case 'DISTRICT_MANAGER':
        return 'LOCAL_AUTHORITY';
      case 'COOPERATIVE_ADMIN':
        return 'COOPERATIVE_SOCIETY';
      case 'FIELD_ENGINEER':
        return 'FIELD_TEAMS';
      case 'VISITOR':
      default:
        return 'PUBLIC';
    }
  }

  /**
   * Resolves official Enterprise Role for a given user.
   */
  static resolveEnterpriseRole(
    user: AuthUser | null,
    profile?: UserProfile | null,
    customClaims?: Record<string, any>
  ): EnterpriseRole {
    if (!user) return 'VISITOR';

    // 1. Firebase Custom Claims
    if (customClaims?.role) {
      const claimRole = this.toEnterpriseRole(customClaims.role);
      if (claimRole !== 'VISITOR' || customClaims.role === 'VISITOR') {
        return claimRole;
      }
    }

    // 2. User Profile from Firestore
    if (profile?.role) {
      const profileRole = this.toEnterpriseRole(profile.role);
      if (profileRole !== 'VISITOR' || profile.role === 'VISITOR') {
        return profileRole;
      }
    }

    // 3. Bootstrap Admin Check
    if (user.email && isBootstrapAdminEmail(user.email)) {
      return 'SUPER_ADMIN';
    }

    return 'VISITOR';
  }

  /**
   * Syncs / Fetches user profile from Firestore `users/{uid}` collection.
   */
  static async syncUserProfile(user: AuthUser): Promise<UserProfile | null> {
    if (!db || !user?.uid) return null;

    const userDocRef = doc(db, 'users', user.uid);
    try {
      const docSnap = await getDoc(userDocRef);
      const now = new Date().toISOString();

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        await updateDoc(userDocRef, { lastLogin: now, updatedAt: now }).catch(() => {});
        return {
          ...data,
          lastLogin: now,
          updatedAt: now,
        };
      } else {
        let initialRole: EnterpriseRole = 'VISITOR';
        if (user.email && isBootstrapAdminEmail(user.email)) {
          initialRole = 'SUPER_ADMIN';
        }

        const orgType = this.getDefaultOrgType(initialRole);

        const newProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'مستخدم جديد',
          email: user.email || '',
          role: initialRole,
          organizationType: orgType,
          organizationId: 'org_001',
          governorateId: 'IBB',
          districtIds: ['district_001'],
          assignedDistricts: ['مديرية ذي السفال'],
          assignedInitiatives: [],
          permissions: [],
          status: 'active',
          createdAt: now,
          updatedAt: now,
          lastLogin: now,
          // Legacy aliases
          organization: 'وحدة التدخلات التنموية المركزية',
          district: 'محافظة إب',
          assignedInitiativeIds: [],
        };

        await setDoc(userDocRef, newProfile).catch((e) => {
          console.warn('Could not write new user profile to Firestore:', e);
        });

        return newProfile;
      }
    } catch (error) {
      console.warn('Error fetching user profile from Firestore:', error);
      return null;
    }
  }
}
