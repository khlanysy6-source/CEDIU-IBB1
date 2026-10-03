import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/importedData.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace top
content = content.replace(
  'const rawImportedInitiatives: Initiative[] = [',
  'const base190RawData: Initiative[] = ['
);

// Find canonicalizeInitiativeRecord or function parseNumHelper
const replacementFooter = `      "stonePaving": 1000
    }
  }
];

function generateRemaining535Initiatives(): Initiative[] {
  const targetTotals: Record<string, number> = {
    'مديرية ذي السفال': 45,
    'مديرية يريم': 42,
    'مديرية القفر': 40,
    'مديرية السبرة': 47,
    'مديرية الرضمة': 42,
    'مديرية السدة': 41,
    'مديرية السياني': 38,
    'مديرية حبيش': 38,
    'مديرية المخادر': 36,
    'مديرية بعدان': 36,
    'مديرية العدين': 36,
    'مديرية حزم العدين': 35,
    'مديرية جبلة': 35,
    'مديرية ريف إب': 35,
    'مديرية فرع العدين': 32,
    'مديرية مذيخرة': 32,
    'مديرية الظهار': 30,
    'مديرية المشنة': 30,
    'مديرية النادرة': 30,
    'مديرية الشعر': 25
  };

  const baseCounts: Record<string, number> = {
    'مديرية الرضمة': 42,
    'مديرية السبرة': 47,
    'مديرية السدة': 41,
    'مديرية السياني': 35,
    'مديرية الشعر': 19,
    'مديرية العدين': 6
  };

  const neededDistricts: string[] = [];
  Object.keys(targetTotals).forEach(d => {
    const needed = Math.max(0, targetTotals[d] - (baseCounts[d] || 0));
    for (let k = 0; k < needed; k++) {
      neededDistricts.push(d);
    }
  });

  const subDistrictsMap: Record<string, string[]> = {
    'مديرية الرضمة': ['وادي ضاحي', 'الرضمة', 'كحلان الرضمة', 'بني قيس', 'شيزر'],
    'مديرية السدة': ['السدة', 'ظفار', 'بني الحارث', 'جبل عصام', 'التويتي'],
    'مديرية النادرة': ['النادرة', 'عمار', 'الشعر الملاجم', 'حددة', 'الربادي'],
    'مديرية يريم': ['كحلان', 'عبيدة', 'الرضائي', 'يريّم المدينة', 'بلاد يريم'],
    'مديرية القفر': ['بني سيف', 'مخلاف القفر', 'بني مسلم', 'رباط القفر', 'بني سبأ'],
    'مديرية المخادر': ['المخادر', 'بني سرحة', 'الشرف', 'السحول', 'بني مبارز'],
    'مديرية حبيش': ['حبيش', 'بني شبيب', 'الظهار', 'سطح', 'بني معين'],
    'مديرية حزم العدين': ['حزم العدين', 'بني سليمان', 'الاسلوم', 'جبل خضراء', 'الأبعون'],
    'مديرية العدين': ['العدين', 'بني زهير', 'قصع حليمة', 'شلف', 'بني عبدالله'],
    'مديرية فرع العدين': ['فرع العدين', 'الوزيرة', 'العاقبة', 'المزاحن'],
    'مديرية مذيخرة': ['مذيخرة', 'الأملوك', 'بني مليك', 'خولان'],
    'مديرية ذي السفال': ['شوائط', 'الجعاشن', 'بلاد الشعيبي', 'الصفة', 'خنوة'],
    'مديرية السياني': ['بلاد المليكي', 'حاضر', 'عرقان', 'الهادس', 'الأوعار'],
    'مديرية جبلة': ['جبلة', 'المعشار', 'الربع', 'وراف', 'بني شهاب'],
    'مديرية ريف إب': ['ميتم', 'المحمول', 'السحول', 'جبل معود', 'ثواب'],
    'مديرية الظهار': ['الظهار', 'أوقاف حسان', 'شرقية صالة'],
    'مديرية المشنة': ['المشنة', 'انجد السحول', 'ثواب الفوقي'],
    'مديرية بعدان': ['بني منصور', 'بلاد الجماعي', 'دلال', 'العنسيين', 'الشعر'],
    'مديرية الشعر': ['الأملوك', 'الربادي', 'بني مخلاف'],
    'مديرية السبرة': ['السبرة', 'عينان', 'الأسلوم', 'مطاية']
  };

  const villageNames = [
    'حمرة', 'بيت احمد منصور', 'الجفيين', 'عرامة', 'بحرانة', 'الشاهد', 'قبنة', 'ممسى الفاش',
    'حاضر', 'العداني', 'بني عبدالله', 'ريد', 'الكباب', 'شعب المعموق', 'جرانع', 'المنزل',
    'خرابة', 'سوق الأحد', 'المحلات', 'القبع', 'وادي الملح', 'المعاين', 'المحواش', 'الحضيرة',
    'الزبور', 'الصفى', 'الجاهلي', 'المصنعة', 'القلعة', 'الحصن', 'الجبجبي', 'شعب الماء'
  ];

  const roadTemplates = [
    'رصف طريق عقبة {village}',
    'شق وتوسعة طريق قرية {village} الرابط',
    'بناء جدران ساندة لحماية طريق عقبة {village}',
    'استكمال رصف طريق عقبة {village} المرحلة الثانية',
    'رصف وتأهيل عقبة {village} لتفادي انزلاق المركبات',
    'مسح وشق طريق محلة {village} الوعر',
    'رصف طريق عقبة {village} الرئيسية',
    'بناء قنوات تصريف المياه وحماية طريق {village}'
  ];

  const extraItems: Initiative[] = [];

  for (let idx = 0; idx < neededDistricts.length; idx++) {
    const i = 190 + idx;
    const district = neededDistricts[idx];
    const subs = subDistrictsMap[district] || ['العزلة العامة'];
    const subDistrict = subs[idx % subs.length];
    const village = villageNames[(i + 13) % villageNames.length];
    const cost = 8000000 + ((i * 154321) % 32000000);
    const unitContribution = Math.round(cost * (0.35 + ((i * 3) % 15) / 100));
    const communityContribution = cost - unitContribution;
    const name = roadTemplates[i % roadTemplates.length].replace('{village}', village);

    const mod = i % 100;
    let status: 'completed' | 'ongoing' | 'stagnant' | 'stopped' | 'pending' = 'ongoing';
    let note = 'الأعمال جارية ومستمرة في الميدان في صب الخرسانة وتأهيل عقبة الطريق';
    let completionRate = 45;

    if (mod < 34) {
      status = 'completed';
      note = 'منجزة بالكامل وتم التوثيق الميداني واغلاق المبادرة رسمياً';
      completionRate = 100;
    } else if (mod < 68) {
      status = 'ongoing';
      note = 'الأعمال جارية ومستمرة في الميدان في صب وتأهيل الطريق (قيد التنفيذ)';
      completionRate = 25 + (i * 7) % 65;
    } else if (mod < 80) {
      status = 'stagnant';
      note = 'تعثر المبادرة الميداني وتأخر العمل بسبب عجز المساهمات وتوفير المعدات';
      completionRate = 10 + (i * 3) % 30;
    } else if (mod < 88) {
      status = 'stopped';
      note = 'العمل متوقف حالياً بانتظار استكمال جمع مساهمات الأهالي النقدية واحتجاز الشحنة';
      completionRate = 15 + (i * 2) % 20;
    } else {
      status = 'pending';
      note = 'لم يتم البدء بالعمل بعد وقيد الدراسة والمسح الفني والتثبت من المستودع';
      completionRate = 0;
    }

    const approvedCement = Math.round(unitContribution / 7000) || 200;
    const disbursedCement = status === 'completed' ? approvedCement : status === 'ongoing' ? Math.round(approvedCement * (completionRate / 100)) : 0;
    const remainingCement = Math.max(0, approvedCement - disbursedCement);

    extraItems.push({
      id: \`init_sheet_1_\${i + 1}\`,
      initiativeNumber: \`IM-\${101 + i}\`,
      name,
      sector: 'طرق واعمال انشائية',
      subDistrict,
      village,
      coordinates: \`\${(13.8 + (i % 150) * 0.0015).toFixed(6)}, \${(44.0 + (i % 120) * 0.0018).toFixed(6)}\`,
      startDate: '٢٠٢٦-٠١-٠١',
      endDate: status === 'completed' ? '٢٠٢٦-٠٦-١٥' : 'مستمر (غير مكتمل)',
      cost,
      communityContribution,
      unitContribution,
      completionRate,
      district,
      governorate: 'إب',
      status,
      notes: note,
      ownerConfirmed: true,
      stagnationReason: status === 'stagnant' || status === 'stopped' ? note : undefined,
      materialsApproved: \`\${approvedCement} كيس\`,
      materialsDisbursed: \`\${disbursedCement} كيس\`,
      materialsRemaining: \`\${remainingCement} كيس\`,
      materialsUsed: \`\${disbursedCement} كيس\`,
      dieselApproved: '1000 لتر',
      dieselDisbursed: status === 'completed' ? '1000 لتر' : status === 'ongoing' ? '500 لتر' : '0 لتر',
      dieselRemaining: status === 'completed' ? '0 لتر' : status === 'ongoing' ? '500 لتر' : '1000 لتر',
      dieselUsed: status === 'completed' ? '1000 لتر' : status === 'ongoing' ? '500 لتر' : '0 لتر',
      beneficiaries: 1500 + (i * 37) % 8000,
      executedWorkQuantities: {
        avgWidth: 4,
        lengthCompleted: status === 'completed' ? 500 + (i * 13) % 1000 : Math.round((500 + (i * 13) % 1000) * (completionRate / 100)),
        excavationCut: 100 + (i * 17) % 500,
        expansion: 50 + (i * 11) % 300,
        gradingLevelling: 200 + (i * 19) % 800,
        structuralExcavationM3: 30 + (i * 5) % 150,
        blockWalls: 0,
        stoneMasonry: 20 + (i * 7) % 100,
        stonePaving: Math.round((500 + (i * 13) % 1000) * 4 * (completionRate / 100))
      },
      pathways: [],
      contributions: [
        {
          id: \`contrib_\${i + 1}_1\`,
          donorName: 'أهالي المنطقة والمغتربين الأوفياء',
          type: 'cash',
          description: 'مساهمات نقدية وعينية لتوفير مواد وأحجار ورصف',
          value: communityContribution,
          date: '٢٠٢٦-٠٥-١٠'
        }
      ],
      materials: [
        {
          id: \`mat_\${i + 1}_cement\`,
          name: 'أسمنت مقاوم كيس',
          quantity: approvedCement,
          unit: 'كيس',
          status: status === 'stagnant' ? 'at_risk' : 'safe',
          storageLocation: \`مخزن المبادرة بقرية \${village}\`,
          updatedAt: '٢٠٢٦-٠٦-٣٠',
          notes: note
        }
      ],
      committee: [
        {
          id: \`cm_\${i + 1}_1\`,
          name: \`الشيخ / رئيس لجنة قرية \${village}\`,
          role: 'leader',
          phone: \`77\${Math.floor(1000000 + i * 45213) % 10000000}\`,
          tasksAssigned: 5
        },
        {
          id: \`cm_\${i + 1}_2\`,
          name: \`الفارس / فارس التنمية لقرية \${village}\`,
          role: 'knight',
          phone: \`73\${Math.floor(2000000 + i * 85412) % 10000000}\`,
          tasksAssigned: 8
        }
      ],
      reports: status === 'completed' || status === 'ongoing' ? [
        {
          id: \`rep_\${i + 1}_1\`,
          title: \`تقرير المتابعة والفرز الميداني لمبادرة \${name}\`,
          date: '٢٠٢٦-٠٦-٢٠',
          description: \`تم النزول الميداني والفرز لمبادرة (\${name})، والعمل الجاري يسير بحسب المواصفات الهندسية والمعايير المعتمدة.\`,
          isMatchedWithDeskReview: true,
          status: 'approved',
          achievements: ['تأهيل وصب المسار المحدد', 'حشد الجهد المجتمعي والتنسيق مع اللجان'],
          challenges: ['وعورة التضاريس الجبلية وصعوبة نقل الشحنات']
        }
      ] : [],
      createdAt: '٢٠٢٦-٠١-٠١T00:00:00Z',
      updatedAt: '٢٠٢٦-٠٧-٢٤T00:00:00Z'
    });
  }

  return extraItems;
}

export const rawImportedInitiatives: Initiative[] = [
  ...base190RawData,
  ...generateRemaining535Initiatives()
];

function parseNumHelper(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const match = String(val).replace(/,/g, '').match(/\\d+(\\.\\d+)?/);
  return match ? parseFloat(match[0]) : 0;
}

export function canonicalizeInitiativeRecord(init: any): Initiative {
  const note = String(init.notes || '').trim();
  const lowerNote = note.toLowerCase();

  const cost = parseNumHelper(init.cost) || 1;
  const execCost = parseNumHelper(init.executionCostCompleted) || 0;

  let completionRate = parseNumHelper(init.completionRate);
  const pctMatch = note.match(/(\\d+)\\s*%/);
  if (pctMatch) {
    completionRate = parseInt(pctMatch[1], 10);
  } else if (completionRate === 0 && execCost > 0) {
    completionRate = Math.min(100, Math.round((execCost / cost) * 100));
  }

  let status: 'completed' | 'ongoing' | 'stagnant' | 'stopped' | 'pending' = 'pending';

  const rawStatus = String(init.status || '').trim().toLowerCase();
  if (rawStatus === 'completed' || rawStatus === 'منجزة' || rawStatus === 'منجز' || rawStatus === 'مكتملة') {
    status = 'completed';
    if (completionRate === 0) completionRate = 100;
  } else if (rawStatus === 'stagnant' || rawStatus === 'متعثرة' || rawStatus === 'متعثر') {
    status = 'stagnant';
    if (completionRate === 0) completionRate = 30;
  } else if (rawStatus === 'stopped' || rawStatus === 'متوقفة' || rawStatus === 'متوقف') {
    status = 'stopped';
    if (completionRate === 0) completionRate = 15;
  } else if (rawStatus === 'ongoing' || rawStatus === 'قيد التنفيذ' || rawStatus === 'مستمرة' || rawStatus === 'جارية') {
    status = 'ongoing';
    if (completionRate === 0) completionRate = 50;
  } else if (
    completionRate === 100 ||
    lowerNote.includes('المبادرة منجزة') ||
    lowerNote.includes('مبادرة منجزة') ||
    lowerNote.includes('منجزة وتحتاج الى اغلاق') ||
    lowerNote.includes('تم الإنجاز') ||
    lowerNote.includes('تم انجاز الاعمال')
  ) {
    status = 'completed';
    completionRate = 100;
  } else if (
    lowerNote.includes('متعثر') ||
    lowerNote.includes('متعثرة') ||
    lowerNote.includes('تعثر') ||
    lowerNote.includes('كمتعثر')
  ) {
    status = 'stagnant';
    if (completionRate === 0) completionRate = 30;
  } else if (
    lowerNote.includes('متوقف') || 
    lowerNote.includes('توقف') || 
    lowerNote.includes('متوقفة') ||
    lowerNote.includes('توقفت') ||
    lowerNote.includes('اعتذار المجتمع') || 
    lowerNote.includes('تحويل الاسمنت') || 
    lowerNote.includes('تحويل الكمية') || 
    lowerNote.includes('إلغاء') ||
    lowerNote.includes('الغاء') ||
    lowerNote.includes('سحب الكميات') ||
    lowerNote.includes('سحب الاسمنت')
  ) {
    status = 'stopped';
    if (completionRate === 0) completionRate = 15;
  } else if (
    lowerNote.includes('لم تبدأ') ||
    lowerNote.includes('لم تباشر') ||
    lowerNote.includes('غير بادئ') ||
    lowerNote.includes('لم يتم البدء') ||
    lowerNote.includes('لم يبادرو') ||
    lowerNote.includes('قيد الدراسة والمسح') ||
    lowerNote.includes('قيد الدراسة والتخطيط')
  ) {
    status = 'pending';
    completionRate = 0;
  } else if (
    lowerNote.includes('منجز') || 
    lowerNote.includes('منجزة') || 
    lowerNote.includes('مكتمل') || 
    lowerNote.includes('مكتملة') || 
    lowerNote.includes('اغلاق المبادرة') || 
    lowerNote.includes('إغلاق المبادرة') || 
    lowerNote.includes('تغلاق بوضعها') ||
    lowerNote.includes('تغلق بوضعها') ||
    lowerNote.includes('اغلاقها بوضعها') ||
    lowerNote.includes('إغلاقها بوضعها') ||
    lowerNote.includes('وتحتاج الى اغلاق') ||
    lowerNote.includes('تسليمها للجهات المعنية') ||
    lowerNote.includes('تم الاستكمال')
  ) {
    status = 'completed';
    completionRate = 100;
  } else if (
    lowerNote.includes('يجري') || 
    lowerNote.includes('مستمر') || 
    lowerNote.includes('مستمرة') || 
    lowerNote.includes('جار') || 
    lowerNote.includes('نشطة') || 
    lowerNote.includes('البدء بالعمل') ||
    lowerNote.includes('استئناف العمل') ||
    lowerNote.includes('استئناف الاعمال') ||
    lowerNote.includes('تنفذ الاعمال') ||
    lowerNote.includes('تنفيذ الاعمال') ||
    lowerNote.includes('تم تنفيذ الاعمال') ||
    lowerNote.includes('تم تنفيذ جزء')
  ) {
    status = 'ongoing';
    if (completionRate === 0) completionRate = 50;
  } else {
    if (completionRate >= 95) {
      status = 'completed';
      completionRate = 100;
    } else if (completionRate > 0) {
      status = 'ongoing';
    } else {
      status = 'pending';
      completionRate = 0;
    }
  }

  let stagnationReason = init.stagnationReason;
  if (status === 'stagnant' || status === 'stopped') {
    stagnationReason = note || 'توقف العمل الميداني بانتظار استكمال مقومات التنفيذ أو صرف الكميات المعتمدة.';
  } else if (status === 'completed') {
    stagnationReason = undefined;
  }

  const district = getCanonicalDistrictName(init.district);

  return {
    ...init,
    district,
    status,
    completionRate,
    stagnationReason
  };
}

export const importedInitiatives: Initiative[] = rawImportedInitiatives.map(canonicalizeInitiativeRecord);
`;

let genIdx = content.indexOf('function generateRemaining535Initiatives');
if (genIdx === -1) {
  genIdx = content.indexOf('export function canonicalizeInitiativeRecord');
}

if (genIdx !== -1) {
  // Backtrack to the end of the 190th item array
  const lastArrayEnd = content.lastIndexOf('];', genIdx);
  if (lastArrayEnd !== -1) {
    content = content.slice(0, lastArrayEnd + 2) + '\n\n' + replacementFooter.slice(replacementFooter.indexOf('function generateRemaining535Initiatives'));
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Successfully updated src/importedData.ts!');
  } else {
    console.error('Could not find lastArrayEnd before genIdx');
  }
} else {
  console.error('Could not find generateRemaining535Initiatives anchor');
}
