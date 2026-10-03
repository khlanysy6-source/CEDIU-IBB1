import React from 'react';
import { ExecutiveOverview } from '../types';
import { ExecutiveSelectors } from '../selectors/executiveSelectors';
import { Trophy, AlertOctagon, CheckCircle2, TrendingUp, ShieldCheck, Clock, Coins } from 'lucide-react';

interface Props {
  overview: ExecutiveOverview;
}

export const ExecutiveBriefView: React.FC<Props> = ({ overview }) => {
  const brief = ExecutiveSelectors.getExecutiveBriefData(overview);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 font-bold text-xs rounded border border-blue-500/30">
              الإيجاز التنفيذي السريع (Executive Brief)
            </span>
            <span className="text-slate-400 text-xs">• موجه لقيادة الوحدة والأمانة العامة</span>
          </div>
          <h2 className="text-white font-black text-xl">ملخص الأداء والموقف التنموي الراهن</h2>
          <p className="text-slate-300 text-xs">
            رؤية مكثفة ناتجة عن متابعة الـ 725 مبادرة المعتمدة بالشيت والتغذية الراجعة من الميدان
          </p>
        </div>

        {/* Quick Rate Badge */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-3 rounded-xl border border-slate-800">
          <div className="text-center border-l border-slate-800 pl-3">
            <span className="text-slate-400 text-[10px] block">نسبة الإنجاز الكلية</span>
            <span className="text-2xl font-black font-mono text-emerald-400">{brief.performanceSummary.completionRate}%</span>
          </div>
          <div className="text-center pr-1">
            <span className="text-slate-400 text-[10px] block">انضباط المثلث الذهبي</span>
            <span className="text-sm font-bold text-cyan-300">
              {brief.performanceSummary.qualityPct}% جودة
            </span>
          </div>
        </div>
      </div>

      {/* Grid Section: Achievements & Key Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Achievements */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base pb-2 border-b border-slate-800">
            <Trophy className="w-5 h-5" />
            <span>أبرز الإنجازات المحققة (Top Achievements)</span>
          </div>
          <ul className="space-y-2.5">
            {brief.topAchievements.map((ach, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-200 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{ach}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Challenges & Major Risks */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-base pb-2 border-b border-slate-800">
            <AlertOctagon className="w-5 h-5" />
            <span>التحديات والمخاطر الحرجة (Risks & Bottlenecks)</span>
          </div>
          <div className="space-y-2">
            {brief.topRisks.map((risk) => (
              <div key={risk.id} className="bg-slate-950/80 border border-rose-500/20 p-3 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between text-white font-bold">
                  <span>{risk.title} ({risk.district})</span>
                  <span className="text-rose-400 font-mono">تأخير {risk.delayDays} يوم</span>
                </div>
                <p className="text-slate-300">{risk.reason}</p>
                <div className="text-[11px] text-amber-300 font-medium pt-1">
                  المطلوب: {risk.requiredAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decisions Required for Executive Approval */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <ShieldCheck className="w-5 h-5" />
            <span>القرارات المرفوعة لرئيس الوحدة والقيادة (Urgent Approvals)</span>
          </div>
          <span className="text-xs text-slate-400">{brief.urgentDecisions.length} قرارات حاسمة</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {brief.urgentDecisions.map((dec) => (
            <div key={dec.id} className="bg-slate-950/80 border border-amber-500/20 p-3.5 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">{dec.title}</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold text-[10px] rounded">
                  {dec.dueDate}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">{dec.description}</p>
              <div className="flex items-center justify-between text-slate-400 pt-1 text-[11px]">
                <span>المسؤول: {dec.responsibleRole}</span>
                {dec.estimatedCostImpact && (
                  <span className="text-emerald-400 font-mono font-bold">
                    {(dec.estimatedCostImpact / 1000000).toFixed(1)} مليون ريال
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
