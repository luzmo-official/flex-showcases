import {
  getSlotsForChartType,
  isMeasureSlot,
  ALLOWED_AGGREGATION_FOR_HIERARCHY,
  DEFAULT_AGGREGATION_FOR_HIERARCHY,
} from '../data/chartTypes'

export interface SlotsContentItem {
  name: string
  content: unknown[]
}

/** Content item shape from Luzmo (column/set or columnId/datasetId, type, aggregationFunc, etc.) */
function isHierarchyOrDatetimeContent(item: unknown): boolean {
  if (!item || typeof item !== 'object') return false
  const t = (item as Record<string, unknown>).type
  return t === 'hierarchy' || t === 'datetime'
}

function getAggregationFunc(item: unknown): string | undefined {
  if (!item || typeof item !== 'object') return undefined
  const v = (item as Record<string, unknown>).aggregationFunc
  return typeof v === 'string' ? v : undefined
}

/**
 * Ensures only valid slot configurations: hierarchy/datetime columns in measure slots
 * may only use min, max, count_row, count_distinct (not sum, avg, etc.).
 */
export function normalizeSlotContents(
  slots: SlotsContentItem[],
  chartType: string
): SlotsContentItem[] {
  return slots.map((slot) => {
    if (!isMeasureSlot(chartType, slot.name)) return slot
    const content = Array.isArray(slot.content) ? slot.content : []
    const normalizedContent = content.map((item) => {
      if (!isHierarchyOrDatetimeContent(item)) return item
      const current = getAggregationFunc(item)
      const allowed = new Set(ALLOWED_AGGREGATION_FOR_HIERARCHY)
      if (current && allowed.has(current as typeof ALLOWED_AGGREGATION_FOR_HIERARCHY[number])) return item
      const clone = typeof item === 'object' && item !== null ? { ...(item as Record<string, unknown>) } : item
      if (typeof clone === 'object' && clone !== null) {
        (clone as Record<string, unknown>).aggregationFunc = DEFAULT_AGGREGATION_FOR_HIERARCHY
      }
      return clone
    })
    return { name: slot.name, content: normalizedContent }
  })
}

/**
 * Add a column to a slot. Returns a new slots array (does not mutate).
 * Uses Luzmo slot content shape: { column, set, type, label, ... }.
 * When columnType is hierarchy/datetime and slot is a measure slot, sets aggregation to count_distinct.
 */
export function addFieldToSlot(
  slots: SlotsContentItem[],
  chartType: string,
  slotName: string,
  columnId: string,
  datasetId: string,
  columnName?: string,
  columnType?: string
): SlotsContentItem[] {
  const allowed = getSlotsForChartType(chartType)
  if (!allowed.includes(slotName)) return slots

  const isMeasure = isMeasureSlot(chartType, slotName)
  const isHierarchyOrDatetime = columnType === 'hierarchy' || columnType === 'datetime'
  const inferredType = isMeasure && !isHierarchyOrDatetime ? 'numeric' : 'hierarchy'

  const slotContentItem: Record<string, unknown> = {
    column: columnId,
    set: datasetId,
    type: inferredType,
  }
  if (slotContentItem.type === 'numeric') {
    slotContentItem.aggregationFunc = 'sum'
  } else if (isMeasure && isHierarchyOrDatetime) {
    slotContentItem.aggregationFunc = DEFAULT_AGGREGATION_FOR_HIERARCHY
  }
  if (columnName) {
    slotContentItem.label = { en: columnName }
  }

  const next = slots.map((s) => ({ ...s, content: [...s.content] }))
  const existing = next.find((s) => s.name === slotName)
  if (existing) {
    existing.content.push(slotContentItem)
  } else {
    next.push({ name: slotName, content: [slotContentItem] })
  }
  return next
}
