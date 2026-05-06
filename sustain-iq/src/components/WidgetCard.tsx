import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LuzmoVizItemComponent, type LuzmoEmbedVizItem } from '@luzmo/react-embed';

import { ChartEditor } from './ChartEditor';
import { ChartIcon } from './icons';
import type { LuzmoFilter, Slot, WidgetConfig } from '../types';

/** Teal/green color palette for Luzmo charts to match the app accent */
const CHART_COLORS = [
  '#14b8a6', '#10b981', '#0891b2', '#2563eb', '#6366f1',
  '#059669', '#0e7490', '#1d4ed8', '#4f46e5', '#0d9488',
];
const CHART_THEME = { colors: CHART_COLORS, mainColor: '#14b8a6' };

/** Ensure slots default to an empty array for Luzmo Flex SDK rendering. */
function cleanSlots(slots: WidgetConfig['slots']): Slot[] {
  return slots ?? [];
}

/** CSS injected into Luzmo shadow DOM to hide "Enter a title" and export button */
const LUZMO_SHADOW_FIX = `
  .title-container, .number-title-icon-container { display: none !important; }
  .widget-export { display: none !important; }
`;

interface Props {
  widget: WidgetConfig;
  authKey: string;
  authToken: string;
  filters: LuzmoFilter[];
  contextId: string;
  onUpdate: (widget: WidgetConfig) => void;
  onRemove: (id: string) => void;
  onDuplicate?: (widget: WidgetConfig) => void;
}

const REQUIRED_SLOTS: Record<string, string[]> = {
  'bar-chart':        ['measure', 'y-axis'],
  'column-chart':     ['measure', 'x-axis'],
  'line-chart':       ['measure', 'x-axis'],
  'area-chart':       ['measure', 'x-axis'],
  'donut-chart':      ['measure', 'category'],
  'evolution-number': ['measure'],
  'regular-table':    ['columns'],
};

function hasRequiredSlots(type: string, slots?: { name: string; content: unknown[] }[]): boolean {
  const required = REQUIRED_SLOTS[type];
  if (!required) return true;
  if (!slots || slots.length === 0) return false;
  return required.every(req =>
    slots.some(s => s.name === req && s.content && s.content.length > 0)
  );
}

