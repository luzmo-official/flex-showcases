interface DashboardCard {
  id: string;
  name: string;
  widgetCount: number;
}

interface Props {
  dashboards: DashboardCard[];
  onOpenDashboard: (id: string) => void;
  onCreateDashboard: () => void;
  onDuplicateDashboard: (id: string) => void;
  onDeleteDashboard: (id: string) => void;
  onRestoreDefault: () => void;
}

export function HomePage({ dashboards, onOpenDashboard, onCreateDashboard, onDuplicateDashboard, onDeleteDashboard, onRestoreDefault }: Props) {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="home-hero">
        <div className="home-hero-content">
          <h2 className="home-hero-greeting">Welcome back</h2>
          <p className="home-hero-desc">Your ESG performance at a glance</p>
          <div className="home-hero-stats">
            <div className="home-stat home-stat-green">
              <span className="home-stat-value">1.3M</span>
              <span className="home-stat-label">Total CO₂ tracked (tons)</span>
            </div>
            <div className="home-stat home-stat-blue">
              <span className="home-stat-value">12</span>
              <span className="home-stat-label">Cities monitored</span>
            </div>
            <div className="home-stat home-stat-purple">
              <span className="home-stat-value">4</span>
              <span className="home-stat-label">Industry sectors</span>
            </div>
            <div className="home-stat home-stat-amber">
              <span className="home-stat-value">98.2%</span>
              <span className="home-stat-label">Data accuracy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Quick Actions</h2>
        </div>
        <div className="home-actions">
          <button className="home-action-card" onClick={onCreateDashboard}>
            <div className="home-action-icon home-action-create">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div className="home-action-info">
              <span className="home-action-name">New Dashboard</span>
              <span className="home-action-desc">Create a custom view</span>
            </div>
          </button>
          <div className="home-action-card home-action-disabled">
            <div className="home-action-icon home-action-report">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="home-action-info">
              <span className="home-action-name">Generate Report</span>
              <span className="home-action-desc">Export ESG summary</span>
            </div>
            <span className="home-action-soon">Soon</span>
          </div>
          <div className="home-action-card home-action-disabled">
            <div className="home-action-icon home-action-alert">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </div>
            <div className="home-action-info">
              <span className="home-action-name">Set Alert</span>
              <span className="home-action-desc">Threshold notifications</span>
            </div>
            <span className="home-action-soon">Soon</span>
          </div>
        </div>
      </div>

      {/* Dashboards */}
      <div className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Your Dashboards</h2>
          <span className="home-section-count">{dashboards.length}</span>
        </div>
        <div className="home-dashboards">
          {dashboards.map(d => {
            const isDefault = d.id === 'esg-overview';
            return (
              <div key={d.id} className="home-dash-card">
                <div className="home-dash-preview" onClick={() => onOpenDashboard(d.id)}>
                  <div className="home-dash-mock-row">
                    <div className="home-dash-mock-bar" style={{ width: '40%' }} />
                    <div className="home-dash-mock-bar" style={{ width: '60%' }} />
                    <div className="home-dash-mock-bar" style={{ width: '30%' }} />
                  </div>
                  <div className="home-dash-mock-chart">
                    <svg viewBox="0 0 120 40" preserveAspectRatio="none">
                      <polyline
                        points="0,35 20,28 40,30 60,18 80,22 100,10 120,15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  {isDefault && (
                    <span className="home-dash-default-badge">Default</span>
                  )}
                </div>
                <div className="home-dash-info" onClick={() => onOpenDashboard(d.id)}>
                  <span className="home-dash-name">{d.name}</span>
                  <span className="home-dash-meta">{d.widgetCount} widget{d.widgetCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="home-dash-actions">
                  <button
                    className="home-dash-action-btn"
                    onClick={e => { e.stopPropagation(); onDuplicateDashboard(d.id); }}
                    title="Duplicate dashboard"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Duplicate
                  </button>
                  {isDefault && (
                    <button
                      className="home-dash-action-btn home-dash-restore-btn"
                      onClick={e => { e.stopPropagation(); onRestoreDefault(); }}
                      title="Restore default widgets"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                      </svg>
                      Restore
                    </button>
                  )}
                  {!isDefault && (
                    <button
                      className="home-dash-action-btn home-dash-delete-btn"
                      onClick={e => { e.stopPropagation(); onDeleteDashboard(d.id); }}
                      title="Delete dashboard"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div className="home-dash-card home-dash-new" onClick={onCreateDashboard}>
            <div className="home-dash-preview home-dash-preview-new">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div className="home-dash-info">
              <span className="home-dash-name">New Dashboard</span>
              <span className="home-dash-meta">Start from scratch</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity (mock) */}
      <div className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Recent Activity</h2>
        </div>
        <div className="home-activity">
          <div className="home-activity-item">
            <div className="home-activity-dot home-activity-green" />
            <div className="home-activity-content">
              <span className="home-activity-text">Data source <strong>CO2 Emissions by City</strong> synced successfully</span>
              <span className="home-activity-time">2 minutes ago</span>
            </div>
          </div>
          <div className="home-activity-item">
            <div className="home-activity-dot home-activity-blue" />
            <div className="home-activity-content">
              <span className="home-activity-text">Dashboard <strong>ESG Overview</strong> was updated</span>
              <span className="home-activity-time">15 minutes ago</span>
            </div>
          </div>
          <div className="home-activity-item">
            <div className="home-activity-dot home-activity-amber" />
            <div className="home-activity-content">
              <span className="home-activity-text">CO₂ emissions threshold exceeded in <strong>Frankfurt</strong></span>
              <span className="home-activity-time">1 hour ago</span>
            </div>
          </div>
          <div className="home-activity-item">
            <div className="home-activity-dot home-activity-purple" />
            <div className="home-activity-content">
              <span className="home-activity-text"><strong>Bas Johnson</strong> invited a new team member</span>
              <span className="home-activity-time">3 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
