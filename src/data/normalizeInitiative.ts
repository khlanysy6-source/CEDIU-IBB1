/**
 * Initiative Record Normalization & Canonicalization
 * Ensures consistent canonical IDs, cleaned district names, and reconciled lifecycle status.
 */

import { Initiative } from '../types';
import { getCanonicalDistrictName, parseNum } from '../utils/numberAndDistrictUtils';

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
    stagnationReason
  };
}
