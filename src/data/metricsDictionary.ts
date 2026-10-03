/**
 * Institutional Metrics Dictionary (قاموس المؤشرات المعياري الموحد)
 * Central definitions, source of truth specifications, and computational rules for Ibb Road Initiatives.
 */

export interface MetricDefinition {
  id: string;
  nameArabic: string;
  category: 'batch_source' | 'operational_status' | 'executive_decision' | 'priority_level' | 'material_resource' | 'threshold';
  definition: string;
  sourceOfTruth: string;
  formulaOrCondition: string;
  expectedGovernorateValue?: number | string;
}

/**
 * 1. Data Batch Sources (أعداد دفعات ومصادر البيانات - ليست حالات تنفيذية)
 */
export const DATA_BATCH_METRICS = {
  TOTAL_INITIATIVES: {
    id: 'TOTAL_INITIATIVES',
    nameArabic: 'إجمالي المبادرات المعتمدة',
    category: 'batch_source',
    definition: 'إجمالي عدد مبادرات الطرق المجتمعية المعتمدة بمحافظة إب في المصدر المرجعي الموحد.',
    sourceOfTruth: 'src/data/generated/initiatives725.ts',
    formulaOrCondition: 'initiatives.length',
    expectedGovernorateValue: 725
  },
  BATCH_1_RECORDS: {
    id: 'BATCH_1_RECORDS',
    nameArabic: 'سجلات الدفعة الأولى',
    category: 'batch_source',
    definition: 'عدد سجلات الدفعة الأولى من كشوفات الحصر والتوريد الميداني.',
    sourceOfTruth: 'src/data/raw/sheet1.csv',
    formulaOrCondition: 'sheet1.csv row count (49-285 mapping)',
    expectedGovernorateValue: 285
  },
  BATCH_2_RECORDS: {
    id: 'BATCH_2_RECORDS',
    nameArabic: 'سجلات الدفعة الثانية',
    category: 'batch_source',
    definition: 'عدد سجلات الدفعة الثانية من كشوفات المعاينة ومطابقة وحدة التدخلات.',
    sourceOfTruth: 'src/data/raw/sheet2.csv',
    formulaOrCondition: 'sheet2.csv record count',
    expectedGovernorateValue: 236
  },
  BATCH_3_RECORDS: {
    id: 'BATCH_3_RECORDS',
    nameArabic: 'سجلات الدفعة الثالثة (الربع الأول 1446هـ)',
    category: 'batch_source',
    definition: 'عدد سجلات الدفعة الثالثة المعتمدة للربع الأول من عام 1446هـ.',
    sourceOfTruth: 'src/data/raw/sheet3.csv',
    formulaOrCondition: 'sheet3.csv record count',
    expectedGovernorateValue: 204
  }
} as const;

/**
 * 2. Operational Execution Statuses (الحالات التنفيذية الحصرية - مجموعها = 725)
 */
export const OPERATIONAL_STATUS_METRICS = {
  STATUS_COMPLETED: {
    id: 'STATUS_COMPLETED',
    nameArabic: 'المبادرات المنجزة (المكتملة)',
    category: 'operational_status',
    definition: 'المبادرات التي اكتملت أعمالها الميدانية بنسبة إنجاز 100% أو تم استلامها.',
    sourceOfTruth: 'src/data/generated/initiatives725.ts -> status === "completed"',
    formulaOrCondition: 'initiatives.filter(i => i.status === "completed").length',
    expectedGovernorateValue: 201
  },
  STATUS_ONGOING: {
    id: 'STATUS_ONGOING',
    nameArabic: 'المبادرات المستمرة (قيد التنفيذ)',
    category: 'operational_status',
    definition: 'المبادرات الجارية التي تشهد أعمالاً نشطة ومستمرة وتوريدات منتظمة.',
    sourceOfTruth: 'src/data/generated/initiatives725.ts -> status === "ongoing"',
    formulaOrCondition: 'initiatives.filter(i => i.status === "ongoing").length',
    expectedGovernorateValue: 138
  },
  STATUS_STOPPED: {
    id: 'STATUS_STOPPED',
    nameArabic: 'المبادرات المتوقفة',
    category: 'operational_status',
    definition: 'المبادرات التي توقفت أعمالها الميدانية لأسباب مجتمعية، نقص تمويل، أو معوقات مسار.',
    sourceOfTruth: 'src/data/generated/initiatives725.ts -> status === "stopped"',
    formulaOrCondition: 'initiatives.filter(i => i.status === "stopped").length',
    expectedGovernorateValue: 191
  },
  STATUS_PENDING: {
    id: 'STATUS_PENDING',
    nameArabic: 'المبادرات قيد التجهيز (معتمدة ولم تبدأ)',
    category: 'operational_status',
    definition: 'مبادرات معتمدة بمصفوفة التدخلات ولكنها لم تشرع في التنفيذ الميداني وتنتظر استيفاء الشروط.',
    sourceOfTruth: 'src/data/generated/initiatives725.ts -> status === "pending"',
    formulaOrCondition: 'initiatives.filter(i => i.status === "pending").length',
    expectedGovernorateValue: 150
  },
  STATUS_STAGNANT: {
    id: 'STATUS_STAGNANT',
    nameArabic: 'المبادرات المتعثرة',
    category: 'operational_status',
    definition: 'المبادرات التي تعاني من تباطؤ حاد أو تعثر تنفيذي يتطلب تدخلاً ومعالجة.',
    sourceOfTruth: 'src/data/generated/initiatives725.ts -> status === "stagnant"',
    formulaOrCondition: 'initiatives.filter(i => i.status === "stagnant").length',
    expectedGovernorateValue: 45
  }
} as const;

