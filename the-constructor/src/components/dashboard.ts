import type { LuzmoItemGrid, GridItemData } from '@luzmo/analytics-components-kit/item-grid';
import '@luzmo/analytics-components-kit/item-grid';
import type { Blueprint, CollectionData, DashboardTile, TilePosition } from '../types';
import { generateId } from '../store';
import type { Store } from '../store';
import { toAckChartType, getAckOptionsOverrides, isFilterWidgetType, isNonChartItemType } from '../chart-compatibility';
import { luzmoHosts } from '../luzmo/config';
import { attachGridLoadingOverlays } from './chart-loader';
import { createEditPanel } from './edit-panel';

// ---------------------------------------------------------------------------
// Dashboard Component — powered by <luzmo-item-grid>
// ---------------------------------------------------------------------------

/** Default item size (in grid units) when a new tile is added. */
const DEFAULT_SIZE_X = 6;
const DEFAULT_SIZE_Y = 4;

/** Maps chart type → theme.itemSpecific keys that inform chart-specific rounding options. */
const THEME_ROUNDING_MAP: Record<string, Array<{ path: string; themeKey: 'rounding' | 'padding' }>> = {
  'bar-chart':      [{ path: 'bars.roundedCorners',  themeKey: 'rounding' }],
  'column-chart':   [{ path: 'bars.roundedCorners',  themeKey: 'rounding' }],
  'heat-table':     [{ path: 'heattable.rounding',   themeKey: 'rounding' },
                     { path: 'heattable.spacing',    themeKey: 'padding'  }],
  'pyramid-chart':  [{ path: 'roundedCorners',        themeKey: 'rounding' },
                     { path: 'internalPadding',       themeKey: 'padding'  }],
  'box-plot':       [{ path: 'roundedCorners',        themeKey: 'rounding' }],
  'treemap-chart':  [{ path: 'roundedCorners',        themeKey: 'rounding' },
                     { path: 'padding',               themeKey: 'padding'  }],
  'sunburst-chart': [{ path: 'roundedCorners',        themeKey: 'rounding' },
                     { path: 'internalPadding',       themeKey: 'padding'  }],
  'pie-chart':      [{ path: 'slices.roundedCorners', themeKey: 'rounding' },
                     { path: 'slices.padding',        themeKey: 'padding'  }],
  'donut-chart':    [{ path: 'slices.roundedCorners', themeKey: 'rounding' },
                     { path: 'slices.padding',        themeKey: 'padding'  }],
};

/** Read a nested number from a record by dot-notation path. */
function getNestedNumber(obj: Record<string, unknown>, path: string): number | undefined {
  let cur: unknown = obj;
  for (const key of path.split('.')) {
    if (cur == null || typeof cur !== 'object' || Array.isArray(cur)) return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return typeof cur === 'number' ? cur : undefined;
}

/** Immutably set a value at a dot-notation path inside a record. */
function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: number,
): Record<string, unknown> {
  const dotIndex = path.indexOf('.');
  if (dotIndex === -1) return { ...obj, [path]: value };
  const head = path.slice(0, dotIndex);
  const tail = path.slice(dotIndex + 1);
  const child = (obj[head] as Record<string, unknown> | undefined) ?? {};
  return { ...obj, [head]: setNestedValue(child, tail, value) };
}

/**
 * Inject theme.itemSpecific rounding/padding defaults into chart options
 * for chart types that support them, only when not already explicitly set.
 */
function applyThemeRounding(
  chartType: string,
  options: Record<string, unknown>,
  itemSpecific: Record<string, unknown>,
): Record<string, unknown> {
  const entries = THEME_ROUNDING_MAP[chartType];
  if (!entries) return options;
  let result = options;
  for (const { path, themeKey } of entries) {
    const themeValue = itemSpecific[themeKey];
    if (typeof themeValue !== 'number') continue;
    if (getNestedNumber(result, path) !== undefined) continue;
    result = setNestedValue(result, path, themeValue);
  }
  return result;
}

