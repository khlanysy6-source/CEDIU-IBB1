/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Initiative } from '../types';
import { ExtractedEvidence, SeverityLevel } from './types';
import { NormalizedStatusResult } from './statusNormalization';
import { parseNum } from '../utils/numberAndDistrictUtils';

export interface SeverityEvaluation {
  severityScore: number; // 0 - 100
  severityLevel: SeverityLevel;
  factors: string[];
}

/**
 * Severity Engine V2
 * Evaluates the severity of risk/stagnation based on holistic evidence:
 * materials at risk, capital invested, progress bottleneck, and field survey status.
 */
export class SeverityEngine {
  static evaluate(
    initiative: Initiative,
    evidence: ExtractedEvidence,
    normalized: NormalizedStatusResult
  ): SeverityEvaluation {
    let score = 0;
    const factors: string[] = [];

    const completionRate = parseNum(initiative.completionRate);
    const cost = parseNum(initiative.cost);

    // 1. Operational Condition Impact
    switch (normalized.operationalCondition) {
      case 'CRITICAL_STAGNATION':
        score += 40;
        factors.push('تعثر حرج يهدد المبادرة بالإيقاف الكلي');
        break;
      case 'PARTIAL_STAGNATION':
        score += 25;
        factors.push('توقف جزئي أو تباطؤ في وتيرة العمل الميداني');
        break;
      case 'AWAITING_FIELD_SURVEY':
        score += 15;
        factors.push('لم يبدأ التنفيذ بعد بانتظار المسح الميداني');
        break;
      case 'ACTIVE_PROGRESS':
        score += 5;
        factors.push('تنفيذ ميداني مستمر');
        break;
      case 'COMPLETED_CLOSED':
        score += 0;
        factors.push('مبادرة منجزة بدون مخاطر حالية');
        break;
    }

    // 2. Risk to Materials (e.g. cement humidity risk)
    if (evidence.atRiskMaterials.length > 0) {
      score += 25;
      factors.push(`وجود مواد مخزنة مهددة بالتلف: ${evidence.atRiskMaterials.join(', ')}`);
    }

    // 3. Sunk Capital at Risk (high completion rate stuck)
    if (normalized.normalizedStatus === 'stagnant' && completionRate >= 60) {
      score += 20;
      factors.push(`استثمار مجتمعي وهندسي مرتفع (${completionRate}%) متعثر قرب خط النهاية`);
    }

    // 4. Financial Scale Impact
    if (cost >= 20000000) {
      score += 15;
      factors.push('تكلفة مالية استثمارية عالية (تتجاوز 20 مليون ريال)');
    } else if (cost >= 10000000) {
      score += 10;
      factors.push('تكلفة مالية متوسطة (تتجاوز 10 ملايين ريال)');
    }

    // 5. Survey and Documentation Gaps
    if (!evidence.hasRecentFieldSurvey && normalized.normalizedStatus !== 'completed') {
      score += 10;
      factors.push('غالي تقارير المعاينة الفنية الحديثة');
    }

    // Cap score at 100
    const finalScore = Math.min(100, Math.max(0, score));

    let severityLevel: SeverityLevel = 'LOW';
    if (finalScore >= 75) {
      severityLevel = 'CRITICAL';
    } else if (finalScore >= 50) {
      severityLevel = 'HIGH';
    } else if (finalScore >= 25) {
      severityLevel = 'MEDIUM';
    } else {
      severityLevel = 'LOW';
    }

    return {
      severityScore: finalScore,
      severityLevel,
      factors
    };
  }
}
