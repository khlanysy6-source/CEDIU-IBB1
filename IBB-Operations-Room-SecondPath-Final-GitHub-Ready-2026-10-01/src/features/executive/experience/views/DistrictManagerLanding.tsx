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
import { Home, Building, Activity, AlertCircle, CheckCircle2, Truck, Plus, FileText } from 'lucide-react';

export interface ViewProps {
  initiatives: Initiative[];
  onNavigateTab: (tab: string) => void;
  onSelectInitiative?: (id: string) => void;
}

export const DistrictManagerLanding: React.FC<ViewProps> = ({ initiatives, onNavigateTab }) => {
  const { currentUser, userProfile, effectiveRole } = useAuth();
  const eRole = RoleService.toEnterpriseRole(effectiveRole);
  const scope = AuthorizationService.resolveDataScope(eRole, userProfile, currentUser);

  const districtName = scope.district || 'جبلة'; // Assigned district

  // Strictly filter initiatives belonging ONLY to this district
  const districtInits = initiatives.filter(
    (i) => i.district?.trim().toLowerCase() === districtName.trim().toLowerCase()
  );

  const totalCost = districtInits.reduce((sum, i) => sum + (Number(i.cost) || 0), 0);
  const totalComm = districtInits.reduce((sum, i) => sum + (Number(i.communityContribution) || 0), 0);
  const totalUnit = districtInits.reduce((sum, i) => sum + (Number(i.unitContribution) || 0), 0);
  const avgCompletion = Math.round(
    districtInits.reduce((sum, i) => sum + (Number(i.completionRate) || 0), 0) / (districtInits.length || 1)
  );

  return (
    <div className="space-y-6 animate-fadeIn" id="district-manager-landing">
      {/* Smart Welcome Banner with District Name */}
      <SmartWelcome customTitle={`مدير عام مديرية ${districtName}`} />

      {/* District Header Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md border border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-300">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">بوابة مديرية {districtName} الميدانية • District Gateway</h2>
            <p className="text-xs text-emerald-200/80 font-medium">متابعة شق ورصف الطرق الأهلية واللجان المجتمعية بالمديرية</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('district_portal')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Building className="w-4 h-4" />
            <span>خريطة مديرية {districtName} 🏛️</span>
          </button>
          <button
            onClick={() => onNavigateTab('initiatives')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>سجل مبادرات المديرية ({districtInits.length})</span>
          </button>
        </div>
      </div>

      {/* District Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">مبادرات مديرية {districtName}</span>
          <p className="text-2xl font-black text-emerald-900">{districtInits.length} <span className="text-xs font-normal text-slate-500">مبادرة</span></p>
          <span className="text-[10px] text-emerald-700 font-semibold">موزعة على عزرى وقرى المديرية</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">معدل الإنجاز العام</span>
          <p className="text-2xl font-black text-slate-900">{avgCompletion}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${avgCompletion}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">مساهمة الأهالي بالمديرية</span>
          <p className="text-xl font-black text-emerald-800">
            {(totalComm / 1000000).toFixed(1)} <span className="text-xs font-bold">مليون ريال</span>
          </p>
          <span className="text-[10px] text-slate-500">نقدي وعيني والآليات</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500">دعم الدولة بالأسمنت</span>
          <p className="text-xl font-black text-indigo-900">
            {(totalUnit / 1000000).toFixed(1)} <span className="text-xs font-bold">مليون ريال</span>
          </p>
          <span className="text-[10px] text-slate-500">دعم الوحدة المركزية</span>
        </div>
      </div>

      {/* My Tasks */}
      <MyTasks initiatives={districtInits} onNavigateTab={onNavigateTab} />

      {/* District Initiatives List */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-700" />
            <span>قائمة مبادرات شق ورصف الطرق بمديرية {districtName}</span>
          </h3>
          <button
            onClick={() => onNavigateTab('initiatives')}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            عرض التفاصيل الميدانية ←
          </button>
        </div>

        {districtInits.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500 font-bold">لا توجد مبادرات مسجلة حالياً لمديرية {districtName}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {districtInits.map((init) => (
              <div key={init.id} className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 truncate">{init.name}</span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    init.status === 'completed' ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {init.status === 'completed' ? 'مكتملة' : 'نشطة'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>نسبة الإنجاز: {init.completionRate}%</span>
                  <span>المستفيدون: {init.beneficiaries || 1200} مواطن</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
