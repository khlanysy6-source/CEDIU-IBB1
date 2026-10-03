import React from 'react';
import { ExecutiveInsight } from '../types';
import { Lightbulb, CheckSquare, Target, ArrowLeftRight } from 'lucide-react';

interface Props {
  insights: ExecutiveInsight[];
}

export const InsightsCard: React.FC<Props> = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-white font-bold text-base">التوصيات والأفكار التنموية القيادية (Executive Insights)</h3>
          <p className="text-slate-400 text-xs">رؤى موثوقة ناتجة عن دمج البيانات الميدانية وتحليلات الأداء</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((item) => (
          <div
            key={item.id}
            className="bg-slate-950/90 border border-purple-500/20 rounded-xl p-4 space-y-3 hover:border-purple-500/40 transition-all"
          >
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0" />
              <h4 className="text-white font-bold text-sm leading-snug">{item.insight}</h4>
            </div>

            {/* Evidence List */}
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5">
              <span className="text-slate-400 font-bold block mb-1">الأدلة الميدانية الموثقة (Evidence):</span>
              {item.evidence.map((ev, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <span className="text-purple-400 font-mono">•</span>
                  <span>{ev}</span>
                </div>
              ))}
            </div>

            {/* Recommendation & Decision */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-start gap-2 text-emerald-300">
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-400">التوصية القيادية: </strong>
                  <span>{item.recommendation}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-amber-300 pt-1 border-t border-slate-800">
                <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-400">القرار المطلوب: </strong>
                  <span>{item.decisionRequired}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
