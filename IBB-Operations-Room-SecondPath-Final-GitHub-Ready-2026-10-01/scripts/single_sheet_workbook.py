#!/usr/bin/env python3
import sys, zipfile, xml.etree.ElementTree as ET
src,dst,target=sys.argv[1],sys.argv[2],sys.argv[3]
NS='http://schemas.openxmlformats.org/spreadsheetml/2006/main'; RNS='http://schemas.openxmlformats.org/officeDocument/2006/relationships'; RELNS='http://schemas.openxmlformats.org/package/2006/relationships'; CTNS='http://schemas.openxmlformats.org/package/2006/content-types'
ET.register_namespace('',NS); ET.register_namespace('r',RNS)
with zipfile.ZipFile(src,'r') as zin, zipfile.ZipFile(dst,'w',zipfile.ZIP_DEFLATED) as zout:
 for item in zin.infolist():
  name=item.filename
  if name.startswith('xl/externalLinks/') or name.startswith('xl/externalLinks/_rels/'):
   continue
  data=zin.read(name)
  if name=='xl/workbook.xml':
   root=ET.fromstring(data); sheets=root.find('{%s}sheets'%NS)
   for sh in list(sheets):
    if sh.attrib.get('name')!=target: sheets.remove(sh)
   for tag in ['definedNames','externalReferences','calcPr']:
    node=root.find('{%s}%s'%(NS,tag))
    if node is not None: root.remove(node)
   data=ET.tostring(root,encoding='utf-8',xml_declaration=True)
  elif name=='xl/_rels/workbook.xml.rels':
   root=ET.fromstring(data)
   for rel in list(root):
    typ=rel.attrib.get('Type','')
    if 'externalLink' in typ: root.remove(rel)
   data=ET.tostring(root,encoding='utf-8',xml_declaration=True)
  elif name=='[Content_Types].xml':
   root=ET.fromstring(data)
   for x in list(root):
    part=x.attrib.get('PartName','')
    if part.startswith('/xl/externalLinks/') or 'externalLink' in x.attrib.get('ContentType',''): root.remove(x)
   data=ET.tostring(root,encoding='utf-8',xml_declaration=True)
  zout.writestr(item,data)
print(dst)