/**
 * 3. Material Resource Formulas (معادلات الموارد ومخزون المواد)
 */
export const MATERIAL_RESOURCE_METRICS = {
  CEMENT_APPROVED: {
    id: 'CEMENT_APPROVED',
    nameArabic: 'الإسمنت المعتمد',
    category: 'material_resource',
    definition: 'إجمالي كمية أكياس الإسمنت المعتمدة للمبادرة وفق الدراسة الهندسية.',
    sourceOfTruth: 'initiative.materialsApproved',
    formulaOrCondition: 'parseNumeric(initiative.materialsApproved)'
  },
  CEMENT_DISBURSED: {
    id: 'CEMENT_DISBURSED',
    nameArabic: 'الإسمنت المنصرف للموقع',
    category: 'material_resource',
    definition: 'كمية أكياس الإسمنت التي تم صرفها واستلامها في مخازن المبادرة.',
    sourceOfTruth: 'initiative.materialsDisbursed',
    formulaOrCondition: 'parseNumeric(initiative.materialsDisbursed)'
  },
  CEMENT_USED: {
    id: 'CEMENT_USED',
    nameArabic: 'الإسمنت المستخدم فعلياً',
    category: 'material_resource',
    definition: 'كمية أكياس الإسمنت التي تم خلطها واستخدامها فعلياً في أعمال الرصف والصب.',
    sourceOfTruth: 'initiative.materialsUsed',
    formulaOrCondition: 'parseNumeric(initiative.materialsUsed)'
  },
  CEMENT_UNIT_BALANCE: {
    id: 'CEMENT_UNIT_BALANCE',
    nameArabic: 'رصيد الإسمنت المتبقي لدى الوحدة',
    category: 'material_resource',
    definition: 'الكمية المعتمدة التي لم تُصرف بعد للموقع وما تزال رصيداً دفترياً لدى وحدة التدخلات.',
    sourceOfTruth: 'محرك القرار التنموي',
    formulaOrCondition: 'Math.max(0, cementApproved - cementDisbursed)'
  },
  CEMENT_INITIATIVE_BALANCE: {
    id: 'CEMENT_INITIATIVE_BALANCE',
    nameArabic: 'رصيد الإسمنت المتبقي لدى المبادرة (العهدة الميدانية)',
    category: 'material_resource',
    definition: 'الكمية المنصرفة والموجودة في مخزن المبادرة بالموقع ولم تُستخدم بعد.',
    sourceOfTruth: 'محرك القرار التنموي',
    formulaOrCondition: 'Math.max(0, cementDisbursed - cementUsed)'
  },
  DIESEL_APPROVED: {
    id: 'DIESEL_APPROVED',
    nameArabic: 'الديزل المعتمد',
    category: 'material_resource',
    definition: 'إجمالي كمية لترات الديزل المعتمدة لمعدات الشق والمسح والقلابات.',
    sourceOfTruth: 'initiative.dieselApproved',
    formulaOrCondition: 'parseNumeric(initiative.dieselApproved)'
  },
  DIESEL_DISBURSED: {
    id: 'DIESEL_DISBURSED',
    nameArabic: 'الديزل المنصرف',
    category: 'material_resource',
    definition: 'كمية الديزل التي صُرفت لمعدات المبادرة بموجب سندات الصرف.',
    sourceOfTruth: 'initiative.dieselDisbursed',
    formulaOrCondition: 'parseNumeric(initiative.dieselDisbursed)'
  },
  DIESEL_USED: {
    id: 'DIESEL_USED',
    nameArabic: 'الديزل المستخدم فعلياً',
    category: 'material_resource',
    definition: 'كمية لترات الديزل المستهلكة في ساعات العمل الميداني للمعدات.',
    sourceOfTruth: 'initiative.dieselUsed',
    formulaOrCondition: 'parseNumeric(initiative.dieselUsed)'
  },
  DIESEL_UNIT_BALANCE: {
    id: 'DIESEL_UNIT_BALANCE',
    nameArabic: 'رصيد الديزل المتبقي لدى الوحدة',
    category: 'material_resource',
    definition: 'كمية الديزل المعتمدة المتبقية لدى الوحدة ولم تُصرف بعد.',
    sourceOfTruth: 'محرك القرار التنموي',
    formulaOrCondition: 'Math.max(0, dieselApproved - dieselDisbursed)'
  },
  DIESEL_INITIATIVE_BALANCE: {
    id: 'DIESEL_INITIATIVE_BALANCE',
    nameArabic: 'رصيد الديزل المتبقي لدى المبادرة',
    category: 'material_resource',
    definition: 'كمية الديزل المنصرفة المتبقية في عهدة المبادرة.',
    sourceOfTruth: 'محرك القرار التنموي',
    formulaOrCondition: 'Math.max(0, dieselDisbursed - dieselUsed)'
  },
  CEMENT_SURPLUS_THRESHOLD: {
    id: 'CEMENT_SURPLUS_THRESHOLD',
    nameArabic: 'عتبة الفائض المخزني الميداني',
    category: 'threshold',
    definition: 'عتبة مخزون الإسمنت بالموقع (50 كيس) التي يُصنف ما زاد عنها كمخزون متاح يتطلب الحماية والتشغيل العاجل.',
    sourceOfTruth: 'معايير إدارة المخزون الميداني',
    formulaOrCondition: 'cementRemaining >= 50',
    expectedGovernorateValue: 50
  }
} as const;

