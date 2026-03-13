/**
 * Seeds built-in report dashboards into the same localStorage as user reports/charts
 * when the app has no saved reports and Luzmo is configured. Built-ins are stored
 * and accessible exactly like user-created reports.
 */

import {
  BUILTIN_CHART_DEFS,
  BUILTIN_GROUP_CHART_DEFS,
  BUILTIN_MATCH_CHART_DEFS,
  BUILTIN_REPORT_DEFS,
  type BuiltInChartDef,
} from '../data/builtInReportDefs'
import {
  getColumnIdByNameFromEnv,
  hasAllBuiltInColumnIdsFromEnv,
} from './useLuzmoColumnIdsFromEnv'
import { useLuzmo } from './useLuzmo'

const CHARTS_STORAGE_KEY = 'worldcup-report-builder-charts'
const REPORTS_STORAGE_KEY = 'worldcup-report-builder-reports'
const SEEDED_FLAG_KEY = 'worldcup-report-builder-builtin-seeded'

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

export interface SavedReport {
  id: string
  name: string
  items: Array<{
    id: string
    chart: SavedChart
    x: number
    y: number
    w: number
    h: number
  }>
  createdAt: string
  updatedAt: string
}

function stableId(prefix: string, key: string): string {
  const str = `${prefix}-${key}`
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  const hex = Math.abs(h).toString(16).padStart(8, '0')
  return `${prefix}-${hex}-${key.slice(0, 8)}`
}

function resolveColumnId(
  columnName: string,
  columnIdByName: Record<string, string>
): string | null {
  const id =
    columnIdByName[columnName] ??
    columnIdByName[columnName.replace(/_/g, ' ')]
  return id ?? null
}

function resolveFilters(
  chartFilters: unknown[],
  columnIdByName: Record<string, string>,
  datasetId: string
): unknown[] {
  if (!chartFilters || !Array.isArray(chartFilters)) return []
  return chartFilters.map((f: unknown) => {
    const filter = f as Record<string, unknown>
    if (filter.filters && Array.isArray(filter.filters)) {
      return {
        ...filter,
        filters: resolveFilters(
          filter.filters as unknown[],
          columnIdByName,
          datasetId
        ),
      }
    }
    if (filter.parameters && Array.isArray(filter.parameters)) {
      const params = (filter.parameters as unknown[]).map((p) => {
        if (typeof p === 'string') {
          const colId = resolveColumnId(p, columnIdByName)
          return colId ? { columnId: colId, datasetId } : p
        }
        return p
      })
      return { ...filter, parameters: params }
    }
    return filter
  })
}

function resolveChartDef(
  def: BuiltInChartDef,
  datasetId: string,
  columnIdByName: Record<string, string>
): SavedChart | null {
  const slotsContents: Array<{ name: string; content: unknown[] }> = []
  for (const slot of def.slots) {
    const content: unknown[] = []
    for (const entry of slot.content) {
      const colId = resolveColumnId(entry.columnName, columnIdByName)
      if (!colId) return null
      content.push({
        columnId: colId,
        datasetId,
        type: entry.type,
        label: { en: entry.columnName },
        ...(entry.format && { format: entry.format }),
        ...(entry.aggregationFunc && { aggregationFunc: entry.aggregationFunc }),
      })
    }
    slotsContents.push({ name: slot.name, content })
  }
  const now = new Date().toISOString()
  return {
    id: stableId('builtin-chart', def.key),
    name: def.name,
    chartType: def.chartType,
    slotsContents,
    chartOptions: def.chartOptions ?? {},
    chartFilters: resolveFilters(
      def.chartFilters ?? [],
      columnIdByName,
      datasetId
    ),
    createdAt: now,
    updatedAt: now,
  }
}

