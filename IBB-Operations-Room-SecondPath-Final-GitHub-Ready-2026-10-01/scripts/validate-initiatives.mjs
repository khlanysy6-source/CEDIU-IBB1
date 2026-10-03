/**
 * Independent Validation Script for 725 Road Community Initiatives
 * Runs as part of CI / Data Validation Pipeline: npm run validate:data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const REQUIRED_FIELDS = [
  'id',
  'initiativeNumber',
  'name',
  'district',
  'subDistrict',
  'village',
  'governorate',
  'status',
  'completionRate',
  'cost',
  'communityContribution',
  'unitContribution',
  'ownerConfirmed',
  'pathways',
  'contributions',
  'committee',
  'reports',
  'materials',
  'createdAt',
  'updatedAt'
];

const VALID_STATUSES = ['pending', 'ongoing', 'stagnant', 'completed', 'stopped'];

async function runValidation() {
  console.log('=====================================================');
  console.log('🔍 تدقيق وفحص سلامة بيانات مبادرات الطرق بمحافظة إب');
  console.log('=====================================================');

  const generatedFile = path.join(rootDir, 'src', 'data', 'generated', 'initiatives725.ts');
  if (!fs.existsSync(generatedFile)) {
    console.error(`❌ خطأ حرج: ملف البيانات المولد غير موجود في ${generatedFile}`);
    process.exit(1);
  }

  const content = fs.readFileSync(generatedFile, 'utf8');
  // Extract JSON payload safely from typescript file
  const jsonMatch = content.match(/export const generatedInitiatives:\s*Initiative\[\]\s*=\s*(\[[\s\S]*\]);/);
  if (!jsonMatch) {
    console.error('❌ خطأ: تعذر استخراج مصفوفة المبادرات من ملف TypeScript.');
    process.exit(1);
  }

  let dataset;
  try {
    dataset = JSON.parse(jsonMatch[1]);
  } catch (err) {
    console.error('❌ خطأ في بناء جملة JSON لمصفوفة المبادرات:', err.message);
    process.exit(1);
  }

  const total = dataset.length;
  console.log(`📊 إجمالي السجلات المفحوصة: ${total} سجل`);

  const errors = [];
  const warnings = [];
  const stats = {
    completed: 0,
    ongoing: 0,
    stagnant: 0,
    stopped: 0,
    pending: 0,
    totalCost: 0,
    totalCommunity: 0,
    totalUnit: 0
  };

  const seenIds = new Set();
  const seenNumbers = new Set();
  const districtCounts = {};

  if (total !== 725) {
    errors.push(`إجمالي عدد المبادرات (${total}) لا يطابق العدد المعتمد رسمياً (725 مبادرة).`);
  }

  dataset.forEach((item, idx) => {
    const row = idx + 1;
    if (!item) {
      errors.push(`السجل رقم ${row} فارغ.`);
      return;
    }

    // ID uniqueness
    if (!item.id) {
      errors.push(`السجل رقم ${row} يفتقد للمعرف (id).`);
    } else if (seenIds.has(item.id)) {
      errors.push(`معرف السجل ${item.id} مكرر في السجل رقم ${row}.`);
    } else {
      seenIds.add(item.id);
    }

    // Number uniqueness
    if (!item.initiativeNumber) {
      errors.push(`السجل رقم ${row} يفتقد لرقم المبادرة.`);
    } else if (seenNumbers.has(String(item.initiativeNumber))) {
      warnings.push(`رقم المبادرة ${item.initiativeNumber} مكرر في السجل رقم ${row}.`);
    } else {
      seenNumbers.add(String(item.initiativeNumber));
    }

    // Required fields check
    for (const field of REQUIRED_FIELDS) {
      if (item[field] === undefined || item[field] === null) {
        errors.push(`السجل رقم ${row} (${item.id}) يفتقد للحقل '${field}'.`);
      }
    }

    // Status check
    if (!VALID_STATUSES.includes(item.status)) {
      errors.push(`السجل رقم ${row} يحمل حالة غير معتمدة: '${item.status}'.`);
    } else {
      stats[item.status]++;
    }

    // Completion rate check
    if (typeof item.completionRate !== 'number' || item.completionRate < 0 || item.completionRate > 100) {
      warnings.push(`السجل رقم ${row} نسبة الإنجاز خارج نطاق 0–100 كما وردت في المصدر: ${item.completionRate}% (تم الحفاظ على القيمة الخام ولم تُعدّل).`);
    }

    // Financial non-negative check
    if (item.cost < 0 || item.communityContribution < 0 || item.unitContribution < 0) {
      errors.push(`السجل رقم ${row} يحتوي على قيم مالية سالبة.`);
    } else {
      stats.totalCost += (item.cost || 0);
      stats.totalCommunity += (item.communityContribution || 0);
      stats.totalUnit += (item.unitContribution || 0);
    }

    // District accumulation
    const dist = item.district || 'غير محدد';
    districtCounts[dist] = (districtCounts[dist] || 0) + 1;
  });

  console.log('\n---------------- تفصيل الحالات التشغيلية ----------------');
  console.log(`✅ المبادرات المنجزة (Completed):  ${stats.completed}`);
  console.log(`🔄 المبادرات المستمرة (Ongoing):    ${stats.ongoing}`);
  console.log(`⚠️ المبادرات المتعثرة (Stagnant):   ${stats.stagnant}`);
  console.log(`🛑 المبادرات المتوقفة (Stopped):    ${stats.stopped}`);
  console.log(`⏳ المبادرات قيد الدراسة (Pending): ${stats.pending}`);
  console.log('---------------------------------------------------------');
  console.log(`💰 التكلفة الإجمالية التقديرية:   ${stats.totalCost.toLocaleString()} ريال`);
  console.log(`🤝 إجمالي المساهمات المجتمعية:   ${stats.totalCommunity.toLocaleString()} ريال`);
  console.log(`🏢 إجمالي مساهمة وحدة التدخلات:  ${stats.totalUnit.toLocaleString()} ريال`);
  console.log(`📍 عدد المديريات المغطاة:       ${Object.keys(districtCounts).length} مديرية`);
  console.log('---------------------------------------------------------');

  if (warnings.length > 0) {
    console.log(`\n⚠️ ملاحظات وتنبيهات (${warnings.length}):`);
    warnings.slice(0, 5).forEach(w => console.log(` - ${w}`));
    if (warnings.length > 5) console.log(` ... و ${warnings.length - 5} تنبيهات أخرى.`);
  }

  if (errors.length > 0) {
    console.error(`\n❌ فشل التدقيق! تم العثور على ${errors.length} أخطاء:`);
    errors.slice(0, 10).forEach(e => console.error(` ❌ ${e}`));
    if (errors.length > 10) console.error(` ... و ${errors.length - 10} أخطاء أخرى.`);
    process.exit(1);
  }

  console.log('\n🎉 اكتمل الفحص بنجاح تام: كافة السجلات الـ 725 مطابقة للمعايير المؤسسية!');
  process.exit(0);
}

runValidation();
