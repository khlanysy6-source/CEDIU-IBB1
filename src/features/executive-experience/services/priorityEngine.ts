/**
 * Executive Experience Layer - Priority Engine
 * Calculates Criticality Score based on:
 * Criticality Score = Risk (0-30) + Delay (0-25) + Impact (0-20) + Beneficiaries (0-15) + Intervention Readiness (0-10)
 */

import { Initiative } from '../../../types';
import { PriorityIssue, PriorityLevel } from '../types';
import { parseNum } from '../../../utils/numberAndDistrictUtils';

export class PriorityEngine {
  /**
   * Calculate criticality score for an initiative or field issue
   */
  public static calculateCriticalityScore(
    initiative: Initiative,
    delayDays: number = 0,
    riskFactor: number = 0, // 0 - 30
    hasSupplyChainBlock: boolean = false
  ): number {
    // 1. Risk Component (0 - 30)
    let riskScore = riskFactor;
    if (initiative.status === 'stagnant' || initiative.status === 'stopped') {
      riskScore = Math.max(riskScore, 25);
    } else if (initiative.status === 'ongoing') {
      riskScore = Math.max(riskScore, 10);
    }
    if (hasSupplyChainBlock) {
      riskScore = Math.min(30, riskScore + 10);
    }

    // 2. Delay Component (0 - 25)
    let delayScore = 0;
    if (delayDays > 90) delayScore = 25;
    else if (delayDays > 60) delayScore = 20;
    else if (delayDays > 30) delayScore = 15;
    else if (delayDays > 15) delayScore = 10;
    else if (delayDays > 0) delayScore = 5;

    // 3. Impact Component (0 - 20)
    let impactScore = 10;
    const cost = parseNum(initiative.cost);
    if (cost > 50000000) impactScore = 20;
    else if (cost > 20000000) impactScore = 16;
    else if (cost > 10000000) impactScore = 12;

    // 4. Beneficiaries Component (0 - 15)
    let beneficiariesScore = 5;
    const beneficiaries = parseNum(initiative.beneficiaries);
    if (beneficiaries > 10000) beneficiariesScore = 15;
    else if (beneficiaries > 5000) beneficiariesScore = 12;
    else if (beneficiaries > 2000) beneficiariesScore = 9;

    // 5. Intervention Readiness (0 - 10)
    let readinessScore = 8;
    if (parseNum(initiative.communityContribution) > 0) readinessScore = 10;

    const totalScore = Math.min(100, Math.round(riskScore + delayScore + impactScore + beneficiariesScore + readinessScore));
    return totalScore;
  }

  public static getPriorityLevel(criticalityScore: number): PriorityLevel {
    if (criticalityScore >= 80) return 'CRITICAL';
    if (criticalityScore >= 60) return 'HIGH';
    if (criticalityScore >= 40) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Extracts top priority issues strictly from raw initiative data without randomness
   */
  public static extractPriorityIssues(initiatives: Initiative[]): PriorityIssue[] {
    const issues: PriorityIssue[] = [];

    // Filter delayed or critical initiatives
    const problemInitiatives = initiatives.filter(
      i => i.status === 'stagnant' || i.status === 'stopped' || (i.status === 'ongoing' && parseNum(i.completionRate) < 40)
    );

    problemInitiatives.forEach((init) => {
      const isStopped = init.status === 'stagnant' || init.status === 'stopped';
      const approvedCement = parseNum(init.materialsApproved);
      const disbursedCement = parseNum(init.materialsDisbursed);
      const usedCement = parseNum(init.materialsUsed);
      const remainingUnit = Math.max(0, approvedCement - disbursedCement);
      const remainingField = Math.max(0, disbursedCement - usedCement);

      const stagnationReason = (init.stagnationReason || '').trim();
      const notes = (init.notes || '').trim();
      const textReason = stagnationReason || notes;

      const isMaterialsIssue = 
        textReason.includes('إسمنت') ||
        textReason.includes('ديزل') ||
        textReason.includes('مواد') ||
        (disbursedCement > 0 && remainingField === 0 && remainingUnit > 0);

      // Delay days estimation derived deterministically from completion gap and status
      const completionRate = parseNum(init.completionRate);
      let delayDays = 0;
      if (isStopped) {
        delayDays = completionRate < 30 ? 60 : 30;
      } else if (completionRate < 20) {
        delayDays = 20;
      } else {
        delayDays = 10;
      }

      const criticalityScore = this.calculateCriticalityScore(
        init,
        delayDays,
        isStopped ? 25 : 12,
        isMaterialsIssue
      );

      const priority = this.getPriorityLevel(criticalityScore);

      let reason = textReason;
      if (!reason) {
        if (isStopped) {
          reason = 'المشروع متوقف ويتطلب التحقق الميداني من العائق';
        } else if (isMaterialsIssue) {
          reason = 'حاجة لمراجعة استهلاك الدفعة الميدانية وصرف المستحق من رصيد الوحدة';
        } else {
          reason = `الأعمال جارية بنسبة إنجاز ${completionRate}% وبانتظار الرفع الفني الدوري`;
        }
      }

      const impact = init.beneficiaries 
        ? `تأخر المخطط الزمني بـ ${delayDays} يوماً، لعدد ${parseNum(init.beneficiaries).toLocaleString('ar-YE')} مستفيد موثق`
        : `تأخر المخطط الزمني بـ ${delayDays} يوماً وبانتظار استكمال بيانات المستفيدين`;

      const recommendation = isMaterialsIssue
        ? 'اعتماد صرف الدفعة المستحقة من رصيد الوحدة غير المنصرف فور استكمال التوثيق'
        : 'توجيه الفريق الهندسي واللجنة المجتمعية لمعاينة الموقع واستكمال الرفع الفني';

      const requiredAction = isStopped
        ? `قرار قيادة المحافظة والسلطة المحلية بـ ${init.district || 'المديرية'} لحسم التوقف`
        : `متابعة وصرف تعزيزي من وحدة التدخلات المركزية`;

      issues.push({
        id: `issue_${init.id}`,
        initiativeId: init.id,
        title: init.name || `مبادرة رصف طريق - ${init.district}`,
        district: init.district || 'محافظة إب',
        status: init.status || 'متعثرة',
        reason,
        impact,
        recommendation,
        requiredAction,
        priority,
        criticalityScore,
        affectedBeneficiaries: parseNum(init.beneficiaries) || 1200,
        delayDays,
        responsibleParty: `قيادة السلطة المحلية بـ ${init.district || 'المديرية'} / وحدة التدخلات`
      });
    });

    // Sort descending by criticality score
    return issues.sort((a, b) => b.criticalityScore - a.criticalityScore);
  }
}