/**
 * 4. Executive Decision States (الحالات والقرارات التنفيذية)
 */
export const EXECUTIVE_DECISION_METRICS = {
  READY_FOR_CLOSING: {
    id: 'READY_FOR_CLOSING',
    nameArabic: 'جاهز للإغلاق',
    category: 'executive_decision',
    definition: 'مبادرات مكتملة الإنجاز ومطابقة دفترياً وهندسياً وجاهزة للتوثيق والأرشفة.'
  },
  UNDER_FOLLOWUP: {
    id: 'UNDER_FOLLOWUP',
    nameArabic: 'قيد المتابعة',
    category: 'executive_decision',
    definition: 'مبادرات جارية تسير بانتظام وتخضع للمتابعة الهندسية الدورية.'
  },
  URGENT_INTERVENTION: {
    id: 'URGENT_INTERVENTION',
    nameArabic: 'يحتاج تدخلاً عاجلاً',
    category: 'executive_decision',
    definition: 'مبادرات متوقفة مع وجود رصيد بمخزنها، أو تعثر حاد يستوجب تدخلاً ميدانياً عاجلاً لمنع تلف المواد.'
  },
  FIELD_VERIFICATION_REQUIRED: {
    id: 'FIELD_VERIFICATION_REQUIRED',
    nameArabic: 'معلق للتحقق الميداني',
    category: 'executive_decision',
    definition: 'مبادرات بها فروقات كميات أو زيادة استهلاك عن المنصرف، أو نقص في وثائق التنازل والإحداثيات.'
  },
  TECHNICAL_REVIEW_REQUIRED: {
    id: 'TECHNICAL_REVIEW_REQUIRED',
    nameArabic: 'يحتاج مراجعة فنية',
    category: 'executive_decision',
    definition: 'مبادرات استنفدت الدعم دون اكتمال الإنجاز أو بها تباين في مواصفات الرصف والجدران.'
  },
  ADMINISTRATIVE_DECISION_REQUIRED: {
    id: 'ADMINISTRATIVE_DECISION_REQUIRED',
    nameArabic: 'يحتاج قراراً إدارياً',
    category: 'executive_decision',
    definition: 'مبادرات تواجه نزاعات أهلية أو تتطلب قراراً من قيادة السلطة المحلية.'
  }
} as const;
