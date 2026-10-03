/**
 * Development Decision Engine (محرك القرار والتشخيص التنموي)
 * Builds executive dossiers, diagnostic cases, and health metrics for initiatives.
 */

import { Initiative } from '../types';
import { parseMaterialValue, analyzeInitiativeMaterials } from './materialAnalysis';
import { parseNum } from './numberAndDistrictUtils';

export type مؤشرات_القرار = any;
export type إجراء_مطلوب = any;

export interface ميزان_المادة {
  المعتمد: number;
  المنصرف: number;
  المستخدم: number;
  المتبقي_لدى_الوحدة: number;
  المتبقي_لدى_المبادرة: number;
  فرق_يحتاج_تحقق: number;
  هل_تم_صرف_فوق_المعتمد: boolean;

  // Aliases for compatibility
  المعتمد_كيس: number;
  المنصرف_كيس: number;
  المستخدم_كيس: number;
  مخزون_الوحدة_كيس: number;
  رصيد_العهدة_كيس: number;
}

export interface الملف_التنفيذي_للمبادرة {
  المبادرة: {
    الرقم: string;
    الاسم: string;
    المديرية: string;
    العزلة: string;
    الحالة: string;
    [key: string]: any;
  };
  هوية_المبادرة?: {
    رقم_المبادرة: string;
    اسم_المبادرة: string;
    المديرية: string;
    العزلة: string;
    الحالة: string;
    [key: string]: any;
  };
  المجتمع?: any;
  الهندسة?: any;
  الوثائق?: any;
  الإجراءات?: any;
  التوصيات?: any;
  المواد: {
    الإسمنت: ميزان_المادة;
    الأسمنت: ميزان_المادة;
    الديزل: {
      المعتمد_لتر: number;
      المنصرف_لتر: number;
      المستخدم_لتر: number;
      المتبقي_لدى_الوحدة: number;
      رصيد_العهدة_لتر: number;
      فرق_يحتاج_تحقق: number;
      [key: string]: any;
    };
    [key: string]: any;
  };
  التحليل: {
    نسبة_الإنجاز: number;
    التكلفة: number;
    مساهمة_المجتمع: number;
    مساهمة_الوحدة: number;
    الحالة_التشغيلية?: any;
    الحالة_الفنية?: any;
    [key: string]: any;
  };
  المؤشرات: {
    درجة_صحة_المبادرة: number;
    درجة_الخطورة: 'منخفض' | 'متوسط' | 'مرتفع' | 'حرج';
    [key: string]: any;
  };
  التشخيص: {
    كود_الحالة: string;
    عنوان_الحالة: string;
    الوصف: string;
    الإجراء_المقترح: string;
    [key: string]: any;
  };
  القرار_المقترح?: {
    نوع_القرار: string;
    الإجراء_الموصى_به: string;
    الأولوية: 'ROUTINE' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    الجهة_المسؤولة: string;
    النموذج_المطلوب: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export function إنشاء_الملف_التنفيذي_للمبادرة(init: Initiative): الملف_التنفيذي_للمبادرة {
  const completionRate = Math.min(100, Math.max(0, Number(init.completionRate) || 0));

  // Cement
  const cApp = parseMaterialValue(init.materialsApproved || (init as any).approvedCement);
  const cDis = parseMaterialValue(init.materialsDisbursed || (init as any).disbursedCement);
  const cUse = parseMaterialValue(init.materialsUsed || (init as any).consumedCement);

  const cRemainingUnit = Math.max(0, cApp - cDis);
  const cRemainingSite = Math.max(0, cDis - cUse);
  const cExcess = Math.max(0, cUse - cDis);
  const cOverDisbursed = cDis > cApp && cApp > 0;

  // Diesel
  const dApp = parseMaterialValue(init.dieselApproved);
  const dDis = parseMaterialValue(init.dieselDisbursed);
  const dUse = parseMaterialValue(init.dieselUsed);

  const dRemainingUnit = Math.max(0, dApp - dDis);
  const dRemainingSite = Math.max(0, dDis - dUse);
  const dExcess = Math.max(0, dUse - dDis);

  // Diagnostic Case Assignment
  let caseCode = 'case_1_normal_flow';
  let caseTitle = 'مسار تنفيذي طبيعي';
  let caseDesc = 'الأعمال تسير وفق المعدلات المعتمدة والعهد الميدانية منضبطة.';
  let caseAction = 'استمرار المتابعة الميدانية الدورية.';
  let riskLevel: 'منخفض' | 'متوسط' | 'مرتفع' | 'حرج' = 'منخفض';
  let healthScore = 85;

  if (init.status === 'completed' || completionRate >= 100) {
    caseCode = 'case_6_completed_closed';
    caseTitle = 'مبادرة مكتملة ومنجزة';
    caseDesc = 'اكتملت كافة أعمال المشروع ومطابقة للمواصفات.';
    caseAction = 'إجراء محضر الاستلام النهائي وأرشفة الملف.';
    riskLevel = 'منخفض';
    healthScore = 98;
  } else if (cDis > 0 && completionRate === 0) {
    caseCode = 'case_7_approved_not_started';
    caseTitle = 'صرف مواد دون بدء التنفيذ';
    caseDesc = 'تم صرف مواد للموقع مع توقف الأعمال عند نسبة 0%.';
    caseAction = 'نزول ميداني فوري لحماية المواد من التلف والتحقق من التجهيزات.';
    riskLevel = 'حرج';
    healthScore = 30;
  } else if (init.status === 'stopped' || init.status === 'stagnant') {
    if (cRemainingSite > 100) {
      caseCode = 'case_8_needs_field_verification';
      caseTitle = 'تعثر مع وجود عهدة مواد بالموقع';
      caseDesc = `المشروع متوقف ويتوفر مخزون أسمنت (${cRemainingSite} كيس) معرض للتلف.`;
      caseAction = 'حصر أسباب التوقف ونقل العهدة أو تفعيل العمل فوراً.';
      riskLevel = 'مرتفع';
      healthScore = 40;
    } else {
      caseCode = 'case_9_needs_technical_review';
      caseTitle = 'توقف المشروع ويحتاج مراجعة فنية';
      caseDesc = 'المبادرة متوقفة أو متعثرة وتتطلب دراسة استئناف.';
      caseAction = 'عقد اجتماع تنسيقي مع اللجنة المجتمعية وفحص الجاهزية.';
      riskLevel = 'متوسط';
      healthScore = 50;
    }
  } else if (cExcess > 0) {
    caseCode = 'case_5_excess_consumed';
    caseTitle = 'استهلاك يتجاوز المنصرف (مساهمة مجتمعية إضافية)';
    caseDesc = `المستهلك الفعلي (${cUse}) يتجاوز المنصرف (${cDis}) بفارق (${cExcess}) كيس.`;
    caseAction = 'توثيق واحتساب مساهمة المجتمع الإضافية بعد المعاينة.';
    riskLevel = 'منخفض';
    healthScore = 75;
  } else if (cOverDisbursed) {
    caseCode = 'case_3_over_disbursed';
    caseTitle = 'صرف يتجاوز المعتمد بالدراسة';
    caseDesc = `تم صرف (${cDis}) كيس بينما المعتمد بالدراسة (${cApp}) كيس.`;
    caseAction = 'تدقيق هندسي وفني لتسوية الكميات والاعتماد التكميلي.';
    riskLevel = 'مرتفع';
    healthScore = 45;
  } else {
    healthScore = Math.min(100, Math.max(50, Math.round(50 + completionRate * 0.4)));
  }

  const cementMizan: ميزان_المادة = {
    المعتمد: cApp,
    المنصرف: cDis,
    المستخدم: cUse,
    المتبقي_لدى_الوحدة: cRemainingUnit,
    المتبقي_لدى_المبادرة: cRemainingSite,
    فرق_يحتاج_تحقق: cExcess,
    هل_تم_صرف_فوق_المعتمد: cOverDisbursed,

    المعتمد_كيس: cApp,
    المنصرف_كيس: cDis,
    المستخدم_كيس: cUse,
    مخزون_الوحدة_كيس: cRemainingUnit,
    رصيد_العهدة_كيس: cRemainingSite
  };

  return {
    المبادرة: {
      الرقم: init.initiativeNumber || init.id,
      الاسم: init.name,
      المديرية: init.district,
      العزلة: init.subDistrict || '',
      الحالة: init.status
    },
    هوية_المبادرة: {
      رقم_المبادرة: init.initiativeNumber || init.id,
      اسم_المبادرة: init.name,
      المديرية: init.district,
      العزلة: init.subDistrict || '',
      الحالة: init.status
    },
    المجتمع: {
      نسبة_المساهمة: parseNum(init.communityContribution) > 0 && parseNum(init.cost) > 0
        ? Math.round((parseNum(init.communityContribution) / parseNum(init.cost)) * 100)
        : 50,
      المساهمة_النقدية: parseNum(init.communityContribution),
      تفاعل_المجتمع: 'إيجابي'
    },
    الهندسة: {
      حالة_المطابقة: 'مطابق للمواصفات',
      جودة_التنفيذ: 'جيد'
    },
    الوثائق: {
      هل_يوجد_محضر_استلام: completionRate >= 95,
      اكتمال_الملف: true
    },
    الإجراءات: [
      { العنوان: caseAction, التاريخ: '2026-10-01' }
    ],
    التوصيات: [
      caseAction
    ],
    المواد: {
      الإسمنت: cementMizan,
      الأسمنت: cementMizan,
      الديزل: {
        المعتمد_لتر: dApp,
        المنصرف_لتر: dDis,
        المستخدم_لتر: dUse,
        المتبقي_لدى_الوحدة: dRemainingUnit,
        رصيد_العهدة_لتر: dRemainingSite,
        فرق_يحتاج_تحقق: dExcess
      }
    },
    التحليل: {
      نسبة_الإنجاز: completionRate,
      التكلفة: parseNum(init.cost),
      مساهمة_المجتمع: parseNum(init.communityContribution),
      مساهمة_الوحدة: parseNum(init.unitContribution),
      الحالة_التشغيلية: init.status || (completionRate >= 95 ? 'مكتملة' : completionRate > 0 ? 'قيد التنفيذ' : 'متوقفة'),
      الحالة_الفنية: completionRate >= 95 ? 'منجز فنيًا' : 'تحت التنفيذ'
    },
    المؤشرات: {
      درجة_صحة_المبادرة: healthScore,
      درجة_الخطورة: riskLevel
    },
    التشخيص: {
      كود_الحالة: caseCode,
      عنوان_الحالة: caseTitle,
      الوصف: caseDesc,
      الإجراء_المقترح: caseAction
    }
  };
}

export function تقييم_وتشخيص_المبادرة(init: Initiative) {
  return إنشاء_الملف_التنفيذي_للمبادرة(init);
}

export function تجميع_إحصائيات_المحرك(initiatives: Initiative[]) {
  const dossiers = initiatives.map(i => إنشاء_الملف_التنفيذي_للمبادرة(i));
  const avgHealth = dossiers.length
    ? Math.round(dossiers.reduce((s, d) => s + d.المؤشرات.درجة_صحة_المبادرة, 0) / dossiers.length)
    : 0;

  return {
    متوسط_درجة_الصحة: avgHealth,
    إجمالي_الملفات_المعالجة: dossiers.length
  };
}
