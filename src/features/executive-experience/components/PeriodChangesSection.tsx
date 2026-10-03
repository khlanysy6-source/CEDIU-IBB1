import React from 'react';
import { PeriodChange } from '../types';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface Props {
  changes: PeriodChange[];
}

export const PeriodChangesSection: React.FC<Props> = ({ changes }) => {
  if (!changes || changes.length === 0) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          <h3 className="text-white font-bold text-sm">التغير والتطوُّر منذ آخر فترة (Period-over-Period Delta)</h3>
        </div>
        <span className="text-slate-400 text-xs">تحديث مباشر أسبوعي</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {changes.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-xl border space-y-1.5 ${
              item.type === 'IMPROVED'
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : item.type === 'DECLINED'
                ? 'bg-rose-950/20 border-rose-500/30'
                : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold text-xs">{item.metric}</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1 ${
                  item.type === 'IMPROVED'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : item.type === 'DECLINED'
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {item.type === 'IMPROVED' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                {item.type === 'DECLINED' && <TrendingDown className="w-3 h-3 text-rose-400" />}
                {item.type === 'STABLE' && <Minus className="w-3 h-3 text-slate-400" />}
                <span>{item.valueChange}</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">{item.detail}</p>
            <span className="text-[10px] text-slate-500 block">{item.periodText}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
