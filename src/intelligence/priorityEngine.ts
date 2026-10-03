/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Initiative } from '../types';
import { ExtractedEvidence, PriorityLevel, ExecutiveDecisionProfile } from './types';
import { NormalizedStatusResult } from './statusNormalization';
import { SeverityEvaluation } from './severityEngine';
import { parseNum } from '../utils/numberAndDistrictUtils';

export interface PriorityEvaluation {
  priorityScore: number; // 0 - 100
  priorityLevel: PriorityLevel;
  rankingReason: string;
}

/**
 * Priority Engine V2
 * Distinct from Severity Engine. Ranks initiatives based on leadership action urgency,
 * quick-win completion potential, material risk, and community impact.
 * STRICT RULE: Dataset index, initiative ID, or Firestore insertion order are NEVER used!
 */
export class PriorityEngine {
  static evaluate(
    initiative: Initiative,
    evidence: ExtractedEvidence,
    normalized: NormalizedStatusResult,
    severity: SeverityEvaluation
  ): PriorityEvaluation {
    let score = 0;
    const reasons: string[] = [];

    const completionRate = parseNum(initiative.completionRate);
    const cost = parseNum(initiative.cost);
    const communityContribution = parseNum(initiative.communityContribution);

    // 1. Severity Score Contribution (Up to 35 points)
    const severityContrib = Math.round((severity.severityScore / 100) * 35);
    score += severityContrib;

    // 2. Quick-Win Closeout Opportunity (Up to 25 points)
    // Initiatives with high completion rate (80%+) that are stagnant receive massive priorityboost to be closed out
    if (completionRate >= 80 && normalized.normalizedStatus !== 'completed') {
      score += 25;
      reasons.push(`فرصة حسم وتدشين سريعة (إنجاز ${completionRate}%) تتطلب تدخلاً بسيطاً لإتمامها 100%`);
    } else if (completionRate >= 50 && normalized.normalizedStatus !== 'completed') {
      score += 15;
      reasons.push(`مبادرة في مرحلة متقدمة (${completionRate}%) تستحق الدعم للوصول للاكتفاء`);
    }

    // 3. Immediate Material Damage Mitigation (Up to 20 points)
    if (evidence.atRiskMaterials.length > 0) {
      score += 20;
      reasons.push('أولوية عاجلة لحماية مواد الخرسانة والأسمنت المخزن بالميدان من التلف والسيول');
    }

    // 4. Executive Decision Need (Up to 10 points)
    if (normalized.decisionNeed) {
      score += 10;
      reasons.push('تتطلب قراراً تنفيذاً فورياً من القيادة لمعالجة مسار التوريد أو التفعيل');
    }

    // 5. Community Capital & Financial Impact (Up to 10 points)
    if (cost >= 15000000 || communityContribution >= 10000000) {
      score += 10;
      reasons.push('حجم مساهمة مجتمعية وتكلفة استثمارية ضخمة ترفع أولوية المتابعة');
    }

    // Completed initiatives get lowest priority for new actions
    if (normalized.normalizedStatus === 'completed') {
      score = 5;
      reasons.length = 0;
      reasons.push('مبادرة مكتملة وموثقة - أولوية منخفضة للتعديل');
    }

    const finalScore = Math.min(100, Math.max(0, score));

    let priorityLevel: PriorityLevel = 'LOW';
    if (finalScore >= 75) {
      priorityLevel = 'CRITICAL';
    } else if (finalScore >= 50) {
      priorityLevel = 'HIGH';
    } else if (finalScore >= 25) {
      priorityLevel = 'MEDIUM';
    } else {
      priorityLevel = 'LOW';
    }

    const rankingReason = reasons.length > 0 
      ? reasons.join(' | ') 
      : 'مبادرة مستقرة ضمن المسار التنفيذي الاعتيادي';

    return {
      priorityScore: finalScore,
      priorityLevel,
      rankingReason
    };
  }

  /**
   * Sorts profiles strictly in descending order of priorityScore.
   * Does NOT rely on dataset index or database insertion order.
   */
  static rankProfiles(profiles: ExecutiveDecisionProfile[]): ExecutiveDecisionProfile[] {
    if (!Array.isArray(profiles)) return [];
    return [...profiles].sort((a, b) => b.derived.priorityScore - a.derived.priorityScore);
  }

  /**
   * Retrieves the top N highest priority critical initiatives dynamically.
   */
  static getTopCriticalInitiatives(profiles: ExecutiveDecisionProfile[], count: number = 10): ExecutiveDecisionProfile[] {
    const sorted = this.rankProfiles(profiles);
    return sorted.slice(0, count);
  }
}
