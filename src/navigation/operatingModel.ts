import { TabId } from '../permissions';

export type PortalGroup = 'core' | 'pathway' | 'field' | 'governance' | 'intelligence' | 'administration';
export type PortalItem = { tab: TabId; group: PortalGroup; order: number; label: string; purpose: string };

/**
 * Canonical operating model: the platform is a digital implementation of the
 * Second Executive Pathway. Navigation follows the workbook's data lineage,
 * not a collection of unrelated dashboards.
 */
export type SecondPathStage = {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  sourceSheets: string[];
  tab: TabId;
  output: string;
  description: string;
};

export const SECOND_PATH_STAGES: SecondPathStage[] = [
  { id:'registry', order:1, title:'سجل المبادرات', shortTitle:'السجل', sourceSheets:['السجل المرجعي للمبادرات (725 مبادرة)'], tab:'initiatives', output:'ملف المبادرة الموحد', description:'الهوية المرجعية للمبادرة وجميع مفاتيح الربط.' },
  { id:'study', order:2, title:'الدراسات والاعتمادات', shortTitle:'الدراسات', sourceSheets:['الدراسات'], tab:'matrix', output:'الأعمال والكميات المعتمدة', description:'ما هو معتمد فنيًا وماليًا قبل مقارنة التنفيذ.' },
  { id:'materials', order:3, title:'سجل الشطب والتوريدات', shortTitle:'المواد', sourceSheets:['مصفوفة سجل الشطب(ديزل)'], tab:'matrix', output:'حركة الأسمنت والديزل وأوامر الصرف والأرصدة', description:'ما تم توريده وصرفه فعليًا، مع الاحتفاظ بكل دفعة.' },
  { id:'evaluation', order:4, title:'مستوى الإنجاز والتقييم', shortTitle:'التقييم', sourceSheets:['مصفوفة مستوى الانجاز والتقييم'], tab:'matching_results', output:'موقف تنفيذي موثق ومؤشرات تقييم', description:'مقارنة الاعتماد بالإنجاز والمواد والمساهمة.' },
  { id:'sorting', order:5, title:'الفرز', shortTitle:'الفرز', sourceSheets:['مصفوفة الفرز'], tab:'matching_results', output:'تصنيف المبادرة والمسار الإجرائي التالي', description:'بوابة تحديد ما إذا كانت المبادرة تحتاج تشخيصًا أو جاهزية أو قرارًا.' },
  { id:'forms', order:6, title:'المخرجات التنفيذية', shortTitle:'النماذج', sourceSheets:['استمارة التشخيص','استمارة فحص الجاهزية','استمارة تقرير الانجاز النهائي','محضر مناقلة واستلام','إخطار وإشعار اللجنة المجتمعية'], tab:'forms_portal', output:'تشخيص → جاهزية → قرار/إجراء → إنجاز → استلام', description:'النماذج الأصلية كمخرجات للعملية وليست جزرًا مستقلة.' },
  { id:'execution', order:7, title:'التنفيذ والمتابعة', shortTitle:'المتابعة', sourceSheets:['التقرير اليومي للممثل والشركاء','التقرير اليومي للممثل والمنسق','الاحتياج والدعم اللوجستي الفوري','مصفوفة المخاطر'], tab:'field_staging', output:'أدلة ميدانية واحتياجات وإجراءات متابعة', description:'تنفيذ القرار، توثيق الميدان، المخاطر والاحتياج.' },
  { id:'closure', order:8, title:'الإغلاق والأثر', shortTitle:'الإغلاق', sourceSheets:['مصفوفة الارشيف والوثائق','التقرير التجميعي الاسبوعي للمنس'], tab:'periodic_reports', output:'أرشيف وتقارير وأثر تنموي', description:'إغلاق المعاملة وتغذية التحليل الاستراتيجي.' },
];

export const OPERATING_FLOW: PortalItem[] = SECOND_PATH_STAGES.map(stage => ({
  tab: stage.tab,
  group: stage.id === 'forms' ? 'pathway' : stage.id === 'execution' ? 'field' : stage.id === 'closure' ? 'governance' : 'core',
  order: stage.order * 10,
  label: stage.title,
  purpose: stage.description,
}));

export const PORTAL_GROUPS: Record<PortalGroup, { label:string; order:number; description:string }> = {
  core:{label:'المسار التنفيذي الثاني',order:1,description:'السجل، الدراسة، المواد، التقييم والفرز'},
  pathway:{label:'المخرجات والمعاملات',order:2,description:'النماذج الرسمية الناتجة عن المسار'},
  field:{label:'الميدان',order:3,description:'التنفيذ والمتابعة والأدلة'},
  governance:{label:'الإغلاق والحوكمة',order:4,description:'التقارير والاستلام والأرشيف'},
  intelligence:{label:'التحليل والذكاء',order:5,description:'التحليل التنموي والمستشار والفجوات'},
  administration:{label:'الإدارة',order:6,description:'الصلاحيات والاستيراد والإعدادات'},
};

export const INTELLIGENCE_PORTALS: PortalItem[] = [
  {tab:'interactive_charts',group:'intelligence',order:10,label:'المؤشرات ولوحات الأداء',purpose:'تحويل بيانات المسار إلى مؤشرات قيادة.'},
  {tab:'interactive_map',group:'intelligence',order:20,label:'الخريطة وشبكة الطرق',purpose:'الطبقة المكانية الرسمية للمبادرات والمسارات.'},
  {tab:'district_portal',group:'intelligence',order:30,label:'التغطية الجغرافية',purpose:'تغطية المديريات والعزل والفجوات التنموية.'},
  {tab:'advisor',group:'intelligence',order:40,label:'المستشار الذكي',purpose:'تحليل مساعد مبني على مصادر الحقيقة دون استبدالها.'},
  {tab:'decision_center',group:'intelligence',order:50,label:'القرار والتخطيط الاستراتيجي',purpose:'ترجمة النتائج إلى أولويات ومعالجات وخطط.'},
];

export const ADMIN_PORTALS: PortalItem[] = [
  {tab:'officials_management',group:'administration',order:10,label:'المسؤولون والصلاحيات',purpose:'إدارة الهوية والنطاق والصلاحيات'},
  {tab:'sheets_import',group:'administration',order:20,label:'استيراد البيانات',purpose:'تحديث المصادر المرجعية بضوابط'},
  {tab:'activation_plan',group:'administration',order:30,label:'خطة التفعيل',purpose:'المرجع التشغيلي'},
  {tab:'tracking_sheet',group:'field',order:110,label:'دليل الفرق والمتابعة',purpose:'التكليف والمتابعة التشغيلية'},
  {tab:'engineers_portal',group:'field',order:120,label:'التقارير الفنية',purpose:'المعاينة الهندسية والأدلة'},
  {tab:'workshop',group:'administration',order:150,label:'التدريب والمحاكاة',purpose:'التدريب دون تغيير بيانات المصدر'},
  {tab:'about',group:'administration',order:160,label:'عن المنصة',purpose:'الدليل والمرجع'},
];

export function getStageForTab(tab: TabId): SecondPathStage | undefined {
  return SECOND_PATH_STAGES.find(stage => stage.tab === tab);
}

export function getNextFlowTab(current: TabId, allowed: Set<TabId>): TabId | null {
  const currentStage = getStageForTab(current);
  const start = currentStage ? currentStage.order : 0;
  return SECOND_PATH_STAGES.find(stage => stage.order > start && allowed.has(stage.tab))?.tab ?? null;
}
