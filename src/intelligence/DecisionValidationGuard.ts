/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DecisionValidationGuard (طبقة التحقق ومنع القرارات الوهمية)
 * يضمن عدم اختراع أي قرار أو مبادرة أو تكلفة أو موقع أو مسؤول وهمي خارج المصدر المرجعي المعتمد.
 */

import { importedInitiatives } from '../importedData';
import { Initiative } from '../types';
import { getOfficialById, getAllStoredOfficials } from '../data/officialsRegistry';

export interface DecisionPayload {
  initiativeId: string;
  initiativeName?: string;
  governorate?: string;
  district?: string;
  village?: string;
  currentStatus?: string;
  completionPercentage?: number;
  approvedItems?: string;
  implementedItems?: string;
  communityContribution?: string;
  remainingNeeds?: string;
  fieldAssessment?: string;
  decisionReason?: string;
  requiredAction?: string;
  responsibleEntity?: string;
  priority?: 'urgent' | 'medium' | 'routine';
  decisionStatus?: 'pending' | 'approved' | 'in_execution' | 'executed' | 'rejected';
  followUpDate?: string;
  responsibleOfficialId?: string;
  responsibleOfficialName?: string;
  responsibleOfficialPhone?: string;
}

export interface DecisionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canonicalInitiative?: Initiative;
  sanitizedDecision?: DecisionPayload;
}

export class DecisionValidationGuard {
  /**
   * Validates a proposed executive decision against the 725 canonical initiatives.
   */
  static validateDecision(payload: DecisionPayload): DecisionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. التحقق من وجود المعرف والمبادرة في المصدر المرجعي المعتمد
    if (!payload.initiativeId || typeof payload.initiativeId !== 'string') {
      errors.push('معرف المبادرة (initiativeId) مفقود أو غير صالح.');
      return { isValid: false, errors, warnings };
    }

    const cleanId = payload.initiativeId.trim();
    const initiative = importedInitiatives.find(
      i => i.id === cleanId || String(i.initiativeNumber) === cleanId
    );

    if (!initiative) {
      errors.push(`المبادرة رقم [${cleanId}] غير موجودة في المصدر المرجعي المعتمد (725 مبادرة). يُحظر إصدار قرار لمشروع غير مسجل.`);
      return { isValid: false, errors, warnings };
    }

    // 2. التحقق من كفاية البيانات لإصدار قرار موثوق
    const hasSufficientData = 
      Boolean(initiative.name && initiative.district && (initiative.status || initiative.completionRate !== undefined));

    if (!hasSufficientData) {
      errors.push('لا توجد بيانات كافية لإصدار قرار موثوق لهذه المبادرة.');
      return { isValid: false, errors, warnings };
    }

    // 3. التحقق من عدم تناقض القرار مع حالة المبادرة
    const currentStatus = initiative.status;
    const completionRate = Number(initiative.completionRate) || 0;

    // منع استكمال الدفعة السابقة للمبادرات التي لم يبدأ الصرف لها
    const disbursed = Number(initiative.materialsDisbursed) || 0;
    if (disbursed === 0 && payload.decisionReason?.includes('الدفعة السابقة')) {
      errors.push('يُحظر استخدام مصطلح "الدفعة السابقة" أو استكمالها لمبادرة لم يصرف لها أي مواد سابقاً (المنصرف = 0).');
    }

    // صياغة سبب القرار الفعلي بناءً على البيانات
    let validatedReason = payload.decisionReason?.trim() || '';
    if (!validatedReason) {
      if (currentStatus === 'stopped') {
        validatedReason = initiative.stagnationReason || initiative.notes || 'سبب التوقف غير موثق في البيانات الحالية.';
      } else if (currentStatus === 'stagnant') {
        validatedReason = initiative.stagnationReason || initiative.notes || 'عائق تنفيذي مسجل بالنزول الميداني بانتظار المعالجة المجتمعية.';
      } else if (currentStatus === 'completed') {
        validatedReason = 'المبادرة منجزة بنسبة 100% ومطابقة للتسليم الهندسي النهائي.';
      } else if (currentStatus === 'ongoing') {
        validatedReason = `الأعمال جارية بنسبة إنجاز ${completionRate}% وفق برنامج الصب والرصف المعتمد.`;
      } else {
        validatedReason = 'المبادرة قيد التحقق والمسح الأولي قبل بدء التدخل.';
      }
    }

    // 4. التحقق من المسؤول التنفيذي المكلّف
    let validatedOfficialId = payload.responsibleOfficialId?.trim();
    let validatedOfficialName = payload.responsibleOfficialName?.trim();
    let validatedOfficialPhone = payload.responsibleOfficialPhone?.trim();

    if (validatedOfficialId) {
      const official = getOfficialById(validatedOfficialId);
      if (official) {
        validatedOfficialName = official.fullName;
        validatedOfficialPhone = official.phone;
      } else {
        warnings.push('معرف المسؤول المحدد غير مسجل في السجل المعتمد، تم استخدام البيانات الوصفية.');
      }
    } else if (!validatedOfficialName && !payload.responsibleEntity) {
      warnings.push('القرار غير مكتمل: لا يوجد مسؤول تنفيذي مرتبط.');
    }

