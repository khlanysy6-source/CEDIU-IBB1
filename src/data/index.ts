/**
 * Unified Data Entry Point
 * Ibb Road Community Initiatives Platform (SSoT)
 */

export * from './schema';
export * from './normalizeInitiative';
export * from './validate';
export * from './derivedMetrics';
export * from './repository';
export * from './metricsDictionary';
export * from '../utils/calculationTruthEngine';
export * from '../utils/developmentDecisionEngine';

export { generatedInitiatives as importedInitiatives, generatedInitiatives as IMPORTED_SHEETS_INITIATIVES } from './generated/initiatives725';
export { generatedInitiatives } from './generated/initiatives725';
