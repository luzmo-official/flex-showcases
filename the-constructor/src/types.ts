// ---------------------------------------------------------------------------
// Domain Types
// ---------------------------------------------------------------------------

/** A blueprint represents a reusable chart definition (maps to a Luzmo item).
 *  Field names align with GridItemData so conversion to grid items is trivial. */
export interface Blueprint {
  id: string;
  name: string;
  description: string;
  /** Chart type — matches GridItemData.type (e.g. 'bar-chart') */
  type: string;
  /** Chart options — matches GridItemData.options */
  options: Record<string, unknown>;
  /** Data slots — matches GridItemData.slots */
  slots: unknown[];
  /** Theme from the source dashboard: a saved theme UUID, a built-in name, or a full inline config object. */
  theme?: string | Record<string, unknown>;
  /**
   * Item-level filters (origin: "itemFilter") extracted from the source dashboard's filterGroups.
   * Applied as the `filters` property on both Flex viz items and ACK grid items.
   */
  filters?: ItemFilterGroup[];
  /**
   * Initialization state (origin: "filterFromFilterItem") extracted from the source dashboard's filterGroups.
   * Applied as the `selectedData` property on Flex viz items only (ACK grid has no equivalent).
   * Shape: `{ and: Array<{ expression: string; parameters: [{ slot: string }, unknown] }> }`
   */
  selectedData?: { and: SelectedDataEntry[] };
}

/** A single entry within a `selectedData.and` array. */
export interface SelectedDataEntry {
  expression: string;
  parameters: [{ slot: string }, unknown];
}

/** Subset of @luzmo/dashboard-contents-types ItemFilterGroup used within blueprints. */
export interface ItemFilterGroup {
  condition: 'and' | 'or';
  filters: ItemFilter[];
  subGroups?: ItemFilterGroup[];
}

/** Subset of @luzmo/dashboard-contents-types ItemFilter used within blueprints. */
export interface ItemFilter {
  expression: string;
  parameters: [ItemFilterParam?, unknown?];
}

/** Normalized filter parameter (camelCase). */
export interface ItemFilterParam {
  columnId?: string;
  datasetId?: string;
  level?: number;
  lowestLevel?: number;
  [key: string]: unknown;
}

/** Grid item position (matches GridItemData.position from ACK). */
export interface TilePosition {
  sizeX: number;
  sizeY: number;
  row: number;
  col: number;
}

/** A tile placed on the user's dashboard canvas. */
export interface DashboardTile {
  id: string;
  blueprintId: string;
  title: string;
  createdAt: number;
  position?: TilePosition;
  /** Overrides the blueprint chart type when set (e.g. 'line-chart'). */
  typeOverride?: string;
  /** Overrides the blueprint options when set (e.g. legend toggled off). */
  optionsOverride?: Record<string, unknown>;
  /** Overrides the blueprint slots when a chart-type switch requires slot remapping. */
  slotsOverride?: unknown[];
}

// ---------------------------------------------------------------------------
// Collection / Grouped Blueprints
// ---------------------------------------------------------------------------

/** A group of blueprints originating from a single dashboard in the collection. */
export interface BlueprintGroup {
  dashboardName: string;
  /** PascalCased with spaces (e.g. "Revenue Metrics"). */
  displayName: string;
  blueprints: Blueprint[];
  /** Theme from this group's source dashboard: a saved theme UUID, built-in name, or full inline config. */
  theme?: string | Record<string, unknown>;
}

/** Data extracted from a Luzmo collection for the app to consume. */
export interface CollectionData {
  /** Blueprints from the template dashboard. */
  templateBlueprints: Blueprint[];
  /** Original grid positions from the template view, keyed by blueprint ID. */
  templatePositions: Record<string, TilePosition>;
  /** Grid dimensions from the template view (columns, rowHeight). Used so layout matches the template. */
  templateGridConfig?: { columns: number; rowHeight: number };
  /** Template dashboard theme for Flex viz items: UUID string, built-in name, or full inline config. */
  templateTheme?: string | Record<string, unknown>;
  /** Full resolved theme config for <luzmo-item-grid>. For inline themes this is the config itself;
   *  for saved themes it is fetched from the API. Grid needs the full object with type:"custom". */
  templateGridTheme?: Record<string, unknown>;
  /** All dashboards grouped by name (template first, then others). */
  groups: BlueprintGroup[];
  /** Flat list of every blueprint across all dashboards (for grid lookup). */
  allBlueprints: Blueprint[];
  /** Original positions for ALL blueprints (keyed by blueprint ID), scaled to the template grid. */
  allPositions: Record<string, TilePosition>;
}

// ---------------------------------------------------------------------------
// Application State
// ---------------------------------------------------------------------------

export interface AppState {
  tiles: DashboardTile[];
  aiBlueprints: Blueprint[];
  sidebarCollapsed: boolean;
  searchQuery: string;
}

// ---------------------------------------------------------------------------
// Store Actions
// ---------------------------------------------------------------------------

export type Action =
  | { type: 'ADD_TILE'; payload: { blueprint: Blueprint; position?: TilePosition } }
  | { type: 'REMOVE_TILE'; payload: { tileId: string } }
  | { type: 'CLEAR_TILES' }
  | { type: 'RESET_DASHBOARD'; payload: { tiles: DashboardTile[] } }
  | { type: 'UPDATE_POSITIONS'; payload: { positions: Record<string, TilePosition> } }
  | { type: 'UPDATE_TILE_TYPE'; payload: { tileId: string; chartType: string; slotsOverride?: unknown[] } }
  | { type: 'UPDATE_TILE_OPTIONS'; payload: { tileId: string; options: Record<string, unknown> } }
  | { type: 'ADD_AI_BLUEPRINT'; payload: { blueprint: Blueprint } }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SEARCH'; payload: { query: string } };

export type Listener = (state: AppState) => void;
