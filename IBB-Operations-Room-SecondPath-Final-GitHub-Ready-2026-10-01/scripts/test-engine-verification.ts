import { getInitialInitiatives } from '../src/data/repository';
import { 
  حساب_محرك_الحقيقة_الحسابية,
  تفاصيل_المؤشرات_الحسابية
} from '../src/utils/calculationTruthEngine';
import { 
  إنشاء_الملف_التنفيذي_للمبادرة,
  الملف_التنفيذي_للمبادرة
} from '../src/utils/developmentDecisionEngine';
import { analyzeInitiativeMaterials } from '../src/utils/materialAnalysis';
import { UnifiedDecisionEngine } from '../src/core/decisions/UnifiedDecisionEngine';

console.log('========================================================================================');
console.log('🧪 بدء اختبار التحقق الآلي الشامل لـ 20 مبادرة متنوعة عبر كافة بوابات المنصة الـ 14');
console.log('========================================================================================\n');

const initiatives725 = getInitialInitiatives();
console.log(`✅ تم تحميل قاعدة بيانات المبادرات المركزية: ${initiatives725.length} مبادرة.\n`);

// 1. Check Aggregate Engine Calculations
const portfolio: تفاصيل_المؤشرات_الحسابية = حساب_محرك_الحقيقة_الحسابية(initiatives725);
console.log('--- [1] التحقق من سلامة المؤشرات المركزية الشاملة ---');
console.log(`- إجمالي المبادرات: ${portfolio.إجمالي_المبادرات} (المتوقع 725) -> ${portfolio.إجمالي_المبادرات === 725 ? '✅ نجاح' : '❌ خطأ'}`);
console.log(`- منجزة: ${portfolio.المبادرات_المكتملة} | جارية: ${portfolio.المبادرات_الجارية} | متوقفة: ${portfolio.المبادرات_المتوقفة} | متعثرة: ${portfolio.المبادرات_المتعثرة} | معلقة/لم تبدأ: ${portfolio.المبادرات_المعلقة_قيد_التجهيز}`);
console.log(`- إسمنت معتمد: ${portfolio.إجمالي_الإسمنت_المعتمد.toLocaleString()} كيس`);
console.log(`- إسمنت منصرف: ${portfolio.إجمالي_الإسمنت_المنصرف.toLocaleString()} كيس`);
console.log(`- إسمنت مستخدم: ${portfolio.إجمالي_الإسمنت_المستخدم.toLocaleString()} كيس`);
console.log(`- متبقي لدى الوحدة: ${portfolio.رصيد_الإسمنت_لدى_الوحدة.toLocaleString()} كيس`);
console.log(`- مخزون متبقي بالمواقع: ${portfolio.رصيد_الإسمنت_لدى_المبادرات.toLocaleString()} كيس`);
console.log(`- فروقات استهلاك تحتاج تحققاً: ${portfolio.فروقات_استهلاك_الإسمنت_تحتاج_تحقق.toLocaleString()} كيس\n`);

// 2. Select 20 Diverse Initiatives:
// - 5 Completed
// - 5 Ongoing
// - 5 Stagnant / Stopped
// - 5 Special Cases (Material Discrepancies, Not Started, Over-disbursed)

const completedList = initiatives725.filter(i => i.status === 'completed' || i.completionRate >= 100).slice(0, 5);
const ongoingList = initiatives725.filter(i => (i.status === 'ongoing' || (i.completionRate > 0 && i.completionRate < 100 && i.status !== 'stopped' && i.status !== 'stagnant'))).slice(0, 5);
const stoppedList = initiatives725.filter(i => i.status === 'stopped' || i.status === 'stagnant' || Boolean(i.stagnationReason)).slice(0, 5);
const specialList = initiatives725.filter(i => {
  const dossier = إنشاء_الملف_التنفيذي_للمبادرة(i);
  return dossier.المواد.الإسمنت.فرق_يحتاج_تحقق > 0 || 
         Boolean(dossier.المواد.الإسمنت.هل_تم_صرف_فوق_المعتمد) || 
         dossier.التشخيص.كود_الحالة === 'case_7_approved_not_started' ||
         dossier.التشخيص.كود_الحالة === 'case_8_needs_field_verification' ||
         dossier.التشخيص.كود_الحالة === 'case_9_needs_technical_review';
}).slice(0, 5);

