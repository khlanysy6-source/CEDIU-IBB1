/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../../security/AuthContext';
import { RoleService } from '../../../core/auth/RoleService';
import { Initiative } from '../../../types';
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, Check, ListTodo, Shield, Sparkles } from 'lucide-react';

export interface ExecutiveTask {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'routine';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  relatedEntityName?: string;
  actionLabel: string;
  actionTab: string;
}

export interface MyTasksProps {
  initiatives: Initiative[];
  onNavigateTab: (tab: string) => void;
}

export const MyTasks: React.FC<MyTasksProps> = ({ initiatives, onNavigateTab }) => {
  const { userProfile, effectiveRole } = useAuth();
  const eRole = RoleService.toEnterpriseRole(effectiveRole);

  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cooperative_completed_executive_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTaskIds((prev) => {
      const updated = prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId];
      localStorage.setItem('cooperative_completed_executive_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  // Generate dynamic tasks according to the specific role
  const generateRoleTasks = (): ExecutiveTask[] => {
    const criticalInits = initiatives.filter((i) => i.status === 'stagnant' || i.status === 'stopped');
    const pendingInits = initiatives.filter((i) => i.status === 'pending');
    const ongoingInits = initiatives.filter((i) => i.status === 'ongoing');

    switch (eRole) {
      case 'SUPER_ADMIN':
      case 'UNIT_HEAD':
        return [
          {
            id: 'task_head_1',
            title: `اعتماد القرار الاستراتيجي للمبادرات الحرجة والمتوقفة (${criticalInits.length} مبادرة)`,
            category: 'قرارات سيادية',
            priority: 'high',
            status: completedTaskIds.includes('task_head_1') ? 'completed' : 'pending',
            dueDate: 'عاجل',
            relatedEntityName: criticalInits[0]?.name || 'عقبة حراير وراف',
            actionLabel: 'دخول مركز القرارات التنموية',
            actionTab: 'decision_center',
          },
          {
            id: 'task_head_2',
            title: 'تقييم مؤشرات الأثر التنموي العام وإجمالي المستفيدين بمحافظة إب',
            category: 'تقييم استراتيجي',
            priority: 'medium',
            status: completedTaskIds.includes('task_head_2') ? 'completed' : 'pending',
            dueDate: 'هذا الأسبوع',
            actionLabel: 'استعراض التقارير التنفيذية',
            actionTab: 'periodic_reports',
          },
          {
            id: 'task_head_3',
            title: 'مراجعة معالجة المخاطر ومناقلة المواد المخصصة للمديريات',
            category: 'إدارة مخاطر',
            priority: 'medium',
            status: completedTaskIds.includes('task_head_3') ? 'completed' : 'pending',
            dueDate: 'اليوم',
            actionLabel: 'مصفوفة الكميات والأسمنت',
            actionTab: 'matrix',
          },
        ];

      case 'EXECUTIVE_MANAGER':
        return [
          {
            id: 'task_exec_1',
            title: `مراجعة الحالات الحرجة المتأخرة والتدخل العاجل (${criticalInits.length} حالة)`,
            category: 'غرفة العمليات',
            priority: 'high',
            status: completedTaskIds.includes('task_exec_1') ? 'completed' : 'pending',
            dueDate: 'عاجل جداً',
            relatedEntityName: criticalInits[0]?.name,
            actionLabel: 'معاينة المبادرات الحرجة',
            actionTab: 'initiatives',
          },
          {
            id: 'task_exec_2',
            title: 'توليد ومتابعة التكاليف الميدانية لفرق الإشراف الهندسي',
            category: 'متابعة الإشراف',
            priority: 'high',
            status: completedTaskIds.includes('task_exec_2') ? 'completed' : 'pending',
            dueDate: 'اليوم',
            actionLabel: 'استمارة تقارير المهندسين',
            actionTab: 'engineers_portal',
          },
          {
            id: 'task_exec_3',
            title: 'مقارنة الأداء الزمني ونسب إنجاز المسارات الخمسة',
            category: 'الرقابة التنفيذية',
            priority: 'medium',
            status: completedTaskIds.includes('task_exec_3') ? 'completed' : 'pending',
            dueDate: 'غداً',
            actionLabel: 'المخططات والرسوم البيانية',
            actionTab: 'interactive_charts',
          },
        ];

      case 'UNIT_REPRESENTATIVE':
        return [
          {
            id: 'task_rep_1',
            title: 'رفع ملف المشاكل الحرجة التي تحتاج تصعيد للقيادة المركزية',
            category: 'تنسيق المحافظة',
            priority: 'high',
            status: completedTaskIds.includes('task_rep_1') ? 'completed' : 'pending',
            dueDate: 'عاجل',
            actionLabel: 'مركز تحليل القرار',
            actionTab: 'decision_center',
          },
          {
            id: 'task_rep_2',
            title: 'متابعة التنسيق مع مكتب المحافظ بخصوص الدعم المحلي والديزل',
            category: 'تنسيق القيادة',
            priority: 'medium',
            status: completedTaskIds.includes('task_rep_2') ? 'completed' : 'pending',
            dueDate: 'هذا الأسبوع',
            actionLabel: 'بوابة مديريات المحافظة',
            actionTab: 'district_portal',
          },
        ];

      case 'GOVERNOR':
      case 'GOVERNOR_VIEWER':
        return [
          {
            id: 'task_gov_1',
            title: `مراجعة المبادرات المتعثرة بالـ 20 مديرية واتخاذ قرارات الدعم الرسمية (${criticalInits.length} مبادرة)`,
            category: 'قيادة المحافظة',
            priority: 'high',
            status: completedTaskIds.includes('task_gov_1') ? 'completed' : 'pending',
            dueDate: 'عاجل',
            relatedEntityName: criticalInits[0]?.name,
            actionLabel: 'خرائط المديريات الـ 20',
            actionTab: 'district_portal',
          },
          {
            id: 'task_gov_2',
            title: 'استعراض تقرير الأثر المجتمعي ومساهمات الجمعيات التعاونية',
            category: 'المساهمة الشعبية',
            priority: 'medium',
            status: completedTaskIds.includes('task_gov_2') ? 'completed' : 'pending',
            dueDate: 'هذا الأسبوع',
            actionLabel: 'التقارير التنفيذية',
            actionTab: 'periodic_reports',
          },
        ];

      case 'DISTRICT_MANAGER':
        return [
          {
            id: 'task_dist_1',
            title: 'متابعة حل المعوقات الميدانية واجتماع اللجان المجتمعية بالمديرية',
            category: 'السلطة المحلية',
            priority: 'high',
            status: completedTaskIds.includes('task_dist_1') ? 'completed' : 'pending',
            dueDate: 'عاجل',
            actionLabel: 'بوابة المديرية الميدانية',
            actionTab: 'district_portal',
          },
          {
            id: 'task_dist_2',
            title: 'رفع قوائم الاحتياجات العاجلة من أكياس الأسمنت والمعدات',
            category: 'تحديد الاحتياج',
            priority: 'medium',
            status: completedTaskIds.includes('task_dist_2') ? 'completed' : 'pending',
            dueDate: 'اليوم',
            actionLabel: 'سجل مبادرات المديرية',
            actionTab: 'initiatives',
          },
          {
            id: 'task_dist_3',
            title: 'تحديث بيانات ودليل فرسان التنمية المحليين',
            category: 'فرسان التنمية',
            priority: 'medium',
            status: completedTaskIds.includes('task_dist_3') ? 'completed' : 'pending',
            dueDate: 'هذا الأسبوع',
            actionLabel: 'دليل فرسان التنمية',
            actionTab: 'tracking_sheet',
          },
        ];

      case 'COOPERATIVE_ADMIN':
        return [
          {
            id: 'task_coop_1',
            title: 'مراجعة وتحديث أكياس الأسمنت والديزل بالمخازن التابعة للجمعية',
            category: 'المساهمة العينية',
            priority: 'high',
            status: completedTaskIds.includes('task_coop_1') ? 'completed' : 'pending',
            dueDate: 'اليوم',
            actionLabel: 'مساهمات ومخازن الجمعية',
            actionTab: 'tracking_sheet',
          },
          {
            id: 'task_coop_2',
            title: 'توثيق ورصد المساهمات الشعبية النقدية والعينية بموقع العمل',
            category: 'تأطير المجتمع',
            priority: 'medium',
            status: completedTaskIds.includes('task_coop_2') ? 'completed' : 'pending',
            dueDate: 'هذا الأسبوع',
            actionLabel: 'سجل المبادرات',
            actionTab: 'initiatives',
          },
        ];

      case 'FIELD_ENGINEER':
        return [
          {
            id: 'task_field_1',
            title: 'رفع تقرير كميات الرصف اليومية وأكياس الأسمنت المستخدمة بالصورة',
            category: 'ميداني - فرسان الهندسة',
            priority: 'high',
            status: completedTaskIds.includes('task_field_1') ? 'completed' : 'pending',
            dueDate: 'اليوم',
            actionLabel: 'تسجيل الرفع الميداني',
            actionTab: 'field_staging',
          },
          {
            id: 'task_field_2',
            title: 'فحص جودة صب الخرسانة ومطابقة المواصفات الفنية بالموقع',
            category: 'جودة هندسية',
            priority: 'high',
            status: completedTaskIds.includes('task_field_2') ? 'completed' : 'pending',
            dueDate: 'اليوم',
            actionLabel: 'تحديث الملاحظات الفنية',
            actionTab: 'matrix',
          },
        ];

      case 'SUPERVISION_MANAGER':
      case 'PROVINCIAL_SUPERVISION_MANAGER':
      case 'SUPERVISION_ENGINEER':
        return [
          {
            id: 'task_sup_1',
            title: 'تعبئة واعتماد استمارة المعاينة الميدانية للرصف واختبار الشد والضغط',
            category: 'إشراف فني',
            priority: 'high',
            status: completedTaskIds.includes('task_sup_1') ? 'completed' : 'pending',
            dueDate: 'اليوم',
            actionLabel: 'استمارة تقارير المهندسين',
            actionTab: 'engineers_portal',
          },
          {
            id: 'task_sup_2',
            title: 'مطابقة المعاينات الميدانية مع نتاجات الفرز المكتبي وتدقيق الكميات',
            category: 'جودة هندسية',
            priority: 'medium',
            status: completedTaskIds.includes('task_sup_2') ? 'completed' : 'pending',
            dueDate: 'هذا الأسبوع',
            actionLabel: 'نتائج الفرز والمطابقة',
            actionTab: 'matching_results',
          },
        ];

      case 'STUDIES_MANAGER':
      case 'PROVINCIAL_STUDIES_MANAGER':
      case 'STUDIES_ENGINEER':
        return [
          {
            id: 'task_std_1',
            title: 'مراجعة واعتماد الفرز المكتبي والدراسات الهندسية للمبادرات المرفوعة',
            category: 'دراسات هندسية',
            priority: 'high',
            status: completedTaskIds.includes('task_std_1') ? 'completed' : 'pending',
            dueDate: 'عاجل',
            actionLabel: 'نتائج الفرز المكتبي',
            actionTab: 'matching_results',
          },
          {
            id: 'task_std_2',
            title: 'تحليل جدوى المبادرات وتوقعات الأثر التنموي لمسارات الطرق الأهلية',
            category: 'تحليل الجدوى',
            priority: 'medium',
            status: completedTaskIds.includes('task_std_2') ? 'completed' : 'pending',
            dueDate: 'هذا الأسبوع',
            actionLabel: 'مركز تحليل القرار',
            actionTab: 'decision_center',
          },
        ];

      case 'VISITOR':
      default:
        return [
          {
            id: 'task_vis_1',
            title: 'استكشاف خريطة المبادرات الميدانية GPS ومواقع الرصف',
            category: 'الشفافية والأثر',
            priority: 'routine',
            status: completedTaskIds.includes('task_vis_1') ? 'completed' : 'pending',
            dueDate: 'متاح الآن',
            actionLabel: 'الخريطة التفاعلية GPS',
            actionTab: 'interactive_map',
          },
          {
            id: 'task_vis_2',
            title: 'قراءة قصص النجاح الميدانية والأثر التنموي المتحقق بمديريات إب',
            category: 'قصص الأثر',
            priority: 'routine',
            status: completedTaskIds.includes('task_vis_2') ? 'completed' : 'pending',
            dueDate: 'متاح الآن',
            actionLabel: 'مصفوفة النتائج والأثر',
            actionTab: 'matrix',
          },
        ];
    }
  };

  const tasks = generateRoleTasks();
  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn my-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-2xl">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>مركز المهام الشخصية (My Tasks)</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-extrabold">
                {pendingCount} قائمة المطلوبات
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              المهام والإجراءات القيادية المطلوبة بحسب منصبكم ونطاق مسئوليتكم المباشرة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>تفاعل فوري ومزامنة تلقائية</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tasks.map((task) => {
          const isDone = task.status === 'completed';
          return (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                isDone
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : task.priority === 'high'
                  ? 'bg-amber-50/40 border-amber-200/80 shadow-2xs'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {task.category}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      task.priority === 'high'
                        ? 'bg-rose-100 text-rose-800'
                        : task.priority === 'medium'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {task.dueDate}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-emerald-500 bg-white'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <p
                    className={`text-xs font-bold leading-snug ${
                      isDone ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {task.title}
                  </p>
                </div>

                {task.relatedEntityName && (
                  <p className="text-[11px] text-slate-500 bg-slate-100/70 p-1.5 rounded-lg font-medium">
                    📍 <span className="font-bold">{task.relatedEntityName}</span>
                  </p>
                )}
              </div>

              <button
                onClick={() => onNavigateTab(task.actionTab)}
                className="w-full py-2 px-3 bg-slate-900 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{task.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 transform rotate-180" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
