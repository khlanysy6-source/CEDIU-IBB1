/**
 * Canonical Imported Initiatives (SSoT)
 * Unified wrapper re-exporting from src/data/index.ts
 */

import { generatedInitiatives } from './data/generated/initiatives725';
import { canonicalizeInitiativeRecord } from './data/normalizeInitiative';

export { canonicalizeInitiativeRecord };
export const importedInitiatives = generatedInitiatives;
export const IMPORTED_SHEETS_INITIATIVES = generatedInitiatives;
export default generatedInitiatives;
