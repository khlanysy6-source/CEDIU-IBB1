/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Initiative } from '../types';
import { DataConflict } from './types';
import { parseNum } from '../utils/numberAndDistrictUtils';

/**
 * Data Validation Engine V2
 * Inspects initiatives for missing values, illogical progress/status pairs,
 * and text contradictions without EVER modifying the original data.
 */
export class DataValidationEngine {
  static validate(initiative: Initiative): DataConflict[] {
    const conflicts: DataConflict[] = [];

    if (!initiative) return conflicts;

    const completionRate = parseNum(initiative.completionRate);
    const status = (initiative.status || '').toLowerCase().trim();
    const cost = parseNum(initiative.cost);
    const community = parseNum(initiative.communityContribution);
    const unit = parseNum(initiative.unitContribution);

    // 1. Missing Critical Fields Check
    const missingFields: string[] = [];
    if (!initiative.district || initiative.district.trim() === '') missingFields.push('district');
    if (!initiative.name || initiative.name.trim() === '') missingFields.push('name');
    if (cost <= 0) missingFields.push('cost');

    if (missingFields.length > 0) {
      conflicts.push({
        type: 'MISSING_CRITICAL_FIELDS',
        severity: 'warning',
        message: `المبادرة ينقصها حقول أساسية: ${missingFields.join(', ')}`,
        fields: missingFields
      });
    }

    // 2. Status vs Progress Conflicts
    if (status === 'completed' && completionRate < 100) {
      conflicts.push({
        type: 'STATUS_PROGRESS_CONFLICT',
        severity: 'warning',
        message: `الحالة مسجلة كمكتملة بينما نسبة الإنجاز المسجلة هي ${completionRate}% بدلاً من 100%`,
        fields: ['status', 'completionRate']
      });
    }

    if (status === 'pending' && completionRate > 0) {
      conflicts.push({
        type: 'STATUS_PROGRESS_CONFLICT',
        severity: 'warning',
        message: `الحالة مسجلة كـ (قيد الانتظار) بينما يوجد إنجاز ميداني مسجل بنسبة ${completionRate}%`,
        fields: ['status', 'completionRate']
      });
    }

    if ((status === 'stagnant' || status === 'stopped') && completionRate === 100) {
      conflicts.push({
        type: 'STATUS_PROGRESS_CONFLICT',
        severity: 'warning',
        message: `الحالة مسجلة كمتوقفة بينما نسبة الإنجاز مسجلة بـ 100%`,
        fields: ['status', 'completionRate']
      });
    }

    // 3. Status vs Notes / Stagnation Reason Conflicts
    const notesText = [
      initiative.stagnationReason || '',
      ...(initiative.pathways || []).flatMap(p => p.tasks.map(t => t.notes || ''))
    ].join(' ').toLowerCase();

    if (status === 'completed' && (notesText.includes('توقف') || notesText.includes('تعثر') || notesText.includes('عائق') || notesText.includes('نقص'))) {
      conflicts.push({
        type: 'STATUS_NOTES_CONFLICT',
        severity: 'warning',
        message: `الحالة مسجلة كـ "مكتملة" ولكن الملاحظات الميدانية تشير إلى وجود تعثر أو توقف العمل`,
        fields: ['status', 'stagnationReason', 'pathways']
      });
    }

    // 4. Approval Status Conflicts
    if (initiative.ownerConfirmed === false && completionRate > 50) {
      conflicts.push({
        type: 'APPROVAL_STATUS_CONFLICT',
        severity: 'info',
        message: `نسبة الإنجاز مرتفعة (${completionRate}%) بينما لم يستكمل التوثيق والاعتماد الرسمي للمالك`,
        fields: ['ownerConfirmed', 'completionRate']
      });
    }

    // 5. Cost vs Contribution Mismatch
    const sumContributions = community + unit;
    if (cost > 0 && sumContributions > 0) {
      const diffRatio = Math.abs(cost - sumContributions) / cost;
      if (diffRatio > 0.35) {
        conflicts.push({
          type: 'COST_CONTRIBUTION_MISMATCH',
          severity: 'info',
          message: `مجموع المساهمة المجتمعية ودعم الوحدة (${sumContributions.toLocaleString()}) يختلف عن التكلفة التقديرية الكلية (${cost.toLocaleString()}) بنسبة أكبر من 35%`,
          fields: ['cost', 'communityContribution', 'unitContribution']
        });
      }
    }

    return conflicts;
  }
}
