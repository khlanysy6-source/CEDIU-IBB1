import React, { useState, useMemo } from 'react';
import { Initiative } from '../../../types';
import { ExecutiveOverview, ExecutiveRoleView, PriorityIssue } from '../types';
import { ExecutiveDataService } from '../services/executiveDataService';
import { ExecutiveManagerView } from '../views/ExecutiveManagerView';
import { ExecutiveBriefView } from '../views/ExecutiveBriefView';
import { GovernorView } from '../views/GovernorView';
import { OperationalView } from '../views/OperationalView';
import { PublicImpactView } from '../views/PublicImpactView';
import { DecisionLedgerModal } from './DecisionLedgerModal';
import { ShieldCheck, UserCheck, Landmark, HardHat, Heart, RefreshCw, Eye, Sparkles } from 'lucide-react';

interface Props {
  initiatives: Initiative[];
  defaultRole?: ExecutiveRoleView;
}

export const ExecutiveCommandExperience: React.FC<Props> = ({
  initiatives,
  defaultRole = 'executive_manager'
}) => {
  const [currentRoleView, setCurrentRoleView] = useState<ExecutiveRoleView>(defaultRole);
  const [selectedIssueForLedger, setSelectedIssueForLedger] = useState<PriorityIssue | null>(null);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);

  // Memoize aggregated ExecutiveOverview model from raw initiatives
  const overview: ExecutiveOverview = useMemo(() => {
    return ExecutiveDataService.buildOverview(initiatives);
  }, [initiatives]);

  const handleOpenLedger = (issue: PriorityIssue) => {
    setSelectedIssueForLedger(issue);
    setIsLedgerModalOpen(true);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Executive Command Bar - Role Switcher Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg backdrop-blur-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-black text-lg">طبقة القيادة والتجربة الموحدة (Executive Experience Layer)</h2>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[11px] font-bold">
                  تحديث فوري live
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                عرض القرار المناسب بحسب مستوى الصلاحية والمسؤولية التنفيذية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>الرصيد المعتمد: <strong className="text-white font-mono">{overview.summary.totalInitiatives} مبادرة</strong></span>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-slate-400 text-xs font-bold pl-2">اختر واجهة المسؤول:</span>

          {/* 1. المدير التنفيذي */}
          <button
            onClick={() => setCurrentRoleView('executive_manager')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              currentRoleView === 'executive_manager'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>المدير التنفيذي</span>
          </button>

          {/* 2. رئيس الوحدة */}
          <button
            onClick={() => setCurrentRoleView('executive_brief')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              currentRoleView === 'executive_brief'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>رئيس الوحدة (الإيجاز)</span>
          </button>

          {/* 3. المحافظ */}
          <button
            onClick={() => setCurrentRoleView('governor')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              currentRoleView === 'governor'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>المحافظ (الرؤية الاستراتيجية)</span>
          </button>

          {/* 4. المدير الميداني */}
          <button
            onClick={() => setCurrentRoleView('operational')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              currentRoleView === 'operational'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>المدير الميداني</span>
          </button>

          {/* 5. الزائر / المشاركة المجتمعية */}
          <button
            onClick={() => setCurrentRoleView('public')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              currentRoleView === 'public'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/30'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>العرض العام (الزائر / الأثر)</span>
          </button>
        </div>
      </div>

      {/* Dynamic Render of Selected Role View */}
      <div className="transition-all duration-300">
        {currentRoleView === 'executive_manager' && (
          <ExecutiveManagerView overview={overview} onOpenLedger={handleOpenLedger} />
        )}
        {currentRoleView === 'executive_brief' && (
          <ExecutiveBriefView overview={overview} />
        )}
        {currentRoleView === 'governor' && (
          <GovernorView overview={overview} />
        )}
        {currentRoleView === 'operational' && (
          <OperationalView overview={overview} onOpenLedger={handleOpenLedger} />
        )}
        {currentRoleView === 'public' && (
          <PublicImpactView overview={overview} />
        )}
      </div>

      {/* Decision Ledger Traceability Modal */}
      {isLedgerModalOpen && (
        <DecisionLedgerModal
          issue={selectedIssueForLedger}
          ledgerItems={overview.ledgerTrace}
          onClose={() => setIsLedgerModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ExecutiveCommandExperience;
