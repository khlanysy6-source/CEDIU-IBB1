/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Initiative } from '../../../../types';
import { SmartWelcome } from '../WelcomeHeader';
import { MyTasks } from '../MyTasks';
import { MapPin, Building, AlertTriangle, FileText, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

export interface ViewProps {
  initiatives: Initiative[];
  onNavigateTab: (tab: string) => void;
  onSelectInitiative?: (id: string) => void;
}

export const UnitRepresentativeLanding: React.FC<ViewProps> = ({ initiatives, onNavigateTab }) => {
  const governorateInits = initiatives; // Governorate scope (e.g. Ibb)
  const totalCount = governorateInits.length;
  const stagnantCount = governorateInits.filter(i => i.status === 'stagnant' || i.status === 'stopped').length;

  return (
    <div className="space-y-6 animate-fadeIn" id="unit-representative-landing">
      {/* Smart Welcome Banner */}
      <SmartWelcome customTitle="ممثل وحدة التدخلات المركزية بمحافظة إب" />

      {/* Representative Control Bar */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md border border-teal-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/20 rounded-xl text-teal-300">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">بوابة فرع الوحدة بمحافظة إب • Regional Branch Command</h2>
            <p className="text-xs text-teal-200/80 font-medium">التنسيق بين قيادة الوحدة المركزية، السلطة المحلية بمكتب المحافظ، والـ 20 مديرية</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('district_portal')}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black rounded-xl transition-all shadow-sm"
          >
            خريطة الـ 20 مديرية 🏛️
          </button>
          <button
            onClick={() => onNavigateTab('decision_center')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl transition-all border border-slate-700"
          >
            رفع مشكلة عاج للوحدة 🚨
          </button>
        </div>
      </div>

      {/* My Executive Tasks */}
      <MyTasks initiatives={initiatives} onNavigateTab={onNavigateTab} />

      {/* Governorate Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">المبادرات بمحافظة إب</span>
            <Building className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{totalCount} <span className="text-xs font-normal text-slate-500">مبادرة</span></p>
          <p className="text-[11px] text-teal-700 font-semibold">تغطي كلاً من الـ 20 مديرية بالكامل</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">المشكلات التي تحتاج تصعيد للوحدة</span>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-3xl font-black text-rose-800">{stagnantCount} <span className="text-xs font-normal text-slate-500">حالة عاجلة</span></p>
          <button
            onClick={() => onNavigateTab('decision_center')}
            className="text-xs font-bold text-rose-700 hover:underline block pt-1"
          >
            توليد مذكرة رفع عاجل للقيادة ←
          </button>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">التنسيق مع قيادة المحافظة</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-800">100%</p>
          <p className="text-[11px] text-emerald-700 font-semibold">تواصل مباشر وشراكة مع قيادة السلطة المحلية</p>
        </div>
      </div>
    </div>
  );
};
