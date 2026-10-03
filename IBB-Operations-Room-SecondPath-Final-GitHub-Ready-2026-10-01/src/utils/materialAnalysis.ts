import { Initiative, TechnicalWorkQuantities } from '../types';

export interface SingleMaterialAnalysis {
  materialType: 'cement' | 'diesel';
  materialName: string;
  unitLabel: string;
  unitCostYER: number;
  
  // Quantities - 4 Official Unit Metrics & Verification Discrepancy
  approvedByStudy: number;      // 1. المعتمد من الوحدة
  disbursedByUnit: number;      // 2. المنصرف من الوحدة
  actuallyConsumed: number;     // 3. المستخدم فعلياً
  unitInventory: number;        // 4. المتبقي لدى الوحدة = max(0, المعتمد - المنصرف)
  
  remainingCustody: number;     // المخزون المتبقي بالموقع (العهدة الميدانية = max(0, المنصرف - المستهلك))
  excessConsumed: number;       // فرق يحتاج تحققاً ميدانياً (المستهلك - المنصرف عند الزيادة)
  
  // Financial verification flags (NOT community contribution)
  excessRequiresVerification: boolean; // فرق يحتاج تحققاً ميدانياً
  
  // Backward compatibility fields
  excessCommunityContributionValue?: number;
  communityCoveringRatio?: number;
  
  // Consumption stats
  consumptionRate: number;      // نسبة الاستخدام (% = المستهلك / المنصرف)
  estimatedRemainingToComplete: number; // الاحتياج الفعلي المقدر للاستكمال

  // Analysis Case Tag
  caseCode: 'disbursed_not_started' | 'stopped_with_custody' | 'depleted_deviation' | 'depleted_aligned' | 'surplus_custody' | 'consumed_exceeds_disbursed' | 'normal_execution';
  caseTitle: string;
  caseOutputText: string;
  recommendedDecision: string;
  actionRequired: string;
  
  // Technical Causal Deviation Info
  hasTechnicalDeviation: boolean;
  deviationReasons: string[];

  // Diagnostic Signal for Over-disbursement (صرف فوق المعتمد من الوحدة)
  isOverDisbursed: boolean;
  overDisbursedAmount: number;
  overDisbursedSignal: string | null;
}

export interface ComprehensiveMaterialAnalysis {
  cement: SingleMaterialAnalysis;
  diesel: SingleMaterialAnalysis;
  overallCaseCode: string;
  overallCaseTitle: string;
  overallExecutiveSummary: string;
  overallSmartDecision: string;
  primaryAlertBadge?: {
    text: string;
    variant: 'danger' | 'warning' | 'info' | 'success';
  };
}

export interface DevelopmentDecisionFile {
  initiativeId: string;
  name: string;
  location: string;
  district: string;
  entity: string;
  projectType: string;
  beneficiariesCount: number;
  developmentalImpact: string;
  
  // Study & Approval
  approvedCost: number;
  approvedWorkItems: string[];
  approvedQuantities: {
    cement: number;
    diesel: number;
  };
  approvedDurationDays: number;
  requiredCommunityContribution: number;
  
  // Execution Data
  completionRate: number;
  executedWorks: string[];
  startDate: string;
  lastUpdateDate: string;
  fieldVisitsCount: number;
  technicalNotes: string[];
  
  // Material Custody Data (تصحيح منطق المواد والعهدة)
  custodyData: {
    unitInventoryCement: number;  // مخزون الوحدة (المستودعات المركزية = المعتمد - المصروف)
    unitInventoryDiesel: number;
    
    disbursedCement: number;     // عهدة المبادرة المصروفة
    consumedCement: number;      // المستهلك فعلياً
    remainingCustodyCement: number; // المتبقي لدى المبادرة (العهدة الميدانية = المصروف - المستهلك)
    excessConsumedCement: number;
    
    disbursedDiesel: number;
    consumedDiesel: number;
    remainingCustodyDiesel: number;
    excessConsumedDiesel: number;
    
    excessCommunityValueYER: number; // قيمة مساهمة المجتمع الإضافية بالريال
    actualNeedToCompleteCement: number; // الاحتياج الفعلي المقدر للاستكمال
    actualNeedToCompleteDiesel: number;
  };

