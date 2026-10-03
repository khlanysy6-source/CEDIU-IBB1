/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Initiative } from '../../../../types';
import { SmartWelcome } from '../WelcomeHeader';
import { MyTasks } from '../MyTasks';
import { Pencil, Upload, Camera, Table, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

export interface ViewProps {
  initiatives: Initiative[];
  onNavigateTab: (tab: string) => void;
  onSelectInitiative?: (id: string) => void;
}

export const FieldEngineerLanding: React.FC<ViewProps> = ({ initiatives, onNavigateTab }) => {
  return (
    <div className="space-y-6 animate-fadeIn" id="field-engineer-landing">
      {/* Smart Welcome Banner */}
      <SmartWelcome customTitle="فرسان الهندسة الميدانية والمتابعة" />

      {/* Field Workspace Header */}
      <div className="bg-gradient-to-r from-orange-950 via-slate-900 to-orange-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md border border-orange-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/20 rounded-xl text-orange-300">
            <Pencil className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">مساحة التنفيذ والرفع الميداني • Field Workspace</h2>
            <p className="text-xs text-orange-200/80 font-medium">تسجيل كميات الإنجاز اليومية، أكياس الأسمنت والديزل، الملاحظات والصور</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('field_staging')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>رفع تقرير اليوم من الموقع 📸</span>
          </button>
          <button
            onClick={() => onNavigateTab('matrix')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5"
          >
            <Table className="w-4 h-4 text-orange-400" />
            <span>مصفوفة الكميات والأسمنت</span>
          </button>
        </div>
      </div>

      {/* My Field Tasks */}
      <MyTasks initiatives={initiatives} onNavigateTab={onNavigateTab} />

      {/* Field Actions Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigateTab('field_staging')}
          className="bg-white border border-slate-200 p-5 rounded-3xl hover:border-orange-400 transition-all text-right space-y-2 shadow-2xs group cursor-pointer"
        >
          <div className="p-2.5 bg-orange-100 text-orange-800 rounded-2xl w-fit group-hover:scale-105 transition-transform">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-900">تسجيل وتوثيق بالصور الميدانية</h3>
          <p className="text-xs text-slate-500">رفع صور الرصف واختبار الصب مباشرة من موقع المبادرة</p>
        </button>

        <button
          onClick={() => onNavigateTab('matrix')}
          className="bg-white border border-slate-200 p-5 rounded-3xl hover:border-orange-400 transition-all text-right space-y-2 shadow-2xs group cursor-pointer"
        >
          <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-2xl w-fit group-hover:scale-105 transition-transform">
            <Table className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-900">تحديث كميات الأسمنت والديزل</h3>
          <p className="text-xs text-slate-500">خصم الأكياس المستخدمة والواردة للموقع بدقة</p>
        </button>

        <button
          onClick={() => onNavigateTab('engineers_portal')}
          className="bg-white border border-slate-200 p-5 rounded-3xl hover:border-orange-400 transition-all text-right space-y-2 shadow-2xs group cursor-pointer"
        >
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl w-fit group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-900">استمارة الفحص الهندسي</h3>
          <p className="text-xs text-slate-500">تدقيق واستلام الصبية الخرسانية ورصف الأحجار</p>
        </button>
      </div>
    </div>
  );
};