export function WidgetCard({ widget, authKey, authToken, filters, contextId, onUpdate, onRemove, onDuplicate }: Props) {
  const [showConfig, setShowConfig] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  // Increment to force full remount of LuzmoVizItemComponent when options change
  // (the Luzmo web component doesn't always re-render when options prop changes)
  const [vizKey, setVizKey] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const vizRef = useRef<LuzmoEmbedVizItem>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Fallback: if the Luzmo `rendered` callback never fires (happens on iOS
  // WebKit), force the chart visible after a timeout so it's not stuck at
  // opacity 0 forever.
  useEffect(() => {
    if (chartVisible) return;
    const timer = setTimeout(() => {
      setChartLoaded(true);
      setChartVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [chartVisible]);

  // Inject minimal CSS fix into Luzmo shadow DOM
  useEffect(() => {
    if (!chartLoaded || !chartRef.current) return;
    const timer = setTimeout(() => {
      const chartEl = chartRef.current?.querySelector('chart-component');
      if (!chartEl?.shadowRoot || chartEl.shadowRoot.querySelector('#cfix')) return;
      const style = document.createElement('style');
      style.id = 'cfix';
      style.textContent = LUZMO_SHADOW_FIX;
      chartEl.shadowRoot.appendChild(style);
    }, 300);
    return () => clearTimeout(timer);
  }, [chartLoaded]);

  // Close export menu on click outside
  useEffect(() => {
    if (!showExportMenu) return;
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showExportMenu]);

  const handleExport = (format: string) => {
    setShowExportMenu(false);
    // Use Luzmo's programmatic export
    const vizItem = chartRef.current?.querySelector('luzmo-embed-viz-item') as LuzmoEmbedVizItem | null;
    if (vizItem?.export) {
      vizItem.export(format as 'png' | 'xlsx' | 'csv');
    }
  };

  return (
    <div className="widget-card">
      <div className="widget-header">
        <div className="widget-title-row">
          <span className="widget-type-icon"><ChartIcon type={widget.type} size={14} /></span>
          <span className="widget-title">{widget.title}</span>
        </div>
        <div className="widget-actions">
          {/* Export button */}
          <div className="widget-export-wrap" ref={exportMenuRef}>
            <button
              className="widget-btn"
              onClick={() => setShowExportMenu(v => !v)}
              title="Export"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
            {showExportMenu && (
              <div className="widget-export-dropdown">
                <button onClick={() => handleExport('csv')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Download CSV
                </button>
                <button onClick={() => handleExport('xlsx')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Download XLSX
                </button>
                <button onClick={() => handleExport('png')}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  Download PNG
                </button>
              </div>
            )}
          </div>
          {onDuplicate && (
            <button
              className="widget-btn"
              onClick={() => onDuplicate(widget)}
              title="Duplicate widget"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            </button>
          )}
          <button
            className="widget-btn"
            onClick={() => setShowConfig(v => !v)}
            title={showConfig ? 'Close settings' : 'Configure widget'}
          >
            {showConfig ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            )}
          </button>
          <button
            className="widget-btn widget-btn-remove"
            onClick={() => onRemove(widget.id)}
            title="Remove widget"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Chart Editor as modal overlay — portal to body to escape grid transform */}
      {showConfig && createPortal(
        <div className="chart-editor-overlay" onClick={() => setShowConfig(false)}>
          <div className="chart-editor-modal" onClick={e => e.stopPropagation()}>
            <ChartEditor
              widget={widget}
              authKey={authKey}
              authToken={authToken}
              onSave={updated => {
                const canFilterReenabled = updated.canFilter !== false && widget.canFilter === false;
                onUpdate(updated);
                setShowConfig(false);
                setChartLoaded(false);
                setChartVisible(false);
                setVizKey(k => k + 1);
                // When re-enabling cross-filtering, reload the page so all charts
                // reconnect with a shared context
                if (canFilterReenabled) {
                  setTimeout(() => window.location.reload(), 100);
                }
              }}
              onCancel={() => setShowConfig(false)}
            />
          </div>
        </div>,
        document.body
      )}

      <div className="widget-body">
        {widget.slots && widget.slots.length > 0 && hasRequiredSlots(widget.type, widget.slots) ? (
          <div className="widget-chart" ref={chartRef}>
<div style={{ opacity: chartVisible ? 1 : 0, transform: chartVisible ? 'none' : 'translateY(4px)', transition: 'opacity .2s ease-out, transform .2s ease-out', height: '100%' }}>
              <LuzmoVizItemComponent
                key={vizKey}
                ref={vizRef}
                appServer="https://app.luzmo.com"
                apiHost="https://api.luzmo.com"
                authKey={authKey}
                authToken={authToken}
                type={widget.type}
                slots={cleanSlots(widget.slots)}
                options={{
                  ...(widget.type === 'evolution-number' ? { numberFontSize: 48 } : {}),
                  ...widget.options,
                  theme: { ...CHART_THEME, ...((widget.options as Record<string, unknown>)?.theme as Record<string, unknown> ?? {}) },
                }}
                filters={filters}
                canFilter={widget.canFilter !== false ? 'all' : undefined}
                contextId={contextId}
                rendered={() => { setChartLoaded(true); setTimeout(() => setChartVisible(true), 270); }}
              />
            </div>
          </div>
        ) : widget.slots && widget.slots.length > 0 ? (
          <div className="widget-incomplete">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
            <p>Missing required data fields</p>
            <p className="widget-incomplete-hint">Click the settings icon to complete the configuration</p>
          </div>
        ) : (
          <div className="widget-empty">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            <p>Click the settings icon to configure this widget</p>
          </div>
        )}
      </div>
    </div>
  );
}