  // Smart Causal Diagnosis & Decision (محرك التحليل للحالات الست)
  diagnosis: {
    caseNumber: 1 | 2 | 3 | 4 | 5 | 6;
    caseTitle: string;
    whatHappened: string;        // ماذا حدث؟
    whyHappened: string;         // لماذا حدث؟ (السبب المحتمل)
    riskLevel: 'low' | 'medium' | 'high' | 'critical'; // مستوى الخطورة
    riskLevelLabel: string;      // منخفض / متوسط / مرتفع / حرج
    proposedDecision: string;    // القرار المقترح للقيادة
    followUpAction: string;      // الإجراء الميداني المطلوب
  };
}

/**
 * Parse strings like "400 كيس", "1,200 لتر", "150.5" into pure numbers
 */
export function parseMaterialValue(val?: string | number): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/,/g, '').replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Detect technical deviations between approved study (شيت 3) and executed work (شيت 2)
 */
export function detectTechnicalDeviation(
  approved?: TechnicalWorkQuantities,
  executed?: TechnicalWorkQuantities
): { hasDeviation: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (!approved || !executed) {
    return { hasDeviation: false, reasons };
  }

  // 1. Shift in paving type (e.g. from stone paving to concrete paving)
  if ((approved.stonePaving || 0) > 0 && (executed.concretePaving || 0) > 0 && (approved.concretePaving || 0) === 0) {
    reasons.push('تم تغيير نوع التنفيذ من رصف حجري معتمد إلى رصف خرساني ميداني');
  }

  // 2. Increase in road width
  if ((executed.avgWidth || 0) > (approved.avgWidth || 0) && (approved.avgWidth || 0) > 0) {
    const diff = ((executed.avgWidth || 0) - (approved.avgWidth || 0)).toFixed(1);
    reasons.push(`توسعة عرض الطريق الميداني بزيادة (${diff} م) عن العرض المعتمد بالدراسة`);
  }

  // 3. Increase in road length
  if ((executed.lengthCompleted || 0) > (approved.lengthCompleted || 0) && (approved.lengthCompleted || 0) > 0) {
    const diff = (executed.lengthCompleted || 0) - (approved.lengthCompleted || 0);
    reasons.push(`زيادة طول المسار المنفذ بمقدار (${diff} م) عن الطول المعتمد بالدراسة`);
  }

  // 4. Increase in excavation/cut volume
  if ((executed.excavationCut || 0) > (approved.excavationCut || 0) * 1.15 && (approved.excavationCut || 0) > 0) {
    reasons.push('زيادة كميات الأعمال الإنشائية والشق الترابي عن المخطط التنفيذي للدراسة');
  }

  return {
    hasDeviation: reasons.length > 0,
    reasons
  };
}

/**
 * Analyze a single material (Cement or Diesel) according to the 5 executive rules
 */
