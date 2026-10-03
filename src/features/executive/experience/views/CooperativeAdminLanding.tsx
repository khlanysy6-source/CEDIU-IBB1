/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Initiative } from '../../../../types';
import { useAuth } from '../../../../security/AuthContext';
import { AuthorizationService } from '../../../../core/auth/AuthorizationService';
import { RoleService } from '../../../../core/auth/RoleService';
import { SmartWelcome } from '../WelcomeHeader';
import { MyTasks } from '../MyTasks';
import { Users, Building, Activity, Truck, FileText, CheckCircle2, Package } from 'lucide-react';

export interface ViewProps {
  initiatives: Initiative[];
  onNavigateTab: (tab: string) => void;
  onSelectInitiative?: (id: string) => void;
}

export const CooperativeAdminLanding: React.FC<ViewProps> = ({ initiatives, onNavigateTab }) => {
  const { currentUser, userProfile, effectiveRole } = useAuth();
  const eRole = RoleService.toEnterpriseRole(effectiveRole);
  const scope = AuthorizationService.resolveDataScope(eRole, userProfile, currentUser);

  const orgName = scope.organization || userProfile?.organization || 'الجمعية التعاونية للتنمية';

  // Association Initiatives
  const assocInits = initiatives;

  const totalComm = assocInits.reduce((sum, i) => sum + (Number(i.communityContribution) || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn" id="cooperative-admin-landing">
      {/* Smart Welcome Banner */}
      <SmartWelcome customTitle={`مسؤول ${orgName}`} />

      {/* Header Bar */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md border border-rose-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">بوابة الشراكة المجتمعية • Cooperative Association Gateway</h2>
            <p className="text-xs text-rose-200/80 font-medium">إدارة المساهمات الشعبية، متابعة مخازن الأسمنت والديزل، وتأطير اللجان التنموية</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('tracking_sheet')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" />
            <span>مخازن الجمعية ودليل الفرسان 📦</span>
          </button>
          <button
            onClick={() => onNavigateTab('initiatives')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl transition-all border border-slate-700"
          >
            إضافة/متابعة المبادرات ➕
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500">إجمالي المساهمات المجتمعية التراكمية</span>
          <p className="text-2xl font-black text-rose-900">
            {(totalComm / 1000000).toFixed(1)} <span className="text-xs font-bold text-slate-600">مليون ريال</span>
          </p>
          <p className="text-[11px] text-rose-700 font-semibold">مساهمات الأهالي والمغتربين واللجان الأهلية</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500">مبادرات الشراكة المجتمعية</span>
          <p className="text-2xl font-black text-slate-900">{assocInits.length} <span className="text-xs font-normal text-slate-500">مبادرة</span></p>
          <p className="text-[11px] text-slate-500 font-medium">مشرفة عليها الجمعية التعاونية</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500">فرسان التنمية واللجان المجتمعية</span>
          <p className="text-2xl font-black text-emerald-800">48 <span className="text-xs font-normal text-slate-500">فارس مجتمعي</span></p>
          <p className="text-[11px] text-emerald-700 font-semibold">يقودون تحشيد وتأطير المجتمع</p>
        </div>
      </div>

      {/* My Executive Tasks */}
      <MyTasks initiatives={assocInits} onNavigateTab={onNavigateTab} />
    </div>
  );
};
