/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Initiative } from '../../../../types';
import { SmartWelcome } from '../WelcomeHeader';
import { MyTasks } from '../MyTasks';
import { GeneralPictureWidget, RisksWidget, DecisionsWidget, ImpactWidget } from '../ExecutiveWidgets';
import { Brain, FileText, MapPin, ShieldAlert, Award } from 'lucide-react';

export interface ViewProps {
  initiatives: Initiative[];
  onNavigateTab: (tab: string) => void;
  onSelectInitiative?: (id: string) => void;
}

export const UnitHeadLanding: React.FC<ViewProps> = ({ initiatives, onNavigateTab, onSelectInitiative }) => {
  return (
    <div className="space-y-6 animate-fadeIn" id="unit-head-landing">
      {/* Smart Welcome Banner */}
      <SmartWelcome
        customTitle="رئيس وحدة التدخلات المركزية التنموية الطارئة"
      />

      {/* Strategic Command Bar */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md border border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">مركز القيادة الاستراتيجية والتوجيه السيادي</h2>
            <p className="text-xs text-emerald-200/80 font-medium">الرؤية العامة ومتابعة الأثر التنموي وإدارة المخاطر والقرارات السيادية</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('decision_center')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Brain className="w-4 h-4" />
            <span>مركز تحليل القرار 🧠</span>
          </button>
          <button
            onClick={() => onNavigateTab('periodic_reports')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>التقارير التنفيذية 📋</span>
          </button>
        </div>
      </div>

      {/* 1. الصورة العامة (General Picture) */}
      <section className="space-y-3">
        <GeneralPictureWidget initiatives={initiatives} onNavigateTab={onNavigateTab} />
      </section>

      {/* 2. My Executive Tasks */}
      <section className="space-y-3">
        <MyTasks initiatives={initiatives} onNavigateTab={onNavigateTab} />
      </section>

      {/* 3. قسم المخاطر والتعثر (Risks Watch) */}
      <section className="space-y-3">
        <RisksWidget initiatives={initiatives} onNavigateTab={onNavigateTab} />
      </section>

      {/* 4. قسم القرارات والحوكمة (Decisions) */}
      <section className="space-y-3">
        <DecisionsWidget initiatives={initiatives} onNavigateTab={onNavigateTab} />
      </section>

      {/* 5. قسم الأثر والمؤشرات (Impact) */}
      <section className="space-y-3">
        <ImpactWidget initiatives={initiatives} onNavigateTab={onNavigateTab} />
      </section>
    </div>
  );
};