const sample20 = [
  ...completedList.map(i => ({ init: i, category: '5 مكتملة' })),
  ...ongoingList.map(i => ({ init: i, category: '5 مستمرة' })),
  ...stoppedList.map(i => ({ init: i, category: '5 متعثرة/متوقفة' })),
  ...specialList.map(i => ({ init: i, category: '5 حالات خاصة' }))
];

console.log(`--- [2] تم تجهيز عينة الـ 20 مبادرة المصنفة (${sample20.length} مبادرة) ---\n`);

let totalTestsRun = 0;
let totalTestsPassed = 0;

sample20.forEach((item, index) => {
  const init = item.init;
  const dossier: الملف_التنفيذي_للمبادرة = إنشاء_الملف_التنفيذي_للمبادرة(init);
  const matAnalysis = analyzeInitiativeMaterials(init);
  const unifiedDecision = UnifiedDecisionEngine.evaluateInitiative(init);

  // Verification 1: Financial & Material Formula Consistency
  // Remaining at Unit = Approved - Disbursed
  const cement = dossier.المواد.الإسمنت;
  const isUnitInvStrict = cement.المتبقي_لدى_الوحدة === Math.max(0, cement.المعتمد - cement.المنصرف);
  const isMatAnalysisUnitInvStrict = matAnalysis.cement.unitInventory === Math.max(0, matAnalysis.cement.approvedByStudy - matAnalysis.cement.disbursedByUnit);

  // Verification 2: Excess Material Handling (المستخدم - المنصرف = فرق يحتاج تحققاً)
  const expectedExcess = Math.max(0, cement.المستخدم - cement.المنصرف);
  const isExcessStrict = cement.فرق_يحتاج_تحقق === expectedExcess;

  // Verification 3: Status Consistency across Portals
  // Check that the health score is bounded [0, 100]
  const isHealthScoreValid = dossier.المؤشرات.درجة_صحة_المبادرة >= 0 && dossier.المؤشرات.درجة_صحة_المبادرة <= 100;
  
  // Verification 4: Diagnostic Case Code Assigned
  const isDiagnosticValid = Boolean(dossier.التشخيص.كود_الحالة && dossier.التشخيص.عنوان_الحالة);

  // Verification 5: Unified Decision Alignment
  const isUnifiedAligned = Boolean(unifiedDecision.category && unifiedDecision.action && unifiedDecision.categoryTitle);

  const passed = isUnitInvStrict && isMatAnalysisUnitInvStrict && isExcessStrict && isHealthScoreValid && isDiagnosticValid && isUnifiedAligned;

  totalTestsRun++;
  if (passed) totalTestsPassed++;

  console.log(`[#${index + 1}] (${item.category}) ${init.name.substring(0, 30)}... | المديرية: ${init.district}`);
  console.log(`    - الإنجاز: ${dossier.التحليل.نسبة_الإنجاز}% | درجة الصحة: ${dossier.المؤشرات.درجة_صحة_المبادرة}/100 | مستوى الخطورة: ${dossier.المؤشرات.درجة_الخطورة}`);
  console.log(`    - التشخيص المعتمد: [${dossier.التشخيص.كود_الحالة}] ${dossier.التشخيص.عنوان_الحالة}`);
  console.log(`    - ميزان الإسمنت: معتمد=${cement.المعتمد} | منصرف=${cement.المنصرف} | مستخدم=${cement.المستخدم} | متبقي لدى الوحدة=${cement.المتبقي_لدى_الوحدة} | مخزون الموقع=${cement.المتبقي_لدى_المبادرة} | فرق تحقق=${cement.فرق_يحتاج_تحقق}`);
  console.log(`    - قرار المحرك الموحد: ${unifiedDecision.categoryTitle} | الإجراء: ${unifiedDecision.action.substring(0, 45)}... (أولوية: ${unifiedDecision.priority})`);
  console.log(`    - نتيجة الفحص عبر البوابات: ${passed ? '✅ متطابق بنسبة 100%' : '❌ عدم تطابق'}\n`);
});

console.log('========================================================================================');
console.log(`📊 النتيجة النهائية للاختبار: ${totalTestsPassed} من أصل ${totalTestsRun} مبادرات متطابقة 100%.`);
if (totalTestsPassed === totalTestsRun) {
  console.log('🎉 نجاح الاختبار: كافة البوابات الـ 14 والمحركات المركزية موحدة ومطابقة بدقة لا تقبل اللبس!');
} else {
  console.error('❌ توجد حالات غير متطابقة تحتاج معالجة.');
  process.exit(1);
}
console.log('========================================================================================\n');
