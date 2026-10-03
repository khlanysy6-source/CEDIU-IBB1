/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Initiative } from '../types';
import { ExecutiveDecisionProfile, FactData } from './types';
import { DataValidationEngine } from './dataValidationEngine';
import { FieldEvidenceExtractor } from './fieldEvidenceExtractor';
import { StatusNormalizationEngine } from './statusNormalization';
import { SeverityEngine } from './severityEngine';
import { PriorityEngine } from './priorityEngine';
import { DecisionConfidenceEngine } from './decisionConfidence';
import { DecisionTraceEngine } from './decisionTrace';
import { parseNum } from '../utils/numberAndDistrictUtils';

// Memory cache for profiles to avoid redundant computation across React re-renders
let cachedProfilesMap = new Map<string, ExecutiveDecisionProfile>();
let cachedDatasetFingerprint = '';

/**
 * Generates a single Executive Decision Profile from an Initiative object.
 * Original initiative object is NEVER altered.
 */
export function buildExecutiveDecisionProfile(initiative: Initiative): ExecutiveDecisionProfile {
  if (!initiative) {
    throw new Error('Cannot build ExecutiveDecisionProfile from null or undefined initiative');
  }

  const initiativeId = initiative.id || `init_${initiative.initiativeNumber || 'unknown'}`;

  // 1. Facts
  const facts: FactData = {
    initiativeId,
    initiativeNumber: initiative.initiativeNumber || '',
    name: initiative.name || 'مبادرة بدون اسم',
    originalStatus: initiative.status || 'مستمر',
    completionRate: parseNum(initiative.completionRate),
    cost: parseNum(initiative.cost),
    communityContribution: parseNum(initiative.communityContribution),
    unitContribution: parseNum(initiative.unitContribution),
    district: initiative.district || 'غير محدد',
    governorate: initiative.governorate || 'إب',
    subDistrict: initiative.subDistrict,
    village: initiative.village,
    ownerConfirmed: initiative.ownerConfirmed
  };

  // 2. Data Conflicts Validation
  const dataConflicts = DataValidationEngine.validate(initiative);

  // 3. Field Evidence Extraction
  const evidence = FieldEvidenceExtractor.extract(initiative);

  // 4. Status Normalization & Cause
  const normalized = StatusNormalizationEngine.normalize(initiative, evidence);

  // 5. Severity Evaluation
  const severity = SeverityEngine.evaluate(initiative, evidence, normalized);

  // 6. Priority Evaluation
  const priority = PriorityEngine.evaluate(initiative, evidence, normalized, severity);

  // 7. Confidence Evaluation
  const confidenceEval = DecisionConfidenceEngine.evaluate(initiative, evidence, dataConflicts);

  // 8. Recommendation & Decision Trace
  const { recommendation, decisionTrace } = DecisionTraceEngine.generateRecommendationAndTrace(
    initiative,
    evidence,
    normalized,
    confidenceEval.confidence
  );

  const profile: ExecutiveDecisionProfile = {
    initiativeId,
    initiativeNumber: facts.initiativeNumber,
    initiativeName: facts.name,
    district: facts.district,
    governorate: facts.governorate,
    facts,
    evidence,
    derived: {
      normalizedStatus: normalized.normalizedStatus,
      operationalCondition: normalized.operationalCondition,
      primaryCause: normalized.primaryCause,
      decisionNeed: normalized.decisionNeed,
      severityScore: severity.severityScore,
      severityLevel: severity.severityLevel,
      priorityScore: priority.priorityScore,
      priorityLevel: priority.priorityLevel,
      rankingReason: priority.rankingReason,
      confidence: confidenceEval.confidence,
      confidenceScore: confidenceEval.confidenceScore,
      dataConflicts
    },
    recommendation,
    decisionTrace,
    executiveDecisions: [],
    rawInitiative: initiative, // Keep reference to untouched original object
    generatedAt: new Date().toISOString(),
    engineVersion: '2.0.0'
  };

  return profile;
}

/**
 * Computes a lightweight fingerprint for an array of initiatives to control cache invalidation
 */
