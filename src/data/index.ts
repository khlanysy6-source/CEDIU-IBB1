/**
 * Unified Data Entry Point
 * Ibb Road Community Initiatives Platform (SSoT)
 */

export * from './schema';
export * from './normalizeInitiative';
export * from './validate';
export * from './derivedMetrics';
export * from './repository';
export * from './metricsDictionary';
export * from '../utils/calculationTruthEngine';
export * from '../utils/developmentDecisionEngine';

export { generatedInitiatives as importedInitiatives, generatedInitiatives as IMPORTED_SHEETS_INITIATIVES, generatedInitiatives as INITIAL_INITIATIVES } from './generated/initiatives725';
export { generatedInitiatives } from './generated/initiatives725';

export const DISTRICTS_LIST = [
  'مديرية ذي السفال',
  'مديرية السياني',
  'مديرية جبلة',
  'مديرية بعدان',
  'مديرية السدة',
  'مديرية يريم',
  'مديرية المخادر',
  'مديرية حبيش',
  'مديرية حزم العدين',
  'مديرية الرضمة',
  'مديرية القفر',
  'مديرية العدين',
  'مديرية ريف إب',
  'مديرية الظهار',
  'مديرية المشنة',
  'مديرية السبرة',
  'مديرية الشعر',
  'مديرية النادرة',
  'مديرية فرع العدين',
  'مديرية مذيخرة'
];

export const GOVERNORATES_LIST = ['محافظة إب'];

export const DEFAULT_PATHWAYS_TEMPLATE = [
  {
    id: 1,
    title: 'مسار التشخيص والفرز الفني والميداني',
    subtitle: 'حصر المبادرات، المعاينة الهندسية، وفحص أسباب التعثر والتوقف',
    status: 'active',
    tasks: [{ id: 't1', title: 'التوثيق الميداني والمطابقة الفنية', completed: false }]
  },
  {
    id: 2,
    title: 'مسار التفعيل التنموي وإدارة الشركاء',
    subtitle: 'تأهيل وتفعيل اللجان المجتمعية وفرسان التنمية وتوثيق المساهمات',
    status: 'active',
    tasks: [{ id: 't2', title: 'تأهيل اللجان وعقود التنازلات', completed: false }]
  },
  {
    id: 3,
    title: 'مسار الرقابة والتقييم الميداني والمطابقة',
    subtitle: 'مطابقة كميات الرصف الفعلي مع المخططات وإجراء الفحوص الإنشائية',
    status: 'active',
    tasks: [{ id: 't3', title: 'المعاينة الميدانية وضبط الجودة', completed: false }]
  },
  {
    id: 4,
    title: 'مسار الدعم اللوجستي وتوريد المواد',
    subtitle: 'إدارة صرف دفعات الأسمنت والديزل وضبط أرصدة العهد الميدانية',
    status: 'active',
    tasks: [{ id: 't4', title: 'تتبع سلاسل الإمداد وميزان المواد', completed: false }]
  },
  {
    id: 5,
    title: 'مسار الإنجاز والاستلام والأرشفة المؤسسية',
    subtitle: 'الاستلام الفني الختامي، تصفية العهد، وإصدار التقارير التجميعية',
    status: 'active',
    tasks: [{ id: 't5', title: 'محاضر الاستلام والإغلاق والتوثيق', completed: false }]
  }
];

