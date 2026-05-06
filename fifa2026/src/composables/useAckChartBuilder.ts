import { ref, computed, type Ref } from 'vue'
import { mergeThemeOptions } from '../data/luzmoTheme'
import { normalizeSlotContents } from './useSlotHelpers'

export interface SlotsContentItem {
  name: string
  content: unknown[]
}

/**
 * Shared state and helpers for ACK chart builder (chart preview + drop panel + options).
 * Use in Report Builder and Group Explorer so both behave the same and avoid
 * "incorrect format" / missing data slots (e.g. pass plain slots to Lit components).
 */
export function useAckChartBuilder() {
  const chartType = ref<string>('bar-chart')
  const slotsContents = ref<SlotsContentItem[]>([])
  const chartOptions = ref<Record<string, unknown>>({})
  const chartFilters = ref<unknown[]>([])

  // Plain copies for ACK components (Lit/web components can misbehave with Vue reactive Proxies)
  const slotsContentsPlain = computed(() =>
    JSON.parse(JSON.stringify(slotsContents.value))
  )
  const chartFiltersPlain = computed(() =>
    JSON.parse(JSON.stringify(chartFilters.value))
  )

  type VizElement = HTMLElement & {
    type?: string
    slots?: unknown[]
    options?: unknown
    filters?: unknown[]
  }

  function updateVizItem(
    vizItemRef: Ref<HTMLElement | null>,
    options?: { chartTitleRef?: Ref<string> }
  ) {
    const el = vizItemRef.value
    if (!el) return
    const viz = el as VizElement
    viz.type = chartType.value
    viz.slots = JSON.parse(JSON.stringify(slotsContents.value))
    const title = options?.chartTitleRef?.value?.trim() || undefined
    viz.options = mergeThemeOptions(
      JSON.parse(JSON.stringify(chartOptions.value)),
      title
    )
    viz.filters = JSON.parse(JSON.stringify(chartFilters.value))
  }

  function syncDropPanelItemType(dropPanelRef: Ref<HTMLElement | null>) {
    const el = dropPanelRef.value
    if (!el || !chartType.value) return
    const panel = el as HTMLElement & { itemType?: string }
    if (panel.itemType !== chartType.value) panel.itemType = chartType.value
  }

  function onSlotsChanged(event: CustomEvent<{ slotsContents: SlotsContentItem[] }>) {
    const raw = event.detail.slotsContents
    slotsContents.value = normalizeSlotContents(raw, chartType.value)
  }

  function onOptionsChanged(event: CustomEvent<{ options: Record<string, unknown> }>) {
    chartOptions.value = event.detail.options
  }

  function onFiltersChanged(event: CustomEvent<{ filters: unknown[] }>) {
    chartFilters.value = event.detail.filters
  }

  function resetSlotsAndOptions() {
    slotsContents.value = []
    chartOptions.value = {}
  }

  return {
    chartType,
    slotsContents,
    chartOptions,
    chartFilters,
    slotsContentsPlain,
    chartFiltersPlain,
    updateVizItem,
    syncDropPanelItemType,
    onSlotsChanged,
    onOptionsChanged,
    onFiltersChanged,
    resetSlotsAndOptions,
  }
}
