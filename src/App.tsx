/**
 * Main Application Component
 * Platform for Community Road Initiatives - Ibb Governorate
 * Second Executive Pathway Operating Model
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Compass, Search, Download, BookOpen, Settings, LogIn, LogOut, 
  Sparkles, ShieldCheck, Smartphone, HelpCircle, User, RefreshCw
} from 'lucide-react';

import { Initiative, UserRole, Knight } from './types';
import { TabId, ROLE_TAB_ACCESS, TAB_LABELS } from './permissions';
import { SECOND_PATH_STAGES } from './navigation/operatingModel';
import { useAuth } from './security/AuthContext';
import { getInitialInitiatives, loadInitiativesAsync, saveInitiativeRecordRemote, deleteInitiativeRecordRemote } from './data/repository';
import { safeLocalStorage } from './utils/safeStorage';

// Component imports
import AdaptiveNavigation from './components/AdaptiveNavigation';
import ProtectedRoute from './components/ProtectedRoute';
import OperationsRoom from './components/OperationsRoom';
import InitiativesList from './components/InitiativesList';
import DistrictInteractivePortal from './components/DistrictInteractivePortal';
import FormsPortal from './components/FormsPortal';
import WorkshopPresentation from './components/WorkshopPresentation';
import SmartDevelopmentAdvisorV5 from './components/SmartDevelopmentAdvisorV5';
import DevelopmentDecisionCenter from './components/DevelopmentDecisionCenter';
import InteractiveCharts from './components/InteractiveCharts';
import InteractiveGPSMap from './components/InteractiveGPSMap';
import DevelopmentResultsMatrix from './components/DevelopmentResultsMatrix';
import InitiativesSheetAndKnights from './components/InitiativesSheetAndKnights';
import FieldWorkspaceStagingPortal from './components/FieldWorkspaceStagingPortal';
import GoogleSheetsImporter from './components/GoogleSheetsImporter';
import OfficialsManagementPortal from './components/OfficialsManagementPortal';
import PeriodicReportsPortal from './components/PeriodicReportsPortal';
import EngineersReportPortal from './components/EngineersReportPortal';
import SecondPathWorkspace from './components/SecondPathWorkspace';
import LoginPage from './components/LoginPage';

// Modals
import GlobalSearch from './components/GlobalSearch';
import MasterExportModal from './components/MasterExportModal';
import ApkExportGuideModal from './components/ApkExportGuideModal';
import ReleaseChangelogModal from './components/ReleaseChangelogModal';
import EntityPermissionsManager from './components/EntityPermissionsManager';

export default function App() {
  const { 
    effectiveRole, 
    currentUser, 
    userProfile, 
    logout, 
    setDemoRole, 
    isDemoMode 
  } = useAuth();

  // Primary Initiatives State
  const [initiatives, setInitiatives] = useState<Initiative[]>(() => getInitialInitiatives());
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [workflowStage, setWorkflowStage] = useState<string | null>(null);
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // Role permissions config
  const [roleConfig, setRoleConfig] = useState<Record<string, TabId[]>>(() => {
    try {
      const saved = safeLocalStorage.getItem('cooperative_role_tab_access');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load custom role config:', e);
    }
    return ROLE_TAB_ACCESS;
  });

  // Knights Directory State
  const [knights, setKnights] = useState<Knight[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('cooperative_knights_directory');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load knights:', e);
    }
    return [];
  });

  // Modals Visibility
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);

  // Firestore is the authoritative runtime source. Excel matrices, studies,
  // and historical ledgers are foundation/import sources only and are not
  // mutated by runtime workflows.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const remote = await loadInitiativesAsync();
        if (!cancelled && remote.length > 0) setInitiatives(remote);
      } catch (e) {
        console.warn('[App] Firestore initialization notice:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser?.uid, isDemoMode]);

  // Sync knights changes to storage
  useEffect(() => {
    try {
      safeLocalStorage.setItem('cooperative_knights_directory', JSON.stringify(knights));
    } catch (e) {
      console.warn('Failed to save knights:', e);
    }
  }, [knights]);

  // Handle URL hash changes for deep linking
  useEffect(() => {
    const handleHash = () => {
      const raw = window.location.hash.replace('#', '');
      const [tab, stage] = raw.split(':');
      if (tab && (Object.keys(TAB_LABELS) as TabId[]).includes(tab)) {
        setActiveTab(tab);
        setWorkflowStage(stage && SECOND_PATH_STAGES.some(s => s.id === stage) ? stage : null);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Update hash when activeTab changes
  const handleNavigate = useCallback((tab: TabId, stage?: string) => {
    setActiveTab(tab);
    setWorkflowStage(stage || null);
    window.location.hash = stage ? `#${tab}:${stage}` : `#${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Save updated permissions
  const handleSavePermissions = async (updatedConfig: Record<string, TabId[]>) => {
    setRoleConfig(updatedConfig);
    try {
      safeLocalStorage.setItem('cooperative_role_tab_access', JSON.stringify(updatedConfig));
    } catch (e) {
      console.warn('Failed to save role config:', e);
    }
  };

  // Runtime initiative writes go to Firestore whenever a real Firebase user
  // is active. Demo mode remains local-only for previews.
  const handleUpdateInitiative = useCallback(async (updated: Initiative) => {
    setInitiatives(prev => prev.map(item => item.id === updated.id ? updated : item));
    if (!isDemoMode && currentUser) {
      try {
        const saved = await saveInitiativeRecordRemote(updated);
        setInitiatives(prev => prev.map(item => item.id === saved.id ? saved : item));
      } catch (e) {
        console.error('[App] Failed to persist initiative update:', e);
      }
    }
  }, [currentUser?.uid, isDemoMode]);

  const handleAddInitiative = useCallback(async (newInit: Initiative) => {
    setInitiatives(prev => [newInit, ...prev]);
    if (!isDemoMode && currentUser) {
      try {
        const saved = await saveInitiativeRecordRemote(newInit, 'create');
        setInitiatives(prev => [saved, ...prev.filter(item => item.id !== saved.id)]);
      } catch (e) {
        console.error('[App] Failed to persist new initiative:', e);
      }
    }
  }, [currentUser?.uid, isDemoMode]);

  const handleDeleteInitiative = useCallback(async (id: string) => {
    setInitiatives(prev => prev.filter(item => item.id !== id));
    if (!isDemoMode && currentUser) {
      try {
        await deleteInitiativeRecordRemote(id);
      } catch (e) {
        console.error('[App] Failed to persist initiative deletion:', e);
      }
    }
  }, [currentUser?.uid, isDemoMode]);

  // Knight handlers
  const handleAddKnight = useCallback((k: Knight) => setKnights(prev => [k, ...prev]), []);
  const handleUpdateKnight = useCallback((k: Knight) => setKnights(prev => prev.map(x => x.id === k.id ? k : x)), []);
  const handleDeleteKnight = useCallback((id: string) => setKnights(prev => prev.filter(x => x.id !== id)), []);

  // Selected initiative object
  const selectedInitiative = useMemo(() => {
    return initiatives.find(i => i.id === selectedInitiativeId) || null;
  }, [initiatives, selectedInitiativeId]);

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col antialiased" dir="rtl">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Brand & Project Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-inner font-extrabold text-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white line-clamp-1">
                  غرفة عمليات إب للتنمية والمبادرات
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  محافظة إب
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                المسار التنفيذي الثاني — الإدارة بالنتائج والحوكمة الرقمية
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700/60 cursor-pointer"
              title="بحث شامل في المبادرات والمديريات"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">بحث شامل</span>
            </button>

            {/* PWA / APK Guide */}
            <button
              onClick={() => setIsApkGuideOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700/60 cursor-pointer"
              title="تثبيت التطبيق على الهاتف"
            >
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span className="hidden lg:inline">تثبيت التطبيق</span>
            </button>

            {/* Master Export */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700/60 cursor-pointer"
              title="مركز التصدير والتقارير الشاملة"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline">مركز التصدير</span>
            </button>

            {/* Changelog / Updates */}
            <button
              onClick={() => setIsChangelogOpen(true)}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60 cursor-pointer"
              title="سجل التحديثات والإصدار"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
            </button>

            {/* Role & Settings Indicator */}
            {isDemoMode ? (
              <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 rounded-lg p-1">
                <span className="text-[10px] text-slate-400 font-bold px-1 hidden sm:inline">الدور:</span>
                <select
                  value={effectiveRole}
                  onChange={(e) => setDemoRole(e.target.value as UserRole)}
                  className="bg-slate-900 text-emerald-400 text-xs font-bold px-2 py-1 rounded border border-slate-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="central_unit">الوحدة المركزية</option>
                  <option value="admin">مدير النظام (Admin)</option>
                  <option value="governorate">قيادة المحافظة</option>
                  <option value="district_director">مدير المديرية</option>
                  <option value="cooperative_association">الجمعية التعاونية</option>
                  <option value="engineer_inspector">المهندس المشرف</option>
                  <option value="visitor">زائر / عام</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                <User className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white max-w-[100px] truncate">
                  {userProfile?.displayName || currentUser?.email || 'مستخدم'}
                </span>
                <button
                  onClick={logout}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold ml-1 cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="platform-layout max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 flex-1">
        {/* Right-side command navigation */}
        <AdaptiveNavigation
          userRole={effectiveRole}
          activeTab={activeTab}
          workflowStage={workflowStage}
          selectedInitiative={selectedInitiative}
          initiativesCount={initiatives.length}
          roleConfig={roleConfig}
          onNavigate={handleNavigate}
          onOpenSettings={() => setIsPermissionsOpen(true)}
          onOpenGuide={() => setIsChangelogOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Tab Routing View */}
        <main className="platform-content min-w-0">
          {/* 1. Home / Operations Room */}
          {activeTab === 'home' && (
            <ProtectedRoute tabId="home" onGoHome={() => handleNavigate('home')}>
              <OperationsRoom
                initiatives={initiatives}
                userRole={effectiveRole}
                onNavigateTab={(tab) => handleNavigate(tab as TabId)}
                onSelectInitiative={(id) => {
                  setSelectedInitiativeId(id);
                  handleNavigate('initiatives');
                }}
              />
            </ProtectedRoute>
          )}

          {/* 2. Initiatives Registry */}
          {activeTab === 'initiatives' && (
            <ProtectedRoute tabId="initiatives" onGoHome={() => handleNavigate('home')}>
              <InitiativesList
                initiatives={initiatives}
                onSelect={(init) => setSelectedInitiativeId(init.id)}
                onAdd={handleAddInitiative}
                onDelete={handleDeleteInitiative}
                onImportAll={(data) => setInitiatives(data)}
                role={effectiveRole}
                initialDistrictFilter={selectedDistrict || 'all'}
                onNavigateTab={(tab) => handleNavigate(tab as TabId)}
                onUpdateInitiative={handleUpdateInitiative}
              />
            </ProtectedRoute>
          )}

          {/* 3. District Interactive Portal */}
          {activeTab === 'district_portal' && (
            <ProtectedRoute tabId="district_portal" onGoHome={() => handleNavigate('home')}>
              <DistrictInteractivePortal
                initiatives={initiatives}
                preSelectedDistrict={selectedDistrict}
                onSelectInitiative={(id) => {
                  setSelectedInitiativeId(id);
                  handleNavigate('initiatives');
                }}
                onClose={() => handleNavigate('home')}
                userRole={effectiveRole}
                onUpdateInitiative={handleUpdateInitiative}
              />
            </ProtectedRoute>
          )}

          {/* 4. Forms & Official Workflows Portal */}
          {activeTab === 'forms_portal' && (
            <ProtectedRoute tabId="forms_portal" onGoHome={() => handleNavigate('home')}>
              <FormsPortal
                initiatives={initiatives}
                selectedInitiativeId={selectedInitiativeId}
                initialFormId={workflowStage === 'diagnosis' ? 'diagnosis' : workflowStage === 'readiness' ? 'readiness' : workflowStage === 'decision' ? 'decision' : workflowStage === 'execution' ? 'daily' : workflowStage === 'closure' ? 'completion' : undefined}
                userRole={effectiveRole}
                onSelectInitiative={(id) => setSelectedInitiativeId(id)}
                onNavigateTab={(tab) => handleNavigate(tab as TabId)}
              />
            </ProtectedRoute>
          )}

          {/* 5. Workshop & Training Presentation */}
          {activeTab === 'workshop' && (
            <ProtectedRoute tabId="workshop" onGoHome={() => handleNavigate('home')}>
              <WorkshopPresentation
                initiatives={initiatives}
                onClose={() => handleNavigate('home')}
                onUpdateInitiative={handleUpdateInitiative}
              />
            </ProtectedRoute>
          )}

          {/* 6. AI Development Advisor V5 */}
          {activeTab === 'advisor' && (
            <ProtectedRoute tabId="advisor" onGoHome={() => handleNavigate('home')}>
              <SmartDevelopmentAdvisorV5
                initiatives={initiatives}
                targetInitiativeId={selectedInitiativeId}
                onSelectInitiative={(init) => setSelectedInitiativeId(init.id)}
                onNavigateTab={(tab) => handleNavigate(tab as TabId)}
                onUpdateInitiative={handleUpdateInitiative}
                userRole={effectiveRole}
              />
            </ProtectedRoute>
          )}

          {/* 7. Strategic Decision Center */}
          {activeTab === 'decision_center' && (
            <ProtectedRoute tabId="decision_center" onGoHome={() => handleNavigate('home')}>
              <DevelopmentDecisionCenter
                initiatives={initiatives}
                onSelectInitiative={(init) => setSelectedInitiativeId(init.id)}
                targetInitiativeId={selectedInitiativeId}
                onUpdateInitiative={handleUpdateInitiative}
              />
            </ProtectedRoute>
          )}

          {/* 8. Interactive Charts & Analytics */}
          {activeTab === 'interactive_charts' && (
            <ProtectedRoute tabId="interactive_charts" onGoHome={() => handleNavigate('home')}>
              <InteractiveCharts initiatives={initiatives} />
            </ProtectedRoute>
          )}

          {/* 9. Interactive Field GPS Map */}
          {activeTab === 'interactive_map' && (
            <ProtectedRoute tabId="interactive_map" onGoHome={() => handleNavigate('home')}>
              <InteractiveGPSMap
                initiatives={initiatives}
                onSelectInitiative={(id) => {
                  setSelectedInitiativeId(id);
                  handleNavigate('initiatives');
                }}
              />
            </ProtectedRoute>
          )}

          {/* 10. Development Results & Sorting Matrix */}
          {activeTab === 'matching_results' && (
            <ProtectedRoute tabId="matching_results" onGoHome={() => handleNavigate('home')}>
              <DevelopmentResultsMatrix
                initiatives={initiatives}
                onSelectInitiative={(init) => setSelectedInitiativeId(init.id)}
                targetInitiativeId={selectedInitiativeId}
              />
            </ProtectedRoute>
          )}

          {/* 11. Quantities Matrix & Knights Directory */}
          {(activeTab === 'matrix' || activeTab === 'tracking_sheet') && (
            <ProtectedRoute tabId={activeTab} onGoHome={() => handleNavigate('home')}>
              <InitiativesSheetAndKnights
                initiatives={initiatives}
                onUpdateInitiative={handleUpdateInitiative}
                knights={knights}
                onAddKnight={handleAddKnight}
                onUpdateKnight={handleUpdateKnight}
                onDeleteKnight={handleDeleteKnight}
                userRole={effectiveRole}
              />
            </ProtectedRoute>
          )}

          {/* 12. Field Direct Staging & Verification */}
          {activeTab === 'field_staging' && (
            <ProtectedRoute tabId="field_staging" onGoHome={() => handleNavigate('home')}>
              <FieldWorkspaceStagingPortal
                initiatives={initiatives}
                onUpdateInitiative={handleUpdateInitiative}
                onAddInitiative={handleAddInitiative}
                userRole={effectiveRole}
              />
            </ProtectedRoute>
          )}

          {/* 13. External Sheets Importer */}
          {activeTab === 'sheets_import' && (
            <ProtectedRoute tabId="sheets_import" onGoHome={() => handleNavigate('home')}>
              <GoogleSheetsImporter
                initiatives={initiatives}
                onImport={(importedData, mode) => {
                  if (mode === 'replace') {
                    setInitiatives(importedData);
                  } else {
                    setInitiatives(prev => [...prev, ...importedData]);
                  }
                  handleNavigate('initiatives');
                }}
                onCancel={() => handleNavigate('home')}
              />
            </ProtectedRoute>
          )}

          {/* 14. Officials & Jurisdiction Management */}
          {activeTab === 'officials_management' && (
            <ProtectedRoute tabId="officials_management" onGoHome={() => handleNavigate('home')}>
              <OfficialsManagementPortal
                onBack={() => handleNavigate('home')}
                onNavigateToInitiative={(id) => {
                  setSelectedInitiativeId(id);
                  handleNavigate('initiatives');
                }}
              />
            </ProtectedRoute>
          )}

          {/* 15. Periodic Executive Reports */}
          {activeTab === 'periodic_reports' && (
            <ProtectedRoute tabId="periodic_reports" onGoHome={() => handleNavigate('home')}>
              <PeriodicReportsPortal
                initiatives={initiatives}
                targetInitiativeId={selectedInitiativeId}
              />
            </ProtectedRoute>
          )}

          {/* 16. Engineers Report Portal */}
          {activeTab === 'engineers_portal' && (
            <ProtectedRoute tabId="engineers_portal" onGoHome={() => handleNavigate('home')}>
              <EngineersReportPortal
                initiatives={initiatives}
                onUpdateInitiative={handleUpdateInitiative}
                userRole={effectiveRole}
                targetInitiativeId={selectedInitiativeId}
              />
            </ProtectedRoute>
          )}

          {/* 17. Activation Plan & About Platform */}
          {(activeTab === 'activation_plan' || activeTab === 'about') && (
            <ProtectedRoute tabId={activeTab} onGoHome={() => handleNavigate('home')}>
              <SecondPathWorkspace
                initiatives={initiatives}
                selectedInitiative={selectedInitiative}
                activeTab={activeTab}
                onNavigate={(tab) => handleNavigate(tab as TabId)}
              />
            </ProtectedRoute>
          )}

          {/* 18. Login Portal */}
          {activeTab === 'login' && (
            <LoginPage
              onLoginSuccess={() => handleNavigate('home')}
              onNavigateHome={() => handleNavigate('home')}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      {/* 1. Global Search Modal */}
      {isSearchOpen && (
        <GlobalSearch
          initiatives={initiatives}
          onSelectInitiative={(id) => {
            setSelectedInitiativeId(id);
            handleNavigate('initiatives');
            setIsSearchOpen(false);
          }}
          onNavigateTab={(tab) => {
            handleNavigate(tab);
            setIsSearchOpen(false);
          }}
          onSelectDistrict={(district) => {
            setSelectedDistrict(district);
            handleNavigate('district_portal');
            setIsSearchOpen(false);
          }}
        />
      )}

      {/* 2. Master Export Modal */}
      <MasterExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        initiatives={initiatives}
        knightsData={knights}
      />

      {/* 3. PWA / APK Guide Modal */}
      <ApkExportGuideModal
        isOpen={isApkGuideOpen}
        onClose={() => setIsApkGuideOpen(false)}
        appUrl={window.location.origin}
      />

      {/* 4. Release Changelog Modal */}
      <ReleaseChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
        onNavigateTab={(tab) => {
          handleNavigate(tab as TabId);
          setIsChangelogOpen(false);
        }}
      />

      {/* 5. Entity Permissions & Roles Manager Modal */}
      {isPermissionsOpen && (
        <EntityPermissionsManager
          currentRole={effectiveRole}
          permissionsConfig={roleConfig}
          onSavePermissions={handleSavePermissions}
          onClose={() => setIsPermissionsOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 border-t border-slate-800 text-slate-400 py-4 px-6 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>منصة إب لإدارة التنمية والمبادرات المجتمعية © 2026</span>
          <span className="text-slate-500 font-medium">
            إعداد: م. عيسى ناجي القادري | نموذج المسار التنفيذي الثاني المعتمد
          </span>
        </div>
      </footer>
    </div>
  );
}
