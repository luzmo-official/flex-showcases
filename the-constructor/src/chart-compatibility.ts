import type { ItemSlot } from './luzmo/types';
import {
  areaChartSlotsConfig,
  barChartSlotsConfig,
  boxPlotSlotsConfig,
  bubbleChartSlotsConfig,
  bulletChartSlotsConfig,
  choroplethMapSlotsConfig,
  circlePackChartSlotsConfig,
  circularGaugeSlotsConfig,
  columnChartSlotsConfig,
  combinationChartSlotsConfig,
  conditionalNumberSlotsConfig,
  donutChartSlotsConfig,
  evolutionNumberSlotsConfig,
  funnelChartSlotsConfig,
  heatMapSlotsConfig,
  heatTableSlotsConfig,
  hexbinMapSlotsConfig,
  lineChartSlotsConfig,
  markerMapSlotsConfig,
  ohlcChartSlotsConfig,
  parallelCoordinatesPlotSlotsConfig,
  pivotTableSlotsConfig,
  pyramidChartSlotsConfig,
  radarChartSlotsConfig,
  regularTableSlotsConfig,
  routeMapSlotsConfig,
  sankeyDiagramSlotsConfig,
  scatterPlotSlotsConfig,
  speedometerChartSlotsConfig,
  spikeMapSlotsConfig,
  stripPlotSlotsConfig,
  sunburstChartSlotsConfig,
  symbolMapSlotsConfig,
  treemapChartSlotsConfig,

  wordcloudChartSlotsConfig,
} from '@luzmo/analytics-components-kit/item-slots-configs';

// ---------------------------------------------------------------------------
// Chart Type Compatibility — determines which chart types are valid targets
// given a source chart's current slot content.
// ---------------------------------------------------------------------------

/** Minimal slot config shape we rely on for role derivation. */
interface SlotConfigEntry {
  name: string;
  type?: string;
  acceptableDataFieldTypes?: string[];
}

/** Named slot roles for a chart type. */
interface SlotRoles {
  /** Slot name(s) that hold metrics / measures. */
  measures: string[];
  /** Primary category / axis slot name. */
  dimension?: string;
  /** Legend / color / series-split slot name. */
  groupBy?: string;
  /** Spatial slot name (heat-map only). */
  geo?: string;
}

/** Describes the data shape currently occupying a chart's slots. */
export interface SlotAnalysis {
  /** Total items across all measure-role slots. */
  measureCount: number;
  /** Primary dimension slot has ≥1 item. */
  hasDimension: boolean;
  /** Group-by slot has ≥1 item. */
  hasGroupBy: boolean;
  /** Geo slot has ≥1 item, or any slot contains a spatial-typed item. */
  hasGeo: boolean;
  /** Any slot contains an item with type `'hierarchy'`. */
  hasHierarchy: boolean;
  /** Primary dimension slot contains at least one item with type `'datetime'`. */
  hasDatetime: boolean;
  /** No content exists across all slots. */
  isEmpty: boolean;
  /** Number of non-geo, non-numeric slots with ≥1 item (derived from the type's slot config). */
  populatedCategoricalCount: number;
}

// ---------------------------------------------------------------------------
// Slot config map — built from ACK item-slots-configs
// ---------------------------------------------------------------------------