function computeDatasetFingerprint(initiatives: Initiative[]): string {
  if (!Array.isArray(initiatives)) return '0';
  const len = initiatives.length;
  if (len === 0) return '0';
  const firstId = initiatives[0]?.id || '';
  const lastId = initiatives[len - 1]?.id || '';
  const midId = initiatives[Math.floor(len / 2)]?.id || '';
  return `${len}_${firstId}_${midId}_${lastId}`;
}

/**
 * Master Profile Processor V2
 * Converts an array of raw Initiatives into a collection of ExecutiveDecisionProfiles
 * with caching & memoization for high performance on 720+ items.
 */
export function getExecutiveDecisionProfiles(
  initiatives: Initiative[],
  forceRefresh: boolean = false
): ExecutiveDecisionProfile[] {
  if (!Array.isArray(initiatives)) return [];

  const currentFingerprint = computeDatasetFingerprint(initiatives);

  if (!forceRefresh && cachedDatasetFingerprint === currentFingerprint && cachedProfilesMap.size === initiatives.length) {
    return Array.from(cachedProfilesMap.values());
  }

  // Re-calculate profiles efficiently
  const profilesMap = new Map<string, ExecutiveDecisionProfile>();
  const profilesList: ExecutiveDecisionProfile[] = [];

  for (const initiative of initiatives) {
    if (!initiative) continue;
    const profile = buildExecutiveDecisionProfile(initiative);
    profilesMap.set(profile.initiativeId, profile);
    profilesList.push(profile);
  }

  // Update cache
  cachedProfilesMap = profilesMap;
  cachedDatasetFingerprint = currentFingerprint;

  return profilesList;
}

/**
 * Query Helper: Top Critical Initiatives by Priority Score
 */
export function getTopCriticalInitiatives(initiatives: Initiative[], count: number = 10): ExecutiveDecisionProfile[] {
  const profiles = getExecutiveDecisionProfiles(initiatives);
  return PriorityEngine.getTopCriticalInitiatives(profiles, count);
}

/**
 * Query Helper: Initiatives requiring executive decisions
 */
export function getDecisionRequiredInitiatives(initiatives: Initiative[]): ExecutiveDecisionProfile[] {
  const profiles = getExecutiveDecisionProfiles(initiatives);
  return profiles.filter(p => p.derived.decisionNeed);
}

/**
 * Query Helper: Summary of Data Conflicts across dataset
 */
export function getDataConflictsSummary(initiatives: Initiative[]): {
  totalConflicts: number;
  conflictingInitiativesCount: number;
  conflictTypesBreakdown: Record<string, number>;
} {
  const profiles = getExecutiveDecisionProfiles(initiatives);
  let totalConflicts = 0;
  let conflictingInitiativesCount = 0;
  const conflictTypesBreakdown: Record<string, number> = {};

  profiles.forEach(p => {
    if (p.derived.dataConflicts.length > 0) {
      conflictingInitiativesCount++;
      totalConflicts += p.derived.dataConflicts.length;
      p.derived.dataConflicts.forEach(c => {
        conflictTypesBreakdown[c.type] = (conflictTypesBreakdown[c.type] || 0) + 1;
      });
    }
  });

  return {
    totalConflicts,
    conflictingInitiativesCount,
    conflictTypesBreakdown
  };
}

/**
 * Query Helper: Severity Distribution Count
 */
export function getSeverityDistribution(initiatives: Initiative[]): Record<string, number> {
  const profiles = getExecutiveDecisionProfiles(initiatives);
  const dist = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  profiles.forEach(p => {
    dist[p.derived.severityLevel] = (dist[p.derived.severityLevel] || 0) + 1;
  });
  return dist;
}

/**
 * Query Helper: Priority Distribution Count
 */
export function getPriorityDistribution(initiatives: Initiative[]): Record<string, number> {
  const profiles = getExecutiveDecisionProfiles(initiatives);
  const dist = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  profiles.forEach(p => {
    dist[p.derived.priorityLevel] = (dist[p.derived.priorityLevel] || 0) + 1;
  });
  return dist;
}
