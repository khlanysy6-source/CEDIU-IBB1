/**
 * Executive Experience Layer - Core Type Definitions
 * Designed for Decision Intelligence Platform for Development Initiatives
 */

export type ExecutiveRoleView = 
  | 'executive_manager' // المدير التنفيذي
  | 'executive_brief'   // رئيس الوحدة (الإيجاز التنفيذي)
  | 'governor'          // المحافظ (الرؤية الاستراتيجية)
  | 'operational'       // المدير الميداني (التشغيل والمتابعة)
  | 'public';           // الزائر / المشاركة المجتمعية (الأثر)

export interface ExecutiveMetrics {
  totalInitiatives: number;
  completed: number;
  active: number;
  delayed: number;
  critical: number;
  // Golden Triangle Metrics (المثلث الذهبي)
  budgetExecutionPct: number; // الميزانية
  timeOnTrackPct: number;     // الوقت
  qualityAvgPct: number;      // الجودة
  totalBeneficiaries: number;
  totalRoadsKmCompleted: number;
  communityContributionAmount: number;
}

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface PriorityIssue {
  id: string;
  initiativeId: string;
  title: string;
  district: string;
  status: string;
  reason: string;
  impact: string;
  recommendation: string;
  requiredAction: string;
  priority: PriorityLevel;
  criticalityScore: number; // 0 - 100
  affectedBeneficiaries: number;
  delayDays: number;
  responsibleParty: string;
}

export interface ExecutiveDecision {
  id: string;
  title: string;
  priority: PriorityLevel;
  responsibleRole: string;
  dueDate: string;
  initiativeId?: string;
  district?: string;
  status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'RESOLVED';
  impactLevel: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  description: string;
  estimatedCostImpact?: number;
}

export interface PeriodChange {
  id: string;
  type: 'IMPROVED' | 'DECLINED' | 'STABLE';
  metric: string;
  detail: string;
  valueChange: string;
  periodText: string;
}

export interface GeographicInsight {
  districtName: string;
  totalInitiatives: number;
  completedCount: number;
  activeCount: number;
  delayedCount: number;
  completionRate: number;
  isGovernorateCenter?: boolean;
  statusText: string;
}

export interface ExecutiveInsight {
  id: string;
  insight: string;
  evidence: string[];
  recommendation: string;
  decisionRequired: string;
  category: 'SUPPLY_CHAIN' | 'FIELD_DELAY' | 'QUALITY_RISK' | 'BUDGET_EFFICIENCY' | 'COMMUNITY_ENGAGEMENT';
  impactScore: number;
  relatedDistrict?: string;
}

export interface DecisionLedgerItem {
  id: string;
  problem: string;
  evidence: string[];
  recommendation: string;
  decision: string;
  action: string;
  impact: string;
  status: 'IDENTIFIED' | 'DECIDED' | 'EXECUTING' | 'VERIFIED_IMPACT';
  dateAdded: string;
  initiativeTitle?: string;
  district?: string;
}

export interface ExecutiveOverview {
  summary: ExecutiveMetrics;
  healthStatus: 'EXCELLENT' | 'STABLE' | 'WARNING' | 'CRITICAL';
  priorityIssues: PriorityIssue[];
  decisionsRequired: ExecutiveDecision[];
  recentChanges: PeriodChange[];
  performanceTrend: {
    monthlyProgress: { month: string; completed: number; active: number }[];
    speedIndex: number;
  };
  geographicInsights: {
    topDistricts: GeographicInsight[];
    criticalDistricts: GeographicInsight[];
    activeDistrictsCount: number;
    governorateCentersCount: number;
    allDistricts: GeographicInsight[];
  };
  recommendations: ExecutiveInsight[];
  ledgerTrace: DecisionLedgerItem[];
}
