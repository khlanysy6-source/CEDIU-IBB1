#!/usr/bin/env python3
"""Patch only selected Excel cells in the canonical template, preserving the XLSX package."""
import json, sys, zipfile, xml.etree.ElementTree as ET, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
TEMPLATE=ROOT/'public/templates/second-path-master-template.xlsx'
NS='http://schemas.openxmlformats.org/spreadsheetml/2006/main'
RNS='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
ET.register_namespace('',NS); ET.register_namespace('r',RNS)
SHEETS={
'diagnosis':'استمارة التشخيص','readiness':'استمارة فحص الجاهزية','completion':'استمارة تقرير الانجاز النهائي','transfer':'محضر مناقلة واستلام','notice':'إخطار وإشعار اللجنة المجتمعية ','daily':'التقرير اليومي للممثل والشركاء','weekly':'التقرير التجميعي الاسبوعي للمنس','evaluation':'مصفوفة مستوى الانجاز والتقييم','archive':'مصفوفة الارشيف والوثائق','cement_ledger':'مصفوفة سجل الشطب(اسمنت)','diesel_ledger':'مصفوفة سجل الشطب(ديزل)','decision':'استمارة التشخيص'}
STATUS={'completed':'منجزة','ongoing':'قيد التنفيذ','stagnant':'متعثر','stopped':'متوقف','pending':'لم يبدأ'}

def sheet_target(z,name):
    wb=ET.fromstring(z.read('xl/workbook.xml')); rels=ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    rid_to_target={x.attrib['Id']:x.attrib['Target'] for x in rels}
    for sh in wb.find('{%s}sheets'%NS):
        if sh.attrib.get('name')==name:
            t=rid_to_target[sh.attrib['{%s}id'%RNS]]
            return 'xl/'+t.replace('../','').lstrip('/')
    raise KeyError(name)

def esc(v):
    return str(v).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

def patch_cells(xml, changes):
    root=ET.fromstring(xml); sd=root.find('{%s}sheetData'%NS)
    byrow={}
    for row in sd.findall('{%s}row'%NS): byrow[row.attrib['r']]=row
    for ref,val in changes.items():
        m=re.match(r'([A-Z]+)(\d+)$',ref); 
        if not m: continue
        rn=m.group(2); row=byrow.get(rn)
        if row is None:
            row=ET.Element('{%s}row'%NS,{'r':rn}); sd.append(row); byrow[rn]=row
        cell=None
        for c in row.findall('{%s}c'%NS):
            if c.attrib.get('r')==ref: cell=c; break
        if cell is None:
            cell=ET.Element('{%s}c'%NS,{'r':ref}); row.append(cell)
        style=cell.attrib.get('s')
        cell.clear(); cell.attrib['r']=ref
        if style is not None: cell.attrib['s']=style
        if isinstance(val,(int,float)) and not isinstance(val,bool):
            cell.append(ET.Element('{%s}v'%NS)); cell[0].text=str(val)
        else:
            cell.attrib['t']='inlineStr'; isel=ET.SubElement(cell,'{%s}is'%NS); t=ET.SubElement(isel,'{%s}t'%NS)
            txt='' if val is None else str(val); t.text=txt
            if txt.startswith(' ') or txt.endswith(' '): t.set('{http://www.w3.org/XML/1998/namespace}space','preserve')
    return ET.tostring(root,encoding='utf-8',xml_declaration=True)

