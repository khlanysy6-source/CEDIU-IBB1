import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

const workbookPath = path.join(process.cwd(), 'public', 'templates', 'second-path-master-template.xlsx');
const outputPath = path.join(process.cwd(), 'src', 'data', 'generated', 'sortingApprovedResources.ts');

if (!fs.existsSync(workbookPath)) {
  throw new Error(`Canonical workbook template not found: ${workbookPath}`);
}

const workbook = XLSX.readFile(workbookPath, { cellDates: false });
const sheet = workbook.Sheets['مصفوفة الفرز'];
if (!sheet) throw new Error('Sheet "مصفوفة الفرز" was not found.');

const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: null, raw: true });
const clean = (v: unknown) => String(v ?? '').replace(/[\u0000-\u001F]/g, ' ').replace(/\s+/g, ' ').trim();
const norm = (v: unknown) => clean(v)
  .toLowerCase()
  .replace(/[أإآٱ]/g, 'ا')
  .replace(/ى/g, 'ي')
  .replace(/ة/g, 'ه')
  .replace(/[\u064B-\u0652]/g, '');

const num = (v: unknown) => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const n = Number(String(v ?? '').replace(/,/g, '').replace(/٫/g, '.').match(/-?\d+(?:\.\d+)?/)?.[0]);
  return Number.isFinite(n) ? n : 0;
};

const byKey: Record<string, any> = {};
const byNameCandidates: Record<string, any[]> = {};

for (let i = 5; i < rows.length; i++) {
  const row = rows[i] || [];
  const name = clean(row[1]);
  if (!name) continue;

  const record = {
    sourceName: name,
    district: clean(row[3]),
    subDistrict: clean(row[4]),
    cementApproved: num(row[21]), // V
    dieselApproved: num(row[26]), // AA
    otherApproved: num(row[32]), // AG
    otherUnit: clean(row[31]), // AF
  };

  const nameKey = norm(name);
  const key = [nameKey, norm(record.district), norm(record.subDistrict)].join('|');
  byKey[key] = record;
  (byNameCandidates[nameKey] ||= []).push(record);
}

const uniqueByName: Record<string, any> = {};
for (const [key, candidates] of Object.entries(byNameCandidates)) {
  if (candidates.length === 1) uniqueByName[key] = candidates[0];
}

const output = `/** GENERATED at build time from public/templates/second-path-master-template.xlsx. Source: مصفوفة الفرز. */\nexport interface SortingApprovedResources { sourceName: string; district: string; subDistrict: string; cementApproved: number; dieselApproved: number; otherApproved: number; otherUnit: string; }\nexport const SORTING_APPROVED_RESOURCES_BY_KEY: Record<string, SortingApprovedResources> = ${JSON.stringify(byKey, null, 2)};\nexport const SORTING_APPROVED_RESOURCES_BY_NAME: Record<string, SortingApprovedResources> = ${JSON.stringify(uniqueByName, null, 2)};\n`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output, 'utf8');

console.log(`Generated sorting resource source: ${Object.keys(byKey).length} location-keyed rows; ${Object.keys(uniqueByName).length} unique-name rows.`);
