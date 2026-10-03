/**
 * Normalize Arabic initiative names for reliable cross-sheet matching by Project Name.
 */
export function normalizeInitiativeName(name: string): string {
  if (!name) return '';
  let str = String(name).trim().toLowerCase();

  // Strip common non-essential prefixes
  str = str.replace(/^(مشروع|مبادرة|مبادره)\s+/g, '');
  str = str.replace(/^(مسح\s+وتوسعة\s+ورصف|مسح\s+وتوسعه\s+ورصف|مسح\s+ورصف|شق\s+وتوسعة\s+ورصف|شق\s+ورصف|توسعة\s+ورصف|رصف)\s+/g, '');
  str = str.replace(/^(طريق|طرق)\s+/g, '');

  // Arabic letter normalization
  str = str.replace(/[أإآٱ]/g, 'ا');
  str = str.replace(/ى/g, 'ي');
  str = str.replace(/ة/g, 'ه');
  str = str.replace(/[ؤئ]/g, 'ء');

  // Strip diacritics / tashkeel
  str = str.replace(/[\u064B-\u0652]/g, '');

  // Strip punctuation & redundant spaces
  str = str.replace(/[^\u0600-\u06FF0-9a-zA-Z\s]/g, ' ');
  str = str.replace(/\s+/g, ' ').trim();

  return str;
}

/**
 * Checks if two initiative names match with high confidence.
 */
export function areInitiativeNamesMatching(nameA: string, nameB: string): boolean {
  if (!nameA || !nameB) return false;
  const rawA = String(nameA).trim().toLowerCase();
  const rawB = String(nameB).trim().toLowerCase();
  if (rawA === rawB) return true;

  const normA = normalizeInitiativeName(nameA);
  const normB = normalizeInitiativeName(nameB);

  if (!normA || !normB) return false;
  
  // Exact normalized match ONLY to prevent collapsing distinct sub-initiatives or sections
  return normA === normB;
}