export function isBuiltInSeeded(): boolean {
  try {
    return localStorage.getItem(SEEDED_FLAG_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Seed built-in charts and one report into localStorage (same keys as user data).
 * Runs when reports are empty and Luzmo is configured. Re-runs whenever there
 * are no reports so built-ins always appear after clearing.
 * Returns true if seeding was performed, false otherwise.
 */
export async function seedBuiltInReports(): Promise<boolean> {
  const { isConfigured, datasetGroupsOdds } = useLuzmo()
  if (!isConfigured || !datasetGroupsOdds.value) return false

  const existingReportsRaw = localStorage.getItem(REPORTS_STORAGE_KEY)
  let existingReports: SavedReport[] = []
  try {
    existingReports = existingReportsRaw ? JSON.parse(existingReportsRaw) : []
  } catch {
    existingReports = []
  }
  // Only seed when there are no user reports (ignore previous built-in reports for the check)
  const userReports = existingReports.filter((r) => !r.id.startsWith('builtin-report-'))
  if (userReports.length > 0) return false
  // Replace previous built-in reports when re-seeding
  existingReports = userReports

  // Clear flag when no reports so we can seed (or re-seed after user cleared)
  try {
    localStorage.removeItem(SEEDED_FLAG_KEY)
  } catch {
    /* ignore */
  }

  // Use column IDs from env only (no direct API call from browser; use Luzmo Node SDK to fill .env).
  // Require all 6 column IDs so we never create partially configured charts.
  if (!hasAllBuiltInColumnIdsFromEnv()) {
    // Remove any previously seeded built-in charts and reports so we don't leave partial/bad data
    try {
      const chartsRaw = localStorage.getItem(CHARTS_STORAGE_KEY)
      const charts: SavedChart[] = chartsRaw ? JSON.parse(chartsRaw) : []
      const chartsFiltered = charts.filter(
      (c) =>
        !c.id.startsWith('builtin-chart-') &&
        !c.id.startsWith('builtin-group-chart-') &&
        !c.id.startsWith('builtin-match-chart-')
    )
      if (chartsFiltered.length !== charts.length) {
        localStorage.setItem(CHARTS_STORAGE_KEY, JSON.stringify(chartsFiltered))
      }
      const reportsRaw = localStorage.getItem(REPORTS_STORAGE_KEY)
      const reports: SavedReport[] = reportsRaw ? JSON.parse(reportsRaw) : []
      const reportsFiltered = reports.filter((r) => !r.id.startsWith('builtin-report-'))
      if (reportsFiltered.length !== reports.length) {
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reportsFiltered))
      }
    } catch {
      /* ignore */
    }
    return false
  }

  const byName = getColumnIdByNameFromEnv()
  const datasetId = datasetGroupsOdds.value
  const resolvedCharts: SavedChart[] = []
  const chartById = new Map<string, SavedChart>()

  for (const def of BUILTIN_CHART_DEFS) {
    const chart = resolveChartDef(def, datasetId, byName)
    if (chart) {
      resolvedCharts.push(chart)
      chartById.set(chart.id, chart)
    }
  }

  const groupColId = byName['group'] ?? null
  if (groupColId) {
    for (const def of BUILTIN_GROUP_CHART_DEFS) {
      const chart = resolveChartDef(def, datasetId, byName)
      if (chart) {
        const groupChartId = stableId('builtin-group-chart', def.key)
        resolvedCharts.push({
          ...chart,
          id: groupChartId,
          templateType: 'group',
          filterColumn: { columnId: groupColId, datasetId },
        })
      }
    }
  }

  const teamColId = byName['team'] ?? null
  if (teamColId) {
    for (const def of BUILTIN_MATCH_CHART_DEFS) {
      const chart = resolveChartDef(def, datasetId, byName)
      if (chart) {
        const matchChartId = stableId('builtin-match-chart', def.key)
        resolvedCharts.push({
          ...chart,
          id: matchChartId,
          templateType: 'match',
          filterColumn: { columnId: teamColId, datasetId },
        })
      }
    }
  }

  if (resolvedCharts.length === 0) return false

  const existingChartsRaw = localStorage.getItem(CHARTS_STORAGE_KEY)
  let existingCharts: SavedChart[] = existingChartsRaw
    ? JSON.parse(existingChartsRaw)
    : []
  // Replace any previous built-in charts so we don't duplicate on re-seed
  existingCharts = existingCharts.filter(
    (c) =>
      !c.id.startsWith('builtin-chart-') &&
      !c.id.startsWith('builtin-group-chart-') &&
      !c.id.startsWith('builtin-match-chart-')
  )
  const allCharts = [...existingCharts, ...resolvedCharts]
  localStorage.setItem(CHARTS_STORAGE_KEY, JSON.stringify(allCharts))

  const reports: SavedReport[] = []
  const now = new Date().toISOString()

  for (const reportDef of BUILTIN_REPORT_DEFS) {
    const reportId = stableId('builtin-report', reportDef.key)
    const items: SavedReport['items'] = []
    for (const item of reportDef.items) {
      const chartDef = BUILTIN_CHART_DEFS.find((c) => c.key === item.chartKey)
      if (!chartDef) continue
      const chart = chartById.get(stableId('builtin-chart', chartDef.key))
      if (!chart) continue
      items.push({
        id: `builtin-item-${reportDef.key}-${item.chartKey}`,
        chart: JSON.parse(JSON.stringify(chart)),
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
      })
    }
    if (items.length > 0) {
      reports.push({
        id: reportId,
        name: reportDef.name,
        items,
        createdAt: now,
        updatedAt: now,
      })
    }
  }

  if (reports.length > 0) {
    const allReports = [...existingReports, ...reports]
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(allReports))
    localStorage.setItem(SEEDED_FLAG_KEY, 'true')
    return true
  }

  return false
}
