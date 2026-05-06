// ---------------------------------------------------------------------------
// Luzmo Dashboard API Response Types
// ---------------------------------------------------------------------------

export interface DashboardApiResponse {
  count: number;
  rows: DashboardRow[];
}

/** Luzmo dashboard (securable) row from the REST API. */
export interface DashboardRow {
  id: string;
  type: string;
  subtype: string;
  name: LocalizedString;
  description: LocalizedString;
  contents: DashboardContents;
  created_at: string;
  updated_at: string;
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
  views: DashboardView[];
}

export type ScreenMode =
  | 'mobile'
  | 'tablet'
  | 'desktop'
  | 'largeScreen'
  | 'fixed';

export interface DashboardView {
  screenModus: ScreenMode;
  options: ViewOptions;
  filterGroups?: DashboardFilterGroup[];
  items: DashboardItem[];
}

// ---------------------------------------------------------------------------
// Dashboard Filter Types (from view.filterGroups)
// ---------------------------------------------------------------------------

export type DashboardFilterOrigin = 'itemFilter' | 'filterFromFilterItem' | 'filterFromVizItem' | 'global';

export interface DashboardFilterParam {
  /** @deprecated use columnId */
  column_id?: string;
  columnId?: string;
  /** @deprecated use datasetId */
  dataset_id?: string;
  datasetId?: string;
  formula_id?: string;
  level?: number;
  lowestLevel?: number;
  [key: string]: unknown;
}

export interface DashboardFilter {
  expression: string;
  parameters: [DashboardFilterParam?, unknown?];
  properties?: {
    type?: string;
    id?: string;
    viz?: string;
    origin?: DashboardFilterOrigin;
    ignore?: unknown[];
    [key: string]: unknown;
  };
}

export interface DashboardFilterGroup {
  id?: string;
  origin?: DashboardFilterOrigin;
  condition: 'and' | 'or';
  filters: DashboardFilter[];
  subGroups: DashboardFilterGroup[];
  /** @deprecated use itemId */
  vizId?: string;
  itemId?: string;
  clause?: string;
}

export interface ViewOptions {
  theme?: Record<string, unknown>;
  columns?: number;
  rowHeight?: number;
  [key: string]: unknown;
}

export interface DashboardItem {
  id: string;
  type: string;
  position: ItemPosition;
  title: LocalizedString;
  options: ItemOptions;
  slots: ItemSlot[];
}

export interface ItemPosition {
  sizeX: number;
  sizeY: number;
  row: number;
  col: number;
}

export interface ItemOptions {
  title?: LocalizedString;
  annotate?: { infoTooltip?: { content?: LocalizedString } };
  [key: string]: unknown;
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
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Luzmo AI Chart API Types
// ---------------------------------------------------------------------------

/** A single suggested prompt returned by the generate-example-questions endpoint. */
export interface AIChartSuggestion {
  title: string;
  question?: string;
}

/** Response from the generate-example-questions endpoint. */
export interface AIExampleQuestionsResponse {
  suggestions?: AIChartSuggestion[];
  questions?: AIChartSuggestion[];
  [key: string]: unknown;
}

/** A slot content item as returned in the AI chart generate-chart response (uses Flex SDK format). */
export interface AIChartSlotContentItem {
  columnId?: string;
  datasetId?: string;
  label?: string | Record<string, unknown>;
  type: string;
  [key: string]: unknown;
}

/** A slot as returned in the AI chart generate-chart response. */
export interface AIChartSlot {
  name: string;
  content: AIChartSlotContentItem[];
}

/** The chart definition returned by the generate-chart endpoint. */
export interface AIChartGenerateResponse {
  type: string;
  options?: Record<string, unknown>;
  slots?: AIChartSlot[];
  position?: { sizeX: number; sizeY: number; row: number; col: number };
  aichartId?: string;
  [key: string]: unknown;
}

