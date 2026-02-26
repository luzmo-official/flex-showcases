import '@luzmo/analytics-components-kit/edit-option';
import { itemList, itemGroups } from '@luzmo/analytics-components-kit/item-list';
import {
  areaChartOptionsConfig,
  barChartOptionsConfig,
  boxPlotOptionsConfig,
  bubbleChartOptionsConfig,
  bulletChartOptionsConfig,
  choroplethMapOptionsConfig,
  circlePackChartOptionsConfig,
  circularGaugeOptionsConfig,
  columnChartOptionsConfig,
  combinationChartOptionsConfig,
  conditionalNumberOptionsConfig,
  donutChartOptionsConfig,
  evolutionNumberOptionsConfig,
  funnelChartOptionsConfig,
  heatMapOptionsConfig,
  heatTableOptionsConfig,
  hexbinMapOptionsConfig,
  lineChartOptionsConfig,
  markerMapOptionsConfig,
  ohlcChartOptionsConfig,
  parallelCoordinatesPlotOptionsConfig,
  pivotTableOptionsConfig,
  pyramidChartOptionsConfig,
  radarChartOptionsConfig,
  regularTableOptionsConfig,
  routeMapOptionsConfig,
  sankeyDiagramOptionsConfig,
  scatterPlotOptionsConfig,
  speedometerChartOptionsConfig,
  spikeMapOptionsConfig,
  stripPlotOptionsConfig,
  sunburstChartOptionsConfig,
  symbolMapOptionsConfig,
  treemapChartOptionsConfig,
  wordcloudChartOptionsConfig,
} from '@luzmo/analytics-components-kit/item-options-configs';
import { switchItem } from '@luzmo/analytics-components-kit/utils';
import type { Blueprint, DashboardTile } from '../types';
import { getCompatibleChartTypes, toAckChartType } from '../chart-compatibility';
import type { Store } from '../store';
import type { ItemSlot } from '../luzmo/types';

// ---------------------------------------------------------------------------
// Edit Panel — slide-out editor for chart type & legend
// ---------------------------------------------------------------------------

// -- Chart types that support the display.legend option ----------------------
// Derived from item-options-configs: a type supports legend if its options
// config contains the 'display.legend' key.
// pie-chart reuses donut-chart's options config (no dedicated ACK config exists).

const OPTIONS_CONFIG_MAP: Record<string, unknown> = {
  // Standard XY charts
  'bar-chart':              barChartOptionsConfig,
  'grouped-bar-chart':      barChartOptionsConfig,
  'stacked-bar-chart':      barChartOptionsConfig,
  'column-chart':           columnChartOptionsConfig,
  'grouped-column-chart':   columnChartOptionsConfig,
  'stacked-column-chart':   columnChartOptionsConfig,
  'line-chart':             lineChartOptionsConfig,
  'grouped-line-chart':     lineChartOptionsConfig,
  'combination-chart':      combinationChartOptionsConfig,
  // Area charts
  'area-chart':             areaChartOptionsConfig,
  'stacked-area-chart':     areaChartOptionsConfig,
  '100-area-chart':         areaChartOptionsConfig,
  'streamgraph':            areaChartOptionsConfig,
  // Scatter / bubble
  'scatter-plot':           scatterPlotOptionsConfig,
  'scatter-group':          scatterPlotOptionsConfig,
  'bubble-plot':            scatterPlotOptionsConfig,
  'colored-bubble-plot':    scatterPlotOptionsConfig,
  'bubble-chart':           bubbleChartOptionsConfig,
  // Pie / donut
  'pie-chart':              donutChartOptionsConfig,
  'donut-chart':            donutChartOptionsConfig,
  'semi-pie-chart':         donutChartOptionsConfig,
  'semi-donut-chart':       donutChartOptionsConfig,
  // Proportional / slice
  'funnel-chart':           funnelChartOptionsConfig,
  'pyramid-chart':          pyramidChartOptionsConfig,
  'treemap-chart':          treemapChartOptionsConfig,
  'wordcloud-chart':        wordcloudChartOptionsConfig,
  'sunburst-chart':         sunburstChartOptionsConfig,
  'circle-pack-chart':      circlePackChartOptionsConfig,
  // Gauge / KPI
  'evolution-number':       evolutionNumberOptionsConfig,
  'conditional-number':     conditionalNumberOptionsConfig,
  'speedometer-chart':      speedometerChartOptionsConfig,
  'circular-gauge':         circularGaugeOptionsConfig,
  'bullet-chart':           bulletChartOptionsConfig,
  // Map charts
  'heat-map':               heatMapOptionsConfig,
  'choropleth-map':         choroplethMapOptionsConfig,
  'hexbin-map':             hexbinMapOptionsConfig,
  'marker-map':             markerMapOptionsConfig,
  'route-map':              routeMapOptionsConfig,
  'spike-map':              spikeMapOptionsConfig,
  'symbol-map':             symbolMapOptionsConfig,
  // Tables
  'heat-table':             heatTableOptionsConfig,
  'regular-table':          regularTableOptionsConfig,
  'pivot-table':            pivotTableOptionsConfig,
  // Statistical / analytical
  'box-plot':               boxPlotOptionsConfig,
  'strip-plot':             stripPlotOptionsConfig,
  'radar-chart':            radarChartOptionsConfig,
  'ohlc-chart':             ohlcChartOptionsConfig,
  'candlestick-chart':      ohlcChartOptionsConfig,
  'parallel-coordinates-plot': parallelCoordinatesPlotOptionsConfig,
  // Flow / relational
  'sankey-diagram':         sankeyDiagramOptionsConfig,
  'alluvial-diagram':       sankeyDiagramOptionsConfig,

};

