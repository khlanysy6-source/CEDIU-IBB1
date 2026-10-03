/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoleService } from '../../core/auth/RoleService';
import { PermissionService } from '../../core/auth/PermissionService';
import { AuthorizationService } from '../../core/auth/AuthorizationService';
import { EnterpriseRole, AuthUser, UserProfile } from '../../core/auth/types';
import { Initiative } from '../../types';

export interface SecurityTestResult {
  scenarioName: string;
  passed: boolean;
  details: string;
}

export function runEnterpriseSecurityTests(): SecurityTestResult[] {
  const results: SecurityTestResult[] = [];

  // 1. Governor of Ibb attempting to view another governorate (e.g. Taiz)
  const ibbGovernorScope = AuthorizationService.resolveDataScope('GOVERNOR', {
    uid: 'gov-ibb-1',
    name: 'محافظ إب',
    email: 'governor@ibb.gov.ye',
    role: 'GOVERNOR',
    organizationType: 'LOCAL_AUTHORITY',
    governorateId: 'IBB',
    district: 'محافظة إب',
    status: 'active',
    createdAt: '',
    updatedAt: '',
  });

  const ibbInitiative: Partial<Initiative> = { id: 'init-ibb-10', governorate: 'محافظة إب', district: 'مديرية ذي السفال' };
  const taizInitiative: Partial<Initiative> = { id: 'init-taiz-99', governorate: 'محافظة تعز', district: 'مديرية المظفر' };

  const canGovViewIbb = AuthorizationService.isInitiativeInScope(ibbInitiative as Initiative, ibbGovernorScope);
  const canGovViewTaiz = AuthorizationService.isInitiativeInScope(taizInitiative as Initiative, ibbGovernorScope);

  results.push({
    scenarioName: 'محافظ إب حاول الوصول لبيانات محافظة أخرى (تعز)',
    passed: canGovViewIbb === true && canGovViewTaiz === false,
    details: (canGovViewIbb && !canGovViewTaiz)
      ? 'نجح الاختبار: حظر مطلق لبيانات المحافظات الأخرى وتحديد النطاق لمحافظة إب فقط'
      : 'فشل الاختبار: استطاع المحافظ تجاوز نطاق محافظته',
  });

  // 2. District Manager attempting to view or edit another district
  const districtManagerScope = AuthorizationService.resolveDataScope('DISTRICT_MANAGER', {
    uid: 'dm-1',
    name: 'مدير مديرية ذي السفال',
    email: 'dm@dhisufal.gov.ye',
    role: 'DISTRICT_MANAGER',
    organizationType: 'LOCAL_AUTHORITY',
    governorateId: 'IBB',
    districtIds: ['district_001'],
    district: 'مديرية ذي السفال',
    status: 'active',
    createdAt: '',
    updatedAt: '',
  });

  const ownDistrictInit: Partial<Initiative> = { id: 'init-dhi-1', district: 'مديرية ذي السفال' };
  const otherDistrictInit: Partial<Initiative> = { id: 'init-udayn-1', district: 'مديرية العدين' };

  const canDmViewOwn = AuthorizationService.isInitiativeInScope(ownDistrictInit as Initiative, districtManagerScope);
  const canDmViewOther = AuthorizationService.isInitiativeInScope(otherDistrictInit as Initiative, districtManagerScope);

  results.push({
    scenarioName: 'مدير مديرية لا يرى ولا يتعدى على مديرية أخرى',
    passed: canDmViewOwn === true && canDmViewOther === false,
    details: (canDmViewOwn && !canDmViewOther)
      ? 'نجح الاختبار: مدير المديرية مقيد حصرياً بمديريته'
      : 'فشل الاختبار: تم السماح برؤية مديرية أجنبية',
  });

  // 3. Supervision Engineer only viewing assigned districts
  const supervisionEngScope = AuthorizationService.resolveDataScope('SUPERVISION_ENGINEER', {
    uid: 'eng-sup-1',
    name: 'م. خالد - مهندس إشراف',
    email: 'eng.khalid@interventions.gov.ye',
    role: 'SUPERVISION_ENGINEER',
    organizationType: 'SPECIALIZED_DEPT',
    governorateId: 'IBB',
    assignedDistricts: ['مديرية ذي السفال', 'مديرية جبلة'],
    status: 'active',
    createdAt: '',
    updatedAt: '',
  });

  const assignedDistrictInit: Partial<Initiative> = { id: 'init-jibla-1', district: 'مديرية جبلة' };
  const unassignedDistrictInit: Partial<Initiative> = { id: 'init-qafr-1', district: 'مديرية القفر' };

  const canEngViewAssigned = AuthorizationService.isInitiativeInScope(assignedDistrictInit as Initiative, supervisionEngScope);
  const canEngViewUnassigned = AuthorizationService.isInitiativeInScope(unassignedDistrictInit as Initiative, supervisionEngScope);

  results.push({
    scenarioName: 'مهندس إشراف لا يرى إلا المديريات المكلف بها رسماً',
    passed: canEngViewAssigned === true && canEngViewUnassigned === false,
    details: (canEngViewAssigned && !canEngViewUnassigned)
      ? 'نجح الاختبار: اقتصار الوصول على المديريات المكلف بها فقط'
      : 'فشل الاختبار: المهندس استطاع قراءة مديريات غير مكلف بها',
  });

  // 4. Cooperative Admin attempting to edit initiative outside association scope
  const coopAdminScope = AuthorizationService.resolveDataScope('COOPERATIVE_ADMIN', {
    uid: 'coop-1',
    name: 'رئيس جمعية ذي السفال التعاونية',
    email: 'coop@dhisufal.org',
    role: 'COOPERATIVE_ADMIN',
    organizationType: 'COOPERATIVE_SOCIETY',
    governorateId: 'IBB',
    district: 'مديرية ذي السفال',
    status: 'active',
    createdAt: '',
    updatedAt: '',
  });

  const ownCoopInit: Partial<Initiative> = { id: 'init-coop-1', district: 'مديرية ذي السفال' };
  const foreignCoopInit: Partial<Initiative> = { id: 'init-yareem-1', district: 'مديرية يريم' };

  const canCoopEditOwn = PermissionService.canEditInitiative('COOPERATIVE_ADMIN', coopAdminScope, ownCoopInit as Initiative);
  const canCoopEditForeign = PermissionService.canEditInitiative('COOPERATIVE_ADMIN', coopAdminScope, foreignCoopInit as Initiative);

  results.push({
    scenarioName: 'الجمعية التعاونية لا تعدل مبادرة خارج نطاقها وجغرافيتها',
    passed: canCoopEditOwn === true && canCoopEditForeign === false,
    details: (canCoopEditOwn && !canCoopEditForeign)
      ? 'نجح الاختبار: حظر تعديل أي مبادرة خارج جمعية ومديرية المستخدم'
      : 'فشل الاختبار: الجمعية استطاعت تعديل مبادرة أجنبية',
  });

  // 5. Field Engineer (فارس الهندسة) limited to assigned mission scope
  const fieldEngScope = AuthorizationService.resolveDataScope('FIELD_ENGINEER', {
    uid: 'knight-1',
    name: 'فارس الهندسة - م. عادل',
    email: 'knight@coop.org',
    role: 'FIELD_ENGINEER',
    organizationType: 'FIELD_TEAMS',
    governorateId: 'IBB',
    district: 'مديرية ذي السفال',
    assignedInitiatives: ['init-road-101'],
    assignedInitiativeIds: ['init-road-101'],
    status: 'active',
    createdAt: '',
    updatedAt: '',
  });

  const assignedMissionInit: Partial<Initiative> = { id: 'init-road-101', district: 'مديرية ذي السفال' };
  const unassignedMissionInit: Partial<Initiative> = { id: 'init-water-505', district: 'مديرية ذي السفال' };

  const canKnightEditAssigned = PermissionService.canEditInitiative('FIELD_ENGINEER', fieldEngScope, assignedMissionInit as Initiative);
  const canKnightEditUnassigned = PermissionService.canEditInitiative('FIELD_ENGINEER', fieldEngScope, unassignedMissionInit as Initiative);

  results.push({
    scenarioName: 'فارس الهندسة مقيد حصرياً ببيانات ومهمة تكليفه الميداني',
    passed: canKnightEditAssigned === true && canKnightEditUnassigned === false,
    details: (canKnightEditAssigned && !canKnightEditUnassigned)
      ? 'نجح الاختبار: حظر مطلق للتعديل خارج حدود التكليف الفردي المسند'
      : 'فشل الاختبار: التكليف الفردي لم يمنع الوصول للمبادرات الأخرى',
  });

  // 6. Unit Head (رئيس الوحدة) viewing overall general picture
  const unitHeadScope = AuthorizationService.resolveDataScope('UNIT_HEAD', {
    uid: 'head-1',
    name: 'رئيس وحدة التدخلات المركزية',
    email: 'head@interventions.gov.ye',
    role: 'UNIT_HEAD',
    organizationType: 'CENTRAL_UNIT',
    status: 'active',
    createdAt: '',
    updatedAt: '',
  });

  const canHeadViewAllIbb = AuthorizationService.isInitiativeInScope(ibbInitiative as Initiative, unitHeadScope);
  const canHeadViewAllTaiz = AuthorizationService.isInitiativeInScope(taizInitiative as Initiative, unitHeadScope);

  results.push({
    scenarioName: 'رئيس الوحدة (UNIT_HEAD) يرى الصورة العامة الشاملة لجميع المحافظات',
    passed: canHeadViewAllIbb === true && canHeadViewAllTaiz === true && unitHeadScope.type === 'all',
    details: (canHeadViewAllIbb && canHeadViewAllTaiz)
      ? 'نجح الاختبار: رؤية سيادية كاملة للصورة العامة لكافة المحافظات والمبادرات'
      : 'فشل الاختبار: تم تقييد رؤية رئيس الوحدة',
  });

  return results;
}
