import type { GlobalFilterState } from './cfo-config';

export type BuilderTab = 'data' | 'options';
export type AuthoringMode = 'guided' | 'advanced';
export type WorkspaceMode = 'builder' | 'fixed';
export type ThemeMode = 'light' | 'dark';

export interface LuceroOption {
  label: string;
  value: string;
}

export interface ReportLibraryModule {
  id: string;
  title: string;
  description: string;
  type: string;
}

export type SlotContentSubtype =
  | 'coordinates'
  | 'interval'
  | 'currency'
  | 'duration'
  | 'hierarchy_element_expression'
  | 'ip_address'
  | 'topography'
  | null;

export interface SlotContent {
  set: string;
  datasetId: string;
  type: string;
  label: Record<string, string>;
  subtype?: SlotContentSubtype;
  level?: number | null;
  lowestLevel?: number | null;
  format?: string;
  aggregationFunc?: string;
  datetimeDisplayMode?: string;
  column?: string;
  columnId?: string;
  formula?: string;
  formulaId?: string;
  [key: string]: unknown;
}

export interface SlotDefinition {
  name: string;
  content: SlotContent[];
}

export interface GridItemData {
  id?: string;
  type: string;
  position?: {
    sizeX: number;
    sizeY: number;
    row: number;
    col: number;
    minSizeX?: number;
    minSizeY?: number;
    maxSizeX?: number;
    maxSizeY?: number;
  };
  options?: Record<string, unknown>;
  slots?: SlotDefinition[];
  filters?: VizItemFilterGroup[];
}

export interface FilterCondition {
  expression: string;
  parameters: [Record<string, string>, string];
}

export interface VizItemFilterGroup {
  condition: 'and' | 'or';
  filters: FilterCondition[];
  subGroups: VizItemFilterGroup[];
}

export interface GridItemActionDetail {
  action?: string;
  actionType?: 'toggle' | 'button';
  active?: boolean;
  id?: string;
  deletedId?: string;
  items?: GridItemData[];
}

export interface GridChangedDetail {
  items?: GridItemData[];
}

export interface SlotsContentsChangedDetail {
  slotsContents?: SlotDefinition[];
}

export interface OptionsChangedDetail {
  options?: Record<string, unknown>;
}

export interface DashboardSnapshot {
  itemsModel: GridItemData[];
  selectedItemId: string | null;
  builderTab: BuilderTab;
  globalFilters: GlobalFilterState;
  authoringMode: AuthoringMode;
}

export interface SavedReportVersion {
  id: string;
  label: string;
  savedAt: string;
  snapshot: DashboardSnapshot;
}

export interface PersistedDashboardState {
  version: number;
  savedAt: string | null;
  snapshot: DashboardSnapshot;
  versions: SavedReportVersion[];
}

export interface NarrativeState {
  headline: string;
  summary: string;
  action: string;
}
