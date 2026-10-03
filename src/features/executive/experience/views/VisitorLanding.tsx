/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Initiative } from '../../../../types';
import { SmartWelcome } from '../WelcomeHeader';
import { ImpactWidget } from '../ExecutiveWidgets';
import { Compass, MapPin, Award, CheckCircle2, HeartHandshake, Eye, Sparkles } from 'lucide-react';

export interface ViewProps {
  initiatives: Initiative[];
  onNavigateTab: (tab: string) => void;
  onSelectInitiative?: (id: string) => void;
}

export const VisitorLanding: React.FC<ViewProps> = ({ initiatives, onNavigateTab }) => {
  const completedInits = initiatives.filter(i => i.status === 'completed');
  const totalBeneficiaries = initiatives.reduce((sum, i) => sum + (Number(i.beneficiaries) || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn" id="visitor-landing">
      {/* Smart Welcome Banner for Public Visitor */}
      <SmartWelcome customTitle="زائر المنصة • بوابة الشفافية والأثر العام" />

      {/* Visitor Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-emerald-500/20">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
            <Compass className="w-4 h-4" />
            بوابة الشفافية التنموية الشاملة بمحافظة إب
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            ماذا نعمل؟ أين نعمل؟ وماذا أنجزنا في تفعيل المبادرات المجتمعية؟
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
            تستعرض هذه البوابة ثمرة الشراكة الحقيقية بين وحدة التدخلات المركزية التنموية الطارئة والسلطة المحلية بمحافظة إب والأهالي والمجتمعات المحلية لرصف وتأهيل عقبات الطرق الجبلية الوعرة بمختلف مديريات إب.
          </p>
        </div>
      </div>

      {/* Public Impact Metrics */}
      <ImpactWidget initiatives={initiatives} onNavigateTab={onNavigateTab} />

      {/* What We Do & Success Stories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-emerald-800">
            <Award className="w-5 h-5" />
            <h3 className="text-sm font-black text-slate-900">قصص الإنجاز وفك العزلة الميدانية</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            تم بحمد الله تفعيل ومتابعة عشرات المسارات لرصف الطرق الأهلية بالحجارة والخرسانة، مما ساهم في ربط القرى النائية بالمدن الرئيسية وخفض تكاليف نقل البضائع والمستلزمات الطبية والتعليمية.
          </p>
          <button
            onClick={() => onNavigateTab('interactive_map')}
            className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <MapPin className="w-4 h-4" />
            <span>استكشاف خريطة المواقع المباشرة GPS</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-indigo-800">
            <HeartHandshake className="w-5 h-5" />
            <h3 className="text-sm font-black text-slate-900">قوة الشراكة بين المجتمع والدولة</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            تتجلى التنمية الحقيقية في تظافر جهود الأهالي والمغتربين بتوفير المساهمة النقدية والأحجار والآليات، مقابل تقديم الدولة لدعم مادة الأسمنت والديزل والاستشارات الهندسية عبر وحدة التدخلات.
          </p>
          <button
            onClick={() => onNavigateTab('matrix')}
            className="w-full py-2 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>استعراض نتائج ومصفوفة الإنجاز</span>
          </button>
        </div>
      </div>
    </div>
  );
};
