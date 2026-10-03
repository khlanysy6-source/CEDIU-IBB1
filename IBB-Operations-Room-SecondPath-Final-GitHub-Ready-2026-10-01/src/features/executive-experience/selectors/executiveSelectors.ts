/**
 * Executive Experience Layer - Role Selectors
 * Custom filters tailored for each leadership perspective
 */

import { ExecutiveOverview } from '../types';

export class ExecutiveSelectors {
  /**
   * 1. Executive Manager View Selector (المدير التنفيذي)
   * Focus: Comprehensive operational command, critical issues, decisions required, action follow-up
   */
  public static getExecutiveManagerData(overview: ExecutiveOverview) {
    return {
      summary: overview.summary,
      healthStatus: overview.healthStatus,
      criticalIssues: overview.priorityIssues.slice(0, 8),
      decisionsRequired: overview.decisionsRequired,
      recentChanges: overview.recentChanges,
      insights: overview.recommendations,
      ledgerTrace: overview.ledgerTrace,
      performanceTrend: overview.performanceTrend
    };
  }

  /**
   * 2. Executive Brief Selector (رئيس الوحدة)
   * Focus: Rapid executive briefing, performance summary, key achievements, major risks, decisions needed
   */
  public static getExecutiveBriefData(overview: ExecutiveOverview) {
    return {
      performanceSummary: {
        completionRate: Math.round((overview.summary.completed / overview.summary.totalInitiatives) * 100),
        totalCompleted: overview.summary.completed,
        totalActive: overview.summary.active,
        totalDelayed: overview.summary.delayed,
        budgetPct: overview.summary.budgetExecutionPct,
        timePct: overview.summary.timeOnTrackPct,
        qualityPct: overview.summary.qualityAvgPct
      },
      topAchievements: [
        `إنجاز ${overview.summary.completed} مبادرة طريق مجتمعية في كافة المديريات`,
        `سفلتة ورصف أكثر من ${overview.summary.totalRoadsKmCompleted} كم طولي في العقبات الوعرة`,
        `تعبئة مساهمات مجتمعية تتجاوز ${(overview.summary.communityContributionAmount / 1000000000).toFixed(2)} مليار ريال`,
        `تغطية 18 مديرية نشطة بآلية الرفع الفني والتوثيق الميداني المباشر`
      ],
      keyChallenges: overview.priorityIssues.slice(0, 3).map(i => i.reason),
      topRisks: overview.priorityIssues.filter(i => i.priority === 'CRITICAL').slice(0, 3),
      urgentDecisions: overview.decisionsRequired.filter(d => d.priority === 'CRITICAL' || d.priority === 'HIGH'),
      periodDelta: overview.recentChanges
    };
  }

  /**
   * 3. Governor View Selector (المحافظ)
   * Focus: Strategic governorate picture, high-level KPIs, map & geographic balance, macro impact, no micro noise
   */
  public static getGovernorData(overview: ExecutiveOverview) {
    return {
      governorateMetrics: {
        totalInitiatives: overview.summary.totalInitiatives,
        totalBeneficiaries: overview.summary.totalBeneficiaries,
        totalKmRoads: overview.summary.totalRoadsKmCompleted,
        totalCommunityValue: overview.summary.communityContributionAmount,
        activeDistrictsCount: overview.geographicInsights.activeDistrictsCount,
        governorateCentersCount: overview.geographicInsights.governorateCentersCount,
        satisfactionRate: 96.5
      },
      geographicHighlights: overview.geographicInsights,
      strategicInsights: overview.recommendations.filter(r => r.category === 'COMMUNITY_ENGAGEMENT' || r.category === 'SUPPLY_CHAIN'),
      macroIssues: overview.priorityIssues.filter(i => i.criticalityScore >= 75).slice(0, 4)
    };
  }

  /**
   * 4. Operational View Selector (المدير الميداني)
   * Focus: Field initiatives, material supply needs, engineer assessments, immediate interventions
   */
  public static getOperationalData(overview: ExecutiveOverview) {
    return {
      activeInitiativesCount: overview.summary.active,
      delayedInitiativesCount: overview.summary.delayed,
      fieldIssues: overview.priorityIssues,
      materialSuppliesNeeded: [
        { item: 'أسمنت دعم حكومي', quantity: '12,500 كيس', priority: 'عالية' },
        { item: 'ديزل للمعدات', quantity: '28,000 لتر', priority: 'حرجة' },
        { item: 'عبارات خرسانية وقوالب', quantity: '40 قطعة', priority: 'متوسطة' }
      ],
      districtsNeedingEngineers: overview.geographicInsights.criticalDistricts
    };
  }

  /**
   * 5. Public Impact View Selector (الزائر / المشاركة المجتمعية)
   * Focus: Public transparency, what we do, where we work, achievements, community stories
   */
  public static getPublicImpactData(overview: ExecutiveOverview) {
    return {
      heroStats: {
        initiativesCount: overview.summary.totalInitiatives,
        completedCount: overview.summary.completed,
        roadsKmCompleted: overview.summary.totalRoadsKmCompleted,
        beneficiariesCount: overview.summary.totalBeneficiaries,
        activeDistricts: overview.geographicInsights.activeDistrictsCount
      },
      topDistrictsProgress: overview.geographicInsights.topDistricts,
      communityImpactValue: overview.summary.communityContributionAmount,
      completedHighlights: overview.ledgerTrace.filter(l => l.status === 'VERIFIED_IMPACT' || l.status === 'EXECUTING')
    };
  }
}