const LEGEND_UNSUPPORTED_TYPES = new Set(
  Object.keys(OPTIONS_CONFIG_MAP).filter(
    (t) => !JSON.stringify(OPTIONS_CONFIG_MAP[t]).includes('display.legend'),
  ),
);

// -- Chart type catalogue for the picker ------------------------------------

interface ChartTypeEntry {
  value: string;
  label: string;
}

interface ChartTypeGroup {
  label: string;
  types: ChartTypeEntry[];
}

// The set of item keys (ACK itemList.item field) this app supports.
// Variants share their base type's slot/options config but carry their own
// item key so the type picker label reflects the visual mode correctly.
const SUPPORTED_ITEMS = new Set([
  // Standard XY charts
  'bar-chart', 'grouped-bar-chart', 'stacked-bar-chart',
  'column-chart', 'grouped-column-chart', 'stacked-column-chart',
  'line-chart', 'grouped-line-chart',
  'combination-chart',
  // Area
  'area-chart', 'stacked-area-chart', '100-area-chart', 'streamgraph',
  // Scatter / bubble
  'scatter-plot', 'scatter-group', 'bubble-plot', 'colored-bubble-plot',
  'bubble-chart',
  // Pie / donut
  'pie-chart', 'donut-chart', 'semi-pie-chart', 'semi-donut-chart',
  // Proportional / slice
  'funnel-chart', 'pyramid-chart', 'treemap-chart', 'wordcloud-chart',
  'sunburst-chart', 'circle-pack-chart',
  // Gauge / KPI
  'evolution-number', 'conditional-number', 'speedometer-chart',
  'circular-gauge', 'bullet-chart',
  // Map charts
  'heat-map', 'choropleth-map', 'hexbin-map', 'marker-map',
  'route-map', 'spike-map', 'symbol-map',
  // Tables
  'heat-table', 'regular-table', 'pivot-table',
  // Statistical / analytical
  'box-plot', 'strip-plot', 'radar-chart',
  'ohlc-chart', 'candlestick-chart', 'parallel-coordinates-plot',
  // Flow / relational
  'sankey-diagram', 'alluvial-diagram',
]);

// Build groups in itemGroups order, filtered to supported items only.
// entry.item is used as the value so pie-chart remains 'pie-chart' (not 'donut-chart').
const CHART_TYPE_GROUPS: ChartTypeGroup[] = itemGroups
  .map((group) => ({
    label: group.label,
    types: itemList
      .filter((i) => i.group === group.key && SUPPORTED_ITEMS.has(i.item))
      .map((i) => ({ value: i.item, label: i.label })),
  }))
  .filter((g) => g.types.length > 0);

