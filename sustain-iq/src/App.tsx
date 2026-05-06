import { useState, useCallback, useEffect } from 'react';

import { AddWidgetModal } from './components/AddWidgetModal';
import { AIChatPanel } from './components/AIChatPanel';
import { HomePage } from './components/HomePage';
import { IntegrationsPage } from './components/IntegrationsPage';
import { ReportGrid } from './components/ReportGrid';
import { Sidebar } from './components/Sidebar';
import { TeamPicker } from './components/TeamPicker';
import { TopBar } from './components/TopBar';
import { DATASET_ID, WIDGET_TEMPLATES, getColumnLabel } from './dataset';
import { useLuzmoAuth } from './hooks/useLuzmoAuth';

import type { AppState, Dashboard, GridLayout, LuzmoFilter, Slot, WidgetConfig } from './types';

const STORAGE_KEY = 'esg-dashboards-v4';
const OLD_STORAGE_KEYS = ['esg-dashboards-v3', 'esg-dashboards-v2', 'esg-dashboards-v1', 'esg-report-v1'];
const DEFAULT_DASHBOARD_ID = 'esg-overview';

type AppView = 'home' | 'dashboard' | 'integrations';

function generateId() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9);
}

/* ── Persistence ── */

/** Load persisted app state from localStorage. */
function loadState(): AppState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as AppState;
  } catch { /* corrupt data — fall through */ }
  return null;
}

/** Persist app state to localStorage. */
function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota exceeded — silently skip */ }
}

/** Clean up old storage keys from previous versions. */
function cleanupOldStorage() {
  for (const key of OLD_STORAGE_KEYS) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }
}

/** Migrate old single-dashboard format to new multi-dashboard format. */
function migrateOldData(): AppState | null {
  try {
    for (const oldKey of OLD_STORAGE_KEYS) {
      const old = localStorage.getItem(oldKey);
      if (!old) continue;
      const parsed = JSON.parse(old) as Record<string, unknown>;
      if (parsed.dashboards) {
        cleanupOldStorage();
        return parsed as unknown as AppState;
      }
      const { widgets, layouts } = parsed as { widgets?: WidgetConfig[]; layouts?: Record<string, GridLayout[]> };
      if (!widgets || widgets.length === 0) continue;
      const id = generateId();
      const state: AppState = {
        activeDashboardId: id,
        dashboards: { [id]: { name: 'ESG Overview', widgets, layouts: layouts ?? { lg: [] } } },
      };
      saveState(state);
      cleanupOldStorage();
      return state;
    }
  } catch { /* ignore corrupt data */ }
  return null;
}

/* ── Default dashboard builder ── */

const TEMPLATE_LAYOUT: { key: string; x: number; y: number; w: number; h: number }[] = [
  { key: 'total-co2',            x: 0,  y: 0,  w: 4, h: 3 },
  { key: 'total-revenue',        x: 4,  y: 0,  w: 4, h: 3 },
  { key: 'sustainability-rating',x: 8,  y: 0,  w: 4, h: 3 },
  { key: 'co2-by-city',          x: 0,  y: 3,  w: 6, h: 7 },
  { key: 'emissions-over-time',  x: 6,  y: 3,  w: 6, h: 7 },
  { key: 'by-energy-source',     x: 0,  y: 10, w: 4, h: 6 },
  { key: 'co2-by-scope',         x: 4,  y: 10, w: 4, h: 6 },
  { key: 'revenue-by-industry',  x: 8,  y: 10, w: 4, h: 6 },
];

/** Build the default ESG Overview dashboard from templates. */
function buildTemplateDashboard(): Dashboard {
  const widgets: WidgetConfig[] = [];
  const lg: GridLayout[] = [];
  for (const pos of TEMPLATE_LAYOUT) {
    const tpl = WIDGET_TEMPLATES.find(t => t.key === pos.key);
    if (!tpl) continue;
    const id = generateId();
    widgets.push({
      id,
      title: tpl.label,
      type: tpl.type,
      slots: JSON.parse(JSON.stringify(tpl.slots)) as Slot[],
      options: tpl.options as Record<string, unknown>,
    });
    lg.push({ i: id, x: pos.x, y: pos.y, w: pos.w, h: pos.h, minW: 2, minH: 3 });
  }
  return { name: 'ESG Overview', widgets, layouts: { lg } };
}

function buildDefaultState(): AppState {
  return {
    activeDashboardId: DEFAULT_DASHBOARD_ID,
    dashboards: { [DEFAULT_DASHBOARD_ID]: buildTemplateDashboard() },
  };
}