// Variants that share a base type's slot structure reuse that config.
// pie-chart, semi-pie-chart, semi-donut-chart → donut-chart config
// grouped/stacked variants → their base type config
// alluvial-diagram → sankey-diagram config; candlestick-chart → ohlc-chart config
const SLOTS_CONFIG_MAP: Record<string, readonly SlotConfigEntry[]> = {
  // Standard XY charts
  'bar-chart':              barChartSlotsConfig              as unknown as SlotConfigEntry[],
  'grouped-bar-chart':      barChartSlotsConfig              as unknown as SlotConfigEntry[],
  'stacked-bar-chart':      barChartSlotsConfig              as unknown as SlotConfigEntry[],
  'column-chart':           columnChartSlotsConfig           as unknown as SlotConfigEntry[],
  'grouped-column-chart':   columnChartSlotsConfig           as unknown as SlotConfigEntry[],
  'stacked-column-chart':   columnChartSlotsConfig           as unknown as SlotConfigEntry[],
  'line-chart':             lineChartSlotsConfig             as unknown as SlotConfigEntry[],
  'grouped-line-chart':     lineChartSlotsConfig             as unknown as SlotConfigEntry[],
  'combination-chart':      combinationChartSlotsConfig      as unknown as SlotConfigEntry[],
  // Area charts
  'area-chart':             areaChartSlotsConfig             as unknown as SlotConfigEntry[],
  'stacked-area-chart':     areaChartSlotsConfig             as unknown as SlotConfigEntry[],
  '100-area-chart':         areaChartSlotsConfig             as unknown as SlotConfigEntry[],
  'streamgraph':            areaChartSlotsConfig             as unknown as SlotConfigEntry[],
  // Scatter / bubble plots
  'scatter-plot':           scatterPlotSlotsConfig           as unknown as SlotConfigEntry[],
  'scatter-group':          scatterPlotSlotsConfig           as unknown as SlotConfigEntry[],
  'bubble-plot':            scatterPlotSlotsConfig           as unknown as SlotConfigEntry[],
  'colored-bubble-plot':    scatterPlotSlotsConfig           as unknown as SlotConfigEntry[],
  'bubble-chart':           bubbleChartSlotsConfig           as unknown as SlotConfigEntry[],
  // Pie / donut
  'pie-chart':              donutChartSlotsConfig            as unknown as SlotConfigEntry[],
  'donut-chart':            donutChartSlotsConfig            as unknown as SlotConfigEntry[],
  'semi-pie-chart':         donutChartSlotsConfig            as unknown as SlotConfigEntry[],
  'semi-donut-chart':       donutChartSlotsConfig            as unknown as SlotConfigEntry[],
  // Proportional / slice
  'funnel-chart':           funnelChartSlotsConfig           as unknown as SlotConfigEntry[],
  'pyramid-chart':          pyramidChartSlotsConfig          as unknown as SlotConfigEntry[],
  'treemap-chart':          treemapChartSlotsConfig          as unknown as SlotConfigEntry[],
  'wordcloud-chart':        wordcloudChartSlotsConfig        as unknown as SlotConfigEntry[],
  'sunburst-chart':         sunburstChartSlotsConfig         as unknown as SlotConfigEntry[],
  'circle-pack-chart':      circlePackChartSlotsConfig       as unknown as SlotConfigEntry[],
  // Gauge / KPI
  'evolution-number':       evolutionNumberSlotsConfig       as unknown as SlotConfigEntry[],
  'conditional-number':     conditionalNumberSlotsConfig     as unknown as SlotConfigEntry[],
  'speedometer-chart':      speedometerChartSlotsConfig      as unknown as SlotConfigEntry[],
  'circular-gauge':         circularGaugeSlotsConfig         as unknown as SlotConfigEntry[],
  'bullet-chart':           bulletChartSlotsConfig           as unknown as SlotConfigEntry[],
  // Map charts (geo-based)
  'heat-map':               heatMapSlotsConfig               as unknown as SlotConfigEntry[],
  'choropleth-map':         choroplethMapSlotsConfig         as unknown as SlotConfigEntry[],
  'hexbin-map':             hexbinMapSlotsConfig             as unknown as SlotConfigEntry[],
  'marker-map':             markerMapSlotsConfig             as unknown as SlotConfigEntry[],
  'route-map':              routeMapSlotsConfig              as unknown as SlotConfigEntry[],
  'spike-map':              spikeMapSlotsConfig              as unknown as SlotConfigEntry[],
  'symbol-map':             symbolMapSlotsConfig             as unknown as SlotConfigEntry[],
  // Tables
  'heat-table':             heatTableSlotsConfig             as unknown as SlotConfigEntry[],
  'regular-table':          regularTableSlotsConfig          as unknown as SlotConfigEntry[],
  'pivot-table':            pivotTableSlotsConfig            as unknown as SlotConfigEntry[],
  // Statistical / analytical
  'box-plot':               boxPlotSlotsConfig               as unknown as SlotConfigEntry[],
  'strip-plot':             stripPlotSlotsConfig             as unknown as SlotConfigEntry[],
  'radar-chart':            radarChartSlotsConfig            as unknown as SlotConfigEntry[],
  'ohlc-chart':             ohlcChartSlotsConfig             as unknown as SlotConfigEntry[],
  'candlestick-chart':      ohlcChartSlotsConfig             as unknown as SlotConfigEntry[],
  'parallel-coordinates-plot': parallelCoordinatesPlotSlotsConfig as unknown as SlotConfigEntry[],
  // Flow / relational
  'sankey-diagram':         sankeyDiagramSlotsConfig         as unknown as SlotConfigEntry[],
  'alluvial-diagram':       sankeyDiagramSlotsConfig         as unknown as SlotConfigEntry[],

};

