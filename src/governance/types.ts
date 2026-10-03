/**
 * EXECUTION-03 — Governance & Intervention Engine Types
 * Pure TypeScript contract definitions for the Governance Layer.
 */

import { Initiative } from '../types';
import { DecisionProfile, SeverityLevel, PriorityLevel, DataConflict } from '../intelligence/types';
export type { SeverityLevel, PriorityLevel, DataConflict };

export type RootCauseCategory =
  | 'Supply'
  | 'Funding'
  | 'Technical'
  | 'Administrative'
  | 'Documentation'
  | 'Community'
  | 'Land'
  | 'Procurement'
  | 'Contractor'
  | 'Weather'
  | 'Other'
  | 'Unknown';

export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type InterventionType =
  | 'SUPPLY_INTERVENTION'
  | 'TECHNICAL_ASSESSMENT'
  | 'DOCUMENTATION_CLOSURE'
  | 'COMMUNITY_MEDIATION'
  | 'FINANCIAL_ALLOCATION'
  | 'FIELD_EVALUATION'
  | 'ADMINISTRATIVE_DECISION'
  | 'CONTRACTOR_REPLACEMENT'
  | 'NONE_REQUIRED';

export type OwnerType =
  | 'GOVERNORATE_LEADERSHIP'
  | 'CENTRAL_UNIT'
  | 'DISTRICT_DIRECTORATE'
  | 'ENGINEERING_COMMITTEE'
  | 'COMMUNITY_ASSOCIATION'
  | 'CONTRACTOR_SUPPLIER'
  | 'OWNER_UNRESOLVED';

export type ExecutiveActionType =
  | 'DIRECTIVE_ISSUANCE'
  | 'PROCUREMENT_APPROVAL'
  | 'TECHNICAL_INSPECTION_ORDER'
  | 'DOCUMENTATION_SIGN_OFF'
  | 'COMMUNITY_RECONCILIATION'
  | 'MONITORING_ONLY'
  | 'NO_ACTION_NEEDED';

export type LeadershipRole = 'executive' | 'unit_head' | 'governor' | 'local_director' | 'engineer' | 'visitor';

export type GovernanceStatus =
  | 'OBSERVED'
  | 'ASSESSED'
  | 'DECISION_REQUIRED'
  | 'DECISION_MADE'
  | 'INTERVENTION_ASSIGNED'
  | 'IN_PROGRESS'
  | 'OUTCOME_REVIEW'
  | 'CLOSED'
  | 'ESCALATED';

export interface Situation {
  description: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceSummary: string[];
}

export interface Problem {
  summary: string;
  category: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  hasClearDefinition: boolean;
}

export interface RootCause {
  category: RootCauseCategory;
  description: string;
  evidence: string[];
  isDefinite: boolean;
}

export interface Impact {
  level: ImpactLevel;
  reason: string;
  valueAtRiskEstYR: number;
  beneficiariesEst: number;
  strategicWeight: number;
}

export interface Intervention {
  type: InterventionType;
  title: string;
  description: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiredAuthority: string;
  expectedEffect: string;
}

export interface Owner {
  type: OwnerType;
  name: string;
  scope: string;
  reason: string;
}

export interface ExecutiveAction {
  actionType: ExecutiveActionType;
  actionText: string;
  requiredRole: LeadershipRole;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ExpectedOutcome {
  outcomeText: string;
  evidenceRequired: string[];
  closureCriteria: string;
}

export interface FollowUp {
  required: boolean;
  type: 'EVENT_BASED' | 'PERIODIC' | 'MILESTONE';
  condition: string;
  nextReviewTrigger: string;
}

export interface GovernanceProfile {
  initiativeId: string;
  initiativeName: string;
  district: string;
  subDistrict?: string;
  village?: string;
  originalStatus: string;
  completionRate: number;

  situation: Situation;
  problem: Problem;
  rootCause: RootCause;
  impact: Impact;

  severity: SeverityLevel;
  priority: PriorityLevel;
  priorityScore: number;

  intervention: Intervention;
  owner: Owner;

  executiveAction: ExecutiveAction;
  expectedOutcome: ExpectedOutcome;

  followUp: FollowUp;
  closureCondition: string;

  governanceStatus: GovernanceStatus;
  decisionRequired: boolean;
  escalationRequired: boolean;

  evidence: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  dataConflicts: DataConflict[];

  createdAt: string;
  updatedAt: string;
  engineVersion: string;
}

export interface IssueCluster {
  clusterId: string;
  title: string;
  description: string;
  affectedInitiatives: { id: string; name: string; district: string }[];
  affectedCount: number;
  districts: string[];
  sectors: string[];
  severity: SeverityLevel;
  priority: PriorityLevel;
  priorityScore: number;
  commonCause: RootCauseCategory;
  recommendedIntervention: Intervention;
  responsibleOwner: Owner;
  executiveAction: ExecutiveAction;
  expectedOutcome: ExpectedOutcome;
  escalationRequired: boolean;
}

export interface DecisionQueueItem {
  decisionId: string;
  title: string;
  problemSummary: string;
  affectedInitiatives: { id: string; name: string; district: string }[];
  affectedCount: number;
  impact: Impact;
  priority: PriorityLevel;
  priorityScore: number;
  recommendedAction: string;
  requiredRole: LeadershipRole;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expectedOutcome: string;
  evidence: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  isCluster: boolean;
}

export interface ExecutiveBrief {
  totalInitiatives: number;
  governanceProfilesCount: number;
  decisionRequiredCount: number;
  escalatedCount: number;
  openCasesCount: number;
  closedCasesCount: number;

  severityBreakdown: Record<SeverityLevel, number>;
  priorityBreakdown: Record<PriorityLevel, number>;
  rootCauseBreakdown: Record<RootCauseCategory, number>;

  top10CriticalProfiles: GovernanceProfile[];
  decisionQueue: DecisionQueueItem[];
  issueClusters: IssueCluster[];
  generatedAt: string;
  engineVersion: string;
}
