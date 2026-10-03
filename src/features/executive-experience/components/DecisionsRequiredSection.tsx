import React, { useState } from 'react';
import { ExecutiveDecision } from '../types';
import { Target, Clock, ShieldCheck, UserCheck, Coins, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  decisions: ExecutiveDecision[];
}

export const DecisionsRequiredSection: React.FC<Props> = ({ decisions }) => {
  const [approvedIds, setApprovedIds] = useState<string[]>([]);

  const handleApprove = (id: string) => {
    if (!approvedIds.includes(id)) {
      setApprovedIds([...approvedIds, id]);
    }
  };

  if (!decisions || decisions.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-xl text-center">
        <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <h4 className="text-white font-bold text-sm">تمت معالجة جميع القرارات المعلقة</h4>
        <p className="text-slate-400 text-xs mt-1">لا توجد موافقات أو قرارات قيادية متأخرة</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">القرارات القيادية المطلوبة (Decision Ledger)</h3>
            <p className="text-slate-400 text-xs">جدول القرارات الحاسمة لتمكين الميدان واستمرارية العمل</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-xs font-mono font-bold">
          {decisions.length - approvedIds.length} بانتظار الاعتماد
        </span>
      </div>

      <div className="space-y-3">
        {decisions.map((dec) => {
          const isApproved = approvedIds.includes(dec.id);

          return (
            <div
              key={dec.id}
              className={`p-4 rounded-xl border transition-all ${
                isApproved
                  ? 'bg-emerald-950/20 border-emerald-500/40 opacity-80'
                  : dec.priority === 'CRITICAL'
                  ? 'bg-slate-950/90 border-rose-500/30 hover:border-rose-500/60'
                  : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-[280px]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        dec.priority === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : dec.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {dec.priority === 'CRITICAL' ? 'أولوية حاسمة' : dec.priority === 'HIGH' ? 'أولوية عالية' : 'أولوية متوسطة'}
                    </span>
                    <h4 className="text-white font-bold text-sm">{dec.title}</h4>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{dec.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-1 text-slate-300">
                      <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>المسؤول: <strong className="text-white">{dec.responsibleRole}</strong></span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      <span>استحقاق: <strong className="text-rose-300">{dec.dueDate}</strong></span>
                    </div>
                    {dec.estimatedCostImpact && (
                      <div className="flex items-center gap-1 text-emerald-400 font-mono">
                        <Coins className="w-3.5 h-3.5" />
                        <span>الأثر المالي: {dec.estimatedCostImpact.toLocaleString('ar-YE')} ريال</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-center">
                  {isApproved ? (
                    <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      <span>تم إقرار القرار بالمحضر</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApprove(dec.id)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-emerald-900/30 transition-all flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>اعتماد الإجراء قيادياً</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
