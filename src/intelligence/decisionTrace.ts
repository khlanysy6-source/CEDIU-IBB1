/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Initiative } from '../types';
import { ExtractedEvidence, Recommendation, DecisionTrace, ConfidenceLevel } from './types';
import { NormalizedStatusResult } from './statusNormalization';

/**
 * Decision Trace & Recommendation Engine V2
 * Generates tailored recommendations and full transparent decision traces
 * linking executive recommendations directly to underlying field facts and evidence.
 */
export class DecisionTraceEngine {
  static generateRecommendationAndTrace(
    initiative: Initiative,
    evidence: ExtractedEvidence,
    normalized: NormalizedStatusResult,
    confidence: ConfidenceLevel
  ): { recommendation: Recommendation; decisionTrace: DecisionTrace } {
    let recommendation: Recommendation;
    const reasons: string[] = [];
    const extractedFactNotes: string[] = [];

    // Gather extracted fact notes for trace transparency
    if (evidence.stagnationReasonText) {
      extractedFactNotes.push(`سبب التعثر المسجل: "${evidence.stagnationReasonText}"`);
    }
    if (evidence.atRiskMaterials.length > 0) {
      extractedFactNotes.push(`المواد المهددة بالتلف: ${evidence.atRiskMaterials.join('، ')}`);
    }
    if (evidence.fieldReportChallenges.length > 0) {
      extractedFactNotes.push(`تحديات المعاينة الميدانية: ${evidence.fieldReportChallenges.slice(0, 2).join(' | ')}`);
    }

    // 1. Generate Tailored Recommendation based on Bottleneck
    if (normalized.normalizedStatus === 'completed') {
      recommendation = {
        actionCode: 'ACT_FINAL_CLOSEOUT',
        title: 'اعتماد الإغلاق النهائي وأرشفة قصة النجاح',
        summary: 'المبادرة منجزة بنجاح 100%، يتطلب الإجراء توثيق المحضر النهائي وإغلاق الملف.',
        responsibleEntity: 'وحدة التدخلات المركزية',
        targetInterventions: [
          'أرشفة التقرير الختامي وصور طريق الجاهزية',
          'تحرير شهادة إنجاز المبادرة المجتمعية للجنة التنموية',
          'تسليم الطريق للجهة المحلية للصيانة الدورية'
        ]
      };
      reasons.push('المبادرة حققت نسبة إنجاز 100% وتم استكمال الأعمال الميدانية');
    } else {
      switch (evidence.identifiedBottleneck) {
        case 'CEMENT_DIESEL_SUPPLY':
          recommendation = {
            actionCode: 'ACT_SUPPLY_ALLOCATION',
            title: 'معالجة فورية لمسار توريد وحماية الإسمنت والديزل',
            summary: 'توقف العمل يرتبط بشح المواد الخرسانية أو وجود أسمنت مخزن مهدد بالرطوبة والتلف.',
            responsibleEntity: 'وحدة التدخلات المركزية',
            targetInterventions: [
              'تأمين مخصص الدفعة الإضافية من الأسمنت والديزل',
              'فحص مخزن المبادرة ميدانياً ورفع المواد على طبالي خشبية حماية من الرطوبة',
              'متابعة جدول الصرف مع الفارس الميداني والتنسيق مع مهندس القطاع'
            ]
          };
          reasons.push('الأدلة الميدانية أظهرت توقف التوريد أو مخاطر تلف الأسمنت المخزن');
          break;

        case 'COMMUNITY_FINANCING':
          recommendation = {
            actionCode: 'ACT_COMMUNITY_MOBILIZATION',
            title: 'تفعيل التحشيد المجتمعي وتأمين المساهمات النقدية',
            summary: 'التعثر يعود لعجز المساهمة المجتمعية النقدية لشراء الأحجار وأجرة العمال والمعدات.',
            responsibleEntity: 'الجمعية التعاونية',
            targetInterventions: [
              'عقد اجتماع تنسيقي بين الجمعية التعاونية ولجنة المبادرة والفرسان',
              'فتح باب المساهمات المباشرة والتواصل مع المغتربين لتغطية الفجوة الماليّة',
              'جدولة المساهمات العينية (أحجار - أيدٍ عاملة - مياه) كبديل نُقدِي'
            ]
          };
          reasons.push('الأدلة والملاحظات تشير إلى تباطؤ جمع المساهمة النقدية المحلية');
          break;

        case 'GEOGRAPHICAL_TERRAIN':
          recommendation = {
            actionCode: 'ACT_ENGINEERING_ASSESSMENT',
            title: 'نزول فني هندسي وتعديل دراسة الجدران الساندة',
            summary: 'التنفيذ يواجه عقبات تضاريسية جبلية وعرة تتطلب حماية الخرسانة والجدران الساندة.',
            responsibleEntity: 'المهندس المشرف',
            targetInterventions: [
              'نزول مهندس المنطقة لإعادة قياس المقطع العرضي وتحديد مواقع الجدران',
              'تعديل كميات الخرسانة المسلحة وتحديد معايير السلامة للقطع الصخري',
              'تقديم الدعم الفني للجنة المبادرة لتفادي انهيارات السيول'
            ]
          };
          reasons.push(evidence.stagnationReasonText ? `سبب التعثر المسجل: ${evidence.stagnationReasonText}` : 'سبب التعثر غير موثق بالبيانات الحالية');
          break;

        case 'EQUIPMENT_MACHINERY':
          recommendation = {
            actionCode: 'ACT_EQUIPMENT_DISPATCH',
            title: 'توفير معدات الشق والتوسعة الميدانية',
            summary: 'تعتمد استمرارية المبادرة على توفير معدات فتح المسار بحسب الخطة.',
            responsibleEntity: 'السلطة المحلية بالمديرية',
            targetInterventions: [
              'التنسيق مع السلطة المحلية بالمديرية لتوجيه معدة شق لموقع المبادرة',
              'اعتماد مخصص الديزل التشغيلي للمعدة بالتنسيق مع فرع وحدة التدخلات',
              'جدولة خطة عمل يومية مكثفة للشق والتوسع قبل موسم الأمطار'
            ]
          };
          reasons.push(evidence.stagnationReasonText ? `سبب التعثر المسجل: ${evidence.stagnationReasonText}` : 'سبب التعثر غير موثق بالبيانات الحالية');
          break;

        case 'TECHNICAL_PERMIT':
          recommendation = {
            actionCode: 'ACT_TECHNICAL_SURVEY',
            title: 'استكمال المسح الميداني والرفع الفني المعتمد',
            summary: 'بانتظار اعتماد الدراسة والمواصفات الفنية المعتمدة من المهندس المشرف.',
            responsibleEntity: 'المهندس المشرف',
            targetInterventions: [
              'إنجاز الرفع المساحي والفرز الفني لمسار الطريق',
              'تجهيز جدول الكميات المعتمد وتسليمه لوحدة التدخلات',
              'توجيه الفرسان لبدء التجهيزات الميدانية والأعمال الترابية'
            ]
          };
          reasons.push('المبادرة تتطلب استكمال المسح الفني والفرز الهندسي المعتمد');
          break;

        case 'CLOSEOUT_DOCUMENTATION':
          recommendation = {
            actionCode: 'ACT_FINAL_CLOSEOUT',
            title: 'استكمال وثائق الاستلام وإغلاق المحضر الميداني',
            summary: 'الأعمال الميدانية شارفة على الانتهاء، يتطلب الإجراء توثيق محضر الاستلام.',
            responsibleEntity: 'المهندس المشرف',
            targetInterventions: [
              'مطابقة استهلاك المواد بسجلات الفرسان واستمارة المطابقة',
              'تحرير محضر الاستلام الميداني النهائي المعتمد من مهندس القطاع',
              'رفع تقرير النجاح النهائي إلى قيادة المنصة'
            ]
          };
          reasons.push(`نسبة الإنجاز مرتفعة جداً (${initiative.completionRate}%) وتتطلب استكمال التوثيق`);
          break;

        case 'AWAITING_FIELD_SURVEY':
          recommendation = {
            actionCode: 'ACT_INITIAL_SURVEY',
            title: 'برمجة زيارة المسح الميداني والفرز الأولي',
            summary: 'المبادرة مسجلة ولم تبدأ بعد، تتطلب النزول الميداني للتحقق من الجاهزية المجتمعية.',
            responsibleEntity: 'المهندس المشرف',
            targetInterventions: [
              'إدراج المبادرة ضمن خطة النزول الفني لأسبوع المديرية الحالي',
              'التحقق من التزام المجتمع وتشكيل اللجنة المجتمعية',
              'رفع استمارة التشخيص والفرز الأولى'
            ]
          };
          reasons.push('المبادرة في مرحلة قيد الانتظار ولم يبدأ التنفيذ بعد');
          break;

        default:
          recommendation = {
            actionCode: 'ACT_ROUTINE_MONITORING',
            title: 'متابعة سير التنفيذ الميداني وتوثيق الإنجاز',
            summary: 'المبادرة تعمل بشكل منتظم، يتطلب الأمر المتابعة الدورية ورفع التقارير المصورة.',
            responsibleEntity: 'لجنة المبادرة المجتمعية',
            targetInterventions: [
              'رفع تقرير متابعة دوري مصور عبر بوابة المنصة',
              'تحديث نسبة الإنجاز واستمرار توثيق استهلاك المواد',
              'الحفاظ على وتيرة العمل المجتمعي'
            ]
          };
          reasons.push('المبادرة تسير بشكل طبيعي ضمن الخطوات التنفيذية المعتمدة');
          break;
      }
    }

    const decisionTrace: DecisionTrace = {
      decision: recommendation.title,
      reasons,
      evidence: extractedFactNotes.length > 0 ? extractedFactNotes : ['تم استخلاص الأدلة من البيانات الأصلية ومؤشرات الأداء'],
      confidence,
      requiredInterventions: recommendation.targetInterventions,
      generatedAt: new Date().toISOString(),
      engineVersion: '2.0.0'
    };

    return {
      recommendation,
      decisionTrace
    };
  }
}
