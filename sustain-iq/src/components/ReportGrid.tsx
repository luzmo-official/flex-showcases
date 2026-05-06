import { useCallback, useRef, useEffect, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { WidgetCard } from './WidgetCard';

import type { GridLayout, LuzmoFilter, WidgetConfig } from '../types';
import type { Layout, Layouts } from 'react-grid-layout';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Props {
  widgets: WidgetConfig[];
  layouts: Record<string, GridLayout[]>;
  authKey: string;
  authToken: string;
  filters: LuzmoFilter[];
  onLayoutChange: (layouts: Record<string, GridLayout[]>) => void;
  onUpdateWidget: (widget: WidgetConfig) => void;
  onRemoveWidget: (id: string) => void;
  onDuplicateWidget?: (widget: WidgetConfig) => void;
  onAddWidget?: () => void;
  onOpenAI?: () => void;
}

export function ReportGrid({
  widgets,
  layouts,
  authKey,
  authToken,
  filters,
  onLayoutChange,
  onUpdateWidget,
  onRemoveWidget,
  onDuplicateWidget,
  onAddWidget,
  onOpenAI,
}: Props) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Keep a stable reference to avoid re-render loops with RGL
  const layoutsRef = useRef(layouts);
  layoutsRef.current = layouts;

  const handleLayoutChange = useCallback(
    (_: Layout[], allLayouts: Layouts) => {
      onLayoutChange(allLayouts as Record<string, GridLayout[]>);
    },
    [onLayoutChange]
  );

  if (widgets.length === 0) {
    return (
      <div className="grid-empty">
        <div className="grid-empty-content">
          <div className="grid-empty-illustration">
            <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
              <rect x="10" y="10" width="100" height="70" rx="8" stroke="#d1d5db" strokeWidth="1.5" fill="#fff" />
              <rect x="22" y="48" width="10" height="22" rx="3" fill="#d1fae5" />
              <rect x="36" y="38" width="10" height="32" rx="3" fill="#6ee7b7" />
              <rect x="50" y="26" width="10" height="44" rx="3" fill="#14b8a6" />
              <rect x="64" y="42" width="10" height="28" rx="3" fill="#6ee7b7" />
              <rect x="78" y="33" width="10" height="37" rx="3" fill="#d1fae5" />
              <circle cx="95" cy="85" r="14" fill="#14b8a6" />
              <path d="M95 79v12M89 85h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h3>Start building your dashboard</h3>
          <p>Add charts, KPIs, and tables to visualize your ESG data</p>
          {onAddWidget && (
            <button className="grid-empty-btn" onClick={onAddWidget}>
              + Add Your First Widget
            </button>
          )}
          {onOpenAI && (
            <>
              {onAddWidget && <span className="grid-empty-divider">or</span>}
              <button className="grid-empty-btn-ai" onClick={onOpenAI}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                  <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z" />
                </svg>
                Build with AI
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // On mobile: single column, stacked full-width with explicit heights
  if (isMobile) {
    const KPI_TYPES = ['evolution-number'];
    return (
      <div className="report-grid-mobile">
        {widgets.map(widget => {
          const isKpi = KPI_TYPES.includes(widget.type);
          return (
            <div key={widget.id} className={`widget-wrapper-mobile${isKpi ? ' widget-wrapper-kpi' : ''}`}>
              <WidgetCard
                widget={widget}
                authKey={authKey}
                authToken={authToken}
                filters={filters}
                contextId={widget.id}
                onUpdate={onUpdateWidget}
                onRemove={onRemoveWidget}
                onDuplicate={onDuplicateWidget}
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <ResponsiveGridLayout
        className="report-grid"
        layouts={layouts}
        breakpoints={{ lg: 600, md: 0 }}
        cols={{ lg: 12, md: 6 }}
        rowHeight={50}
        margin={[16, 16]}
        containerPadding={[16, 16]}
        onLayoutChange={handleLayoutChange}
        isDraggable
        isResizable
        resizeHandles={['se', 's', 'e', 'w', 'n', 'ne', 'nw', 'sw']}
        draggableHandle=".widget-header"
        draggableCancel=".widget-actions"
        useCSSTransforms
      >
        {widgets.map(widget => (
          <div key={widget.id} className="widget-wrapper">
            <WidgetCard
              widget={widget}
              authKey={authKey}
              authToken={authToken}
              filters={filters}
              contextId={widget.id}
              onUpdate={onUpdateWidget}
              onRemove={onRemoveWidget}
              onDuplicate={onDuplicateWidget}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
