import React, { useState, useRef, useEffect } from 'react';

interface DashboardRef {
  id: string;
  name: string;
}

interface Props {
  breadcrumbParent: string;
  breadcrumbCurrent: string;
  onParentClick?: () => void;
  onSearch?: (query: string) => void;
  dashboards?: DashboardRef[];
  onOpenDashboard?: (id: string) => void;
  onToggleSidebar?: () => void;
}

export function TopBar({ breadcrumbParent, breadcrumbCurrent, onParentClick, onSearch, dashboards = [], onOpenDashboard, onToggleSidebar }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredResults = searchQuery.trim().length > 0
    ? dashboards.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (id: string) => {
    onOpenDashboard?.(id);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearch?.(searchQuery.trim());
      setSearchQuery('');
      setSearchOpen(false);
    }
    if (e.key === 'Escape') {
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        {onToggleSidebar && (
          <button className="mobile-hamburger" onClick={onToggleSidebar} title="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        )}
        <nav className="breadcrumb">
          {breadcrumbParent && (
            <>
              <span
                className="breadcrumb-parent breadcrumb-link"
                onClick={onParentClick}
              >
                {breadcrumbParent}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </>
          )}
          <span className="breadcrumb-current">{breadcrumbCurrent}</span>
        </nav>
      </div>

      <div className="top-bar-center" ref={searchRef}>
        <div className={`top-bar-search ${searchOpen ? 'top-bar-search-active' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search dashboards…"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => { setSearchQuery(''); setSearchOpen(false); }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        {searchOpen && searchQuery.trim().length > 0 && (
          <div className="search-dropdown">
            {filteredResults.length > 0 ? (
              <>
                <div className="search-dropdown-label">Dashboards</div>
                {filteredResults.map(d => (
                  <button key={d.id} className="search-result" onClick={() => handleSelect(d.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    <span>{d.name}</span>
                  </button>
                ))}
              </>
            ) : (
              <div className="search-empty">No results for "{searchQuery}"</div>
            )}
          </div>
        )}
      </div>

      <div className="top-bar-right">
        <button className="top-bar-icon-btn" title="Notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="notification-dot" />
        </button>
        <button className="top-bar-icon-btn" title="Help">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
        <div className="top-bar-avatar" title="Bas Johnson">BJ</div>
      </div>
    </div>
  );
}
