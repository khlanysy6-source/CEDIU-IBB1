import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ShieldCheck, Activity, ArrowRight, BarChart3, Brain, Building2, Compass, FileText, HelpCircle, Home, Map as MapIcon, MoreHorizontal, Plus, Search, Settings, Users, X } from 'lucide-react';
import { TabId, hasTabAccess } from '../permissions';
import { OPERATING_FLOW, ADMIN_PORTALS, PORTAL_GROUPS, SECOND_PATH_STAGES, getPreviousFlowStage, getNextFlowStage } from '../navigation/operatingModel';
import { UserRole } from '../types';

interface Props {
  userRole: UserRole;
  activeTab: TabId;
  workflowStage?: string | null;
  selectedInitiative?: any;
  initiativesCount: number;
  roleConfig: Record<string, TabId[]>;
  onNavigate: (tab: TabId, stage?: string) => void;
  onOpenSettings: () => void;
  onOpenGuide?: () => void;
  onOpenSearch?: () => void;
}

type NavItem = { tab: TabId; label: string; short: string; icon: React.ElementType; description: string };

const ITEMS: Record<TabId, NavItem> = {
  login: { tab: 'login', label: 'تسجيل الدخول', short: 'دخول', icon: ShieldCheck, description: 'الوصول الآمن إلى الحساب' },
  home: { tab: 'home', label: 'الرئيسية', short: 'الرئيسية', icon: Compass, description: 'ملخص ما يهمك الآن' },
  initiatives: { tab: 'initiatives', label: 'المبادرات', short: 'المبادرات', icon: Activity, description: 'البحث والاستعراض والمتابعة' },
  district_portal: { tab: 'district_portal', label: 'المديريات', short: 'المديريات', icon: Building2, description: 'التوزيع الجغرافي والبوابات المحلية' },
  engineers_portal: { tab: 'engineers_portal', label: 'التقارير الفنية', short: 'التقارير', icon: FileText, description: 'تقارير المهندسين والمعاينات' },
  field_staging: { tab: 'field_staging', label: 'الرفع الميداني', short: 'الميدان', icon: Plus, description: 'رفع ومراجعة البيانات من الموقع' },
  matching_results: { tab: 'matching_results', label: 'الفرز والمطابقة', short: 'المطابقة', icon: Search, description: 'نتائج الجاهزية والمطابقة' },
  tracking_sheet: { tab: 'tracking_sheet', label: 'المتابعة', short: 'المتابعة', icon: Activity, description: 'السجل التشغيلي ودليل الفرق' },
  decision_center: { tab: 'decision_center', label: 'القرار', short: 'القرار', icon: Brain, description: 'الأولويات والمعالجات والقرارات' },
  matrix: { tab: 'matrix', label: 'التنفيذ والكميات', short: 'التنفيذ', icon: BarChart3, description: 'الكميات والمواد ومتابعة التنفيذ' },
  advisor: { tab: 'advisor', label: 'المستشار الذكي', short: 'المستشار', icon: Brain, description: 'مساعدة تحليلية وإرشادية' },
  interactive_charts: { tab: 'interactive_charts', label: 'المؤشرات', short: 'المؤشرات', icon: BarChart3, description: 'الرسوم والمؤشرات التفاعلية' },
  interactive_map: { tab: 'interactive_map', label: 'الخريطة', short: 'الخريطة', icon: MapIcon, description: 'الخريطة الميدانية والمواقع' },
  periodic_reports: { tab: 'periodic_reports', label: 'التقارير التنفيذية', short: 'التقارير', icon: FileText, description: 'تقارير دورية جاهزة للعرض' },
  officials_management: { tab: 'officials_management', label: 'المسؤولون والصلاحيات', short: 'المسؤولون', icon: Users, description: 'إدارة المسؤولين ونطاقاتهم' },
  sheets_import: { tab: 'sheets_import', label: 'استيراد البيانات', short: 'الاستيراد', icon: FileText, description: 'تحديث البيانات من المصادر الخارجية' },
  workshop: { tab: 'workshop', label: 'التدريب', short: 'التدريب', icon: HelpCircle, description: 'التدريب والمحاكاة' },
  activation_plan: { tab: 'activation_plan', label: 'خطة التفعيل', short: 'الخطة', icon: FileText, description: 'المرجع التشغيلي للمنصة' },
  about: { tab: 'about', label: 'عن المنصة', short: 'عن المنصة', icon: HelpCircle, description: 'التعريف والدليل' },
  forms_portal: { tab: 'forms_portal', label: 'النماذج والمعاملات', short: 'النماذج', icon: FileText, description: 'النماذج الأصلية المرتبطة بسجل المبادرة' },
};

const FLOW: NavItem[] = OPERATING_FLOW.map(item => ({ ...ITEMS[item.tab], description: item.purpose }));

