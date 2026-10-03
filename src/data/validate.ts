/**
 * Initiative Data Validation Guard
 */

import { Initiative } from '../types';

export function validateInitiative(init: Initiative): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!init.id) errors.push('معرف المبادرة مفقود');
  if (!init.name) errors.push('اسم المبادرة مفقود');
  if (!init.district) errors.push('المديرية مفقودة');

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateInitiativesBatch(initiatives: Initiative[]): { validCount: number; invalidCount: number } {
  let validCount = 0;
  let invalidCount = 0;

  for (const init of initiatives) {
    if (validateInitiative(init).isValid) {
      validCount++;
    } else {
      invalidCount++;
    }
  }

  return { validCount, invalidCount };
}
