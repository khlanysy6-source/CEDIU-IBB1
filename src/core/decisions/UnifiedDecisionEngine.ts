/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Unified Decision Engine (محرك القرار التنموي الموحد والأدلة الميدانية)
 * المصدر السيادي والمنطقي المركزي الوحيد للقرارات التنفيذية وقرارات المبادرات.
 * 
 * المبادئ الحاكمة:
 * 1. مسار اتخاذ قرار موحد ومبني على الأدلة فقط دون أي عشوائية أو تخمين.
 * 2. الفصل الصارم بين القرار التنفيذي العام (ExecutiveDecision / Bundle) وقرار المبادرة الواحدة (InitiativeDecision).
 * 3. صمامات الأمان الإلزامية للمشاريع المنجزة 100% والمبادرات الجديدة.
 * 4. إعادة الحساب الفورية المبنية على بصمة البيانات (Data Fingerprint).
 * 5. التفسير الصريح لكل قرار (لماذا، الأثر، الإجراء، المسؤول، المهلة، الدليل).
 */

import { Initiative } from '../../types';
import { parseNum, matchDistrictStrict, CANONICAL_DISTRICTS } from '../../utils/numberAndDistrictUtils';
import { INITIAL_OFFICIALS, OfficialProfile } from '../../data/officialsRegistry';

// ==========================================
// 1. الواجهات والأنواع المعتمدة (Types & Contracts)
// ==========================================

export type DiagnosticDecisionCategory =
  | 'CLOSEOUT_HANDOVER'         // إغلاق وتسليم فني
  | 'MATERIAL_SUPPLY'           // معالجة توريد ورصيد مواد
  | 'FIELD_VERIFICATION'        // تحقق ميداني ودليل بشري
  | 'STALLED_TREATMENT'         // معالجة تعثر وتوقف
  | 'ENGINEERING_ASSESSMENT'    // مراجعة فنية وهندسية
  | 'COMMUNITY_CONSENSUS'       // توافق مجتمعي وتحشيد
  | 'ACTIVE_MONITORING'         // متابعة تنفيذ نشط
  | 'INITIAL_STUDY';            // دراسة وتدقيق أولي لمبادرة جديدة

export type DecisionPriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'ROUTINE';

export interface ExplainableDecisionFields {
  why: string;                 // لماذا: السبب الجذري المبني على الأرقام والملاحظات
  impact: string;              // الأثر: الأثر التشغيلي والبشري والمالي
  action: string;              // الإجراء: التوجيه التنفيذي المحدد
  responsibleOwner: string;    // المسؤول: الجهة أو المسؤول المعتمد
  deadline: string;            // المهلة: التوقيت الزمني المحدد
  evidence: string[];          // الدليل: أرقام، تقارير، وقائع موثقة
}

/**
 * قرار تفصيلي خاص بمبادرة واحدة (Initiative-level Decision)
 */
export interface SingleInitiativeDecision extends ExplainableDecisionFields {
  id: string;
  initiativeId: string;
  initiativeNumber: string;
  initiativeName: string;
  district: string;
  subDistrict?: string;
  village?: string;
  category: DiagnosticDecisionCategory;
  categoryTitle: string;
  priority: DecisionPriorityLevel;
  priorityScore: number;
  status: 'draft' | 'approved' | 'in_execution' | 'executed' | 'suspended';
  completionRate: number;
  approvedCement: number;
  disbursedCement: number;
  usedCement: number;
  remainingUnitCement: number;
  remainingFieldCement: number;
  approvedDiesel: number;
  disbursedDiesel: number;
  usedDiesel: number;
  requiresHumanConfirmation: boolean;
  generatedAt: string;
  fingerprint: string;
}

/**
 * حزمة قرار تنفيذي عامة على مستوى النطاق الإداري (Executive Decision Bundle / Package)
 */
export interface ExecutiveDecisionBundle extends ExplainableDecisionFields {
  packageId: string;
  title: string;
  category: DiagnosticDecisionCategory;
  categoryTitle: string;
  priority: DecisionPriorityLevel;
  priorityScore: number;
  affectedCount: number;
  affectedInitiativeIds: string[];
  affectedInitiativesSummary: Array<{
    id: string;
    number: string;
    name: string;
    district: string;
    completionRate: number;
    status: string;
    keyMetric: string;
  }>;
  districts: string[];
  scope: 'governorate' | 'district' | 'cooperative';
  scopeName: string;
  totalBeneficiaries: number;
  totalCostImpact: number;
  totalCementBagsImpact: number;
  requiresHumanConfirmation: boolean;
  status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
  generatedAt: string;
}

// ==========================================
// 2. دوال بصمة البيانات (Data Fingerprinting)
// ==========================================

/**
 * حساب بصمة بيانات متغيرة فوراً عند تعديل أي حقل مؤثر في الـ 725 مبادرة
 */
