/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnterpriseRole, OrganizationType, DataScope } from '../../../core/auth/types';
import { UserRole } from '../../../types';

export interface RoleDashboardMeta {
  role: EnterpriseRole;
  uiRole: UserRole;
  dashboardTitle: string;
  welcomeMessage: string;
  subtitle: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  iconName: string;
  allowedSections: string[];
  forbiddenSections: string[];
  primaryActions: { label: string; tab: string; icon: string }[];
}

export const ROLE_DASHBOARD_CONFIGS: Record<EnterpriseRole, RoleDashboardMeta> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    uiRole: 'admin',
    dashboardTitle: 'مركز القيادة والاستثمار التنموي الشامل',
    welcomeMessage: 'أهلاً بكم في مركز التحكم الرئيسي لمنصة وحدة التدخلات المركزية التنموية الطارئة',
    subtitle: 'إشراف سيادي كامل على المحافظات والمشاريع والأمان والمستخدمين',
    accentColor: 'emerald',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    iconName: 'ShieldCheck',
    allowedSections: ['general_picture', 'risks', 'decisions', 'impact', 'tasks', 'admin_controls'],
    forbiddenSections: [],
    primaryActions: [
      { label: 'سجل المبادرات الكامل', tab: 'initiatives', icon: 'Activity' },
      { label: 'إدارة المستخدمين والأذونات', tab: 'entity_permissions', icon: 'Users' },
      { label: 'مركز القرارات التنموية', tab: 'decision_center', icon: 'Brain' },
    ],
  },

  UNIT_HEAD: {
    role: 'UNIT_HEAD',
    uiRole: 'central_unit',
    dashboardTitle: 'مركز القيادة الاستراتيجية',
    welcomeMessage: 'أهلاً بكم في مركز القيادة الاستراتيجية لوحدة التدخلات المركزية التنموية الطارئة',
    subtitle: 'الرؤية العامة ومتابعة الأثر التنموي وإدارة المخاطر والقرارات السيادية',
    accentColor: 'emerald',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    iconName: 'Building',
    allowedSections: ['general_picture', 'risks', 'decisions', 'impact', 'tasks'],
    forbiddenSections: ['admin_controls', 'raw_field_inputs'],
    primaryActions: [
      { label: 'مركز تحليل القرار', tab: 'decision_center', icon: 'Brain' },
      { label: 'التقارير التنفيذية للقيادة', tab: 'periodic_reports', icon: 'FileText' },
      { label: 'خريطة الأثر GPS', tab: 'interactive_map', icon: 'MapPin' },
    ],
  },

  EXECUTIVE_MANAGER: {
    role: 'EXECUTIVE_MANAGER',
    uiRole: 'central_unit',
    dashboardTitle: 'غرفة العمليات التنفيذية',
    welcomeMessage: 'أهلاً بكم في غرفة العمليات التنفيذية',
    subtitle: 'إدارة المبادرات الحرجة ومتابعة الفرق الميدانية وتدفق العمليات والقرارات التنفيذية',
    accentColor: 'indigo',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-900',
    iconName: 'Activity',
    allowedSections: ['critical_initiatives', 'interventions', 'supervision_followup', 'studies_followup', 'open_decisions', 'timeline_performance', 'my_executive_tasks'],
    forbiddenSections: ['system_settings'],
    primaryActions: [
      { label: 'متابعة المبادرات الحرجة', tab: 'initiatives', icon: 'AlertCircle' },
      { label: 'تقارير الإشراف الميداني', tab: 'periodic_reports', icon: 'FileText' },
      { label: 'نتائج المطابقة الميدانية', tab: 'matching_results', icon: 'CheckCircle' },
    ],
  },

  UNIT_REPRESENTATIVE: {
    role: 'UNIT_REPRESENTATIVE',
    uiRole: 'central_unit',
    dashboardTitle: 'بوابة فرع الوحدة بالمحافظة',
    welcomeMessage: 'أهلاً بكم في بوابة فرع وحدة التدخلات بمحافظة إب',
    subtitle: 'التنسيق بين قيادة الوحدة والسلطة المحلية بمديريات المحافظة والرفع العاجل',
    accentColor: 'teal',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-900',
    iconName: 'MapPin',
    allowedSections: ['governorate_overview', 'districts_status', 'initiatives_status', 'supervision_reports', 'studies_reports', 'governor_coordination', 'escalated_issues', 'my_tasks'],
    forbiddenSections: ['admin_controls', 'other_governorates'],
    primaryActions: [
      { label: 'توزيع خريطة المديريات', tab: 'district_portal', icon: 'Building' },
      { label: 'رفع مشكلة عاجلة للوحدة', tab: 'decision_center', icon: 'AlertCircle' },
      { label: 'تقارير المتابعة', tab: 'periodic_reports', icon: 'FileText' },
    ],
  },

  SUPERVISION_MANAGER: {
    role: 'SUPERVISION_MANAGER',
    uiRole: 'central_unit',
    dashboardTitle: 'مركز الإشراف الفني - القيادة المركزية',
    welcomeMessage: 'أهلاً بكم في مركز الإشراف الفني لوحدة التدخلات',
    subtitle: 'متابعة أداء كافة فرق الإشراف وتقييم جودة التنفيذ واختبارات الخرسانة والرصف',
    accentColor: 'blue',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
    iconName: 'ShieldCheck',
    allowedSections: ['all_teams_overview', 'execution_quality', 'technical_reports', 'engineer_evaluations', 'my_tasks'],
    forbiddenSections: ['financial_transfers', 'user_management'],
    primaryActions: [
      { label: 'استمارة تقارير المهندسين', tab: 'engineers_portal', icon: 'FileText' },
      { label: 'سجل الفحص الميداني', tab: 'matching_results', icon: 'CheckCircle' },
      { label: 'مصفوفة الكميات المنفذة', tab: 'matrix', icon: 'Table' },
    ],
  },

  PROVINCIAL_SUPERVISION_MANAGER: {
    role: 'PROVINCIAL_SUPERVISION_MANAGER',
    uiRole: 'governorate',
    dashboardTitle: 'مركز الإشراف الفني بمحافظة إب',
    welcomeMessage: 'أهلاً بكم في مكتب الإشراف الفني الميداني بمحافظة إب',
    subtitle: 'التنسيق الإشرافي والتوجيه الميداني لمهندسي المتابعة بمديريات المحافظة',
    accentColor: 'blue',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
    iconName: 'ShieldCheck',
    allowedSections: ['governorate_teams', 'execution_quality', 'provincial_reports', 'my_tasks'],
    forbiddenSections: ['other_governorates'],
    primaryActions: [
      { label: 'تقارير مهندسي إب', tab: 'engineers_portal', icon: 'FileText' },
      { label: 'بوابات مديريات إب', tab: 'district_portal', icon: 'Building' },
    ],
  },

  SUPERVISION_ENGINEER: {
    role: 'SUPERVISION_ENGINEER',
    uiRole: 'engineer_inspector',
    dashboardTitle: 'مركز الإشراف الفني الميداني',
    welcomeMessage: 'أهلاً بكم في مساحة الإشراف الهندسي الميداني',
    subtitle: 'متابعة جودة الرصف، استلام العينات، المعاينات الفنية، ورفع التقارير المعتمدة',
    accentColor: 'sky',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-900',
    iconName: 'Pencil',
    allowedSections: ['assigned_districts_only', 'technical_inspections', 'field_reports', 'my_tasks'],
    forbiddenSections: ['unassigned_districts', 'system_settings'],
    primaryActions: [
      { label: 'تعبئة تقرير معاينة ميداني', tab: 'engineers_portal', icon: 'FileText' },
      { label: 'المطابقة والنتائج', tab: 'matching_results', icon: 'CheckCircle' },
    ],
  },

  STUDIES_MANAGER: {
    role: 'STUDIES_MANAGER',
    uiRole: 'central_unit',
    dashboardTitle: 'مركز التحليل التنموي والدراسات',
    welcomeMessage: 'أهلاً بكم في مركز التحليل التنموي وإعداد الدراسات الفنية',
    subtitle: 'دراسات الجدوى التنموية، تحليل أولويات الاحتياج، وتوقع العائد الاجتماعي والاقتصادي',
    accentColor: 'violet',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-900',
    iconName: 'Brain',
    allowedSections: ['indicators', 'development_analytics', 'needs_assessment', 'technical_studies', 'forecasts', 'my_tasks'],
    forbiddenSections: ['user_management'],
    primaryActions: [
      { label: 'نتائج الفرز المكتبي', tab: 'matching_results', icon: 'CheckCircle' },
      { label: 'مركز تحليل القرار', tab: 'decision_center', icon: 'Brain' },
      { label: 'المخططات والرسوم البيانية', tab: 'interactive_charts', icon: 'BarChart' },
    ],
  },

  PROVINCIAL_STUDIES_MANAGER: {
    role: 'PROVINCIAL_STUDIES_MANAGER',
    uiRole: 'governorate',
    dashboardTitle: 'قسم الدراسات والتحليل بمحافظة إب',
    welcomeMessage: 'أهلاً بكم في قسم الدراسات والتخطيط التنموي بمحافظة إب',
    subtitle: 'إعداد قوائم الأولويات ودراسات مسارات الطرق الأهلية بمديريات إب',
    accentColor: 'violet',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-900',
    iconName: 'Brain',
    allowedSections: ['provincial_indicators', 'needs_assessment', 'technical_studies', 'my_tasks'],
    forbiddenSections: ['other_governorates'],
    primaryActions: [
      { label: 'تقييم احتياجات المديريات', tab: 'district_portal', icon: 'Building' },
      { label: 'الفرز الفني والمطابقة', tab: 'matching_results', icon: 'CheckCircle' },
    ],
  },

  STUDIES_ENGINEER: {
    role: 'STUDIES_ENGINEER',
    uiRole: 'engineer_inspector',
    dashboardTitle: 'مساحة إعداد الدراسات الميدانية',
    welcomeMessage: 'أهلاً بك م. دراسات في مساحة التحليل الفني للمبادرات المسندة',
    subtitle: 'مراجعة المخططات الهندسية، قياس الأطوال، وحساب التكاليف والكميات المتوقعة',
    accentColor: 'purple',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900',
    iconName: 'Pencil',
    allowedSections: ['assigned_initiatives_studies', 'technical_specs', 'my_tasks'],
    forbiddenSections: ['unassigned_initiatives', 'system_settings'],
    primaryActions: [
      { label: 'فحص مطابقة الدراسة الميدانية', tab: 'matching_results', icon: 'CheckCircle' },
      { label: 'المستشار الهندسي AI', tab: 'advisor', icon: 'Brain' },
    ],
  },

  GOVERNOR: {
    role: 'GOVERNOR',
    uiRole: 'governorate',
    dashboardTitle: 'لوحة قيادة المحافظة التنموية',
    welcomeMessage: 'أهلاً بكم في لوحة قيادة محافظة إب التنموية',
    subtitle: 'متابعة تفعيل 733 مبادرة أهلية بالطرق بالـ 20 مديرية ودعم المجتمع',
    accentColor: 'amber',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-950',
    iconName: 'Building',
    allowedSections: ['governorate_overview', 'all_20_districts', 'gps_map_distribution', 'completion_rates', 'critical_initiatives', 'community_impact', 'my_tasks'],
    forbiddenSections: ['system_settings', 'user_management', 'internal_technical_details', 'other_governorates'],
    primaryActions: [
      { label: 'خريطة توزيع المديريات الـ 20', tab: 'district_portal', icon: 'MapPin' },
      { label: 'تقرير الأثر والمساهمات', tab: 'periodic_reports', icon: 'FileText' },
      { label: 'الخريطة التفاعلية GPS', tab: 'interactive_map', icon: 'Map' },
    ],
  },

  GOVERNOR_VIEWER: {
    role: 'GOVERNOR_VIEWER',
    uiRole: 'governorate',
    dashboardTitle: 'بوابة الاطلاع لمكتب المحافظ',
    welcomeMessage: 'أهلاً بكم في بوابة المتابعة والاطلاع بمكتب المحافظ',
    subtitle: 'استعراض حالة الإنجاز والمؤشرات التنموية بمديريات محافظة إب',
    accentColor: 'amber',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-950',
    iconName: 'Eye',
    allowedSections: ['governorate_overview', 'all_20_districts', 'gps_map_distribution', 'community_impact'],
    forbiddenSections: ['system_settings', 'user_management', 'edit_data'],
    primaryActions: [
      { label: 'بوابة مديريات المحافظة', tab: 'district_portal', icon: 'Building' },
      { label: 'الرسوم البيانية التفاعلية', tab: 'interactive_charts', icon: 'BarChart' },
    ],
  },

  DISTRICT_MANAGER: {
    role: 'DISTRICT_MANAGER',
    uiRole: 'district_director',
    dashboardTitle: 'بوابة المديرية',
    welcomeMessage: 'أهلاً بكم في بوابة المديرية',
    subtitle: 'متابعة مبادرات شق ورصف الطرق الأهلية وحل المعوقات والتنسيق المجتمعي',
    accentColor: 'emerald',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    iconName: 'Home',
    allowedSections: ['own_district_initiatives_only', 'execution_status', 'district_needs', 'district_issues', 'proposals', 'outcomes', 'my_tasks'],
    forbiddenSections: ['other_districts', 'system_settings', 'admin_controls'],
    primaryActions: [
      { label: 'بوابة المديرية الميدانية', tab: 'district_portal', icon: 'Building' },
      { label: 'سجل المبادرات بالمديرية', tab: 'initiatives', icon: 'Activity' },
      { label: 'دليل فرسان التنمية', tab: 'tracking_sheet', icon: 'Users' },
    ],
  },

  COOPERATIVE_ADMIN: {
    role: 'COOPERATIVE_ADMIN',
    uiRole: 'cooperative_association',
    dashboardTitle: 'بوابة الشراكة المجتمعية',
    welcomeMessage: 'أهلاً بكم في بوابة الشراكة المجتمعية للجمعية التعاونية',
    subtitle: 'إدارة المساهمات الشعبية، متابعة مخازن الأسمنت والديزل، وتفعيل مبادرات المجتمع',
    accentColor: 'rose',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-900',
    iconName: 'Users',
    allowedSections: ['association_initiatives', 'community_contributions', 'needs', 'issues', 'proposals', 'impact', 'my_tasks'],
    forbiddenSections: ['other_associations', 'system_settings'],
    primaryActions: [
      { label: 'مساهمات ومخازن الجمعية', tab: 'tracking_sheet', icon: 'Table' },
      { label: 'إضافة احتياج أو مبادرة', tab: 'initiatives', icon: 'Plus' },
      { label: 'فريق فرسان التنمية', tab: 'tracking_sheet', icon: 'Users' },
    ],
  },

  FIELD_ENGINEER: {
    role: 'FIELD_ENGINEER',
    uiRole: 'engineer_inspector',
    dashboardTitle: 'مساحة التنفيذ الميداني (فرسان الهندسة والتنمية)',
    welcomeMessage: 'أهلاً بكم في مساحة التنفيذ الميداني',
    subtitle: 'تسجيل كميات الإنجاز اليومي، أكياس الأسمنت والديزل، الملاحظات، والصور من الموقع',
    accentColor: 'orange',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-900',
    iconName: 'Pencil',
    allowedSections: ['assigned_tasks', 'assigned_initiatives', 'execution_rates', 'executed_quantities', 'used_materials', 'site_photos', 'field_notes', 'my_tasks'],
    forbiddenSections: ['other_initiatives', 'system_settings', 'admin_controls'],
    primaryActions: [
      { label: 'تسجيل رفع ميداني جديد', tab: 'field_staging', icon: 'Upload' },
      { label: 'تحديث أكياس الأسمنت والمواد', tab: 'matrix', icon: 'Table' },
    ],
  },

  VISITOR: {
    role: 'VISITOR',
    uiRole: 'visitor',
    dashboardTitle: 'بوابة الأثر التنموي والشفافية العامة',
    welcomeMessage: 'أهلاً بكم في بوابة الأثر التنموي والشفافية العامة',
    subtitle: 'استعراض الإنجازات الميدانية، قصص النجاح، الخرائط العامة، وأثر مساهمات المجتمع',
    accentColor: 'emerald',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    iconName: 'Compass',
    allowedSections: ['what_we_do', 'where_we_work', 'achievements', 'impact', 'success_stories', 'photos', 'public_maps'],
    forbiddenSections: ['internal_operations', 'raw_data', 'editing', 'system_settings'],
    primaryActions: [
      { label: 'خريطة المبادرات المفتوحة', tab: 'interactive_map', icon: 'MapPin' },
      { label: 'قصص النجاح والنتائج', tab: 'matrix', icon: 'Award' },
    ],
  },
};

export function getRoleDashboardConfig(role: EnterpriseRole): RoleDashboardMeta {
  return ROLE_DASHBOARD_CONFIGS[role] || ROLE_DASHBOARD_CONFIGS.VISITOR;
}
