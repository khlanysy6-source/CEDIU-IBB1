# وثيقة بنية أمان الصلاحيات والمصفوفة الأمنية (RBAC V2 Architecture)

تحدد هذه الوثيقة المعمارية الهيكل الموحد لإدارة الهوية والصلاحيات (Authentication & Authorization Layer) لمنصة المبادرات المجتمعية والقيادة التنموية بمحافظة إب.

---

## 1. نموذج التدفق المعماري للأمان (Security Architecture Pipeline)

تنتقل جميع الطلبات والتأكيدات الأمنية في المنصة عبر التسلسل الهرمي الصارم التالي:

```text
Firebase Authentication (من هو المستخدم؟)
       ↓
Authenticated Identity (الهوية الموثقة والمطابقة)
       ↓
Role Resolver (تحديد الدور الأمني من Claims / Profile / Bootstrap)
       ↓
Data Scope (نطاق البيانات الجغرافي والمؤسسي المصرح به)
       ↓
Permission Resolver (مطابقة الفعل المطلوب بحزم الصلاحيات)
       ↓
UI Access (إظهار الواجهات وإتاحة الأزرار التشغيلية)
```

---

## 2. جدول الأدوار السبعة ونطاقات البيانات (The 7 Role Models & Data Scopes)

تعتمد المنصة 7 أدوار محددة بالكامل دون تغيير المسميات الحالية:

| اسم الدور (UserRole) | الوصف والمسمى الوظيفي | نطاق البيانات (Data Scope) | صلاحيات التنفيذ |
| :--- | :--- | :--- | :--- |
| `admin` | وحدة التدخلات - مشرف النظام | كامل البيانات (`all`) | صلاحيات شمولية كاملة لإدارة المنصة والإعدادات |
| `central_unit` | وحدة التدخلات التنموية المركزية بمحافظة إب | النطاق المركزي للمحافظة (`central_unit`) | اعتماد المبادرات، تخصيص الدعم، تصنيف الحالات والمناقلات |
| `governorate` | المحافظة والقيادة التنفيذية | نطاق المحافظة (`governorate`) | الاطلاع القيادي الشامل والتقارير التنفيذية دون التعديل |
| `district_director` | السلطة المحلية بالمديرية | نطاق المديرية فقط (`district`) | رفع احتياجات المديرية ومتابعة المبادرات بمديريته |
| `cooperative_association` | الجمعية التعاونية بالمديرية | نطاق الجمعية والمديرية (`association`) | توثيق المبادرات والمساهمات والمستندات المحلية |
| `engineer_inspector` | المهندس والمراقب الفني الميداني | نطاق المديريات والمبادرات المعين عليها (`engineer`) | رفع وتوثيق تقارير المعاينة الفنية والزيارات الميدانية |
| `visitor` | الزائر والمتابع العام | نطاق العرض العام للقراءة فقط (`public`) | القراءة والعرض العام دون أي أزرار أو صلاحيات تعديل |

---

## 3. الربط العضوي بين العناصر (User → Role → Scope → Permission)

1. **المستخدم (User)**: يتم التحقق من هويته عبر **Firebase Authentication**.
2. **الدور (Role)**: يتم استخلاصه مركزياً من خلال `resolveUserRole()` استناداً إلى:
   - Firebase Custom Claims (`request.auth.token.role`).
   - ملف المستخدم الموثق بالفرز الميداني.
   - طبقة الإمداد التأسيسية للمدير الأول (`adminBootstrap.ts`).
3. **النطاق (Data Scope)**: يحدد حدود الرؤية والاستعلام الجغرافي والمؤسسي للمستخدم:
   - `governorate`: اسم المحافظة (مثل: "إب").
   - `district`: اسم المديرية (مثل: "مديرية ذي السفال").
   - `assignedDistricts` / `assignedInitiativeIds`: قائمة التكليفات الهندسية الميدانية.
4. **الصلاحيات (Permissions)**: يتم البت فيها مركزياً عبر `permissionService.ts` باختبار استحقاق الفعل للنطاق الجغرافي المحدد قبل التنفيذ.

---

## 4. نموذج قواعد أمان البيانات في السحابة (Firestore Rules V2 Blueprint)

لتأمين قواعد بيانات Firestore في المراحل القادمة دون إحداث قطوعات تشغيلية حالياً، تم إعداد بنية الدوال المساعدة التالية لقواعد `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Global Safety Helpers
    function isSignedIn() {
      return request.auth != null;
    }

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function getUserRole() {
      return isSignedIn() ? (
        request.auth.token.role != null ? request.auth.token.role : getUserData().role
      ) : 'visitor';
    }

    function isAdmin() {
      return getUserRole() == 'admin' || (request.auth != null && request.auth.token.email == 'eesaalqadri25@gmail.com');
    }

    function isCentralUnit() {
      return getUserRole() == 'central_unit' || isAdmin();
    }

    function isDistrictDirector(district) {
      return getUserRole() == 'district_director' && (getUserData().district == district);
    }

    function isAssociation(district) {
      return getUserRole() == 'cooperative_association' && (getUserData().district == district);
    }

    // Temporary Open Read/Write Gate for Compatibility
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 5. تحليل الفجوة الأمنية الحالية (Security Gap Analysis)

- **الفجوة الحالية**: قواعد Firestore الحالية تتيح القراءة والكتابة المفتوحة (`allow read, write: if true`) لضمان عدم توقف المزامنة الميدانية والتطبيق أثناء العمل السريع.
- **سبب الإبقاء المؤقت**: لمنع حدوث أخطاء "Missing or Insufficient Permissions" أثناء اختبار واستكمال الانتقال لطبقة الربط الموحدة `AuthContext`.
- **خطوات المعالجة المستقبلية**:
  1. نشر Custom Claims لكافة الحسابات الميدانية المعتمدة عبر Firebase Admin SDK.
  2. إنشاء وثائق المستخدمين بجدول `/users/{userId}`.
  3. تطبيق القواعد المحصنة المذكورة أعلاه في `firestore.rules`.
