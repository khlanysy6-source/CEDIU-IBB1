import React from 'react';
import { ExecutiveOverview } from '../types';
import { ExecutiveSelectors } from '../selectors/executiveSelectors';
import { Building2, Map, Users, Award, Landmark, Compass, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  overview: ExecutiveOverview;
}

export const GovernorView: React.FC<Props> = ({ overview }) => {
  const governorData = ExecutiveSelectors.getGovernorData(overview);
  const { governorateMetrics, geographicHighlights, macroIssues } = governorData;

  return (
    <div className="space-y-6">
      {/* Strategic Governorate Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" />
                رؤية قيادة المحافظة الاستراتيجية (Governor Executive View)
              </span>
              <span className="text-slate-400 text-xs">محافظة إب</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              صورة التنمية الميدانية والمبادرات المجتمعية بالمحافظة
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              إشراف استراتيجي موحد على <strong className="text-emerald-400 font-mono">725 مبادرة طريق</strong> تنموية موزعة جغرافياً على <strong className="text-cyan-400">20 مديرية</strong>، لتعزيز ربط القرى الوعرة بتمويل مجتمعي ودعم حكومي مباشر.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-center space-y-1">
            <span className="text-slate-400 text-xs block">معدل الرضا والارتياح المجتمعي</span>
            <span className="text-3xl font-black font-mono text-emerald-400">{governorateMetrics.satisfactionRate}%</span>
            <span className="text-[10px] text-emerald-500 block">بناءً على التقييم الميداني المستمر</span>
          </div>
        </div>
      </div>

      {/* Macro Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>إجمالي المستفيدين</span>
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {(governorateMetrics.totalBeneficiaries / 1000000).toFixed(2)}M
          </div>
          <span className="text-[10px] text-slate-500 block">أكثر من 1.85 مليون مواطن</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>إجمالي الطرق المفتوحة</span>
          </div>
          <div className="text-2xl font-black font-mono text-cyan-400">
            {governorateMetrics.totalKmRoads} كم
          </div>
          <span className="text-[10px] text-cyan-500/80 block">رصف خرساني ومسارات جبلية</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Award className="w-4 h-4 text-amber-400" />
            <span>قيمة المساهمات المجتمعية</span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {(governorateMetrics.totalCommunityValue / 1000000000).toFixed(2)}B
          </div>
          <span className="text-[10px] text-amber-500/80 block">مليار ريال يمني (تمويل أهل)</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Building2 className="w-4 h-4 text-purple-400" />
            <span>التغطية الجغرافية</span>
          </div>
          <div className="text-2xl font-black font-mono text-purple-400">
            20 مديرية
          </div>
          <span className="text-[10px] text-purple-500/80 block">{governorateMetrics.activeDistrictsCount} نشطة + {governorateMetrics.governorateCentersCount} مراكز</span>
        </div>
      </div>

      {/* Strategic Map Overview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Map className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-white font-bold text-base">الخريطة الاستراتيجية لتوزيع المبادرات بالمديريات</h3>
              <p className="text-slate-400 text-xs">مؤشرات الأثر الاجتماعي والجغرافي على مستوى المحافظة</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-emerald-400 font-bold text-xs">المديريات الرائدة في التحول التنموي</h4>
            {geographicHighlights.topDistricts.map(d => (
              <div key={d.districtName} className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-white font-bold block">{d.districtName}</span>
                  <span className="text-slate-400 text-[11px]">{d.completedCount} مبادرة مكتملة بالكامل</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-mono font-bold rounded">
                  {d.completionRate}% إنجاز
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-rose-400 font-bold text-xs">القضايا الكبرى المرفوعة لقيادة المحافظة</h4>
            {macroIssues.map(issue => (
              <div key={issue.id} className="bg-slate-950/80 p-3 rounded-lg border border-rose-500/20 text-xs space-y-1">
                <div className="flex items-center justify-between text-white font-bold">
                  <span>{issue.title}</span>
                  <span className="text-rose-400 font-mono">{issue.district}</span>
                </div>
                <p className="text-slate-300 text-[11px]">{issue.reason}</p>
                <div className="text-emerald-300 font-medium text-[11px] pt-1">
                  التوصية: {issue.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
