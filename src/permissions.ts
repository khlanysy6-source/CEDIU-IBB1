import { UserRole, ROLE_PERMISSIONS, ROLE_LABELS, RolePermissions } from './types';

export type TabId = 
  | 'home'
  | 'initiatives'
  | 'district_portal'
  | 'workshop'
  | 'advisor'
  | 'decision_center'
  | 'interactive_charts'
  | 'interactive_map'
  | 'matching_results'
  | 'matrix'
  | 'tracking_sheet'
  | 'field_staging'
  | 'sheets_import'
  | 'officials_management'
  | 'activation_plan'
  | 'periodic_reports'
  | 'engineers_portal'
  | 'about'
  | 'forms_portal'
  | 'login';

export const TAB_LABELS: Record<TabId, string> = {
  home: 'الصفحة الرئيسية والأخبار 🏠',
  initiatives: 'سجل المبادرات والمسارات 🚧',
  district_portal: 'بوابات المديريات والخرائط 🗺️',
  workshop: 'الورشة التدريبية 💻',
  advisor: 'المستشار التنموي والهندسي 🤖',
  decision_center: 'مركز تحليل النتائج والقرار التنموي 🧠',
  interactive_charts: 'لوحة المخططات والرسوم البيانية 📈',
  interactive_map: 'الخريطة الميدانية التفاعلية GPS 📍',
  matching_results: 'نتائج الفرز والمطابقة 🔎',
  matrix: 'مصفوفة الكميات ومقارنة الأسمنت 📊',
  tracking_sheet: 'شيت المتابعة ودليل الفرسان 📊',
  field_staging: 'الرفع المباشر ومراجعة المشرف 📤',
  sheets_import: 'استيراد وتحديث Google Sheets 📊',
  officials_management: 'إدارة المسؤولين والصلاحيات 👥',
  activation_plan: 'مرجع خطة التفعيل 📘',
  periodic_reports: 'التقارير الأسبوعية والشهرية 📋',
  engineers_portal: 'بوابة التقييم الميداني الذكية 👷‍♂️',
  about: 'عن المنصة والمطور 📋',
  forms_portal: 'بوابة النماذج والمعاملات 📑',
  login: 'صفحة الدخول المؤسسي 🔑',
};

// Map each role to permitted tabs
export const ROLE_TAB_ACCESS: Record<UserRole, TabId[]> = {
  central_unit: [
    'home',
    'forms_portal',
    'initiatives',
    'district_portal',
    'workshop',
    'advisor',
    'decision_center',
    'interactive_charts',
    'interactive_map',
    'matching_results',
    'matrix',
    'tracking_sheet',
    'field_staging',
    'sheets_import',
    'officials_management',
    'activation_plan',
    'periodic_reports',
    'engineers_portal',
    'about',
  ],
  admin: [
    'home',
    'forms_portal',
    'initiatives',
    'district_portal',
    'workshop',
    'advisor',
    'decision_center',
    'interactive_charts',
    'interactive_map',
    'matching_results',
    'matrix',
    'tracking_sheet',
    'field_staging',
    'sheets_import',
    'officials_management',
    'activation_plan',
    'periodic_reports',
    'engineers_portal',
    'about',
  ],
  governorate: [
    'home',
    'forms_portal',
    'initiatives',
    'district_portal',
    'workshop',
    'decision_center',
    'interactive_charts',
    'interactive_map',
    'matching_results',
    'matrix',
    'tracking_sheet',
    'field_staging',
    'officials_management',
    'periodic_reports',
    'about',
  ],
  district_director: [
    'home',
    'forms_portal',
    'initiatives',
    'district_portal',
    'decision_center',
    'interactive_charts',
    'interactive_map',
    'field_staging',
    'officials_management',
    'activation_plan',
    'periodic_reports',
    'about',
  ],
  cooperative_association: [
    'home',
    'forms_portal',
    'initiatives',
    'district_portal',
    'decision_center',
    'interactive_charts',
    'interactive_map',
    'tracking_sheet',
    'field_staging',
    'officials_management',
    'periodic_reports',
    'about',
  ],
  engineer_inspector: [
    'home',
    'forms_portal',
    'initiatives',
    'district_portal',
    'engineers_portal',
    'advisor',
    'decision_center',
    'interactive_charts',
    'interactive_map',
    'field_staging',
    'officials_management',
    'periodic_reports',
    'about',
  ],
  visitor: [
    'home',
    'initiatives',
    'district_portal',
    'workshop',
    'interactive_charts',
    'interactive_map',
    'about',
  ],
};

/**
  * Check whether a user role has access to a specific tab
  */
export function hasTabAccess(
  role: UserRole | string, 
  tabId: TabId, 
  customRoleTabAccess?: Record<string, TabId[]>
): boolean {
  if (tabId === 'login') return true;
  if (role === 'admin' || role === 'central_unit') return true;
  const accessMap = customRoleTabAccess || ROLE_TAB_ACCESS;
  const normalizedRole = (role in accessMap ? role : 'visitor') as UserRole;
  const allowedTabs = accessMap[normalizedRole] || accessMap.visitor || ROLE_TAB_ACCESS.visitor;
  return allowedTabs.includes(tabId);
}

/**
  * Check whether a user role has a specific functional permission
  */
export function hasActionPermission(role: UserRole | string, permissionKey: keyof RolePermissions): boolean {
  if (role === 'admin' || role === 'central_unit') return true;
  const normalizedRole = (role in ROLE_PERMISSIONS ? role : 'visitor') as UserRole;
  const permissions = ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.visitor;
  return !!permissions[permissionKey];
}

/**
  * Get list of allowed tabs for a role
  */
export function getAllowedTabsForRole(
  role: UserRole | string, 
  customRoleTabAccess?: Record<string, TabId[]>
): TabId[] {
  if (role === 'admin' || role === 'central_unit') {
    return customRoleTabAccess?.central_unit || ROLE_TAB_ACCESS.central_unit;
  }
  const accessMap = customRoleTabAccess || ROLE_TAB_ACCESS;
  const normalizedRole = (role in accessMap ? role : 'visitor') as UserRole;
  return accessMap[normalizedRole] || accessMap.visitor || ROLE_TAB_ACCESS.visitor;
}