/** Ensure the default ESG Overview dashboard always exists. */
function ensureDefaultDashboard(state: AppState): AppState {
  if (state.dashboards[DEFAULT_DASHBOARD_ID]) return state;
  return {
    ...state,
    dashboards: { [DEFAULT_DASHBOARD_ID]: buildTemplateDashboard(), ...state.dashboards },
  };
}

/** Migrate all saved widgets to use the current DATASET_ID. */
function migrateDatasetIds(state: AppState): AppState {
  let changed = false;
  const dashboards = { ...state.dashboards };
  for (const [dashId, dash] of Object.entries(dashboards)) {
    const widgets = dash.widgets.map(w => {
      if (!w.slots || w.slots.length === 0) return w;
      const slots = w.slots.map(slot => {
        if (!slot.content || !Array.isArray(slot.content)) return slot;
        const content = slot.content.map(c => {
          if (c.datasetId && c.datasetId !== DATASET_ID) {
            changed = true;
            return { ...c, datasetId: DATASET_ID };
          }
          return c;
        });
        return { ...slot, content };
      });
      return { ...w, slots };
    });
    dashboards[dashId] = { ...dash, widgets };
  }
  return changed ? { ...state, dashboards } : state;
}

/** Ensure all slot content items have proper locale-format labels. */
function ensureSlotLabels(state: AppState): AppState {
  let changed = false;
  const dashboards = { ...state.dashboards };
  for (const [dashId, dash] of Object.entries(dashboards)) {
    const widgets = dash.widgets.map(w => {
      if (!w.slots || w.slots.length === 0) return w;
      const slots = w.slots.map(slot => {
        if (!slot.content || !Array.isArray(slot.content)) return slot;
        const content = slot.content.map(c => {
          if (c.label && typeof c.label === 'object' && (c.label as Record<string, string>).en) return c;
          const labelText = typeof c.label === 'string' && c.label
            ? c.label
            : getColumnLabel(c.columnId);
          if (labelText) {
            changed = true;
            return { ...c, label: { en: labelText } };
          }
          return c;
        });
        return { ...slot, content };
      });
      return { ...w, slots };
    });
    dashboards[dashId] = { ...dash, widgets };
  }
  return changed ? { ...state, dashboards } : state;
}

/** Migrate invalid chart type identifiers to correct Luzmo types. */
function migrateChartTypes(state: AppState): AppState {
  const TYPE_MAP: Record<string, string> = { 'pie-chart': 'donut-chart', 'heatmap': 'heat-map' };
  let changed = false;
  const dashboards = { ...state.dashboards };
  for (const [dashId, dash] of Object.entries(dashboards)) {
    const widgets = dash.widgets.map(w => {
      const newType = TYPE_MAP[w.type];
      if (!newType) return w;
      changed = true;
      const options: Record<string, unknown> = { ...(w.options || {}) };
      if (w.type === 'pie-chart') options.mode = 'pie';
      return { ...w, type: newType, options };
    });
    dashboards[dashId] = { ...dash, widgets };
  }
  return changed ? { ...state, dashboards } : state;
}

/** Create a widget + layout entry from a pre-built template key. */
function createWidgetFromTemplate(templateKey: string, col: number): { widget: WidgetConfig; layout: GridLayout } | null {
  const tpl = WIDGET_TEMPLATES.find(t => t.key === templateKey);
  if (!tpl) return null;
  const id = generateId();
  return {
    widget: {
      id,
      title: tpl.label,
      type: tpl.type,
      slots: JSON.parse(JSON.stringify(tpl.slots)) as Slot[],
      options: tpl.options as Record<string, unknown>,
    },
    layout: { i: id, x: col % 12, y: 9999, w: tpl.layout.w, h: tpl.layout.h, minW: 2, minH: 3 },
  };
}

