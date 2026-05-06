/**
 * Shared Luzmo-specific TypeScript types.
 * These mirror the shapes used by ACK components and Luzmo Embed.
 */

// ─── Slot types ────────────────────────────────────────────

export interface SlotContent {
  columnId?: string
  formulaId?: string
  datasetId?: string
  set?: string
  label?: Record<string, string>
  format?: string
  type?: string
}

export interface VizItemSlot {
  name: string
  content: SlotContent[]
}

export type VizItemSlots = VizItemSlot[]

/**
 * Normalize a VizItemSlots value so it's always a well-formed array.
 * Guarantees: returned value is an array, every slot has content as an array,
 * and no content entry is null/undefined.
 */
export function normalizeSlotsContents(
  slots: VizItemSlots | undefined | null,
): VizItemSlots {
  if (!slots || !Array.isArray(slots)) return []
  return slots.map((slot) => ({
    ...slot,
    content: Array.isArray(slot.content)
      ? slot.content.filter(Boolean)
      : [],
  }))
}

/**
 * Remap internal singular slot names to the names the Flex embed expects
 * for a given table type.
 *
 * Internally we always use pivot-table keys: "row", "column", "measure".
 * - pivot-table: pass through unchanged.
 * - regular-table: rename "column" → "columns", drop "row"/"measure".
 */
export function remapSlotsForTableType(
  slots: VizItemSlots,
  tableType: "regular-table" | "pivot-table",
): VizItemSlots {
  const normalized = normalizeSlotsContents(slots)
  if (tableType === "pivot-table") {
    return normalized.filter((s) => s.content.length > 0)
  }
  // regular-table: only "columns" slot exists (plural)
  return normalized
    .filter((s) => s.name === "column" && s.content.length > 0)
    .map((s) => ({ ...s, name: "columns" }))
}

// ─── Options ───────────────────────────────────────────────

export interface ChartOptions {
  mode?: string
  display?: {
    title?: boolean
    legend?: boolean
  }
  theme?: { id: string } | Record<string, unknown>
  title?: Record<string, string>
  [key: string]: unknown
}

// ─── Flex theme mapper ──────────────────────────────────────
// Returns a Luzmo Flex-compatible `options.theme` object for each app theme.
// Shape follows https://developer.luzmo.com/assets/json-schemas/0.1.97/bar-chart-options.schema.json

export function getFlexTheme(appTheme: string): Record<string, unknown> {
  switch (appTheme) {
    case "dark":
      return {
        type: "custom",
        itemsBackground: "rgb(11, 15, 24)",
        font: { fontFamily: "Inter, system-ui, sans-serif" },
        colors: ["#818cf8", "#a78bfa", "#38bdf8", "#34d399", "#fb923c", "#f472b6"],
        axis: { fontSize: 11 },
        legend: { fontSize: 11 },
        title: { fontSize: 14 },
        tooltip: { background: "rgb(11, 15, 24)", opacity: 0.95 },
      }
    case "win95":
      return {
        type: "custom",
        itemsBackground: "rgb(192, 192, 192)",
        font: { fontFamily: "'MS Sans Serif', Tahoma, sans-serif", fontSize: 11 },
        colors: ["#000080", "#808000", "#008080", "#800080", "#008000", "#800000"],
        borders: {
          "border-style": "solid",
          "border-color": "rgb(128, 128, 128)",
          "border-radius": "0px",
          "border-top-width": "2px",
          "border-left-width": "2px",
          "border-bottom-width": "2px",
          "border-right-width": "2px",
        },
        axis: { fontSize: 10 },
        tooltip: { background: "rgb(255, 255, 225)", opacity: 1 },
      }
    default:
      return {
        type: "custom",
        itemsBackground: "rgb(255, 255, 255)",
        font: { fontFamily: "Inter, system-ui, sans-serif" },
        colors: ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"],
      }
  }
}

// ─── Filter types (from luzmo-filters) ──────────────────────

export interface ItemFilterGroup {
  condition: "and" | "or"
  filters: Array<{
    expression: string
    parameters: unknown[]
  }>
  subGroups?: ItemFilterGroup[]
}

// ─── Draft item (modal state) ──────────────────────────────

export interface DraftItem {
  type: string
  slotsContents: VizItemSlots
  options: ChartOptions
  filters: ItemFilterGroup[]
}

// ─── Placed item (dashboard grid) ──────────────────────────

export interface PlacedItem {
  id: string
  type: string
  slots: VizItemSlots
  options: ChartOptions
  filters: ItemFilterGroup[]
  position: {
    col: number
    row: number
    sizeX: number
    sizeY: number
  }
}

// ─── Chart type definition ─────────────────────────────────

export interface ChartTypeDefinition {
  type: string
  label: string
}