export function analyzeSingleMaterial(
  materialType: 'cement' | 'diesel',
  approvedStr?: string | number,
  disbursedStr?: string | number,
  consumedStr?: string | number,
  completionRate: number = 0,
  initiativeStatus: string = 'ongoing',
  stagnationReason?: string,
  technicalDeviation?: { hasDeviation: boolean; reasons: string[] }
): SingleMaterialAnalysis {
  const unitLabel = materialType === 'cement' ? 'كيس' : 'لتر';
  const materialName = materialType === 'cement' ? 'الأسمنت' : 'الديزل والمحروقات';
  // Unit costs in YER for financial conversion of excess consumption
  const unitCostYER = materialType === 'cement' ? 8500 : 1300;

  const approvedByStudy = parseMaterialValue(approvedStr);
  const disbursedByUnit = parseMaterialValue(disbursedStr);
  const actuallyConsumed = parseMaterialValue(consumedStr);

  // Core Rule 1: Separation between Unit Inventory & Initiative Custody
  // Unit Inventory = Approved - Disbursed (Non-disbursed stored in central warehouses)
  const unitInventory = Math.max(0, approvedByStudy - disbursedByUnit);

  // Initiative Custody = Disbursed to initiative
  // Remaining Custody in Initiative = Disbursed - Consumed
  const remainingCustody = Math.max(0, disbursedByUnit - actuallyConsumed);

  // Excess Consumed = Consumed - Disbursed (فرق يحتاج تحققاً ميدانياً)
  const excessConsumed = Math.max(0, actuallyConsumed - disbursedByUnit);
  const excessRequiresVerification = excessConsumed > 0;

  // Consumption Rate (% = Consumed / Disbursed)
  const consumptionRate = disbursedByUnit > 0 ? (actuallyConsumed / disbursedByUnit) * 100 : 0;

  // Estimation of remaining requirement to complete (if incomplete)
  let estimatedRemainingToComplete = 0;
  if (completionRate < 100 && completionRate > 0 && actuallyConsumed > 0) {
    const totalEstNeeded = (actuallyConsumed / completionRate) * 100;
    estimatedRemainingToComplete = Math.max(0, Math.round(totalEstNeeded - actuallyConsumed));
  } else if (completionRate === 0 && approvedByStudy > 0) {
    estimatedRemainingToComplete = approvedByStudy;
  }

  const hasDev = technicalDeviation?.hasDeviation || false;
  const devReasons = technicalDeviation?.reasons || [];

  // Determine Case
  let caseCode: SingleMaterialAnalysis['caseCode'] = 'normal_execution';
  let caseTitle = '';
  let caseOutputText = '';
  let recommendedDecision = '';
  let actionRequired = '';

  // Rule Case 1: Disbursed but not started (مصروف ولم يبدأ التنفيذ)
  if (disbursedByUnit > 0 && actuallyConsumed === 0 && completionRate === 0) {
    caseCode = 'disbursed_not_started';
    caseTitle = 'مواد مسلّمة بالموقع ولم يبدأ التنفيذ';
    caseOutputText = `تم صرف شحنة ${materialName} (${disbursedByUnit.toLocaleString()} ${unitLabel}) وهي متوفرة بموقع المبادرة ولكن نسبة الإنجاز والإنفاق الاستهلاكي تساوي صفر.`;
    recommendedDecision = 'تحديد المسؤولية الميدانية ومنع أي صرف جديد مع تحديد مهلة زمنية ملزمة لبدء التنفيذ.';
    actionRequired = 'معرفة سبب عدم البدء، تحديد المسؤولية الميدانية، ووضع مهلة تنفيذ عاجلة.';
  }
  // Rule Case 5: Consumed > Disbursed (المستخدم أكبر من المنصرف = فرق يحتاج تحققاً ميدانياً)
  else if (excessConsumed > 0) {
    caseCode = 'consumed_exceeds_disbursed';
    caseTitle = 'الاستهلاك المسجل يتجاوز المنصرف من الوحدة (فرق يحتاج تحققاً)';
    caseOutputText = `الاستهلاك المسجل لمادة ${materialName} (${actuallyConsumed.toLocaleString()} ${unitLabel}) يتجاوز إجمالي المنصرف من الوحدة (${disbursedByUnit.toLocaleString()} ${unitLabel}) بفارق (${excessConsumed.toLocaleString()} ${unitLabel}). هذا الفرق يحتاج تحققاً ميدانياً وهندسياً ولا يعتبر مساهمة مجتمعية تلقائياً.`;
    recommendedDecision = 'تسجيل التباين كفرق يحتاج تحققاً ميدانياً، وعدم اعتباره مساهمة مجتمعية أو إجراء تسوية إلا بتقرير تدقيق هندسي معتمد.';
    actionRequired = 'إلزام المهندس المشرف بمطابقة الفواتير والمحاضر الميدانية للتثبت من مصدر وكميات الاستهلاك الزائد.';
  }
  // Rule Case 2: Stopped/Stagnant with remaining custody (متوقف مع توفر مواد بالموقع)
  else if (remainingCustody > 0 && (initiativeStatus === 'stopped' || initiativeStatus === 'stagnant' || Boolean(stagnationReason))) {
    caseCode = 'stopped_with_custody';
    caseTitle = 'المبادرة متوقفة مع توفر مخزون مواد بالموقع';
    caseOutputText = `يتوفر مخزون مواد بالموقع قدره (${remainingCustody.toLocaleString()} ${unitLabel}) بالرغم من تعثر/توقف العمل بسبب: ${stagnationReason || 'نزاعات أو معوقات ميدانية'}.`;
    recommendedDecision = 'الاستفادة من المخزون المتاح أولاً وحظر صرف أي كميات جديدة قبل فحص سلامة المخزون.';
    actionRequired = 'معالجة سبب توقف التنفيذ وجرد المخزون الميداني لحمايته من التلف والرطوبة.';
  }
  // Rule Case 3: Depleted disbursed materials & incomplete initiative (انتهاء المواد وعدم اكتمال المبادرة)
  else if (disbursedByUnit > 0 && remainingCustody === 0 && completionRate < 100) {
    if (hasDev) {
      caseCode = 'depleted_deviation';
      caseTitle = 'استنفاد المواد المصروفة دون اكتمال المشروع (وجود انحرافات هندسية)';
      caseOutputText = `استنفاد كامل كمية ${materialName} المصروفة دون اكتمال المشروع (نسبة الإنجاز ${completionRate}%). تبين وجود انحرافات عن الدراسة: ${devReasons.join('؛ ')}.`;
      recommendedDecision = 'تحليل سبب الانحراف بين كمية المواد والدراسة الفنية قبل اتخاذ أي قرار دعم إضافي.';
      actionRequired = 'مراجعة أسباب الانحراف بين الدراسة والتنفيذ بواسطة الإدارة الهندسية.';
    } else {
      caseCode = 'depleted_aligned';
      caseTitle = 'استنفاد المواد المعتمدة والمصروفة مع مطابقة التنفيذ للدراسة';
      caseOutputText = `استنفاد كامل كمية ${materialName} المصروفة والمنفذة وفق الدراسة الفنية المعتمدة مع بقاء نسبة إنجاز (${completionRate}%).`;
      recommendedDecision = 'دراسة فجوة الكميات وتصنيف الحالة بأنها تحتاج مراجعة فنية ولا اعتماد لمخصص إضافي دون مبرر موثق.';
      actionRequired = 'إعداد تقرير تقييم فجوة الكميات ومبررات عدم كفاية الاعتماد التقديري.';
    }
  }
  // Rule Case 4: Surplus custody relative to progress (توفر مواد بالموقع مقابل تقدم بطيء)
  else if (remainingCustody > 0 && (completionRate < 35 || remainingCustody > actuallyConsumed)) {
    caseCode = 'surplus_custody';
    caseTitle = 'توفر مخزون مواد بالموقع يستوجب تسريع الاستهلاك';
    caseOutputText = `يتوفر مخزون مواد بالموقع (${remainingCustody.toLocaleString()} ${unitLabel}) مقابل معدل إنجاز (${completionRate}%).`;
    recommendedDecision = 'استهلاك المخزون المتاح بالموقع أولاً والتحقق من خطة الاستكمال قبل طلب أو صرف أي دفعات جديدة.';
    actionRequired = 'التحقق من سلامة التخزين الميداني وجدولة الاستهلاك.';
  }
  // Normal / Completed
  else {
    caseCode = 'normal_execution';
    caseTitle = completionRate === 100 ? 'مكتملة وموقف المواد منضبط' : 'مستمرة وحركة المواد متوازنة';
    caseOutputText = completionRate === 100 
      ? `تم استكمال المبادرة بنسبة 100% واستهلاك مخصص ${materialName} بنجاح.`
      : `الإنفاق الاستهلاكي لمادة ${materialName} يسير بشكل طبيعي مع تقدم الأعمال الميدانية (${completionRate}%).`;
    recommendedDecision = completionRate === 100 ? 'أرشفة المبادرة وتوثيق استلام الأعمال.' : 'متابعة جدول التوريد والإنجاز الميداني الدوري.';
    actionRequired = 'متابعة المراقبة الميدانية الدورية.';
  }

  // Over-disbursement diagnostic signal (صرف فوق المعتمد)
  const isOverDisbursed = disbursedByUnit > approvedByStudy && approvedByStudy > 0;
  const overDisbursedAmount = isOverDisbursed ? (disbursedByUnit - approvedByStudy) : 0;
  const overDisbursedSignal = isOverDisbursed 
    ? (materialType === 'cement' ? 'صرف إسمنت فوق المعتمد' : 'صرف ديزل فوق المعتمد') 
    : null;

  return {
    materialType,
    materialName,
    unitLabel,
    unitCostYER,
    approvedByStudy,
    disbursedByUnit,
    unitInventory,
    actuallyConsumed,
    remainingCustody,
    excessConsumed,
    excessRequiresVerification,
    consumptionRate,
    estimatedRemainingToComplete,
    caseCode,
    caseTitle,
    caseOutputText,
    recommendedDecision,
    actionRequired,
    hasTechnicalDeviation: hasDev,
    deviationReasons: devReasons,
    isOverDisbursed,
    overDisbursedAmount,
    overDisbursedSignal
  };
}