// ---------------------------------------------------------------------------
// Role derivation
// ---------------------------------------------------------------------------

/**
 * Manual role overrides for types where automatic slot-type classification
 * does not correctly reflect the "measure vs. dimension" semantics:
 *
 * - scatter-plot: x-axis and y-axis are positional measures (type='mixed'),
 *   not a dimension/groupBy pair.
 * - evolution-number: the 'evolution' slot is a datetime anchor, not a
 *   categorical dimension in the compatibility sense.
 */
const SLOT_ROLES_OVERRIDES: Record<string, SlotRoles> = {
  'scatter-plot':    { measures: ['x-axis', 'y-axis'], groupBy: 'color' },
  'evolution-number': { measures: ['measure'] },
};

/**
 * Derives slot roles for a chart type from its ACK slot config.
 *
 * Classification rules (applied in slot order):
 *  - Slot named 'geo', OR with acceptableDataFieldTypes containing 'spatial' → geo
 *  - type='numeric' → measure
 *  - type='categorical' | 'mixed' (first remaining) → dimension
 *  - type='categorical' | 'mixed' (second remaining) → groupBy
 */
function getSlotRoles(type: string): SlotRoles {
  const override = SLOT_ROLES_OVERRIDES[type];
  if (override) return override;

  const config = SLOTS_CONFIG_MAP[type];
  if (!config) return { measures: [] };

  const measures: string[] = [];
  let dimension: string | undefined;
  let groupBy: string | undefined;
  let geo: string | undefined;

  for (const slot of config) {
    if (slot.name === 'geo' || slot.acceptableDataFieldTypes?.includes('spatial')) {
      geo = slot.name;
    } else if (slot.type === 'numeric') {
      measures.push(slot.name);
    } else {
      if (!dimension) dimension = slot.name;
      else if (!groupBy) groupBy = slot.name;
    }
  }

  return { measures, dimension, groupBy, geo };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slotContentCount(slots: ItemSlot[], name: string): number {
  return slots.find((s) => s.name === name)?.content.length ?? 0;
}

function slotHasContent(slots: ItemSlot[], name: string | undefined): boolean {
  if (!name) return false;
  return slotContentCount(slots, name) > 0;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Derives a summary of the data currently occupying a chart's slots,
 * normalised through the chart type's role map.
 */
export function analyzeSlots(type: string, slots: ItemSlot[]): SlotAnalysis {
  const roles = getSlotRoles(type);

  const measureCount = roles.measures.reduce(
    (sum, name) => sum + slotContentCount(slots, name),
    0,
  );

  const hasDimension = slotHasContent(slots, roles.dimension);
  const hasGroupBy   = slotHasContent(slots, roles.groupBy);
  const hasGeo       = slotHasContent(slots, roles.geo) ||
    slots.some((s) => s.content.some((c) => c.type === 'spatial'));

  const hasHierarchy = slots.some((s) =>
    s.content.some((c) => c.type === 'hierarchy'),
  );

  // Datetime detection: check the primary dimension slot specifically.
  // scatter-plot has no dimension role; fall back to scanning all slots.
  const dimSlot = roles.dimension
    ? slots.find((s) => s.name === roles.dimension)
    : undefined;
  const hasDatetime = dimSlot
    ? dimSlot.content.some((c) => c.type === 'datetime')
    : slots.some((s) => s.content.some((c) => c.type === 'datetime'));

  const totalContent = slots.reduce((sum, s) => sum + s.content.length, 0);
  const isEmpty = totalContent === 0;

  const config = SLOTS_CONFIG_MAP[type];
  const populatedCategoricalCount = config
    ? config.filter(
        (sc) =>
          sc.name !== 'geo' &&
          !sc.acceptableDataFieldTypes?.includes('spatial') &&
          sc.type !== 'numeric' &&
          slotHasContent(slots, sc.name),
      ).length
    : 0;

  return { measureCount, hasDimension, hasGroupBy, hasGeo, hasHierarchy, hasDatetime, isEmpty, populatedCategoricalCount };
}

// ---------------------------------------------------------------------------
// Filter widget families — morphable sibling groups
// ---------------------------------------------------------------------------

/**
 * Filter widgets grouped by the data type they operate on.
 * Each key maps to the full list of sibling types the widget can morph into.
 *
 * - Date family:       date-filter ↔ date-comparison-filter
 * - Categorical family: all slicer variants + dropdown + rank slicer
 * - Numeric family:    slider-filter (no siblings)
 * - Text family:       search-filter (no siblings)
 */
const FILTER_WIDGET_FAMILIES: Record<string, string[]> = {
  'date-filter':             ['date-filter', 'date-comparison-filter'],
  'date-comparison-filter':  ['date-filter', 'date-comparison-filter'],
  'slicer-filter-vertical':  ['slicer-filter-vertical', 'slicer-filter-horizontal', 'slicer-filter-table', 'dropdown-filter', 'rank-slicer-filter'],
  'slicer-filter-horizontal':['slicer-filter-vertical', 'slicer-filter-horizontal', 'slicer-filter-table', 'dropdown-filter', 'rank-slicer-filter'],
  'slicer-filter-table':     ['slicer-filter-vertical', 'slicer-filter-horizontal', 'slicer-filter-table', 'dropdown-filter', 'rank-slicer-filter'],
  'dropdown-filter':         ['slicer-filter-vertical', 'slicer-filter-horizontal', 'slicer-filter-table', 'dropdown-filter', 'rank-slicer-filter'],
  'rank-slicer-filter':      ['slicer-filter-vertical', 'slicer-filter-horizontal', 'slicer-filter-table', 'dropdown-filter', 'rank-slicer-filter'],
  'slider-filter':           ['slider-filter'],
  'search-filter':           ['search-filter'],
};

/** Returns `true` when the type is a filter widget (morphable within its family). */
export function isFilterWidgetType(type: string): boolean {
  return Object.prototype.hasOwnProperty.call(FILTER_WIDGET_FAMILIES, type);
}

// ---------------------------------------------------------------------------
// Non-chart content blocks — cannot be morphed at all
// ---------------------------------------------------------------------------

/**
 * Non-interactive content blocks that carry no data slots and have no
 * compatible morph targets (text, image, video, spacer).
 */
const CONTENT_BLOCK_TYPES = new Set(['text', 'image', 'video', 'spacer']);

/**
 * Returns `true` when the type is a non-chart content block that cannot be
 * morphed to any other type. Filter widgets are NOT included — they morph
 * within their own family via `FILTER_WIDGET_FAMILIES`.
 */
export function isNonChartItemType(type: string): boolean {
  return CONTENT_BLOCK_TYPES.has(type) ||
    (!SLOTS_CONFIG_MAP[type] && !isFilterWidgetType(type));
}

// ---------------------------------------------------------------------------
// Datetime-incompatible chart types
// ---------------------------------------------------------------------------

/**
 * Chart types that do not make sense when the primary dimension is a datetime
 * column. These are proportion/slice/frequency types that rely on categorical
 * membership rather than a continuous time axis.
 */
const DATETIME_INCOMPATIBLE_TYPES = new Set([
  'pie-chart',
  'donut-chart',
  'funnel-chart',
  'pyramid-chart',
  'treemap-chart',
  'wordcloud-chart',
  'sunburst-chart',
]);

// ---------------------------------------------------------------------------
// App-to-ACK type mapping
// ---------------------------------------------------------------------------

/**
 * Maps app-facing item keys to the ACK chart type string used by grid items,
 * `luzmo-item-option`, and `switchItem`. Variants share an ACK type with their
 * base but differ only in their mode/display options.
 */
const APP_TO_ACK_TYPE: Record<string, string> = {
  // Donut family
  'pie-chart':            'donut-chart',
  'semi-pie-chart':       'donut-chart',
  'semi-donut-chart':     'donut-chart',
  // Bar / column variants
  'grouped-bar-chart':    'bar-chart',
  'stacked-bar-chart':    'bar-chart',
  'grouped-column-chart': 'column-chart',
  'stacked-column-chart': 'column-chart',
  // Line variant
  'grouped-line-chart':   'line-chart',
  // Area variants
  'stacked-area-chart':   'area-chart',
  '100-area-chart':       'area-chart',
  'streamgraph':          'area-chart',
  // Scatter variants
  'scatter-group':        'scatter-plot',
  'bubble-plot':          'scatter-plot',
  'colored-bubble-plot':  'scatter-plot',
  // Financial
  'candlestick-chart':    'ohlc-chart',
  // Flow
  'alluvial-diagram':     'sankey-diagram',
};

/**
 * Converts an app-facing item key to the ACK chart type passed to grid items,
 * `luzmo-item-option`, and `switchItem`.
 */
export function toAckChartType(type: string): string {
  return APP_TO_ACK_TYPE[type] ?? type;
}

/**
 * Returns options that must be merged into the chart options for app-facing
 * types that map to an ACK type with a distinct visual mode (e.g. `pie-chart`
 * renders as `donut-chart` with `mode: "pie"`). The override is applied at
 * render time so the stored item key is always the source of truth.
 */
export function getAckOptionsOverrides(type: string): Record<string, unknown> | null {
  switch (type) {
    case 'pie-chart':          return { mode: 'pie' };
    case 'semi-pie-chart':     return { mode: 'semi-pie' };
    case 'semi-donut-chart':   return { mode: 'semi-donut' };
    case 'stacked-bar-chart':  return { mode: 'stacked' };
    case 'stacked-column-chart': return { mode: 'stacked' };
    case '100-area-chart':     return { mode: '100' };
    case 'streamgraph':        return { mode: 'stream' };
    default:                   return null;
  }
}

/**
 * Returns the chart types that are compatible with the current chart's slot
 * configuration. Always includes `currentType`. Returns all types when the
 * chart has no data mapped.
 */
export function getCompatibleChartTypes(
  currentType: string,
  slots: ItemSlot[],
): string[] {
  // Filter widgets morph only within their compatibility family.
  if (isFilterWidgetType(currentType)) {
    return FILTER_WIDGET_FAMILIES[currentType]!;
  }

  // Non-chart content blocks (text, image, video, spacer) cannot be morphed.
  if (isNonChartItemType(currentType)) {
    return [currentType];
  }

  // regular-table shows raw un-aggregated rows — incompatible with every other type.
  if (currentType === 'regular-table') {
    return ['regular-table'];
  }

  const analysis = analyzeSlots(currentType, slots);

  // Empty chart — no data mapped yet, all non-table/non-filter types are valid options.
  if (analysis.isEmpty) {
    return Object.keys(SLOTS_CONFIG_MAP).filter((t) => t !== 'regular-table');
  }

  const { measureCount, hasDimension, hasGroupBy, hasGeo, hasHierarchy, hasDatetime, populatedCategoricalCount } = analysis;

  const compatible = new Set<string>();

  // Helper to conditionally add a base type.
  const add = (type: string, condition: boolean) => {
    if (condition && hasDatetime && DATETIME_INCOMPATIBLE_TYPES.has(type)) return;
    if (condition) compatible.add(type);
  };

  // Standard charts — require at least one measure to render.
  const hasMeasure = measureCount >= 1;
  add('bar-chart',         hasMeasure);
  add('column-chart',      hasMeasure);
  add('line-chart',        hasMeasure);
  add('area-chart',        hasMeasure);
  add('combination-chart', hasMeasure);

  // Proportional / slice charts — single measure, one dimension, no group-by.
  const singleDimNoGroup = measureCount === 1 && hasDimension && !hasGroupBy;
  add('pie-chart',       singleDimNoGroup);
  add('donut-chart',     singleDimNoGroup);
  add('funnel-chart',    singleDimNoGroup);
  add('pyramid-chart',   singleDimNoGroup);
  add('treemap-chart',   singleDimNoGroup);
  add('wordcloud-chart', singleDimNoGroup);

  // Hierarchical — sunburst and circle-pack need a hierarchy or categorical levels column.
  add('sunburst-chart',    measureCount <= 1 && hasHierarchy);
  add('circle-pack-chart', measureCount <= 1 && hasDimension);

  // Scatter — exactly 2 measures mapped with no separate dimension.
  add('scatter-plot', measureCount === 2 && !hasDimension);

  // Bubble — 2+ measures plus a dimension for the category.
  add('bubble-chart', measureCount >= 2 && hasDimension);

  // Geo / map charts — spatial column required.
  add('heat-map',       hasGeo);
  add('choropleth-map', hasGeo);
  add('hexbin-map',     hasGeo);
  add('marker-map',     hasGeo);
  add('route-map',      hasGeo);
  add('spike-map',      hasGeo);
  add('symbol-map',     hasGeo);

  // Heat table — one measure with both a row axis (dimension) and a column axis (groupBy).
  add('heat-table', measureCount === 1 && hasDimension && hasGroupBy);

  // Statistical single-series charts.
  add('box-plot',   measureCount === 1 && hasDimension);
  add('strip-plot', measureCount === 1 && hasDimension);
  add('radar-chart', measureCount === 1 && hasDimension);

  // Financial — open, high, low, close (4 measures) plus a time dimension.
  add('ohlc-chart', measureCount >= 4 && hasDimension);

  // Multi-dimensional / relational.
  add('parallel-coordinates-plot', measureCount >= 2);
  add('sankey-diagram', populatedCategoricalCount >= 3 && hasMeasure);

  // Pivot table — always compatible from non-table sources.
  add('pivot-table', true);

  // Single-value charts — one measure, no separate dimension or group-by.
  const singleValueOnly = measureCount === 1 && !hasDimension && !hasGroupBy;
  add('evolution-number',    singleValueOnly);
  add('conditional-number',  measureCount >= 1 && measureCount <= 2 && !hasDimension && !hasGroupBy);
  add('speedometer-chart',   singleValueOnly);
  add('circular-gauge',      singleValueOnly);

  // Bullet chart — single measure, group-by not supported.
  add('bullet-chart', measureCount === 1 && !hasGroupBy);

  // Propagate to variants: any variant of an already-compatible base type is
  // also compatible. Variants only differ in mode/display options, not slot structure.
  const VARIANT_TO_BASE: Record<string, string> = {
    'grouped-bar-chart':    'bar-chart',
    'stacked-bar-chart':    'bar-chart',
    'grouped-column-chart': 'column-chart',
    'stacked-column-chart': 'column-chart',
    'grouped-line-chart':   'line-chart',
    'stacked-area-chart':   'area-chart',
    '100-area-chart':       'area-chart',
    'streamgraph':          'area-chart',
    'scatter-group':        'scatter-plot',
    'bubble-plot':          'scatter-plot',
    'colored-bubble-plot':  'scatter-plot',
    'semi-pie-chart':       'donut-chart',
    'semi-donut-chart':     'donut-chart',
    'candlestick-chart':    'ohlc-chart',
    'alluvial-diagram':     'sankey-diagram',
  };
  for (const [variant, base] of Object.entries(VARIANT_TO_BASE)) {
    if (compatible.has(base)) compatible.add(variant);
  }

  // Always ensure the source type remains selectable.
  compatible.add(currentType);

  return [...compatible];
}
