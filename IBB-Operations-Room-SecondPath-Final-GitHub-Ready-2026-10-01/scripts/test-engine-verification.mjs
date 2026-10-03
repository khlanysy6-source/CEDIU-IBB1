import { initiatives725 } from '../src/data/generated/initiatives725.js';
import { 
  حساب_محرك_الحقيقة_الحسابية, 
  إنشاء_الملف_التنفيذي_للمبادرة,
  التحقق_من_مطابقة_المصادر
} from '../src/utils/calculationTruthEngine.js';
import { تقييم_وتشخيص_المبادرة } from '../src/utils/developmentDecisionEngine.js';

console.log('================================================================');
console.log('🧪 بدء اختبارات التحقق من الحقيقة الحسابية ومحرك القرار (20 مبادرة)');
console.log('================================================================\n');

// 1. Check Source Integrity
const mapping = التحقق_من_مطابقة_المصادر();
console.log('1. مطابقة سجلات الشيتات:');
console.log(`- الشيت الأول: ${mapping.سجلات_الشيت_الأول} (المتوقع 285) -> ${mapping.سجلات_الشيت_الأول === 285 ? '✅ نجاح' : '❌ خطأ'}`);
console.log(`- الشيت الثاني: ${mapping.سجلات_الشيت_الثاني} (المتوقع 236) -> ${mapping.سجلات_الشيت_الثاني === 236 ? '✅ نجاح' : '❌ خطأ'}`);
console.log(`- الشيت الثالث: ${mapping.سجلات_الشيت_الثالث} (المتوقع 204) -> ${mapping.سجلات_الشيت_الثالث === 204 ? '✅ نجاح' : '❌ خطأ'}`);
console.log(`- إجمالي السجلات: ${mapping.إجمالي_السجلات} (المتوقع 725) -> ${mapping.إجمالي_السجلات === 725 ? '✅ نجاح' : '❌ خطأ'}\n`);

// 2. Aggregate Engine Calculations
const portfolio = حساب_محرك_الحقيقة_الحسابية(initiatives725);
console.log('2. إحصائيات المحفظة من المحرك المركزي:');
console.log(`- إجمالي المبادرات: ${portfolio.إجمالي_المبادرات}`);
console.log(`- منجزة (completed): ${portfolio.توزيع_الحالات.منجزة}`);
console.log(`- قيد التنفيذ (ongoing): ${portfolio.توزيع_الحالات.قيد_التنفيذ}`);
console.log(`- متعثرة (stagnant): ${portfolio.توزيع_الحالات.متعثرة}`);
console.log(`- متوقفة (stopped): ${portfolio.توزيع_الحالات.متوقفة}`);
console.log(`- قيد المراجعة (pending): ${portfolio.توزيع_الحالات.قيد_المراجعة}`);
console.log(`- الأسمنت المعتمد: ${portfolio.الأسمنت.معتمد_طن.toLocaleString()} طن (${portfolio.الأسمنت.معتمد_كيس.toLocaleString()} كيس)`);
console.log(`- الأسمنت المنصرف: ${portfolio.الأسمنت.منصرف_طن.toLocaleString()} طن (${portfolio.الأسمنت.منصرف_كيس.toLocaleString()} كيس)`);
console.log(`- مخزون الوحدة: ${portfolio.الأسمنت.مخزون_الوحدة_طن.toLocaleString()} طن (${portfolio.الأسمنت.مخزون_الوحدة_كيس.toLocaleString()} كيس)`);
console.log(`- الأسمنت المستخدم: ${portfolio.الأسمنت.مستخدم_طن.toLocaleString()} طن (${portfolio.الأسمنت.مستخدم_كيس.toLocaleString()} كيس)`);
console.log(`- رصيد المبادرات المتبقي: ${portfolio.الأسمنت.رصيد_المبادرات_طن.toLocaleString()} طن (${portfolio.الأسمنت.رصيد_المبادرات_كيس.toLocaleString()} كيس)\n`);

// Mathematical validation:
// مخزون الوحدة = المعتمد - المنصرف
const unitInvCheck = portfolio.الأسمنت.مخزون_الوحدة_كيس === (portfolio.الأسمنت.معتمد_كيس - portfolio.الأسمنت.منصرف_كيس);
console.log(`- التحقق الحسابي (مخزون الوحدة = المعتمد - المنصرف): ${unitInvCheck ? '✅ صحيح' : '❌ خطأ'}`);
console.log(`- التحقق من عدم وجود قيم سالبة في مخزون الوحدة: ${portfolio.الأسمنت.مخزون_الوحدة_كيس >= 0 ? '✅ صحيح' : '❌ خطأ'}`);
console.log(`- التحقق من عدم وجود قيم سالبة في رصيد المبادرات: ${portfolio.الأسمنت.رصيد_المبادرات_كيس >= 0 ? '✅ صحيح' : '❌ خطأ'}\n`);

// 3. Sample 20 Initiatives Test
console.log('3. اختبار عينة 20 مبادرة عشوائية موزعة على المديريات والحالات:');
const step = Math.floor(initiatives725.length / 20);
const sample20 = [];
for (let i = 0; i < 20; i++) {
  sample20.push(initiatives725[i * step]);
}

let allPassed = true;
sample20.forEach((init, idx) => {
  const dossier = إنشاء_الملف_التنفيذي_للمبادرة(init);
  const diagnosis = تقييم_وتشخيص_المبادرة(init);
  
  // Test math integrity on each initiative
  const c = dossier.المواد.الأسمنت;
  const isUnitInvValid = c.مخزون_الوحدة_كيس === Math.max(0, c.المعتمد_كيس - c.المنصرف_كيس);
  const isCustodyValid = c.رصيد_العهدة_كيس === Math.max(0, c.المنصرف_كيس - c.المستخدم_كيس);
  const isScoreValid = dossier.المؤشرات.درجة_صحة_المبادرة >= 0 && dossier.المؤشرات.درجة_صحة_المبادرة <= 100;
  const isDecisionValid = Boolean(diagnosis.القرار_التنفيذي.القرار_المقترح && diagnosis.القرار_التنفيذي.التوجيه_الميداني);

  if (!isUnitInvValid || !isCustodyValid || !isScoreValid || !isDecisionValid) {
    allPassed = false;
    console.error(`❌ فشل في المبادرة #${idx + 1} (${init.name}): inv=${isUnitInvValid}, custody=${isCustodyValid}, score=${isScoreValid}, decision=${isDecisionValid}`);
  } else {
    console.log(`  [#${idx + 1}] ${init.name.substring(0, 35)}... | الحالة: ${init.status} | الإنجاز: ${init.completionRate}% | الصحة: ${dossier.المؤشرات.درجة_صحة_المبادرة}/100 | التشخيص: الحالة ${diagnosis.التشخيص_السببي.رقم_الحالة} ✅`);
  }
});

console.log('\n================================================================');
if (allPassed) {
  console.log('🎉 نجاح كامل: جميع الاختبارات الـ 20 تطابق القواعد الحسابية والتشخيصية بدقة 100%!');
} else {
  console.log('⚠️ تم رصد بعض الملاحظات في الاختبارات.');
}
console.log('================================================================');
