/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Initiative } from '../types';
import { ExtractedEvidence } from './types';
import { parseNum } from '../utils/numberAndDistrictUtils';

export interface NormalizedStatusResult {
  originalStatus: string;
  normalizedStatus: 'ongoing' | 'completed' | 'stagnant' | 'stopped' | 'pending';
  operationalCondition: 
    | 'CRITICAL_STAGNATION' 
    | 'PARTIAL_STAGNATION' 
    | 'ACTIVE_PROGRESS' 
    | 'COMPLETED_CLOSED' 
    | 'AWAITING_FIELD_SURVEY';
  primaryCause: string;
  decisionNeed: boolean;
}

/**
 * Status Normalization Layer V2
 * Preserves raw status in data while deriving operational condition,
 * primary cause, and decision need without modifying original fields.
 */
export class StatusNormalizationEngine {
  static normalize(initiative: Initiative, evidence: ExtractedEvidence): NormalizedStatusResult {
    const rawStatus = (initiative.status || '').toString().trim();
    const rawLower = rawStatus.toLowerCase();
    const completionRate = parseNum(initiative.completionRate);

    // Normalize canonical status strictly to 5 states
    let normalizedStatus: 'ongoing' | 'completed' | 'stagnant' | 'stopped' | 'pending' = 'ongoing';

    if (rawLower.includes('complete') || rawLower.includes('مكتمل') || rawLower.includes('منجز') || completionRate === 100) {
      normalizedStatus = 'completed';
    } else if (rawLower.includes('stop') || rawLower.includes('متوقف') || rawLower.includes('إلغاء') || rawLower.includes('الغاء')) {
      normalizedStatus = 'stopped';
    } else if (rawLower.includes('stagnant') || rawLower.includes('متعثر')) {
      normalizedStatus = 'stagnant';
    } else if (rawLower.includes('pending') || rawLower.includes('انتظار') || rawLower.includes('جديد') || rawLower.includes('لم يبدأ')) {
      normalizedStatus = 'pending';
    } else {
      normalizedStatus = 'ongoing';
    }

    // Determine Operational Condition
    let operationalCondition: NormalizedStatusResult['operationalCondition'] = 'ACTIVE_PROGRESS';

    if (normalizedStatus === 'completed') {
      operationalCondition = 'COMPLETED_CLOSED';
    } else if (normalizedStatus === 'pending' || completionRate === 0) {
      operationalCondition = 'AWAITING_FIELD_SURVEY';
    } else if (normalizedStatus === 'stagnant') {
      if (evidence.atRiskMaterials.length > 0 || completionRate > 50) {
        operationalCondition = 'CRITICAL_STAGNATION';
      } else {
        operationalCondition = 'PARTIAL_STAGNATION';
      }
    } else {
      operationalCondition = 'ACTIVE_PROGRESS';
    }

    // Determine Primary Cause from Evidence & Bottleneck
    let primaryCause = 'تنفيذ ميداني مستمر وفق الخطة التنفيذية';

    if (normalizedStatus === 'completed') {
      primaryCause = 'تم استكمال جميع الأعمال الفنية والخرسانية بنجاح';
    } else if (normalizedStatus === 'pending' || completionRate === 0) {
      primaryCause = 'بانتظار مسح الفرز الميداني والرفع المساحي الأولي';
    } else if (normalizedStatus === 'stopped') {
      primaryCause = initiative.stagnationReason || evidence.stagnationReasonText || initiative.notes || 'سبب التوقف: غير موثق بالبيانات الحالية';
    } else if (normalizedStatus === 'stagnant') {
      primaryCause = initiative.stagnationReason || evidence.stagnationReasonText || (initiative.notes?.includes('تعثر') ? initiative.notes : 'سبب التعثر غير موثق بالبيانات الحالية');
    } else {
      primaryCause = 'تنفيذ ميداني مستمر وفق الخطة التنفيذية المعتمدة';
    }

    // Determine Decision Need
    const decisionNeed = operationalCondition === 'CRITICAL_STAGNATION' || 
                         operationalCondition === 'PARTIAL_STAGNATION' || 
                         (completionRate >= 90 && normalizedStatus !== 'completed') ||
                         evidence.atRiskMaterials.length > 0;

    return {
      originalStatus: rawStatus || 'قيد التنفيذ',
      normalizedStatus,
      operationalCondition,
      primaryCause,
      decisionNeed
    };
  }
}
