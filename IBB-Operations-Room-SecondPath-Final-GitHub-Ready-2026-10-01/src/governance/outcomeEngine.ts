/**
 * EXECUTION-03 — Outcome Engine
 * Defines expected physical outcomes and physical/data evidence required for issue closure.
 */

import { Initiative } from '../types';
import { Intervention, ExpectedOutcome } from './types';

export function deriveExpectedOutcome(initiative: Initiative, intervention: Intervention): ExpectedOutcome {
  const type = intervention.type;
  const completion = initiative.completionRate ?? 0;

  let outcomeText = 'استمرار وتيرة التنفيذ الميداني بدون عوائق.';
  let evidenceRequired: string[] = ['تقرير المتابعة الميداني الشهري', 'تحديث نسبة الإنجاز في النظام'];
  let closureCriteria = 'وصول نسبة الإنجاز إلى 100% وتوفير تقرير الاستلام النهائي.';

  if (type === 'SUPPLY_INTERVENTION') {
    outcomeText = 'وصول شحنة المواد (الأسمنت/الديزل) إلى موقع العمل واستئناف صب الخرسانة والرصف.';
    evidenceRequired = [
      'سند استلام الشحنة الميداني موقع من لجنة المبادرة',
      'صور ميدانية ملتقطة حديثاً لعملية الصب والرصف',
      'ارتفاع نسبة الإنجاز الفعلية في التقرير اللاحق',
    ];
    closureCriteria = 'تأكيد وصول المواد الميدانية واستئناف العمل الميداني الفعلي.';
  } else if (type === 'TECHNICAL_ASSESSMENT') {
    outcomeText = 'اعتماد المخطط الهندسي المعدل وحل المشكلة الفنية بالجدران الساندة.';
    evidenceRequired = [
      'المخطط الفني المعتمد من مهندس المنطقة',
      'محضر الفحص الفني الميداني موقع من اللجنة المشرفة',
    ];
    closureCriteria = 'اعتماد الدراسة الهندسية وتجاوز الخلل الميداني.';
  } else if (type === 'DOCUMENTATION_CLOSURE') {
    outcomeText = 'استكمال وتوثيق السجلات الرسمية ومحضر التسليم النهائي للمشروع.';
    evidenceRequired = [
      'محضر الاستلام الابتدائي/النهائي المعتمد من السلطة المحلية',
      'أرشيف الصور الفوتوغرافية للقطع المكتملة',
    ];
    closureCriteria = 'اعتماد محضر التسليم رسمياً وإقفال السجل الإداري للمبادرة.';
  } else if (type === 'COMMUNITY_MEDIATION') {
    outcomeText = 'حسم النزاع المجتمعي وتوقيع محضر التوافق بين أهالي المنطقة.';
    evidenceRequired = [
      'محضر الصلح والتوافق المجتمعي موقع من كبار الأهالي والمديرية',
      'تقرير نزول السلطة المحلية لتأمين مسار العمل',
    ];
    closureCriteria = 'حسم الخلاف المجتمعي رسمياً واستئناف المعدات للعمل في الطريق.';
  } else if (type === 'FINANCIAL_ALLOCATION') {
    outcomeText = 'إيداع الدفعة المعتمدة وبدء التعاقدات والتشغيل المالي للمعدات.';
    evidenceRequired = ['إشعار الصرف المالي المعتمد', 'كشف المستحقات للعمالة والمعدات'];
    closureCriteria = 'تأكيد صرف المستحقات واستئناف النشاط التشغيلي.';
  } else if (type === 'FIELD_EVALUATION') {
    outcomeText = 'تحديد السبب الدقيق للتوقف ووضع التوصية الإجرائية الحاسمة.';
    evidenceRequired = ['تقرير التقييم الميداني المفصل موقع من فريق الرصد'];
    closureCriteria = 'رفع التقرير الميداني وتحديد نوع التدخل المطلوب في المنظومة.';
  }

  return {
    outcomeText,
    evidenceRequired,
    closureCriteria,
  };
}
