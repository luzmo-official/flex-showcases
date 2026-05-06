import { computed, ref } from 'vue'
import { mergeThemeOptions } from '../data/luzmoTheme'

/**
 * Composable for report and chart templates stored in localStorage.
 *
 * - Loads/saves chart definitions (worldcup-report-builder-charts).
 * - Exposes groupTemplates and matchTemplates for views that filter by group or matchup.
 * - buildFilteredChartProps() injects a filter (e.g. by team names) into a chart's filters.
 * - getOptionsWithTitle() merges theme options with the chart's display name.
 */
const STORAGE_KEY = 'worldcup-report-builder-charts'

export interface SavedChart {
  id: string
  name: string
  chartType: string
  slotsContents: Array<{ name: string; content: unknown[] }>
  chartOptions: Record<string, unknown>
  chartFilters: unknown[]
  createdAt: string
  updatedAt: string
  templateType?: 'none' | 'group' | 'match'
  filterColumn?: { columnId: string; datasetId: string }
}

interface FilterEntry {
  condition: string
  filters: Array<{
    expression: string
    parameters: [{ columnId: string; datasetId: string; level?: number }, string[]]
  }>
}

function loadChartsFromStorage(): SavedChart[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useReportTemplates() {
  const allCharts = ref<SavedChart[]>(loadChartsFromStorage())

  function refresh() {
    allCharts.value = loadChartsFromStorage()
  }

  const groupTemplates = computed(() =>
    allCharts.value.filter(c => c.templateType === 'group' && c.filterColumn)
  )

  const matchTemplates = computed(() =>
    allCharts.value.filter(c => c.templateType === 'match' && c.filterColumn)
  )

  function buildInjectedFilter(
    columnId: string,
    datasetId: string,
    values: string[]
  ): FilterEntry {
    return {
      condition: 'or',
      filters: [
        {
          expression: '? in ?',
          parameters: [
            { columnId, datasetId, level: 1 },
            values,
          ],
        },
      ],
    }
  }

  function buildFilteredChartProps(chart: SavedChart, filterValues: string[]) {
    if (!chart.filterColumn) return { chartFilters: chart.chartFilters }

    const injectedFilter = buildInjectedFilter(
      chart.filterColumn.columnId,
      chart.filterColumn.datasetId,
      filterValues
    )

    const existingFilters = Array.isArray(chart.chartFilters)
      ? JSON.parse(JSON.stringify(chart.chartFilters))
      : []

    return {
      chartFilters: [...existingFilters, injectedFilter],
    }
  }

  function getOptionsWithTitle(chart: SavedChart): Record<string, unknown> {
    return mergeThemeOptions(chart.chartOptions, chart.name)
  }

  return {
    allCharts,
    groupTemplates,
    matchTemplates,
    refresh,
    buildFilteredChartProps,
    getOptionsWithTitle,
  }
}
