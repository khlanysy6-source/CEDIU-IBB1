/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Initiative } from '../types';
import { ExtractedEvidence, DataConflict, ConfidenceLevel } from './types';
import { parseNum } from '../utils/numberAndDistrictUtils';

export interface ConfidenceEvaluation {
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0 - 100
  reasons: string[];
}

/**
 * Decision Confidence Engine V2
 * Evaluates the confidence level of derived decisions and recommendations
 * based on data completeness, field survey presence, reports, and conflicts.
 */
export class DecisionConfidenceEngine {
  static evaluate(
    initiative: Initiative,
    evidence: ExtractedEvidence,
    conflicts: DataConflict[]
  ): ConfidenceEvaluation {
    let score = 70; // Baseline
    const reasons: string[] = [];

    const completionRate = parseNum(initiative.completionRate);
    const status = (initiative.status || '').toLowerCase().trim();

    // 1. Field Reports presence
    if (initiative.reports && initiative.reports.length > 0) {
      score += 20;
      reasons.push('توفر تقارير نزول فني ومعاينة ميدانية معتمدة');
    } else {
      score -= 15;
      reasons.push('عدم توفر تقارير معاينة فنية معتمدة من المهندس المشرف');
    }

    // 2. Pending or Zero completion status constraint
    if (status === 'pending' || completionRate === 0) {
      score -= 10;
      reasons.push('المبادرة قيد الانتظار وتتطلب نزولاً ميدانياً لتأكيد البيانات');
    }

    // 3. Task notes & field evidence
    if (evidence.hasFieldNotes) {
      score += 10;
      reasons.push('توفر ملاحظات وسجلات الفرسان الميدانيين');
    }

    // 4. Stagnation reason text clarity
    if (evidence.stagnationReasonText && evidence.stagnationReasonText.length > 10) {
      score += 10;
      reasons.push('توفر مبررات التعثر والتوقف الموثقة');
    }

    // 5. Data conflicts penalty
    if (conflicts.length > 0) {
      const conflictDeduction = conflicts.length * 20;
      score -= conflictDeduction;
      reasons.push(`خصم ${conflictDeduction} نقطة للثقة بسبب وجود ${conflicts.length} تعارضات في البيانات`);
    }

    // 6. Unconfirmed owner penalty
    if (initiative.ownerConfirmed === false) {
      score -= 15;
      reasons.push('عدم استكمال توثيق واعتماد المالك الرسمي');
    }

    const finalScore = Math.min(100, Math.max(0, score));

    let confidence: ConfidenceLevel = 'MEDIUM';
    if (finalScore >= 75) {
      confidence = 'HIGH';
    } else if (finalScore >= 50) {
      confidence = 'MEDIUM';
    } else {
      confidence = 'LOW';
    }

    return {
      confidence,
      confidenceScore: finalScore,
      reasons
    };
  }
}