/* ── App ── */

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const hash = window.location.hash.replace('#', '') as AppView;
    return ['home', 'dashboard', 'integrations'].includes(hash) ? hash : 'home';
  });

  useEffect(() => {
    window.location.hash = currentView;
  }, [currentView]);

  const [activeFilters, setActiveFilters] = useState<LuzmoFilter[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [appState, setAppState] = useState<AppState | null>(null);
  const [dashboardsOpen, setDashboardsOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { key: authKey, token: authToken, loading, error, refresh } = useLuzmoAuth();

  const activeDashboard = appState
    ? appState.dashboards[appState.activeDashboardId]
    : null;

  const widgets = activeDashboard?.widgets ?? [];
  const layouts = activeDashboard?.layouts ?? { lg: [] };

  const tabs = appState
    ? Object.entries(appState.dashboards).map(([id, d]) => ({ id, name: d.name }))
    : [];

  useEffect(() => {
    const saved = loadState();
    if (saved && Object.keys(saved.dashboards).length > 0) {
      let fixed = ensureDefaultDashboard(saved);
      fixed = migrateDatasetIds(fixed);
      fixed = ensureSlotLabels(fixed);
      fixed = migrateChartTypes(fixed);
      if (fixed !== saved) saveState(fixed);
      setAppState(fixed);
      return;
    }
    const migrated = migrateOldData();
    if (migrated) {
      let fixed = ensureDefaultDashboard(migrated);
      fixed = migrateDatasetIds(fixed);
      fixed = ensureSlotLabels(fixed);
      fixed = migrateChartTypes(fixed);
      saveState(fixed);
      setAppState(fixed);
      return;
    }
    const defaults = buildDefaultState();
    saveState(defaults);
    setAppState(defaults);
  }, []);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setAppState(prev => {
      if (!prev) return prev;
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const updateActiveDashboard = useCallback((updater: (d: Dashboard) => Dashboard) => {
    updateState(prev => ({
      ...prev,
      dashboards: {
        ...prev.dashboards,
        [prev.activeDashboardId]: updater(prev.dashboards[prev.activeDashboardId]),
      },
    }));
  }, [updateState]);

  /* ── Dashboard tab handlers ── */

  const handleSwitchDashboard = useCallback((id: string) => {
    updateState(prev => ({ ...prev, activeDashboardId: id }));
    setCurrentView('dashboard');
    setShowAIChat(false);
    setSidebarOpen(false);
  }, [updateState]);

  const handleCreateDashboard = useCallback(() => {
    const id = generateId();
    const count = appState ? Object.keys(appState.dashboards).length : 0;
    updateState(prev => ({
      ...prev,
      activeDashboardId: id,
      dashboards: {
        ...prev.dashboards,
        [id]: { name: `Dashboard ${count + 1}`, widgets: [], layouts: { lg: [] } },
      },
    }));
    setCurrentView('dashboard');
  }, [updateState, appState]);

  const handleDeleteDashboard = useCallback((id: string) => {
    if (id === DEFAULT_DASHBOARD_ID) return;
    if (!appState || Object.keys(appState.dashboards).length <= 1) return;
    if (!confirm('Delete this dashboard?')) return;
    updateState(prev => {
      const { [id]: _, ...rest } = prev.dashboards;
      const newActiveId = prev.activeDashboardId === id
        ? Object.keys(rest)[0]
        : prev.activeDashboardId;
      return { activeDashboardId: newActiveId, dashboards: rest };
    });
  }, [updateState, appState]);

  const handleDuplicateDashboard = useCallback((id: string) => {
    if (!appState) return;
    const source = appState.dashboards[id];
    if (!source) return;
    const newId = generateId();
    const duplicate: Dashboard = {
      name: `${source.name} (copy)`,
      widgets: JSON.parse(JSON.stringify(source.widgets)) as WidgetConfig[],
      layouts: JSON.parse(JSON.stringify(source.layouts)) as Record<string, GridLayout[]>,
    };
    const idMap: Record<string, string> = {};
    for (const w of duplicate.widgets) {
      const oldId = w.id;
      const newWId = generateId();
      idMap[oldId] = newWId;
      w.id = newWId;
    }
    if (duplicate.layouts.lg) {
      for (const l of duplicate.layouts.lg) {
        if (idMap[l.i]) l.i = idMap[l.i];
      }
    }
    updateState(prev => ({
      ...prev,
      activeDashboardId: newId,
      dashboards: { ...prev.dashboards, [newId]: duplicate },
    }));
    setCurrentView('dashboard');
  }, [updateState, appState]);

  const handleRestoreDashboard = useCallback(() => {
    const restored = buildTemplateDashboard();
    updateState(prev => ({
      ...prev,
      activeDashboardId: DEFAULT_DASHBOARD_ID,
      dashboards: {
        ...prev.dashboards,
        [DEFAULT_DASHBOARD_ID]: restored,
      },
    }));
    setCurrentView('dashboard');
  }, [updateState]);

  const handleRenameDashboard = useCallback((id: string, name: string) => {
    updateState(prev => ({
      ...prev,
      dashboards: {
        ...prev.dashboards,
        [id]: { ...prev.dashboards[id], name },
      },
    }));
  }, [updateState]);

  /* ── Widget handlers (operate on active dashboard) ── */

  const handleAddWidget = useCallback((templateKey: string) => {
    const result = createWidgetFromTemplate(templateKey, (widgets.length * 4) % 12);
    if (!result) return;
    const { widget, layout } = result;
    updateActiveDashboard(d => ({
      ...d,
      widgets: [...d.widgets, widget],
      layouts: { ...d.layouts, lg: [...(d.layouts.lg || []), layout] },
    }));
  }, [widgets.length, updateActiveDashboard]);

  const handleAddCustomWidget = useCallback((partial: Omit<WidgetConfig, 'id'>) => {
    const id = generateId();
    const widget: WidgetConfig = { id, ...partial };
    const layout: GridLayout = { i: id, x: (widgets.length * 4) % 12, y: 9999, w: 6, h: 6, minW: 2, minH: 3 };
    updateActiveDashboard(d => ({
      ...d,
      widgets: [...d.widgets, widget],
      layouts: { ...d.layouts, lg: [...(d.layouts.lg || []), layout] },
    }));
  }, [widgets.length, updateActiveDashboard]);

  const handleUpdateWidget = useCallback((widget: WidgetConfig) => {
    updateActiveDashboard(d => ({
      ...d,
      widgets: d.widgets.map(w => w.id === widget.id ? widget : w),
    }));
  }, [updateActiveDashboard]);

  const handleRemoveWidget = useCallback((id: string) => {
    updateActiveDashboard(d => ({
      ...d,
      widgets: d.widgets.filter(w => w.id !== id),
      layouts: { ...d.layouts, lg: (d.layouts.lg || []).filter(l => l.i !== id) },
    }));
  }, [updateActiveDashboard]);

  const handleDuplicateWidget = useCallback((widget: WidgetConfig) => {
    const id = generateId();
    const duplicate: WidgetConfig = {
      ...widget,
      id,
      title: `${widget.title} (copy)`,
      slots: JSON.parse(JSON.stringify(widget.slots)) as Slot[],
    };
    const layout: GridLayout = { i: id, x: (widgets.length * 4) % 12, y: 9999, w: 6, h: 6, minW: 2, minH: 3 };
    updateActiveDashboard(d => ({
      ...d,
      widgets: [...d.widgets, duplicate],
      layouts: { ...d.layouts, lg: [...(d.layouts.lg || []), layout] },
    }));
  }, [widgets.length, updateActiveDashboard]);

  const handleLayoutChange = useCallback((newLayouts: Record<string, GridLayout[]>) => {
    updateActiveDashboard(d => ({ ...d, layouts: newLayouts }));
  }, [updateActiveDashboard]);

  const handleClearAll = useCallback(() => {
    updateActiveDashboard(() => ({ name: activeDashboard?.name ?? 'Dashboard', widgets: [], layouts: { lg: [] } }));
  }, [updateActiveDashboard, activeDashboard]);

  /* ── Navigation ── */

  const handleNavigate = useCallback((view: AppView) => {
    setCurrentView(view);
    window.location.hash = view;
    setShowAIChat(false);
    setSidebarOpen(false);
    if (view === 'dashboard') {
      setDashboardsOpen(true);
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    if (!appState) return;
    const q = query.toLowerCase();
    for (const [id, d] of Object.entries(appState.dashboards)) {
      if (d.name.toLowerCase().includes(q)) {
        handleSwitchDashboard(id);
        return;
      }
    }
    for (const [id, d] of Object.entries(appState.dashboards)) {
      if (d.widgets.some(w => w.title.toLowerCase().includes(q))) {
        handleSwitchDashboard(id);
        return;
      }
    }
  }, [appState, handleSwitchDashboard]);

  const breadcrumb = currentView === 'home'
    ? { parent: '', current: '' }
    : currentView === 'integrations'
    ? { parent: 'Settings', current: 'Integrations' }
    : { parent: 'Home', current: activeDashboard?.name ?? 'Dashboard' };

  return (
    <div className="app">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {appState && (
        <Sidebar
          tabs={tabs}
          activeId={appState.activeDashboardId}
          currentView={currentView}
          onSwitch={handleSwitchDashboard}
          onCreate={handleCreateDashboard}
          onDelete={handleDeleteDashboard}
          onDuplicate={handleDuplicateDashboard}
          onRename={handleRenameDashboard}
          onNavigate={handleNavigate}
          dashboardsOpen={dashboardsOpen}
          onToggleDashboards={() => setDashboardsOpen(v => !v)}
          isOpen={sidebarOpen}
        />
      )}

      <div className="app-content">
        <TopBar
          breadcrumbParent={breadcrumb.parent}
          breadcrumbCurrent={breadcrumb.current}
          onParentClick={() => setCurrentView('home')}
          onSearch={handleSearch}
          dashboards={tabs}
          onOpenDashboard={handleSwitchDashboard}
          onToggleSidebar={() => setSidebarOpen(v => !v)}
        />

        {currentView === 'home' && appState && (
          <HomePage
            dashboards={Object.entries(appState.dashboards).map(([id, d]) => ({
              id,
              name: d.name,
              widgetCount: d.widgets.length,
            }))}
            onOpenDashboard={handleSwitchDashboard}
            onCreateDashboard={handleCreateDashboard}
            onDuplicateDashboard={handleDuplicateDashboard}
            onDeleteDashboard={handleDeleteDashboard}
            onRestoreDefault={handleRestoreDashboard}
          />
        )}

        {currentView === 'integrations' && (
          <IntegrationsPage />
        )}

        {currentView === 'dashboard' && (
          <>
            <div className="content-header">
              <div className="content-header-left">
                <h1 className="content-title">{activeDashboard?.name ?? 'Dashboard'}</h1>
                {loading && <span className="status-badge status-loading">Connecting...</span>}
                {!loading && error && (
                  <span className="status-badge status-error" title={error}>
                    Offline
                    <button className="btn-retry" onClick={refresh}>Retry</button>
                  </span>
                )}
                <div className="content-dash-actions">
                  <button
                    className="content-dash-btn"
                    onClick={() => handleDuplicateDashboard(appState!.activeDashboardId)}
                    title="Duplicate this dashboard"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Duplicate
                  </button>
                  {appState?.activeDashboardId === DEFAULT_DASHBOARD_ID && (
                    <button
                      className="content-dash-btn content-dash-btn-restore"
                      onClick={handleRestoreDashboard}
                      title="Restore default widgets"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                      </svg>
                      Restore Default
                    </button>
                  )}
                </div>
              </div>
              <div className="content-header-right">
                {authKey && authToken && (
                  <TeamPicker authKey={authKey} authToken={authToken} onFiltersChanged={setActiveFilters} />
                )}
                <button
                  className={`btn-ai ${showAIChat ? 'btn-ai-active' : ''}`}
                  onClick={() => setShowAIChat(v => !v)}
                  disabled={loading || !!error}
                  title="AI Chart Builder"
                  aria-label="Toggle AI Chart Builder"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                    <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z" />
                  </svg>
                  AI
                </button>
                <button
                  className="btn-add"
                  onClick={() => { setShowAddModal(true); setShowAIChat(false); }}
                  disabled={loading || !!error}
                >
                  Add Widget
                </button>
                {widgets.length > 0 && (
                  <button className="btn-ghost" onClick={handleClearAll}>Clear all</button>
                )}
              </div>
            </div>

            <div className={`app-layout ${showAIChat ? 'app-layout-with-ai' : ''}`}>
              <main className="app-main">
                {!loading && authKey && authToken ? (
                  <ReportGrid
                    widgets={widgets}
                    layouts={layouts}
                    authKey={authKey}
                    authToken={authToken}
                    filters={activeFilters}
                    onLayoutChange={handleLayoutChange}
                    onUpdateWidget={handleUpdateWidget}
                    onRemoveWidget={handleRemoveWidget}
                    onDuplicateWidget={handleDuplicateWidget}
                    onAddWidget={() => setShowAddModal(true)}
                    onOpenAI={() => setShowAIChat(true)}
                  />
                ) : loading ? (
                  <div className="state-screen">
                    <div className="spinner" />
                    <p>Connecting to Luzmo…</p>
                  </div>
                ) : (
                  <div className="state-screen state-error">
                    <svg className="state-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <path d="M12 9v4M12 17h.01" />
                    </svg>
                    <h3>Offline</h3>
                    <p>Could not connect to the server. Check your connection and try again.</p>
                    <button className="btn-primary" onClick={refresh}>Try again</button>
                  </div>
                )}
              </main>

              {showAIChat && authKey && authToken && (
                <AIChatPanel
                  authKey={authKey}
                  authToken={authToken}
                  onAddToDashboard={handleAddCustomWidget}
                  onClose={() => setShowAIChat(false)}
                />
              )}
            </div>
          </>
        )}
      </div>

      {showAddModal && (
        <AddWidgetModal
          onAdd={handleAddWidget}
          onAddCustom={handleAddCustomWidget}
          onClose={() => setShowAddModal(false)}
          onOpenAI={() => { setShowAddModal(false); setShowAIChat(true); }}
          authKey={authKey ?? ''}
          authToken={authToken ?? ''}
        />
      )}
    </div>
  );
}
