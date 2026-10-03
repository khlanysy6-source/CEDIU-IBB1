/**
 * EXECUTION-03 — Impact Engine
 * Evaluates the impact of project issues based on cost, beneficiaries, and public importance.
 */

import { Initiative } from '../types';
import { DecisionProfile } from '../intelligence/types';
import { Impact, ImpactLevel } from './types';

export function deriveImpact(initiative: Initiative, decisionProfile: DecisionProfile): Impact {
  const estCost = initiative.estimatedCost ?? (initiative as any).totalCost ?? 0;
  const beneficiaries = (initiative as any).beneficiariesCount ?? initiative.beneficiaries ?? 0;
  const completion = initiative.completionRate ?? 0;
  const isStagnant = initiative.status === 'stagnant' || initiative.status === 'stopped';
  const name = initiative.name || '';

  let impactLevel: ImpactLevel = 'LOW';
  const reasons: string[] = [];

  // Check financial impact
  if (estCost >= 50000000) {
    reasons.push(`حجم استثماري ضخم (> 50 مليون ريال)`);
    impactLevel = 'CRITICAL';
  } else if (estCost >= 10000000) {
    reasons.push(`تكلفة مالية عالية (> 10 ملايين ريال)`);
    if ((impactLevel as string) !== 'CRITICAL') impactLevel = 'HIGH';
  } else if (estCost >= 2000000) {
    reasons.push(`ميزانية متوسطة (> 2 مليون ريال)`);
    if ((impactLevel as string) === 'LOW') impactLevel = 'MEDIUM';
  }

  // Check beneficiary impact
  if (beneficiaries >= 10000) {
    reasons.push(`شريحة مستفيدين واسعة جداً (> 10 آلاف نسمة)`);
    impactLevel = 'CRITICAL';
  } else if (beneficiaries >= 3000) {
    reasons.push(`تخدم أكثر من 3000 نسمة`);
    if ((impactLevel as string) !== 'CRITICAL') impactLevel = 'HIGH';
  } else if (beneficiaries >= 1000) {
    reasons.push(`تخدم أكثر من 1000 نسمة`);
    if ((impactLevel as string) === 'LOW') impactLevel = 'MEDIUM';
  }

  // Check road/pathway significance
  if (name.includes('رئيسي') || name.includes('رابط') || name.includes('عقبة')) {
    reasons.push(`شريان مواصلات رئيسي أو عقبة جبلية حيوية`);
    if (impactLevel === 'LOW') impactLevel = 'MEDIUM';
    if (impactLevel === 'MEDIUM' && isStagnant) impactLevel = 'HIGH';
  }

  // Risk of material degradation if stagnant with progress
  if (isStagnant && completion > 0 && completion < 90) {
    reasons.push(`مخاطر انجراف وتلف المواد المخزنة للمشروع المتوقف`);
    if (impactLevel === 'MEDIUM') impactLevel = 'HIGH';
  }

  if (reasons.length === 0) {
    reasons.push('تأثير تنموي اعتيادي على المستوى المحلي');
  }

  // Strategic weight calculation (1-10)
  let strategicWeight = 3;
  if (impactLevel === 'CRITICAL') strategicWeight = 10;
  else if (impactLevel === 'HIGH') strategicWeight = 8;
  else if (impactLevel === 'MEDIUM') strategicWeight = 5;

  return {
    level: impactLevel,
    reason: reasons.join(' | '),
    valueAtRiskEstYR: estCost,
    beneficiariesEst: beneficiaries,
    strategicWeight,
  };
}
