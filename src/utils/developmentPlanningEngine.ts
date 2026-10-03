/**
 * Development Planning Engine (محرك التخطيط التنموي)
 * Analyzes needs, priorities, and geographical sector distributions.
 */

export interface تقييم_احتياج_تخطيطي {
  معرف_الاحتياج: string;
  اسم_الاحتياج: string;
  المديرية: string;
  العزلة: string;
  القطاع: string;
  المشكلة: string;
  المستفيدون: number;
  شدة_الحاجة: 'حاجة ملحة جداً' | 'حاجة مرتفعة' | 'حاجة متوسطة';
  نسبة_المساهمة_المجتمعية_المتوقعة: number;
  توفر_حرم_الطريق_أو_الأرض: boolean;
  [key: string]: any;
}

export type بطاقة_التخطيط_التنموي = تقييم_احتياج_تخطيطي;

export const تقييم_احتياج_تخطيطي = (item: any) => item;

export interface ملخص_التخطيط_التنموي {
  إجمالي_الاحتياجات_المحللة?: number;
  الفرص_المشجعة_للتدخل_السريع?: any[];
  الفجوات_التنموية_المرصودة?: any[];
  مشاريع_تحتاج_دراسة_إضافية?: any[];
  توجيه_التخطيط_المستقبلي?: string[];
  التوزيع_الجغرافي_للأولويات: Array<{
    المديرية: string;
    عدد_الاحتياجات: number;
    أولوية_القطاع: string;
  }>;
  القطاعات_الأكثر_احتياجاً: Array<{
    القطاع: string;
    عدد_الاحتياجات: number;
    نسبة_الحاجة: number;
  }>;
  الأولويات_القصوى_المقترحة: Array<{
    اسم_الاحتياج_أو_المبادرة_المقترحة: string;
    المديرية: string;
    العزلة_أو_القرية: string;
    القطاع: string;
    عدد_المستفيدين: number;
    درجة_الأولوية_التخطيطية: number;
    الأولوية_التخطيطية_المقترحة: string;
    أسباب_الأولوية_التخطيطية: string[];
    التوصية_التخطيطية: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export function تحليل_منظومة_التخطيط_التنموي(
  needs: تقييم_احتياج_تخطيطي[] = [],
  dossiers: any[] = [],
  ..._rest: any[]
): ملخص_التخطيط_التنموي {
  const districtMap = new Map<string, { count: number; sectors: Map<string, number> }>();
  const sectorMap = new Map<string, number>();

  needs.forEach(n => {
    // District
    const d = n.المديرية || 'عام';
    if (!districtMap.has(d)) {
      districtMap.set(d, { count: 0, sectors: new Map() });
    }
    const dEntry = districtMap.get(d)!;
    dEntry.count++;
    dEntry.sectors.set(n.القطاع, (dEntry.sectors.get(n.القطاع) || 0) + 1);

    // Sector
    sectorMap.set(n.القطاع, (sectorMap.get(n.القطاع) || 0) + 1);
  });

  const geoPriorities = Array.from(districtMap.entries()).map(([dist, data]) => {
    let topSec = 'الطرق والرصف';
    let max = 0;
    for (const [sec, c] of data.sectors.entries()) {
      if (c > max) {
        max = c;
        topSec = sec;
      }
    }
    return {
      المديرية: dist,
      عدد_الاحتياجات: data.count,
      أولوية_القطاع: topSec
    };
  });

  const totalNeeds = needs.length || 1;
  const sectorList = Array.from(sectorMap.entries())
    .map(([sec, count]) => ({
      القطاع: sec,
      عدد_الاحتياجات: count,
      نسبة_الحاجة: Math.round((count / totalNeeds) * 100)
    }))
    .sort((a, b) => b.عدد_الاحتياجات - a.عدد_الاحتياجات);

  const topPriorities = needs.map((n, i) => {
    const isCritical = n.شدة_الحاجة === 'حاجة ملحة جداً';
    const score = isCritical ? 92 : 80;
    return {
      اسم_الاحتياج_أو_المبادرة_المقترحة: n.اسم_الاحتياج,
      المديرية: n.المديرية,
      العزلة_أو_القرية: n.العزلة,
      القطاع: n.القطاع,
      عدد_المستفيدين: n.المستفيدون,
      درجة_الأولوية_التخطيطية: score,
      الأولوية_التخطيطية_المقترحة: isCritical ? 'أولوية قصوى عاجلة' : 'أولوية مرتفعة',
      أسباب_الأولوية_التخطيطية: [
        n.المشكلة,
        `نسبة مساهمة مجتمعية متوقعة ${n.نسبة_المساهمة_المجتمعية_المتوقعة}%`,
        n.توفر_حرم_الطريق_أو_الأرض ? 'عقود التنازل وحرم الطريق متوفرة' : 'يحتاج توثيق حرم الطريق'
      ],
      التوصية_التخطيطية: 'إدراج المشروع ضمن خطة المسار الثاني واستكمال التحقق الميداني والجاهزية.'
    };
  });

  return {
    التوزيع_الجغرافي_للأولويات: geoPriorities,
    القطاعات_الأكثر_احتياجاً: sectorList,
    الأولويات_القصوى_المقترحة: topPriorities
  };
}
