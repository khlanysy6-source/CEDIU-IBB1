/**
 * Official initiative sector classification for the Second Executive Pathway.
 *
 * Source of truth: the user's approved classification of the "مصفوفة الفرز".
 * The ranges are intentionally centralized so the platform can classify
 * current and future imported initiatives without changing source names/codes.
 */

export type InitiativeSector = 'قطاع الطرق' | 'القطاع الخدمي – مجال التعليم' | 'قطاع المياه – المياه والصرف الصحي' | string;

export const INITIATIVE_SECTOR_RANGES = [
  { from: 1, to: 726, sector: 'قطاع الطرق' },
  { from: 727, to: 751, sector: 'القطاع الخدمي – مجال التعليم' },
  { from: 752, to: 786, sector: 'قطاع المياه – المياه والصرف الصحي' },
] as const;

const DUPLICATE_NAMES = new Set([
  'جسر فاطمة الزهراء للمشاة',
  'استكمال رصف طريق السر',
]);

function normalize(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/\s+/g, ' ');
}

export function getInitiativeNumber(value: unknown): number | null {
  const match = String(value ?? '').match(/\d+/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
}

export function resolveInitiativeSector(
  initiativeNumber: unknown,
  existingSector?: unknown,
): string {
  const n = getInitiativeNumber(initiativeNumber);
  if (n !== null) {
    const range = INITIATIVE_SECTOR_RANGES.find(r => n >= r.from && n <= r.to);
    if (range) return range.sector;
  }
  return String(existingSector ?? '').trim();
}

export function isExcludedDuplicateInitiative(name: unknown): boolean {
  return DUPLICATE_NAMES.has(normalize(name));
}
