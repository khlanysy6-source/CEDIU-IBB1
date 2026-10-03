/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Initiative } from '../../../../types';
import { SmartWelcome } from '../WelcomeHeader';
import { MyTasks } from '../MyTasks';
import { ImpactWidget, GeneralPictureWidget } from '../ExecutiveWidgets';
import { Building, MapPin, Award, CheckCircle2, AlertCircle, BarChart, ChevronRight } from 'lucide-react';

export interface ViewProps {
  initiatives: Initiative[];
  onNavigateTab: (tab: string) => void;
  onSelectInitiative?: (id: string) => void;
}

export const GovernorLanding: React.FC<ViewProps> = ({ initiatives, onNavigateTab }) => {
  const governorateInits = initiatives; // Restricted strictly to Ibb governorate
  const criticalInits = governorateInits.filter(i => i.status === 'stagnant' || i.status === 'stopped');

  // Group by districts (20 districts of Ibb)
  const districtMap: Record<string, number> = {};
  governorateInits.forEach(i => {
    const d = i.district || 'غير محدد';
    districtMap[d] = (districtMap[d] || 0) + 1;
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="governor-landing">
      {/* Smart Welcome Banner */}
      <SmartWelcome customTitle="محافظ محافظة إب - رئيس المجلس المحلي" />

      {/* Governor Command Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3 shadow-lg border border-amber-500/30">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-300">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">لوحة قيادة محافظة إب التنموية • Governor Command Dashboard</h2>
            <p className="text-xs text-amber-200/80 font-medium">متابعة تفعيل {governorateInits.length} مبادرة أهلية بالطرق بالـ 20 مديرية ودعم المساهمات المجتمعية</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('district_portal')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4" />
            <span>خرائط المديريات الـ 20 🏛️</span>
          </button>
          <button
            onClick={() => onNavigateTab('periodic_reports')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl transition-all border border-slate-700"
          >
            تقرير الأثر الشامل 📋
          </button>
        </div>
      </div>

      {/* General Picture */}
      <GeneralPictureWidget initiatives={governorateInits} onNavigateTab={onNavigateTab} />

      {/* My Executive Tasks for Governor */}
      <MyTasks initiatives={governorateInits} onNavigateTab={onNavigateTab} />

      {/* All 20 Districts Distribution Grid */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                توزيع المبادرات التنموية على مديريات محافظة إب الـ 20
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                استعراض سرير المبادرات ونسب التفعيل بكل مديرية على حدة
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('district_portal')}
            className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
          >
            استعراض بوابات المديريات التفصيلية ←
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {Object.entries(districtMap).map(([distName, count], idx) => (
            <button
              key={distName}
              onClick={() => onNavigateTab('district_portal')}
              className="bg-amber-50/30 hover:bg-amber-100/60 border border-amber-200/80 p-3 rounded-2xl text-right transition-all cursor-pointer space-y-1"
            >
              <span className="text-[10px] font-bold text-amber-900 block truncate">{distName}</span>
              <span className="text-lg font-black text-slate-900 block">{count} <span className="text-[10px] font-normal text-slate-500">مبادرة</span></span>
            </button>
          ))}
        </div>
      </div>

      {/* Critical Initiatives in Governorate */}
      <div className="bg-rose-50/40 border border-rose-200 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-rose-200/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 text-rose-800 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-rose-950">
                المبادرات الحرجة المتأخرة بالمديريات • Critical Governorate Issues
              </h3>
              <p className="text-xs text-rose-700 font-medium">
                المشاريع التي بحاجة لتوجيهات السلطة المحلية وتخصيص كميات ديزل مساندة
              </p>
            </div>
          </div>
          <span className="text-xs font-black bg-rose-200 text-rose-900 px-3 py-1 rounded-full">
            {criticalInits.length} حالة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {criticalInits.map((init) => (
            <div key={init.id} className="bg-white border border-rose-200 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">{init.name}</span>
                <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                  مديرية {init.district}
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">
                الاحتياج: {init.notes || 'توجيه الديزل والأسمنت وتفعيل اللجنة المجتمعية'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Community Impact Widget */}
      <ImpactWidget initiatives={governorateInits} onNavigateTab={onNavigateTab} />
    </div>
  );
};
