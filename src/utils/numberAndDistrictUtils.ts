/**
 * Utility functions for parsing numbers from strings and matching district names strictly.
 */

export function parseNum(val: any): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  let str = String(val).replace(/,/g, '').trim();
  if (!str) return 0;
  // Convert Eastern Arabic & Persian digits
  str = str
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
  const match = str.match(/[-+]?\d*\.?\d+/);
  if (match) {
    const num = parseFloat(match[0]);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

export const CANONICAL_DISTRICTS = [
  'مديرية ذي السفال',
  'مديرية السياني',
  'مديرية جبلة',
  'مديرية بعدان',
  'مديرية السدة',
  'مديرية يريم',
  'مديرية المخادر',
  'مديرية حبيش',
  'مديرية حزم العدين',
  'مديرية الرضمة',
  'مديرية القفر',
  'مديرية العدين',
  'مديرية ريف إب',
  'مديرية الظهار',
  'مديرية المشنة',
  'مديرية السبرة',
  'مديرية الشعر',
  'مديرية النادرة',
  'مديرية فرع العدين',
  'مديرية مذيخرة'
];

/**
 * Strict district matching to prevent "العدين" from incorrectly matching "حزم العدين" or "فرع العدين".
 */
export function matchDistrictStrict(initDistrict: string | undefined, targetDistrict: string): boolean {
  if (!initDistrict || !targetDistrict) return false;
  if (targetDistrict === 'all' || targetDistrict === 'جميع مديريات المحافظة') return true;

  const cleanInit = initDistrict.replace(/^مديرية\s+/, '').trim();
  const cleanTarget = targetDistrict.replace(/^مديرية\s+/, '').trim();

  if (cleanInit === cleanTarget) return true;

  // Strict disambiguations
  if (cleanTarget === 'العدين' && (cleanInit === 'حزم العدين' || cleanInit === 'فرع العدين')) return false;
  if (cleanTarget === 'حزم العدين' && cleanInit !== 'حزم العدين') return false;
  if (cleanTarget === 'فرع العدين' && cleanInit !== 'فرع العدين') return false;
  if (cleanTarget === 'إب' && cleanInit === 'ريف إب') return false;

  return cleanInit.includes(cleanTarget) || cleanTarget.includes(cleanInit);
}

/**
 * Find the canonical district name for an initiative's district string.
 */
export function getCanonicalDistrictName(districtStr?: string): string {
  if (!districtStr) return 'مديرية ذي السفال';
  const clean = districtStr
    .replace(/^مديرية\s+/, '')
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, '')
    .trim();

  if (clean === 'العدين') return 'مديرية العدين';
  if (clean === 'حزم العدين') return 'مديرية حزم العدين';
  if (clean === 'فرع العدين') return 'مديرية فرع العدين';
  if (clean.includes('سيان') || clean.includes('ساني')) return 'مديرية السياني';
  if (clean.includes('رضمة')) return 'مديرية الرضمة';
  if (clean.includes('سبرة')) return 'مديرية السبرة';
  if (clean.includes('سدة')) return 'مديرية السدة';
  if (clean.includes('شعر')) return 'مديرية الشعر';
  if (clean.includes('نادرة')) return 'مديرية النادرة';
  if (clean.includes('يريم')) return 'مديرية يريم';
  if (clean.includes('قفر')) return 'مديرية القفر';
  if (clean.includes('مخادر')) return 'مديرية المخادر';
  if (clean.includes('حبيش')) return 'مديرية حبيش';
  if (clean.includes('مذيخرة')) return 'مديرية مذيخرة';
  if (clean.includes('سفال')) return 'مديرية ذي السفال';
  if (clean.includes('جبلة')) return 'مديرية جبلة';
  if (clean.includes('ريف')) return 'مديرية ريف إب';
  if (clean.includes('ظهار')) return 'مديرية الظهار';
  if (clean.includes('مشنة')) return 'مديرية المشنة';
  if (clean.includes('بعدان')) return 'مديرية بعدان';

  const exactMatch = CANONICAL_DISTRICTS.find(d => {
    const cleanD = d.replace(/^مديرية\s+/, '').trim();
    return d === districtStr || cleanD === clean;
  });

  if (exactMatch) return exactMatch;

  const partialMatch = CANONICAL_DISTRICTS.find(d => {
    const cleanD = d.replace(/^مديرية\s+/, '').trim();
    return clean.includes(cleanD) || cleanD.includes(clean);
  });

  return partialMatch || (districtStr.startsWith('مديرية') ? districtStr : `مديرية ${districtStr}`);
}
