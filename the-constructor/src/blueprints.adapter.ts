import type { Blueprint, BlueprintGroup, CollectionData, ItemFilter, ItemFilterGroup, SelectedDataEntry, TilePosition } from './types';
import {
  fetchAccessibleDashboards,
  fetchDashboardRow,
  fetchTheme,
} from './luzmo/fetch-dashboard';
import type { DashboardFilter, DashboardFilterGroup, DashboardItem, DashboardRow, DashboardView, LocalizedString } from './luzmo/types';

// ---------------------------------------------------------------------------
// Luzmo Collection → Blueprint Adapter
// ---------------------------------------------------------------------------

/**
 * Pick the best view from the dashboard.
 * Prefers "fixed", then "desktop", then the first available view.
 */
function pickView(views: DashboardView[]): DashboardView | undefined {
  return (
    views.find((v) => v.screenModus === 'fixed') ??
    views.find((v) => v.screenModus === 'desktop') ??
    views[0]
  );
}

/**
 * Extract the first non-empty localized string value.
 */
function getLocalizedName(ls: LocalizedString | undefined): string {
  if (!ls) return '';
  return (
    ls.en ||
    Object.values(ls).find((v) => typeof v === 'string' && v) ||
    ''
  );
}

/**
 * Convert a string to PascalCase with spaces.
 * e.g. "revenue metrics" → "Revenue Metrics", "template" → "Template"
 */
function toPascalCaseWithSpaces(str: string): string {
  return str
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// ---------------------------------------------------------------------------
// Filter extraction helpers
// ---------------------------------------------------------------------------

/**
 * Normalize a raw filter parameter object: convert deprecated snake_case keys
 * (column_id, dataset_id) to camelCase (columnId, datasetId).
 */
function normalizeFilterParam(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k === 'column_id') out['columnId'] = v;
    else if (k === 'dataset_id') out['datasetId'] = v;
    else out[k] = v;
  }
  return out;
}

/** Normalize a raw DashboardFilter into an ItemFilter (camelCase params, no properties). */
function normalizeFilter(f: DashboardFilter): ItemFilter {
  const [rawParam, value] = f.parameters as [unknown, unknown];
  const param =
    rawParam && typeof rawParam === 'object' && !Array.isArray(rawParam)
      ? normalizeFilterParam(rawParam as Record<string, unknown>)
      : rawParam;
  return {
    expression: f.expression,
    parameters:
      value !== undefined && value !== null
        ? [param as ItemFilter['parameters'][0], value]
        : [param as ItemFilter['parameters'][0]],
  };
}

/** Recursively normalize a DashboardFilterGroup into an ItemFilterGroup. */
function normalizeFilterGroup(fg: DashboardFilterGroup): ItemFilterGroup {
  return {
    condition: fg.condition,
    filters: fg.filters.map(normalizeFilter),
    subGroups: fg.subGroups?.map(normalizeFilterGroup) ?? [],
  };
}

/**
 * Given a list of slots and a column/dataset pair, return the slot name that
 * contains that column, or null if not found.
 */
function findSlotName(
  slots: DashboardItem['slots'],
  columnId: string,
  datasetId: string,
): string | null {
  for (const slot of slots ?? []) {
    for (const content of slot.content ?? []) {
      const col = String(content.column ?? content.columnId ?? '');
      const ds = String(content.set ?? content.datasetId ?? '');
      if (col === columnId && ds === datasetId) return slot.name;
    }
  }
  return null;
}

/**
 * Build the `filters` (ItemFilterGroup[]) for an item from its "itemFilter" filterGroups.
 */
function buildItemFilters(
  filterGroups: DashboardFilterGroup[],
  itemId: string,
): ItemFilterGroup[] | undefined {
  const groups = filterGroups.filter(
    (fg) =>
      fg.origin === 'itemFilter' &&
      (fg.vizId === itemId || fg.itemId === itemId),
  );
  if (!groups.length) return undefined;
  return groups.map(normalizeFilterGroup);
}

/**
 * Build the `selectedData` for an item from its "filterFromFilterItem" filterGroups.
 * Slot names are resolved by matching the filter parameter's column/dataset to the item's slots.
 */