/** Convert a DashboardTile + its Blueprint into a GridItemData object. */
function toGridItem(tile: DashboardTile, blueprint: Blueprint): GridItemData {
  const baseOptions = tile.optionsOverride ?? blueprint.options;
  const optionsWithTheme = blueprint.theme
    ? { ...baseOptions, theme: blueprint.theme }
    : baseOptions;

  const chartType = tile.typeOverride ?? blueprint.type;
  const rawItemSpecific =
    blueprint.theme && typeof blueprint.theme === 'object' && !Array.isArray(blueprint.theme)
      ? (blueprint.theme as Record<string, unknown>).itemSpecific
      : undefined;
  const optionsAfterTheme =
    rawItemSpecific && typeof rawItemSpecific === 'object' && !Array.isArray(rawItemSpecific)
      ? applyThemeRounding(chartType, optionsWithTheme, rawItemSpecific as Record<string, unknown>)
      : optionsWithTheme;

  const ackOverrides = getAckOptionsOverrides(chartType);
  const options = ackOverrides ? { ...optionsAfterTheme, ...ackOverrides } : optionsAfterTheme;

  // Filter widgets have no editable options — omit edit-options from their action menu.
  const actionsMenu: GridItemData['actionsMenu'] = isFilterWidgetType(chartType) || isNonChartItemType(chartType)
    ? [{ type: 'group', actions: ['delete'] }]
    : [{ type: 'group', actions: ['item-options', 'delete'] }];

  const item: GridItemData = {
    id: tile.id,
    type: toAckChartType(chartType),
    actionsMenu,
    options,
    slots: tile.slotsOverride ?? blueprint.slots,
    position: tile.position ?? {
      sizeX: DEFAULT_SIZE_X,
      sizeY: DEFAULT_SIZE_Y,
      row: 0,
      col: 0,
    },
  } as GridItemData;

  if (blueprint.filters?.length) {
    (item as unknown as Record<string, unknown>)['filters'] = blueprint.filters;
  }

  return item;
}

/** Set properties on a web-component after it has been defined. */
async function setElementProperties(
  element: HTMLElement,
  properties: Record<string, unknown>,
): Promise<void> {
  await customElements.whenDefined(element.localName);
  Object.assign(element, properties);
}

/**
 * Build DashboardTile[] from the template blueprints + positions.
 * Used for initial pre-rendering and the "Reset dashboard" action.
 * When a blueprint has no template position, assigns a fallback layout to avoid overlap.
 */
function buildTemplateTiles(collectionData: CollectionData): DashboardTile[] {
  const columns =
    collectionData.templateGridConfig?.columns ?? 12;
  const tiles: DashboardTile[] = [];
  let nextRow = 0;
  let nextCol = 0;

  for (const bp of collectionData.templateBlueprints) {
    const position = collectionData.templatePositions[bp.id];
    const tile: DashboardTile = {
      id: generateId(),
      blueprintId: bp.id,
      title: bp.name,
      createdAt: Date.now(),
      position: position ?? {
        col: nextCol,
        row: nextRow,
        sizeX: Math.min(DEFAULT_SIZE_X, columns - nextCol),
        sizeY: DEFAULT_SIZE_Y,
      },
    };
    tiles.push(tile);
    if (!position) {
      nextCol += Math.min(DEFAULT_SIZE_X, columns - nextCol);
      if (nextCol >= columns) {
        nextCol = 0;
        nextRow += DEFAULT_SIZE_Y;
      }
    }
  }
  return tiles;
}

