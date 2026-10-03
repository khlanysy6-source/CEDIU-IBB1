import { Initiative } from '../types';

interface PresentationStats {
  total: number;
  completed: number;
  ongoing: number;
  pending: number;
  stagnant: number;
  stopped: number;
  completedPct: number;
  ongoingPct: number;
  pendingPct: number;
  stagnantPct: number;
  stoppedPct: number;
  totalContributionsValue: number;
  cashValue: number;
  materialValue: number;
  laborValue: number;
}

export function generateOfflinePresentationHTML(initiatives: Initiative[], stats: PresentationStats): string {
  const {
    total,
    completed,
    ongoing,
    pending,
    stagnant,
    stopped,
    completedPct,
    ongoingPct,
    pendingPct,
    stagnantPct,
    stoppedPct,
    totalContributionsValue,
    cashValue,
    materialValue,
    laborValue
  } = stats;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>العرض التقديمي لورشة العمل التدريبية - كافة مديريات محافظة إب 🇾🇪</title>
  <!-- Load Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Cairo', 'Inter', system-ui, -apple-system, sans-serif;
    }
    .slide-content {
      display: none;
    }
    .slide-content.active {
      display: block;
      animation: fadeIn 0.35s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    /* Hide scrollbars */
    .scrollbar-none::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-none {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    /* Quiet mode styles */
    body.quiet-mode .detailed-info {
      display: none !important;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      .print-page {
        page-break-after: always;
        display: block !important;
      }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col justify-between">

  <!-- HEADER -->
  <header class="bg-slate-900 text-white py-4 px-6 shadow-md border-b border-slate-800 no-print flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
      </div>
      <div class="text-right">
        <h1 class="font-extrabold text-sm sm:text-base">العرض التقديمي لورشة العمل التدريبية (مستقل - أوفلاين)</h1>
        <p class="text-[11px] text-slate-400">تفعيل المبادرات وإدارتها بالنتائج - كافة مديريات محافظة إب 🇾🇪 (تشغيل أوفلاين)</p>
      </div>
    </div>
    
    <div class="flex items-center gap-2 flex-wrap">
      <!-- Quiet Mode offline button -->
      <button onclick="toggleQuietMode()" id="offlineQuietModeToggleBtn" class="text-xs font-black px-3.5 py-1.5 rounded-lg border bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100 flex items-center gap-1.5 shadow-3xs cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
        <span id="quiet-mode-text">طي الشرح والتفاصيل (العرض الواضح) 📂</span>
      </button>

      <button onclick="toggleInstructorMode()" id="instructorToggleBtn" class="text-xs font-black px-3.5 py-1.5 rounded-lg border bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 flex items-center gap-1.5 shadow-3xs cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm0 0v6" /></svg>
        <span>تفعيل وضع التدريب 🎓</span>
      </button>
      
      <button onclick="window.print()" class="text-xs font-black px-3.5 py-1.5 rounded-lg border bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5 shadow-3xs cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
        <span>تصدير للطباعة (أوفلاين) 📖</span>
      </button>
    </div>
  </header>

  <!-- WORKSPACE -->
  <main class="max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 no-print">
    
    <!-- SIDEBAR -->
    <div class="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3.5 h-fit lg:sticky lg:top-6">
      <div class="flex items-center justify-between border-b border-slate-200 pb-2">
        <h4 class="text-xs font-black text-slate-800 flex items-center gap-1.5">
          <span>📑 فهرس العرض والشرائح</span>
        </h4>
        <span class="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded shadow-3xs">أوفلاين</span>
      </div>
      
      <div class="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none" id="offlineSidebarMenu">
        <!-- Rendered dynamically by JS -->
      </div>
    </div>

    <!-- MAIN SLIDE WINDOW -->
    <section class="lg:col-span-3 min-h-[420px] bg-white border border-slate-200 rounded-2xl p-5 md:p-8 flex flex-col justify-between gap-6 shadow-sm">
      
      <div id="slidesContainer" class="relative z-10">
        
        <!-- SLIDE 1 -->
        <div id="slide-0" class="slide-content text-right space-y-4">
          <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
            <span class="text-3xl">👥</span>
            <div>
              <span class="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">الشريحة الأولى</span>
              <h2 class="text-lg font-extrabold text-slate-900 mt-0.5">مرحباً بكم في الورشة التدريبية للجمعيات التعاونية وفرسان التنمية بمحافظة إب 🇾🇪</h2>
            </div>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed">دليل إدارة وتوجيه المبادرات الذاتية في مجال الطرقات بجميع مديريات المحافظة والتحول نحو الإدارة بالنتائج بإنتاجية عالية.</p>
          
          <div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 space-y-2 detailed-info">
            <h4 class="font-bold text-emerald-900 text-xs sm:text-sm">🎯 الأهداف الرئيسية للحقيبة الميدانية والورشة:</h4>
            <ul class="text-[11px] sm:text-xs text-emerald-800 space-y-1.5 list-disc list-inside">
              <li>تمكين لجان الجمعيات والفرسان من تتبع ورصد <strong>مبادرات كافة مديريات محافظة إب (${total} مبادرة)</strong>.</li>
              <li>التحول الفعلي نحو <strong>مسارات التفعيل الخمسة</strong> لتجنب تعثر المبادرات المجتمعية وسرعة الاستجابة.</li>
              <li>المرونة الكاملة في <strong>تسجيل وتعديل المساهمات المجتمعية الذاتية</strong> (النقدية والعينية).</li>
              <li>آلية حفظ المواد بالمخازن الميدانية والقرى للحد من الهدر والرطوبة.</li>
            </ul>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 items-start">
              <span class="text-xl shrink-0">🏆</span>
              <div>
                <h5 class="font-bold text-slate-800 text-xs">أهمية توثيق المبادرات</h5>
                <p class="text-[10.5px] text-slate-500 mt-1 leading-relaxed text-justify detailed-info">
                  يساهم الرصد الدقيق في تأكيد حجم ومستوى الشفافية للمساهمات الذاتية للأهالي أمام الداعمين لتعزيز التكافل التنموي المتبادل.
                </p>
              </div>
            </div>
            
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 items-start">
              <span class="text-xl shrink-0">🔌</span>
              <div>
                <h5 class="font-bold text-slate-800 text-xs">ميزة التشغيل دون إنترنت بالقرى</h5>
                <p class="text-[10.5px] text-slate-500 mt-1 leading-relaxed text-justify detailed-info">
                  صُممت المنصة لتدعم العمل الكامل أوفلاين في المنعطفات الجبلية الوعرة وحفظ التعديلات بصورة مؤقتة وآمنة تماماً بمتصفحك.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- SLIDE 2 -->
        <div id="slide-1" class="slide-content text-right space-y-4">
          <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
            <span class="text-3xl">⚙️</span>
            <div>
              <span class="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">الشريحة الثانية</span>
              <h2 class="text-lg font-extrabold text-slate-900 mt-0.5">مسارات التفعيل الخمسة (منهجية الإدارة بالنتائج)</h2>
            </div>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed">خارطة الطريق المعتمدة لمتابعة وتقييم المبادرات الأهلية من الفكرة إلى الإنجاز. انقر على المسارات لاستعراض أدوار الجهات الثلاث:</p>
          
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200" id="offline-pathway-tabs">
            <button onclick="selectPathway(0)" id="path-btn-0" class="pathway-tab-btn py-2 px-1 text-center rounded-lg transition-all text-[10px] font-black bg-white text-indigo-950 shadow-xs cursor-pointer">المسار 1: التشخيص</button>
            <button onclick="selectPathway(1)" id="path-btn-1" class="pathway-tab-btn py-2 px-1 text-center rounded-lg transition-all text-[10px] font-black text-slate-600 hover:text-slate-900 hover:bg-white/50 cursor-pointer">المسار 2: التفعيل</button>
            <button onclick="selectPathway(2)" id="path-btn-2" class="pathway-tab-btn py-2 px-1 text-center rounded-lg transition-all text-[10px] font-black text-slate-600 hover:text-slate-900 hover:bg-white/50 cursor-pointer">المسار 3: الفرز والتحقق</button>
            <button onclick="selectPathway(3)" id="path-btn-3" class="pathway-tab-btn py-2 px-1 text-center rounded-lg transition-all text-[10px] font-black text-slate-600 hover:text-slate-900 hover:bg-white/50 cursor-pointer">المسار 4: المتابعة</button>
            <button onclick="selectPathway(4)" id="path-btn-4" class="pathway-tab-btn py-2 px-1 text-center rounded-lg transition-all text-[10px] font-black text-slate-600 hover:text-slate-900 hover:bg-white/50 cursor-pointer">المسار 5: التوثيق</button>
          </div>

          <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-4.5 space-y-4 animate-fadeIn" id="offline-pathway-panel">
            <div class="border-b border-black/5 pb-2">
              <span class="text-[9.5px] font-black text-indigo-800" id="pathway-number-lbl">المسار التنموي رقم ١</span>
              <h4 class="text-sm font-black text-slate-900" id="pathway-title-lbl">التشخيص والفرز الفني والأثر التنموي</h4>
              <p class="text-[10.5px] text-slate-500 font-medium mt-1" id="pathway-subtitle-lbl">تحديد أولويات الطرق، فحص الموانع، مسح المنعطفات وحساب الأثر السكاني لتجنب الهدر المالي</p>
            </div>

            <div class="flex flex-wrap gap-1.5 p-1 bg-black/5 rounded-xl w-fit">
              <button onclick="selectViewMode('association')" id="vmode-btn-association" class="vmode-tab-btn px-3 py-1.5 rounded-lg text-[10px] font-black transition-all bg-white text-indigo-950 shadow-3xs cursor-pointer">💼 مهام الجمعية</button>
              <button onclick="selectViewMode('authority')" id="vmode-btn-authority" class="vmode-tab-btn px-3 py-1.5 rounded-lg text-[10px] font-black transition-all text-slate-700 hover:bg-white/20 cursor-pointer">🏛️ مهام المديرية</button>
              <button onclick="selectViewMode('mobilization')" id="vmode-btn-mobilization" class="vmode-tab-btn px-3 py-1.5 rounded-lg text-[10px] font-black transition-all text-slate-700 hover:bg-white/20 cursor-pointer">✊ مهام التعبئة العامة</button>
            </div>

            <div id="dynamic-tasks-list" class="text-xs text-slate-800 space-y-3">
              <!-- Rendered via JS -->
            </div>
          </div>
          
          <div onclick="openZoom('pathwayFlow')" class="group bg-slate-950 border border-slate-800 rounded-xl p-3 hover:border-slate-600 transition-all cursor-pointer text-center py-4 flex flex-col items-center">
            <span class="text-xs font-black text-emerald-400"> عرض المخطط العام للورشة 📺</span>
            <p class="text-[8.5px] text-slate-500 mt-1">انقر لمشاهدة الهيكل التتابعي الكامل للمسارات الخمسة على الشاشة</p>
          </div>
        </div>

        <!-- SLIDE 3 -->
        <div id="slide-2" class="slide-content text-right space-y-4">
          <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
            <span class="text-3xl">📊</span>
            <div>
              <span class="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">الشريحة الثالثة</span>
              <h2 class="text-lg font-extrabold text-slate-900 mt-0.5">الموقف التنفيذي الحالي لمبادرات محافظة إب (${total} مبادرة)</h2>
            </div>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed">الفرز الإحصائي والتتبع الميداني للمبادرات الـ ${total} بكافة مديريات محافظة إب لتوزيع الجهود والتغلب على التعثر والممانعة الأهلية:</p>
          
          <div class="grid grid-cols-2 md:grid-cols-5 gap-3 detailed-info">
            <div class="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center">
              <span class="text-emerald-700 text-[10px] font-black block">✓ مكتملة منجزة</span>
              <h3 class="text-xl font-black text-emerald-800 mt-1">${completed} مبادرة</h3>
              <p class="text-[8.5px] text-emerald-600">طرق مبلطة ومجهزة</p>
            </div>
            <div class="bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-center">
              <span class="text-indigo-700 text-[10px] font-black block">⏳ قيد التنفيذ</span>
              <h3 class="text-xl font-black text-indigo-800 mt-1">${ongoing} مبادرات</h3>
              <p class="text-[8.5px] text-indigo-600">عمل يومي مستمر</p>
            </div>
            <div class="bg-amber-50 border border-amber-100 p-3 rounded-xl text-center">
              <span class="text-amber-700 text-[10px] font-black block"> الدراسة والفرز</span>
              <h3 class="text-xl font-black text-amber-800 mt-1">${pending} مبادرات</h3>
              <p class="text-[8.5px] text-amber-600">تجهيز التنازلات والفرز</p>
            </div>
            <div class="bg-rose-50 border border-rose-100 p-3 rounded-xl text-center">
              <span class="text-rose-700 text-[10px] font-black block">⚠️ متعثرة ميدانياً</span>
              <h3 class="text-xl font-black text-rose-800 mt-1">${stagnant} مبادرات</h3>
              <p class="text-[8.5px] text-rose-600">نقص إسمنت أو عوائق</p>
            </div>
            <div class="bg-slate-100 border border-slate-200 p-3 rounded-xl text-center">
              <span class="text-slate-700 text-[10px] font-black block">🛑 متوقفة مؤقتاً</span>
              <h3 class="text-xl font-black text-slate-800 mt-1">${stopped} مبادرة</h3>
              <p class="text-[8.5px] text-slate-500">أسباب مجتمعية أو زراعة</p>
            </div>
          </div>

          <div onclick="openZoom('sufalMap')" class="group bg-slate-950 border border-slate-800 rounded-2xl p-4 hover:border-slate-600 transition-all cursor-pointer relative overflow-hidden text-center flex flex-col justify-center items-center py-5 min-h-[120px]">
            <div class="absolute top-2.5 left-2.5 bg-slate-800 text-[8px] font-bold text-slate-300 px-2 py-0.5 rounded flex items-center gap-1 group-hover:bg-slate-750 z-10">
              <span>🔍</span>
              <span>توسيع الخارطة التفاعلية</span>
            </div>
            <span class="text-2xl">📍</span>
            <h4 class="font-extrabold text-white text-[11px] mt-1.5">خارطة التوزيع الجغرافي للمبادرات الـ ${total} جغرافياً بكافة مديريات محافظة إب</h4>
            <p class="text-[9.5px] text-slate-400 mt-0.5">اضغط هنا لعرض خريطة انتشار العزل ومستوى التدخل الميداني والتغلب على النزاعات المحلية</p>
          </div>

          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <h4 class="text-xs font-bold text-slate-900 flex items-center gap-1">
              <span>📌 خطة المعالجة وإجراءات التدخل بمحافظة إب:</span>
            </h4>
            <ul class="text-[10.5px] text-slate-700 space-y-1.5 list-disc list-inside">
              <li><strong>المبادرات المتوقفة (${stopped}):</strong> حث لجان القرى من خلال الفرسان التنمويين للتعبئة العامة لجمع الاشتراكات وتكثيف المشاركة العضلية.</li>
              <li><strong>المبادرات المتعثرة (${stagnant}):</strong> كسر الجمود وحلحلة النزاعات فوراً ونقل الإسمنت التنموي من مواقع الفائض إلى العجز.</li>
              <li><strong>المبادرات التي لم تبدأ (${pending}):</strong> فحص وثائق التنازلات وضمان استقرار موقع تخزين الإسمنت قبل توريد أي كميات.</li>
            </ul>
          </div>
        </div>

        <!-- SLIDE 4 -->
        <div id="slide-3" class="slide-content text-right space-y-4">
          <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
            <span class="text-3xl">📐</span>
            <div>
              <span class="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">الشريحة الرابعة</span>
              <h2 class="text-lg font-extrabold text-slate-900 mt-0.5">دليل الرصف الهندسي والمواصفات الفنية الميدانية للطرقات الجبلية</h2>
            </div>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed">المواصفات الهندسية المعتمدة لرصف العقبات شديدة الانحدار ومنع جرف السيول بكافة مديريات محافظة إب:</p>
          
          <div onclick="openZoom('roadSection')" class="group bg-slate-950 border border-slate-800 rounded-2xl p-4 hover:border-slate-600 transition-all cursor-pointer relative overflow-hidden text-center flex flex-col justify-center items-center py-5 min-h-[120px]">
            <div class="absolute top-2.5 left-2.5 bg-slate-800 text-[8px] font-bold text-slate-300 px-2 py-0.5 rounded flex items-center gap-1 group-hover:bg-slate-750 z-10">
              <span>📐</span>
              <span>تكبير المخطط الهندسي</span>
            </div>
            <span class="text-2xl">🧱</span>
            <h4 class="font-extrabold text-white text-[11px] mt-1.5">مخطط رصف المنعطفات الجبلية وقنوات تصريف السيول</h4>
            <p class="text-[9.5px] text-slate-400 mt-0.5">اضغط هنا لاستعراض المقطع العرضي الهندسي وأبعاد دكة الخرسانة، الحجر المسماري، وساقية التصريف الجانبية</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="bg-white border border-slate-200 p-3 rounded-xl">
              <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">المعيار الأول</span>
              <h5 class="text-xs font-black text-slate-800 mt-1">الأحجار المسمارية</h5>
              <p class="text-[9.5px] text-slate-500 mt-0.5 leading-relaxed">تثبيت الأحجار بشكل عمودي (مسماري) مدفونة في الخرسانة لتعظيم المقاومة.</p>
            </div>
            <div class="bg-white border border-slate-200 p-3 rounded-xl">
              <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">المعيار الثاني</span>
              <h5 class="text-xs font-black text-slate-800 mt-1">قنوات السيول</h5>
              <p class="text-[9.5px] text-slate-500 mt-0.5 leading-relaxed">إنشاء قنوات تصريف المياه الجانبية بعرض لا يقل عن ٤٠سم مبلطة بالخرسانة بالكامل.</p>
            </div>
            <div class="bg-white border border-slate-200 p-3 rounded-xl">
              <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">المعيار الثالث</span>
              <h5 class="text-xs font-black text-slate-800 mt-1">فواصل التمدد</h5>
              <p class="text-[9.5px] text-slate-500 mt-0.5 leading-relaxed">فواصل خشبية أو أسفلتية كل ٥-٦ أمتار طولية لامتصاص التمدد والاهتزاز وحرارة الصيف.</p>
            </div>
          </div>
        </div>

        <!-- SLIDE 5 -->
        <div id="slide-4" class="slide-content text-right space-y-4">
          <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
            <span class="text-3xl">📡</span>
            <div>
              <span class="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">الشريحة الخامسة</span>
              <h2 class="text-lg font-extrabold text-slate-900 mt-0.5">آلية عمل العرض وتعديل المبادرات بالقرى دون اتصال بالشبكة</h2>
            </div>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed">المنهجية الفنية لتشغيل المنصة الميدانية بمحافظة إب في الأماكن الوعرة التي تنقطع فيها تغطية الجوال بالكامل:</p>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <span class="text-2xl">📱</span>
              <h5 class="font-bold text-slate-800 text-xs mt-2">التخزين الفوري الآمن</h5>
              <p class="text-[9.5px] text-slate-500 mt-1 leading-relaxed detailed-info">
                يتم حفظ جميع التحديثات على المتصفح المحلي دون الحاجة لاتصال بالإنترنت بشكل دائم.
              </p>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <span class="text-2xl">💾</span>
              <h5 class="font-bold text-slate-800 text-xs mt-2">الحفاظ على التنازلات</h5>
              <p class="text-[9.5px] text-slate-500 mt-1 leading-relaxed detailed-info">
                يمكن تصفح والتحقق من الوثائق والتقارير الفنية المخزنة سابقاً للجمعية دون أي قلق من فقدها.
              </p>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <span class="text-2xl">🔄</span>
              <h5 class="font-bold text-slate-800 text-xs mt-2">المزامنة التلقائية اللاحقة</h5>
              <p class="text-[9.5px] text-slate-500 mt-1 leading-relaxed detailed-info">
                عند العودة لمناطق الاتصال بالإنترنت، تظل بيانات الجمعية جاهزة للتوثيق والفرز على السحابة مجدداً.
              </p>
            </div>
          </div>
        </div>

        <!-- SLIDE 6 -->
        <div id="slide-5" class="slide-content text-right space-y-4">
          <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
            <span class="text-3xl">📈</span>
            <div>
              <span class="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">الشريحة السادسة (الختامية)</span>
              <h2 class="text-lg font-extrabold text-slate-900 mt-0.5">التقرير الإحصائي العام وخلاصة بيانات المبادرات الميدانية</h2>
            </div>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed">عرض بياني ورسومي متكامل لمؤشرات التمويل والموقف الميداني للرصد بمحافظة إب:</p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cash & Valuation Card */}
            <div class="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4 rounded-2xl shadow-md border border-indigo-800 space-y-3">
              <div class="flex items-center gap-2">
                <span class="text-amber-400">🪙</span>
                <span class="text-xs font-black text-slate-200">إجمالي المساهمات الأهلية الموثقة</span>
              </div>
              <div class="space-y-1">
                <span class="text-xl sm:text-2xl font-mono font-black text-amber-300 block">
                  ${totalContributionsValue.toLocaleString('ar-YE')}
                </span>
                <span class="text-[10px] text-slate-300 block">ريال يمني (مساهمة مجتمعية ذاتية للأهالي)</span>
              </div>
              
              <div class="pt-2 border-t border-indigo-800 space-y-1.5 text-[10px] text-slate-300 text-right detailed-info">
                <div class="flex justify-between">
                  <span>🪙 مساهمات نقدية:</span>
                  <span class="font-mono text-amber-300">${cashValue.toLocaleString('ar-YE')} ريال</span>
                </div>
                <div class="flex justify-between">
                  <span>🧱 مواد عينية (إسمنت/صخور):</span>
                  <span class="font-mono text-indigo-300">${materialValue.toLocaleString('ar-YE')} ريال</span>
                </div>
                <div class="flex justify-between">
                  <span>✊ عمل طوعي عضلات:</span>
                  <span class="font-mono text-emerald-300">${laborValue.toLocaleString('ar-YE')} ريال</span>
                </div>
              </div>
            </div>

            {/* Status Distribution Bars Card */}
            <div class="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3 col-span-1 md:col-span-2">
              <h5 class="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <span>📊 مؤشر التوزيع الإحصائي للمبادرات الذاتية</span>
              </h5>
              
              <div class="space-y-2.5">
                <div class="space-y-1">
                  <div class="flex justify-between items-center text-[10.5px]">
                    <span class="font-black text-slate-700">منجزة ومكتملة</span>
                    <span class="font-mono text-slate-500 font-bold">${completed} مبادرة (${completedPct}%)</span>
                  </div>
                  <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-emerald-500 h-full rounded-full" style="width: ${completedPct}%"></div>
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="flex justify-between items-center text-[10.5px]">
                    <span class="font-black text-slate-700">قيد التنفيذ والمتابعة</span>
                    <span class="font-mono text-slate-500 font-bold">${ongoing} مبادرات (${ongoingPct}%)</span>
                  </div>
                  <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-indigo-50 h-full rounded-full" style="width: ${ongoingPct}%"></div>
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="flex justify-between items-center text-[10.5px]">
                    <span class="font-black text-slate-700">قيد الدراسة والفرز</span>
                    <span class="font-mono text-slate-500 font-bold">${pending} مبادرة (${pendingPct}%)</span>
                  </div>
                  <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-amber-50 h-full rounded-full" style="width: ${pendingPct}%"></div>
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="flex justify-between items-center text-[10.5px]">
                    <span class="font-black text-slate-700">متعثرة ميدانياً</span>
                    <span class="font-mono text-slate-500 font-bold">${stagnant} مبادرات (${stagnantPct}%)</span>
                  </div>
                  <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-rose-50 h-full rounded-full" style="width: ${stagnantPct}%"></div>
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="flex justify-between items-center text-[10.5px]">
                    <span class="font-black text-slate-700">متوقفة مؤقتاً</span>
                    <span class="font-mono text-slate-500 font-bold">${stopped} مبادرة (${stoppedPct}%)</span>
                  </div>
                  <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-slate-400 h-full rounded-full" style="width: ${stoppedPct}%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-slate-950 border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col items-center justify-center min-h-[160px] text-center">
            <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:14px_14px] opacity-10"></div>
            
            <div class="w-full max-w-lg h-32 relative flex items-end justify-center pointer-events-none">
              <div class="absolute left-[15%] top-2 w-10 h-10 bg-amber-400 rounded-full blur-xs opacity-80 animate-pulse"></div>
              <div class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900 to-emerald-950/40 rounded-t-[50px] border-t border-slate-800"></div>
              <div class="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-950 to-slate-900 rounded-t-[40px]"></div>
              
              <svg class="absolute inset-0 w-full h-full" viewBox="0 0 400 120" fill="none">
                <path d="M 10 110 Q 150 20, 200 60 T 390 30" stroke="#475569" stroke-width="24" stroke-linecap="round" />
                <path d="M 10 110 Q 150 20, 200 60 T 390 30" stroke="#facc15" stroke-width="2" stroke-dasharray="6 6" stroke-linecap="round" />
                
                <circle cx="60" cy="90" r="6" fill="#10b981" />
                <circle cx="160" cy="50" r="6" fill="#10b981" />
                <circle cx="240" cy="55" r="6" fill="#3b82f6" />
                <circle cx="340" cy="35" r="6" fill="#ef4444" />
              </svg>

              <div class="absolute bottom-16 right-[15%] bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 text-[8px] font-bold px-2 py-0.5 rounded shadow-lg">
                تم الرصف بنجاح 🧱
              </div>
              <div class="absolute bottom-20 left-[20%] bg-rose-950/90 border border-rose-500/40 text-rose-300 text-[8px] font-bold px-2 py-0.5 rounded shadow-lg">
                عقبات جبلية صعبة 🏔️
              </div>
            </div>

            <div class="space-y-1 relative z-10 mt-3 detailed-info">
              <h6 class="text-[11px] font-black text-amber-400">التكامل والمشاركة المجتمعية الواسعة بمحافظة إب</h6>
              <p class="text-[9.5px] text-slate-400 max-w-xl mx-auto leading-relaxed text-justify">
                توضح هذه الرسوم البيانية التكافل الشعبي الكبير؛ حيث يمثل العمل الطوعي ودعم المغتربين ركائز أساسية لإنجاح مشاريع الرصف المسماري وتخطي عجز التوريدات الحكومية بمحافظة إب.
              </p>
            </div>
          </div>
        </div>

      </div>

      <div id="offlineInstructorNotesPanel" class="mt-6 border-2 border-dashed border-amber-400 bg-amber-50/80 rounded-2xl p-4 space-y-3 hidden">
        <div class="flex items-center justify-between border-b border-amber-300 pb-2">
          <div class="flex items-center gap-1.5 text-amber-950 font-black text-xs">
            <span>🎓 دليل وملاحظات المدرب (خاصة بالمدرب فقط لمساعدتك في قيادة الورشة)</span>
          </div>
          <span class="text-[9.5px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded border border-amber-300 shadow-3xs">دليل نشط 👨‍🏫</span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="bg-white/90 border border-amber-200 p-3.5 rounded-xl space-y-1.5 shadow-3xs">
            <h5 class="font-extrabold text-amber-950 flex items-center gap-1.5">⚙️ <span>كيفية الحل وعرض الشريحة:</span></h5>
            <p class="text-slate-700 leading-relaxed text-justify text-[11px]" id="offlineHowToSolve">
              توجيهات الشريحة الحالية
            </p>
          </div>
          <div class="bg-white/90 border border-amber-200 p-3.5 rounded-xl space-y-1.5 shadow-3xs">
            <h5 class="font-extrabold text-amber-950 flex items-center gap-1.5">💡 <span>نصائح ميدانية وتوجيهات للمدرب:</span></h5>
            <p class="text-slate-700 leading-relaxed text-justify text-[11px]" id="offlineFieldTips">
              نصائح الشريحة الحالية
            </p>
          </div>
        </div>
      </div>

      <!-- SLIDE NAVIGATION FOOTER -->
      <footer class="flex items-center justify-between pt-4 border-t border-slate-200/60 mt-4 flex-wrap gap-3">
        <div class="flex items-center gap-1.5" id="offlineProgressBar">
          <!-- Dots rendered dynamically in JS -->
        </div>

        <div class="flex items-center gap-2">
          <button onclick="prevSlide()" class="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-3xs">
            السابق
          </button>
          <button onclick="nextSlide()" class="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-sm">
            التالي
          </button>
        </div>
      </footer>

    </section>

  </main>

  <footer class="bg-slate-900 text-slate-400 py-4 px-6 text-center text-xs border-t border-slate-800 no-print flex flex-col sm:flex-row items-center justify-between gap-2">
    <div>
      العرض التفاعلي لورشة الجمعية التعاونية لمبادرات محافظة إب 🇾🇪
    </div>
    <div class="text-[10px] text-slate-500">
      استخدم الأسهم <strong>←</strong> أو <strong>→</strong> أو <strong>المسافة</strong> من لوحة المفاتيح للتنقل التلقائي السريع
    </div>
  </footer>

  <!-- --- DIAGRAM INTERACTIVE MODALS (OFFLINE COMPATIBLE) --- -->
  <div id="diagramModal" class="fixed inset-0 bg-slate-950/90 backdrop-blur-md hidden items-center justify-center p-4 z-50">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col justify-between shadow-2xl relative">
      <div class="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between text-right">
        <div>
          <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950 border border-emerald-900 px-2 py-0.5 rounded">
            🔬 مخطط ورشة مبادرات محافظة إب التفاعلي
          </span>
          <h3 id="modalTitle" class="text-base font-black text-white mt-1">عنوان المخطط</h3>
        </div>
        <button onclick="closeZoom()" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <div id="modalBody" class="p-6 overflow-y-auto max-h-[70vh] flex justify-center items-center">
        <!-- SVG diagram injected here -->
      </div>
    </div>
  </div>

  <script>
    let currentSlide = 0;
    const totalSlides = 6;
    let instructorMode = false;
    let isQuietModeOffline = false;
    let selectedPathway = 0;
    let viewMode = 'association';

    const slideTitles = [
      "مرحباً بكم بورشة مبادرات محافظة إب",
      "مسارات التفعيل الخمسة",
      "الموقف التنفيذي للمبادرات",
      "دليل الرصف والمواصفات الفنية",
      "ميزة التعديل دون اتصال بالإنترنت",
      "التقرير الإحصائي العام والختامي"
    ];

    const pathwaysData = [
      {
        title: 'التشخيص والفرز الفني والأثر التنموي',
        subtitle: 'تحديد أولويات الطرق، فحص الموانع، مسح المنعطفات وحساب الأثر السكاني لتجنب الهدر المالي',
        association: [
          'المسح والتشخيص الميداني للمنمنمات الجغرافية وتجنب الازدواجية بالمشاريع.',
          'تعبئة استمارة الفرز والتحقق الأولي المعتمدة وتوقيع لجان المحلات على كشوفات الاحتياج.',
          'تجهيز وثائق التنازلات العقارية من الأهالي للأراضي المتأثرة بالرصف والتوسعة وحفظها بالجمعية.',
          'تقدير عدد السكان المستفيدين وحساب مؤشر الأثر الاقتصادي التراكمي.'
        ],
        authority: [
          'الموافقة والاعتماد المبدئي لنتائج التشخيص والفرز الفني بما يتفق مع المخطط الهيكلي للمديرية.',
          'الفصل القانوني والإداري السريع في أي نزاعات عقارية تعيق التوسعة وإصدار أحكام تثبيت ملكية المصلحة العامة.',
          'الرفع بالاحتياج الفني للجهات المركزية ومؤسسة بنيان لتخصيص الإسمنت التنموي.'
        ],
        mobilization: [
          'تذليل العقبات الميدانية والاجتماعية وحل أي منازعات تعيق وصول وبدء عمل الفريق الهندسي والفرسان.',
          'التنسيق مع المشايخ والشخصيات الاجتماعية المؤثرة والتحضير لتهيئة القرى النائية لبدء الفرز الميداني.',
          'التدخل الصارم في حال وجود ممانعة مجتمعية لإجراءات مناقلة المواد أو تعديل المسارات الجبلية الوعرة.'
        ]
      },
      {
        title: 'التفعيل التنموي وإدارة الشركاء والجمعيات',
        subtitle: 'عقد اتفاقيات المبادرة وتجميع المساهمات العينية والمادية وإثبات ملكية المصلحة العامة بالكامل',
        association: [
          'فتح الملف المالي والمخزني الرسمي للمبادرة باسم الجمعية وإعداد مقترح الرصف والمساهمات.',
          'حشد وتجميع المساهمات النقدية للأهالي وتأمين أوعية بنكية مضمونة أو صناديق محلية خاضعة للرقابة.',
          'توثيق عقود العمال والمشاركين المتطوعين وتأمين الوجبات الغذائية والحراسة لمواد موقع العمل.'
        ],
        authority: [
          'عقد لقاء شراكة رسمي لتنظيم مساهمة المجلس المحلي من وقود ومعدات ثقيلة (كمبريسر، جرافة).',
          'الإشراف على سلامة الإجراءات المالية للجمعية ومنع الجبايات غير الرسمية وتفتيش الدفاتر بشكل دوري.'
        ],
        mobilization: [
          'عقد اللقاءات التوعوية الجماهيرية المكثفة والتحفيز الإيجابي المستمر للأهالي بالقرى نحو المبادرات الأهلية.',
          'ربط العمل الميداني التنموي بمسارات الجهاد والبناء في سبيل الله وحشد الطاقات العضلية لقطع الأحجار وتشوينها.',
          'متابعة ومحاسبة المتقاعسين من القادرين بالتنسيق مع مجالس الحكماء وتأكيد الالتزام بالحصص المقررة.'
        ]
      },
      {
        title: 'الفرز والتحقق والتدخل الفني والجاهزية الميدانية',
        subtitle: 'فحص التنازلات واستقرار مخازن حفظ الإسمنت والمواصفات المعتمدة لمنع الهدر والانهيارات',
        association: [
          'فحص جهوزية مخازن القرى الآمنة وحمايتها من الرطوبة والمياه الجوفية قبل نقل كيس إسمنت واحد.',
          'مطابقة المواصفات الميدانية لقطر ونوعية الأحجار وتأكيد توفير المياه الكافية للخلط والرش المستمر.',
          'تنزيل وثائق التنازلات المكتملة وإرفاق إحداثيات GPS للمسار المطلوب تفعيله.'
        ],
        authority: [
          'تكليف المهندس المشرف التابع للأشغال بالمديرية لزيارة مخزن القرية وإصدار تقرير المطابقة الفنية للجاهزية.',
          'إصدار أمر صرف مواد الدعم (الإسمنت والديناميت وأدوات التكسير) المخصصة للمبادرة المستوفية للشروط.'
        ],
        mobilization: [
          'مراقبة سلامة توريد الأسمنت من مخازن المديرية للجمعية والحد من تسريبه للأسواق التجارية.',
          'إسناد لجان التخزين وحماية كميات الدعم وتكليف حراسة مجتمعية ليلية متطوعة للمخازن والمعدات بالميدان.'
        ]
      },
      {
        title: 'المتابعة وسير التنفيذ وحراسة المواصفات الهندسية',
        subtitle: 'فواصل التمدد الحراري والرش بالمياه وصيانة مجاري السيول الجانبية باستمرار',
        association: [
          'التتبع اليومي الميداني للرصف والتأكد من تركيب فواصل التمدد الطولية والعرضية كل ٥-٦ أمتار.',
          'الإشراف المباشر على ري الرصف الخرساني بالماء مرتين يومياً ولمدة لا تقل عن ١٠ أيام متواصلة.',
          'توثيق مراحل العمل أولاً بأول بالصور وتسجيل نسب الإنجاز الفعلي على لوحة المؤشرات الميدانية بالجمعية.'
        ],
        authority: [
          'القيام بزيارات ميدانية مفاجئة من مهندسي الأشغال المحليين للتحقق من نسب الخلط (خرسانة ١:٢:٤) وجودة حجر الرصف.',
          'إيقاف الأعمال المخالفة للمواصفات الهندسية فوراً وإلزام اللجنة بإعادة التنفيذ وتصحيح العيوب بالبناء.'
        ],
        mobilization: [
          'التحشيد المستمر وتوفير الأيدي العاملة التطوعية الإضافية في عقبات الجبال لتلافي فترات الكسل والتراخي.',
          'التدخل السريع والودي لفض أي نزاعات أو اختلافات تنشأ أثناء مرحلة البناء بين الأهالي وملاك الأراضي المجاورة.'
        ]
      },
      {
        title: 'التوثيق المالي والفني والفرز النهائي للأثر التنموي',
        subtitle: 'إغلاق الملفات وتصوير الإنجاز وحساب القيمة الكلية للمساهمة الأهلية لتعزيز الشفافية والتحفيز',
        association: [
          'إعداد الحساب الختامي للمبادرة شاملاً القيمة التقديرية للمساهمات العينية (أيام العمل، الأحجار، الوجبات).',
          'تصوير المبادرة بعد الإنجاز الكامل (قبل وبعد الرصف) ومطابقتها مع الإحداثيات المسجلة بالدراسة الأولية.',
          'الرفع بملف إغلاق المبادرة الفني والمالي المتكامل لإدارة الجمعية وإصدار شهادة نجاح للمحلة.'
        ],
        authority: [
          'المراجعة الدفترية والمالية الختامية لملف المبادرة والمطابقة مع الكميات المنصرفة لإقرار براءة ذمة لجان المبادرة.',
          'تسجيل الإنجاز التنموي في تقرير المديرية الرسمي والرفع بنسخة لمجلس الشؤون الإنسانية ومحافظة إب.'
        ],
        mobilization: [
          'الاحتفاء الجماهيري بإنجاز المبادرة وتكريم اللجان والفرسان المتميزين وإعلان القيمة النقدية لجهودهم.',
          'استغلال نجاح المبادرة كقصة ملهمة في اللقاءات الجماهيرية والتحشيدية لتفعيل القرى والجمعيات المجاورة.'
        ]
      }
    ];

    const instructorNotes = [
      {
        howToSolve: 'افتتح الورشة بالترحيب والتعريف بالحضور من لجان المديريات والجمعية والتعبئة العامة. ركّز على أهمية التكامل التنموي وعرض الـ 725+ مبادرة المستهدفة بمحافظة إب.',
        fieldTips: 'احرص على خلق جو إيجابي تعاوني، وتجنب الخلافات حول توزيع مادة الأسمنت في البداية. ركز على أن الهدف التنموي يحتاج إلى جهود الجميع.'
      },
      {
        howToSolve: 'اعرض هذا الجدول التفاعلي للمسارات الخمسة. تنقل بين التبويبات واطلب من ممثلي الجهات الثلاث قراءة مهامهم المكتوبة لمواءمة الفهم وتكامل الأدوار الميدانية.',
        fieldTips: 'ذكّر الحاضرين بأن المسار الثالث (الفرز الميداني والجاهزية) هو صمام الأمان لمنع هدر المواد، وأن أي مبادرة لا تستوفي الشروط لن تحصل على الدعم.'
      },
      {
        howToSolve: 'اعرض الفرز الإحصائي الحالي لـ 725+ مبادرة بمختلف مديريات محافظة إب. وضّح لماذا المبادرات متوقفة أو متعثرة، وركّز على كيفية تفعيلها مجدداً.',
        fieldTips: 'استخدم هذه الأرقام كأداة تحفيز وتحدي للحاضرين. أكّد على وجوب تفعيل المبادرات المتوقفة من خلال فرسان التعبئة العامة وجمع المساهمات الذاتية.'
      },
      {
        howToSolve: 'اشرح تفاصيل البناء الهندسي بدقة. ركّز على رصف الحجر المسماري عمودياً (سمك ٢٠سم) وقنوات تصريف السيول الجانبية لحماية الطريق.',
        fieldTips: 'مهندسو الأشغال يجب أن يكونوا حازمين جداً في عدم السماح بالرصف الأفقي الهش. الرصف الجبلي الوعر يتعرض لضغط سيول جارفة.'
      },
      {
        howToSolve: 'اشرح للحاضرين كيفية العمل واستخدام الحقيبة والمنصة الميدانية دون اتصال بالإنترنت. أظهر كيفية حفظ التعديلات بمتصفح الهاتف أو الكمبيوتر في القرى الوعرة.',
        fieldTips: 'أكّد للفرسان واللجان أن غياب الإنترنت في منعطفات جبال ومناطق إب الوعرة لا يمثل عائقاً بعد اليوم، بفضل التصميم المتكامل للأقراص المحلية الحافظة للبيانات.'
      },
      {
        howToSolve: 'اعرض الشريحة الإحصائية الختامية للتقرير المالي والعيني العام. ركز على الحجم المالي الإجمالي لمساهمة الأهالي لتنمية الروح الإيجابية والإحساس بالإنجاز والمبادرة.',
        fieldTips: 'بين أهمية التوثيق المكتمل لإجمالي التمويلات حتى يعلم الجميع الفارق الذي أحدثته المبادرة الذاتية بمديريات المحافظة مقارنة بأي دعم خارجي.'
      }
    ];

    const diagramSVGs = {
      roadSection: \`
        <div class="w-full max-w-lg space-y-4" dir="rtl">
          <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-end min-h-[220px]">
            <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:14px_14px] opacity-10"></div>
            <div class="h-44 w-full rounded-xl relative overflow-hidden flex flex-col justify-end p-4 border border-slate-800 bg-slate-900/80">
              <div class="absolute right-0 top-0 bottom-0 w-[35%] bg-slate-800/90 border-l-[3px] border-amber-500/40 p-3 text-right">
                <span class="text-[10px] text-amber-400 font-extrabold block">⚠️ منحدر العقبة الطبيعي</span>
                <p class="text-[8.5px] text-slate-400 mt-1 leading-relaxed">زاوية انحدار عالية تتطلب تدعيماً خرسانياً مستمراً لمنع الانزلاق وتآكل الأساس.</p>
              </div>
              <div class="absolute left-0 bottom-0 right-[35%] h-[75%] bg-slate-800 border-t-8 border-emerald-600 flex flex-col justify-between p-1">
                <div class="h-10 bg-slate-700 border-b-2 border-slate-600 flex items-center justify-around text-slate-100 text-[8px] p-1">
                  <span>🧱 رصف حجري مسماري غاطس (سمك ٢٠سم)</span>
                </div>
                <div class="h-8 bg-amber-900 flex items-center justify-center text-amber-200 text-[8px] p-1">
                  <span>طبقة دكة الأساس الترابي المدكوك (سمك ٣٠سم)</span>
                </div>
              </div>
              <div class="absolute left-[65%] bottom-0 w-[14%] h-[55%] bg-blue-950/90 border-t-2 border-r-2 border-blue-500/40 flex flex-col items-center justify-center p-1">
                <span class="text-[8px] font-black text-blue-300">ساقية تصريف السيول</span>
                <span class="text-[7px] text-blue-400 font-mono">عرض ٤٠سم</span>
              </div>
            </div>
          </div>
          <p class="text-xs text-slate-400 text-center leading-relaxed">تفاصيل المقطع الهندسي لرصف الطريق الجبلي وقناة تصريف المياه بمحافظة إب.</p>
        </div>
      \`,
      sufalMap: \`
        <div class="w-full max-w-xl space-y-4 text-right" dir="rtl">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div class="border border-emerald-500/30 bg-emerald-950/20 p-3 rounded-lg">
              <span class="font-extrabold text-[10.5px] text-emerald-300 block">عزلة الجعاشن (8 مبادرات)</span>
              <p class="text-[8px] text-slate-400 mt-1">تفعيل عقبة الجرين، الجعاشن وتوسيع طرق عقار</p>
            </div>
            <div class="border border-blue-500/30 bg-blue-950/20 p-3 rounded-lg">
              <span class="font-extrabold text-[10.5px] text-blue-300 block">عزلة ذي شراق (10 مبادرات)</span>
              <p class="text-[8px] text-slate-400 mt-1">طريق وادي شراق الغربي وتوسيع المنعطفات</p>
            </div>
            <div class="border border-indigo-500/30 bg-indigo-950/20 p-3 rounded-lg">
              <span class="font-extrabold text-[10.5px] text-indigo-300 block">عزلة الصفة (7 مبادرات)</span>
              <p class="text-[8px] text-slate-400 mt-1">عقبة الصفة الجبلية وطريق جبل الصفة الغربي</p>
            </div>
            <div class="border border-amber-500/30 bg-amber-950/20 p-3 rounded-lg">
              <span class="font-extrabold text-[10.5px] text-amber-300 block">عزلة حبير (9 مبادرات)</span>
              <p class="text-[8px] text-slate-400 mt-1">رصف قرية حبير الأثرية وعقبة حبير الشرقية</p>
            </div>
            <div class="border border-purple-500/30 bg-purple-950/20 p-3 rounded-lg">
              <span class="font-extrabold text-[10.5px] text-purple-300 block">عزلة الرونة وقحزة (8 مبادرات)</span>
              <p class="text-[8px] text-slate-400 mt-1">رصف قرية الرونة وتوسعة عقبة قحزة</p>
            </div>
            <div class="border border-rose-500/30 bg-rose-950/20 p-3 rounded-lg">
              <span class="font-extrabold text-[10.5px] text-rose-300 block">عزلة شقح وخنوة (6 مبادرات)</span>
              <p class="text-[8px] text-slate-400 mt-1">عقبة شقح العارضة وتأهل وادي خنوة الوعر</p>
            </div>
          </div>
          <p class="text-xs text-slate-400 text-center leading-relaxed">توزيع المبادرات جغرافياً على مديريات وعزل محافظة إب لضمان عدالة الاستهداف ومطابقة مستويات الوعورة.</p>
        </div>
      \`,
      pathwayFlow: \`
        <div class="w-full max-w-xl space-y-4" dir="rtl">
          <div class="flex flex-col sm:flex-row gap-2 justify-between">
            <div class="bg-slate-900 border border-slate-800 p-2 rounded-lg text-center flex-1">
              <span class="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center mx-auto mb-1">١</span>
              <h5 class="font-extrabold text-[10px] text-slate-100">التشخيص والفرز</h5>
              <p class="text-[8px] text-slate-400 leading-relaxed mt-0.5">دراسة التنازلات وحساب المحرومية والأثر السكاني</p>
            </div>
            <div class="bg-slate-900 border border-slate-800 p-2 rounded-lg text-center flex-1">
              <span class="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center mx-auto mb-1">٢</span>
              <h5 class="font-extrabold text-[10px] text-slate-100">تفعيل المخازن واللجان</h5>
              <p class="text-[8px] text-slate-400 leading-relaxed mt-0.5">تسمية اللجان وتأمين المخازن الميدانية للأسمنت</p>
            </div>
            <div class="bg-slate-900 border border-slate-800 p-2 rounded-lg text-center flex-1">
              <span class="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center mx-auto mb-1">٣</span>
              <h5 class="font-extrabold text-[10px] text-slate-100">التمويل والمساهمات</h5>
              <p class="text-[8px] text-slate-400 leading-relaxed mt-0.5">جمع التبرعات العينية وحساب قيمة العمل العضلي</p>
            </div>
            <div class="bg-slate-900 border border-slate-800 p-2 rounded-lg text-center flex-1">
              <span class="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center mx-auto mb-1">٤</span>
              <h5 class="font-extrabold text-[10px] text-slate-100">سير العمل والرش بالماء</h5>
              <p class="text-[8px] text-slate-400 leading-relaxed mt-0.5">حراسة مواصفات الخلط والرش فواصل التمدد</p>
            </div>
            <div class="bg-slate-900 border border-slate-800 p-2 rounded-lg text-center flex-1">
              <span class="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center mx-auto mb-1">٥</span>
              <h5 class="font-extrabold text-[10px] text-slate-100">التسليم والمطابقة</h5>
              <p class="text-[8px] text-slate-400 leading-relaxed mt-0.5">محاضر المطابقة بالصور وحساب القيمة النهائية للأثر</p>
            </div>
          </div>
          <p class="text-xs text-slate-400 text-center leading-relaxed">مخطط تتابع مسارات التفعيل الخمسة لضمان جودة المشاريع ومكافحة الممانعة أو الإهدار بمحافظة إب.</p>
        </div>
      \`
    };

    function renderSlide() {
      for (let i = 0; i < totalSlides; i++) {
        const slideEl = document.getElementById(\`slide-\${i}\`);
        if (slideEl) {
          slideEl.classList.remove('active');
        }
      }

      const activeSlideEl = document.getElementById(\`slide-\${currentSlide}\`);
      if (activeSlideEl) {
        activeSlideEl.classList.add('active');
      }

      const pBar = document.getElementById('offlineProgressBar');
      if (pBar) {
        pBar.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
          const dot = document.createElement('button');
          dot.className = i === currentSlide 
            ? 'h-2 w-6 bg-emerald-600 rounded-full transition-all' 
            : 'h-2 w-2 bg-slate-300 rounded-full transition-all hover:bg-slate-400';
          dot.onclick = () => goToSlide(i);
          pBar.appendChild(dot);
        }
      }

      const sidebarContainer = document.getElementById('offlineSidebarMenu');
      if (sidebarContainer) {
        sidebarContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
          const btn = document.createElement('button');
          const isActive = currentSlide === i;
          
          if (isActive) {
            btn.className = "w-full text-right p-2.5 rounded-xl transition-all border flex items-center gap-2.5 shrink-0 lg:shrink cursor-pointer bg-emerald-600 text-white border-emerald-700 shadow-sm";
            btn.innerHTML = \`<span class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-white/30 text-white shrink-0">\${i + 1}</span><span class="text-[11px] font-black truncate">\${slideTitles[i]}</span>\`;
          } else {
            btn.className = "w-full text-right p-2.5 rounded-xl transition-all border flex items-center gap-2.5 shrink-0 lg:shrink cursor-pointer bg-white text-slate-700 border-slate-200 hover:bg-slate-100";
            btn.innerHTML = \`<span class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-slate-200 text-slate-700 shrink-0">\${i + 1}</span><span class="text-[11px] font-black truncate">\${slideTitles[i]}</span>\`;
          }
          btn.onclick = () => goToSlide(i);
          sidebarContainer.appendChild(btn);
        }
      }

      const notesPanel = document.getElementById('offlineInstructorNotesPanel');
      if (instructorMode) {
        notesPanel.classList.remove('hidden');
        document.getElementById('offlineHowToSolve').innerText = instructorNotes[currentSlide].howToSolve;
        document.getElementById('offlineFieldTips').innerText = instructorNotes[currentSlide].fieldTips;
      } else {
        notesPanel.classList.add('hidden');
      }

      if (currentSlide === 1) {
        renderPathwayDetails();
      }
    }

    function goToSlide(index) {
      if (index >= 0 && index < totalSlides) {
        currentSlide = index;
        renderSlide();
      }
    }

    function nextSlide() {
      if (currentSlide < totalSlides - 1) {
        currentSlide++;
        renderSlide();
      }
    }

    function prevSlide() {
      if (currentSlide > 0) {
        currentSlide--;
        renderSlide();
      }
    }

    function toggleInstructorMode() {
      instructorMode = !instructorMode;
      const btn = document.getElementById('instructorToggleBtn');
      if (instructorMode) {
        btn.className = "text-xs font-black px-3.5 py-1.5 rounded-lg transition-all border bg-amber-600 text-white border-amber-700 hover:bg-amber-700 flex items-center gap-1.5 shadow-3xs cursor-pointer";
        btn.innerHTML = \`<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm0 0v6" /></svg><span>تعطيل وضع التدريب 👨‍🏫</span>\`;
      } else {
        btn.className = "text-xs font-black px-3.5 py-1.5 rounded-lg transition-all border bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 flex items-center gap-1.5 shadow-3xs cursor-pointer";
        btn.innerHTML = \`<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm0 0v6" /></svg><span>تفعيل وضع التدريب 🎓</span>\`;
      }
      renderSlide();
    }

    function toggleQuietMode() {
      isQuietModeOffline = !isQuietModeOffline;
      const body = document.body;
      const btn = document.getElementById('offlineQuietModeToggleBtn');
      
      if (isQuietModeOffline) {
        body.classList.add('quiet-mode');
        btn.className = "text-xs font-black px-3.5 py-1.5 rounded-lg border bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-750 flex items-center gap-1.5 shadow-3xs cursor-pointer";
        document.getElementById('quiet-mode-text').innerText = "إظهار الشرح والتفاصيل 👁️";
      } else {
        body.classList.remove('quiet-mode');
        btn.className = "text-xs font-black px-3.5 py-1.5 rounded-lg border bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100 flex items-center gap-1.5 shadow-3xs cursor-pointer";
        document.getElementById('quiet-mode-text').innerText = "طي الشرح والتفاصيل (العرض الواضح) 📂";
      }
    }

    function selectPathway(index) {
      selectedPathway = index;
      
      const tabBtns = document.querySelectorAll('.pathway-tab-btn');
      tabBtns.forEach((btn, idx) => {
        if (idx === index) {
          btn.className = "pathway-tab-btn py-2 px-1 text-center rounded-lg transition-all text-[10px] font-black bg-white text-indigo-950 shadow-xs border border-slate-200 cursor-pointer";
        } else {
          btn.className = "pathway-tab-btn py-2 px-1 text-center rounded-lg transition-all text-[10px] font-black text-slate-600 hover:text-slate-900 hover:bg-white/50 cursor-pointer";
        }
      });

      renderPathwayDetails();
    }

    function selectViewMode(mode) {
      viewMode = mode;
      
      const vBtns = document.querySelectorAll('.vmode-tab-btn');
      vBtns.forEach(btn => {
        if (btn.id === \`vmode-btn-\${mode}\`) {
          btn.className = "vmode-tab-btn px-3 py-1.5 rounded-lg text-[10px] font-black transition-all bg-white text-indigo-950 shadow-3xs cursor-pointer";
        } else {
          btn.className = "vmode-tab-btn px-3 py-1.5 rounded-lg text-[10px] font-black transition-all text-slate-700 hover:bg-white/20 cursor-pointer";
        }
      });

      renderPathwayDetails();
    }

    function renderPathwayDetails() {
      const data = pathwaysData[selectedPathway];
      document.getElementById('pathway-number-lbl').innerText = \`المسار التنموي رقم \${selectedPathway + 1}\`;
      document.getElementById('pathway-title-lbl').innerText = data.title;
      document.getElementById('pathway-subtitle-lbl').innerText = data.subtitle;

      const listContainer = document.getElementById('dynamic-tasks-list');
      listContainer.innerHTML = '';

      let tasksToRender = [];
      let labelPrefix = '';
      if (viewMode === 'association') {
        tasksToRender = data.association;
        labelPrefix = '✓';
      } else if (viewMode === 'authority') {
        tasksToRender = data.authority;
        labelPrefix = '🏛️';
      } else if (viewMode === 'mobilization') {
        tasksToRender = data.mobilization;
        labelPrefix = '✊';
      }

      tasksToRender.forEach((task, idx) => {
        const item = document.createElement('div');
        item.className = "flex gap-2.5 items-start text-justify leading-relaxed bg-white/60 p-2.5 rounded-lg border border-black/5";
        item.innerHTML = \`
          <span class="text-indigo-700 font-extrabold shrink-0 mt-0.5">\&nbsp;\${labelPrefix}\&nbsp;</span>
          <span>\${task}</span>
        \`;
        listContainer.appendChild(item);
      });
    }

    function openZoom(diagName) {
      const modal = document.getElementById('diagramModal');
      const title = document.getElementById('modalTitle');
      const body = document.getElementById('modalBody');
      
      let diagramTitle = "المخطط التفاعلي";
      if (diagName === 'roadSection') {
        diagramTitle = "المخطط الهندسي النموذجي للرصف الجبلي وقنوات تصريف المياه";
      } else if (diagName === 'sufalMap') {
        diagramTitle = "خارطة التوزيع الجغرافي للمبادرات جغرافياً بمحافظة إب";
      } else if (diagName === 'pathwayFlow') {
        diagramTitle = "الهيكل التفاعلي لمسارات التفعيل الخمسة للورشة الميدانية";
      }

      title.innerText = diagramTitle;
      body.innerHTML = diagramSVGs[diagName];
      modal.className = "fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50";
    }

    function closeZoom() {
      document.getElementById('diagramModal').className = "fixed inset-0 bg-slate-950/90 backdrop-blur-md hidden items-center justify-center p-4 z-50";
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        nextSlide();
      } else if (e.key === 'ArrowRight') {
        prevSlide();
      } else if (e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'Enter') {
        nextSlide();
      } else if (e.key === 'Escape') {
        closeZoom();
      }
    });

    window.onload = function() {
      renderSlide();
    };
  </script>
</body>
</html>`;
}