    // 5. تجهيز الكائن المنقح والمطابق للمصدر المرجعي
    const sanitizedDecision: DecisionPayload = {
      initiativeId: initiative.id,
      initiativeName: initiative.name,
      governorate: 'محافظة إب',
      district: initiative.district,
      village: initiative.village || 'غير محدد بالشيت',
      currentStatus: initiative.status,
      completionPercentage: completionRate,
      approvedItems: String(initiative.materialsApproved || initiative.unitContribution || '0'),
      implementedItems: String(initiative.materialsDisbursed || initiative.deliveredUnitContribution || '0'),
      communityContribution: String(initiative.communityContribution || '0'),
      remainingNeeds: String(Math.max(0, (Number(initiative.materialsApproved) || 0) - (Number(initiative.materialsDisbursed) || 0))),
      fieldAssessment: (initiative as any).fieldInspectionReport || (initiative as any).notes || 'معاينة ميدانية مسجلة بالسجل',
      decisionReason: validatedReason,
      requiredAction: payload.requiredAction?.trim() || 'المتابعة التنفيذية وفق خطة المسار المعتمد',
      responsibleEntity: payload.responsibleEntity?.trim() || 'وحدة التدخلات المركزية واللجنة المجتمعية',
      priority: payload.priority || (currentStatus === 'stagnant' || currentStatus === 'stopped' ? 'urgent' : 'medium'),
      decisionStatus: payload.decisionStatus || 'approved',
      followUpDate: payload.followUpDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      responsibleOfficialId: validatedOfficialId,
      responsibleOfficialName: validatedOfficialName,
      responsibleOfficialPhone: validatedOfficialPhone,
    };

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canonicalInitiative: initiative,
      sanitizedDecision,
    };
  }

  /**
   * Generates safe decision text and recommendations strictly from initiative data.
   */
  static generateSafeRecommendation(initiative: Initiative): {
    recommendation: string;
    reason: string;
    action: string;
    priority: 'urgent' | 'medium' | 'routine';
  } {
    const status = initiative.status;
    const rate = Number(initiative.completionRate) || 0;
    const disbursed = Number(initiative.materialsDisbursed) || 0;
    const approved = Number(initiative.materialsApproved) || 0;
    const remaining = Math.max(0, approved - disbursed);

    if (status === 'completed' || rate >= 100) {
      return {
        recommendation: `إصدار محضر الإغلاق النهائي وتوثيق استلام أعمال الرصف لمبادرة [${initiative.name}].`,
        reason: 'المبادرة منجزة بالكامل بنسبة 100% ومستوفية للمعايير الهندسية.',
        action: 'تسليم المشروع للسلطة المحلية وتوثيق شهادة الإنجاز المجتمعي.',
        priority: 'routine'
      };
    }

    if (status === 'stopped') {
      const reasonText = initiative.stagnationReason || (initiative as any).notes || 'سبب التوقف غير موثق في البيانات الحالية.';
      return {
        recommendation: `اعتماد مناقلة المخصصات غير المنصرفة من مبادرة [${initiative.name}] المتوقفة لصالح مبادرة نشطة بـ ${initiative.district}.`,
        reason: `المبادرة متوقفة بالميدان. السبب المسجل: ${reasonText}`,
        action: 'إلغاء الحجز المالي ومناقلة المواد المتبقية وتوثيق محضر التنازل.',
        priority: 'urgent'
      };
    }

    if (status === 'stagnant') {
      const reasonText = initiative.stagnationReason || (initiative as any).notes || 'عائق تنفيذي مسجل بالنزول الميداني.';
      return {
        recommendation: `عقد جلسة معالجة عاجلة بين السلطة المحلية بـ ${initiative.district} واللجنة المجتمعية لإزالة التعثر في [${initiative.name}].`,
        reason: `المبادرة متعثرة. السبب المسجل بالبيانات: ${reasonText}`,
        action: 'تكليف المهندس المشرف وفارس التنمية بحل الخلاف الميداني أو استكمال حشد الرصف الحجري خلال 10 أيام.',
        priority: 'urgent'
      };
    }

    if (status === 'ongoing') {
      return {
        recommendation: `استمرار وتيرة الصب والرصف لمبادرة [${initiative.name}] وصرف الدفعة المستحقة.`,
        reason: `الأعمال جارية بنسبة إنجاز ${rate}%، والرصيد المعتمد المتبقي لدى الوحدة ${remaining.toLocaleString('ar-YE')} كيس أسمنت.`,
        action: 'متابعة تقارير الإشراف الميداني وصرف المواد تباعاً وفق الإنجاز المحقق.',
        priority: 'medium'
      };
    }

    // Pending
    return {
      recommendation: `إجراء المسح الفني والتحقق من جاهزية موقع مبادرة [${initiative.name}] قبل تدشين الصرف.`,
      reason: 'المبادرة لم تبدأ بعد وبانتظار استكمال تأمين المستودع وتوثيق التنازلات.',
      action: 'تكليف مهندس القطاع بفحص المستودع وحشد المشاركة المجتمعية قبل تسليم الدفعة الأولى.',
      priority: 'medium'
    };
  }
}
