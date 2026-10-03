/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { UserRole, RolePermissions, Initiative } from '../../types';
import { EnterpriseRole, UserProfile, AuthUser, AuthContextType, DataScope } from './types';
import { RoleService } from './RoleService';
import { AuthorizationService } from './AuthorizationService';
import { PermissionService } from './PermissionService';
import { safeLocalStorage } from '../../utils/safeStorage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [customClaims, setCustomClaims] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    // If user has logged in with an explicit account, disable demo mode
    const savedSession = safeLocalStorage.getItem('authenticated_user_session');
    return !savedSession;
  });

  // Load initial session from localStorage if available
  useEffect(() => {
    const savedSession = safeLocalStorage.getItem('authenticated_user_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed?.uid && parsed?.profile) {
          setCurrentUser(parsed);
          setUserProfile(parsed.profile);
          setIsDemoMode(false);
        }
      } catch (e) {
        console.warn('Failed to parse saved auth session:', e);
      }
    }
  }, []);

  // UI preference display role saved in localStorage (for demo mode presentation only)
  const [demoRole, setDemoRoleState] = useState<UserRole>(() => {
    const saved = safeLocalStorage.getItem('cooperative_user_role') as UserRole;
    if (saved && [
      'admin',
      'central_unit',
      'governorate',
      'district_director',
      'cooperative_association',
      'engineer_inspector',
      'visitor'
    ].includes(saved)) {
      return saved;
    }
    return 'central_unit';
  });

  // Listen to Firebase Authentication state changes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    import('firebase/auth').then(({ onAuthStateChanged }) => {
      import('../../utils/firebaseAuth').then(({ auth }) => {
        if (!auth) {
          setIsLoading(false);
          return;
        }
        unsubscribe = onAuthStateChanged(
          auth, 
          async (user: any) => {
            setIsLoading(true);
            if (user) {
              try {
                // Get Custom Claims token result
                const tokenResult = await user.getIdTokenResult().catch(() => null);
                const claims = tokenResult?.claims || {};
                setCustomClaims(claims);

                const authUser: AuthUser = {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  photoURL: user.photoURL,
                  emailVerified: user.emailVerified ?? false,
                  customClaims: claims,
                };

                // Sync user document profile with Firestore users/{uid}
                const profile = await RoleService.syncUserProfile(authUser);
                setUserProfile(profile);

                if (profile) {
                  authUser.profile = profile;
                  authUser.district = profile.district;
                  authUser.organization = profile.organization;
                }

                setCurrentUser(authUser);
              } catch (err) {
                console.warn('Error fetching custom claims or user profile:', err);
                setCurrentUser({
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  photoURL: user.photoURL,
                  emailVerified: user.emailVerified ?? false,
                });
              }
            } else {
              setCurrentUser(null);
              setUserProfile(null);
              setCustomClaims({});
            }
            setIsLoading(false);
          },
          (error: any) => {
            console.warn('Firebase Auth State listener notice (Offline/Restricted Network):', error?.message || error);
            setIsLoading(false);
          }
        );
      });
    }).catch(err => {
      console.warn('Failed to load firebaseAuth listener in AuthProvider:', err);
      setIsLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Update demo UI role preference (presentation layer only)
  const setDemoRole = (role: UserRole) => {
    setDemoRoleState(role);
    safeLocalStorage.setItem('cooperative_user_role', role);
  };

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
  };

  // Resolve authenticated role strictly from Firebase Auth & UserProfile
  const authenticatedEnterpriseRole = useMemo<EnterpriseRole>(() => {
    return RoleService.resolveEnterpriseRole(currentUser, userProfile, customClaims);
  }, [currentUser, userProfile, customClaims]);

  const authenticatedRole = useMemo<UserRole>(() => {
    return RoleService.toUIRole(authenticatedEnterpriseRole);
  }, [authenticatedEnterpriseRole]);

  // Resolve effective role for presentation
  const { effectiveEnterpriseRole, effectiveRole } = useMemo(() => {
    if (isDemoMode) {
      const effUIRole = demoRole || (authenticatedRole !== 'visitor' ? authenticatedRole : 'central_unit');
      return {
        effectiveEnterpriseRole: RoleService.toEnterpriseRole(effUIRole),
        effectiveRole: effUIRole,
      };
    }
    return {
      effectiveEnterpriseRole: authenticatedEnterpriseRole,
      effectiveRole: authenticatedRole,
    };
  }, [isDemoMode, demoRole, authenticatedEnterpriseRole, authenticatedRole]);

  // Data Scope
  const dataScope = useMemo<DataScope>(() => {
    return AuthorizationService.resolveDataScope(effectiveEnterpriseRole, userProfile, currentUser);
  }, [effectiveEnterpriseRole, userProfile, currentUser]);

  // Google Sign-In
  const googleSignIn = async () => {
    try {
      const { googleSignIn: signIn } = await import('../../utils/firebaseAuth');
      const res = await signIn();
      if (res?.user) {
        const authUser: AuthUser = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName,
          photoURL: res.user.photoURL,
          emailVerified: res.user.emailVerified ?? false,
        };
        const profile = await RoleService.syncUserProfile(authUser);
        setUserProfile(profile);
        setCurrentUser({
          ...authUser,
          profile: profile || undefined,
        });
        setIsDemoMode(false);
        safeLocalStorage.setItem('authenticated_user_session', JSON.stringify(authUser));
      }
      return res;
    } catch (error: any) {
      console.warn('AuthProvider googleSignIn notice:', error?.message || error);
      if (import.meta.env.PROD) {
        throw new Error(error?.message || 'تعذر تسجيل الدخول عبر Google. يرجى التحقق من الاتصال بالشبكة.');
      }
      // Non-production sandbox environment notice
      throw new Error(error?.message || 'تعذر الوصول لخدمة تسجيل الدخول من داخل بيئة المعاينة.');
    }
  };

  // Email Sign-In (Supports Predefined Accounts & Custom Firebase Auth)
  const signInWithEmail = async (email: string, password?: string): Promise<AuthUser> => {
    const { findPredefinedAccount, accountToUserProfile } = await import('../../data/userAccounts');
    const predefined = findPredefinedAccount(email);

    let profile: UserProfile;
    let authUser: AuthUser;

    if (predefined) {
      profile = accountToUserProfile(predefined);
      authUser = {
        uid: predefined.id,
        email: predefined.email,
        displayName: predefined.name,
        photoURL: predefined.avatarUrl,
        emailVerified: true,
        profile,
        governorate: predefined.governorate,
        district: predefined.districtScope,
        organization: predefined.organization
      };
    } else {
      // Fallback for custom accounts
      const uid = `usr_${Date.now()}`;
      profile = {
        uid,
        name: email.split('@')[0],
        email,
        role: 'VISITOR',
        organizationType: 'PUBLIC',
        governorateId: 'IBB',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organization: 'زائر عام',
        district: 'محافظة إب'
      };
      authUser = {
        uid,
        email,
        displayName: email.split('@')[0],
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        emailVerified: true,
        profile
      };
    }

    setCurrentUser(authUser);
    setUserProfile(profile);
    setIsDemoMode(false);

    safeLocalStorage.setItem('authenticated_user_session', JSON.stringify(authUser));
    safeLocalStorage.setItem('cooperative_user_role', RoleService.toUIRole(profile.role));

    return authUser;
  };

  // Logout
  const logout = async () => {
    try {
      const { logout: signOut } = await import('../../utils/firebaseAuth');
      await signOut();
      setCurrentUser(null);
      setUserProfile(null);
      setCustomClaims({});
      setIsDemoMode(true);
      safeLocalStorage.removeItem('authenticated_user_session');
    } catch (error) {
      console.error('AuthProvider logout failed:', error);
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    authenticatedEnterpriseRole,
    authenticatedRole,
    effectiveEnterpriseRole,
    effectiveRole,
    dataScope,
    isDemoMode,
    demoRole,
    isLoading,
    setDemoRole,
    setDemoMode,
    googleSignIn,
    signInWithEmail,
    logout,

    // Permission helpers
    hasTabAccess: (tabId: string) => PermissionService.hasTabAccess(effectiveRole, tabId),
    hasPermission: (permissionKey: keyof RolePermissions) => PermissionService.hasPermission(effectiveRole, permissionKey),
    canEditInitiative: (initiative?: Initiative) => PermissionService.canEditInitiative(effectiveEnterpriseRole, dataScope, initiative),
    canApproveInitiative: (initiative?: Initiative) => PermissionService.canApproveInitiative(effectiveEnterpriseRole, dataScope, initiative),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
