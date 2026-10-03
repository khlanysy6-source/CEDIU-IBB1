/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../../../security/AuthContext';
import { AuthorizationService } from '../../../core/auth/AuthorizationService';
import { RoleService } from '../../../core/auth/RoleService';
import { getRoleDashboardConfig } from './RoleDashboardConfig';
import { Building, MapPin, User, ShieldCheck, Sparkles, Award } from 'lucide-react';

export interface WelcomeHeaderProps {
  customMessage?: string;
  customTitle?: string;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ customMessage, customTitle }) => {
  const { currentUser, userProfile, effectiveRole } = useAuth();
  const eRole = RoleService.toEnterpriseRole(effectiveRole);
  const config = getRoleDashboardConfig(eRole);

  const scope = AuthorizationService.resolveDataScope(eRole, userProfile, currentUser);

  const userName = userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'المسؤول المحترم';
  const roleLabel = userProfile?.organization || config.dashboardTitle;
  
  // Format Organization
  let orgName = 'وحدة التدخلات المركزية التنموية الطارئة';
  if (userProfile?.organization) {
    orgName = userProfile.organization;
  } else if (scope.organizationType === 'LOCAL_AUTHORITY') {
    orgName = 'السلطة المحلية بمحافظة إب';
  } else if (scope.organizationType === 'COOPERATIVE_SOCIETY') {
    orgName = scope.organization || 'الجمعية التعاونية للتنمية';
  } else if (scope.organizationType === 'FIELD_TEAMS') {
    orgName = 'فرسان الهندسة والتنمية الميدانية';
  }

  // Format Geographic Scope
  let scopeLabel = 'كافة المحافظات والمديريات (نطاق سيادي)';
  if (scope.type === 'governorate') {
    scopeLabel = `نطاق ${scope.governorate || 'محافظة إب'}`;
  } else if (scope.type === 'district') {
    scopeLabel = scope.district ? `${scope.district}` : 'نطاق المديرية المسندة';
  } else if (scope.type === 'association') {
    scopeLabel = `نطاق ${scope.organization || 'الجمعية التعاونية'} - ${scope.district || 'محافظة إب'}`;
  } else if (scope.type === 'engineer') {
    if (scope.assignedDistricts && scope.assignedDistricts.length > 0) {
      scopeLabel = `المديريات المسندة: ${scope.assignedDistricts.join('، ')}`;
    } else {
      scopeLabel = 'المبادرات والمهام المسندة ميدانياً';
    }
  } else if (scope.type === 'public') {
    scopeLabel = 'بوابة أثر الشفافية العامة للجمهور';
  }

  const welcomeMsg = customMessage || (
    eRole === 'DISTRICT_MANAGER' && scope.district
      ? `أهلاً بكم في بوابة ${scope.district}`
      : config.welcomeMessage
  );

  return (
    <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-500/30 animate-fadeIn mb-6">
      {/* Background Decorative Pattern */}
      <div className="absolute left-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute right-0 bottom-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none translate-x-1/3 translate-y-1/3"></div>

      <div className="relative z-10 space-y-5">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              منظومة القيادة الذكية • Executive Layer
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              نطاق موثق ورسمي
            </span>
          </div>

          <div className="text-xs text-slate-300 font-mono bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60">
            {new Date().toLocaleDateString('ar-YE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Main Personal Welcome Message */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight flex flex-wrap items-center gap-2">
            <span>مرحباً الأستاذ/</span>
            <span className="text-amber-300 underline underline-offset-8 decoration-emerald-500">{userName}</span>
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 font-bold leading-relaxed">
            {welcomeMsg}
          </p>
        </div>

        {/* Identity & Scope Chips Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          {/* Position / Title */}
          <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl backdrop-blur-xs">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="block text-[10px] text-slate-400 font-medium">المنصب والواجهة:</span>
              <span className="block text-xs font-black text-amber-200 truncate">{customTitle || config.dashboardTitle}</span>
            </div>
          </div>

          {/* Organization / Entity */}
          <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl backdrop-blur-xs">
            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="block text-[10px] text-slate-400 font-medium">الجهة المؤسسية:</span>
              <span className="block text-xs font-black text-slate-100 truncate">{orgName}</span>
            </div>
          </div>

          {/* Scope */}
          <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl backdrop-blur-xs">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="block text-[10px] text-slate-400 font-medium">النطاق المسموح:</span>
              <span className="block text-xs font-black text-emerald-300 truncate">{scopeLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SmartWelcome = WelcomeHeader;
