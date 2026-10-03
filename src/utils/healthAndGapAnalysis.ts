import { Initiative, UserRole } from '../types';
import { parseNum } from './numberAndDistrictUtils';
import { إنشاء_الملف_التنفيذي_للمبادرة, الملف_التنفيذي_للمبادرة } from './developmentDecisionEngine';

export type FiveTierCategoryKey =
  | 'not_started'
  | 'needs_intervention_unused_disbursed'
  | 'active_needs_next_tranche'
  | 'active_fully_disbursed'
  | 'completed_with_unit_credit'
  | 'fully_completed_and_disbursed';

export interface FiveTierClassification {
  key: FiveTierCategoryKey;
  label: string;
  shortTitle: string;
  badgeClass: string;
  borderClass: string;
  icon: string;
  description: string;
  interventionProposal: string;
}

export interface InitiativeAnalysis {
  initiative: Initiative;
  healthScore: number; // 0 - 100
  healthCategory: 'good' | 'warning' | 'critical';
  healthLabel: string;
  healthBadgeClass: string;
  healthBreakdown: {
    completionScore: number; // Max 30
    workRatioScore: number; // Max 25
    materialEfficiencyScore: number; // Max 20
    costSupportScore: number; // Max 15
    communityContributionScore: number; // Max 10
  };
  executionGap: {
    approvedPavingM2: number;
    executedPavingM2: number;
    pavingGapM2: number;
    approvedConcreteM3: number;
    executedConcreteM3: number;
    concreteGapM3: number;
    approvedLengthM: number;
    executedLengthM: number;
    lengthGapM: number;
    completionGapRate: number;
    gapStatus: 'delayed' | 'nearly_complete' | 'needs_completion';
    gapStatusLabel: string;
  };
  resourceEfficiency: {
    cementAppr: number;
    cementDisbursed: number;
    cementUsed: number;
    cementRemaining: number;
    cementUnitCreditBalance: number;
    cementOverused: number;
    isCementOverused: boolean;
    cementEfficiencyPct: number;
    dieselAppr: number;
    dieselDisbursed: number;
    dieselUsed: number;
    dieselRemaining: number;
    dieselUnitCreditBalance: number;
    dieselOverused: number;
    isDieselOverused: boolean;
    dieselEfficiencyPct: number;
    overallEfficiencyPct: number;
    pattern: 'effective' | 'surplus_reallocate' | 'high_cost_low_exec';
    patternLabel: string;
    patternBadgeClass: string;
  };
  priorityClassification: {
    level: 'ready_for_completion' | 'needs_followup' | 'needs_decision';
    levelLabel: string;
    priorityBadgeClass: string;
    reason: string;
  };
  fiveTierClassification: FiveTierClassification;
  recommendation: string;
  decisionStatus: 'قيد الدراسة' | 'تم التوجيه' | 'يحتاج تدخل مباشر' | 'مكتملة آمنة';
}

/**
 * Mathematically calculate Health Score, Gap Analysis, Resource Efficiency & Priority for a single Initiative.
 */