// -- Public API -------------------------------------------------------------

export interface EditPanel {
  element: HTMLElement;
  open(tileId: string): void;
  close(): void;
}

export function createEditPanel(
  store: Store,
  blueprintMap: Map<string, Blueprint>,
  onClose?: (tileId: string) => void,
): EditPanel {

  // -- Panel root -----------------------------------------------------------
  const panel = document.createElement('aside');
  panel.className = 'edit-panel';
  panel.id = 'edit-panel';
  panel.setAttribute('aria-label', 'Edit chart');

  // -- Header ---------------------------------------------------------------
  const headerEl = document.createElement('header');
  headerEl.className = 'edit-panel__header';

  const titleEl = document.createElement('h3');
  titleEl.className = 'edit-panel__title';
  titleEl.textContent = 'Edit Chart';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'edit-panel__close';
  closeBtn.setAttribute('aria-label', 'Close edit panel');
  closeBtn.textContent = '\u2715';
  closeBtn.addEventListener('click', close);

  headerEl.appendChild(titleEl);
  headerEl.appendChild(closeBtn);
  panel.appendChild(headerEl);

  // -- Body (scrollable) ----------------------------------------------------
  const body = document.createElement('div');
  body.className = 'edit-panel__body';
  panel.appendChild(body);

  // -- Chart type section ---------------------------------------------------
  const typeSection = document.createElement('div');
  typeSection.className = 'edit-panel__section';

  const typeLabel = document.createElement('label');
  typeLabel.className = 'edit-panel__label';
  typeLabel.textContent = 'Chart Type';
  typeLabel.setAttribute('for', 'edit-panel-type-select');

  const typeSelect = document.createElement('select');
  typeSelect.className = 'edit-panel__select';
  typeSelect.id = 'edit-panel-type-select';

  typeSection.appendChild(typeLabel);
  typeSection.appendChild(typeSelect);
  body.appendChild(typeSection);

  // -- Legend section --------------------------------------------------------
  const legendSection = document.createElement('div');
  legendSection.className = 'edit-panel__section';

  const legendLabel = document.createElement('span');
  legendLabel.className = 'edit-panel__label';
  legendLabel.textContent = 'Legend';

  const legendOption = document.createElement('luzmo-edit-option');

  legendSection.appendChild(legendLabel);
  legendSection.appendChild(legendOption);
  body.appendChild(legendSection);

  // -- State ----------------------------------------------------------------
  let activeTileId: string | null = null;
  let isUpdatingLegend = false;

  // -- Helpers --------------------------------------------------------------

  function getTile(): DashboardTile | undefined {
    if (!activeTileId) return undefined;
    return store.getState().tiles.find((t) => t.id === activeTileId);
  }

  function getBlueprint(tile: DashboardTile): Blueprint | undefined {
    return blueprintMap.get(tile.blueprintId);
  }

  /** Effective chart type for a tile (respects overrides). */
  function effectiveType(tile: DashboardTile, bp: Blueprint): string {
    return tile.typeOverride ?? bp.type;
  }

  /** Effective options for a tile (respects overrides). */
  function effectiveOptions(tile: DashboardTile, bp: Blueprint): Record<string, unknown> {
    return tile.optionsOverride ?? bp.options;
  }

  /**
   * Populate the <select> with chart types compatible with the blueprint's
   * original slot configuration. Always computes from bp.type + bp.slots so
   * ACK slot-type misclassification on the current (remapped) type cannot
   * hide valid target types. The effective (override) type is always included
   * so the current selection is never lost.
   */
  function populateTypeSelect(effectiveChartType: string, bp: Blueprint): void {
    typeSelect.innerHTML = '';

    // Base compatibility on the original blueprint, not the remapped slotsOverride.
    const compatible = new Set(getCompatibleChartTypes(bp.type, bp.slots as ItemSlot[]));
    // Keep the current override selectable even if the original didn't include it.
    compatible.add(effectiveChartType);

    for (const group of CHART_TYPE_GROUPS) {
      const visibleTypes = group.types.filter((t) => compatible.has(t.value));
      if (visibleTypes.length === 0) continue;

      const optgroup = document.createElement('optgroup');
      optgroup.label = group.label;

      for (const t of visibleTypes) {
        const opt = document.createElement('option');
        opt.value = t.value;
        opt.textContent = t.label;
        optgroup.appendChild(opt);
      }

      typeSelect.appendChild(optgroup);
    }

    typeSelect.value = effectiveChartType;
  }

  /** Sync the legend ACK component with current tile state. */
  function syncLegendOption(chartType: string, options: Record<string, unknown>): void {
    const hasLegendSupport = !LEGEND_UNSUPPORTED_TYPES.has(chartType);
    legendSection.style.display = hasLegendSupport ? '' : 'none';

    if (hasLegendSupport) {
      isUpdatingLegend = true;
      customElements.whenDefined('luzmo-edit-option').then(() => {
        Object.assign(legendOption, {
          itemType: toAckChartType(chartType),
          optionKey: 'display.legend',
          options: options,
          language: 'en',
        });
        isUpdatingLegend = false;
      });
    }
  }

  // -- Chart type change handler --------------------------------------------

  async function handleTypeChange(): Promise<void> {
    const tile = getTile();
    const bp = tile ? getBlueprint(tile) : undefined;
    if (!tile || !bp || !activeTileId) return;

    const currentType = effectiveType(tile, bp);
    const newType = typeSelect.value;
    if (newType === currentType) return;

    // Always transform from the original blueprint type+slots, never from the
    // previously-remapped slotsOverride. This prevents cumulative data loss on
    // round-trips (e.g. column → combination → column restores both measures)
    // and avoids ACK slot-type misclassification on intermediate types.
    // When reverting to the original blueprint type, skip switchItem entirely —
    // clearing slotsOverride is enough to restore bp.slots via effectiveSlots.
    let slotsOverride: unknown[] | undefined;
    if (newType !== bp.type) {
      const result = await switchItem({
        oldItemType: toAckChartType(bp.type),
        newItemType: toAckChartType(newType),
        slots: bp.slots as unknown as Parameters<typeof switchItem>[0]['slots'],
      });
      slotsOverride = result.slots;
    }

    store.dispatch({
      type: 'UPDATE_TILE_TYPE',
      payload: { tileId: activeTileId, chartType: newType, slotsOverride },
    });

    // Re-sync the panel to reflect the new type
    const updatedTile = getTile();
    const updatedBp = updatedTile ? getBlueprint(updatedTile) : undefined;
    if (updatedTile && updatedBp) {
      populateTypeSelect(newType, updatedBp);
      syncLegendOption(newType, effectiveOptions(updatedTile, updatedBp));
    }
  }

  typeSelect.addEventListener('change', handleTypeChange);

  // -- Legend option change handler ------------------------------------------

  legendOption.addEventListener('luzmo-options-changed', ((e: CustomEvent) => {
    if (isUpdatingLegend) return;
    const tile = getTile();
    const bp = tile ? getBlueprint(tile) : undefined;
    if (!tile || !bp || !activeTileId) return;

    const newOptions = (e as CustomEvent<{ options: Record<string, unknown> }>).detail.options;
    const merged = { ...effectiveOptions(tile, bp), ...newOptions };
    store.dispatch({ type: 'UPDATE_TILE_OPTIONS', payload: { tileId: activeTileId, options: merged } });
  }) as EventListener);

  // -- Public methods -------------------------------------------------------

  function open(tileId: string): void {
    activeTileId = tileId;
    const tile = getTile();
    const bp = tile ? getBlueprint(tile) : undefined;

    if (!tile || !bp) {
      close();
      return;
    }

    const chartType = effectiveType(tile, bp);
    const options = effectiveOptions(tile, bp);

    titleEl.textContent = `Edit: ${tile.title}`;
    populateTypeSelect(chartType, bp);
    syncLegendOption(chartType, options);

    panel.toggleAttribute('open', true);
  }

  function close(): void {
    const tileId = activeTileId;
    activeTileId = null;
    panel.removeAttribute('open');
    if (tileId) onClose?.(tileId);
  }

  // Close panel when the edited tile is removed
  store.subscribe(() => {
    if (!activeTileId) return;
    const tile = getTile();
    if (!tile) close();
  });

  return { element: panel, open, close };
}
