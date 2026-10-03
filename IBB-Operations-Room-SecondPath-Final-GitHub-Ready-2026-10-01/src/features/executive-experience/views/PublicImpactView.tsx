import React from 'react';
import { ExecutiveOverview } from '../types';
import { ExecutiveSelectors } from '../selectors/executiveSelectors';
import { HeartHandshake, MapPin, Compass, Users, CheckCircle2, Award, Sparkles } from 'lucide-react';

interface Props {
  overview: ExecutiveOverview;
}

export const PublicImpactView: React.FC<Props> = ({ overview }) => {
  const publicData = ExecutiveSelectors.getPublicImpactData(overview);
  const { heroStats, topDistrictsProgress, communityImpactValue, completedHighlights } = publicData;

  return (
    <div className="space-y-6">
      {/* Public Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900/60 via-slate-900 to-teal-950 border border-emerald-500/30 p-6 sm:p-8 rounded-2xl relative overflow-hidden text-center sm:text-right">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30">
            <HeartHandshake className="w-4 h-4" />
            <span>منصة الشفافية الأهلية والأثر المجتمعي العام</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            المبادرات التنموية بمحافظة إب: تلاحم مجتمعي وإنجاز ميداني
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            تعرض هذه الشاشة ثمرة التشارك بين جهود المواطنين والأهالي والدعم الحكومي المباشر لفتح ورصف طرق القرى والعقبات الجبلية في كافة المديريات.
          </p>
        </div>
      </div>

      {/* Public Question Cards: 1. ماذا نعمل؟ 2. أين نعمل؟ 3. ماذا أنجزنا؟ 4. ما الأثر؟ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Q1: ماذا نعمل؟ */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
            1
          </div>
          <h3 className="text-white font-bold text-sm">ماذا نعمل؟</h3>
          <p className="text-slate-300 text-xs leading-relaxed">
            نساعد اللجان الأهلية في رصف وتوسعة طرق القرى الوعرة بخرسانات مسلحة مطابقة للمواصفات الفنية المعتمدة.
          </p>
        </div>

        {/* Q2: أين نعمل؟ */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
            2
          </div>
          <h3 className="text-white font-bold text-sm">أين نعمل؟</h3>
          <p className="text-slate-300 text-xs leading-relaxed">
            نتواجد في جميع مديريات محافظة إب الـ 20 عبر شبكة فرسان تنمية ومهندسين مشرفين متطوعين بالكامل.
          </p>
        </div>

        {/* Q3: ماذا أنجزنا؟ */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
            3
          </div>
          <h3 className="text-white font-bold text-sm">ماذا أنجزنا؟</h3>
          <p className="text-slate-300 text-xs leading-relaxed">
            نجحنا في استكمال أكثر من <strong className="text-amber-400 font-mono">{heroStats.completedCount} مبادرة</strong> وتعبيد ما يزيد عن <strong className="text-emerald-400 font-mono">{heroStats.roadsKmCompleted} كم</strong> طولي.
          </p>
        </div>

        {/* Q4: ما الأثر؟ */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
            4
          </div>
          <h3 className="text-white font-bold text-sm">ما الأثر المجتمعي؟</h3>
          <p className="text-slate-300 text-xs leading-relaxed">
            تسهيل الوصول إلى المدارس والمستشفيات لـ <strong className="text-purple-300 font-mono">1.85 مليون مستفيد</strong> وتقليل زمن تنقل المركبات.
          </p>
        </div>
      </div>

      {/* Community Contribution & Highlights */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-white font-bold text-lg">حجم المشاركة الأهلية والمجتمعية بالريال</h3>
            <p className="text-slate-400 text-xs">المساهمة المباشرة من أهالي القرى والمغتربين الداعمين</p>
          </div>
          <div className="bg-slate-950 px-5 py-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 font-mono font-black text-2xl">
            {(communityImpactValue / 1000000000).toFixed(2)} مليار YER
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedHighlights.map((hl) => (
            <div key={hl.id} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>قصة نجاح إنجاز: {hl.initiativeTitle}</span>
                </span>
                <span className="text-slate-500 text-[11px]">{hl.district}</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">{hl.impact}</p>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                الإجراء الداعم: {hl.action}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
