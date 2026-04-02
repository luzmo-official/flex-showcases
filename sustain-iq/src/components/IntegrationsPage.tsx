import React, { useState } from 'react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  connected: boolean;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Sync CRM data with your ESG dashboards',
    category: 'CRM',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19.5 10c.3 0 .5.2.5.5v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7c0-.3.2-.5.5-.5" />
        <path d="M12 3c2.8 0 5 2.2 5 5v2H7V8c0-2.8 2.2-5 5-5z" />
      </svg>
    ),
    color: '#00A1E0',
    connected: false,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get ESG alerts and reports in your channels',
    category: 'Communication',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="13" y="2" width="3" height="8" rx="1.5" />
        <rect x="8" y="14" width="3" height="8" rx="1.5" />
        <rect x="2" y="8" width="8" height="3" rx="1.5" />
        <rect x="14" y="13" width="8" height="3" rx="1.5" />
      </svg>
    ),
    color: '#E01E5A',
    connected: true,
  },
  {
    id: 'clickhouse',
    name: 'ClickHouse',
    description: 'Connect your own data warehouse',
    category: 'Data Warehouse',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="2" width="3" height="20" rx="0.5" fill="#FFCC00" />
        <rect x="8" y="2" width="3" height="20" rx="0.5" fill="#FFCC00" />
        <rect x="13" y="2" width="3" height="20" rx="0.5" fill="#FFCC00" />
        <path d="M18 8l3 4-3 4" stroke="#FFCC00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: '#FFCC00',
    connected: false,
  },
  {
    id: 'gsheets',
    name: 'Google Sheets',
    description: 'Import sustainability data from spreadsheets',
    category: 'Productivity',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
      </svg>
    ),
    color: '#0F9D58',
    connected: false,
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Track ESG compliance tasks and projects',
    category: 'Project Management',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 12l10 10 10-10L12 2z" />
        <path d="M12 8l4 4-4 4-4-4 4-4z" />
      </svg>
    ),
    color: '#0052CC',
    connected: false,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automate workflows with 5,000+ apps',
    category: 'Automation',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    color: '#FF4A00',
    connected: true,
  },
  {
    id: 'aws-s3',
    name: 'AWS S3',
    description: 'Store and retrieve ESG data from S3 buckets',
    category: 'Cloud Storage',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" />
      </svg>
    ),
    color: '#FF9900',
    connected: false,
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Connect marketing data to sustainability metrics',
    category: 'Marketing',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <circle cx="19" cy="5" r="2" />
        <circle cx="5" cy="19" r="2" />
        <path d="M14.5 10L17 7M9.5 14L7 17" />
      </svg>
    ),
    color: '#FF7A59',
    connected: false,
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(INTEGRATIONS.map(i => i.category)))];

export function IntegrationsPage() {
  const [filter, setFilter] = useState('All');
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [localConnected, setLocalConnected] = useState<Record<string, boolean>>(
    Object.fromEntries(INTEGRATIONS.map(i => [i.id, i.connected]))
  );

  const filtered = filter === 'All'
    ? INTEGRATIONS
    : INTEGRATIONS.filter(i => i.category === filter);

  const handleConnect = (id: string) => {
    setConnectingId(id);
    setTimeout(() => {
      setLocalConnected(prev => ({ ...prev, [id]: true }));
      setConnectingId(null);
    }, 1500);
  };

  const handleDisconnect = (id: string) => {
    setLocalConnected(prev => ({ ...prev, [id]: false }));
  };

  const connectedCount = Object.values(localConnected).filter(Boolean).length;

  return (
    <div className="integrations-page">
      <div className="integrations-header">
        <div>
          <h1 className="integrations-title">Integrations</h1>
          <p className="integrations-subtitle">
            Connect your favorite tools to supercharge your ESG workflows.
            <span className="integrations-connected-count">{connectedCount} connected</span>
          </p>
        </div>
      </div>

      <div className="integrations-filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`integrations-filter-btn ${filter === cat ? 'integrations-filter-active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="integrations-grid">
        {filtered.map(integration => {
          const isConnected = localConnected[integration.id];
          const isConnecting = connectingId === integration.id;
          return (
            <div key={integration.id} className="integration-card">
              <div className="integration-card-top">
                <div className="integration-icon" style={{ background: `${integration.color}18`, color: integration.color }}>
                  {integration.icon}
                </div>
                {isConnected && (
                  <span className="integration-status">
                    <span className="integration-status-dot" />
                    Connected
                  </span>
                )}
              </div>
              <h3 className="integration-name">{integration.name}</h3>
              <p className="integration-desc">{integration.description}</p>
              <div className="integration-footer">
                <span className="integration-category">{integration.category}</span>
                {isConnected ? (
                  <button
                    className="integration-btn integration-btn-disconnect"
                    onClick={() => handleDisconnect(integration.id)}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    className="integration-btn integration-btn-connect"
                    onClick={() => handleConnect(integration.id)}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <span className="integration-btn-spinner" />
                        Connecting…
                      </>
                    ) : (
                      'Connect'
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
