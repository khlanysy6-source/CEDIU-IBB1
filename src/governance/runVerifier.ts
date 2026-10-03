/**
 * EXECUTION-03 — Governance Verification Runner
 */

import { runGovernanceVerification } from './governanceVerifier';

const report = runGovernanceVerification();

console.log('=== EXECUTION-03 VERIFICATION REPORT ===');
console.log('All Tests Passed:', report.allPassed);
console.log('Total Canonical Initiatives Analyzed:', report.totalCanonicalInitiatives);
console.log('Governance Profiles Generated:', report.profilesGeneratedCount);
console.log('\n--- VERIFICATION TESTS ---');
console.log(JSON.stringify(report.tests, null, 2));

console.log('\n--- GOVERNANCE METRICS ---');
console.log(JSON.stringify(report.metrics, null, 2));

console.log('\n--- TOP 10 ISSUE CLUSTERS ---');
console.log(JSON.stringify(report.top10IssueClustersSummary, null, 2));

console.log('\n--- DECISION QUEUE (TOP 10) ---');
console.log(JSON.stringify(report.decisionQueueSummary.slice(0, 10), null, 2));

console.log('\n--- 10 DIVERSE GOVERNANCE PROFILES ---');
console.log(JSON.stringify(report.sample10DiverseProfiles, null, 2));
