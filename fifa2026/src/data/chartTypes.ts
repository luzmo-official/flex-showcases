/**
 * All Luzmo Flex chart types from the component API reference.
 * @see https://developer.luzmo.com/guide/flex--chart-docs
 * @see https://developer.luzmo.com/guide/flex--component-api-reference#chart-type
 */
export const CHART_TYPE_OPTIONS = [
  { value: 'area-chart', label: 'Area chart' },
  { value: 'bar-chart', label: 'Bar chart' },
  { value: 'bubble-chart', label: 'Bubble chart' },
  { value: 'box-plot', label: 'Box plot' },
  { value: 'bullet-chart', label: 'Bullet chart' },
  { value: 'choropleth-map', label: 'Choropleth map' },
  { value: 'circular-gauge', label: 'Circular gauge' },
  { value: 'circle-pack-chart', label: 'Circle pack chart' },
  { value: 'column-chart', label: 'Column chart' },
  { value: 'combination-chart', label: 'Combination chart' },
  { value: 'conditional-number', label: 'Conditional number' },
  { value: 'date-filter', label: 'Date filter' },
  { value: 'donut-chart', label: 'Donut chart' },
  { value: 'dropdown-filter', label: 'Dropdown filter' },
  { value: 'evolution-number', label: 'Number with evolution' },
  { value: 'funnel-chart', label: 'Funnel chart' },
  { value: 'heat-map', label: 'Heat map' },
  { value: 'heat-table', label: 'Heat table' },
  { value: 'hexbin-map', label: 'Hexbin map' },
  { value: 'image', label: 'Image' },
  { value: 'line-chart', label: 'Line chart' },
  { value: 'marker-map', label: 'Marker map' },
  { value: 'ohlc-chart', label: 'Open-high-low-close chart' },
  { value: 'parallel-coordinates-plot', label: 'Parallel coordinates plot' },
  { value: 'pivot-table', label: 'Pivot table' },
  { value: 'pyramid-chart', label: 'Pyramid chart' },
  { value: 'radar-chart', label: 'Radar chart' },
  { value: 'regular-table', label: 'Regular table' },
  { value: 'route-map', label: 'Route map' },
  { value: 'sankey-diagram', label: 'Sankey diagram' },
  { value: 'scatter-plot', label: 'Scatter plot' },
  { value: 'slicer-filter', label: 'Slicer filter' },
  { value: 'slider-filter', label: 'Slider filter' },
  { value: 'speedometer-chart', label: 'Speedometer' },
  { value: 'spike-map', label: 'Spike map' },
  { value: 'strip-plot', label: 'Strip plot' },
  { value: 'sunburst-chart', label: 'Sunburst chart' },
  { value: 'symbol-map', label: 'Symbol map' },
  { value: 'text', label: 'Text' },
  { value: 'treemap-chart', label: 'Treemap chart' },
  { value: 'video', label: 'Video' },
  { value: 'wordcloud-chart', label: 'Word cloud chart' },
] as const

/** Slot names per chart type (from Luzmo Flex component API reference) */
export const CHART_SLOTS: Record<string, string[]> = {
  'area-chart': ['x-axis', 'measure', 'legend'],
  'bar-chart': ['y-axis', 'measure', 'legend'],
  'bubble-chart': ['category', 'measure', 'color'],
  'box-plot': ['category', 'measure'],
  'bullet-chart': ['category', 'measure', 'target'],
  'choropleth-map': ['geo', 'measure', 'category'],
  'circular-gauge': ['measure', 'target'],
  'circle-pack-chart': ['levels', 'measure'],
  'column-chart': ['x-axis', 'measure', 'legend'],
  'combination-chart': ['x-axis', 'measure'],
  'conditional-number': [],
  'date-filter': ['time'],
  'donut-chart': ['category', 'measure'],
  'dropdown-filter': ['dimension'],
  'evolution-number': ['evolution', 'measure'],
  'funnel-chart': ['category', 'measure'],
  'heat-map': ['geo', 'measure'],
  'heat-table': ['x-axis', 'y-axis', 'measure'],
  'hexbin-map': ['geo', 'measure'],
  'image': [],
  'line-chart': ['x-axis', 'measure', 'legend'],
  'marker-map': ['geo', 'measure'],
  'ohlc-chart': ['x-axis', 'open', 'high', 'low', 'close'],
  'parallel-coordinates-plot': ['coordinates', 'color'],
  'pivot-table': ['row', 'column', 'measure'],
  'pyramid-chart': ['y-axis', 'measure', 'legend'],
  'radar-chart': ['category', 'measure', 'legend'],
  'regular-table': ['columns'],
  'route-map': ['geo', 'order', 'legend', 'measure'],
  'sankey-diagram': ['source', 'destination', 'category', 'measure'],
  'scatter-plot': ['x-axis', 'y-axis', 'size', 'name', 'color'],
  'slicer-filter': ['dimension'],
  'slider-filter': ['slidermetric'],
  'speedometer-chart': ['target', 'measure'],
  'spike-map': ['geo', 'measure', 'color'],
  'strip-plot': ['y-axis', 'measure'],
  'sunburst-chart': ['levels', 'measure'],
  'symbol-map': ['geo', 'measure', 'category'],
  'text': [],
  'treemap-chart': ['category', 'measure', 'color'],
  'video': [],
  'wordcloud-chart': ['category', 'measure', 'color'],
}

export function getChartTypeLabel(type: string): string {
  return CHART_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type
}

export function getSlotsForChartType(chartType: string): string[] {
  return CHART_SLOTS[chartType] ?? []
}

/**
 * Slot names that expect a measure (numeric aggregation) per Luzmo.
 * Hierarchy/datetime columns in these slots only support min, max, count_row, count_distinct.
 */
export const MEASURE_SLOT_NAMES = new Set([
  'measure', 'target', 'size', 'open', 'high', 'low', 'close', 'slidermetric', 'evolution',
])

/** Aggregations allowed when a hierarchy or datetime column is used in a measure slot (Luzmo BasicItemQueryAggregation + min/max). */
export const ALLOWED_AGGREGATION_FOR_HIERARCHY = ['min', 'max', 'count', 'distinctcount'] as const

export const DEFAULT_AGGREGATION_FOR_HIERARCHY = 'distinctcount'

export function isMeasureSlot(chartType: string, slotName: string): boolean {
  const slots = CHART_SLOTS[chartType]
  return Boolean(slots?.includes(slotName) && MEASURE_SLOT_NAMES.has(slotName))
}

/** User-friendly display names for slot types (matching Luzmo's UI labels) */
const SLOT_DISPLAY_NAMES: Record<string, string> = {
  'x-axis': 'Category',
  'y-axis': 'Category',
  'measure': 'Measure',
  'legend': 'Group By',
  'category': 'Category',
  'color': 'Color',
  'size': 'Size',
  'target': 'Target',
  'geo': 'Location',
  'levels': 'Levels',
  'time': 'Time',
  'dimension': 'Dimension',
  'evolution': 'Evolution',
  'row': 'Row',
  'column': 'Column',
  'columns': 'Columns',
  'coordinates': 'Coordinates',
  'source': 'Source',
  'destination': 'Destination',
  'name': 'Name',
  'order': 'Order',
  'open': 'Open',
  'high': 'High',
  'low': 'Low',
  'close': 'Close',
  'slidermetric': 'Metric',
}

export function getSlotDisplayName(slotName: string): string {
  return SLOT_DISPLAY_NAMES[slotName] || slotName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
