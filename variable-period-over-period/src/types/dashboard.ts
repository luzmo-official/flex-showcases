export interface DashboardApiResponse {
  count: number;
  rows: DashboardRow[];
}

export interface DashboardRow {
  id: string;
  type: string;
  subtype: string;
  name: LocalizedString;
  description: LocalizedString;
  contents: DashboardContents;
  css: string;
  rows: number;
  featured: boolean;
  modified_at: string;
  transformation: null | any;
  subtitle: LocalizedString;
  source_dataset: null | string;
  source_sheet: null | string;
  source_query: null | string;
  cache: number;
  storage: string;
  is_variant: boolean;
  migrated_rows: null | any;
  uses_clickhouse_experimental: boolean;
  meta_sync_interval: number;
  meta_sync_inherit: boolean;
  meta_sync_enabled: boolean;
  last_metadata_sync_at: null | string;
  last_metadata_sync_attempt_at: string;
  shared_storage_version: null | any;
  storage_location_override: null | any;
  shared_storage_metadata: null | any;
  original_id: null | string;
  created_at: string;
  updated_at: string;
  acceleration_id: null | string;
  account_id: null | string;
  template_id: null | string;
  modifier_id: string;
  owner_id: string;
  source_template_id: null | string;
  dimensions: Record<ScreenMode, [number, number]>;
  chartDimensions: Record<string, Record<ScreenMode, [number, number]>>;
}

export interface LocalizedString {
  en?: string;
  de?: string;
  es?: string;
  fr?: string;
  it?: string;
  nl?: string;
  no?: string;
  pt?: string;
  ru?: string;
  tr?: string;
}

export interface DashboardContents {
  version: string;
  syncScreenModes: boolean;
  datasetLinks: Record<string, any[]>;
  views: DashboardView[];
  parameters: any[];
  timezone: Timezone;
}

export type ScreenMode =
  | "mobile"
  | "tablet"
  | "desktop"
  | "largeScreen"
  | "fixed";

export interface DashboardView {
  screenModus: ScreenMode;
  options: ViewOptions;
  items: DashboardItem[];
}

export interface ViewOptions {
  share: {
    poweredBy: boolean;
  };
  theme: {
    id: string;
    margins: [number, number];
    [key: string]: any;
  };
  alertingEnabled: boolean;
  width?: number;
  columns?: number;
  rowHeight?: number;
}

export interface DashboardItem {
  id: string;
  type: string;
  position: ItemPosition;
  title: LocalizedString;
  options: ItemOptions;
  content: Record<string, any>;
  slots: ItemSlot[];
  source: string;
  aichartId: null | string;
  customChartId: null | string;
  customChartScriptUrl: null | string;
  customChartStyleUrl: null | string;
  customChartSlotsConfig: null | any;
}

export interface ItemPosition {
  sizeX: number;
  sizeY: number;
  row: number;
  col: number;
}

export interface ItemOptions {
  [key: string]: any;
}

export interface ItemSlot {
  name: string;
  content: SlotContentItem[];
}

export interface SlotContentItem {
  column?: string;
  set?: string;
  label: LocalizedString | string;
  type: string;
  subtype?: null | string;
  format?: string;
  lowestLevel?: number;
  level?: number | null;
  currency?: string | null;
  aggregationFunc?: string;
  id?: string;
  formula?: string;
  bins?: { enabled: boolean };
  [key: string]: any;
}

export interface Timezone {
  type: string;
  id: string;
}

// Helper type to describe an item's position within a specific screen view/mode.
export type ItemPositionForView = ItemPosition & { view: ScreenMode };

// --- Types for Luzmo Event Detail & getFilters() Response ---
// (Uncommenting and refining based on provided filter object structure)

export interface EventFilterParameter {
  column_id: string;
  dataset_id: string;
  level?: number;
  lowestLevel?: number;
}

export interface EventFilterEntryProperties {
  viz: string; // Item ID of the chart/filter item this filter entry is tied to
  origin: string;
  type: string; // e.g., "where"
  id: string; // Internal filter ID
  ignore?: string[];
}

export interface EventFilterEntry {
  properties: EventFilterEntryProperties;
  // For date filters, parameters[1] is typically an array with a single date string.
  // Example: [ {column_id: "...", dataset_id: "..."}, ["2023-01-01T00:00:00.000Z"] ]
  parameters: [EventFilterParameter, (string | number | null)[] | string];
  expression: string; // e.g., "? >= ?", "? <= ?", "? not in ?"
}

export interface FilterGroup {
  id: string; // Group ID
  condition: string; // e.g., "and", "or"
  filters: EventFilterEntry[];
  subGroups: FilterGroup[]; // For nested filter groups
  origin: string; // e.g., "itemFilter", "filterFromFilterItem"
  // vizId at the group level indicates the dashboard item that originated this filter group (often a filter component itself)
  vizId?: string;
  clause?: string; // e.g., "where", "having"
}

export interface ChangedFiltersEventDetail {
  type: "changedFilters";
  origin: string; // e.g., "luzmo-embed-viz-item"
  item: string; // ID of the item that directly triggered the event
  changed: FilterGroup[]; // The filter group(s) that specifically changed
  filters: FilterGroup[]; // Array of ALL active filter groups on the dashboard
}
// --- End of Event Types ---
