/**
 * Canonical Officials & Institutional Registry
 * SSoT for leadership, directors, and field engineers across Ibb Governorate.
 */

import { safeLocalStorage } from '../utils/safeStorage';

export interface OfficialProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  jobTitle: string;
  organization: string;
  governorate: string;
  district: string;
  scope?: string;
  role: string;
  permissionLevel: 'admin' | 'executive' | 'management' | 'supervisory' | 'field' | 'viewer';
  accountStatus: 'linked_active' | 'pending' | 'suspended';
  assignedDistricts?: string[];
  assignedInitiativeIds?: string[];
  notes?: string;
  [key: string]: any;
}

export interface OfficialImportHistoryLog {
  id: string;
  timestamp: string;
  sourceName?: string;
  fileName?: string;
  importedBy?: string;
  dataVersion?: string;
  importedCount?: number;
  addedCount?: number;
  updatedCount?: number;
  rejectedCount?: number;
  status: 'success' | 'warning' | 'failed';
  summary?: string;
  [key: string]: any;
}

export interface ImportValidationReport {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicatesCount: number;
  validProfiles: OfficialProfile[];
  newOfficials?: OfficialProfile[];
  updatedOfficials?: OfficialProfile[];
  rejectedRows?: any[];
  rejectionSummary?: any[];
  errors: Array<{ row: number; field: string; message: string }>;
  warnings: Array<{ row: number; field: string; message: string }>;
  [key: string]: any;
}

export const INITIAL_OFFICIALS: OfficialProfile[] = [
  {
    id: 'off_001',
    fullName: 'الدكتور محمد حسن المداني',
    phone: '777001001',
    email: 'm.almadani@ebb.gov.ye',
    jobTitle: 'رئيس وحدة التدخلات المركزية التنموية الطارئة',
    organization: 'وحدة التدخلات المركزية التنموية الطارئة',
    governorate: 'محافظة إب',
    district: 'كافة مديريات المحافظة',
    scope: 'الإشراف الاستراتيجي والاعتمادات المركزية',
    role: 'رئيس وحدة التدخلات المركزية',
    permissionLevel: 'executive',
    accountStatus: 'linked_active'
  },
  {
    id: 'off_002',
    fullName: 'المهندس شهاب أحمد الشامي',
    phone: '777001002',
    email: 'sh.alshami@ebb.gov.ye',
    jobTitle: 'المدير التنفيذي لوحدة التدخلات المركزية',
    organization: 'وحدة التدخلات المركزية التنموية الطارئة',
    governorate: 'محافظة إب',
    district: 'كافة مديريات المحافظة',
    scope: 'الإدارة التنفيذية ومتابعة خطط التوريد',
    role: 'المدير التنفيذي للوحدة',
    permissionLevel: 'executive',
    accountStatus: 'linked_active'
  },
  {
    id: 'off_003',
    fullName: 'المهندس عيسى ناجي القادري',
    phone: '772730696',
    email: 'eesaalqadri25@gmail.com',
    jobTitle: 'ممثل وحدة التدخلات المركزية بمحافظة إب',
    organization: 'وحدة التدخلات المركزية التنموية الطارئة',
    governorate: 'محافظة إب',
    district: 'كافة مديريات المحافظة',
    scope: 'الإشراف التنموي والتنسيق الميداني والفرز',
    role: 'ممثل وحدة التدخلات بمحافظة إب',
    permissionLevel: 'admin',
    accountStatus: 'linked_active'
  },
  {
    id: 'off_004',
    fullName: 'اللواء عبدالواحد محمد صلاح',
    phone: '777001004',
    email: 'a.salah@ebb.gov.ye',
    jobTitle: 'محافظ محافظة إب - رئيس المجلس المحلي',
    organization: 'السلطة المحلية بمحافظة إب',
    governorate: 'محافظة إب',
    district: 'كافة مديريات المحافظة',
    scope: 'القيادة العليا للمحافظة ورعاية المبادرات',
    role: 'محافظ محافظة إب',
    permissionLevel: 'executive',
    accountStatus: 'linked_active'
  },
  {
    id: 'off_005',
    fullName: 'المهندس صادق الرعوي',
    phone: '777001005',
    email: 's.alraawi@ebb.gov.ye',
    jobTitle: 'مدير إدارة الإشراف الفني والمطابقة',
    organization: 'وحدة التدخلات المركزية التنموية الطارئة',
    governorate: 'محافظة إب',
    district: 'كافة مديريات المحافظة',
    scope: 'الإشراف الهندسي والرقابة الميدانية',
    role: 'مدير إدارة الإشراف الفني',
    permissionLevel: 'management',
    accountStatus: 'linked_active'
  },
  {
    id: 'off_006',
    fullName: 'المهندس عبدالحميد الشامي',
    phone: '777001006',
    email: 'a.alshami@ebb.gov.ye',
    jobTitle: 'مدير إدارة الدراسات الهندسية والتصاميم',
    organization: 'وحدة التدخلات المركزية التنموية الطارئة',
    governorate: 'محافظة إب',
    district: 'كافة مديريات المحافظة',
    scope: 'اعتماد المخططات والدراسات الفنية',
    role: 'مدير إدارة الدراسات',
    permissionLevel: 'management',
    accountStatus: 'linked_active'
  },
  {
    id: 'off_007',
    fullName: 'الأستاذ أحمد المتوكل',
    phone: '777001007',
    email: 'a.almutawakkil@ebb.gov.ye',
    jobTitle: 'مسؤول إدارة المساهمات العينية والمواد',
    organization: 'وحدة التدخلات المركزية التنموية الطارئة',
    governorate: 'محافظة إب',
    district: 'كافة مديريات المحافظة',
    scope: 'تتبع سلاسل الإمداد للأسمنت والديزل',
    role: 'مسؤول المساهمات العينية',
    permissionLevel: 'management',
    accountStatus: 'linked_active'
  },
  {
    id: 'off_008',
    fullName: 'المهندس عيسى ناجي القادري (مدير النظام)',
    phone: '772730696',
    email: 'eesaalqadri25@gmail.com',
    jobTitle: 'مستشار إدارة المشاريع التنموية وهندسة النظم',
    organization: 'الإدارة العامة للمعلومات والتوثيق',
    governorate: 'محافظة إب',
    district: 'كافة مديريات المحافظة',
    scope: 'إدارة المنظومة الرقمية وتكامل قواعد البيانات',
    role: 'مدير النظام ومستشار النظم',
    permissionLevel: 'admin',
    accountStatus: 'linked_active'
  }
];

