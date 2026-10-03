/**
 * Final source-of-truth contract for the Ibb Second Executive Pathway.
 *
 * The web platform does NOT depend on the legacy "خلاصات مدمجة" sheet,
 * nor on duplicate/legacy operational matrices. Excel remains an import/export
 * representation; the platform's canonical initiative registry is the runtime SSOT.
 */
export const AUTHORITATIVE_SOURCES = {
  initiativeRegistry: {
    label: 'مبادرات الطرق المدعومة من وحدة التدخلات في محافظة إب للمنصة — 725 مبادرة',
    purpose: 'السجل المرجعي الأساسي للمبادرات: الهوية والموقع والتكلفة والكميات والمواد والإنجاز.',
    platform: true,
  },
  studies: {
    label: 'الدراسات',
    purpose: 'بنود الأعمال والوحدات والكميات والتكلفة المعتمدة فنياً.',
    platform: false,
  },
  evaluation: {
    label: 'مصفوفة مستوى الانجاز والتقييم',
    purpose: 'بنود الأعمال المرتبطة بمفاتيح EXC وموقف الإنجاز والتقييم.',
    platform: false,
  },
  sorting: {
    label: 'مصفوفة الفرز',
    purpose: 'الحالة الحالية والتوصيف الفني والقرار والبيانات التشغيلية المرتبطة بالمبادرة.',
    platform: false,
  },
  cementLedger: {
    label: 'مصفوفة سجل الشطب(اسمنت)',
    purpose: 'حركة الأسمنت: اعتماد، صرف، استهلاك، رصيد وفروقات.',
    platform: false,
  },
  dieselLedger: {
    label: 'مصفوفة سجل الشطب(ديزل)',
    purpose: 'حركة الديزل: اعتماد، صرف، استهلاك، رصيد وفروقات.',
    platform: false,
  },
} as const;

export const NON_AUTHORITATIVE_SOURCES = [
  'خلاصات مدمجة',
  'المصفوفات التشغيلية الرئيسية(2)',
  'المصفوفات التشغيلية الرئيسية(3)',
  'مصفوفة الفرز (2)',
] as const;

export const EXC_IDENTITY_RULE =
  'EXC_* هو مفتاح بند العمل في مصفوفة مستوى الانجاز والتقييم، ولا يجوز حذفه أو استبداله باسم البند.';

export const PLATFORM_DATA_VERSION = '2026-09-30.final-integrated';
