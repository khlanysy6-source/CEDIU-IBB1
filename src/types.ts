/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TabId = string;

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface Pathway {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  tasks: Task[];
}

export interface Contribution {
  id: string;
  donorName: string;
  type: 'cash' | 'inkind_material' | 'inkind_labor'; // نقدي، عيني مواد، عيني عمل
  description: string;
  value: number; // Estimated cash value
  date: string;
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'safe' | 'at_risk' | 'moved'; // آمنة، مهددة، منقولة
  storageLocation: string;
  updatedAt: string;
  notes?: string;
}

export interface CommitteeMember {
  id: string;
  name: string;
  role: 'leader' | 'knight' | 'auditor' | 'member'; // رئيس، فارس، مدقق، عضو
  phone: string;
  tasksAssigned: number;
}

export interface Knight {
  id: string;
  name: string;
  district: string;
  subDistrict: string;
  village: string;
  phone: string;
  specialty: string; // e.g. "إرشاد تنموي", "هندسة رصف", "تحشيد مجتمعي"
  status: 'active' | 'inactive'; // نشط، غير نشط
  notes?: string;
  createdAt: string;
}

export interface FieldReport {
  id: string;
  title: string;
  date: string;
  description: string;
  isMatchedWithDeskReview: boolean;
  status: 'draft' | 'submitted' | 'approved';
  achievements: string[];
  challenges: string[];
  imagePlaceholder?: string; // Seeded category/theme for random image matching
}

export interface TechnicalWorkQuantities {
  avgWidth?: number; // متوسط العرض (م)
  width?: number; // العرض (م)
  lengthCompleted?: number; // الطول (م)
  length?: number; // الطول
  excavationCut?: number; // الشق
  expansion?: number; // التوسعة
  expansionEarth?: number;
  expansionMixed?: number;
  expansionRock?: number;
  excavationMixed?: number;
  excavationRock?: number;
  backfill?: number;
  compaction?: number;
  gradingLength?: number;
  dryStoneRetaining?: number;
  stoneRetaining?: number;
  rubble?: number;
  stonePavingDry?: number;
  stonePavingMortar?: number;
  concretePaving?: number;
  reinforcedConcrete?: number;
  plainConcrete?: number;
  gradingLevelling?: number; // المسح والتسوية
  structuralExcavationM3?: number; // حفر انشائي م3
  blockWalls?: number; // جدران كتلية
  stoneMasonry?: number; // مباني حجر
  stonePaving?: number; // رصف حجري
  [key: string]: any;
}

export type InitiativeLifecycleStage = 
  | 'approved'                 // المبادرة المعتمدة
  | 'current_monitoring'       // المتابعة الحالية
  | 'field_evaluation'         // التقييم الميداني
  | 'status_classification'     // تصنيف الحالة
  | 'decision_determination'   // تحديد القرار
  | 'action_execution'         // تنفيذ الإجراء
  | 'impact_followup';         // المتابعة وقياس النتائج

export type InitiativeDecisionCategory =
  | 'ongoing_needs_monitoring' // مبادرات مستمرة وتحتاج متابعة
  | 'ready_for_completion'     // مبادرات جاهزة للاستكمال
  | 'needs_treatment'         // مبادرات تحتاج معالجة ومناقلات
  | 'stagnant_needs_decision'  // مبادرات متعثرة تحتاج قراراً
  | 'completed_needs_closing'; // مبادرات مكتملة تحتاج إغلاق وتوثيق

export interface InitiativeEvaluation {
  readinessLevel: 'high' | 'medium' | 'low' | 'not_ready'; // مستوى الجاهزية
  stagnationCategory?: 'technical' | 'community' | 'material_shortage' | 'storage' | 'dispute' | 'fuel_shortage' | 'other';
  delayReasons?: string[]; // أسباب التأخر أو التعثر
  obstacles?: string[]; // المعوقات والتحديات الميدانية
  requiredNeeds?: string[]; // الاحتياجات المطلوبة للاستكمال
  lastEvaluationDate?: string; // تاريخ آخر تقييم ميداني
}

export interface ExecutiveDecisionData {
  requiredAction: string; // الإجراء المطلوب
  interventionPriority: 'urgent' | 'medium' | 'routine'; // أولوية التدخل (عاجل/متوسط/عادي)
  responsibleEntity: string; // الجهة المسؤولة (السلطة المحلية/وحدة التدخلات/الجمعية/المشرف الفني)
  nextFollowUpDate: string; // موعد المتابعة القادمة
  decisionMaker?: string; // متخذ القرار
  decisionDate?: string; // تاريخ صدور القرار
  executionStatus?: 'pending_execution' | 'in_execution' | 'executed'; // حالة تنفيذ الإجراء
  actionNotes?: string;
}