/**
 * Generate a full comprehensive analysis across Cement and Diesel for an Initiative
 */
export function analyzeInitiativeMaterials(initiative: Initiative): ComprehensiveMaterialAnalysis {
  const technicalDev = detectTechnicalDeviation(
    initiative.approvedStudyQuantities,
    initiative.executedWorkQuantities
  );

  const cementAnalysis = analyzeSingleMaterial(
    'cement',
    initiative.materialsApproved,
    initiative.materialsDisbursed,
    initiative.materialsUsed,
    initiative.completionRate,
    initiative.status,
    initiative.stagnationReason,
    technicalDev
  );

  const dieselAnalysis = analyzeSingleMaterial(
    'diesel',
    initiative.dieselApproved,
    initiative.dieselDisbursed,
    initiative.dieselUsed,
    initiative.completionRate,
    initiative.status,
    initiative.stagnationReason,
    technicalDev
  );

  // Determine overall case priority:
  // Priority order: disbursed_not_started > stopped_with_custody > consumed_exceeds_disbursed > depleted_deviation > surplus_custody > depleted_aligned > normal_execution
  let overallCaseCode = 'normal_execution';
  let overallCaseTitle = 'موقف المواد والعهد الميدانية متوازن';
  let overallExecutiveSummary = '';
  let overallSmartDecision = 'مراجعة وتوثيق التقارير الميدانية الدورية.';
  let primaryAlertBadge: ComprehensiveMaterialAnalysis['primaryAlertBadge'] = undefined;

  if (cementAnalysis.caseCode === 'disbursed_not_started' || dieselAnalysis.caseCode === 'disbursed_not_started') {
    overallCaseCode = 'disbursed_not_started';
    overallCaseTitle = 'مواد عهدة لدى المبادرة ولم يبدأ التنفيذ';
    overallExecutiveSummary = 'توجد مواد مصروفة كعهدة ميدانية للمبادرة مع توقف تام لمرحلة البدء (نسبة الإنجاز 0%). يتطلب تحديد المسؤولية الميدانية ووضع مهلة تنفيذ ملزمة.';
    overallSmartDecision = 'مواد عهدة لدى المبادرة ولم يبدأ التنفيذ - تحديد المسؤولية الميدانية والمهلة الزمانية.';
    primaryAlertBadge = { text: '🚨 عهدة موقوفة ولم يبدأ التنفيذ', variant: 'danger' };
  } else if (cementAnalysis.caseCode === 'stopped_with_custody' || dieselAnalysis.caseCode === 'stopped_with_custody') {
    overallCaseCode = 'stopped_with_custody';
    overallCaseTitle = 'المبادرة متوقفة ويوجد رصيد مواد عهدة لدى المبادرة';
    overallExecutiveSummary = `توقفت المبادرة عند نسبة إنجاز (${initiative.completionRate}%) بالرغم من توفر رصيد عهدة بالموقع (${cementAnalysis.remainingCustody.toLocaleString()} كيس أسمنت / ${dieselAnalysis.remainingCustody.toLocaleString()} لتر ديزل).`;
    overallSmartDecision = 'لا يتم صرف مواد إضافية قبل معالجة سبب توقف التنفيذ والتحقق من الرصيد والعهد الميدانية.';
    primaryAlertBadge = { text: '⛔ تعثر مع وجود عهدة ميدانية', variant: 'warning' };
  } else if (cementAnalysis.caseCode === 'consumed_exceeds_disbursed' || dieselAnalysis.caseCode === 'consumed_exceeds_disbursed') {
    overallCaseCode = 'consumed_exceeds_disbursed';
    overallCaseTitle = 'المستهلك الفعلي يتجاوز المصروف (مساهمة مجتمعية إضافية)';
    overallExecutiveSummary = 'الاستهلاك الفعلي للمواد يتجاوز شحنات المصروف من الوحدة. تم استكمال جانب من الأعمال بتمويل أو مساهمة مجتمعية ذاتية ويجب توثيق واحتساب الفرق.';
    overallSmartDecision = 'احتساب الفرق ضمن مساهمة المجتمع بعد التحقق التوثيقي الميداني واعتمادها.';
    primaryAlertBadge = { text: '🤝 تغطية بمساهمة مجتمعية إضافية', variant: 'info' };
  } else if (cementAnalysis.caseCode === 'depleted_deviation' || dieselAnalysis.caseCode === 'depleted_deviation') {
    overallCaseCode = 'depleted_deviation';
    overallCaseTitle = 'انتهاء المواد دون اكتمال المشروع (انحراف تنفيذي عن الدراسة)';
    overallExecutiveSummary = `استنفاد المواد المصروفة مع عدم اكتمال المشروع (نسبة الإنجاز ${initiative.completionRate}%). لوحظ وجود انحرافات تنفيذية عن الدراسة المعتمدة تتطلب مراجعة فنية.`;
    overallSmartDecision = 'تحليل سبب الانحراف بين كمية المواد والدراسة قبل اتخاذ قرار الدعم الإضافي.';
    primaryAlertBadge = { text: '⚠️ انتهاء المواد وانحراف عن الدراسة', variant: 'danger' };
  } else if (cementAnalysis.caseCode === 'surplus_custody' || dieselAnalysis.caseCode === 'surplus_custody') {
    overallCaseCode = 'surplus_custody';
    overallCaseTitle = 'وجود فائض مواد عهدة لدى المبادرة';
    overallExecutiveSummary = `يتوفر رصيد عهدة مرتفع بالموقع لم يتم استهلاكه بعد (${cementAnalysis.remainingCustody.toLocaleString()} كيس أسمنت) مقابل تقدم بطيء.`;
    overallSmartDecision = 'مراجعة الرصيد قبل أي صرف جديد والتحقق من سلامة التخزين وخطة الاستكمال.';
    primaryAlertBadge = { text: '📦 رصيد عهدة ميدانية غير مستغل', variant: 'warning' };
  } else if (cementAnalysis.caseCode === 'depleted_aligned' || dieselAnalysis.caseCode === 'depleted_aligned') {
    overallCaseCode = 'depleted_aligned';
    overallCaseTitle = 'المواد متوافقة مع الدراسة ولا يوجد رصيد عهدة';
    overallExecutiveSummary = `تم استهلاك المواد المصروفة المعتمدة وفق الدراسة الفنية مع بقاء نسبة إنجاز متبقية (${initiative.completionRate}%). المبادرة مؤهلة لدراسة الاحتياج الإضافي.`;
    overallSmartDecision = 'تقييم الاحتياج الإضافي للاستكمال والدفع بالاعتماد التكميلي بعد التحقق.';
    primaryAlertBadge = { text: '🔄 مؤهلة لدعم تكميلي بالمواد', variant: 'info' };
  } else {
    overallExecutiveSummary = initiative.completionRate === 100 
      ? 'المبادرة منجزة ومكتملة تماماً، وتم استهلاك وتوثيق العهد الميدانية بنجاح.'
      : `الأعمال التنفيذية مستمرة والعهدة الميدانية منضبطة (نسبة الإنجاز ${initiative.completionRate}%).`;
    overallSmartDecision = initiative.completionRate === 100
      ? 'أرشفة المبادرة وإغلاق ملف العهد الميدانية.'
      : 'استمرار المتابعة الدورية الميدانية وصرف الدفعات حسب الجدول الزمني.';
    primaryAlertBadge = initiative.completionRate === 100
      ? { text: '✅ عهدة مكتملة ومغلقة', variant: 'success' }
      : { text: '⚡ عهدة جارية وفي مسارها', variant: 'info' };
  }

  return {
    cement: cementAnalysis,
    diesel: dieselAnalysis,
    overallCaseCode,
    overallCaseTitle,
    overallExecutiveSummary,
    overallSmartDecision,
    primaryAlertBadge
  };
}