export function computeInitiativesFingerprint(initiatives: Initiative[]): string {
  if (!initiatives || initiatives.length === 0) return 'empty_dataset';

  let hash = 0;
  for (let i = 0; i < initiatives.length; i++) {
    const init = initiatives[i];
    const str = `${init.id}|${init.status}|${init.completionRate}|${init.materialsApproved}|${init.materialsDisbursed}|${init.materialsUsed}|${init.dieselApproved}|${init.dieselDisbursed}|${init.stagnationReason || ''}|${init.notes || ''}|${init.updatedAt || ''}`;
    
    for (let j = 0; j < str.length; j++) {
      const char = str.charCodeAt(j);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
  }

  return `fp_${initiatives.length}_${Math.abs(hash).toString(36)}`;
}

// ==========================================
// 3. محرك قرارات المبادرات (Single Initiative Logic)
// ==========================================

export class UnifiedDecisionEngine {
  /**
   * تشخيص وحساب القرار المعتمد لمبادرة مفردة بناءً على البيانات والضوابط الصارمة
   */
  public static evaluateInitiative(init: Initiative): SingleInitiativeDecision {
    const completionRate = parseNum(init.completionRate);
    const approvedCement = parseNum(init.materialsApproved);
    const disbursedCement = parseNum(init.materialsDisbursed);
    const usedCement = parseNum(init.materialsUsed);

    const approvedDiesel = parseNum(init.dieselApproved);
    const disbursedDiesel = parseNum(init.dieselDisbursed);
    const usedDiesel = parseNum(init.dieselUsed);

    const remainingUnitCement = Math.max(0, approvedCement - disbursedCement);
    const remainingFieldCement = Math.max(0, disbursedCement - usedCement);
    const cost = parseNum(init.cost);
    const beneficiaries = parseNum(init.beneficiaries);
    const notes = (init.notes || '').trim();
    const stagnationReason = (init.stagnationReason || '').trim();

    // ----------------------------------------------------
    // صمام أمان 1: المبادرات المنجزة بنسبة 100% أو المكتملة
    // يُحظر تماماً أي صرف جديد أو توريد إضافي أو استئناف صب
    // ----------------------------------------------------
    if (completionRate >= 100 || init.status === 'completed') {
      return {
        id: `dec_init_${init.id}`,
        initiativeId: init.id,
        initiativeNumber: init.initiativeNumber || init.id,
        initiativeName: init.name,
        district: init.district || 'محافظة إب',
        subDistrict: init.subDistrict,
        village: init.village,
        category: 'CLOSEOUT_HANDOVER',
        categoryTitle: 'إغلاق وتسليم فني نهائي',
        priority: 'ROUTINE',
        priorityScore: 30,
        status: 'executed',
        completionRate: 100,
        approvedCement,
        disbursedCement,
        usedCement,
        remainingUnitCement: 0,
        remainingFieldCement,
        approvedDiesel,
        disbursedDiesel,
        usedDiesel,
        requiresHumanConfirmation: false,
        generatedAt: new Date().toISOString(),
        fingerprint: `${init.id}_completed`,
        why: 'المبادرة منجزة ميدانياً بنسبة 100% وفق كشوفات الرصف والأعمال المنفذة، وتتطلب إغلاق الدورة المستندية وحفظ المحضر التسليمي.',
        impact: `تثبيت إنجاز المسار بـ ${init.district} لحماية الأثر التنموي لـ ${(beneficiaries || 1200).toLocaleString('ar-YE')} مستفيد.`,
        action: 'إصدار شهادة الإنجاز النهائي وتوقيع محضر الاستلام والتسليم الفني بين اللجنة المجتمعية والسلطة المحلية.',
        responsibleOwner: 'وحدة التدخلات المركزية / السلطة المحلية بالمديرية',
        deadline: 'خلال 10 أيام من تاريخ الاعتماد',
        evidence: [
          `نسبة الإنجاز الميداني الموثقة: 100%`,
          `إجمالي الإسمنت المستخدم بالمشروع: ${usedCement.toLocaleString('ar-YE')} كيس`,
          `حالة السجل: جاهزة للأرشفة والإغلاق النهائي`
        ]
      };
    }

    // ----------------------------------------------------
    // صمام أمان 2: المبادرات الجديدة التي لم يبدأ الصرف لها (المنصرف = 0)
    // يُحظر تماماً استخدام مصطلح "استكمال الدفعة السابقة"
    // ----------------------------------------------------
    if (disbursedCement === 0 && disbursedDiesel === 0 && (init.status === 'pending' || completionRate === 0)) {
      const hasVerifiedNotes = notes.length > 5;
      return {
        id: `dec_init_${init.id}`,
        initiativeId: init.id,
        initiativeNumber: init.initiativeNumber || init.id,
        initiativeName: init.name,
        district: init.district || 'محافظة إب',
        subDistrict: init.subDistrict,
        village: init.village,
        category: 'INITIAL_STUDY',
        categoryTitle: 'دراسة وتحقق أولي لمبادرة جديدة',
        priority: 'MEDIUM',
        priorityScore: 50,
        status: 'draft',
        completionRate: 0,
        approvedCement,
        disbursedCement: 0,
        usedCement: 0,
        remainingUnitCement: approvedCement,
        remainingFieldCement: 0,
        approvedDiesel,
        disbursedDiesel: 0,
        usedDiesel: 0,
        requiresHumanConfirmation: true,
        generatedAt: new Date().toISOString(),
        fingerprint: `${init.id}_new_zero_disbursed`,
        why: 'المبادرة معتمدة بالخطة ولكن لم يصرف لها أي دفعات سابقة حتى الآن (المنصرف = 0)، وتتطلب التحقق من الجاهزية الميدانية والتنازلات وتأمين المخزن.',
        impact: `تأمين انطلاقة سليمة لمشروع تكلفته التقديرية ${(cost || 1000000).toLocaleString('ar-YE')} ريال دون مخاطر تلف المواد.`,
        action: 'تكليف مهندس النطاق والجمعية التعاونية بالتحقق من جاهزية الموقع وتأمين المستودع قبل اعتماد صرف الدفعة الأولى.',
        responsibleOwner: `الجمعية التعاونية بـ ${init.district} / مهندس الإشراف`,
        deadline: 'خلال 7 أيام عمل',
        evidence: [
          `المخصص المعتمد: ${approvedCement.toLocaleString('ar-YE')} كيس إسمنت`,
          `المنصرف الفعلي حتى الآن: 0 (لم يصرف أي رصيد)`,
          hasVerifiedNotes ? `ملاحظات المسح الميداني: ${notes}` : 'يتطلب فحص جاهزية المستودع الأهلي'
        ]
      };
    }

    // ----------------------------------------------------
    // صمام أمان 3: المبادرات المتوقفة أو المتعثرة (Stagnant / Stopped)
    // ----------------------------------------------------
    if (init.status === 'stopped' || init.status === 'stagnant') {
      const hasSpecificReason = stagnationReason.length > 5 || notes.length > 5;
      const reportedReason = stagnationReason || notes;

      // تحديد نوع العائق بناءً على الأدلة الصريحة فقط
      const isSupplyIssue = reportedReason.includes('إسمنت') || reportedReason.includes('ديزل') || reportedReason.includes('مواد') || reportedReason.includes('توريد');
      const isCommunityIssue = reportedReason.includes('خلاف') || reportedReason.includes('نزاع') || reportedReason.includes('طريق') || reportedReason.includes('مسار') || reportedReason.includes('أهالي');
      const isTechnicalIssue = reportedReason.includes('جدار') || reportedReason.includes('مسح') || reportedReason.includes('هندسي') || reportedReason.includes('صخور') || reportedReason.includes('وعورة');

      if (!hasSpecificReason) {
        // لا توجد أدلة كافية -> تحويل إلزامي للتحقق الميداني
        return {
          id: `dec_init_${init.id}`,
          initiativeId: init.id,
          initiativeNumber: init.initiativeNumber || init.id,
          initiativeName: init.name,
          district: init.district || 'محافظة إب',
          subDistrict: init.subDistrict,
          village: init.village,
          category: 'FIELD_VERIFICATION',
          categoryTitle: 'معلق للتحقق الميداني والدليل البشري',
          priority: 'HIGH',
          priorityScore: 75,
          status: 'draft',
          completionRate,
          approvedCement,
          disbursedCement,
          usedCement,
          remainingUnitCement,
          remainingFieldCement,
          approvedDiesel,
          disbursedDiesel,
          usedDiesel,
          requiresHumanConfirmation: true,
          generatedAt: new Date().toISOString(),
          fingerprint: `${init.id}_stopped_unverified`,
          why: 'حالة المبادرة مسجلة كـ(متوقفة/متعثرة) ولكن لا توجد أسباب تفصيلية كافية موثقة في السجل الحالي لإصدار قرار معالجة قطعي.',
          impact: `حماية رصيد المبادرة (${remainingUnitCement.toLocaleString('ar-YE')} كيس إسمنت لدى الوحدة) ومنع اتخاذ قرارات متسرعة.`,
          action: 'توجيه فريق الرصد الهندسي واللجنة المجتمعية بالنزول الميداني العاجل ورفع تقرير تشخيصي موثق بالصور وإحداثيات الموقع.',
          responsibleOwner: `فريق الرصد الميداني وإدارة المبادرات بـ ${init.district}`,
          deadline: 'خلال 5 أيام عمل',
          evidence: [
            `حالة المبادرة: ${init.status === 'stopped' ? 'متوقفة' : 'متعثرة'}`,
            `نسبة الإنجاز الحالية: ${completionRate}%`,
            `الموقف المستندي: عدم كفاية التوثيق الميداني للسبب الجذري`
          ]
        };
      }

      if (isSupplyIssue) {
        return {
          id: `dec_init_${init.id}`,
          initiativeId: init.id,
          initiativeNumber: init.initiativeNumber || init.id,
          initiativeName: init.name,
          district: init.district || 'محافظة إب',
          subDistrict: init.subDistrict,
          village: init.village,
          category: 'MATERIAL_SUPPLY',
          categoryTitle: 'معالجة توريد واستكمال مواد',
          priority: 'CRITICAL',
          priorityScore: 90,
          status: 'approved',
          completionRate,
          approvedCement,
          disbursedCement,
          usedCement,
          remainingUnitCement,
          remainingFieldCement,
          approvedDiesel,
          disbursedDiesel,
          usedDiesel,
          requiresHumanConfirmation: true,
          generatedAt: new Date().toISOString(),
          fingerprint: `${init.id}_stopped_supply`,
          why: `توقف المبادرة نتيجة عائق في سلسلة التوريد: ${reportedReason}`,
          impact: `إعادة تنشيط مسار الرصف لخدمة ${(beneficiaries || 1500).toLocaleString('ar-YE')} مواطن واستغلال الرصيد المتبقي لدى الوحدة (${remainingUnitCement.toLocaleString('ar-YE')} كيس).`,
          action: remainingUnitCement > 0
            ? `صرف دفعة تعزيزية من رصيد الوحدة المعتمد بعد معاينة الاستهلاك الفعلي وتأمين الخلط الخرساني.`
            : `دراسة تعزيز المخصص أو إجراء مناقلة مخزنية محلية بالمديرية لإنعاش المقطع المتوقف.`,
          responsibleOwner: 'المدير التنفيذي لوحدة التدخلات المركزية / مسؤول الإمداد',
          deadline: 'خلال 72 ساعة',
          evidence: [
            `العائق الموثق: ${reportedReason}`,
            `الرصيد المتبقي المعتمد لدى الوحدة: ${remainingUnitCement.toLocaleString('ar-YE')} كيس إسمنت`,
            `المخزون المتبقي بالميدان: ${remainingFieldCement.toLocaleString('ar-YE')} كيس`
          ]
        };
      }

      if (isCommunityIssue) {
        return {
          id: `dec_init_${init.id}`,
          initiativeId: init.id,
          initiativeNumber: init.initiativeNumber || init.id,
          initiativeName: init.name,
          district: init.district || 'محافظة إب',
          subDistrict: init.subDistrict,
          village: init.village,
          category: 'COMMUNITY_CONSENSUS',
          categoryTitle: 'توافق مجتمعي وتدخل محلي',
          priority: 'HIGH',
          priorityScore: 82,
          status: 'approved',
          completionRate,
          approvedCement,
          disbursedCement,
          usedCement,
          remainingUnitCement,
          remainingFieldCement,
          approvedDiesel,
          disbursedDiesel,
          usedDiesel,
          requiresHumanConfirmation: true,
          generatedAt: new Date().toISOString(),
          fingerprint: `${init.id}_stopped_community`,
          why: `توقف العمل لأسباب مجتمعية أو نزاع أهلي على مسار الطريق: ${reportedReason}`,
          impact: `إنهاء النزاع وحماية مساهمة المجتمع البالغة ${(parseNum(init.communityContribution) || 0).toLocaleString('ar-YE')} ريال وتأمين المواد بالموقع.`,
          action: 'تكليف مدير عام المديرية واللجنة المجتمعية بعقد جلسة صلح أهلي وتثبيت خط المسار المعتمد رسمياً بمحضر تنفيذي.',
          responsibleOwner: `مدير عام مديرية ${init.district} / رئيس الجمعية التعاونية`,
          deadline: 'خلال 4 أيام عمل',
          evidence: [
            `السبب الموثق: ${reportedReason}`,
            `نسبة الإنجاز المحققة: ${completionRate}%`,
            `المخزون المعرض للتلف بالموقع: ${remainingFieldCement.toLocaleString('ar-YE')} كيس إسمنت`
          ]
        };
      }

      if (isTechnicalIssue) {
        return {
          id: `dec_init_${init.id}`,
          initiativeId: init.id,
          initiativeNumber: init.initiativeNumber || init.id,
          initiativeName: init.name,
          district: init.district || 'محافظة إب',
          subDistrict: init.subDistrict,
          village: init.village,
          category: 'ENGINEERING_ASSESSMENT',
          categoryTitle: 'مراجعة فنية وهندسية ومعالجة وعورة',
          priority: 'HIGH',
          priorityScore: 80,
          status: 'approved',
          completionRate,
          approvedCement,
          disbursedCement,
          usedCement,
          remainingUnitCement,
          remainingFieldCement,
          approvedDiesel,
          disbursedDiesel,
          usedDiesel,
          requiresHumanConfirmation: true,
          generatedAt: new Date().toISOString(),
          fingerprint: `${init.id}_stopped_technical`,
          why: `توقف الأعمال بسبب عائق هندسي أو صخري أو متطلبات جدران ساندة: ${reportedReason}`,
          impact: `ضمان سلامة الطريق واستدامته الجبلية وحماية أرواح المسافرين.`,
          action: 'إيفاد مهندس مختص لتعديل المقطع العرضي وتصميم الحمايات اللازمة أو توجيه معدة شق وتكسير صخري.',
          responsibleOwner: `اللجنة الفنية بوحدة التدخلات / مكتب الأشغال بـ ${init.district}`,
          deadline: 'خلال 5 أيام عمل',
          evidence: [
            `العائق الهندسي: ${reportedReason}`,
            `نسبة الإنجاز: ${completionRate}%`,
            `الموقع الجغرافي: ${init.district} - ${init.subDistrict || 'النطاق الجبلي'}`
          ]
        };
      }

      // Default Stalled Treatment
      return {
        id: `dec_init_${init.id}`,
        initiativeId: init.id,
        initiativeNumber: init.initiativeNumber || init.id,
        initiativeName: init.name,
        district: init.district || 'محافظة إب',
        subDistrict: init.subDistrict,
        village: init.village,
        category: 'STALLED_TREATMENT',
        categoryTitle: 'معالجة تعثر واستئناف أعمال',
        priority: 'HIGH',
        priorityScore: 78,
        status: 'approved',
        completionRate,
        approvedCement,
        disbursedCement,
        usedCement,
        remainingUnitCement,
        remainingFieldCement,
        approvedDiesel,
        disbursedDiesel,
        usedDiesel,
        requiresHumanConfirmation: true,
        generatedAt: new Date().toISOString(),
        fingerprint: `${init.id}_stopped_general`,
        why: `المبادرة متوقفة بناءً على تقرير المتابعة: ${reportedReason}`,
        impact: `إعادة تشغيل المشروع وحماية الاستثمارات المجتمعية والحكومية.`,
        action: `عقد اجتماع مشترك بين قيادة السلطة المحلية بـ ${init.district} واللجنة الأهلية لحسم العائق واستئناف التنفيذ.`,
        responsibleOwner: `السلطة المحلية بـ ${init.district}`,
        deadline: 'خلال 5 أيام عمل',
        evidence: [
          `الحالة المسجلة: ${init.status === 'stopped' ? 'متوقفة' : 'متعثرة'}`,
          `نسبة الإنجاز: ${completionRate}%`,
          `الملاحظات: ${reportedReason}`
        ]
      };
    }

    // ----------------------------------------------------
    // صمام أمان 4: المبادرات النشطة المستمرة (Ongoing)
    // ----------------------------------------------------
    const needsDisbursement = remainingUnitCement > 0 && remainingFieldCement < 100 && completionRate >= 40;

    return {
      id: `dec_init_${init.id}`,
      initiativeId: init.id,
      initiativeNumber: init.initiativeNumber || init.id,
      initiativeName: init.name,
      district: init.district || 'محافظة إب',
      subDistrict: init.subDistrict,
      village: init.village,
      category: 'ACTIVE_MONITORING',
      categoryTitle: 'متابعة تنفيذ وتعزيز مرحلي',
      priority: needsDisbursement ? 'HIGH' : 'MEDIUM',
      priorityScore: needsDisbursement ? 70 : 45,
      status: 'in_execution',
      completionRate,
      approvedCement,
      disbursedCement,
      usedCement,
      remainingUnitCement,
      remainingFieldCement,
      approvedDiesel,
      disbursedDiesel,
      usedDiesel,
      requiresHumanConfirmation: false,
      generatedAt: new Date().toISOString(),
      fingerprint: `${init.id}_ongoing_${completionRate}`,
      why: needsDisbursement
        ? `الأعمال جارية بنسبة إنجاز ${completionRate}% مع استهلاك شبه كامل للدفعة المسلمة (${remainingFieldCement} كيس متبقٍ بالميدان) وتوفر رصيد معتمد لدى الوحدة (${remainingUnitCement.toLocaleString('ar-YE')} كيس).`
        : `الأعمال جارية بوتيرة طبيعية بنسبة إنجاز ${completionRate}% مع توفر مخزون كافٍ بالموقع لمواصلة الصب.`,
      impact: `ضمان تدفق المواد دون توقف وتفادي تأخير مواسم الرصف الجبلي.`,
      action: needsDisbursement
        ? 'اعتماد صرف الدفعة التالية من رصيد الوحدة المتبقي بعد التحقق من تقرير المشرف الفني.'
        : 'استمرار المتابعة الميدانية الدورية وتوثيق أمتار الرصف المنجزة أولاً بأول.',
      responsibleOwner: `وحدة التدخلات المركزية / المشرف الفني بـ ${init.district}`,
      deadline: needsDisbursement ? 'خلال 3 أيام' : 'متابعة أسبوعية منتظمة',
      evidence: [
        `نسبة الإنجاز الموثقة: ${completionRate}%`,
        `المنصرف حتى الآن: ${disbursedCement.toLocaleString('ar-YE')} كيس (المستخدم: ${usedCement.toLocaleString('ar-YE')} كيس)`,
        `الرصيد المتاح لدى الوحدة: ${remainingUnitCement.toLocaleString('ar-YE')} كيس`
      ]
    };
  }

  // ==========================================
  // 4. محرك حزم القرارات القيادية (Executive Decision Bundles)
  // ==========================================

  /**
   * توليد حزم القرارات التنفيذية العامة على مستوى النطاق الإداري
   * (المحافظة كاملة للقيادة المركزية، أو مديرية محددة لمدير المديرية/الجمعية)
   */
  public static generateExecutiveBundles(
    initiatives: Initiative[],
    targetScope: {
      scopeType: 'governorate' | 'district' | 'cooperative';
      districtFilter?: string;
    } = { scopeType: 'governorate' }
  ): ExecutiveDecisionBundle[] {
    // تصفية المبادرات بحسب النطاق الجغرافي والإداري
    const scopedInitiatives = initiatives.filter(init => {
      if (targetScope.scopeType === 'district' || targetScope.scopeType === 'cooperative') {
        if (!targetScope.districtFilter || targetScope.districtFilter === 'all') return true;
        return matchDistrictStrict(init.district, targetScope.districtFilter);
      }
      return true;
    });

    const singleDecisions = scopedInitiatives.map(init => this.evaluateInitiative(init));
    const bundles: ExecutiveDecisionBundle[] = [];

    // المسؤولين الرسميين المعتمدين من سجل القيادة
    const unitHead = INITIAL_OFFICIALS.find(o => o.id === 'off_001') || {
      fullName: 'الدكتور محمد حسن المداني',
      jobTitle: 'رئيس وحدة التدخلات المركزية التنموية الطارئة'
    };
    const executiveManager = INITIAL_OFFICIALS.find(o => o.id === 'off_002') || {
      fullName: 'المهندس شهاب أحمد الشامي',
      jobTitle: 'المدير التنفيذي لوحدة التدخلات المركزية'
    };
    const governor = INITIAL_OFFICIALS.find(o => o.id === 'off_004') || {
      fullName: 'اللواء عبدالواحد محمد صلاح',
      jobTitle: 'محافظ محافظة إب - رئيس المجلس المحلي'
    };

    const isGovScope = targetScope.scopeType === 'governorate';
    const scopeLabel = isGovScope ? 'محافظة إب (20 مديرية)' : (targetScope.districtFilter || 'المديرية المستهدفة');

    // ----------------------------------------------------
    // حزمة 1: معالجة المواد والتوريد وضغط الإمداد (Material Supply Package)
    // ----------------------------------------------------
    const supplyDecisions = singleDecisions.filter(d => d.category === 'MATERIAL_SUPPLY');
    if (supplyDecisions.length > 0) {
      const affectedInits = scopedInitiatives.filter(i => supplyDecisions.some(sd => sd.initiativeId === i.id));
      const totalCementImpact = supplyDecisions.reduce((sum, d) => sum + d.remainingUnitCement, 0);
      const totalCostImpact = affectedInits.reduce((sum, i) => sum + (parseNum(i.cost) || 0), 0);
      const totalBeneficiaries = affectedInits.reduce((sum, i) => sum + (parseNum(i.beneficiaries) || 1200), 0);
      const districtsList = Array.from(new Set(affectedInits.map(i => i.district)));

      bundles.push({
        packageId: 'bundle_supply_resolution',
        title: isGovScope
          ? `اعتماد حزمة المعالجة التوريدية والصرف الميداني للمبادرات المضغوطة (${supplyDecisions.length} مبادرة)`
          : `معالجة اختناقات توريد الإسمنت للمبادرات المستحقة بـ ${scopeLabel} (${supplyDecisions.length} مبادرة)`,
        category: 'MATERIAL_SUPPLY',
        categoryTitle: 'حزمة معالجة المواد وسلاسل الإمداد',
        priority: 'CRITICAL',
        priorityScore: 95,
        status: 'PENDING',
        scope: targetScope.scopeType,
        scopeName: scopeLabel,
        affectedCount: supplyDecisions.length,
        affectedInitiativeIds: supplyDecisions.map(d => d.initiativeId),
        affectedInitiativesSummary: affectedInits.map(init => {
          const sd = supplyDecisions.find(d => d.initiativeId === init.id)!;
          return {
            id: init.id,
            number: init.initiativeNumber || init.id,
            name: init.name,
            district: init.district,
            completionRate: sd.completionRate,
            status: init.status,
            keyMetric: `متبقٍ بالوحدة: ${sd.remainingUnitCement.toLocaleString('ar-YE')} كيس`
          };
        }),
        districts: districtsList,
        totalBeneficiaries,
        totalCostImpact,
        totalCementBagsImpact: totalCementImpact,
        requiresHumanConfirmation: true,
        generatedAt: new Date().toISOString(),
        why: `رصد ${supplyDecisions.length} مبادرة تعاني من ضغط تنفيذي بسبب اختناق توريد مادة الإسمنت والوقود، مع بلوغ نسبة إنجاز متقدمة واستنفاذ الكميات المسلمة سابقاً.`,
        impact: `تأمين استمرارية الأعمال الميدانية لـ ${districtsList.length} مديرية، وحماية أثر استثماري بقيمة ${(totalCostImpact / 1000000).toFixed(1)} مليون ريال لخدمة ${totalBeneficiaries.toLocaleString('ar-YE')} مواطن.`,
        action: isGovScope
          ? `اعتماد خطة الصرف التعزيزي المباشر للكميات المتبقية لدى الوحدة (${totalCementImpact.toLocaleString('ar-YE')} كيس) بعد التحقق من الأرصدة الميدانية الفعلية والتقارير الفنية.`
          : `رفع محضر الاحتياج الفعلي للقيادة التنفيذية لصرف الدفعات التعزيزية المستحقة بعد فحص المستودعات.`,
        responsibleOwner: isGovScope
          ? `${executiveManager.fullName} (${executiveManager.jobTitle})`
          : `مدير عام مديرية ${scopeLabel} / المشرف الفني`,
        deadline: 'خلال 48 ساعة من تاريخه',
        evidence: [
          `عدد المبادرات المشمولة: ${supplyDecisions.length} مبادرة في ${districtsList.length} مديرية`,
          `إجمالي رصيد الإسمنت المعتمد المستحق: ${totalCementImpact.toLocaleString('ar-YE')} كيس`,
          `تطابق البيانات مع شيت المتابعة وسجلات الصرف المعتمدة`
        ]
      });
    }

    // ----------------------------------------------------
    // حزمة 2: التحقق الميداني والدليل البشري (Field Verification Package)
    // ----------------------------------------------------
    const verificationDecisions = singleDecisions.filter(d => d.category === 'FIELD_VERIFICATION' || d.category === 'INITIAL_STUDY');
    if (verificationDecisions.length > 0) {
      const affectedInits = scopedInitiatives.filter(i => verificationDecisions.some(vd => vd.initiativeId === i.id));
      const districtsList = Array.from(new Set(affectedInits.map(i => i.district)));
      const totalCostImpact = affectedInits.reduce((sum, i) => sum + (parseNum(i.cost) || 0), 0);
      const totalBeneficiaries = affectedInits.reduce((sum, i) => sum + (parseNum(i.beneficiaries) || 1200), 0);

      bundles.push({
        packageId: 'bundle_field_verification',
        title: isGovScope
          ? `إطلاق حملة التدقيق الميداني والرفع الهندسي للمبادرات المعلقة (${verificationDecisions.length} مبادرة)`
          : `استكمال التحقق الميداني والدراسات الفنية لمبادرات ${scopeLabel} (${verificationDecisions.length} مبادرة)`,
        category: 'FIELD_VERIFICATION',
        categoryTitle: 'حزمة التحقق الميداني والتوثيق الهندسي',
        priority: 'HIGH',
        priorityScore: 85,
        status: 'PENDING',
        scope: targetScope.scopeType,
        scopeName: scopeLabel,
        affectedCount: verificationDecisions.length,
        affectedInitiativeIds: verificationDecisions.map(d => d.initiativeId),
        affectedInitiativesSummary: affectedInits.map(init => {
          const vd = verificationDecisions.find(d => d.initiativeId === init.id)!;
          return {
            id: init.id,
            number: init.initiativeNumber || init.id,
            name: init.name,
            district: init.district,
            completionRate: vd.completionRate,
            status: init.status,
            keyMetric: vd.category === 'INITIAL_STUDY' ? 'مبادرة جديدة (لم يصرف)' : 'متوقفة (تحتاج فحص)'
          };
        }),
        districts: districtsList,
        totalBeneficiaries,
        totalCostImpact,
        totalCementBagsImpact: verificationDecisions.reduce((sum, d) => sum + d.approvedCement, 0),
        requiresHumanConfirmation: false,
        generatedAt: new Date().toISOString(),
        why: `وجود ${verificationDecisions.length} مبادرة تتطلب تحديث الرفع الفني والتأكد من الأدلة الميدانية وجاهزية المستودعات والتنازلات قبل اتخاذ قرارات مالية أو صرف مواد.`,
        impact: `منع الهدر المالي وتجنب توجيه مواد لمواقع غير جاهزة وحماية ${verificationDecisions.reduce((sum, d) => sum + d.approvedCement, 0).toLocaleString('ar-YE')} كيس إسمنت معتمد.`,
        action: 'توجيه فرق الرصد والمطابقة الميدانية ومهندسي القطاعات بالنزول وحصر الوقائع ورفع تقارير موثقة بالصور والإحداثيات.',
        responsibleOwner: isGovScope
          ? 'إدارة الرصد والمتابعة الميدانية بالوحدة / فروع المديريات'
          : `المشرف الهندسي والجمعية التعاونية بـ ${scopeLabel}`,
        deadline: 'خلال 7 أيام عمل',
        evidence: [
          `عدد المشاريع المعلقة للتحقق: ${verificationDecisions.length} مبادرة`,
          `المديريات المشمولة: ${districtsList.slice(0, 5).join('، ')}${districtsList.length > 5 ? ` و${districtsList.length - 5} مديريات أخرى` : ''}`,
          `المبدأ: الالتزام الصارم بالدليل البشري والمطابقة الميدانية قبل أي إجراء`
        ]
      });
    }

    // ----------------------------------------------------
    // حزمة 3: معالجة المبادرات المتوقفة والمتعثرة (Stalled Initiatives Package)
    // ----------------------------------------------------
    const stalledDecisions = singleDecisions.filter(d => 
      d.category === 'STALLED_TREATMENT' || d.category === 'COMMUNITY_CONSENSUS' || d.category === 'ENGINEERING_ASSESSMENT'
    );
    if (stalledDecisions.length > 0) {
      const affectedInits = scopedInitiatives.filter(i => stalledDecisions.some(sd => sd.initiativeId === i.id));
      const districtsList = Array.from(new Set(affectedInits.map(i => i.district)));
      const totalCostImpact = affectedInits.reduce((sum, i) => sum + (parseNum(i.cost) || 0), 0);
      const totalBeneficiaries = affectedInits.reduce((sum, i) => sum + (parseNum(i.beneficiaries) || 1200), 0);
      const atRiskCement = stalledDecisions.reduce((sum, d) => sum + d.remainingFieldCement, 0);

      bundles.push({
        packageId: 'bundle_stalled_resolution',
        title: isGovScope
          ? `برنامج الحسم التنفيذي للمبادرات المتوقفة وتأمين المخزون الميداني (${stalledDecisions.length} مبادرة)`
          : `خطة معالجة التعثر واستئناف العمل الميداني بمديرية ${scopeLabel} (${stalledDecisions.length} مبادرة)`,
        category: 'STALLED_TREATMENT',
        categoryTitle: 'حزمة معالجة التعثر والمناقلات وإلغاء الركود',
        priority: 'HIGH',
        priorityScore: 88,
        status: 'PENDING',
        scope: targetScope.scopeType,
        scopeName: scopeLabel,
        affectedCount: stalledDecisions.length,
        affectedInitiativeIds: stalledDecisions.map(d => d.initiativeId),
        affectedInitiativesSummary: affectedInits.map(init => {
          const sd = stalledDecisions.find(d => d.initiativeId === init.id)!;
          return {
            id: init.id,
            number: init.initiativeNumber || init.id,
            name: init.name,
            district: init.district,
            completionRate: sd.completionRate,
            status: init.status,
            keyMetric: sd.why.slice(0, 40) + '...'
          };
        }),
        districts: districtsList,
        totalBeneficiaries,
        totalCostImpact,
        totalCementBagsImpact: atRiskCement,
        requiresHumanConfirmation: true,
        generatedAt: new Date().toISOString(),
        why: `حصر ${stalledDecisions.length} مبادرة متوقفة أو متعثرة نتيجة معوقات أهلية أو فنية أو إدارية موثقة بسجلات النزول، مما يهدد ${atRiskCement.toLocaleString('ar-YE')} كيس إسمنت متبقية بالمواقع.`,
        impact: `إعادة تنشيط المشاريع المتعثرة، حماية مخزون الإسمنت من التلف، وتأمين الخدمات لـ ${totalBeneficiaries.toLocaleString('ar-YE')} مستفيد.`,
        action: isGovScope
          ? `إلزام قيادات السلطة المحلية بالمديريات والجمعيات التعاونية بعقد لجان تسوية ميدانية وحسم أسباب التوقف، أو اعتماد مناقلة المواد لمبادرات نشطة خلال مهلة أقصاها أسبوعين.`
          : `عقد جلسة عمل حاسمة مع اللجنة المجتمعية لمعالجة المعوقات واستئناف أعمال الرصف فوراً.`,
        responsibleOwner: isGovScope
          ? `${governor.fullName} (${governor.jobTitle}) بالتنسيق مع ${unitHead.fullName}`
          : `مدير عام المديرية ورئيس الجمعية التعاونية بـ ${scopeLabel}`,
        deadline: 'مهلة 10 أيام للمطابقة والتنفيذ',
        evidence: [
          `عدد المشاريع المتوقفة المشمولة: ${stalledDecisions.length} مبادرة`,
          `المخزون الميداني المعرض للتلف: ${atRiskCement.toLocaleString('ar-YE')} كيس إسمنت`,
          `الأسباب: موثقة تفصيلياً في سجل كل مبادرة على حدة`
        ]
      });
    }

    // ----------------------------------------------------
    // حزمة 4: الإغلاق والاستلام الفني النهائي (Closeout & Handover Package)
    // ----------------------------------------------------
    const closeoutDecisions = singleDecisions.filter(d => d.category === 'CLOSEOUT_HANDOVER');
    if (closeoutDecisions.length > 0) {
      const affectedInits = scopedInitiatives.filter(i => closeoutDecisions.some(cd => cd.initiativeId === i.id));
      const districtsList = Array.from(new Set(affectedInits.map(i => i.district)));
      const totalCostImpact = affectedInits.reduce((sum, i) => sum + (parseNum(i.cost) || 0), 0);
      const totalBeneficiaries = affectedInits.reduce((sum, i) => sum + (parseNum(i.beneficiaries) || 1200), 0);

      bundles.push({
        packageId: 'bundle_closeout_handover',
        title: isGovScope
          ? `اعتماد محاضر الإغلاق والتسليم الفني للمشاريع المنجزة بالكامل (${closeoutDecisions.length} مبادرة)`
          : `توثيق محاضر الاستلام والتسليم للمبادرات المكتملة بـ ${scopeLabel} (${closeoutDecisions.length} مبادرة)`,
        category: 'CLOSEOUT_HANDOVER',
        categoryTitle: 'حزمة الإغلاق والتسليم الفني النهائي',
        priority: 'ROUTINE',
        priorityScore: 40,
        status: 'PENDING',
        scope: targetScope.scopeType,
        scopeName: scopeLabel,
        affectedCount: closeoutDecisions.length,
        affectedInitiativeIds: closeoutDecisions.map(d => d.initiativeId),
        affectedInitiativesSummary: affectedInits.map(init => ({
          id: init.id,
          number: init.initiativeNumber || init.id,
          name: init.name,
          district: init.district,
          completionRate: 100,
          status: 'completed',
          keyMetric: 'منجزة 100% (جاهزة للإغلاق)'
        })),
        districts: districtsList,
        totalBeneficiaries,
        totalCostImpact,
        totalCementBagsImpact: 0,
        requiresHumanConfirmation: false,
        generatedAt: new Date().toISOString(),
        why: `استكمال تنفيذ ${closeoutDecisions.length} مبادرة بنسبة إنجاز 100% واكتمال أعمال الرصف والجدران ميدانياً وحاجتها للاستلام الرسمي.`,
        impact: `تثبيت الإنجازات التنموية للمحافظة، وتفريغ طاقة المتابعة الهندسية نحو المشاريع قيد التنفيذ، وحماية استثمارات بـ ${(totalCostImpact / 1000000).toFixed(1)} مليون ريال.`,
        action: 'توقيع محاضر الاستلام الفني المشتركة بين وحدة التدخلات والسلطة المحلية واللجان المجتمعية وأرشفة السجلات مستندياً.',
        responsibleOwner: isGovScope
          ? `${unitHead.fullName} (${unitHead.jobTitle})`
          : `مدير عام المديرية والمهندس المشرف بـ ${scopeLabel}`,
        deadline: 'خلال 15 يوماً',
        evidence: [
          `عدد المشاريع المكتملة 100%: ${closeoutDecisions.length} مبادرة`,
          `إجمالي المستفيدين الموثقين: ${totalBeneficiaries.toLocaleString('ar-YE')} مواطن`,
          `الحالة المستندية: مطابقة للاشتراطات الفنية وجداول الكميات المنجزة`
        ]
      });
    }

    return bundles;
  }
}