export interface MonitoringLogEntry {
  id: string;
  date: string; // تاريخ المتابعة
  projectStatus: string; // حالة المشروع
  actionTaken: string; // الإجراء المتخذ
  responsiblePerson: string; // المسؤول
  progressRate: number; // نسبة التقدم (%)
  notes: string; // الملاحظات والنتائج
  createdRole?: string;
}


export interface SecondPathOverlay {
  currentCode?: string;
  currentStatus?: string;
  technicalDescription?: string;
  cement?: number;
  diesel?: number;
  otherMaterial?: number;
  stockStatus?: { cement?: string; diesel?: string; other?: string };
  matchingNote?: string;
  decision?: string;
  decisionDetails?: string;
  evaluationEXC?: Record<string, unknown>;
}

export interface Initiative {
  id: string; // ID mapping
  initiativeNumber: string; // رقم المبادرة
  name: string; // اسم المبادرة
  sector: string; // القطاع (مثال: الطرق)
  subDistrict: string; // العزلة
  village: string; // القرية
  coordinates: string; // الموقع الجغرافي / الإحداثيات
  startDate: string; // تاريخ البدء
  endDate: string; // تاريخ الانتهاء
  cost: number; // التكلفة الكلية
  communityContribution: number; // المساهمات المجتمعية
  unitContribution: number; // مساهمة الوحدة (وحدة التدخلات المركزية)
  deliveredUnitContribution?: number; // مساهمة الوحدة الموصلة بالفعل
  completionRate: number; // نسبة الإنجاز (%)
  district: string; // المديرية (مثال: ذي السفال)
  governorate: string; // المحافظة (مثال: إب)
  status: 'pending' | 'ongoing' | 'stagnant' | 'completed' | 'stopped'; // معلق، مستمر، متعثر، مكتمل، متوقفة
  stagnationReason?: string; // أسباب التعثر
  ownerConfirmed: boolean; // إثبات ملكية المجتمع للمبادرة
  pathways: Pathway[];
  contributions: Contribution[];
  materials: Material[];
  committee: CommitteeMember[];
  reports: FieldReport[];
  createdAt: string;
  updatedAt?: string;
  ownerId?: string; // معرف مالك/منشئ السجل في قاعدة السحابة
  materialsApproved?: string; // المواد المعتمدة من مساهمة وحدة التدخلات
  materialsDisbursed?: string; // المواد المنصرفة من مساهمة وحدة التدخلات
  materialsRemaining?: string; // المواد المتبقية من مساهمة وحدة التدخلات
  materialsUsed?: string; // المواد المستخدمة من مساهمة وحدة التدخلات
  dieselApproved?: string; // الديزل المعتمد من مساهمة وحدة التدخلات
  dieselDisbursed?: string; // الديزل المنصرف من مساهمة وحدة التدخلات
  dieselRemaining?: string; // الديزل المتبقي من مساهمة وحدة التدخلات
  dieselUsed?: string; // الديزل المستهلك من مساهمة وحدة التدخلات
  beneficiaries?: number; // عدد المستفيدين
  totalDistance?: number; // المسافة الكلية للمبادرة بالكم
  title?: string; // عنوان المبادرة
  impactScore?: number; // مؤشر الأثر التنموي
  estimatedCost?: number; // التكلفة التقديرية
  matchStatus?: 'matched' | 'discrepancy' | 'pending' | 'pending_audit'; // حالة الفرز والمطابقة
  discrepancies?: string[]; // الفروقات المكتشفة في الفرز
  approvedStudyQuantities?: TechnicalWorkQuantities; // الأعمال والكميات المعتمدة بحسب الدراسة (من شيت ٣)
  executedWorkQuantities?: TechnicalWorkQuantities; // الأعمال والكميات المنجزة والمنفذة ميدانياً (من شيت ٢)
  executionCostCompleted?: number; // تكلفة الأعمال المنجزة
  notes?: string; // ملاحظات وإرشادات الشيت الميداني
  lifecycleStage?: InitiativeLifecycleStage; // مرحلة دورة حياة المبادرة
  decisionCategory?: InitiativeDecisionCategory; // تصنيف مسار القرار التنموي
  evaluation?: InitiativeEvaluation; // بيانات التقييم الميداني والجاهزية
  executiveDecision?: ExecutiveDecisionData; // بيانات القرار التنفيذي
  monitoringTimeline?: MonitoringLogEntry[]; // السجل الزمني للمتابعة الدورية
  secondPath?: SecondPathOverlay; // طبقة المسار التنفيذي الثاني المرتبطة بالمبادرة
}

