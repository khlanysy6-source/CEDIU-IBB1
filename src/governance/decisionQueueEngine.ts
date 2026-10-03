/**
 * EXECUTION-03 — Decision Queue Engine
 * Ranks all pending executive decisions strictly by priority score (descending).
 * Excludes closed initiatives or items requiring no action.
 */

import { GovernanceProfile, DecisionQueueItem, IssueCluster } from './types';

export function generateDecisionQueue(
  profiles: GovernanceProfile[],
  clusters: IssueCluster[]
): DecisionQueueItem[] {
  const queue: DecisionQueueItem[] = [];

  // Track initiative IDs covered by issue clusters so we don't duplicate individual cards for clustered items
  const clusteredInitiativeIds = new Set<string>();

  clusters.forEach((cluster) => {
    cluster.affectedInitiatives.forEach((item) => clusteredInitiativeIds.add(item.id));

    queue.push({
      decisionId: cluster.clusterId,
      title: cluster.title,
      problemSummary: cluster.description,
      affectedInitiatives: cluster.affectedInitiatives,
      affectedCount: cluster.affectedCount,
      impact: {
        level: cluster.severity,
        reason: `تؤثر على ${cluster.affectedCount} مبادرة في ${cluster.districts.length} مديرية`,
        valueAtRiskEstYR: 0,
        beneficiariesEst: 0,
        strategicWeight: cluster.severity === 'CRITICAL' ? 10 : 7,
      },
      priority: cluster.priority,
      priorityScore: cluster.priorityScore,
      recommendedAction: cluster.executiveAction.actionText,
      requiredRole: cluster.executiveAction.requiredRole,
      urgency: cluster.executiveAction.urgency,
      expectedOutcome: cluster.expectedOutcome.outcomeText,
      evidence: [
        `تشترك ${cluster.affectedCount} مبادرة في نفس السبب الجذري: ${cluster.commonCause}`,
        `المديريات المتأثرة: ${cluster.districts.join('، ')}`,
      ],
      confidence: 'HIGH',
      isCluster: true,
    });
  });

  // Add individual unclustered initiatives that require decision
  profiles.forEach((p) => {
    if (p.decisionRequired && !clusteredInitiativeIds.has(p.initiativeId) && p.governanceStatus !== 'CLOSED') {
      queue.push({
        decisionId: `dec_${p.initiativeId}`,
        title: `حسم عائق ${p.initiativeName} (${p.district})`,
        problemSummary: p.problem.summary,
        affectedInitiatives: [{ id: p.initiativeId, name: p.initiativeName, district: p.district }],
        affectedCount: 1,
        impact: p.impact,
        priority: p.priority,
        priorityScore: p.priorityScore,
        recommendedAction: p.executiveAction.actionText,
        requiredRole: p.executiveAction.requiredRole,
        urgency: p.executiveAction.urgency,
        expectedOutcome: p.expectedOutcome.outcomeText,
        evidence: p.evidence,
        confidence: p.confidence,
        isCluster: false,
      });
    }
  });

  // Sort strictly by priorityScore descending
  queue.sort((a, b) => b.priorityScore - a.priorityScore);

  return queue;
}
