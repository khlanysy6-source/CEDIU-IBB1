/**
 * EXECUTION-03 — Follow-Up Engine
 * Sets event-driven follow-up conditions for active governance interventions.
 */

import { Initiative } from '../types';
import { Intervention, FollowUp } from './types';

export function deriveFollowUp(initiative: Initiative, intervention: Intervention): FollowUp {
  const type = intervention.type;

  if (type === 'NONE_REQUIRED') {
    return {
      required: false,
      type: 'PERIODIC',
      condition: 'متابعة روتينية ضمن التقرير الدعمي الدوري.',
      nextReviewTrigger: 'التقرير الميداني الدوري القادم',
    };
  }

  let condition = 'متابعة تنفيذ التدخل واستلام الأدلة المؤكدة.';
  let nextReviewTrigger = 'عند استلام التقرير الميداني المحدث';

  if (type === 'SUPPLY_INTERVENTION') {
    condition = 'التحقق من وصول شحنة التوريد والتأكد من استئناف أعمال الصب والخسانة.';
    nextReviewTrigger = 'فور وصول إشعار تسليم الشحنة الميداني';
  } else if (type === 'TECHNICAL_ASSESSMENT') {
    condition = 'التحقق من رفع التقرير الفني المساحي والمخطط الهندسي المعدل.';
    nextReviewTrigger = 'عند تقديم المخطط الهندسي من مهندس المنطقة';
  } else if (type === 'DOCUMENTATION_CLOSURE') {
    condition = 'التحقق من التوقيع الرسمي على محضر الاستلام الميداني والإغلاق.';
    nextReviewTrigger = 'عند رفع محضر الاستلام المعتمد من المديرية';
  } else if (type === 'COMMUNITY_MEDIATION') {
    condition = 'التحقق من توقيع محضر التوافق بين الأهالي وحماية مسار العمل.';
    nextReviewTrigger = 'عند رفع محضر الصلح والتوافق من السلطة المحلية';
  } else if (type === 'FIELD_EVALUATION') {
    condition = 'مراجعة التقرير الميداني لفريق الرصد لتحديد فئة التدخل التالية.';
    nextReviewTrigger = 'عند صدور تقرير النزول الميداني';
  }

  return {
    required: true,
    type: 'EVENT_BASED',
    condition,
    nextReviewTrigger,
  };
}
