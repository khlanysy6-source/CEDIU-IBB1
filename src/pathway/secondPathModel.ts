/**
 * Second Executive Pathway Canonical Operating Model
 * Defines the sequential nodes, data sources, and analytical outputs.
 */

export interface PathwayNode {
  id: string;
  order: number;
  kind: 'source' | 'matrix' | 'action' | 'closure' | 'form';
  title: string;
  shortTitle: string;
  sheets: string[];
  produces: string[];
  description: string;
}

export const SECOND_EXECUTIVE_PATHWAY: PathwayNode[] = [
  {
    id: 'initiative-registry',
    order: 1,
    kind: 'source',
    title: 'سجل المبادرات المعتمدة (725)',
    shortTitle: 'السجل',
    sheets: ['السجل المرجعي للمبادرات (725 مبادرة)'],
    produces: ['الهوية المرجعية ومفاتيح الربط التنموية'],
    description: 'المصدر الثابت لهوية المبادرة ورقمها المرجعي وتقسيمها الإداري.'
  },
  {
    id: 'studies',
    order: 2,
    kind: 'matrix',
    title: 'الدراسات والاعتمادات الفنية',
    shortTitle: 'الدراسات',
    sheets: ['الدراسات'],
    produces: ['الأعمال والكميات والمساهمات المعتمدة'],
    description: 'الاعتمادات الهندسية للمشروع قبل مقارنة التنفيذ الفعلي.'
  },
  {
    id: 'material-ledger',
    order: 3,
    kind: 'matrix',
    title: 'سجل الشطب وحركة المواد',
    shortTitle: 'المواد',
    sheets: ['مصفوفة سجل الشطب(اسمنت)', 'مصفوفة سجل الشطب(ديزل)'],
    produces: ['حركة التوريدات والصرف وأوامر الصرف والأرصدة'],
    description: 'تتبع حركة الإسمنت والديزل المستلم والمصروف لكل مبادرة.'
  },
  {
    id: 'evaluation-matrix',
    order: 4,
    kind: 'matrix',
    title: 'مصفوفة مستوى الإنجاز والتقييم',
    shortTitle: 'التقييم',
    sheets: ['مصفوفة مستوى الانجاز والتقييم'],
    produces: ['موقف تنفيذي موثق ومؤشرات تقييم الأداء'],
    description: 'مقارنة الكميات المعتمدة بالإنجاز الفعلي على أرض الواقع.'
  },
  {
    id: 'sorting-matrix',
    order: 5,
    kind: 'matrix',
    title: 'مصفوفة الفرز والتصنيف',
    shortTitle: 'الفرز',
    sheets: ['مصفوفة الفرز'],
    produces: ['تصنيف المبادرة والمسار الإجرائي اللاحق'],
    description: 'توجيه المبادرة إلى المسار التصحيحي أو التنفيذي المناسب.'
  },
  {
    id: 'diagnosis',
    order: 6,
    kind: 'form',
    title: 'استمارة التشخيص الميداني',
    shortTitle: 'التشخيص',
    sheets: ['استمارة التشخيص'],
    produces: ['تقرير الفحص الميداني وحصر الاحتياجات والمخاطر'],
    description: 'إجراء رسمي لتوثيق أسباب التعثر والمتطلبات العاجلة.'
  },
  {
    id: 'readiness',
    order: 7,
    kind: 'form',
    title: 'استمارة فحص الجاهزية',
    shortTitle: 'الجاهزية',
    sheets: ['استمارة فحص الجاهزية'],
    produces: ['محضر جاهزية استئناف العمل واستقبال المواد'],
    description: 'التحقق من اكتمال التجهيزات الأهلية وعقود التنازلات.'
  },
  {
    id: 'decision',
    order: 8,
    kind: 'action',
    title: 'القرار والتدخل التنفيذي',
    shortTitle: 'القرار',
    sheets: ['مصفوفة القرارات التنفيذية'],
    produces: ['قرار تدخّل رسمي معتمد من الوحدة والقيادة'],
    description: 'صياغة التوجيه القيادي المبني على بيانات الفرز والتشخيص.'
  },
  {
    id: 'execution',
    order: 9,
    kind: 'action',
    title: 'التنفيذ والمتابعة والرفع الميداني',
    shortTitle: 'المتابعة',
    sheets: ['التقرير اليومي للممثل والشركاء', 'الاحتياج والدعم اللوجستي الفوري'],
    produces: ['أدلة التنفيذ والتقارير اليومية وتوثيق المراحل'],
    description: 'متابعة الأعمال الإنشائية ونوبات العمل على المسار.'
  },
  {
    id: 'completion',
    order: 10,
    kind: 'closure',
    title: 'تقرير الإنجاز النهائي ومحضر الاستلام',
    shortTitle: 'الإنجاز والاستلام',
    sheets: ['استمارة تقرير الانجاز النهائي', 'محضر مناقلة واستلام'],
    produces: ['محضر استلام فني وإخلاء عهدة رسمي'],
    description: 'إغلاق المشروع فنيًا وماليًا بعد مطابقة المواصفات.'
  },
  {
    id: 'archive',
    order: 11,
    kind: 'closure',
    title: 'الأرشيف والتقارير التجميعية',
    shortTitle: 'الأرشيف والتقارير',
    sheets: ['مصفوفة الارشيف والوثائق', 'التقرير التجميعي الاسبوعي للمنس'],
    produces: ['أرشيف وثائقي رقمي وتغذية المؤشرات الاستراتيجية'],
    description: 'حفظ الوثائق والمخططات وتحديث سجل التنمية بالمحافظة.'
  }
];

export const ANALYTICS_AFTER_PATHWAY = [
  {
    id: 'charts',
    title: 'لوحات المؤشرات القيادية',
    description: 'رسوم بيانية تفاعلية تحلل قيود المثلث الذهبي وتوزيع المبادرات.'
  },
  {
    id: 'map',
    title: 'الطبقة الجغرافية وشبكة الطرق',
    description: 'تتبع مواقع المبادرات والمسارات الحقلية المعتمدة بنظام GPS.'
  },
  {
    id: 'advisor',
    title: 'المستشار الذكي وهندسة النظم',
    description: 'تحليل تنموي وتوجيه هندسي يضمن الالتزام بالمواصفات والمعايير.'
  }
];