function buildSelectedData(
  filterGroups: DashboardFilterGroup[],
  itemId: string,
  slots: DashboardItem['slots'],
): Blueprint['selectedData'] | undefined {
  const groups = filterGroups.filter(
    (fg) =>
      fg.origin === 'filterFromFilterItem' &&
      (fg.vizId === itemId || fg.itemId === itemId),
  );
  if (!groups.length) return undefined;

  const andEntries: SelectedDataEntry[] = [];

  for (const group of groups) {
    for (const filter of group.filters) {
      const [rawParam, values] = filter.parameters as [unknown, unknown];
      if (!rawParam || typeof rawParam !== 'object' || Array.isArray(rawParam)) continue;

      const p = rawParam as Record<string, unknown>;
      const columnId = String(p.column_id ?? p.columnId ?? '');
      const datasetId = String(p.dataset_id ?? p.datasetId ?? '');
      if (!columnId || !datasetId) continue;

      const slotName = findSlotName(slots, columnId, datasetId);
      if (!slotName) continue;

      andEntries.push({
        expression: filter.expression,
        parameters: [{ slot: slotName }, values],
      });
    }
  }

  return andEntries.length ? { and: andEntries } : undefined;
}

// ---------------------------------------------------------------------------

/**
 * Map a Luzmo DashboardItem to our Blueprint interface.
 */
function mapItemToBlueprint(
  item: DashboardItem,
  filterGroups: DashboardFilterGroup[],
): Blueprint {
  const optTitle = item.options?.title;
  const fromOptions =
    optTitle?.en ||
    (optTitle && Object.values(optTitle).find((v) => typeof v === 'string' && v));
  const fromItem =
    item.title?.en ||
    Object.values(item.title ?? {}).find((v) => typeof v === 'string' && v);
  const name =
    (typeof fromOptions === 'string' && fromOptions) ||
    (typeof fromItem === 'string' && fromItem) ||
    'Untitled';

  const annotationContent = item.options?.annotate?.infoTooltip?.content;
  const description = annotationContent
    ? (annotationContent.en ||
       Object.values(annotationContent).find((v) => typeof v === 'string' && v) ||
       '')
    : '';

  const { annotate: _annotate, ...cleanOptions } = (item.options ?? {}) as Record<string, unknown>;

  const blueprint: Blueprint = {
    id: item.id,
    name: String(name),
    description: String(description),
    type: item.type,
    options: cleanOptions,
    slots: item.slots ?? [],
  };

  const filters = buildItemFilters(filterGroups, item.id);
  if (filters) blueprint.filters = filters;

  const selectedData = buildSelectedData(filterGroups, item.id, item.slots);
  if (selectedData) blueprint.selectedData = selectedData;

  return blueprint;
}

/**
 * Normalize dashboard item position to our TilePosition format.
 * Luzmo API may use col/row/sizeX/sizeY or GridStack-style x/y/w/h.
 */
function normalizePosition(pos: unknown): TilePosition | null {
  if (!pos || typeof pos !== 'object') return null;
  const p = pos as Record<string, unknown>;
  const col = (p.col ?? p.x) as number | undefined;
  const row = (p.row ?? p.y) as number | undefined;
  const sizeX = (p.sizeX ?? p.w) as number | undefined;
  const sizeY = (p.sizeY ?? p.h) as number | undefined;
  if (
    typeof col !== 'number' ||
    typeof row !== 'number' ||
    typeof sizeX !== 'number' ||
    typeof sizeY !== 'number'
  )
    return null;
  return { col, row, sizeX, sizeY };
}

/**
 * Resolve the theme from a dashboard view's options.
 * Returns the full inline config object when the theme is embedded (type: "custom"),
 * or just the theme ID string when it references a saved/system theme.
 */
function resolveViewTheme(
  viewTheme: Record<string, unknown> | undefined,
): string | Record<string, unknown> | undefined {
  if (!viewTheme) return undefined;

  // Inline custom theme: has type:"custom" plus config properties (font, colors, etc.)
  if (viewTheme.type === 'custom') {
    return viewTheme;
  }

  // Saved or system theme: just has an id
  const id = viewTheme.id;
  return typeof id === 'string' && id ? id : undefined;
}

function extractFromDashboard(row: DashboardRow): {
  blueprints: Blueprint[];
  positions: Record<string, TilePosition>;
  gridConfig: { columns: number; rowHeight: number };
  theme: string | Record<string, unknown> | undefined;
} {
  const view = pickView(row.contents?.views ?? []);
  if (!view)
    return {
      blueprints: [],
      positions: {},
      gridConfig: { columns: 48, rowHeight: 16 },
      theme: undefined,
    };

  const blueprints: Blueprint[] = [];
  const positions: Record<string, TilePosition> = {};
  const filterGroups: DashboardFilterGroup[] = view.filterGroups ?? [];

  for (const item of view.items) {
    blueprints.push(mapItemToBlueprint(item, filterGroups));
    const pos = normalizePosition(item.position);
    if (pos) positions[item.id] = pos;
  }

  const gridConfig = {
    columns: view.options.columns ?? 48,
    rowHeight: view.options.rowHeight ?? 16,
  };

  const theme = resolveViewTheme(
    view.options.theme as Record<string, unknown> | undefined,
  );

  return { blueprints, positions, gridConfig, theme };
}

