/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Initiative } from '../types';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type BottleneckCategory = 
  | 'CEMENT_DIESEL_SUPPLY'
  | 'COMMUNITY_FINANCING'
  | 'GEOGRAPHICAL_TERRAIN'
  | 'EQUIPMENT_MACHINERY'
  | 'TECHNICAL_PERMIT'
  | 'AWAITING_FIELD_SURVEY'
  | 'CLOSEOUT_DOCUMENTATION'
  | 'NONE';

export interface FactData {
  initiativeId: string;
  initiativeNumber: string;
  name: string;
  originalStatus: string;
  completionRate: number;
  cost: number;
  communityContribution: number;
  unitContribution: number;
  district: string;
  governorate: string;
  subDistrict?: string;
  village?: string;
  ownerConfirmed?: boolean;
}

export interface ExtractedEvidence {
  hasFieldNotes: boolean;
  fieldNotesText: string[];
  stagnationReasonText?: string;
  atRiskMaterials: string[];
  fieldReportChallenges: string[];
  fieldReportAchievements: string[];
  identifiedBottleneck: BottleneckCategory;
  hasRecentFieldSurvey: boolean;
  communityCommitmentRate: number; // percentage
}

export interface DataConflict {
  type: 
    | 'STATUS_PROGRESS_CONFLICT'
    | 'STATUS_NOTES_CONFLICT'
    | 'APPROVAL_STATUS_CONFLICT'
    | 'COST_CONTRIBUTION_MISMATCH'
    | 'MISSING_CRITICAL_FIELDS';
  severity: 'warning' | 'error' | 'info';
  message: string;
  fields: string[];
}

export interface DerivedMetrics {
  normalizedStatus: 'ongoing' | 'completed' | 'stagnant' | 'stopped' | 'pending' | 'review';
  operationalCondition: 
    | 'CRITICAL_STAGNATION' 
    | 'PARTIAL_STAGNATION' 
    | 'ACTIVE_PROGRESS' 
    | 'COMPLETED_CLOSED' 
    | 'AWAITING_FIELD_SURVEY';
  primaryCause: string;
  decisionNeed: boolean;
  severityScore: number; // 0 - 100
  severityLevel: SeverityLevel;
  priorityScore: number; // 0 - 100
  priorityLevel: PriorityLevel;
  rankingReason: string;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0 - 100
  dataConflicts: DataConflict[];
}

export interface Recommendation {
  actionCode: string;
  title: string;
  summary: string;
  targetInterventions: string[];
  responsibleEntity: 'وحدة التدخلات المركزية' | 'السلطة المحلية بالمديرية' | 'الجمعية التعاونية' | 'المهندس المشرف' | 'لجنة المبادرة المجتمعية';
}

export interface DecisionTrace {
  decision: string;
  reasons: string[];
  evidence: string[];
  confidence: ConfidenceLevel;
  requiredInterventions: string[];
  generatedAt: string;
  engineVersion: string;
}

export interface ExecutiveDecisionRecord {
  decisionId: string;
  decisionBy: string;
  decisionRole: string;
  actionTaken: string;
  timestamp: string;
  notes?: string;
}

/**
 * Derived Executive Decision Profile for each Initiative
 * Stores all fact, evidence, derived, trace, and recommendation metrics.
 * Original initiative object is NEVER modified!
 */
export interface ExecutiveDecisionProfile {
  initiativeId: string;
  initiativeNumber: string;
  initiativeName: string;
  district: string;
  governorate: string;
  facts: FactData;
  evidence: ExtractedEvidence;
  derived: DerivedMetrics;
  recommendation: Recommendation;
  decisionTrace: DecisionTrace;
  executiveDecisions: ExecutiveDecisionRecord[];
  rawInitiative: Initiative; // Reference to intact original object
  generatedAt: string;
  engineVersion: string;
}

export type DecisionProfile = ExecutiveDecisionProfile;
