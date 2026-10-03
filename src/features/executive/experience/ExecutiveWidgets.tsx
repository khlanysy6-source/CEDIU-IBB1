/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Initiative } from '../../../types';
import { 
  Building, MapPin, Activity, AlertCircle, CheckCircle2, 
  TrendingUp, Users, Truck, ShieldCheck, FileText, ArrowRight, Brain, Clock, ChevronRight
} from 'lucide-react';

export interface WidgetProps {
  initiatives: Initiative[];
  onNavigateTab: (tab: string) => void;
  onSelectInitiative?: (id: string) => void;
}

// 1. الصورة العامة (General Picture Widget)
export const GeneralPictureWidget: React.FC<WidgetProps> = ({ initiatives, onNavigateTab }) => {
  const totalCount = initiatives.length;
  const ongoingCount = initiatives.filter(i => i.status === 'ongoing').length;
  const completedCount = initiatives.filter(i => i.status === 'completed').length;
  const criticalCount = initiatives.filter(i => i.status === 'stagnant' || i.status === 'stopped').length;

  const totalCost = initiatives.reduce((sum, i) => sum + (Number(i.cost) || 0), 0);
  const totalComm = initiatives.reduce((sum, i) => sum + (Number(i.communityContribution) || 0), 0);
  const totalUnit = initiatives.reduce((sum, i) => sum + (Number(i.unitContribution) || 0), 0);
  const avgCompletion = Math.round(initiatives.reduce((sum, i) => sum + (Number(i.completionRate) || 0), 0) / (totalCount || 1));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Building className="w-5 h-5 text-emerald-700" />
          <span>الصورة العامة للمبادرات التنموية • General Strategic Overview</span>
        </h3>
        <button
          onClick={() => onNavigateTab('periodic_reports')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
        >
          <span>توليد التقارير القيادية ←</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Initiatives */}
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-4 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-200">
            <span className="text-[11px] font-bold">إجمالي المبادرات المسجلة</span>
            <Activity className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black">{totalCount} <span className="text-xs font-normal text-emerald-200">مبادرة</span></p>
          <div className="flex items-center justify-between text-[10px] text-emerald-300 pt-1 border-t border-emerald-700/60">
            <span>محافظة إب • 20 مديرية</span>
            <span>تغطية 100%</span>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">متوسط الإنجاز الميداني</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{avgCompletion}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${avgCompletion}%` }} />
          </div>
        </div>

        {/* Total Cost & Contributions */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">التكلفة والفرز المالي</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-indigo-900">
            {(totalCost / 1000000).toFixed(1)} <span className="text-xs font-bold">مليون ريال</span>
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span>مجتمع: {(totalComm / 1000000).toFixed(1)}M</span>
            <span>دولة: {(totalUnit / 1000000).toFixed(1)}M</span>
          </div>
        </div>

        {/* Critical & Ongoing */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">حالة المبادرات</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="block text-[10px] text-slate-500 font-bold">نشطة:</span>
              <span className="text-base font-extrabold text-emerald-700">{ongoingCount}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 font-bold">حرجة/متعثرة:</span>
              <span className="text-base font-extrabold text-rose-700">{criticalCount}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 font-bold">مكتملة:</span>
              <span className="text-base font-extrabold text-blue-700">{completedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. قسم المخاطر والتعثر (Risks Widget)
export const RisksWidget: React.FC<WidgetProps> = ({ initiatives, onNavigateTab }) => {
  const stagnantInits = initiatives.filter(i => i.status === 'stagnant' || i.status === 'stopped');

  return (
    <div className="bg-rose-50/50 border border-rose-200 rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-rose-200/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-100 text-rose-800 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-rose-950">
              إدارة المخاطر والتعثر • Risk & Stagnation Watch
            </h3>
            <p className="text-xs text-rose-700 font-medium">
              تحديد وحصر المبادرات الحرجة والأسباب الجذرية لاتخاذ قرارات التفعيل
            </p>
          </div>
        </div>
        <span className="text-xs font-black bg-rose-200/80 text-rose-900 px-3 py-1 rounded-full">
          {stagnantInits.length} حالة حرجة
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {stagnantInits.slice(0, 4).map((init) => (
          <div key={init.id} className="bg-white border border-rose-200 p-3.5 rounded-2xl shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 truncate max-w-[200px]">{init.name}</span>
              <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                {init.district}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-2">
              سبب التعثر: {init.stagnationReason || init.notes || 'غير موثق بالبيانات الحالية'}
            </p>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
              <span className="text-slate-500 font-semibold">الإنجاز الحالي: {init.completionRate}%</span>
              <button
                onClick={() => onNavigateTab('decision_center')}
                className="text-xs font-bold text-rose-700 hover:underline flex items-center gap-1"
              >
                معالجة القرار ←
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. قسم القرارات والحوكمة (Decisions Widget)
export const DecisionsWidget: React.FC<WidgetProps> = ({ initiatives, onNavigateTab }) => {
  const stoppedCount = initiatives.filter(i => i.status === 'stopped').length;
  const stagnantCount = initiatives.filter(i => i.status === 'stagnant').length;
  const completedCount = initiatives.filter(i => i.status === 'completed').length;
  const pendingDecisionsCount = stoppedCount + stagnantCount;

  return (
    <div className="bg-indigo-50/40 border border-indigo-200/80 rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-indigo-200/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 text-indigo-900 rounded-xl">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-indigo-950">
              مركز القرارات والتوجيهات السيادية • Decision Center
            </h3>
            <p className="text-xs text-indigo-800 font-medium">
              القرارات المفتوحة، التوجيهات المعلقة، ونسب تنفيذ المعالجات
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('decision_center')}
          className="px-3.5 py-1.5 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-black rounded-xl transition-all shadow-3xs cursor-pointer"
        >
          دخول غرفة القرارات 🧠
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-indigo-100 p-3.5 rounded-2xl text-center space-y-1">
          <span className="block text-xs font-bold text-slate-500">قرارات المعالجة والتدخل</span>
          <span className="text-2xl font-black text-amber-600">{pendingDecisionsCount} قرار</span>
          <span className="block text-[10px] text-slate-400">حالات متعثرة ومتوقفة</span>
        </div>
        <div className="bg-white border border-indigo-100 p-3.5 rounded-2xl text-center space-y-1">
          <span className="block text-xs font-bold text-slate-500">محاضر الإغلاق المنجزة</span>
          <span className="text-2xl font-black text-emerald-600">{completedCount} محضر</span>
          <span className="block text-[10px] text-slate-400">مبادرات مكتملة 100%</span>
        </div>
        <div className="bg-white border border-indigo-100 p-3.5 rounded-2xl text-center space-y-1">
          <span className="block text-xs font-bold text-slate-500">المناقلات المقترحة</span>
          <span className="text-2xl font-black text-indigo-900">{stoppedCount} مناقلة</span>
          <span className="block text-[10px] text-slate-400">إعادة توجيه الإسمنت</span>
        </div>
      </div>
    </div>
  );
};

// 4. قسم الأثر والشفافية (Impact Widget)
export const ImpactWidget: React.FC<WidgetProps> = ({ initiatives, onNavigateTab }) => {
  const totalBeneficiaries = initiatives.reduce((sum, i) => sum + (Number(i.beneficiaries) || 0), 0);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              مؤشرات الأثر التنموي والشفافية المجتمعية • Public Impact & Transparency
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              عائد المشاريع على المواطنين وفك العزلة عن القرى والعقبات الوعرة
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('interactive_map')}
          className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
        >
          خريطة الأثر GPS ←
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-emerald-50/60 border border-emerald-200/80 p-4 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-emerald-900 block">إجمالي المستفيدين المباشرين</span>
          <p className="text-2xl font-black text-emerald-950">
            {totalBeneficiaries.toLocaleString('ar-YE')} <span className="text-xs font-extrabold text-emerald-800">مواطن</span>
          </p>
          <p className="text-[10px] text-emerald-800 font-medium">
            تسهيل التنقل ونقل المحاصيل والخدمات الطبية والتعليمية
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-700 block">الطرق والعقبات المؤهلة</span>
          <p className="text-2xl font-black text-slate-900">
            {initiatives.length} <span className="text-xs font-extrabold text-slate-600">مسار رصف وتوسعة</span>
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            تغطية الـ 20 مديرية بكسر وعورة الجبال الشاهقة
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-700 block">المساهمات المجتمعية النقدية</span>
          <p className="text-2xl font-black text-slate-900">
            {(initiatives.reduce((sum, i) => sum + (Number(i.communityContribution) || 0), 0) / 1000000).toFixed(1)} <span className="text-xs font-bold text-slate-600">مليون ريال</span>
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            مساهمات الأهالي والمغتربين واللجان التنموية
          </p>
        </div>
      </div>
    </div>
  );
};