export function analyzeInitiative(init: Initiative): InitiativeAnalysis {
  const completionRate = Math.min(100, Math.max(0, parseNum(init.completionRate)));
  const appr = init.approvedStudyQuantities || {};
  const exec = init.executedWorkQuantities || {};

  // Quantities parsing
  const lengthAppr = parseNum(appr.lengthCompleted);
  const lengthExec = parseNum(exec.lengthCompleted);
  const pavingAppr = parseNum(appr.stonePaving);
  const pavingExec = parseNum(exec.stonePaving);
  const concreteAppr = parseNum(appr.concretePaving);
  const concreteExec = parseNum(exec.concretePaving);

  // Materials parsing - Strict mathematical inventory accounting
  // 1. الأسمنت المتبقي بمخازن المبادرة (الميدان) = المنصرف للمبادرة - المستخدم المستهلك بالعمل
  // 2. الرصيد غير المنصرف لدى الوحدة التنفيذية = المعتمد الكلي - المنصرف (المحتفظ به لدى الوحدة)
  const cementAppr = parseNum(init.materialsApproved);
  const cementDisbursed = parseNum(init.materialsDisbursed);
  const cementUsed = parseNum(init.materialsUsed);

  // Field Remaining (sitting in initiative site store): Disbursed minus Used
  const cementRemaining = Math.max(0, cementDisbursed - cementUsed);
  // Unit Credit Balance (sitting at executive unit, not yet disbursed): Approved minus Disbursed
  const cementUnitCreditBalance = Math.max(0, cementAppr - cementDisbursed);
  // Overused Cement (used more than disbursed from unit):
  const cementOverused = Math.max(0, cementUsed - cementDisbursed);
  const isCementOverused = cementUsed > cementDisbursed;

  const dieselAppr = parseNum(init.dieselApproved);
  const dieselDisbursed = parseNum(init.dieselDisbursed);
  const dieselUsed = parseNum(init.dieselUsed);

  const dieselRemaining = Math.max(0, dieselDisbursed - dieselUsed);
  const dieselUnitCreditBalance = Math.max(0, dieselAppr - dieselDisbursed);
  const dieselOverused = Math.max(0, dieselUsed - dieselDisbursed);
  const isDieselOverused = dieselUsed > dieselDisbursed;

  // Financials - Strict accurate reading from database without artificial inflation
  const unitContrib = parseNum(init.unitContribution);
  const commContrib = parseNum(init.communityContribution) > 0
    ? parseNum(init.communityContribution)
    : (init.contributions && init.contributions.length > 0
        ? init.contributions.reduce((sum, c) => sum + parseNum(c.value), 0)
        : 0);
  const cost = parseNum(init.cost) > 0
    ? parseNum(init.cost)
    : (parseNum(init.estimatedCost) > 0
        ? parseNum(init.estimatedCost)
        : (unitContrib + commContrib));

  // 1. Completion Score (0 to 30)
  const completionScore = Math.round((completionRate / 100) * 30);

  // 2. Executed Work vs Approved Work Ratio Score (0 to 25)
  let workRatioSum = 0;
  let workItemCount = 0;

  if (lengthAppr > 0) {
    workRatioSum += Math.min(1.2, lengthExec / lengthAppr);
    workItemCount++;
  }
  if (pavingAppr > 0) {
    workRatioSum += Math.min(1.2, pavingExec / pavingAppr);
    workItemCount++;
  }
  if (concreteAppr > 0) {
    workRatioSum += Math.min(1.2, concreteExec / concreteAppr);
    workItemCount++;
  }

  const avgWorkRatio = workItemCount > 0 ? workRatioSum / workItemCount : (completionRate / 100);
  const workRatioScore = Math.round(Math.min(25, avgWorkRatio * 25));

  // 3. Material Efficiency Score (0 to 20)
  let cementEffRatio = 1;
  if (cementDisbursed > 0) {
    // Expected used cement ratio vs completion rate
    const cementUsageRate = cementUsed / cementDisbursed;
    const expectedRate = completionRate / 100;
    if (cementUsageRate > 0) {
      // If used too much cement for low completion, penalty. If used aligned cement, high score.
      const diff = Math.abs(cementUsageRate - expectedRate);
      cementEffRatio = Math.max(0.2, 1 - diff);
    } else if (completionRate > 0) {
      cementEffRatio = 0.5; // used 0 cement despite progress
    }
  }

  let dieselEffRatio = 1;
  if (dieselDisbursed > 0) {
    const dieselUsageRate = dieselUsed / dieselDisbursed;
    const expectedRate = completionRate / 100;
    if (dieselUsageRate > 0) {
      const diff = Math.abs(dieselUsageRate - expectedRate);
      dieselEffRatio = Math.max(0.2, 1 - diff);
    }
  }

  const matEffRatio = (cementEffRatio + dieselEffRatio) / 2;
  const materialEfficiencyScore = Math.round(matEffRatio * 20);

  // 4. Support vs Outcome Score (0 to 15)
  // Check if outcome aligns with unit support spent
  let costSupportRatio = 0.8;
  if (unitContrib > 0 && cost > 0) {
    const supportRatio = unitContrib / cost;
    if (completionRate >= 50 && supportRatio <= 0.8) {
      costSupportRatio = 1.0;
    } else if (completionRate < 30 && supportRatio > 0.5) {
      costSupportRatio = 0.4;
    }
  }
  const costSupportScore = Math.round(costSupportRatio * 15);

  // 5. Community Contribution Presence (0 to 10)
  const hasCommunityContrib = commContrib > 0 || init.ownerConfirmed || (init.contributions && init.contributions.length > 0);
  const communityContributionScore = hasCommunityContrib ? 10 : 0;

  // Central Engine Dossier - Single Source of Truth
  const engineDossier = إنشاء_الملف_التنفيذي_للمبادرة(init);
  const totalHealthScore = engineDossier.المؤشرات.درجة_صحة_المبادرة;

  let healthCategory: 'good' | 'warning' | 'critical' = 'good';
  let healthLabel = '🟢 أداء جيد وقابل للاستمرار';
  let healthBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';

  if (totalHealthScore < 50 || init.status === 'stagnant' || init.status === 'stopped') {
    healthCategory = 'critical';
    healthLabel = '🔴 يحتاج قرار أو مراجعة';
    healthBadgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
  } else if (totalHealthScore < 75) {
    healthCategory = 'warning';
    healthLabel = '🟡 يحتاج متابعة';
    healthBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  // Execution Gap
  const lengthGapM = Math.max(0, lengthAppr - lengthExec);
  const pavingGapM2 = Math.max(0, pavingAppr - pavingExec);
  const concreteGapM3 = Math.max(0, concreteAppr - concreteExec);
  const completionGapRate = Math.max(0, 100 - completionRate);

  let gapStatus: 'delayed' | 'nearly_complete' | 'needs_completion' = 'needs_completion';
  let gapStatusLabel = '🛠️ تحتاج استكمال';

  if (completionRate >= 85) {
    gapStatus = 'nearly_complete';
    gapStatusLabel = '🏁 قريبة من الاكتمال';
  } else if (completionRate < 35 && (cementDisbursed > 0 || init.status === 'stagnant' || init.status === 'stopped')) {
    gapStatus = 'delayed';
    gapStatusLabel = '⏱️ أعمال متأخرة';
  }

  // Resource Efficiency Pattern
  const cementEffPct = cementDisbursed > 0 ? Math.round((cementUsed / cementDisbursed) * 100) : (completionRate > 0 ? 100 : 0);
  const dieselEffPct = dieselDisbursed > 0 ? Math.round((dieselUsed / dieselDisbursed) * 100) : (completionRate > 0 ? 100 : 0);
  const overallEfficiencyPct = Math.round((cementEffPct + dieselEffPct) / 2);

  let pattern: 'effective' | 'surplus_reallocate' | 'high_cost_low_exec' = 'effective';
  let patternLabel = '✅ استخدام فعال للموارد';
  let patternBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (cementDisbursed > 0 && cementUsed / cementDisbursed > 0.6 && completionRate < 30) {
    pattern = 'high_cost_low_exec';
    patternLabel = '⚠️ صرف مرتفع مقابل إنجاز منخفض';
    patternBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (completionRate >= 85 && cementRemaining > 50) {
    pattern = 'surplus_reallocate';
    patternLabel = '🔄 موارد متبقية تحتاج توجيه';
    patternBadgeClass = 'bg-sky-50 text-sky-700 border-sky-200';
  }

  // Priority Classification
  let level: 'ready_for_completion' | 'needs_followup' | 'needs_decision' = 'needs_followup';
  let levelLabel = '🟡 تحتاج متابعة';
  let priorityBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
  let reason = 'تقدم متوسط في التنفيذ ومتابعة ميدانية لتسريع الإنجاز.';

  if (completionRate >= 80 && (cementRemaining > 0 || dieselRemaining > 0 || completionGapRate <= 20)) {
    level = 'ready_for_completion';
    levelLabel = '🟢 جاهزة للإكمال';
    priorityBadgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
    reason = `نسبة إنجاز مرتفعة (${completionRate}%) وتوفر مواد متبقية (${cementRemaining} كيس أسمنت) تسمح بحسم وإغلاق المبادرة.`;
  } else if (pattern === 'high_cost_low_exec' || totalHealthScore < 50 || init.status === 'stagnant' || init.status === 'stopped') {
    level = 'needs_decision';
    levelLabel = '🔴 تحتاج قرار تنفيذي';
    priorityBadgeClass = 'bg-rose-100 text-rose-900 border-rose-300';
    reason = `فجوة بين المواد المنصرفة (${cementDisbursed} كيس) ونسبة الإنجاز (${completionRate}%) تتطلب قرار قيادي لإعادة التوجيه.`;
  } else {
    reason = `نسبة الإنجاز الحالي (${completionRate}%) تتطلب استمرار التنسيق مع اللجان المجتمعية لاستكمال الأعمال المتأخرة.`;
  }

  // 5-Tier Executive Development Categorization (مطابقة لأسس إدارة المشاريع التنموية)
  let fiveKey: FiveTierCategoryKey = 'not_started';
  let fiveLabel = 'لم يبدأ (صفر إنجاز ولم يتم الصرف)';
  let fiveShortTitle = 'لم يبدأ ⏳';
  let fiveBadgeClass = 'bg-slate-100 text-slate-800 border-slate-300';
  let fiveBorderClass = 'border-slate-400';
  let fiveIcon = '⏳';
  let fiveDescription = 'مبادرة مسجلة لم تبدأ أعمالها الميدانية بعد (نسبة إنجاز 0%) ولم يُصرف لها أي كميات أسمنت أو ديزل من الوحدة التنفيذية.';
  let fiveProposal = 'تفعيل التحشيد المجتمعي عبر الفرسان والتنسيق مع اللجنة المحلية، وتحديد مهلة 30 يوماً لبدء العمل، وإلا يتم سحب الاعتماد وتوجيهه لمبادرة أخرى تفادياً لتجميد الموارد.';

  if (completionRate >= 90) {
    if (cementUnitCreditBalance > 0 || dieselUnitCreditBalance > 0) {
      fiveKey = 'completed_with_unit_credit';
      fiveLabel = 'منجزة ميدانياً ويتبقى لدى الوحدة رصيد (وفر اعتمادي)';
      fiveShortTitle = 'منجزة + رصيد بالوحدة 🎯';
      fiveBadgeClass = 'bg-teal-100 text-teal-900 border-teal-300';
      fiveBorderClass = 'border-teal-500';
      fiveIcon = '🎯';
      fiveDescription = `أنجزت المبادرة أعمالها الميدانية بنسبة (${completionRate}%)، وحققت وفراً اعتماديّاً لم يُصرف لدى الوحدة قدره (${cementUnitCreditBalance} كيس أسمنت) وذلك لترشيد الاستهلاك واستغلال المواد بالموقع.`;
      fiveProposal = `إجراء الاستلام الهندسي النهائي والتسوية الماليّة والمخزنية، وتسجيل الوفر الاعتمادي (${cementUnitCreditBalance} كيس) رسمياً لإعادة تخصيصه لدعم مبادرات أخرى بحاجة بالمديرية.`;
    } else {
      fiveKey = 'fully_completed_and_disbursed';
      fiveLabel = 'منجزة كلياً ومستلمة كامل الكمية ومستهلكة (إغلاق تام)';
      fiveShortTitle = 'إغلاق تام ومكتمل 🏁';
      fiveBadgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
      fiveBorderClass = 'border-emerald-600';
      fiveIcon = '🏁';
      fiveDescription = `مبادرة مكتملة ومستوفية للشروط بنسبة (${completionRate}%)، تم استلام كامل الحصة المعتمدة (${cementDisbursed} كيس أسمنت) واستهلاكها بالكامل في دك ورصف الطريق.`;
      fiveProposal = 'إصدار شهادة الاستلام النهائي للمشروع وتوثيق قصة النجاح التنموية، وتشكيل لجنة صيانة مجتمعية دورية للحفاظ على المنشأة.';
    }
  } else if (completionRate === 0 && cementDisbursed === 0) {
    fiveKey = 'not_started';
    fiveLabel = 'لم يبدأ (صفر إنجاز ولم يتم الصرف)';
    fiveShortTitle = 'لم يبدأ ⏳';
    fiveBadgeClass = 'bg-slate-100 text-slate-800 border-slate-300';
    fiveBorderClass = 'border-slate-400';
    fiveIcon = '⏳';
    fiveDescription = 'مبادرة مسجلة لم تبدأ أعمالها الميدانية بعد (نسبة إنجاز 0%) ولم يُصرف لها أي كميات أسمنت أو ديزل من الوحدة التنفيذية.';
    fiveProposal = 'تفعيل التحشيد المجتمعي عبر الفرسان والتنسيق مع اللجنة المحلية، وتحديد مهلة 30 يوماً لبدء العمل، وإلا يتم سحب الاعتماد وتوجيهه لمبادرة أخرى تفادياً لتجميد الموارد.';
  } else if (cementDisbursed > 0 && (cementUsed === 0 || (cementRemaining / cementDisbursed >= 0.5 && completionRate < 35) || init.status === 'stagnant' || init.status === 'stopped')) {
    fiveKey = 'needs_intervention_unused_disbursed';
    fiveLabel = 'تحتاج تدخل عاجل (تم الصرف ولم تُستخدم الكمية المنصرفة / مخزون معرض للتلف)';
    fiveShortTitle = 'تدخل عاجل - مواد غير مستخدمة 🚨';
    fiveBadgeClass = 'bg-rose-100 text-rose-900 border-rose-300';
    fiveBorderClass = 'border-rose-600';
    fiveIcon = '🚨';
    fiveDescription = `تم صرف (${cementDisbursed} كيس أسمنت)، إلا أن الكمية المنصرفة لم تُستخدم بالكامل وتراكمت بالمخزن الميداني (${cementRemaining} كيس متبقي بمخزن المبادرة) مع نسبة إنجاز متدنية (${completionRate}%).`;
    fiveProposal = 'تشكيل لجنة نزول ومتابعة ميدانية فورية للتحقق من سلامة الأسمنت المخزون وتوجيه إنذار للجنة، وفي حال عدم الاستجابة يتم إصدار محضر تدوير المواد (Reallocation) ونقل الأسمنت لمبادرة مجاورة نشطة.';
  } else if (cementUnitCreditBalance === 0 && cementDisbursed >= cementAppr && cementDisbursed > 0) {
    fiveKey = 'active_fully_disbursed';
    fiveLabel = 'استلمت كامل الاعتماد وتستمر بالتنفيذ (لا يوجد رصيد متبقي بالوحدة)';
    fiveShortTitle = 'مستلمة بالكامل + مستمرة 📦';
    fiveBadgeClass = 'bg-purple-100 text-purple-900 border-purple-300';
    fiveBorderClass = 'border-purple-500';
    fiveIcon = '📦';
    fiveDescription = `استلمت المبادرة كامل الكمية المعتمدة لها من الوحدة التنفيذية (${cementDisbursed} كيس أسمنت) ونفد رصيدها لدى الوحدة بالكامل (رصيد الوحدة = 0 كيس)، وتصل نسبة الإنجاز الحالية إلى (${completionRate}%).`;
    fiveProposal = `متابعة واستكمال تنفيذ الأعمال المتبقية (${Math.max(0, 100 - completionRate)}%) باستغلال المخزون الميداني المتبقي بالموقع (${cementRemaining} كيس) والمساهمات الذاتية، حيث تم تسليم كامل مخصصات الوحدة التنفيذية.`;
  } else {
    fiveKey = 'active_needs_next_tranche';
    fiveLabel = 'استخدمت المنصرف كاملاً ويتبقى رصيد عند الوحدة (جاهزة للدفعة التالية)';
    fiveShortTitle = 'تتطلب الدفعة التالية ⚡';
    fiveBadgeClass = 'bg-blue-100 text-blue-900 border-blue-300';
    fiveBorderClass = 'border-blue-500';
    fiveIcon = '⚡';
    fiveDescription = `استهلكت المبادرة المنصرف الميداني بنجاح (${cementUsed} كيس مستهلك) وتستمر بالأعمال بنسبة (${completionRate}%)، وتتطلب توريد الدفعة المستحقة من رصيدها غير المنصرف لدى الوحدة (${cementUnitCreditBalance} كيس).`;
    fiveProposal = `المصادقة الفورية على محاضر المعاينة المرحلية وصرف الدفعة التالية (${cementUnitCreditBalance} كيس متبقي لدى الوحدة) لمواصلة صب الخرسانة وتفادي توقف العمالة المجتمعية.`;
  }

  // Adjust description/proposal if overused cement is detected
  if (isCementOverused) {
    fiveDescription += ` ⚠️ تنبيه: يوجد استهلاك زائد ميدانياً بـ (${cementOverused} كيس أسمنت) عن المنصرف من الوحدة.`;
    fiveProposal = `معاينة الموقع وتثبيت الإنجاز الفعلي، وإصدار قرار بمطابقة الكميات المستهلكة (${cementUsed} كيس) وتعويض الزيادة من أي رصيد اعتمادي متاح أو تسويتها رسمياً.`;
  }

  const fiveTierClassification: FiveTierClassification = {
    key: fiveKey,
    label: fiveLabel,
    shortTitle: fiveShortTitle,
    badgeClass: fiveBadgeClass,
    borderClass: fiveBorderClass,
    icon: fiveIcon,
    description: fiveDescription,
    interventionProposal: fiveProposal,
  };

  // Recommendation strictly aligned with executive intervention proposal
  const recommendation = fiveProposal;

  // Decision Status
  let decisionStatus: 'قيد الدراسة' | 'تم التوجيه' | 'يحتاج تدخل مباشر' | 'مكتملة آمنة' = 'قيد الدراسة';
  if (completionRate >= 95) {
    decisionStatus = 'مكتملة آمنة';
  } else if (fiveKey === 'needs_intervention_unused_disbursed' || level === 'needs_decision') {
    decisionStatus = 'يحتاج تدخل مباشر';
  } else if (fiveKey === 'active_needs_next_tranche' || level === 'ready_for_completion') {
    decisionStatus = 'تم التوجيه';
  }

  return {
    initiative: init,
    healthScore: totalHealthScore,
    healthCategory,
    healthLabel,
    healthBadgeClass,
    healthBreakdown: {
      completionScore,
      workRatioScore,
      materialEfficiencyScore,
      costSupportScore,
      communityContributionScore,
    },
    executionGap: {
      approvedPavingM2: pavingAppr,
      executedPavingM2: pavingExec,
      pavingGapM2,
      approvedConcreteM3: concreteAppr,
      executedConcreteM3: concreteExec,
      concreteGapM3,
      approvedLengthM: lengthAppr,
      executedLengthM: lengthExec,
      lengthGapM,
      completionGapRate,
      gapStatus,
      gapStatusLabel,
    },
    resourceEfficiency: {
      cementAppr,
      cementDisbursed,
      cementUsed,
      cementRemaining,
      cementUnitCreditBalance,
      cementOverused,
      isCementOverused,
      cementEfficiencyPct: cementEffPct,
      dieselAppr,
      dieselDisbursed,
      dieselUsed,
      dieselRemaining,
      dieselUnitCreditBalance,
      dieselOverused,
      isDieselOverused,
      dieselEfficiencyPct: dieselEffPct,
      overallEfficiencyPct,
      pattern,
      patternLabel,
      patternBadgeClass,
    },
    priorityClassification: {
      level,
      levelLabel,
      priorityBadgeClass,
      reason,
    },
    fiveTierClassification,
    recommendation,
    decisionStatus,
  };
}

export interface ProblemDecisionMapping {
  condition: string;
  cause: string;
  action: string;
  responsibleEntity: string;
}

export interface EngineeringPavingSpecs {
  thicknessCm: number;
  thicknessLabel: string;
  mixRatio: string;
  expansionJoints: string;
  curingDays: string;
  complianceStatus: 'compliant' | 'warning' | 'non_compliant';
  complianceNotes: string;
}

export interface MaterialOveruseAnalysis {
  isOverused: boolean;
  excessCementBags: number;
  excessDieselLiters: number;
  possibleCauses: string[];
  recommendationNote: string;
  deficitIndicatorImpact: string;
}

export interface AIDevelopmentDecision {
  initiativeId: string;
  initiativeName: string;
  district: string;
  subDistrict: string;
  completionRate: number;
  cementDisbursed: number;
  cementUsed: number;
  cementRemaining: number;
  cementUnitCreditBalance: number;
  communityContributionVal: number;
  stagnationMonths: number;
  recordedObstacles: string[];
  
  // 5 Auto Operational Classifications (المرحلة الثانية)
  operationalClassification: 'ongoing' | 'stopped' | 'struggling_recoverable' | 'struggling_escalation' | 'completed';
  classificationLabel: string;
  classificationBadgeClass: string;
  classificationIcon: string;

  // Severity & Diagnostics
  riskSeverity: 'low' | 'medium' | 'high' | 'critical';
  riskSeverityLabel: 'منخفضة' | 'متوسطة' | 'مرتفعة' | 'حرجة';
  riskBadgeClass: string;
  diagnosticSummary: string; // التشخيص الحالي الشامل
  primaryStagnationCause: string; // سبب التعثر الرئيسي
  proposedExecutiveDecision: string; // القرار المقترح للقيادة
  responsibleEntity: string; // الجهة المسؤولة عن الإجراء
  nextProposedAction: string; // الإجراء التالي المقترح
  
  // Wise Executive Recommendation
  smartRecommendation: string;
  
  // Targeted Automatic Alerts & Directives
  engineerDirective: string;
  knightsDirective: string;
  supervisorDirective: string;

  // V3.1 Specific Decision Engine Attributes
  batchDisbursementRecommendation?: string;
  materialOveruseAnalysis?: MaterialOveruseAnalysis;
  decisionMatrixItem?: ProblemDecisionMapping;
  engineeringSpecs?: EngineeringPavingSpecs;
}

export interface SmartAlert {
  id: string;
  initiativeId: string;
  initiativeName: string;
  district: string;
  subDistrict?: string;
  alertType: 'stagnation' | 'material_risk' | 'field_reminder' | 'executive_escalation';
  severity: 'info' | 'warning' | 'danger' | 'critical';
  title: string;
  message: string;
  targetRole: UserRole | 'all';
  timestamp: string;
  proposedAction: string;
}

/**
 * Get engineering specs and compliance status for mountain road paving
 */
export function getEngineeringPavingSpecs(init: Initiative): EngineeringPavingSpecs {
  const isSteepOrMountain = Boolean(
    init.name?.includes('عقبة') || 
    init.name?.includes('انحدار') || 
    init.subDistrict?.includes('جبل') ||
    init.sector?.includes('طرق جبلية')
  );

  const thicknessCm = isSteepOrMountain ? 20 : 15;
  const thicknessLabel = isSteepOrMountain 
    ? '20 سم (مخصص للعقبات والانحدارات الجبلية الحادة)'
    : '15 سم (مخصص للطرقات الجبلية الفرعية العادية)';

  let complianceStatus: 'compliant' | 'warning' | 'non_compliant' = 'compliant';
  let complianceNotes = 'مطابق للمواصفات الهندسية المعيارية للرصف الجبلي.';

  // Check if reports indicate any quality/curing warnings
  if (init.reports && init.reports.length > 0) {
    const hasChallenge = init.reports.some(r => 
      r.challenges?.some(c => c.includes('تشقق') || c.includes('خلطة') || c.includes('رصف') || c.includes('جدران'))
    );
    if (hasChallenge) {
      complianceStatus = 'warning';
      complianceNotes = 'تنبيه تنموي/ميداني: توجد ملاحظات على جودة رصف الأحجار أو بناء الجدران الساندة. يرجى المتابعة الفورية.';
    }
  }

  return {
    thicknessCm,
    thicknessLabel,
    mixRatio: 'رصف حجري جودة عالية: أحجار مقطعة + ملاحط إسمنتية جافة وبناء الجدران الساندة',
    expansionJoints: 'تصريف مياه الأمطار ومصاريف العبارات الجانبية',
    curingDays: 'تأمين جودة التكحيل ورص الأحجار بالطريقة المعتمدة للرصف الجبلي',
    complianceStatus,
    complianceNotes
  };
}

/**
 * Get problem-to-decision matrix mapping for a given initiative
 */
export function getProblemDecisionMatrix(init: Initiative, stagnationCause?: string): ProblemDecisionMapping {
  const cause = stagnationCause || init.stagnationReason || 'توقف الحشد الأهلي أو نقص المواد';

  if (cause.includes('نزاع') || cause.includes('حرم') || cause.includes('أهلي') || cause.includes('تنازل')) {
    return {
      condition: 'متعثرة / متوقفة',
      cause: 'نزاعات أهلية على حواشي وطريق المبادرة',
      action: 'نزول لجنة الجمعية التعاونية وفرسان التنمية والسلطة المحلية لتوقيع وثيقة تنازل نافذة',
      responsibleEntity: 'الجمعية التعاونية + فرسان التنمية + المجلس المحلي'
    };
  }

  if (cause.includes('تخزين') || cause.includes('رطوبة') || cause.includes('مخزن') || cause.includes('تلف')) {
    return {
      condition: 'مخاطر مخزنية',
      cause: 'تخزين الأسمنت بطريقة غير مناسبة أو معرضة للرطوبة',
      action: 'نقل المواد لمخزن جاف مغلق ورفع الأكياس على منصات خشبية ارتفاع 15 سم',
      responsibleEntity: 'أمين المخزن + المهندس المباشر'
    };
  }

  if (cause.includes('أسمنت') || cause.includes('مساهمة') || cause.includes('بطء') || cause.includes('نقص')) {
    return {
      condition: 'بطء الإنجاز / توقف الدفعات',
      cause: 'نقص الأسمنت أو ضعف المساهمة الذاتية بالأهالي',
      action: 'حملة تحشيد مساهمات + دراسة صرف دفعة جديدة حسب الرصيد المتاح للوحدة',
      responsibleEntity: 'الجمعية التعاونية + وحدة التدخلات المركزية'
    };
  }

  return {
    condition: 'جارية / تحت التنفيذ',
    cause: 'تنفيذ منتظم لأعمال الرصف الحجري الجبلي',
    action: 'متابعة جودة الرصف الحجري وتوثيق نسبة الإنجاز الميداني لحشد الدفعة المستحقة',
    responsibleEntity: 'الجمعية التعاونية والمهندس الميداني'
  };
}

/**
 * AI Development Decision & Analysis Engine (المرحلة الثانية والثالثة)
 * Reads initiative state across all 5 evaluation dimensions, auto-classifies operational status,
 * calculates risk severity, primary cause, responsible party, and issues smart executive recommendations.
 */
export function getAIDevelopmentDecision(init: Initiative): AIDevelopmentDecision {
  const completionRate = Math.min(100, Math.max(0, parseNum(init.completionRate)));
  const cementDisbursed = parseNum(init.materialsDisbursed);
  const cementUsed = parseNum(init.materialsUsed);
  const cementRemaining = Math.max(0, cementDisbursed - cementUsed);
  const cementAppr = parseNum(init.materialsApproved);
  const cementUnitCreditBalance = Math.max(0, cementAppr - cementDisbursed);

  const commVal = parseNum(init.communityContribution) > 0
    ? parseNum(init.communityContribution)
    : (init.contributions && init.contributions.length > 0
        ? init.contributions.reduce((s, c) => s + parseNum(c.value), 0)
        : 0);

  const dieselDisbursed = parseNum(init.dieselDisbursed);
  const dieselUsed = parseNum(init.dieselUsed);

  // Extract obstacles from reports or stagnationReason
  const recordedObstacles: string[] = [];
  if (init.stagnationReason) {
    recordedObstacles.push(init.stagnationReason);
  }
  if (init.reports && init.reports.length > 0) {
    init.reports.forEach(r => {
      if (r.challenges && r.challenges.length > 0) {
        r.challenges.forEach(c => {
          if (c && !recordedObstacles.includes(c)) recordedObstacles.push(c);
        });
      }
    });
  }

  // Determine primary stagnation cause cleanly from evidence
  const primaryStagnationCause = init.stagnationReason || recordedObstacles[0] || (init.status === 'stagnant' || init.status === 'stopped' ? 'غير موثق بالبيانات الميدانية الحالية' : 'لا يوجد تعثر مسجل');
  const diagnosticSummary = `معدل الإنجاز (${completionRate}%) - الرصيد غير المصروف لدى الوحدة (${cementUnitCreditBalance} كيس) - المخزون المتبقي بالموقع (${cementRemaining} كيس)`;
  const stagnationMonths = (init.status === 'stagnant' || init.status === 'stopped') ? 1 : 0;

  // 1. Operational Classification (التصنيف الخماسي)
  let opClass: 'ongoing' | 'stopped' | 'struggling_recoverable' | 'struggling_escalation' | 'completed' = 'ongoing';
  let classLabel = 'مستمر ومجدول';
  let classBadgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
  let classIcon = '🟢';

  if (completionRate >= 95 || init.status === 'completed') {
    opClass = 'completed';
    classLabel = 'مكتمل ومستلم تنموياً';
    classBadgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
    classIcon = '🏁';
  } else if (init.status === 'stopped' || (completionRate === 0 && cementDisbursed > 0)) {
    opClass = 'stopped';
    classLabel = 'متوقف كلياً الميدان';
    classBadgeClass = 'bg-rose-100 text-rose-900 border-rose-300';
    classIcon = '🛑';
  } else if (init.status === 'stagnant' && (cementRemaining > 50 || completionRate >= 30)) {
    opClass = 'struggling_recoverable';
    classLabel = 'متعثر قابل للاستكمال';
    classBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
    classIcon = '⚡';
  } else if (init.status === 'stagnant' || (cementDisbursed > 0 && cementUsed === 0)) {
    opClass = 'struggling_escalation';
    classLabel = 'متعثر يحتاج قرار قيادي';
    classBadgeClass = 'bg-rose-100 text-rose-900 border-rose-300';
    classIcon = '🚨';
  } else {
    opClass = 'ongoing';
    classLabel = 'مستمر ونشط';
    classBadgeClass = 'bg-blue-100 text-blue-900 border-blue-300';
    classIcon = '🚀';
  }

  // 2. Risk Severity Calculation (درجة الخطورة)
  let riskSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let riskSeverityLabel: 'منخفضة' | 'متوسطة' | 'مرتفعة' | 'حرجة' = 'منخفضة';
  let riskBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';

  if (opClass === 'struggling_escalation' || (cementRemaining > 200 && completionRate < 15)) {
    riskSeverity = 'critical';
    riskSeverityLabel = 'حرجة';
    riskBadgeClass = 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse';
  } else if (opClass === 'stopped' || opClass === 'struggling_recoverable') {
    riskSeverity = 'high';
    riskSeverityLabel = 'مرتفعة';
    riskBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
  } else if (completionRate < 50) {
    riskSeverity = 'medium';
    riskSeverityLabel = 'متوسطة';
    riskBadgeClass = 'bg-blue-100 text-blue-900 border-blue-300';
  }

  // 4. Proposed Executive Decision (القرار التنفيذي المقترح)
  let proposedExecutiveDecision = '';
  let responsibleEntity = '';
  let nextProposedAction = '';

  if (opClass === 'completed') {
    proposedExecutiveDecision = 'المصادقة على محضر الإغلاق الفني للمبادرة واستلام المنشأة/المسار وتسليمها للجهة المستفيدة.';
    responsibleEntity = 'لجنة الاستلام الهندسي ووحدة التدخلات والسلطة المحلية';
    nextProposedAction = 'توثيق قصة النجاح وإصدار شهادة إنجاز تنموي معتمدة للمبادرة.';
  } else if (opClass === 'struggling_escalation') {
    proposedExecutiveDecision = 'تحرير إنذار رسمي للجنة وتشكيل لجنة جرد ميدانية لفحص سلامة المخزون ونقل/مناقلة المواد لمبادرة نشطة.';
    responsibleEntity = 'مدير المديرية والجمعية التعاونية ووحدة التدخلات';
    nextProposedAction = 'تنفيذ النزول الميداني للتحقق وتوقيع محضر المناقلة مع أصحاب المبادرة المجاورة.';
  } else if (opClass === 'stopped') {
    const isNewUnstarted = init.status === 'pending' || (completionRate === 0 && !init.materialsDisbursed && cementDisbursed === 0);
    if (isNewUnstarted) {
      proposedExecutiveDecision = 'اشتراط توثيق عقود التنازلات القانونية المكتوبة لحرم الطريق قبل الموافقة على اعتماد الدفعة الأولى من الأسمنت.';
      responsibleEntity = 'فرسان التنمية والجمعية التعاونية بالمديرية';
      nextProposedAction = 'تجميع عقلاء القرية واستيفاء عقود التنازل القانونية المكتوبة لحرم الطريق وإرفاقها بملف المبادرة.';
    } else {
      proposedExecutiveDecision = 'إيفاد لجنة تحكيم ومتابعة ميدانية لتنشيط اللجنة المجتمعية وحل النزاعات المحلية الميدانية وتوفير مادة الديزل لاستئناف أعمال الرصف الحجري الجبلي (علماً بأن التنازلات مكتملة وموثقة مسبقاً).';
      responsibleEntity = 'فرسان التنمية ومدير المديرية والجمعية التعاونية';
      nextProposedAction = 'تجميع عقلاء القرية وتنشيط حشد العمالة المجتمعية وتحديد موعد تنظيم نوبات الرصف الحجري.';
    }
  } else if (opClass === 'struggling_recoverable') {
    proposedExecutiveDecision = 'الموافقة على صرف الدفعة التشغيلية التكميلية (ديزل ودعم لوجستي) لاستكمال الرصف الحجري خلال 15 يوماً.';
    responsibleEntity = 'المشرف المباشر والمهندس الاستشاري والجمعية التعاونية';
    nextProposedAction = 'المصادقة على جدول العمل الميداني المكثف ومتابعة توريد المساهمات الذاتية من الأحجار.';
  } else {
    proposedExecutiveDecision = 'الاستمرار بالجدول التنموي المعتمد ومتابعة تقارير الإنجاز الأسبوعية.';
    responsibleEntity = 'لجنة المبادرة والمهندس الفني';
    nextProposedAction = 'رفع تقرير المعاينة المرحلية لاستكمال صرف الاعتماد المتبقي من الأسمنت.';
  }

  // 5. Smart Recommendation Banner Text
  let smartRecommendation = '';
  if (opClass === 'completed') {
    smartRecommendation = `المبادرة مكتملة بنسبة إنجاز ${completionRate}%. يوصى بإجراء الاستلام الهندسي النهائي، وتوثيق قصة النجاح التنموية، وتحرير محضر تسوية لصفة الأمان والسلامة للطريق.`;
  } else if (opClass === 'stopped') {
    const isNewUnstarted = init.status === 'pending' || (completionRate === 0 && !init.materialsDisbursed && cementDisbursed === 0);
    if (isNewUnstarted) {
      smartRecommendation = `المبادرة جديدة وقيد التجهيز. يوصى باستكمال توثيق عقود التنازلات القانونية عن حرم الطريق وفحص جاهزية المخزن قبل صرف الدفعة الأولى من الأسمنت.`;
    } else {
      smartRecommendation = `المبادرة معتمدة ومتوقفة ميدانياً (السبب: ${primaryStagnationCause}). يوصى بنزول لجنة ميدانية عاجلة وتحريك لجنة المجتمع والبدء الفوري برصف المقاطع المتبقية.`;
    }
  } else if (opClass === 'struggling_recoverable') {
    smartRecommendation = `المبادرة متعثرة مؤقتاً بالرغم من توفر مخزون أسمنت بالموقع قدره (${cementRemaining} كيس). يوصى بضخ عمالة مجتمعية مكثفة وصرف الديزل التشغيلي لاستكمال رصف العقبة الجبلية خلال 15 يوماً.`;
  } else if (opClass === 'struggling_escalation') {
    smartRecommendation = `المبادرة تواجه تعثراً حاداً وفجوة بين صرف الأسمنت (${cementDisbursed} كيس) والإنجاز الفعلي (${completionRate}%). يوصى بإنذار اللجنة وتدوير/مناقلة الأسمنت المهدد بالتلف لصالح مشروع نشط مجاور.`;
  } else {
    smartRecommendation = `المبادرة تسير بشكل منتظم بنسبة إنجاز ${completionRate}%. يوصى بمتابعة توريد المساهمات الذاتية والمصادقة على محضر المعاينة المرحلية لصرف الدفعة التالية (${cementUnitCreditBalance} كيس).`;
  }

  // Decision Rule for initiatives with un-disbursed unit balance but completed preparatory earthworks/diesel
  if (cementDisbursed === 0 && cementUnitCreditBalance > 0 && (dieselDisbursed > 0 || dieselUsed > 0) && (opClass === 'struggling_escalation' || opClass === 'stopped')) {
    proposedExecutiveDecision = `عقد اجتماع بين الجمعية التعاونية والسلطة المحلية بالمديرية مع اللجنة المجتمعية للمبادرة للتأكد من جاهزية المجتمع لاستكمال الأعمال، وصرف رصيد الإسمنت المتبقي لدى الوحدة (${cementUnitCreditBalance} كيس) في حال الجاهزية واستيفاء الشروط، أو الرفع بمقترح مناقلة الاعتماد إلى مبادرة أخرى نشطة.`;
    responsibleEntity = 'الجمعية التعاونية والسلطة المحلية بالمديرية واللجنة المجتمعية';
    nextProposedAction = `تنسيق اللقاء التقييمي المشترك للتحقق من الاستعداد الميداني؛ وعلى ضوئه إما إصدار أمر صرف الـ ${cementUnitCreditBalance} كيس المتبقية لدى الوحدة أو الرفع بمقترح استبدال/مناقلة المبادرة.`;
  }

  // 6. Role Directives
  const engineerDirective = `👷 **للتسليم والمتابعة الفنية:** التأكد من جودة دك واستواء طبقة الأساس (البيسكورس)، وسلامة تقطيع ورصف الأحجار بالطريقة الهندسية للرصف الجبلي، وتأمين مصارف السيول والعبارات لحماية الطريق.`;
  
  const knightsDirective = `🛡️ **لفرسان التنمية:** عقد اجتماع تنموي موسع مع عقلاء القرية لتفعيل المساهمات العينية، وتجهيز نوبات العمالة وحفظ الإسمنت بالموقع (علماً بأن عقود التنازلات العقارية وحرم الطريق مكتملة وموثقة مسبقاً قبل بدء العمل).`;
  
  const supervisorDirective = `🏛️ **للمشرف والقيادة:** ${proposedExecutiveDecision}`;

  // V3.1 Decision Rules
  // Rule 1: Ongoing Initiatives (مبادرات جارية) - Batch Disbursement Rule
  let batchDisbursementRecommendation = '';
  const remainingDisbursedPct = cementDisbursed > 0 ? (cementRemaining / cementDisbursed) : 1;

  if (opClass === 'ongoing' || (completionRate > 0 && completionRate < 100)) {
    if (remainingDisbursedPct <= 0.10 || cementRemaining <= 10) {
      if (cementUnitCreditBalance > 0) {
        batchDisbursementRecommendation = `توصية بالموافقة: المتبقي بالموقع ينفد (أقل من 10%) ويوجد رصيد متاح معتمد لدى الوحدة (${cementUnitCreditBalance} كيس). ينصح بإطلاق الدفعة الجديدة للاستكمال.`;
      } else {
        batchDisbursementRecommendation = `تنبيه قيادي حاسم: المواد بالموقع قاربت على النفاد (أقل من 10%)، ولكن لا يوجد رصيد مالي/مادي متاح للوحدة لهذه المبادرة حالياً. يرجى توجيه تحشيد مجتمعي.`;
      }
    } else {
      batchDisbursementRecommendation = `المواد المنصرفة حالياً بالموقع تكفي لمواصلة العمل (${cementRemaining} كيس متبقية، تشكل ${Math.round(remainingDisbursedPct * 100)}% من الدفعة).`;
    }
  }

  // Rule 2: Material Overuse Analysis Rule (مبادرات استخدمت أكثر من المعتمد)
  let materialOveruseAnalysis: MaterialOveruseAnalysis | undefined;
  const isOverused = (cementUsed > cementDisbursed) || (cementUsed >= cementAppr && completionRate < 70);
  if (isOverused) {
    const excessCement = Math.max(0, cementUsed - (cementDisbursed > 0 ? cementDisbursed : cementAppr));
    materialOveruseAnalysis = {
      isOverused: true,
      excessCementBags: excessCement,
      excessDieselLiters: parseNum(init.dieselUsed) > parseNum(init.dieselApproved) ? parseNum(init.dieselUsed) - parseNum(init.dieselApproved) : 0,
      possibleCauses: [
        '1. تغير نوع العمل الميداني (مثال: تحول من رصف حجري إلى صبة خرسانية ذات استهلاك أعلى)',
        '2. تغير كميات ونطاق الطريق أو توسيع العرض المستهدف أثناء التنفيذ',
        '3. وجود هدر أو سوء خلط للمواد بالموقع التنفيذي',
        '4. تكرار أو أخطاء في البيانات المدخلة بكشوف المعاينة'
      ],
      recommendationNote: 'النظام لا يوصي بصرف تعويض إضافي مباشر. تم فتح وحدة (تحليل استخدام المواد مقابل الإنجاز) وتحويل الزيادة لمؤشر نسبة مساهمة المجتمع أو العجز التنفيذي.',
      deficitIndicatorImpact: `تم إضافة الفارق المقدر بـ (${excessCement} كيس) إلى مؤشر العجز التنفيذي والمساهمة المجتمعية.`
    };
  }

  // Decision Matrix Mapping & Engineering Specs
  const decisionMatrixItem = getProblemDecisionMatrix(init, primaryStagnationCause);
  const engineeringSpecs = getEngineeringPavingSpecs(init);

  return {
    initiativeId: init.id,
    initiativeName: init.name,
    district: init.district || 'مديرية ذي السفال',
    subDistrict: init.subDistrict || 'عزلة مجاورة',
    completionRate,
    cementDisbursed,
    cementUsed,
    cementRemaining,
    cementUnitCreditBalance,
    communityContributionVal: commVal,
    stagnationMonths,
    recordedObstacles,
    operationalClassification: opClass,
    classificationLabel: classLabel,
    classificationBadgeClass: classBadgeClass,
    classificationIcon: classIcon,
    riskSeverity,
    riskSeverityLabel,
    riskBadgeClass,
    diagnosticSummary,
    primaryStagnationCause,
    proposedExecutiveDecision: (opClass === 'ongoing' && batchDisbursementRecommendation.includes('تنبيه قيادي حاسم')) 
      ? 'لا يوصى بالصرف - عدم وجود رصيد مالي/مادي متاح للوحدة' 
      : proposedExecutiveDecision,
    responsibleEntity,
    nextProposedAction,
    smartRecommendation,
    engineerDirective,
    knightsDirective,
    supervisorDirective,
    batchDisbursementRecommendation,
    materialOveruseAnalysis,
    decisionMatrixItem,
    engineeringSpecs
  };
}

/**
 * Smart Real-Time Alerts Engine (نظام التنبيهات الذكية)
 * Generates automated alerts based on stagnation duration, materials risk, missing field reports, and executive escalation,
 * filtered according to user role and district permissions.
 */
export function generateSmartAlerts(
  initiatives: Initiative[],
  userRole: UserRole | 'admin' | 'visitor',
  userDistrict?: string
): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const nowStr = new Date().toLocaleDateString('ar-YE');

  initiatives.forEach((init) => {
    // District Filter according to RBAC
    if (userDistrict && userDistrict !== 'all' && init.district !== userDistrict) {
      return;
    }

    const decision = getAIDevelopmentDecision(init);

    // Alert 1: Executive Escalation Alert
    if (decision.operationalClassification === 'struggling_escalation') {
      alerts.push({
        id: `alert_esc_${init.id}`,
        initiativeId: init.id,
        initiativeName: init.name,
        district: init.district,
        subDistrict: init.subDistrict,
        alertType: 'executive_escalation',
        severity: 'critical',
        title: `🚨 تنبيه تصعيد قيادي: ${init.name}`,
        message: `تعثر حاد مع توفر أسمنت متبقي بالموقع (${decision.cementRemaining} كيس) وإنجاز لم يتجاوز ${decision.completionRate}%. يوصى بقرار تدوير مخزني فوري.`,
        targetRole: 'governorate',
        timestamp: nowStr,
        proposedAction: decision.proposedExecutiveDecision
      });
    }

    // Alert 2: Materials Damage Risk Alert
    if (decision.cementRemaining > 150 && decision.completionRate < 25) {
      alerts.push({
        id: `alert_mat_${init.id}`,
        initiativeId: init.id,
        initiativeName: init.name,
        district: init.district,
        subDistrict: init.subDistrict,
        alertType: 'material_risk',
        severity: 'danger',
        title: `⚠️ تنبيه مخاطر مواد: مخزون أسمنت مهدد بالتلف`,
        message: `يوجد (${decision.cementRemaining} كيس) بالموقع بدون استخدام فعلي. يرجى المتابعة الفورية لتجنب تكتل المادة بسبب الرطوبة.`,
        targetRole: 'engineer_inspector',
        timestamp: nowStr,
        proposedAction: 'نزول مهندس المربع لفحص سلامة الشكائر وتغطيتها بطرابيل وتكثيف الخرسانة.'
      });
    }

    // Alert 3: Stagnation Alert
    if (decision.operationalClassification === 'stopped' || decision.stagnationMonths >= 6) {
      alerts.push({
        id: `alert_stag_${init.id}`,
        initiativeId: init.id,
        initiativeName: init.name,
        district: init.district,
        subDistrict: init.subDistrict,
        alertType: 'stagnation',
        severity: 'warning',
        title: `⏱️ تنبيه توقف ميداني: ${init.name}`,
        message: `المبادرة متوقفة منذ ما يقارب ${decision.stagnationMonths} أشهر بسبب: ${decision.primaryStagnationCause}.`,
        targetRole: 'district_director',
        timestamp: nowStr,
        proposedAction: 'تفعيل الفرقة الميدانية وعقد اجتماع أهالي القرية لتنظيم نوبات الصب ورصف الطريق (التنازلات مكتملة وموثقة مسبقاً).'
      });
    }

    // Alert 4: Late Field Report Reminder
    if (decision.operationalClassification === 'ongoing' && (!init.reports || init.reports.length === 0)) {
      alerts.push({
        id: `alert_rep_${init.id}`,
        initiativeId: init.id,
        initiativeName: init.name,
        district: init.district,
        subDistrict: init.subDistrict,
        alertType: 'field_reminder',
        severity: 'info',
        title: `📋 تذكير تقرير ميداني: ${init.name}`,
        message: `المبادرة جارية ومستمرة لكنها بحاجة لتحديث التقرير الهندسي الدوري ومرفقات الصور.`,
        targetRole: 'engineer_inspector',
        timestamp: nowStr,
        proposedAction: 'رفع تقرير المعاينة وصور الرصف عبر بوابة التقارير الهندسية.'
      });
    }
  });

  // Filter alerts based on user role permissions
  if (userRole === 'visitor') {
    return alerts.filter(a => a.severity === 'info' || a.severity === 'warning');
  }

  return alerts;
}

export interface PortfolioExecutiveSummary {
  totalInitiatives: number;
  totalCost: number;
  totalUnitContribution: number;
  totalCommunityContribution: number;
  avgCompletionRate: number;

  totalApprovedPavingM2: number;
  totalExecutedPavingM2: number;
  pavingProgressPct: number;

  totalApprovedConcreteM3: number;
  totalExecutedConcreteM3: number;
  concreteProgressPct: number;

  totalApprovedLengthM: number;
  totalExecutedLengthM: number;
  lengthProgressPct: number;

  cement: {
    approved: number;
    disbursed: number;
    used: number;
    remaining: number;
    unitCreditBalance: number;
    efficiencyPct: number;
  };

  diesel: {
    approved: number;
    disbursed: number;
    used: number;
    remaining: number;
    unitCreditBalance: number;
    efficiencyPct: number;
  };

  healthDistribution: {
    good: number;
    warning: number;
    critical: number;
    avgHealthScore: number;
  };

  priorityGroups: {
    readyForCompletion: InitiativeAnalysis[];
    needsFollowup: InitiativeAnalysis[];
    needsDecision: InitiativeAnalysis[];
  };

  fiveTierGroups: {
    notStarted: InitiativeAnalysis[];
    needsInterventionUnusedDisbursed: InitiativeAnalysis[];
    activeNeedsNextTranche: InitiativeAnalysis[];
    activeFullyDisbursed: InitiativeAnalysis[];
    completedWithUnitCredit: InitiativeAnalysis[];
    fullyCompletedAndDisbursed: InitiativeAnalysis[];
    overusedCement: InitiativeAnalysis[];
  };

  keyAchievements: string[];
  keyGaps: string[];
  executiveRecommendations: string[];
}

/**
 * Summarizes portfolio analysis across all initiatives.
 */
export function summarizePortfolio(initiatives: Initiative[]): PortfolioExecutiveSummary {
  const analyses = initiatives.map(analyzeInitiative);

  const totalInitiatives = initiatives.length;
  let totalCost = 0;
  let totalUnitContribution = 0;
  let totalCommunityContribution = 0;
  let sumCompletion = 0;

  let totalApprovedPavingM2 = 0;
  let totalExecutedPavingM2 = 0;
  let totalApprovedConcreteM3 = 0;
  let totalExecutedConcreteM3 = 0;
  let totalApprovedLengthM = 0;
  let totalExecutedLengthM = 0;

  let cementApproved = 0;
  let cementDisbursed = 0;
  let cementUsed = 0;
  let cementRemaining = 0;
  let cementUnitCreditBalance = 0;

  let dieselApproved = 0;
  let dieselDisbursed = 0;
  let dieselUsed = 0;
  let dieselRemaining = 0;
  let dieselUnitCreditBalance = 0;

  let sumHealthScore = 0;
  let goodCount = 0;
  let warningCount = 0;
  let criticalCount = 0;

  const readyForCompletion: InitiativeAnalysis[] = [];
  const needsFollowup: InitiativeAnalysis[] = [];
  const needsDecision: InitiativeAnalysis[] = [];

  const notStarted: InitiativeAnalysis[] = [];
  const needsInterventionUnusedDisbursed: InitiativeAnalysis[] = [];
  const activeNeedsNextTranche: InitiativeAnalysis[] = [];
  const activeFullyDisbursed: InitiativeAnalysis[] = [];
  const completedWithUnitCredit: InitiativeAnalysis[] = [];
  const fullyCompletedAndDisbursed: InitiativeAnalysis[] = [];
  const overusedCement: InitiativeAnalysis[] = [];

  analyses.forEach((item) => {
    const init = item.initiative;
    totalCost += parseNum(init.cost) > 0 ? parseNum(init.cost) : (parseNum(init.estimatedCost) || (parseNum(init.unitContribution) + parseNum(init.communityContribution)));
    totalUnitContribution += parseNum(init.unitContribution);
    totalCommunityContribution += parseNum(init.communityContribution) > 0
      ? parseNum(init.communityContribution)
      : (init.contributions?.reduce((s, c) => s + parseNum(c.value), 0) || 0);
    sumCompletion += parseNum(init.completionRate);

    totalApprovedPavingM2 += item.executionGap.approvedPavingM2;
    totalExecutedPavingM2 += item.executionGap.executedPavingM2;
    totalApprovedConcreteM3 += item.executionGap.approvedConcreteM3;
    totalExecutedConcreteM3 += item.executionGap.executedConcreteM3;
    totalApprovedLengthM += item.executionGap.approvedLengthM;
    totalExecutedLengthM += item.executionGap.executedLengthM;

    cementApproved += item.resourceEfficiency.cementAppr;
    cementDisbursed += item.resourceEfficiency.cementDisbursed;
    cementUsed += item.resourceEfficiency.cementUsed;
    cementRemaining += item.resourceEfficiency.cementRemaining;
    cementUnitCreditBalance += item.resourceEfficiency.cementUnitCreditBalance;

    dieselApproved += item.resourceEfficiency.dieselAppr;
    dieselDisbursed += item.resourceEfficiency.dieselDisbursed;
    dieselUsed += item.resourceEfficiency.dieselUsed;
    dieselRemaining += item.resourceEfficiency.dieselRemaining;
    dieselUnitCreditBalance += item.resourceEfficiency.dieselUnitCreditBalance;

    sumHealthScore += item.healthScore;
    if (item.healthCategory === 'good') goodCount++;
    else if (item.healthCategory === 'warning') warningCount++;
    else criticalCount++;

    if (item.priorityClassification.level === 'ready_for_completion') readyForCompletion.push(item);
    else if (item.priorityClassification.level === 'needs_decision') needsDecision.push(item);
    else needsFollowup.push(item);

    if (item.resourceEfficiency.isCementOverused) {
      overusedCement.push(item);
    }

    // 5-Tier categorization distribution
    const k = item.fiveTierClassification.key;
    if (k === 'not_started') notStarted.push(item);
    else if (k === 'needs_intervention_unused_disbursed') needsInterventionUnusedDisbursed.push(item);
    else if (k === 'active_needs_next_tranche') activeNeedsNextTranche.push(item);
    else if (k === 'active_fully_disbursed') activeFullyDisbursed.push(item);
    else if (k === 'completed_with_unit_credit') completedWithUnitCredit.push(item);
    else if (k === 'fully_completed_and_disbursed') fullyCompletedAndDisbursed.push(item);
  });

  const avgCompletionRate = totalInitiatives > 0 ? Math.round(sumCompletion / totalInitiatives) : 0;
  const avgHealthScore = totalInitiatives > 0 ? Math.round(sumHealthScore / totalInitiatives) : 0;

  const pavingProgressPct = totalApprovedPavingM2 > 0 ? Math.round((totalExecutedPavingM2 / totalApprovedPavingM2) * 100) : 0;
  const concreteProgressPct = totalApprovedConcreteM3 > 0 ? Math.round((totalExecutedConcreteM3 / totalApprovedConcreteM3) * 100) : 0;
  const lengthProgressPct = totalApprovedLengthM > 0 ? Math.round((totalExecutedLengthM / totalApprovedLengthM) * 100) : 0;

  const cementEfficiencyPct = cementDisbursed > 0 ? Math.round((cementUsed / cementDisbursed) * 100) : 0;
  const dieselEfficiencyPct = dieselDisbursed > 0 ? Math.round((dieselUsed / dieselDisbursed) * 100) : 0;

  // Key Achievements
  const keyAchievements = [
    `تحقيق نسبة إنجاز إجمالية قدرها ${avgCompletionRate}% عبر ${totalInitiatives} مبادرة تنموية بمحافظة إب.`,
    `إنجاز ${totalExecutedPavingM2.toLocaleString('ar-YE')} م² رصف حجري وخرافي ميداني من أصل ${totalApprovedPavingM2.toLocaleString('ar-YE')} م² معتمدة.`,
    `استخدام ${cementUsed.toLocaleString('ar-YE')} كيس أسمنت بنسبة كفاءة استهلاك بلغت ${cementEfficiencyPct}%.`,
    `تأمين مساهمات مجتمعية تراكمية بقيمة ${totalCommunityContribution >= 1000000 ? (totalCommunityContribution / 1000000).toFixed(1) + ' مليون YER' : totalCommunityContribution.toLocaleString('ar-YE') + ' YER'}.`,
  ];

  // Key Gaps
  const pavingGap = Math.max(0, totalApprovedPavingM2 - totalExecutedPavingM2);
  const keyGaps = [
    `متبقي فجوة رصف حجري قدرها ${pavingGap.toLocaleString('ar-YE')} م² تتطلب استكمال المواد والنزول الميداني.`,
    `وجود ${needsDecision.length} مبادرات تحتاج قرارات تنفيذية عاجلة لوجود فجوة بين المواد المنصرفة ونسبة الإنجاز.`,
    `توفر ${cementRemaining.toLocaleString('ar-YE')} كيس أسمنت متبقية بالمخازن الميدانية تستوجب التوجيه السريع للاستخدام قبل التلف.`,
    `وجود ${warningCount} مبادرة تقع في نطاق المتابعة الصفراء تحسّسباً لتباطؤ التنفيذ.`,
  ];

  // Executive Recommendations
  const executiveRecommendations = [
    `إصدار توجيهات فورية للمديريات لحسم وإغلاق المبادرات الـ ${readyForCompletion.length} الجاهزة للإكمال والتي تمتلك مواد متبقية.`,
    `تشكيل لجنة نزول وفحص للمبادرات الـ ${needsDecision.length} ذات الأولوية الحمراء لإعادة توجيه الدعم أو تدوير الأسمنت المتبقي.`,
    `متابعة توريد المساهمات المجتمعية في المبادرات ذات الإنجاز المتوسط وتفعيل دور اللجان المجتمعية والفرسان.`,
    `ربط الدفعات القادمة من الديزل والأسمنت بتحقيق نسب الإنجاز المعتمدة في شيتات الفرز الهندسي المكتبي.`,
  ];

  return {
    totalInitiatives,
    totalCost,
    totalUnitContribution,
    totalCommunityContribution,
    avgCompletionRate,
    totalApprovedPavingM2,
    totalExecutedPavingM2,
    pavingProgressPct,
    totalApprovedConcreteM3,
    totalExecutedConcreteM3,
    concreteProgressPct,
    totalApprovedLengthM,
    totalExecutedLengthM,
    lengthProgressPct,
    cement: {
      approved: cementApproved,
      disbursed: cementDisbursed,
      used: cementUsed,
      remaining: cementRemaining,
      unitCreditBalance: cementUnitCreditBalance,
      efficiencyPct: cementEfficiencyPct,
    },
    diesel: {
      approved: dieselApproved,
      disbursed: dieselDisbursed,
      used: dieselUsed,
      remaining: dieselRemaining,
      unitCreditBalance: dieselUnitCreditBalance,
      efficiencyPct: dieselEfficiencyPct,
    },
    healthDistribution: {
      good: goodCount,
      warning: warningCount,
      critical: criticalCount,
      avgHealthScore,
    },
    priorityGroups: {
      readyForCompletion,
      needsFollowup,
      needsDecision,
    },
    fiveTierGroups: {
      notStarted,
      needsInterventionUnusedDisbursed,
      activeNeedsNextTranche,
      activeFullyDisbursed,
      completedWithUnitCredit,
      fullyCompletedAndDisbursed,
      overusedCement,
    },
    keyAchievements,
    keyGaps,
    executiveRecommendations,
  };
}
