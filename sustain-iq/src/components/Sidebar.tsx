import React, { useState, useEffect, useRef } from 'react';

interface Tab {
  id: string;
  name: string;
}

type AppView = 'home' | 'dashboard' | 'integrations';

interface Props {
  tabs: Tab[];
  activeId: string;
  currentView: AppView;
  onSwitch: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onNavigate: (view: AppView) => void;
  dashboardsOpen: boolean;
  onToggleDashboards: () => void;
  isOpen?: boolean;
}

/** Collapsible sidebar with navigation, dashboard list, and data sources. */
export function Sidebar({ tabs, activeId, currentView, onSwitch, onCreate, onDelete, onDuplicate, onRename, onNavigate, dashboardsOpen, onToggleDashboards, isOpen }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [dataSourcesOpen, setDataSourcesOpen] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
    setContextMenu(null);
  };

  const commitRename = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const sidebar = e.currentTarget.closest('.sidebar');
    const rect = sidebar?.getBoundingClientRect();
    setContextMenu({
      id,
      x: e.clientX - (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0),
    });
  };

  useEffect(() => {
    if (!contextMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [contextMenu]);

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-mobile-open' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="sidebar-header">
        <div className="sidebar-logo" onClick={() => onNavigate('home')}>
          <div className="sidebar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34" />
              <path d="M2 11.5C6 7 10.5 5 17 3.5c0 0 1.5 7-3.5 12.5S2 21 2 21" />
            </svg>
          </div>
          <span className="sidebar-logo-text">SustainIQ</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div
          className={`sidebar-nav-item sidebar-nav-clickable ${currentView === 'home' ? 'sidebar-nav-active' : 'sidebar-nav-mock'}`}
          onClick={() => onNavigate('home')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </div>

        <div
          className={`sidebar-nav-item sidebar-nav-collapsible ${currentView === 'dashboard' ? 'sidebar-nav-active' : 'sidebar-nav-mock'}`}
          onClick={onToggleDashboards}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span>Dashboards</span>
          <svg className={`sidebar-nav-chevron ${dashboardsOpen ? '' : 'sidebar-nav-chevron-collapsed'}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {dashboardsOpen && (
          <div className="sidebar-dashboards">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`sidebar-dash-item ${tab.id === activeId && currentView === 'dashboard' ? 'sidebar-dash-active' : ''}`}
                onClick={() => onSwitch(tab.id)}
                onDoubleClick={() => startRename(tab.id, tab.name)}
                onContextMenu={e => handleContextMenu(e, tab.id)}
              >
                <div className="sidebar-dash-dot" />
                {editingId === tab.id ? (
                  <input
                    className="sidebar-dash-rename"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <span className="sidebar-dash-name">{tab.name}</span>
                )}
                {tabs.length > 1 && tab.id !== 'esg-overview' && (
                  <button
                    className="sidebar-dash-delete"
                    onClick={e => { e.stopPropagation(); onDelete(tab.id); }}
                    title="Delete dashboard"
                    aria-label={`Delete ${tab.name}`}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            ))}
            <button className="sidebar-dash-add" onClick={onCreate} aria-label="Create new dashboard">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              <span>New Dashboard</span>
            </button>
          </div>
        )}

        <div
          className="sidebar-nav-item sidebar-nav-mock sidebar-nav-collapsible"
          onClick={() => setDataSourcesOpen(v => !v)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
          <span>Data Sources</span>
          <svg className={`sidebar-nav-chevron ${dataSourcesOpen ? '' : 'sidebar-nav-chevron-collapsed'}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {dataSourcesOpen && (
          <div className="sidebar-datasources">
            <div className="sidebar-ds-item">
              <div className="sidebar-ds-dot sidebar-ds-dot-live" />
              <span className="sidebar-ds-name">ESG Demo Data</span>
            </div>
          </div>
        )}

        <div
          className={`sidebar-nav-item sidebar-nav-clickable ${currentView === 'integrations' ? 'sidebar-nav-active' : 'sidebar-nav-mock'}`}
          onClick={() => onNavigate('integrations')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
          </svg>
          <span>Integrations</span>
        </div>
      </nav>

      <div className="sidebar-divider" />

      <nav className="sidebar-nav sidebar-nav-bottom">
        <div className="sidebar-nav-item sidebar-nav-mock">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
          <span>Team</span>
        </div>
        <div className="sidebar-nav-item sidebar-nav-mock">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
          <span>Settings</span>
        </div>
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">BJ</div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">Bas Johnson</span>
          <span className="sidebar-user-role">Admin</span>
        </div>
        <svg className="sidebar-user-more" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
        </svg>
      </div>

      {contextMenu && (
        <div
          ref={menuRef}
          className="sidebar-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={() => { startRename(contextMenu.id, tabs.find(t => t.id === contextMenu.id)?.name ?? ''); }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Rename
          </button>
          <button onClick={() => { onDuplicate(contextMenu.id); setContextMenu(null); }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Duplicate
          </button>
          {contextMenu.id !== 'esg-overview' && tabs.length > 1 && (
            <button className="sidebar-ctx-danger" onClick={() => { onDelete(contextMenu.id); setContextMenu(null); }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              Delete
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
