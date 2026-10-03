# منصة مبادرات الطرق — حزمة التسليم

هذه الحزمة هي نسخة GitHub/Google AI Studio المنظمة. لم يتم استبدال المشروع الأصلي؛ تمت المحافظة على البوابات والمحركات القائمة وإعادة ترتيبها وظيفيًا حول سجل المبادرة.

## نقطة الدخول
`src/App.tsx`

## نموذج التشغيل
`src/navigation/operatingModel.ts`

## النماذج
`src/forms/formRegistry.ts`
`src/forms/formDataResolver.ts`
`public/templates/second-path-master-template.xlsx`

## البيانات
`src/data/generated/initiatives725.ts` — السجل المرجعي.
`src/data/materialLedgers.ts` — حركة الأسمنت والديزل.
`public/data/ibb-road-tracks.json` — المسارات الرسمية المنظفة.
`public/data/ibb-governorate-boundary.json` — حدود المحافظة.

## دورة العمل
السجل → التشخيص → الجاهزية → القرار → الاحتياج → التنفيذ والمتابعة → الإنجاز → الاستلام → الأرشيف → التقارير.

## ضابط البيانات
القيم غير الموجودة لا يتم اختلاقها. حركة المواد تبقى كمعاملات مستقلة مرتبطة بالمبادرة. القوالب الأصلية تُستخدم كأساس للتعبئة والتصدير.

## فحوصات ما قبل التسليم
- `npm run validate:data`
- `npm run validate:forms`
- `node scripts/validate-material-ledgers.mjs`
- `node scripts/validate-release.mjs`
- `npm run lint`
- `npm run build`

آخر فحصين يحتاجان بيئة Node مع `node_modules` مكتملة؛ لم يتم الادعاء بنجاحهما إذا تعذر تثبيت الاعتماديات.