// Chart types available in the guided chart creator.
// Excludes data table / pivot table (those are in the table builder).
export const CHART_TYPES: ChartTypeDefinition[] = [
  { type: "bar-chart", label: "Bar Chart" },
  { type: "column-chart", label: "Column Chart" },
  { type: "line-chart", label: "Line Chart" },
  { type: "area-chart", label: "Area Chart" },
  { type: "donut-chart", label: "Donut Chart" },
  { type: "scatter-plot", label: "Scatter Plot" },
  { type: "bubble-chart", label: "Bubble Chart" },
  { type: "funnel-chart", label: "Funnel Chart" },
  { type: "radar-chart", label: "Radar Chart" },
  { type: "treemap-chart", label: "Treemap" },
  { type: "sunburst-chart", label: "Sunburst" },
  { type: "circle-pack-chart", label: "Circle Pack" },
  { type: "heat-map", label: "Heat Map" },
  { type: "combination-chart", label: "Combination" },
  { type: "evolution-number", label: "Evolution Number" },
]

// ─── Slot configuration for picker panel ───────────────────
// Per-chart-type slot definitions that drive luzmo-item-slot-picker-panel.
// Mirrors the reference app's CHART_SLOTS_CONFIG.

export interface SlotConfiguration {
  name: string
  label: string
  type: "numeric" | "categorical" | "mixed"
  rotate?: boolean
  isRequired?: boolean
  canAcceptMultipleDataFields?: boolean
  canAcceptFormula?: boolean
  options?: Record<string, unknown>
}

export const CHART_SLOTS_CONFIG: Record<string, SlotConfiguration[]> = {
  "bar-chart": [
    { name: "y-axis", label: "Category", type: "categorical", rotate: true },
    { name: "measure", label: "Measure", type: "numeric", canAcceptMultipleDataFields: true, canAcceptFormula: true },
    { name: "legend", label: "Group by", type: "categorical", rotate: true },
  ],
  "column-chart": [
    { name: "x-axis", label: "Category", type: "categorical" },
    { name: "measure", label: "Measure", type: "numeric", canAcceptMultipleDataFields: true, canAcceptFormula: true },
    { name: "legend", label: "Group by", type: "categorical", rotate: true },
  ],
  "line-chart": [
    { name: "x-axis", label: "X-Axis", type: "mixed", isRequired: true },
    { name: "measure", label: "Measure", type: "numeric", canAcceptMultipleDataFields: true, canAcceptFormula: true },
    { name: "legend", label: "Group by", type: "categorical", rotate: true },
  ],
  "area-chart": [
    { name: "x-axis", label: "X-Axis", type: "mixed", isRequired: true },
    { name: "measure", label: "Measure", type: "numeric", canAcceptMultipleDataFields: true, canAcceptFormula: true },
    { name: "legend", label: "Group by", type: "categorical", rotate: true },
  ],
  "donut-chart": [
    { name: "category", label: "Category", type: "categorical" },
    { name: "measure", label: "Measure", type: "numeric", canAcceptMultipleDataFields: true, canAcceptFormula: true },
  ],
  "scatter-plot": [
    { name: "x-axis", label: "X-Axis", type: "mixed", isRequired: true },
    { name: "y-axis", label: "Y-Axis", type: "mixed", isRequired: true, rotate: true },
    { name: "color", label: "Color", type: "categorical", rotate: true },
    { name: "size", label: "Size", type: "numeric", canAcceptFormula: true },
    { name: "name", label: "Name", type: "mixed", canAcceptMultipleDataFields: true },
  ],
  "bubble-chart": [
    { name: "x-axis", label: "X-Axis", type: "mixed", isRequired: true },
    { name: "y-axis", label: "Y-Axis", type: "mixed", isRequired: true, rotate: true },
    { name: "size", label: "Size", type: "numeric", canAcceptFormula: true },
    { name: "color", label: "Color", type: "categorical", rotate: true },
    { name: "name", label: "Name", type: "mixed", canAcceptMultipleDataFields: true },
  ],
  "funnel-chart": [
    { name: "category", label: "Category", type: "categorical", isRequired: true },
    { name: "measure", label: "Measure", type: "numeric", canAcceptFormula: true },
  ],
  "radar-chart": [
    { name: "category", label: "Category", type: "categorical" },
    { name: "measure", label: "Measure", type: "numeric", canAcceptMultipleDataFields: true, canAcceptFormula: true },
  ],
  "treemap-chart": [
    { name: "category", label: "Category", type: "categorical" },
    { name: "measure", label: "Measure", type: "numeric", canAcceptFormula: true },
    { name: "color", label: "Color", type: "numeric", canAcceptFormula: true },
  ],
  "sunburst-chart": [
    { name: "category", label: "Category", type: "categorical", canAcceptMultipleDataFields: true },
    { name: "measure", label: "Measure", type: "numeric", canAcceptFormula: true },
  ],
  "circle-pack-chart": [
    { name: "category", label: "Category", type: "categorical", canAcceptMultipleDataFields: true },
    { name: "measure", label: "Measure", type: "numeric", canAcceptFormula: true },
  ],
  "heat-map": [
    { name: "x-axis", label: "X-Axis", type: "categorical" },
    { name: "y-axis", label: "Y-Axis", type: "categorical" },
    { name: "measure", label: "Measure", type: "numeric", canAcceptFormula: true },
  ],
  "combination-chart": [
    { name: "x-axis", label: "X-Axis", type: "mixed" },
    { name: "measure", label: "Measure", type: "numeric", canAcceptMultipleDataFields: true, canAcceptFormula: true },
    { name: "legend", label: "Group by", type: "categorical", rotate: true },
  ],
  "evolution-number": [
    { name: "measure", label: "Measure", type: "numeric", canAcceptFormula: true },
  ],
}

