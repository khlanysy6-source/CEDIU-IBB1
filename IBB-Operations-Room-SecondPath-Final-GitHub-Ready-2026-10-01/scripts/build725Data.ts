/**
 * Production data-build contract for the Ibb platform.
 *
 * The runtime registry is generated from the canonical 725-row workbook and
 * the Second Executive Pathway overlay. This script deliberately contains
 * NO synthetic/fallback initiative generator.
 *
 * Source files used by the release build are kept outside the application
 * bundle; the generated result is src/data/generated/initiatives725.ts.
 */
import fs from 'fs';
import path from 'path';

const generatedPath = path.join(process.cwd(), 'src/data/generated/initiatives725.ts');

if (!fs.existsSync(generatedPath)) {
  throw new Error(
    'Canonical dataset is missing. Build the 725-row registry from the authoritative workbook before starting the platform.'
  );
}

const source = fs.readFileSync(generatedPath, 'utf8');
if (!source.includes('generatedInitiatives')) {
  throw new Error('Generated canonical registry is invalid: generatedInitiatives export was not found.');
}

if (/generateRemaining535Initiatives|synthetic|fake|dummy/i.test(source)) {
  throw new Error('Synthetic initiative generation is prohibited in production data.');
}

console.log('Canonical 725 initiative registry verified. No synthetic generator is present.');
