import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const required=[
 'src/App.tsx','src/permissions.ts','src/navigation/operatingModel.ts','src/forms/formRegistry.ts','src/forms/formDataResolver.ts',
 'src/data/materialLedgers.ts','public/templates/second-path-master-template.xlsx','public/data/ibb-road-tracks.json','public/data/ibb-governorate-boundary.json'
];
const missing=required.filter(p=>!fs.existsSync(path.join(root,p)));
if(missing.length) throw new Error(`Missing release files: ${missing.join(', ')}`);
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if(!pkg.scripts?.build || !pkg.scripts?.lint) throw new Error('Build/lint scripts missing');
const forms=fs.statSync(path.join(root,'public/templates/second-path-master-template.xlsx')).size;
if(forms<1000000) throw new Error('Original Excel template is unexpectedly small');
const ledger=fs.readFileSync(path.join(root,'src/data/materialLedgers.ts'),'utf8');
if(!ledger.includes('export const materialLedgerTransactions')) throw new Error('Material ledger export missing');
const flow=fs.readFileSync(path.join(root,'src/navigation/operatingModel.ts'),'utf8');
for(const token of ['initiatives','forms_portal','field_staging','matching_results','decision_center','matrix','interactive_map']) if(!flow.includes(`tab:'${token}'`)) throw new Error(`Canonical flow missing ${token}`);
console.log(JSON.stringify({ok:true,version:pkg.version,formTemplateBytes:forms,canonicalFlow:true},null,2));