export default function AdaptiveNavigation({ userRole, activeTab, workflowStage, selectedInitiative, initiativesCount, roleConfig, onNavigate, onOpenSettings, onOpenGuide, onOpenSearch }: Props) {
  const allowed = useMemo(() => new Set((Object.keys(ITEMS) as TabId[]).filter(tab => hasTabAccess(userRole, tab, roleConfig))), [userRole, roleConfig]);
  const primary = useMemo(() => {
    const roleTabs = (roleConfig[String(userRole)] || []) as TabId[];
    const rolePreferred = roleTabs.filter(tab => allowed.has(tab)).map(tab => ITEMS[tab]).filter(Boolean);
    const flowPreferred = FLOW.filter(item => allowed.has(item.tab));
    const unique = new Map<TabId, NavItem>();
    [...flowPreferred, ...rolePreferred].forEach(item => unique.set(item.tab, item));
    return [...unique.values()].slice(0, 5);
  }, [userRole, roleConfig, allowed]);

  const currentStage = useMemo(() => SECOND_PATH_STAGES.find(s => s.id === workflowStage) || SECOND_PATH_STAGES.find(s => s.tab === activeTab), [workflowStage, activeTab]);
  const previousStage = useMemo(() => getPreviousFlowStage(currentStage?.id, allowed), [currentStage, allowed]);
  const nextStage = useMemo(() => getNextFlowStage(currentStage?.id, allowed), [currentStage, allowed]);

  const go = (tab: TabId) => { if (allowed.has(tab)) onNavigate(tab); };
  const Icon = ITEMS[activeTab]?.icon || Compass;
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMoreOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMoreOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) setIsMoreOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [isMoreOpen]);

  const navigate = (tab: TabId) => {
    setIsMoreOpen(false);
    go(tab);
  };

  return (
    <aside className="adaptive-nav" aria-label="التنقل الذكي">
      <div className="adaptive-nav__context">
        {selectedInitiative && <div className="adaptive-nav__initiative">
          <span>المبادرة الحالية</span><b>{selectedInitiative.initiativeNumber || '—'} — {selectedInitiative.name}</b>
        </div>}
        <div className="adaptive-nav__current">
          <span className="adaptive-nav__current-icon"><Icon size={18} /></span>
          <div className="min-w-0">
            <div className="text-[11px] font-black text-slate-500">أنت الآن في</div>
            <div className="text-sm sm:text-base font-black text-slate-950 truncate">{ITEMS[activeTab]?.label || 'الصفحة الحالية'}</div>
          </div>
        </div>
        <div className="adaptive-nav__actions">
          {activeTab !== 'home' && allowed.has('home') && <button className="adaptive-nav__utility adaptive-nav__home" onClick={() => navigate('home')} title="العودة للرئيسية"><Home size={16}/><span>الرئيسية</span></button>}
          {onOpenSearch && <button className="adaptive-nav__utility" onClick={onOpenSearch} title="بحث سريع"><Search size={16}/><span>بحث</span></button>}
          {onOpenGuide && <button className="adaptive-nav__utility" onClick={onOpenGuide} title="دليل الاستخدام"><HelpCircle size={16}/><span>مساعدة</span></button>}
          <button className="adaptive-nav__utility" onClick={onOpenSettings} title="الإعدادات"><Settings size={16}/><span>الإعدادات</span></button>
        </div>
      </div>

      <div className="adaptive-nav__primary" role="navigation" aria-label="أهم البوابات لهذا الدور">
        {primary.map(item => {
          const ItemIcon = item.icon;
          const active = activeTab === item.tab;
          return <button key={item.tab} onClick={() => go(item.tab)} aria-current={active ? 'page' : undefined} className={`adaptive-nav__item ${active ? 'is-active' : ''}`}>
            <ItemIcon size={17}/><span>{item.tab === 'initiatives' ? `${item.short} (${initiativesCount})` : item.short}</span>
          </button>;
        })}
        <div className="adaptive-nav__more" ref={moreRef}>
          <button type="button" className="adaptive-nav__moreButton" aria-expanded={isMoreOpen} aria-haspopup="menu" onClick={() => setIsMoreOpen(v => !v)}>
            {isMoreOpen ? <X size={17}/> : <MoreHorizontal size={17}/>}<span>{isMoreOpen ? 'إغلاق القائمة' : 'كل البوابات'}</span>
          </button>
          {isMoreOpen && <div className="adaptive-nav__panel" role="menu" aria-label="كل البوابات المتاحة">
            <div className="adaptive-nav__panelHeader"><b>اختر ما تحتاجه</b><small>الوظائف مصنفة حسب الاستخدام، ولا تظهر إلا الصلاحيات المتاحة لك.</small></div>
            {([...FLOW, ...ADMIN_PORTALS.map(item => ({...ITEMS[item.tab], description:item.purpose}))]
              .filter((item, index, arr) => allowed.has(item.tab) && !primary.some(p => p.tab === item.tab) && arr.findIndex(x => x.tab === item.tab) === index)
              .sort((a,b) => a.tab === 'home' ? -1 : b.tab === 'home' ? 1 : a.label.localeCompare(b.label,'ar'))
              .map(item => { const ItemIcon = item.icon; return <button key={item.tab} role="menuitem" onClick={() => navigate(item.tab)}><ItemIcon size={16}/><span><b>{item.label}</b><small>{item.description}</small></span></button>; }))}
          </div>}
        </div>
      </div>

      {currentStage && activeTab !== 'home' && (
        <div className="adaptive-nav__workflow" aria-label="مسار العمل">
          <div className="adaptive-nav__workflowHead"><span>مسار العمل</span><b>{currentStage.order} / {SECOND_PATH_STAGES.length}</b></div>
          <div className="adaptive-nav__workflowTitle">{currentStage.title}</div>
          <div className="adaptive-nav__workflowTrack" aria-hidden="true">{SECOND_PATH_STAGES.map(stage => <span key={stage.id} className={stage.order <= currentStage.order ? 'is-done' : ''}></span>)}</div>
          <div className="adaptive-nav__workflowActions">
            {previousStage && <button onClick={() => onNavigate(previousStage.tab, previousStage.id)} title={`السابق: ${previousStage.title}`}>السابق: {previousStage.shortTitle}</button>}
            {nextStage && <button onClick={() => onNavigate(nextStage.tab, nextStage.id)} title={`التالي: ${nextStage.title}`}>التالي: {nextStage.shortTitle}<ArrowRight size={14}/></button>}
          </div>
        </div>
      )}
    </aside>
  );
}