def render(payload,out):
    fid=payload.get('formId','diagnosis'); d=payload.get('data') or {}; serial=payload.get('sourceSerial',''); today=payload.get('today','')
    gov=d.get('governorate','إب'); district=d.get('district',''); sub=d.get('subDistrict',''); north=d.get('northing',''); east=d.get('easting',''); name=d.get('name',''); number=d.get('number',''); status=STATUS.get(d.get('status'),d.get('status','')); completion=d.get('completion','')
    changes={}
    def put(c,v): changes[c]=v
    if serial not in (None,'') and fid not in ('notice','daily','weekly','evaluation','archive','cement_ledger','diesel_ledger'):
        put('I4',int(float(serial)))
    if fid in ('diagnosis','readiness','completion'):
        for c,v in [('C4',name),('C5',gov),('E5',district),('G5',sub),('C6',north),('D6',east),('F6','برنامج دعم المبادرات المجتمعية في مجال الطرق'),('D2',today),('F2',today)]: put(c,v)
    if fid=='diagnosis':
        sp=d.get('secondPath') or {}; put('A10',status); put('G10',completion); put('I14',status); put('I15',sp.get('technicalDescription','')); put('O37',sp.get('decisionDetails','')); put('C26',d.get('materialsDisbursed','')); put('D26',d.get('materialsUsed','')); put('E26',d.get('materialsRemaining','')); put('C27',d.get('dieselDisbursed','')); put('D27',d.get('dieselUsed','')); put('E27',d.get('dieselRemaining',''))
    elif fid=='readiness':
        put('D9','[ ✓ ] متوفرة بالموقع' if d.get('ownerConfirmed') else '[ ✗ ] تحتاج تحققاً ميدانياً'); put('D10','[ ✓ ] متوفرة وجاهزة' if float(d.get('community') or 0)>0 else '[ ✗ ] غير موثقة في السجل]'); put('D11','[ ✓ ] متوفرة ومؤمنة' if (d.get('materials') or d.get('materialsDisbursed')) else '[ ✗ ] غير موثقة في السجل]'); put('D12','[ ✓ ] تم البدء فعلياً' if float(completion or 0)>0 else '[ ✗ ] لم يثبت البدء في السجل]'); put('D13','[ ✓ ] مفعلة/موثقة' if d.get('ownerConfirmed') else '[ ✗ ] غير موثقة]')
    elif fid=='completion':
        put('H4',number); ex=d.get('executed') or {}
        # Work-item names/units are taken from the evaluation matrix (row 10); quantities come from the initiative execution record.
        items=[
          ('الطول المنجز','م','lengthCompleted'),('الشق / (ترابي)','م3','excavationEarth'),('الشق / (مختلط)','م3','excavationMixed'),('الشق /(صخري)','م3','excavationRock'),
          ('التوسعة (ترابية)','م3','expansionEarth'),('التوسعة( مختلط)','م3','expansionMixed'),('التوسعة (صخرية)','م3','expansionRock'),('المسح والتسوية','م.ط','gradingLevelling'),
          ('ردم','م3','backfill'),('دك','م2','compaction'),('حفر انشائي','م3','structuralExcavationM3'),('جدران كتلية','م3','blockWalls'),
          ('مباني حجر (مباني جعم )','م3','stoneMasonry'),('مباني حجر (جدران ساندة ناشفة)','م3','dryStoneRetaining'),('مباني حجر (جدران ساندة)','م3','stoneRetaining'),
          ('ربارب','م2','rubble'),('رصف حجري ناشف','م2','stonePavingDry'),('رصف حجري مع مونة اسمنتية','م2','stonePavingMortar'),('رصف خرساني عمش','م3','concretePaving'),
          ('خرسانة مسلحة','م3','reinforcedConcrete'),('خرسانة عادية','م3','plainConcrete')]
        # Clear the visible table data cells first, then show up to five non-zero executed items.
        for rr in range(9,14):
          for cc in ['B','D','E','G']: put(f'{cc}{rr}','')
        # Final closure section: keep the source wording, with no invented approval/signatures.
        put('A20',status); put('C20',completion); put('D20',d.get('notes') or d.get('stagnationReason','')); put('F20','[ ] يعتمد')
        put('C15',d.get('materialsDisbursed','')); put('D15',d.get('materialsUsed','')); put('E15','')
        put('C16',d.get('dieselDisbursed','')); put('D16',d.get('dieselUsed','')); put('E16','')
        sp=d.get('secondPath') or {}; decision=sp.get('decision','')
        actions=['إستمرار الصرف','إعطاء مهلة لاستئناف التنفيذ','اغلاق وتوريد المساهمة المتبقية','مناقلة فورية /توريد مساهمة الوحدة','إغلاق نهائي']
        for rr,action in enumerate(actions,31):
          put(f'B{rr}',('[✓] ' if str(decision).strip()==action.strip() else '[ ] ')+action)
          put(f'D{rr}',sp.get('decisionDetails','') if str(decision).strip()==action.strip() else '')
        shown=[]
        for label,unit,key in items:
          v=ex.get(key)
          try: n=float(v or 0)
          except: n=0
          if n!=0 and len(shown)<5: shown.append((label,unit,v))
        for rr,(label,unit,v) in enumerate(shown,9):
          put(f'B{rr}',label); put(f'D{rr}',unit); put(f'E{rr}',v); put(f'F{rr}','[✓] مطابق')
        # Keep the helper cells coherent with the same source mapping.
        for i,(label,unit,key) in enumerate(items[:23],9):
          put(f'I{i}',label); put(f'J{i}',unit); put(f'K{i}',ex.get(key,0) or 0)
    elif fid=='transfer':
        for c,v in [('B4',name),('B5',gov),('D5',district),('F5',sub),('B6',north),('C6',east),('E6','برنامج دعم المبادرات المجتمعية في مجال الطرق'),('I8',''),('B8',''),('D13',d.get('materialsDisbursed','')),('D14',d.get('dieselDisbursed',''))]: put(c,v)
    elif fid=='notice':
        sp=d.get('secondPath') or {}; put('B5',name); put('D5',sub); put('G5','(E) '+str(east)); put('G6','(N) '+str(north)); put('B7',gov); put('D7',district); put('D4',today); put('G4',today); put('A10',f'بعد الاطلاع على وضع المبادرة ({number}) وبناءً على مخرج استمارة التشخيص الفني، كان قرار اللجنة: {sp.get("decision","")}'); put('A11',sp.get('decisionDetails',''))
    elif fid=='daily':
        put('C3',f'المحـــــــافــظـة: [{gov}]'); put('F3',f'المديرية: [{district}]'); put('A4',f'تاريخ التقرير: [{today}]'); put('B11',name); put('D11',f'{sub} / {d.get("village","")}'); put('E11',status); put('G11','متابعة مبنية على سجل المبادرة المعتمد'); put('L11',f'نسبة الإنجاز: {completion}%')
    elif fid=='weekly':
        put('B4',gov); put('H4',number); put('B5',today); put('B10',district); put('F10',1); put('H10',1 if d.get('status')=='ongoing' else 0); put('J10',1 if d.get('status')=='stagnant' else 0); put('L10',1 if d.get('status') in ('stagnant','stopped') else 0)
    elif fid=='evaluation': put('H4',number)
    elif fid=='decision': put('A29','قرار اللجنة المشتركة (الإجراء القانوني)')
    with zipfile.ZipFile(TEMPLATE,'r') as zin, zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as zout:
        target=sheet_target(zin,SHEETS.get(fid,SHEETS['diagnosis']))
        for item in zin.infolist():
            data=zin.read(item.filename)
            if item.filename==target: data=patch_cells(data,changes)
            zout.writestr(item,data)

if __name__=='__main__':
    payload=json.load(sys.stdin); render(payload,Path(sys.argv[1])); print(sys.argv[1])