/**
 * Identify the template dashboard from a list of dashboards.
 * Matches "template" case-insensitively on the dashboard name.
 * Falls back to the dashboard with the earliest `created_at`.
 */
function findTemplateDashboard(dashboards: DashboardRow[]): DashboardRow {
  const templateMatch = dashboards.find((d) => {
    const name = getLocalizedName(d.name);
    return name.toLowerCase() === 'template';
  });

  if (templateMatch) return templateMatch;

  const sorted = [...dashboards].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  return sorted[0];
}

/**
 * Fetch all dashboards accessible to the embed token and return structured
 * CollectionData with template info and grouped blueprints.
 */
export async function fetchCollectionData(): Promise<CollectionData> {
  const dashboards = await fetchAccessibleDashboards();

  if (dashboards.length === 0) {
    return {
      templateBlueprints: [],
      templatePositions: {},
      groups: [],
      allBlueprints: [],
      allPositions: {},
    };
  }

  const templateDashboard = findTemplateDashboard(dashboards);
  // Fetch full template via securable endpoint — collection include may omit
  // full contents (positions). Ensures we get accurate layout.
  const fullTemplate = await fetchDashboardRow(templateDashboard.id);
  const {
    blueprints: templateBlueprints,
    positions: templatePositions,
    gridConfig: templateGridConfig,
    theme: templateTheme,
  } = extractFromDashboard(fullTemplate);

  // Resolve the full theme config for the grid.
  // resolveViewTheme guarantees that any theme with an id is returned as a
  // string, so a string here always means "fetch the live version from the API".
  // An object here means a purely inline theme (no saved id) — use it directly.
  let templateGridTheme: Record<string, unknown> | undefined;
  if (typeof templateTheme === 'string') {
    templateGridTheme = await fetchTheme(templateTheme);
  } else if (typeof templateTheme === 'object') {
    templateGridTheme = templateTheme;
  }

  // Build groups: template first, then others in original order
  const groups: BlueprintGroup[] = [];
  const allBlueprints: Blueprint[] = [];
  const allPositions: Record<string, TilePosition> = { ...templatePositions };

  // Stamp blueprints with the freshly-fetched theme config so both the Flex SDK
  // (sidebar) and ACK grid items always receive a complete theme object.
  const resolvedBpTheme = templateGridTheme ?? templateTheme;
  for (const bp of templateBlueprints) {
    bp.theme = resolvedBpTheme;
  }

  // Template group always first
  const templateName = getLocalizedName(templateDashboard.name) || 'Template';
  groups.push({
    dashboardName: templateName,
    displayName: toPascalCaseWithSpaces(templateName),
    blueprints: templateBlueprints,
    theme: templateTheme,
  });
  allBlueprints.push(...templateBlueprints);

  // Other dashboards
  for (const dashboard of dashboards) {
    if (dashboard.id === templateDashboard.id) continue;

    const { blueprints, positions, gridConfig, theme } = extractFromDashboard(dashboard);
    if (blueprints.length === 0) continue;

    // Scale positions from this dashboard's grid to the template grid
    for (const [id, pos] of Object.entries(positions)) {
      allPositions[id] = {
        col: 0,
        row: 0,
        sizeX: Math.round(pos.sizeX * templateGridConfig.columns / gridConfig.columns),
        sizeY: Math.round(pos.sizeY * gridConfig.rowHeight / templateGridConfig.rowHeight),
      };
    }

    for (const bp of blueprints) {
      bp.theme = templateGridTheme ?? theme;
    }

    const name = getLocalizedName(dashboard.name) || 'Untitled';
    groups.push({
      dashboardName: name,
      displayName: toPascalCaseWithSpaces(name),
      blueprints,
      theme,
    });
    allBlueprints.push(...blueprints);
  }

  return {
    templateBlueprints,
    templatePositions,
    templateGridConfig,
    templateTheme,
    templateGridTheme,
    groups,
    allBlueprints,
    allPositions,
  };
}
