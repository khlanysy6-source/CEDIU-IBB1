/**
 * EXECUTION-03 — Governance Profile Engine
 * Main orchestrator assembling Governance Profiles and the Executive Brief across the canonical dataset.
 * Uses memoization/caching for zero-overhead React rendering performance.
 */

import { Initiative } from '../types';
import { buildExecutiveDecisionProfile } from '../intelligence/decisionProfileEngine';
import { deriveSituationAndProblem } from './problemEngine';
import { deriveRootCause } from './rootCauseEngine';
import { deriveImpact } from './impactEngine';
import { deriveIntervention } from './interventionEngine';
import { resolveOwner } from './ownerResolver';
import { deriveExecutiveAction } from './executiveActionEngine';
import { deriveExpectedOutcome } from './outcomeEngine';
import { deriveFollowUp } from './followUpEngine';
import { deriveGovernanceStatusAndEscalation } from './closureEngine';
import { generateIssueClusters } from './issueClusterEngine';
import { generateDecisionQueue } from './decisionQueueEngine';
import {
  GovernanceProfile,
  ExecutiveBrief,
  SeverityLevel,
  PriorityLevel,
  RootCauseCategory,
} from './types';

// Memoization cache
let cachedInitiativesInput: Initiative[] | null = null;
let cachedProfiles: GovernanceProfile[] | null = null;
let cachedExecutiveBrief: ExecutiveBrief | null = null;

export function buildGovernanceProfile(initiative: Initiative): GovernanceProfile {
  const execProfile = buildExecutiveDecisionProfile(initiative);

  const { situation, problem } = deriveSituationAndProblem(initiative, execProfile);
  const rootCause = deriveRootCause(initiative, execProfile);
  const impact = deriveImpact(initiative, execProfile);
  const intervention = deriveIntervention(initiative, execProfile, rootCause, impact);
  const owner = resolveOwner(initiative, rootCause, intervention);
  const executiveAction = deriveExecutiveAction(initiative, intervention, owner);
  const expectedOutcome = deriveExpectedOutcome(initiative, intervention);
  const followUp = deriveFollowUp(initiative, intervention);

  const severityLevel: SeverityLevel = execProfile.derived?.severityLevel || 'MEDIUM';
  const priorityLevel: PriorityLevel = execProfile.derived?.priorityLevel || 'MEDIUM';
  const priorityScore: number = typeof execProfile.derived?.priorityScore === 'number'
    ? execProfile.derived.priorityScore
    : 50;

  const { governanceStatus, decisionRequired, escalationRequired, closureCondition } =
    deriveGovernanceStatusAndEscalation(
      initiative,
      priorityLevel,
      impact,
      rootCause,
      intervention,
      expectedOutcome
    );

  const rawEvidence = execProfile.decisionTrace?.evidence;
  const evidenceList: string[] = Array.isArray(rawEvidence) && rawEvidence.length > 0
    ? rawEvidence.map((i) => (typeof i === 'string' ? i : String(i)))
    : ['تم استخلاص الأدلة من البيانات الأصلية ومؤشرات الأداء الميداني'];

  const dataConflictsList = Array.isArray(execProfile.derived?.dataConflicts)
    ? execProfile.derived.dataConflicts
    : [];

  return {
    initiativeId: initiative.id,
    initiativeName: initiative.name,
    district: initiative.district,
    subDistrict: initiative.subDistrict,
    village: initiative.village,
    originalStatus: initiative.status || 'unknown',
    completionRate: initiative.completionRate ?? 0,

    situation,
    problem,
    rootCause,
    impact,

    severity: severityLevel,
    priority: priorityLevel,
    priorityScore: priorityScore,

    intervention,
    owner,

    executiveAction,
    expectedOutcome,

    followUp,
    closureCondition,

    governanceStatus,
    decisionRequired,
    escalationRequired,

    evidence: evidenceList,
    confidence: execProfile.derived?.confidence || 'HIGH',
    dataConflicts: dataConflictsList,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    engineVersion: '3.0.0-governance-v2',
  };
}

export function buildAllGovernanceProfiles(initiatives: Initiative[]): GovernanceProfile[] {
  if (cachedInitiativesInput === initiatives && cachedProfiles) {
    return cachedProfiles;
  }

  const profiles = initiatives.map((item) => buildGovernanceProfile(item));

  cachedInitiativesInput = initiatives;
  cachedProfiles = profiles;
  cachedExecutiveBrief = null; // Invalidate brief cache

  return profiles;
}

export function buildExecutiveBrief(initiatives: Initiative[]): ExecutiveBrief {
  if (cachedInitiativesInput === initiatives && cachedExecutiveBrief) {
    return cachedExecutiveBrief;
  }

  const profiles = buildAllGovernanceProfiles(initiatives);

  const severityBreakdown: Record<SeverityLevel, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  const priorityBreakdown: Record<PriorityLevel, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  const rootCauseBreakdown: Record<RootCauseCategory, number> = {
    Supply: 0,
    Funding: 0,
    Technical: 0,
    Administrative: 0,
    Documentation: 0,
    Community: 0,
    Land: 0,
    Procurement: 0,
    Contractor: 0,
    Weather: 0,
    Other: 0,
    Unknown: 0,
  };

  let decisionRequiredCount = 0;
  let escalatedCount = 0;
  let openCasesCount = 0;
  let closedCasesCount = 0;

  profiles.forEach((p) => {
    severityBreakdown[p.severity] = (severityBreakdown[p.severity] || 0) + 1;
    priorityBreakdown[p.priority] = (priorityBreakdown[p.priority] || 0) + 1;
    rootCauseBreakdown[p.rootCause.category] = (rootCauseBreakdown[p.rootCause.category] || 0) + 1;

    if (p.decisionRequired) decisionRequiredCount++;
    if (p.escalationRequired) escalatedCount++;
    if (p.governanceStatus === 'CLOSED') closedCasesCount++;
    else openCasesCount++;
  });

  // Top 10 critical profiles sorted by priorityScore descending
  const sortedProfiles = [...profiles].sort((a, b) => b.priorityScore - a.priorityScore);
  const top10CriticalProfiles = sortedProfiles.slice(0, 10);

  const issueClusters = generateIssueClusters(profiles);
  const decisionQueue = generateDecisionQueue(profiles, issueClusters);

  const brief: ExecutiveBrief = {
    totalInitiatives: initiatives.length,
    governanceProfilesCount: profiles.length,
    decisionRequiredCount,
    escalatedCount,
    openCasesCount,
    closedCasesCount,
    severityBreakdown,
    priorityBreakdown,
    rootCauseBreakdown,
    top10CriticalProfiles,
    decisionQueue,
    issueClusters,
    generatedAt: new Date().toISOString(),
    engineVersion: '3.0.0-governance-v2',
  };

  cachedExecutiveBrief = brief;
  return brief;
}
