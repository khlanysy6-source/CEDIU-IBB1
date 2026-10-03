import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const required = [
  'src/pathway/secondPathModel.ts',
  'src/navigation/operatingModel.ts',
  'src/components/SecondPathNavigator.tsx',
  'src/components/FormsPortal.tsx',
  'src/forms/formRegistry.ts',
  'src/forms/formDataResolver.ts',
  'src/data/materialLedgers.ts',
  'docs/architecture/SECOND_EXECUTIVE_PATHWAY.md',
];
const missing = required.filter(f => !fs.existsSync(path.join(root,f)));
if (missing.length) { console.error('Missing pathway files:', missing.join(', ')); process.exit(1); }
const nav = fs.readFileSync(path.join(root,'src/navigation/operatingModel.ts'),'utf8');
for (const label of ['سجل المبادرات','الدراسات والاعتمادات','سجل الشطب والتوريدات','مستوى الإنجاز والتقييم','الفرز','المخرجات التنفيذية','التنفيذ والمتابعة','الإغلاق والأثر']) {
  if (!nav.includes(label)) { console.error('Missing stage:', label); process.exit(1); }
}
console.log('Second Executive Pathway validation: PASS');
