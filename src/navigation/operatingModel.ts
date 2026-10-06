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
  { id:'registry', order:1, title:'سجل المبادرات', shortTitle:'السجل', sourceSheets:['السجل المرجعي للمبادرات (784 مبادرة)'], tab:'initiatives', output:'ملف المبادرة الموحد', description:'تبدأ الحركة من هوية المبادرة وسجلها المرجعي، ومنها ننتقل إلى الإجراء المناسب.' },
  { id:'sorting', order:2, title:'الفرز والتصنيف', shortTitle:'الفرز', sourceSheets:['مصفوفة الفرز'], tab:'matching_results', output:'تصنيف المبادرة وتحديد الخطوة التالية', description:'تحديد القطاع والحالة والتوصيف ومسار المعالجة دون فتح شاشات غير مرتبطة.' },
  { id:'diagnosis', order:3, title:'التشخيص', shortTitle:'التشخيص', sourceSheets:['استمارة التشخيص','مصفوفة الفرز'], tab:'forms_portal', output:'تشخيص موثق وأسباب الحالة والاحتياج', description:'فهم الحالة ميدانيًا وتوثيق أسباب التعثر أو التوقف قبل اتخاذ الإجراء.' },
  { id:'readiness', order:4, title:'فحص الجاهزية', shortTitle:'الجاهزية', sourceSheets:['استمارة فحص الجاهزية','مصفوفة الفرز'], tab:'forms_portal', output:'قرار الجاهزية للاستئناف أو التدخل', description:'التحقق من المتطلبات التي يجب أن تسبق توريد المواد أو استئناف العمل.' },
  { id:'evaluation', order:5, title:'الإنجاز والتقييم', shortTitle:'الإنجاز', sourceSheets:['مصفوفة مستوى الانجاز والتقييم','مصفوفة الفرز'], tab:'matching_results', output:'موقف تنفيذي موثق ونسبة إنجاز قابلة للمقارنة', description:'مقارنة الأعمال والكميات المعتمدة بما تحقق فعليًا، مع إبقاء مصدر كل قيمة واضحًا.' },
  { id:'decision', order:6, title:'القرار والتوصية', shortTitle:'القرار', sourceSheets:['استمارة التشخيص','إخطار وإشعار اللجنة المجتمعية'], tab:'decision_center', output:'قرار أو توصية وإجراء مسؤول عنه', description:'تحويل التشخيص والتقييم إلى قرار واضح، مسؤول، وموعد متابعة.' },
  { id:'execution', order:7, title:'التنفيذ والمتابعة', shortTitle:'المتابعة', sourceSheets:['التقرير اليومي للممثل والشركاء','التقرير اليومي للممثل والمنسق','الاحتياج والدعم اللوجستي الفوري'], tab:'field_staging', output:'أدلة ميدانية وإجراءات ومتابعة حتى الإغلاق', description:'تنفيذ القرار وتوثيق العمل والمواد والمخاطر والإجراءات التصحيحية.' },
  { id:'closure', order:8, title:'الإغلاق والأثر', shortTitle:'الإغلاق', sourceSheets:['استمارة تقرير الانجاز النهائي','محضر مناقلة واستلام','مصفوفة الارشيف والوثائق'], tab:'forms_portal', output:'إنجاز واستلام وأرشيف وأثر تنموي', description:'إقفال المعاملة بعد اكتمال الأدلة، ثم حفظها لتغذية التقارير والتحليل.' },
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

export function getNextFlowStage(stageId: string | undefined, allowed: Set<TabId>): SecondPathStage | null {
  const current = SECOND_PATH_STAGES.find(stage => stage.id === stageId);
  const start = current?.order ?? 0;
  return SECOND_PATH_STAGES.find(stage => stage.order > start && allowed.has(stage.tab)) ?? null;
}

export function getPreviousFlowStage(stageId: string | undefined, allowed: Set<TabId>): SecondPathStage | null {
  const current = SECOND_PATH_STAGES.find(stage => stage.id === stageId);
  const start = current?.order ?? Number.MAX_SAFE_INTEGER;
  return [...SECOND_PATH_STAGES].reverse().find(stage => stage.order < start && allowed.has(stage.tab)) ?? null;
}

export function getNextFlowTab(current: TabId, allowed: Set<TabId>): TabId | null {
  const currentStage = getStageForTab(current);
  return getNextFlowStage(currentStage?.id, allowed)?.tab ?? null;
}
