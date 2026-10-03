import React from 'react';
import { ExecutiveMetrics } from '../types';
import { Activity, CheckCircle2, Clock, AlertTriangle, ShieldAlert, Coins, Sparkles, Scale } from 'lucide-react';

interface Props {
  summary: ExecutiveMetrics;
  healthStatus?: 'EXCELLENT' | 'STABLE' | 'WARNING' | 'CRITICAL';
}

export const ExecutiveMetricsBar: React.FC<Props> = ({ summary, healthStatus = 'STABLE' }) => {
  const getHealthBadge = () => {
    switch (healthStatus) {
      case 'EXCELLENT':
        return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> الأداء ممتاز</span>;
      case 'STABLE':
        return <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> الوضع مستقر</span>;
      case 'WARNING':
        return <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> يحتاج انتباه</span>;
      case 'CRITICAL':
        return <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-xs font-bold flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> حرج جداً</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Row with Health Status & Golden Triangle Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-base">الصورة القيادية الحالية للمحافظة</h3>
              {getHealthBadge()}
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              متابعة شيت المبادرات التنموية ({summary.totalInitiatives} مبادرة موزعة على 20 مديرية)
            </p>
          </div>
        </div>

        {/* Golden Triangle - المثلث الذهبي */}
        <div className="flex items-center gap-4 bg-slate-950/60 px-4 py-2 rounded-lg border border-slate-800 text-xs">
          <div className="text-slate-400 font-medium flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">المثلث الذهبي:</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-300">💰 الميزانية: <strong className="text-emerald-400">{summary.budgetExecutionPct}%</strong></span>
            <span className="text-slate-300">⏱️ الوقت: <strong className="text-blue-400">{summary.timeOnTrackPct}%</strong></span>
            <span className="text-slate-300">🛡️ الجودة: <strong className="text-purple-400">{summary.qualityAvgPct}%</strong></span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Initiatives */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-1 h-full bg-slate-500" />
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">إجمالي المبادرات</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-white">{summary.totalInitiatives}</span>
            <span className="text-[11px] text-slate-400">مبادرة</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">مسجلة بالشيت المعتمد</p>
        </div>

        {/* Completed */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500" />
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">المكتمل والمنجز</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-emerald-400">{summary.completed}</span>
            <span className="text-[11px] text-emerald-400 font-bold">
              ({Math.round((summary.completed / summary.totalInitiatives) * 100)}%)
            </span>
          </div>
          <p className="text-[10px] text-emerald-500/80 mt-1">رصف وطرق جاهزة</p>
        </div>

        {/* Active */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="absolute top-0 right-0 w-1 h-full bg-blue-500" />
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">الجاري تنفيذه</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-blue-400">{summary.active}</span>
            <span className="text-[11px] text-blue-400 font-bold">نشط بالميدان</span>
          </div>
          <p className="text-[10px] text-blue-500/80 mt-1">تنسيق متواصل</p>
        </div>

        {/* Delayed */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-1 h-full bg-amber-500" />
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">المتعثر والمعلق</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-amber-400">{summary.delayed}</span>
            <span className="text-[11px] text-amber-400 font-bold">يحتاج متابعة</span>
          </div>
          <p className="text-[10px] text-amber-500/80 mt-1">أسباب فنية/لوجستية</p>
        </div>

        {/* Critical & Decisions Required */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="absolute top-0 right-0 w-1 h-full bg-rose-500" />
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">يحتاج قرار مسؤول</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-rose-400">{summary.critical}</span>
            <span className="text-[11px] text-rose-400 font-bold">تدخل عاجل</span>
          </div>
          <p className="text-[10px] text-rose-500/80 mt-1">أولوية حاسمة</p>
        </div>
      </div>
    </div>
  );
};