const STORAGE_KEY = 'cooperative_officials_registry';
const LOGS_KEY = 'cooperative_officials_import_logs';

export function getAllStoredOfficials(): OfficialProfile[] {
  try {
    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load stored officials:', e);
  }
  return INITIAL_OFFICIALS;
}

export function saveStoredOfficials(officials: OfficialProfile[]): void {
  try {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(officials));
  } catch (e) {
    console.warn('Failed to save officials:', e);
  }
}

export function getOfficialById(id: string): OfficialProfile | undefined {
  const list = getAllStoredOfficials();
  return list.find(o => o.id === id);
}

export function getAllImportLogs(): OfficialImportHistoryLog[] {
  try {
    const raw = safeLocalStorage.getItem(LOGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load import logs:', e);
  }
  return [];
}

export function saveImportLog(log: OfficialImportHistoryLog): void {
  const existing = getAllImportLogs();
  const updated = [log, ...existing].slice(0, 50);
  try {
    safeLocalStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save import log:', e);
  }
}

export class ResponsibleImportValidator {
  static validateImportData(
    rows: any[],
    existing: OfficialProfile[],
    mapping: Record<string, string>
  ): ImportValidationReport {
    const errors: Array<{ row: number; field: string; message: string }> = [];
    const warnings: Array<{ row: number; field: string; message: string }> = [];
    const validProfiles: OfficialProfile[] = [];

    const existingPhones = new Set(existing.map(o => o.phone.replace(/[^0-9]/g, '')));

    rows.forEach((row, idx) => {
      const rowNum = idx + 1;
      const fullName = String(row[mapping.fullName || 'fullName'] || row['الاسم'] || row['الاسم الكامل'] || '').trim();
      const phone = String(row[mapping.phone || 'phone'] || row['الهاتف'] || row['رقم الهاتف'] || '').replace(/[^0-9]/g, '');
      const jobTitle = String(row[mapping.jobTitle || 'jobTitle'] || row['المنصب'] || row['الصفة'] || 'مسؤول ميداني').trim();
      const district = String(row[mapping.district || 'district'] || row['المديرية'] || 'محافظة إب').trim();

      if (!fullName) {
        errors.push({ row: rowNum, field: 'fullName', message: 'اسم المسؤول مطلوب' });
        return;
      }

      if (!phone || phone.length < 8) {
        warnings.push({ row: rowNum, field: 'phone', message: 'رقم الهاتف قصير أو غير دقيق' });
      }

      const isDuplicate = existingPhones.has(phone);
      if (isDuplicate) {
        warnings.push({ row: rowNum, field: 'phone', message: 'رقم الهاتف موجود مسبقاً في السجل' });
      }

      validProfiles.push({
        id: `off_imp_${Date.now()}_${idx}`,
        fullName,
        phone: phone || '000000000',
        jobTitle,
        organization: 'السلطة المحلية / وحدة التدخلات',
        governorate: 'محافظة إب',
        district,
        role: jobTitle,
        permissionLevel: 'field',
        accountStatus: 'linked_active'
      });
    });

    return {
      isValid: errors.length === 0,
      totalRows: rows.length,
      validRows: validProfiles.length,
      invalidRows: rows.length - validProfiles.length,
      duplicatesCount: warnings.filter(w => w.message.includes('موجود مسبقاً')).length,
      validProfiles,
      errors,
      warnings
    };
  }
}
