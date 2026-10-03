/**
 * Officials Excel Import Modal
 * Handles batch importing and updating of official profiles and authorities.
 */

import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import * as XLSX from 'xlsx';
import { OfficialProfile, saveStoredOfficials, saveImportLog } from '../data/officialsRegistry';

interface OfficialsExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOfficials: OfficialProfile[];
  onImportCompleted: (updatedList: OfficialProfile[], summary: string) => void;
}

export default function OfficialsExcelImportModal({
  isOpen,
  onClose,
  currentOfficials,
  onImportCompleted
}: OfficialsExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
    }
  };

  const handleProcessImport = async () => {
    if (!file) {
      setError('يرجى اختيار ملف إكسل أولاً.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

      if (rows.length === 0) {
        throw new Error('الملف فارغ أو لا يحتوي على صفوف بيانات صالحة.');
      }

      let added = 0;
      let updated = 0;
      const officialMap = new Map<string, OfficialProfile>();
      currentOfficials.forEach(o => officialMap.set(o.id, o));

      rows.forEach((row, idx) => {
        const fullName = String(row['الاسم'] || row['الاسم الكامل'] || row['fullName'] || '').trim();
        const phone = String(row['الهاتف'] || row['رقم الهاتف'] || row['phone'] || '').replace(/[^0-9]/g, '');
        const jobTitle = String(row['المنصب'] || row['الصفة'] || row['الوظيفة'] || row['jobTitle'] || 'مسؤول ميداني').trim();
        const district = String(row['المديرية'] || row['district'] || 'محافظة إب').trim();
        const role = String(row['الدور'] || row['role'] || jobTitle).trim();

        if (!fullName) return;

        // Check if official exists by phone
        let existingId: string | null = null;
        for (const [id, off] of officialMap.entries()) {
          if (phone && off.phone.replace(/[^0-9]/g, '') === phone) {
            existingId = id;
            break;
          }
        }

        if (existingId) {
          const prev = officialMap.get(existingId)!;
          officialMap.set(existingId, {
            ...prev,
            fullName,
            jobTitle,
            district,
            role
          });
          updated++;
        } else {
          const newId = `off_imp_${Date.now()}_${idx}`;
          officialMap.set(newId, {
            id: newId,
            fullName,
            phone: phone || '000000000',
            jobTitle,
            organization: 'السلطة المحلية / وحدة التدخلات',
            governorate: 'محافظة إب',
            district,
            role,
            permissionLevel: 'field',
            accountStatus: 'linked_active'
          });
          added++;
        }
      });

      const updatedList = Array.from(officialMap.values());
      saveStoredOfficials(updatedList);

      const summary = `تمت معالجة الملف بنجاح: تم إضافة (${added}) مسؤول جديد وتحديث بيانات (${updated}) مسؤول.`;

      saveImportLog({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        sourceName: file.name,
        importedCount: added,
        updatedCount: updated,
        status: 'success',
        summary
      });

      onImportCompleted(updatedList, summary);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء معالجة ملف الإكسل.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn" dir="rtl">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-sm sm:text-base">استيراد وتحديث سجل المسؤولين من Excel</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors">
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 mb-1">
              {file ? file.name : 'اسحب ملف الإكسل (.xlsx) إلى هنا أو اضغط للاختيار'}
            </p>
            <p className="text-[10px] text-slate-400">
              يجب أن يتضمن الأعمدة: الاسم، رقم الهاتف، المنصب، المديرية
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-officials-input"
            />
            <label
              htmlFor="excel-officials-input"
              className="mt-3 inline-block px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl cursor-pointer transition-colors"
            >
              استعراض الملفات
            </label>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] font-bold text-amber-800 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              قاعدة الموثوقية: يتم ربط البيانات تلقائياً بالهواتف لمنع التكرار، والمسؤولون المحدثون يحفظون في السجل المحلي المعتمد.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={!file || isProcessing}
              onClick={handleProcessImport}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
            >
              {isProcessing ? 'جاري المعالجة والتحقق...' : 'بدء الاستيراد والدمج'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
