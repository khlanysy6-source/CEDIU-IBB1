/**
 * Build the canonical initiative dataset directly from the Excel source:
 * public/templates/second-path-master-template.xlsx
 *
 * Source of truth: sheet "مصفوفة الفرز".
 * No synthetic initiatives are created.
 */
import fs from 'node:fs';
import path from 'node:path';
import * as XLSX from 'xlsx';

const ROOT = process.cwd();
const workbookPath = path.join(ROOT, 'public', 'templates', 'second-path-master-template.xlsx');
const outputPath = path.join(ROOT, 'src', 'data', 'generated', 'initiatives725.ts');

const DUPLICATE_AFTER_726 = new Set([
  'جسر فاطمة الزهراء للمشاة',
  'استكمال رصف طريق السر',
]);

const sectorFor = (n: number) =>
  n <= 726 ? 'قطاع الطرق' :
  n <= 751 ? 'القطاع الخدمي – مجال التعليم' :
  'قطاع المياه – المياه والصرف الصحي';

const text = (v: unknown) => v == null ? '' : String(v).trim();
const num = (v: unknown) => {
  if (v == null || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const statusFromRow = (row: unknown[]) => {
  const marked = (from: number, to: number) =>
    row.slice(from - 1, to).some(v => text(v).toUpperCase() === 'P' || text(v) === '✓');
  if (marked(9, 10)) return 'completed';
  if (marked(11, 13)) return 'ongoing';
  if (marked(14, 16)) return 'stagnant';
  if (marked(17, 19)) return 'stopped';
  return 'pending';
};

if (!fs.existsSync(workbookPath)) throw new Error(`Missing source workbook: ${workbookPath}`);

const workbook = XLSX.readFile(workbookPath, { cellDates: true });
const sheet = workbook.Sheets['مصفوفة الفرز'];
if (!sheet) throw new Error('Sheet "مصفوفة الفرز" was not found.');

const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: '' });

const sourceRows = rows
  .map(row => row)
  .filter(row => {
    // In مصفوفة الفرز the official initiative sequence is column A.
    // Column B is the initiative name and column CV (index 99) is the code.
    const sortNumber = Number(row[0]);
    return Number.isInteger(sortNumber) && sortNumber >= 1 && sortNumber <= 786 && text(row[1]);
  });

const missingCodeRows = sourceRows.filter(row => {
  const code = text(row[99]);
  return code === '' || code === '0';
});
if (missingCodeRows.length !== 14) throw new Error(`Expected 14 initiatives without a valid code; got ${missingCodeRows.length}.`);
const temporaryNumberByRow = new Map(missingCodeRows.map((row, index) => [row, String(index + 1)]));

const records = sourceRows
  .map(row => ({ sortNumber: Number(row[0]), name: text(row[1]), row }))
  .filter(({ sortNumber, name }) => !(sortNumber > 726 && DUPLICATE_AFTER_726.has(name)))
  .map(({ sortNumber, name, row }) => {
    const rawCode = text(row[99]);
    const code = (rawCode === '' || rawCode === '0') ? (temporaryNumberByRow.get(row) || '') : rawCode;
    const completionRaw = num(row[20]);
    const completionRate = completionRaw >= 0 && completionRaw <= 1 ? completionRaw * 100 : completionRaw;
    const cement = num(row[21]);
    const diesel = num(row[26]);
    const other = num(row[32]);
    const otherUnit = text(row[31]);

    return {
      id: `sort_${sortNumber}`,
      initiativeNumber: code || `SORT-${String(sortNumber).padStart(3, '0')}`,
      name,
      sector: sectorFor(sortNumber),
      subDistrict: text(row[4]),
      village: text(row[5]),
      coordinates: [text(row[6]), text(row[7])].filter(Boolean).join(', '),
      startDate: '',
      endDate: '',
      cost: 0,
      communityContribution: 0,
      unitContribution: 0,
      deliveredUnitContribution: 0,
      completionRate,
      district: text(row[3]),
      governorate: text(row[2]) || 'إب',
      status: statusFromRow(row),
      stagnationReason: text(row[57]),
      ownerConfirmed: false,
      pathways: [],
      contributions: [],
      materials: [
        { id: `sort_${sortNumber}_cement`, name: 'الاسمنت', quantity: cement, unit: 'كيس', status: 'safe', storageLocation: 'غير محدد', updatedAt: '2026-10-05T00:00:00Z' },
        { id: `sort_${sortNumber}_diesel`, name: 'الديزل', quantity: diesel, unit: 'لتر', status: 'safe', storageLocation: 'غير محدد', updatedAt: '2026-10-05T00:00:00Z' },
        { id: `sort_${sortNumber}_other`, name: 'أخرى', quantity: other, unit: otherUnit || 'غير محدد', status: 'safe', storageLocation: 'غير محدد', updatedAt: '2026-10-05T00:00:00Z' }
      ],
      committee: [],
      reports: [],
      createdAt: '2026-09-30T00:00:00Z',
      updatedAt: '2026-10-05T00:00:00Z',
      materialsApproved: String(cement),
      dieselApproved: String(diesel),
      otherMaterialApproved: other,
      otherMaterialUnit: otherUnit,
      resourceSource: 'مصفوفة الفرز',
      title: name,
      matchStatus: 'pending_audit',
      discrepancies: [],
      notes: text(row[58]),
      lifecycleStage: 'current_monitoring',
      decisionCategory: 'ongoing_needs_monitoring',
      evaluation: { readinessLevel: 'not_ready' },
      executiveDecision: {
        requiredAction: 'يحتاج إلى استكمال التشخيص والقرار التنفيذي',
        interventionPriority: 'medium',
        responsibleEntity: 'وحدة التدخلات والجهات المحلية',
        nextFollowUpDate: '',
        executionStatus: 'pending_execution',
        actionNotes: ''
      },
      monitoringTimeline: [],
      secondPath: {
        currentCode: code,
        currentStatus: text(row[57]),
        technicalDescription: text(row[58]),
        cement,
        diesel,
        otherMaterial: other,
        stockStatus: { cement: text(row[62]), diesel: text(row[63]), other: text(row[64]) },
        matchingNote: text(row[65]),
        decision: text(row[82]),
        decisionDetails: text(row[83])
      }
    };
  });

const uniqueById = new Map(records.map(r => [r.id, r]));
const canonical = [...uniqueById.values()].sort(
  (a, b) => Number(a.id.replace('sort_', '')) - Number(b.id.replace('sort_', ''))
);

if (canonical.length !== 784) {
  throw new Error(`Expected 784 imported initiatives after the two post-726 duplicates are removed; got ${canonical.length}.`);
}

const bySector = {
  roads: canonical.filter(r => r.sector === 'قطاع الطرق').length,
  education: canonical.filter(r => r.sector === 'القطاع الخدمي – مجال التعليم').length,
  water: canonical.filter(r => r.sector === 'قطاع المياه – المياه والصرف الصحي').length
};

if (bySector.roads !== 726 || bySector.education !== 23 || bySector.water !== 35) {
  throw new Error(`Sector validation failed: ${JSON.stringify(bySector)}`);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(
  outputPath,
  `/** Canonical dataset generated from مصفوفة الفرز. No synthetic initiatives. */\nimport { Initiative } from '../../types';\nexport const generatedInitiatives: Initiative[] = ${JSON.stringify(canonical, null, 2)};\n`,
  'utf8'
);

console.log(`[Second Path] Imported ${canonical.length} initiatives from مصفوفة الفرز.`);
console.log(`[Second Path] Sectors: roads=${bySector.roads}, education=${bySector.education}, water=${bySector.water}.`);
