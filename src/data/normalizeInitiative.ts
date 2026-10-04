/**
 * Initiative Record Normalization & Canonicalization
 * Ensures consistent canonical IDs, cleaned district names, and reconciled lifecycle status.
 */

import { Initiative } from '../types';
import { getCanonicalDistrictName, parseNum } from '../utils/numberAndDistrictUtils';
import { SORTING_APPROVED_RESOURCES_BY_KEY, SORTING_APPROVED_RESOURCES_BY_NAME } from './generated/sortingApprovedResources';

function normalizeResourceKey(value: unknown): string {
  return String(value ?? '').trim().toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/\\s+/g, ' ');
}

function resolveSortingResources(name: string, district: string, subDistrict: string) {
  const key = [normalizeResourceKey(name), normalizeResourceKey(district), normalizeResourceKey(subDistrict)].join('|');
  return SORTING_APPROVED_RESOURCES_BY_KEY[key] || SORTING_APPROVED_RESOURCES_BY_NAME[normalizeResourceKey(name)];
}

export function canonicalizeInitiativeRecord(init: any, index?: number): Initiative {
  if (!init) {
    return {} as Initiative;
  }

  const id = init.id || `init_${String(index || 1).padStart(3, '0')}`;
  const initiativeNumber = init.initiativeNumber || (init as any).initiative_number || id;
  const name = String(init.name || '').trim();
  const district = getCanonicalDistrictName(init.district || '');
  const subDistrict = String(init.subDistrict || init.sub_district || '').trim();
  const village = String(init.village || '').trim();

  const cost = parseNum(init.cost);
  const execCost = parseNum(init.executionCostCompleted);
  let completionRate = parseNum(init.completionRate);

  const note = String(init.notes || '').trim();
  const lowerNote = note.toLowerCase();

  const pctMatch = note.match(/(\d+)\s*%/);
  if (pctMatch) {
    completionRate = parseInt(pctMatch[1], 10);
  } else if (completionRate === 0 && execCost > 0 && cost > 0) {
    completionRate = Math.min(100, Math.round((execCost / cost) * 100));
  }

  let status: 'completed' | 'ongoing' | 'stagnant' | 'stopped' | 'pending' = 'pending';
  const rawStatus = String(init.status || '').trim().toLowerCase();

  if (rawStatus === 'completed' || rawStatus === 'منجزة' || rawStatus === 'منجز' || rawStatus === 'مكتملة') {
    status = 'completed';
    if (completionRate === 0) completionRate = 100;
  } else if (rawStatus === 'stagnant' || rawStatus === 'متعثرة' || rawStatus === 'متعثر') {
    status = 'stagnant';
    if (completionRate === 0) completionRate = 30;
  } else if (rawStatus === 'stopped' || rawStatus === 'متوقفة' || rawStatus === 'متوقف') {
    status = 'stopped';
    if (completionRate === 0) completionRate = 15;
  } else if (rawStatus === 'ongoing' || rawStatus === 'قيد التنفيذ' || rawStatus === 'مستمرة' || rawStatus === 'جارية') {
    status = 'ongoing';
    if (completionRate === 0) completionRate = 50;
  } else if (
    completionRate === 100 ||
    lowerNote.includes('المبادرة منجزة') ||
    lowerNote.includes('مبادرة منجزة') ||
    lowerNote.includes('تم الإنجاز')
  ) {
    status = 'completed';
    completionRate = 100;
  } else if (lowerNote.includes('متعثر') || lowerNote.includes('تعثر')) {
    status = 'stagnant';
    if (completionRate === 0) completionRate = 30;
  } else if (
    lowerNote.includes('متوقف') || 
    lowerNote.includes('توقف') || 
    lowerNote.includes('اعتذار المجتمع') ||
    lowerNote.includes('سحب الكميات')
  ) {
    status = 'stopped';
    if (completionRate === 0) completionRate = 15;
  } else if (
    lowerNote.includes('لم تبدأ') ||
    lowerNote.includes('لم تباشر') ||
    lowerNote.includes('قيد الدراسة')
  ) {
    status = 'pending';
    completionRate = 0;
  } else if (lowerNote.includes('يجري') || lowerNote.includes('مستمر') || lowerNote.includes('جار')) {
    status = 'ongoing';
    if (completionRate === 0) completionRate = 50;
  } else {
    if (completionRate >= 95) {
      status = 'completed';
      completionRate = 100;
    } else if (completionRate > 0) {
      status = 'ongoing';
    } else {
      status = 'pending';
      completionRate = 0;
    }
  }

  let stagnationReason = init.stagnationReason;
  if (status === 'stagnant' || status === 'stopped') {
    stagnationReason = note || 'توقف العمل الميداني بانتظار استكمال مقومات التنفيذ أو صرف الكميات المعتمدة.';
  } else if (status === 'completed') {
    stagnationReason = undefined;
  }

  const sortingResources = resolveSortingResources(name, district, subDistrict);
  const baseMaterials = Array.isArray(init.materials) ? init.materials : [];
  const materials = sortingResources ? [
    ...baseMaterials.filter((m: any) => !['الاسمنت', 'الديزل', 'أخرى'].some(label => String(m?.name || '').includes(label))),
    {
      id: `${id}_cement`, name: 'الاسمنت', quantity: sortingResources.cementApproved, unit: 'كيس',
      status: 'safe', storageLocation: 'غير محدد', updatedAt: init.updatedAt || new Date().toISOString()
    },
    {
      id: `${id}_diesel`, name: 'الديزل', quantity: sortingResources.dieselApproved, unit: 'لتر',
      status: 'safe', storageLocation: 'غير محدد', updatedAt: init.updatedAt || new Date().toISOString()
    },
    {
      id: `${id}_other`, name: 'أخرى', quantity: sortingResources.otherApproved, unit: sortingResources.otherUnit || '—',
      status: 'safe', storageLocation: 'غير محدد', updatedAt: init.updatedAt || new Date().toISOString()
    }
  ] : baseMaterials;

  return {
    ...init,
    id,
    canonicalId: init.canonicalId || id,
    initiativeNumber,
    name,
    district,
    subDistrict,
    village,
    status,
    completionRate,
    cost: cost || 0,
    communityContribution: parseNum(init.communityContribution) || 0,
    unitContribution: parseNum(init.unitContribution) || 0,
    materials,
    materialsApproved: sortingResources ? `${sortingResources.cementApproved} كيس` : init.materialsApproved,
    dieselApproved: sortingResources ? `${sortingResources.dieselApproved} لتر` : init.dieselApproved,
    otherMaterialApproved: sortingResources?.otherApproved ?? init.otherMaterialApproved,
    otherMaterialUnit: sortingResources?.otherUnit || init.otherMaterialUnit,
    resourceSource: sortingResources ? 'مصفوفة الفرز' : init.resourceSource,
    stagnationReason
  };
}
