import openpyxl, json, re, unicodedata
from rapidfuzz.fuzz import token_set_ratio, ratio
from pathlib import Path

ROOT=Path('/mnt/data/platform_today')
X=Path('/mnt/data/شطب اسمنت وديزل بحسب المديرية الاخيير قابل للاضافة.xlsx')
INIT=ROOT/'src/data/generated/initiatives725.ts'
# parse minimal JSON-ish objects via regex fields
text=INIT.read_text(encoding='utf-8')
objs=re.findall(r'\{\n(.*?)\n  \}', text, re.S)
inits=[]
for o in objs:
    def g(k):
      m=re.search(r'"'+re.escape(k)+r'":\s*"(.*?)"',o)
      return m.group(1) if m else ''
    inits.append({'id':g('id'),'number':g('initiativeNumber'),'name':g('name'),'district':g('district')})

def norm(s):
    s='' if s is None else str(s)
    s=unicodedata.normalize('NFKC',s)
    s=s.replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ى','ي').replace('ة','ه').replace('ؤ','و').replace('ئ','ي')
    s=re.sub(r'[\u064B-\u065F\u0670]','',s)
    s=re.sub(r'[^\w\s\u0600-\u06FF]',' ',s,flags=re.UNICODE)
    s=re.sub(r'\b(طريق|رصف|صيانة|تاهيل|اعاده|اعمال|مرحله|المرحله|الاولى|الثانيه|الثالثه|الاول|الثاني|الثالث)\b',' ',s)
    s=re.sub(r'\s+',' ',s).strip()
    return s

idx={}
for i in inits:
    idx.setdefault(norm(i['name']),[]).append(i)

def match(name,district):
    nn=norm(name)
    if not nn or nn.startswith('توريد ماده') or nn.startswith('توريد كميه') or 'مخازن' in nn and 'طريق' not in nn:
        return None,0,'stock'
    exact=idx.get(nn)
    if exact:
        ds=[x for x in exact if norm(x['district']) in norm(district) or norm(district) in norm(x['district'])]
        return (ds[0] if ds else exact[0]),100,'exact'
    best=None; bs=0
    for i in inits:
        ds=token_set_ratio(norm(i['district']),norm(district)) if district else 0
        ns=token_set_ratio(nn,norm(i['name']))
        score=0.82*ns+0.18*ds
        if score>bs: bs=score; best=i
    return (best if bs>=82 else None),round(bs,2),'fuzzy' if bs>=82 else 'unmatched'

wb=openpyxl.load_workbook(X,data_only=True,read_only=False)
records=[]
summary={'diesel':{'rows':0,'matched':0,'unmatched':0,'stock':0},'cement':{'rows':0,'matched':0,'unmatched':0,'stock':0}}
for kind,ws in [('diesel',wb.worksheets[0]),('cement',wb.worksheets[1])]:
    for r in range(4,ws.max_row+1):
        name=ws.cell(r,4).value
        if not name: continue
        district=ws.cell(r,5).value or ''
        m,score,method=match(name,district)
        # quantities: D/E... indexed 1-based
        def v(c): return ws.cell(r,c).value
        rec={
          'kind':kind,'sourceRow':r,'date':v(2).isoformat() if hasattr(v(2),'isoformat') else (str(v(2)) if v(2) is not None else ''),
          'orderNo':str(v(3)) if v(3) is not None else '', 'projectName':str(name).strip(), 'district':str(district).strip(),
          'program':str(v(6) or ''),'sector':str(v(7) or ''),'stage':str(v(8) or ''),'batch':str(v(9) or ''),
          'recipient':str(v(10) or '').strip(),'recipientRole':str(v(11) or '').strip(),'phone':str(v(12) or ''),
          'sourceStore':str(v(13) or '').strip(), 'incomingQty':v(14) or 0,'incomingPrice':v(15) or 0,'incomingTotal':v(16) or 0,
          'outgoingQty':v(17) or 0,'outgoingPrice':v(18) or 0,'outgoingTotal':v(19) or 0,
          'balanceQty':v(20) or 0,'balancePrice':v(21) or 0,'balanceTotal':v(22) or 0,
          'projectCost':v(23) or 0,
          'extraCost1':v(24) or 0 if kind=='cement' else 0,
          'extraCost2':v(25) or 0 if kind=='cement' else 0,
          'notes':str(v(26 if kind=='cement' else 25) or '').strip(),
          'initiativeId':m['id'] if m else None,'initiativeNumber':m['number'] if m else None,'matchScore':score,'matchMethod':method
        }
        records.append(rec)
        summary[kind]['rows']+=1
        summary[kind][{'exact':'matched','fuzzy':'matched','stock':'stock','unmatched':'unmatched'}[method]]+=1

out=ROOT/'src/data/materialLedgers.ts'
with out.open('w',encoding='utf-8') as f:
    f.write('/** Generated from the official cement/diesel shatb ledger workbook. Do not hand-edit. */\n')
    f.write('export type MaterialLedgerKind = "cement" | "diesel";\n')
    f.write('export interface MaterialLedgerTransaction { kind: MaterialLedgerKind; sourceRow:number; date:string; orderNo:string; projectName:string; district:string; program:string; sector:string; stage:string; batch:string; recipient:string; recipientRole:string; phone:string; sourceStore:string; incomingQty:number; incomingPrice:number; incomingTotal:number; outgoingQty:number; outgoingPrice:number; outgoingTotal:number; balanceQty:number; balancePrice:number; balanceTotal:number; projectCost:number; extraCost1:number; extraCost2:number; notes:string; initiativeId:string|null; initiativeNumber:string|null; matchScore:number; matchMethod:"exact"|"fuzzy"|"stock"|"unmatched"; }\n')
    f.write('export const materialLedgerTransactions: MaterialLedgerTransaction[] = ')
    f.write(json.dumps(records,ensure_ascii=False,separators=(',',':'),default=str))
    f.write(';\n')
    f.write('export const materialLedgerSummary = '+json.dumps(summary,ensure_ascii=False,separators=(',',':'))+' as const;\n')
print(summary)
print('records',len(records),'file',out)