export function renderDashboard(
  container: HTMLElement,
  store: Store,
  collectionData: CollectionData,
): void {
  const main = document.createElement('main');
  main.className = 'dashboard';

  // -- Header ---------------------------------------------------------------
  const header = document.createElement('header');
  header.className = 'dashboard__header';
  header.innerHTML = `
    <h1 class="dashboard__title">
      <img class="dashboard__logo" src="${import.meta.env.BASE_URL}icon-header.svg" width="28" height="28" alt="" aria-hidden="true"/>
      The Constructor
    </h1>
    <div class="dashboard__actions">
      <button class="dashboard__reset" aria-label="Reset dashboard">Reset dashboard</button>
      <button class="dashboard__clear" aria-label="Clear dashboard">Clear dashboard</button>
    </div>
  `;
  header.querySelector('.dashboard__clear')!.addEventListener('click', () => {
    store.dispatch({ type: 'CLEAR_TILES' });
    gridContainer.scrollTo({ top: 0, behavior: 'smooth' });
  });
  header.querySelector('.dashboard__reset')!.addEventListener('click', () => {
    store.dispatch({ type: 'RESET_DASHBOARD', payload: { tiles: buildTemplateTiles(collectionData) } });
    gridContainer.scrollTo({ top: 0, behavior: 'smooth' });
  });
  main.appendChild(header);

  // -- Grid container -------------------------------------------------------
  const gridContainer = document.createElement('section');
  gridContainer.className = 'dashboard__grid-container';
  main.appendChild(gridContainer);

  // -- Create <luzmo-item-grid> element -------------------------------------
  const gridEl = document.createElement('luzmo-item-grid') as LuzmoItemGrid;
  gridEl.id = 'dashboard-grid';
  gridContainer.appendChild(gridEl);

  const gridColumns = collectionData.templateGridConfig?.columns ?? 12;
  const gridRowHeight = collectionData.templateGridConfig?.rowHeight ?? 80;

  // Configure the grid after the custom element is defined
  setElementProperties(gridEl, {
    appServer: luzmoHosts.appServer,
    apiHost: luzmoHosts.apiHost,
    columns: gridColumns,
    rowHeight: gridRowHeight,
    viewMode: false,
    language: 'en',
    contentLanguage: 'en',
    ...(collectionData.templateGridTheme ? { theme: collectionData.templateGridTheme } : {}),
  });

  // -- Empty state ----------------------------------------------------------
  const empty = document.createElement('div');
  empty.className = 'dashboard__empty';
  empty.innerHTML = `
    <p class="dashboard__empty-text">Click a blueprint in the sidebar to add tiles</p>
  `;

  // -- Blueprint lookup map -------------------------------------------------
  // Built once from the collection; incremented when AI-generated blueprints
  // are pushed to collectionData.allBlueprints at runtime.
  const blueprintMap = new Map<string, Blueprint>(
    collectionData.allBlueprints.map((b) => [b.id, b]),
  );
  let blueprintCount = collectionData.allBlueprints.length;

  // -- Loop guard: prevents store → grid → store update cycles --------------
  let isUpdatingGrid = false;
  let gridReady = false;

  // -- Edit panel -----------------------------------------------------------
  const editPanel = createEditPanel(store, blueprintMap, (tileId) => {
    gridEl.triggerItemAction(tileId, 'item-options', { active: false });
  });
  main.appendChild(editPanel.element);

  // -- Listen to grid events ------------------------------------------------

  gridEl.addEventListener('luzmo-item-grid-item-action', ((event: CustomEvent) => {
    const { action, id, active } = event.detail ?? {};
    if (action === 'delete' && id) {
      event.preventDefault();
      store.dispatch({ type: 'REMOVE_TILE', payload: { tileId: id } });
    } else if (action === 'item-options' && id) {
      if (active === false) {
        editPanel.close();
      } else {
        editPanel.open(id);
      }
    }
  }) as EventListener);

  gridEl.addEventListener('luzmo-item-grid-changed', ((event: CustomEvent) => {
    if (isUpdatingGrid) return;

    const items: GridItemData[] = event.detail?.items ?? [];
    const positions: Record<string, TilePosition> = {};

    for (const item of items) {
      if (!item.id || !item.position) continue;
      positions[item.id] = {
        col: item.position.col,
        row: item.position.row,
        sizeX: item.position.sizeX,
        sizeY: item.position.sizeY,
      };
    }

    if (Object.keys(positions).length > 0) {
      store.dispatch({ type: 'UPDATE_POSITIONS', payload: { positions } });
    }
  }) as EventListener);

  // -- Sync store → grid (declarative: rebuild items array) -----------------
  function syncGrid(): void {
    if (!gridReady) return;

    // Pick up any AI-generated blueprints pushed to allBlueprints since last sync
    while (blueprintCount < collectionData.allBlueprints.length) {
      const bp = collectionData.allBlueprints[blueprintCount];
      blueprintMap.set(bp.id, bp);
      blueprintCount++;
    }

    const { tiles } = store.getState();
    const items: GridItemData[] = [];

    for (const tile of tiles) {
      const blueprint = blueprintMap.get(tile.blueprintId);
      if (!blueprint) continue;
      items.push(toGridItem(tile, blueprint));
    }

    isUpdatingGrid = true;
    gridEl.items = items;
    setTimeout(() => { isUpdatingGrid = false; }, 0);

    // Toggle empty state visibility
    const isEmpty = tiles.length === 0;
    if (isEmpty && !gridContainer.contains(empty)) {
      gridContainer.appendChild(empty);
    } else if (!isEmpty && gridContainer.contains(empty)) {
      gridContainer.removeChild(empty);
    }
  }

  store.subscribe(syncGrid);

  // Wait for the grid to be ready before populating initial tiles
  gridEl.addEventListener('luzmo-item-grid-ready', () => {
    gridReady = true;

    attachGridLoadingOverlays(gridEl);

    // Pre-render template if no saved tiles exist
    if (store.getState().tiles.length === 0 && collectionData.templateBlueprints.length > 0) {
      store.dispatch({ type: 'RESET_DASHBOARD', payload: { tiles: buildTemplateTiles(collectionData) } });
    }

    syncGrid();
  }, { once: true });

  container.appendChild(main);
}
