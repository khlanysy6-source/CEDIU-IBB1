/**
 * EXECUTION-03 — Intervention Engine
 * Generates tailored interventions based on Cause + Impact + Priority + Evidence.
 * Strictly avoids blanket duplicate recommendations for different causes.
 */

import { Initiative } from '../types';
import { DecisionProfile } from '../intelligence/types';
import { RootCause, Impact, Intervention, InterventionType } from './types';

export function deriveIntervention(
  initiative: Initiative,
  decisionProfile: DecisionProfile,
  rootCause: RootCause,
  impact: Impact
): Intervention {
  const causeCat = rootCause.category;
  const completion = initiative.completionRate ?? 0;
  const statusStr = initiative.status || 'unknown';

  let type: InterventionType = 'NONE_REQUIRED';
  let title = 'متابعة روتينية';
  let description = 'استمرار المتابعة الميدانية الدورية وفق الخطة التنموية المعتمدة.';
  let urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  let requiredAuthority = 'الإدارة المحلية بالمديرية';
  let expectedEffect = 'الحفاظ على وتيرة التنفيذ واستمرارية المشروع.';

  if (causeCat === 'Supply') {
    type = 'SUPPLY_INTERVENTION';
    title = 'معالجة مسار توريد وحماية الأسمنت والديزل';
    description =
      'التنسيق الفوري مع الوحدة المركزية للمبادرات لتوريد شحنة الأسمنت/الديزل وتأمين حماية المواد الميدانية من التلف.';
    urgency = impact.level === 'CRITICAL' || impact.level === 'HIGH' ? 'CRITICAL' : 'HIGH';
    requiredAuthority = 'الوحدة المركزية للمبادرات + المحافظة';
    expectedEffect = 'استئناف صب الخرسانة والرصف وحماية المخزون الميداني من السيول والتلف.';
  } else if (causeCat === 'Technical') {
    type = 'TECHNICAL_ASSESSMENT';
    title = 'نزول فني هندسي وتعديل دراسة الجدران الساندة';
    description = 'إيفاد مهندس المنطقة لإجراء الفحص الفني وإعداد المخطط المساحي للجدران الساندة ومسار الطريق.';
    urgency = 'HIGH';
    requiredAuthority = 'اللجنة الهندسية المشرفة بالمديرية';
    expectedEffect = 'معالجة العوائق الفنية واعتماد المخطط الهيكلي الآمن للبدء في الأعمال.';
  } else if (causeCat === 'Documentation') {
    type = 'DOCUMENTATION_CLOSURE';
    title = 'استكمال وثائق الاستلام وإغلاق المحضر الميداني';
    description =
      'مراجعة واستكمال محاضر الفرز الفني والاستلام النهائي للأعمال المنجزة لتسليم المشروع رسمياً.';
    urgency = completion >= 80 ? 'HIGH' : 'MEDIUM';
    requiredAuthority = 'مكتب المبادرات بالمحافظة واللجنة الفنية';
    expectedEffect = 'توثيق المشروع رسمياً وإغلاق ملف التعثر المستندي وإدراجه ضمن المشاريع المنجزة.';
  } else if (causeCat === 'Community') {
    type = 'COMMUNITY_MEDIATION';
    title = 'تدخل مجتمعي وحسم التوافق الأهلي حول المسار';
    description = 'عقد اجتماع مع السلطة المحلية وأهالي المنطقة ورعاة المبادرة للتوافق على مسار الطريق وحرم الخدمة.';
    urgency = 'HIGH';
    requiredAuthority = 'مدير عام المديرية + المجلس المحلي';
    expectedEffect = 'إزالة الاعتراضات المجتمعية وتوفير البيئة الآمنة لاستئناف الأعمال.';
  } else if (causeCat === 'Funding') {
    type = 'FINANCIAL_ALLOCATION';
    title = 'تسريع اعتماد الموازنة والدفعة المالية المخصصة';
    description = 'استكمال إجراءات صرف الدفعة المعتمدة للتعاقد مع المعدات وتغطية أجور العمالة.';
    urgency = 'HIGH';
    requiredAuthority = 'إدارة الشؤون المالية والفرع التنفيذي';
    expectedEffect = 'ضخ السيولة التشغيلية وتوفير الوقود والمعدات الثقيلة للموقع.';
  } else if (causeCat === 'Unknown') {
    if (statusStr === 'stagnant' || statusStr === 'stopped') {
      type = 'FIELD_EVALUATION';
      title = 'تقييم ميداني عاجل لفرز أسباب التوقف';
      description =
        'تكليف فريق الرصد والتتبع بالنزول الفني لإعداد تقرير مفصل عن حالة المبادرة وتحديد الاحتياج الدقيق.';
      urgency = 'HIGH';
      requiredAuthority = 'فريق الرصد والمتابعة الميدانية';
      expectedEffect = 'توفير تشخيص حاسم ودقيق للسبب الجذري للتوقف وتحديد قرار التدخل التالي.';
    } else {
      type = 'NONE_REQUIRED';
      title = 'متابعة ميدانية اعتيادية';
      description = 'المبادرة تسير بشكل اعتيادي دون الحاجة لتدخل استثنائي في الوقت الحالي.';
      urgency = 'LOW';
      requiredAuthority = 'إدارة المبادرات بالمديرية';
      expectedEffect = 'ضمان استقرار العمل وتتبع نسبة الإنجاز الشهري.';
    }
  } else if (causeCat === 'Administrative') {
    type = 'ADMINISTRATIVE_DECISION';
    title = 'إصدار قرار إداري لتحديد آلية الإشراف والتنفيذ';
    description = 'تأكيد التوجيهات الإدارية الصريحة للمستويات المحلية بتنظيم مسار الإشراف والمتابعة.';
    urgency = 'MEDIUM';
    requiredAuthority = 'قيادة المحافظة / مدير عام المديرية';
    expectedEffect = 'رفع كفاءة التنسيق الإداري وحسم التداخلات بين الجهات المشرفة.';
  }

  return {
    type,
    title,
    description,
    urgency,
    requiredAuthority,
    expectedEffect,
  };
}
