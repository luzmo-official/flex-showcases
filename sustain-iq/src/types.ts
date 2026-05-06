import type { ItemQueryAggregation } from '@luzmo/react-embed';

/** Aggregation functions supported by Luzmo slot contents. */
export type AggregationFunc = ItemQueryAggregation;

/** A single data column reference inside a slot. */
export interface SlotContent {
  datasetId: string;
  columnId: string;
  type: 'numeric' | 'hierarchy' | 'datetime';
  aggregationFunc?: AggregationFunc;
  level?: number;
  label?: Record<string, string>;
}

/** A named data slot containing one or more column references. */
export interface Slot {
  name: string;
  content: SlotContent[];
}

/** Configuration for a single dashboard widget (chart / KPI / table). */
export interface WidgetConfig {
  id: string;
  title: string;
  type: string;
  slots?: Slot[];
  options?: Record<string, unknown>;
  canFilter?: boolean;
}

/** A react-grid-layout position entry for a widget. */
export interface GridLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

/** A single dashboard containing widgets and their layout positions. */
export interface Dashboard {
  name: string;
  widgets: WidgetConfig[];
  layouts: Record<string, GridLayout[]>;
}

/** Top-level application state persisted to localStorage. */
export interface AppState {
  activeDashboardId: string;
  dashboards: Record<string, Dashboard>;
}

/** Re-export SDK's FilterGroup as LuzmoFilter for cross-filter / global filter expressions. */
export type { FilterGroup as LuzmoFilter } from '@luzmo/react-embed';