export interface EngineerSubmissionReport {
  id: string;
  engineerName: string;
  engineerPhone: string;
  district: string;
  subDistrict: string;
  village: string;
  initiativeId: string;
  initiativeName: string;
  date: string;
  pavedMetersToday: number; // أمتار الرصف المنجزة اليوم/في هذا التقرير (م٢)
  cementUsedBags: number; // الإسمنت المستهلك (أكياس)
  qualityScore: number; // نسبة الجودة المطابقة للمواصفات (%)
  obstacles: string; // العوائق الميدانية أو النزاعات الأهلية
  notes: string; // التوصيات والحلول الميدانية
  photoUrl?: string; // رابط أو معينة الصور الميدانية (عام)
  photoBeforeUrl?: string; // صورة توثيق المسار قبل التدخل التنموي
  photoAfterUrl?: string; // صورة توثيق المسار بعد التدخل التنموي
  status: 'pending' | 'approved' | 'rejected'; // حالة الاعتماد من المشرف
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface WeeklyDistrictSummary {
  district: string;
  totalInitiatives: number;
  activeInitiatives: number;
  stagnantInitiatives: number;
  pavedMetersThisWeek: number;
  cementConsumedBagsThisWeek: number;
  communityContributionsThisWeek: number;
  statusRating: 'excellent' | 'normal' | 'needs_intervention';
  keyNotes: string;
}

export interface MonthlyPerformanceKPI {
  budgetAdherence: number; // الالتزام بالميزانية (%)
  scheduleProgress: number; // الالتزام بالجدول الزمني (%)
  qualityCompliance: number; // جودة الرصف والتنفيذ (%)
  communityMobilizationValue: number; // إجمالي القيمة المادية للتحشيد المجتمعي (ريال)
  cementEfficiency: number; // كفاءة استهلاك الإسمنت (م٢/كيس)
}

export interface EngineerAssignment {
  id: string;
  engineerName: string;
  engineerPhone: string;
  specialty: string;
  assignedDistricts: string[]; // المديريات المعين عليها
  assignedInitiativeIds: string[]; // المبادرات الموكلة إليه
  approvedDistricts: string[]; // المديريات المسموح بالتصديق والموافقة عليها للإطلاع في التطبيق
  status: 'active' | 'suspended';
  createdAt: string;
  notes?: string;
}

// ==========================================
// نظام الصلاحيات والأدوار (RBAC Engine)
// ==========================================

export type UserRole = 
  | 'central_unit'            // وحدة التدخلات التنموية المركزية بمحافظة إب
  | 'governorate'             // المحافظة والقيادة التنفيذية
  | 'district_director'       // السلطة المحلية بالمديرية
  | 'cooperative_association' // الجمعية التعاونية
  | 'engineer_inspector'      // المهندس والمراقب الفني
  | 'visitor'                 // الزائر
  | 'admin';                  // للتوافق المباشر مع النظام الحالي

export interface RolePermissions {
  canApproveInitiative: boolean;    // اعتماد المبادرات
  canAllocateSupport: boolean;      // تخصيص الدعم (الديزل والإسمنت)
  canClassifyStatus: boolean;        // تصنيف وتحديث الحالات التشغيلية
  canApproveTransfers: boolean;     // اعتماد المناقلات والمعالجات
  canCloseInitiative: boolean;      // إغلاق المبادرة
  canSubmitEngineerReport: boolean; // رفع التقارير والزيارات الهندسية
  canDocumentContributions: boolean;// توثيق المبادرات والمساهمات والمستندات
  canSubmitDistrictNeeds: boolean;  // رفع الاحتياجات والملاحظات للمديرية
  canViewExecutiveReports: boolean; // الاطلاع على التقارير واللوحات العليا
  canEditSettings: boolean;         // التحكم بإعدادات النظام
}

export const ROLE_LABELS: Record<UserRole, string> = {
  central_unit: 'وحدة التدخلات التنموية المركزية بمحافظة إب',
  governorate: 'المحافظة والقيادة التنفيذية',
  district_director: 'السلطة المحلية بالمديرية',
  cooperative_association: 'الجمعية التعاونية',
  engineer_inspector: 'المهندس والمراقب الفني',
  visitor: 'الزائر',
  admin: 'وحدة التدخلات التنموية المركزية (مشرف النظام)',
};

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  central_unit: {
    canApproveInitiative: true,
    canAllocateSupport: true,
    canClassifyStatus: true,
    canApproveTransfers: true,
    canCloseInitiative: true,
    canSubmitEngineerReport: true,
    canDocumentContributions: true,
    canSubmitDistrictNeeds: true,
    canViewExecutiveReports: true,
    canEditSettings: true,
  },
  admin: {
    canApproveInitiative: true,
    canAllocateSupport: true,
    canClassifyStatus: true,
    canApproveTransfers: true,
    canCloseInitiative: true,
    canSubmitEngineerReport: true,
    canDocumentContributions: true,
    canSubmitDistrictNeeds: true,
    canViewExecutiveReports: true,
    canEditSettings: true,
  },
  governorate: {
    canApproveInitiative: false,
    canAllocateSupport: false,
    canClassifyStatus: false,
    canApproveTransfers: false,
    canCloseInitiative: false,
    canSubmitEngineerReport: false,
    canDocumentContributions: false,
    canSubmitDistrictNeeds: false,
    canViewExecutiveReports: true,
    canEditSettings: false,
  },
  district_director: {
    canApproveInitiative: false,
    canAllocateSupport: false,
    canClassifyStatus: false,
    canApproveTransfers: false,
    canCloseInitiative: false,
    canSubmitEngineerReport: false,
    canDocumentContributions: false,
    canSubmitDistrictNeeds: true,
    canViewExecutiveReports: true,
    canEditSettings: false,
  },
  cooperative_association: {
    canApproveInitiative: false,
    canAllocateSupport: false,
    canClassifyStatus: false,
    canApproveTransfers: false,
    canCloseInitiative: false,
    canSubmitEngineerReport: false,
    canDocumentContributions: true,
    canSubmitDistrictNeeds: false,
    canViewExecutiveReports: true,
    canEditSettings: false,
  },
  engineer_inspector: {
    canApproveInitiative: false,
    canAllocateSupport: false,
    canClassifyStatus: false,
    canApproveTransfers: false,
    canCloseInitiative: false,
    canSubmitEngineerReport: true,
    canDocumentContributions: false,
    canSubmitDistrictNeeds: false,
    canViewExecutiveReports: true,
    canEditSettings: false,
  },
  visitor: {
    canApproveInitiative: false,
    canAllocateSupport: false,
    canClassifyStatus: false,
    canApproveTransfers: false,
    canCloseInitiative: false,
    canSubmitEngineerReport: false,
    canDocumentContributions: false,
    canSubmitDistrictNeeds: false,
    canViewExecutiveReports: true,
    canEditSettings: false,
  },
};

