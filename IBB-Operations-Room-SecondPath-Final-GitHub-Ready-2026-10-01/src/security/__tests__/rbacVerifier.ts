/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole } from '../../types';
import { AuthUser } from '../types';
import { resolveAuthenticatedRole, resolveUserRole } from '../roleResolver';
import { resolveDataScope, isInitiativeInScope } from '../dataScopeResolver';
import { PermissionService } from '../permissionService';

export interface RBACTestResult {
  testName: string;
  passed: boolean;
  details: string;
}

export function runRBACVerificationTests(): { allPassed: boolean; results: RBACTestResult[] } {
  const results: RBACTestResult[] = [];

  // Mock initiative in District Dhi As Sufal
  const sampleInitiativeDhiSufal = {
    id: '726',
    initiativeNumber: '726',
    name: 'رصف طريق الجفيين بشوائط بذي السفال',
    district: 'مديرية ذي السفال',
    governorate: 'محافظة إب',
    sector: 'الطرق',
    subDistrict: 'شوائط',
    village: 'الجفيين',
    coordinates: '13.84, 44.02',
    startDate: '2025-01-01',
    endDate: '2025-06-01',
    cost: 25000000,
    communityContribution: 15000000,
    unitContribution: 10000000,
    completionRate: 85,
    status: 'ongoing' as const,
    ownerConfirmed: true,
    pathways: [],
    contributions: [],
    materials: [],
    committee: [],
    reports: [],
    createdAt: new Date().toISOString()
  };

  const sampleInitiativeSayyani = {
    ...sampleInitiativeDhiSufal,
    id: '727',
    district: 'مديرية السياني',
    name: 'شق طريق بلاد المليكي بالسياني'
  };

  // 1. Visitor Test: Cannot access administrative actions
  const visitorRole: UserRole = 'visitor';
  const visitorPerms = PermissionService.getRolePermissions(visitorRole);
  const visitorPassed = 
    !visitorPerms.canApproveInitiative &&
    !visitorPerms.canAssignSupport &&
    !visitorPerms.canClassifyInitiative &&
    !visitorPerms.canManageSettings;
  
  results.push({
    testName: 'Visitor: No Admin or Executive Permissions',
    passed: visitorPassed,
    details: 'Verified Visitor role cannot approve initiatives, allocate support, or edit settings.'
  });

  // 2. Engineer Inspector Test: Cannot perform management/approval actions
  const engRole: UserRole = 'engineer_inspector';
  const engPerms = PermissionService.getRolePermissions(engRole);
  const engPassed = 
    !engPerms.canApproveInitiative &&
    !engPerms.canAssignSupport &&
    !engPerms.canManageSettings &&
    engPerms.canViewFieldData;

  results.push({
    testName: 'Engineer Inspector: Field Reports Allowed, Admin Approvals Forbidden',
    passed: engPassed,
    details: 'Verified Engineer Inspector can view/submit field data but cannot approve initiatives or edit settings.'
  });

  // 3. District Director Test: Restricted to District Data Scope
  const districtRole: UserRole = 'district_director';
  const districtScope = resolveDataScope(districtRole, null, { district: 'مديرية ذي السفال' });
  const inScopeMatch = isInitiativeInScope(sampleInitiativeDhiSufal, districtScope);
  const outOfScopeMatch = isInitiativeInScope(sampleInitiativeSayyani, districtScope);
  const districtPassed = inScopeMatch && !outOfScopeMatch;

  results.push({
    testName: 'District Director: Data Scope Scoped to Assigned District',
    passed: districtPassed,
    details: 'Verified District Director sees Dhi As Sufal initiatives but NOT Sayyani initiatives.'
  });

  // 4. Governorate Test: Executive Reports Viewable, Admin Settings Forbidden
  const govRole: UserRole = 'governorate';
  const govPerms = PermissionService.getRolePermissions(govRole);
  const govPassed = govPerms.canViewExecutiveData && !govPerms.canManageSettings && !govPerms.canApproveInitiative;

  results.push({
    testName: 'Governorate: Executive Overview Allowed, Admin Settings Forbidden',
    passed: govPassed,
    details: 'Verified Governorate can view executive dashboards but cannot edit system settings.'
  });

  // 5. Central Unit Test: Full Operational Management within scope
  const centralRole: UserRole = 'central_unit';
  const centralPerms = PermissionService.getRolePermissions(centralRole);
  const centralPassed = centralPerms.canApproveInitiative && centralPerms.canAssignSupport && centralPerms.canClassifyInitiative;

  results.push({
    testName: 'Central Unit: Full Operational Permissions Active',
    passed: centralPassed,
    details: 'Verified Central Unit can approve initiatives, allocate support, and classify status.'
  });

  // 6. Admin Test: Complete system capability
  const adminRole: UserRole = 'admin';
  const adminPerms = PermissionService.getRolePermissions(adminRole);
  const adminPassed = adminPerms.canApproveInitiative && adminPerms.canManageSettings && adminPerms.canAssignSupport;

  results.push({
    testName: 'Admin: Full System & Management Access',
    passed: adminPassed,
    details: 'Verified Admin role possesses full capability set.'
  });

  // 7. Demo Mode Isolation Test
  const mockUnauthVisitor: AuthUser = {
    uid: 'unauth-visitor-1',
    email: 'guest@public.org',
    displayName: 'الزائر العام',
    photoURL: null,
    emailVerified: false
  };

  const authRoleResolved = resolveAuthenticatedRole(mockUnauthVisitor); // Should be visitor
  const demoRoleResolved = resolveUserRole(mockUnauthVisitor, true, 'governorate'); // In demo mode, effective is governorate
  const nonDemoRoleResolved = resolveUserRole(mockUnauthVisitor, false, 'governorate'); // Non-demo mode, effective is visitor

  const demoPassed = 
    authRoleResolved === 'visitor' &&
    demoRoleResolved.authenticatedRole === 'visitor' &&
    demoRoleResolved.effectiveRole === 'governorate' &&
    nonDemoRoleResolved.effectiveRole === 'visitor';

  results.push({
    testName: 'Demo Mode: UI Role Switching Isolated from Authenticated Security Role',
    passed: demoPassed,
    details: 'Verified Demo Role only alters effective UI view in Demo Mode and does NOT elevate security claims in non-demo mode.'
  });

  const allPassed = results.every(r => r.passed);
  return { allPassed, results };
}
