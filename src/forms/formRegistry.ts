/**
 * Form Registry for Official Community Initiatives Forms
 * Second Executive Pathway Operations
 */

export interface FormDef {
  id: string;
  number: string;
  title: string;
  stage: string;
  roles: string[];
  templateSheet: string;
  description: string;
}

export const FORM_LIFECYCLE = [
  'التشخيص الميداني',
  'فحص الجاهزية',
  'القرارات والتدخلات',
  'التنفيذ والمتابعة',
  'الإنجاز والاستلام',
  'الأرشيف والتقارير'
];

export const FORM_REGISTRY: FormDef[] = [
  {
    id: 'diagnosis',
    number: '01',
    title: 'استمارة التشخيص الميداني وحصر التعثر',
    stage: 'التشخيص الميداني',
    roles: ['admin', 'central_unit', 'governorate', 'district_director', 'engineer_inspector'],
    templateSheet: 'استمارة التشخيص',
    description: 'توثيق حالة المبادرة على أرض الواقع وأسباب التوقف أو التعثر والاحتياج.'
  },
  {
    id: 'readiness',
    number: '02',
    title: 'استمارة فحص الجاهزية لاستئناف العمل',
    stage: 'فحص الجاهزية',
    roles: ['admin', 'central_unit', 'governorate', 'district_director', 'cooperative_association', 'engineer_inspector'],
    templateSheet: 'استمارة فحص الجاهزية',
    description: 'التحقق من جاهزية الأهالي، عقود التنازلات، واللجان قبل توريد المواد.'
  },
  {
    id: 'decision',
    number: '03',
    title: 'مذكرة القرار والتدخل التنفيذي',
    stage: 'القرارات والتدخلات',
    roles: ['admin', 'central_unit', 'governorate'],
    templateSheet: 'استمارة التشخيص',
    description: 'قرار قيادة المحافظة والوحدة المركزية باعتماد المخصص أو المعالجة.'
  },
  {
    id: 'daily',
    number: '04',
    title: 'التقرير اليومي للممثل والشركاء الميدانيين',
    stage: 'التنفيذ والمتابعة',
    roles: ['admin', 'central_unit', 'engineer_inspector', 'cooperative_association'],
    templateSheet: 'التقرير اليومي للممثل والشركاء',
    description: 'متابعة نوبات العمل اليومية، استهلاك المواد، ونسب تقدم التنفيذ.'
  },
  {
    id: 'weekly',
    number: '05',
    title: 'التقرير التجميعي الأسبوعي للمنسق',
    stage: 'التنفيذ والمتابعة',
    roles: ['admin', 'central_unit', 'governorate', 'district_director'],
    templateSheet: 'التقرير التجميعي الاسبوعي للمنس',
    description: 'ملخص سير المبادرات المفتوحة في نطاق المديرية أسبوعياً.'
  },
  {
    id: 'notice',
    number: '06',
    title: 'إخطار وإشعار اللجنة المجتمعية',
    stage: 'القرارات والتدخلات',
    roles: ['admin', 'central_unit', 'governorate', 'district_director'],
    templateSheet: 'إخطار وإشعار اللجنة المجتمعية ',
    description: 'مراسلة رسمية للجنة المبادرة بتحديد الالتزامات والجدول الزمني.'
  },
  {
    id: 'completion',
    number: '07',
    title: 'استمارة تقرير الإنجاز النهائي',
    stage: 'الإنجاز والاستلام',
    roles: ['admin', 'central_unit', 'governorate', 'engineer_inspector'],
    templateSheet: 'استمارة تقرير الانجاز النهائي',
    description: 'حصر الكميات المنفذة فعلياً ومطابقتها بالدراسة الفنية المعتمدة.'
  },
  {
    id: 'transfer',
    number: '08',
    title: 'محضر مناقلة واستلام وتسليم',
    stage: 'الإنجاز والاستلام',
    roles: ['admin', 'central_unit', 'governorate', 'district_director', 'engineer_inspector'],
    templateSheet: 'محضر مناقلة واستلام',
    description: 'استلام الطريق رسمياً من اللجنة الأهلية وتصفيات العهد والمواد.'
  },
  {
    id: 'archive',
    number: '09',
    title: 'محضر الأرشيف وحفظ الوثائق',
    stage: 'الأرشيف والتقارير',
    roles: ['admin', 'central_unit', 'governorate'],
    templateSheet: 'مصفوفة الارشيف والوثائق',
    description: 'التوثيق الختامي للمشروع في الأرشيف الإلكتروني للمحافظة.'
  }
];

export function getRecommendedFormIds(status?: string): string[] {
  switch (status) {
    case 'stagnant':
    case 'stopped':
      return ['diagnosis', 'readiness', 'notice'];
    case 'ongoing':
      return ['daily', 'weekly', 'readiness'];
    case 'completed':
      return ['completion', 'transfer', 'archive'];
    case 'pending':
    default:
      return ['diagnosis', 'readiness'];
  }
}