export function getRolePermissions(role: UserRole | string): RolePermissions {
  const normalizedRole = (role as UserRole) in ROLE_PERMISSIONS ? (role as UserRole) : 'visitor';
  return ROLE_PERMISSIONS[normalizedRole];
}

export function hasPermission(role: UserRole | string, action: keyof RolePermissions): boolean {
  return getRolePermissions(role)[action] ?? false;
}

// ==========================================
// سجل الإجراءات والتكليفات التنفيذية (الإجراء_التنموي)
// ==========================================

export type ExecutiveActionStatus = 'new' | 'in_progress' | 'completed' | 'overdue' | 'escalated';
export type ExecutiveActionPriority = 'critical' | 'high' | 'medium' | 'low';

export interface ExecutiveAction {
  id: string;
  initiativeId: string; // معرف المبادرة الداخلي
  initiativeNumber: string; // رقم المبادرة الموحد
  initiativeName: string; // اسم المبادرة
  district: string; // المديرية
  districtNumber?: string; // رقم المديرية
  associationNumber?: string; // رقم الجمعية
  issuedDecision: string; // القرار الصادر من محرك القرار
  requiredAction: string; // الإجراء المطلوب
  responsibleEntity: string; // الجهة المسؤولة (الاسم النصي)
  responsibleRole?: 'district_director' | 'cooperative_association' | 'development_knight' | 'engineer_inspector' | 'central_unit'; // دور المسؤول
  assignedPersonName?: string; // اسم الشخص المكلف
  assignedPersonPhone?: string; // رقم هاتف المكلف
  priority: ExecutiveActionPriority; // الأولوية (حرج/عالي/متوسط/عادي)
  assignedDate: string; // تاريخ التكليف
  dueDate: string; // تاريخ الاستحقاق
  status: ExecutiveActionStatus; // حالة الإجراء (جديد/جاري التنفيذ/مكتمل/متأخر/يحتاج تصعيد)
  notes?: string; // ملاحظات المتابعة والنتائج
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}



