/**
 * Central Decisions Store & Data Repository
 * Manages official decision records across all 725 initiatives
 */

import { importedInitiatives } from '../importedData';

export type DecisionType = 'proposed' | 'completed' | 'transfer' | 'closing' | 'stagnation_treatment';
export type DecisionStatus = 'pending' | 'approved' | 'executed' | 'rejected';
export type DecisionExecutionStatus = 'pending' | 'in_execution' | 'executed' | 'delayed';

export interface DecisionRecord {
  id: string;
  decisionNumber: string;
  title: string;
  initiativeId: string;
  initiativeName: string;
  district: string;
  type: DecisionType;
  status: DecisionStatus;
  problem: string;
  evidence: string;
  recommendation: string;
  owner: string;
  approvedBy: string;
  executionStatus: DecisionExecutionStatus;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

function parseVal(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const match = String(val).replace(/,/g, '').match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
}

export function generateCanonicalDecisions(): DecisionRecord[] {
  const records: DecisionRecord[] = [];

  importedInitiatives.forEach((init) => {
    const isCompleted = init.status === 'completed' || init.completionRate === 100;
    const isStopped = init.status === 'stopped';
    const isStagnant = init.status === 'stagnant';
    const isOngoing = init.status === 'ongoing';

    const approvedCement = parseVal(init.materialsApproved);
    const disbursedCement = parseVal(init.materialsDisbursed);
    const remainingUnitCement = Math.max(0, approvedCement - disbursedCement);

    if (isCompleted) {
      records.push({
        id: `dec_closing_${init.id}`,
        decisionNumber: `DEC-CLOSING-${init.initiativeNumber || init.id}`,
        title: `إغلاق وتوثيق المبادرة المكتملة (${init.name})`,
        initiativeId: init.id,
        initiativeName: init.name,
        district: init.district,
        type: 'closing',
        status: 'executed',
        problem: 'المبادرة منجزة بالكامل بنسبة إنجاز 100% وتتطلب اعتماد محضر الإغلاق الفني والهندسي التسليمي.',
        evidence: 'بيانات الإنجاز الميداني المعتمدة بجدول الكميات وملاحظات الفحص الفني.',
        recommendation: 'إصدار شهادة الإنجاز النهائي وتوثيق التسليم الفني والتنفيذي للسلطة المحلية واللجنة المجتمعية.',
        owner: 'وحدة التدخلات المركزية',
        approvedBy: 'د. عبدالفتاح الحسام - رئيس الوحدة',
        executionStatus: 'executed',
        createdAt: '2026-07-15T10:00:00.000Z'
      });
    } else if (isStopped) {
      records.push({
        id: `dec_trans_${init.id}`,
        decisionNumber: `DEC-TRANS-${init.initiativeNumber || init.id}`,
        title: `مناقلة وإلغاء مخصصات المبادرة المتوقفة (${init.name})`,
        initiativeId: init.id,
        initiativeName: init.name,
        district: init.district,
        type: 'transfer',
        status: 'approved',
        problem: init.stagnationReason || init.notes || 'غير موثق بالبيانات الحالية',
        evidence: 'ملاحظات وسجلات الشيت الرسمي وتوثيق تنازل اللجنة المجتمعية.',
        recommendation: `اعتماد مناقلة رصيد الإسمنت والديزل غير المنصرف لصالح مبادرة نشطة بـ ${init.district} وتوثيق المحضر الرسمى.`,
        owner: `السلطة المحلية بـ ${init.district}`,
        approvedBy: 'القاضي عبد الواحد صلاح - محافظ المحافظة',
        executionStatus: 'in_execution',
        createdAt: '2026-08-01T10:00:00.000Z'
      });
    } else if (isStagnant) {
      records.push({
        id: `dec_stag_${init.id}`,
        decisionNumber: `DEC-STAG-${init.initiativeNumber || init.id}`,
        title: `معالجة التعثر الميداني لمبادرة (${init.name})`,
        initiativeId: init.id,
        initiativeName: init.name,
        district: init.district,
        type: 'stagnation_treatment',
        status: 'approved',
        problem: init.stagnationReason ? `عائق مسجل بالبيانات الرسمية: ${init.stagnationReason}` : 'سبب التعثر غير موثق بالبيانات الحالية',
        evidence: 'سجل رصد حالة المبادرات وجدول الكميات وملاحظات المعاينة الحقلية.',
        recommendation: `توجيه السلطة المحلية بـ ${init.district} والجمعية التعاونية بعقد اجتماع حاسم لعلاج السبب والتنسيق لاستئناف الصب.`,
        owner: `السلطة المحلية بـ ${init.district}`,
        approvedBy: 'القاضي عبد الواحد صلاح - محافظ المحافظة',
        executionStatus: 'in_execution',
        createdAt: '2026-08-01T10:00:00.000Z'
      });
    } else if (isOngoing) {
      records.push({
        id: `dec_prop_${init.id}`,
        decisionNumber: `DEC-PROP-${init.initiativeNumber || init.id}`,
        title: `متابعة وتعزيز التنفيذ النشط لمبادرة (${init.name})`,
        initiativeId: init.id,
        initiativeName: init.name,
        district: init.district,
        type: 'proposed',
        status: 'pending',
        problem: remainingUnitCement > 0 
          ? `الأعمال جارية بنسبة إنجاز ${init.completionRate}% ويوجد رصيد معتمد غير منصرف لدى الوحدة بمقدار ${remainingUnitCement.toLocaleString('ar-YE')} كيس أسمنت.`
          : `الأعمال جارية بنسبة إنجاز ${init.completionRate}% وبانتظار استكمال مراحل الصب والرصف الجبلي.`,
        evidence: 'سجل حصر الكميات المعتمدة والمنصرفة وتقارير المتابعة الميدانية.',
        recommendation: 'استمرار المتابعة اليومية وصرف الدفعة المتبقية من رصيد الوحدة عند توثيق الإنجاز المرحلي.',
        owner: 'وحدة التدخلات المركزية',
        approvedBy: 'أ. علي بن علي المجاهد - المدير التنفيذي',
        executionStatus: 'in_execution',
        createdAt: '2026-08-05T10:00:00.000Z'
      });
    } else {
      // Pending / unstarted
      records.push({
        id: `dec_prop_${init.id}`,
        decisionNumber: `DEC-PROP-${init.initiativeNumber || init.id}`,
        title: `التقييم الأولي والتحقق لمبادرة جديدة (${init.name})`,
        initiativeId: init.id,
        initiativeName: init.name,
        district: init.district,
        type: 'proposed',
        status: 'pending',
        problem: 'المبادرة جديدة أو قيد المسح الأولي وبانتظار التثبت من الجاهزية المجتمعية والمستودع.',
        evidence: 'سجل حصر طلبات المبادرات والدراسة الفنية المبدئية.',
        recommendation: 'تكليف مهندس القطاع بإجراء الفرز الميداني والتثبت من التنازلات وتأمين المستودع قبل صرف الدفعة الأولى.',
        owner: 'وحدة التدخلات المركزية',
        approvedBy: 'أ. علي بن علي المجاهد - المدير التنفيذي',
        executionStatus: 'pending',
        createdAt: '2026-08-05T10:00:00.000Z'
      });
    }
  });

  return records;
}

export const INITIAL_DECISIONS: DecisionRecord[] = generateCanonicalDecisions();

export function getStoredDecisions(): DecisionRecord[] {
  if (typeof window === 'undefined') return INITIAL_DECISIONS;
  try {
    const saved = localStorage.getItem('cooperative_decisions_collection');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse saved decisions:', e);
  }
  return INITIAL_DECISIONS;
}

export function saveDecisions(decisions: DecisionRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('cooperative_decisions_collection', JSON.stringify(decisions));
  } catch (e) {
    console.warn('Failed to save decisions:', e);
  }
}

export function addDecision(decision: Omit<DecisionRecord, 'id' | 'createdAt'>): DecisionRecord {
  const current = getStoredDecisions();
  const newRecord: DecisionRecord = {
    ...decision,
    id: `dec_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  const updated = [newRecord, ...current];
  saveDecisions(updated);
  return newRecord;
}

export function getDecisionsForInitiative(initiativeId: string): DecisionRecord[] {
  const current = getStoredDecisions();
  return current.filter(
    d => d.initiativeId === initiativeId || d.initiativeName?.includes(initiativeId)
  );
}
