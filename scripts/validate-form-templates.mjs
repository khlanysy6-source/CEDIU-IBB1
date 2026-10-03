import fs from 'fs';
import { execFileSync } from 'child_process';
const file='public/templates/second-path-master-template.xlsx';
if(!fs.existsSync(file)) throw new Error('Original form template missing');
const size=fs.statSync(file).size;
if(size<1000000) throw new Error('Form template appears incomplete');
console.log(JSON.stringify({ok:true,file,sizeBytes:size},null,2));
