import {
  BarChartViewOptions,
  BubbleChartViewOptions,
  ColumnChartViewOptions,
  DonutChartViewOptions,
  EvolutionNumberViewOptions,
  FilterGroup,
  FunnelChartViewOptions,
  LineChartViewOptions,
  RegularTableViewOptions,
  Slot,
  SlotConfig,
  TreemapChartViewOptions,
  VizItemOptions,
  VizItemSlot,
  VizItemType
} from '@luzmo/dashboard-contents-types';

import { LuzmoGridItem } from './pages/report-builder/modular-report-builder/modular-report-builder-helper';

export type PartialRecord<K extends PropertyKey, T> = {
  [P in K]?: T;
};

// Define DeepPartial utility type
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export interface DashboardConfig {
  id?: string;
  name: string;
  items: LuzmoGridItem[];
}

export interface LuzmoFlexChart {
  id?: string;
  type: VizItemType;
  slots: VizItemSlot[];
  options: DeepPartial<VizItemOptions>;
  filters?: FilterGroup[];
}

// Define specific chart configuration types
export interface FunnelChartConfig {
  type: 'funnel-chart';
  slotsConfig: SlotConfig[];
  slotContents: Slot[];
  defaultOptions: DeepPartial<FunnelChartViewOptions>;
  filters?: FilterGroup[];
}

export interface BarChartConfig {
  type: 'bar-chart';
  slotsConfig: SlotConfig[];
  slotContents: Slot[];
  defaultOptions: DeepPartial<BarChartViewOptions>;
  filters?: FilterGroup[];
}

export interface LineChartConfig {
  type: 'line-chart';
  slotsConfig: SlotConfig[];
  slotContents: Slot[];
  defaultOptions: DeepPartial<LineChartViewOptions>;
  filters?: FilterGroup[];
}

export interface ColumnChartConfig {
  type: 'column-chart';
  slotsConfig: SlotConfig[];
  slotContents: Slot[];
  defaultOptions: DeepPartial<ColumnChartViewOptions>;
  filters?: FilterGroup[];
}

export interface DonutChartConfig {
  type: 'donut-chart';
  slotsConfig: SlotConfig[];
  slotContents: Slot[];
  defaultOptions: DeepPartial<DonutChartViewOptions>;
  filters?: FilterGroup[];
}

export interface TreemapChartConfig {
  type: 'treemap-chart';
  slotsConfig: SlotConfig[];
  slotContents: Slot[];
  defaultOptions: DeepPartial<TreemapChartViewOptions>;
  filters?: FilterGroup[];
}

export interface BubbleChartConfig {
  type: 'bubble-chart';
  slotsConfig: SlotConfig[];
  slotContents: Slot[];
  defaultOptions: DeepPartial<BubbleChartViewOptions>;
  filters?: FilterGroup[];
}

export interface RegularTableConfig {
  type: 'regular-table';
  slotsConfig: SlotConfig[];
  slotContents: Slot[];
  defaultOptions: DeepPartial<RegularTableViewOptions>;
  filters?: FilterGroup[];
}

export interface EvolutionNumberConfig {
  type: 'evolution-number';
  slotsConfig: SlotConfig[];
  slotContents: Slot[];
  defaultOptions: DeepPartial<EvolutionNumberViewOptions>;
  filters?: FilterGroup[];
}

// Union type for all possible chart configurations
export type LuzmoChartConfig =
  | FunnelChartConfig
  | BarChartConfig
  | LineChartConfig
  | ColumnChartConfig
  | DonutChartConfig
  | TreemapChartConfig
  | BubbleChartConfig
  | RegularTableConfig
  | EvolutionNumberConfig;

export type Securable = {
  created_at: string;
  id: string;
  modified_at: string;
  name: Record<string, string>;
  subtitle: Record<string, string>;
  type: 'dataset' | 'dashboard';
  updated_at: string;
  contents: {
    views: {
      screenModus: string;
      filterGroups: FilterGroup[];
      items: {
        id: string;
        type: VizItemType;
        options: VizItemOptions;
        slots: VizItemSlot[];
      }[];
    }[];
  };
};

export interface ProcessedDashboard {
  id: string;
  name: Record<string, string>;
  items: {
    id: string;
    type: VizItemType;
    slots: VizItemSlot[];
    options: VizItemOptions;
  }[];
}

export interface RowsData<T> {
  count: number;
  rows: T[];
}

export interface LuzmoEmbedCredentials {
  key: string;
  token: string;
}