// ─── Grid constants ────────────────────────────────────────

export const GRID_COLUMNS = 48
export const GRID_ROW_HEIGHT = 16
export const DEFAULT_ITEM_WIDTH = 12
export const DEFAULT_ITEM_HEIGHT = 16

// Grid item toolbar: options (cog) + clone, then delete
export const GRID_ITEM_ACTIONS = [
  { type: "group", actions: ["item-options", "clone"] },
  { type: "group", actions: ["delete"] },
]

// ─── Infer chart type from field selections ────────────────

export function inferChartType(
  slots: VizItemSlots,
  currentType?: string,
): string {
  const normalized = normalizeSlotsContents(slots)
  let measureCount = 0
  let dimensionCount = 0
  let hasDatetime = false

  for (const slot of normalized) {
    if (slot.name === "measure") {
      measureCount += slot.content.length
    } else {
      dimensionCount += slot.content.length
      for (const c of slot.content) {
        if (c.type && /datetime/i.test(c.type)) hasDatetime = true
      }
    }
  }

  if (measureCount === 0 && dimensionCount === 0) {
    return currentType ?? "bar-chart"
  }
  if (measureCount === 1 && dimensionCount === 0) return "evolution-number"
  if (measureCount >= 1 && dimensionCount === 1 && hasDatetime) return "line-chart"
  if (measureCount >= 2 && dimensionCount >= 1) return "combination-chart"
  if (measureCount >= 1 && dimensionCount >= 1) return "bar-chart"
  if (measureCount === 0 && dimensionCount >= 1) return "donut-chart"

  return "bar-chart"
}

// ─── Default draft item ────────────────────────────────────

export function getDefaultDraftItem(): DraftItem {
  return {
    type: "bar-chart",
    slotsContents: [],
    options: {
      display: { title: false, legend: true },
    },
    filters: [],
  }
}

export function getDefaultTableDraft(): DraftItem {
  return {
    type: "regular-table",
    slotsContents: [],
    options: {
      display: { title: false },
    },
    filters: [],
  }
}

// ─── Grid position calculator ──────────────────────────────

/**
 * Calculate the next available position for a new grid item.
 * Places items left-to-right, wrapping to the next row when no horizontal space.
 */
export function getNextItemPosition(
  items: PlacedItem[],
): PlacedItem["position"] {
  if (items.length === 0) {
    return { col: 0, row: 0, sizeX: DEFAULT_ITEM_WIDTH, sizeY: DEFAULT_ITEM_HEIGHT }
  }

  let maxRowEnd = 0
  for (const item of items) {
    const rowEnd = item.position.row + item.position.sizeY
    if (rowEnd > maxRowEnd) maxRowEnd = rowEnd
  }

  // Find items that touch the bottom edge
  const lastRowItems = items.filter(
    (item) => item.position.row + item.position.sizeY === maxRowEnd,
  )

  if (lastRowItems.length > 0) {
    let maxColEnd = 0
    let lastRowStart = maxRowEnd
    for (const item of lastRowItems) {
      const colEnd = item.position.col + item.position.sizeX
      if (colEnd > maxColEnd) maxColEnd = colEnd
      if (item.position.row < lastRowStart) lastRowStart = item.position.row
    }

    if (maxColEnd + DEFAULT_ITEM_WIDTH <= GRID_COLUMNS) {
      return {
        col: maxColEnd,
        row: lastRowStart,
        sizeX: DEFAULT_ITEM_WIDTH,
        sizeY: DEFAULT_ITEM_HEIGHT,
      }
    }
  }

  return { col: 0, row: maxRowEnd, sizeX: DEFAULT_ITEM_WIDTH, sizeY: DEFAULT_ITEM_HEIGHT }
}
