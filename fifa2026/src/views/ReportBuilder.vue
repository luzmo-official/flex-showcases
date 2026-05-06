<template>
  <div class="report-builder">
    <div class="builder-header">
      <h1 class="builder-title">Report Builder</h1>
      <p class="builder-subtitle">
        Create custom analytics reports using the Luzmo Analytics Components Kit.
        Drag data fields, pick chart types, configure options, and add filters.
      </p>
    </div>

    <!-- ACK-powered builder when configured -->
    <div class="builder-workspace" v-if="isLuzmoConfigured">

      <!-- ═══════════════════════════════════════════════════════════════════════
           Report Dashboard Grid (shown first)
           ═══════════════════════════════════════════════════════════════════════ -->
      <div class="dashboard-section">
        <div class="dashboard-header">
          <div class="dashboard-title-row">
            <h2 class="dashboard-title">Report Dashboard</h2>
            <span class="dashboard-subtitle">Add saved charts to build a complete report</span>
          </div>
          <div class="dashboard-actions">
            <button class="toolbar-btn" @click="openAddChartModal" :disabled="savedCharts.length === 0">
              <span class="btn-icon">&#43;</span> Add Chart
            </button>
            <button class="toolbar-btn" @click="openSaveReportModal" :disabled="reportItems.length === 0">
              <span class="btn-icon">&#128190;</span> Save Report
            </button>
            <button class="toolbar-btn" @click="toggleReportsPanel">
              <span class="btn-icon">&#128196;</span> Reports ({{ savedReports.length }})
            </button>
            <button class="toolbar-btn" @click="clearReport" :disabled="reportItems.length === 0">
              <span class="btn-icon">&#128465;</span> Clear
            </button>
          </div>
        </div>

        <!-- Draggable/Resizable Report grid (Gridstack) -->
        <div
          v-if="reportItems.length > 0"
          ref="gridContainer"
          class="dashboard-grid grid-stack"
        >
          <div
            v-for="item in reportItems"
            :key="item.id"
            :gs-id="item.id"
            :gs-x="item.x"
            :gs-y="item.y"
            :gs-w="item.w"
            :gs-h="item.h"
            gs-min-w="2"
            gs-min-h="2"
            class="grid-stack-item"
          >
            <div class="grid-stack-item-content dashboard-item glass-panel">
              <div class="dashboard-drag-handle" title="Drag to move">&#9776;</div>
              <button class="dashboard-edit-btn" title="Edit in Chart Creator" @click="editChartFromDashboard(item.chart)">&#9998;</button>
              <button class="dashboard-remove-btn" title="Remove" @click="removeFromReport(item.id)">&#10005;</button>
              <luzmo-embed-viz-item
                :appServer="appServer"
                :apiHost="apiHost"
                :authKey="apiKey"
                :authToken="apiToken"
                :type="item.chart.chartType"
                :slots="item.chart.slotsContents"
                :options="getOptionsWithTitle(item.chart)"
                :filters="item.chart.chartFilters"
                language="en"
              >
              </luzmo-embed-viz-item>
            </div>
          </div>
        </div>

        <!-- Empty dashboard state -->
        <div class="dashboard-empty glass-panel" v-else>
          <div class="dashboard-empty-icon">&#128202;</div>
          <h3>No charts in report</h3>
          <p>Create charts in the Chart Creator below, then click "Add Chart" to build your report dashboard.</p>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════════
           Collapsible Chart Creator (shared component)
           ═══════════════════════════════════════════════════════════════════════ -->
      <ChartBuilder
        ref="chartBuilder"
        :initiallyOpen="true"
        toggleTitle="Chart Creator"
        :toggleHint="savedCharts.length > 0 ? savedCharts.length + ' saved chart(s)' : 'Create and configure charts'"
      >
        <template #toolbar-actions>
          <button class="toolbar-btn save-btn" @click="openSaveModal" :disabled="!chartBuilder?.hasChartData">
            <span class="btn-icon">&#128190;</span> Save Chart
          </button>
          <button class="toolbar-btn" @click="toggleSavedPanel">
            <span class="btn-icon">&#128203;</span> Saved ({{ savedCharts.length }})
          </button>
          <button class="toolbar-btn" @click="exportAllReports" :disabled="savedCharts.length === 0">
            <span class="btn-icon">&#128229;</span> Export
          </button>
          <label class="toolbar-btn import-btn">
            <span class="btn-icon">&#128228;</span> Import
            <input type="file" accept=".json" @change="importReports" hidden />
          </label>
        </template>
      </ChartBuilder>

      <!-- Save modal -->
      <Transition name="modal">
        <div v-if="saveModalOpen" class="modal-overlay" @click.self="closeSaveModal">
          <div class="modal-content glass-panel">
            <h3 class="modal-title">Save Chart to Report</h3>
            <div class="modal-body">
              <label class="modal-label">Chart Name</label>
              <input
                ref="chartNameInput"
                v-model="newChartName"
                type="text"
                class="modal-input"
                placeholder="e.g. Goals by Team"
                @keyup.enter="saveChart"
              />
              <p class="modal-hint">Type: {{ chartTypeLabel }}</p>
            </div>
            <div class="modal-actions">
              <button class="modal-btn cancel" @click="closeSaveModal">Cancel</button>
              <button class="modal-btn primary" @click="saveChart" :disabled="!newChartName.trim()">
                Save
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Saved charts panel -->
      <Transition name="panel-slide">
        <div v-if="savedPanelOpen" class="saved-panel glass-panel">
          <div class="saved-panel-header">
            <h3 class="panel-title">Saved Charts</h3>
            <button class="close-btn" @click="savedPanelOpen = false">&times;</button>
          </div>
          <div class="saved-panel-body" v-if="savedCharts.length > 0">
            <div
              v-for="chart in savedCharts"
              :key="chart.id"
              class="saved-chart-item"
              :class="{ active: editingChartId === chart.id, pinned: pinnedChartIds.has(chart.id) }"
            >
              <div class="saved-chart-info" @click="loadChart(chart)">
                <span class="saved-chart-name">
                  <span v-if="pinnedChartIds.has(chart.id)" class="pin-indicator">&#128204;</span>
                  {{ chart.name }}
                </span>
                <span class="saved-chart-meta">{{ getChartTypeLabel(chart.chartType) }} &middot; {{ formatDate(chart.updatedAt) }}</span>
              </div>
              <div class="saved-chart-actions">
                <div class="template-tag-wrapper">
                  <button
                    class="icon-btn"
                    :class="{ 'template-active': chart.templateType && chart.templateType !== 'none' }"
                    :title="getTemplateBtnTitle(chart)"
                    @click="openTemplateMenu(chart)"
                  >&#9881;</button>
                  <span
                    v-if="chart.templateType === 'group'"
                    class="template-badge template-group"
                    title="Group template"
                  >G</span>
                  <span
                    v-else-if="chart.templateType === 'match'"
                    class="template-badge template-match"
                    title="Match template"
                  >M</span>
                </div>
                <button
                  class="icon-btn"
                  :class="{ 'pin-active': pinnedChartIds.has(chart.id) }"
                  :title="pinnedChartIds.has(chart.id) ? 'Unpin from Home' : 'Pin to Home'"
                  @click="togglePinChart(chart.id)"
                >&#128204;</button>
                <button class="icon-btn" title="Load" @click="loadChart(chart)">&#128194;</button>
                <button class="icon-btn" title="Export" @click="exportSingleChart(chart)">&#128229;</button>
                <button class="icon-btn danger" title="Delete" @click="deleteChart(chart.id)">&#128465;</button>
              </div>
            </div>
          </div>
          <div class="saved-panel-empty" v-else>
            <p>No saved charts yet.</p>
            <p class="hint">Configure a chart and click "Save Chart" to add it here.</p>
          </div>
        </div>
      </Transition>

      <!-- Template config modal -->
      <Transition name="modal">
        <div v-if="templateModalOpen" class="modal-overlay" @click.self="closeTemplateModal">
          <div class="modal-content glass-panel">
            <h3 class="modal-title">Configure Template</h3>
            <div class="modal-body" v-if="templateEditChart">
              <label class="modal-label">Template Type</label>
              <div class="template-type-btns">
                <button
                  class="template-type-btn"
                  :class="{ active: templateEditType === 'none' }"
                  @click="templateEditType = 'none'"
                >None</button>
                <button
                  class="template-type-btn template-type-group"
                  :class="{ active: templateEditType === 'group' }"
                  @click="templateEditType = 'group'"
                >Group Page</button>
                <button
                  class="template-type-btn template-type-match"
                  :class="{ active: templateEditType === 'match' }"
                  @click="templateEditType = 'match'"
                >Match Page</button>
              </div>
              <p class="modal-hint">
                {{ templateEditType === 'group' ? 'This chart will appear on every group page, filtered by group.' : templateEditType === 'match' ? 'This chart will appear on match detail pages, filtered by the two teams.' : 'This chart will not appear automatically on any page.' }}
              </p>

              <template v-if="templateEditType !== 'none'">
                <label class="modal-label" style="margin-top: 16px;">Filter Column</label>
                <p class="modal-hint" style="margin-bottom: 8px;">
                  {{ templateEditType === 'group' ? 'Select the column that contains the group identifier (e.g. "group")' : 'Select the column that contains the team name' }}
                </p>
                <select class="modal-select" v-model="templateEditColumnKey">
                  <option value="">-- Select a column --</option>
                  <option
                    v-for="col in templateAvailableColumns"
                    :key="col.key"
                    :value="col.key"
                  >{{ col.label }} ({{ col.datasetLabel }})</option>
                </select>
              </template>
            </div>
            <div class="modal-actions">
              <button class="modal-btn cancel" @click="closeTemplateModal">Cancel</button>
              <button
                class="modal-btn primary"
                @click="applyTemplateConfig"
                :disabled="templateEditType !== 'none' && !templateEditColumnKey"
              >Apply</button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Add chart to report modal -->
      <Transition name="modal">
        <div v-if="addChartModalOpen" class="modal-overlay" @click.self="addChartModalOpen = false">
          <div class="modal-content glass-panel modal-wide">
            <h3 class="modal-title">Add Chart to Report</h3>
            <div class="modal-body">
              <p class="modal-hint" style="margin-bottom: 16px;">Select a chart to add. You can drag to reposition and resize it on the grid.</p>
              <div class="chart-picker-grid">
                <div
                  v-for="chart in savedCharts"
                  :key="chart.id"
                  class="chart-picker-item"
                  :class="{ selected: selectedChartToAdd === chart.id }"
                  @click="selectedChartToAdd = chart.id"
                >
                  <div class="chart-picker-name">{{ chart.name }}</div>
                  <div class="chart-picker-type">{{ getChartTypeLabel(chart.chartType) }}</div>
                </div>
              </div>
            </div>
            <div class="modal-actions">
              <button class="modal-btn cancel" @click="addChartModalOpen = false">Cancel</button>
              <button class="modal-btn primary" @click="addChartToReport" :disabled="!selectedChartToAdd">
                Add to Report
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Save report modal -->
      <Transition name="modal">
        <div v-if="saveReportModalOpen" class="modal-overlay" @click.self="saveReportModalOpen = false">
          <div class="modal-content glass-panel">
            <h3 class="modal-title">Save Report</h3>
            <div class="modal-body">
              <label class="modal-label">Report Name</label>
              <input
                ref="reportNameInput"
                v-model="newReportName"
                type="text"
                class="modal-input"
                placeholder="e.g. World Cup 2026 Analysis"
                @keyup.enter="saveReport"
              />
              <p class="modal-hint">{{ reportItems.length }} chart(s) in this report</p>
            </div>
            <div class="modal-actions">
              <button class="modal-btn cancel" @click="saveReportModalOpen = false">Cancel</button>
              <button class="modal-btn primary" @click="saveReport" :disabled="!newReportName.trim()">
                Save
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Saved reports panel -->
      <Transition name="panel-slide">
        <div v-if="reportsPanelOpen" class="saved-panel reports-panel glass-panel">
          <div class="saved-panel-header">
            <h3 class="panel-title">Saved Reports</h3>
            <button class="close-btn" @click="reportsPanelOpen = false">&times;</button>
          </div>
          <div class="saved-panel-body" v-if="savedReports.length > 0">
            <div
              v-for="report in savedReports"
              :key="report.id"
              class="saved-chart-item"
              :class="{ active: currentReportId === report.id }"
            >
              <div class="saved-chart-info" @click="loadReport(report)">
                <span class="saved-chart-name">{{ report.name }}</span>
                <span class="saved-chart-meta">{{ report.items.length }} charts &middot; {{ formatDate(report.updatedAt) }}</span>
              </div>
              <div class="saved-chart-actions">
                <button class="icon-btn" title="Load" @click="loadReport(report)">&#128194;</button>
                <button class="icon-btn" title="Export" @click="exportSingleReport(report)">&#128229;</button>
                <button class="icon-btn danger" title="Delete" @click="deleteReport(report.id)">&#128465;</button>
              </div>
            </div>
          </div>
          <div class="saved-panel-empty" v-else>
            <p>No saved reports yet.</p>
            <p class="hint">Add charts to the dashboard and click "Save Report".</p>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Unconfigured state with preview -->
    <div class="builder-preview-mode" v-else>
      <div class="preview-layout">
        <!-- Mock sidebar -->
        <div class="preview-sidebar glass-panel">
          <h3 class="preview-panel-title">Data Fields</h3>
          <div class="preview-field" v-for="field in mockFields" :key="field">
            <span class="preview-field-icon">&#9632;</span>
            <span>{{ field }}</span>
          </div>
        </div>

        <!-- Mock canvas -->
        <div class="preview-canvas glass-panel">
          <div class="preview-empty-state">
            <div class="preview-icon">&#128202;</div>
            <h3>Report Builder</h3>
            <p>
              This is where the ACK-powered report builder would appear.
              Configure your Luzmo API credentials to enable it.
            </p>
            <div class="preview-instructions">
              <p><strong>To get started:</strong></p>
              <ol>
                <li>Copy <code>.env.example</code> to <code>.env</code></li>
                <li>Add your Luzmo API key and token</li>
                <li>Add your dataset IDs</li>
                <li>Restart the dev server</li>
              </ol>
            </div>
          </div>
        </div>

        <!-- Mock config panel -->
        <div class="preview-config glass-panel">
          <h3 class="preview-panel-title">Chart Slots</h3>
          <div class="preview-slot">
            <span class="preview-slot-label">X-Axis</span>
            <span class="preview-slot-drop">Drop field here</span>
          </div>
          <div class="preview-slot">
            <span class="preview-slot-label">Measure</span>
            <span class="preview-slot-drop">Drop field here</span>
          </div>
          <div class="preview-slot">
            <span class="preview-slot-label">Color</span>
            <span class="preview-slot-drop">Drop field here</span>
          </div>
          <h3 class="preview-panel-title" style="margin-top: 24px">Filters</h3>
          <div class="preview-slot">
            <span class="preview-slot-drop">Add filter</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useLuzmo } from '../composables/useLuzmo'
import { getChartTypeLabel as getChartTypeLabelFromData } from '../data/chartTypes'
import { GridStack } from 'gridstack'
import 'gridstack/dist/gridstack.min.css'
import { mergeThemeOptions } from '../data/luzmoTheme'
import ChartBuilder from '../components/ChartBuilder.vue'
import { seedBuiltInReports } from '../composables/useSeedBuiltInReports'

const {
  apiKey,
  apiToken,
  appServer,
  apiHost,
  allDatasetIds,
  isConfigured: isLuzmoConfigured,
} = useLuzmo()

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface SavedChart {
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

interface ReportItem {
  id: string
  chart: SavedChart
  x: number
  y: number
  w: number
  h: number
}

interface SavedReport {
  id: string
  name: string
  items: ReportItem[]
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'worldcup-report-builder-charts'
const REPORTS_STORAGE_KEY = 'worldcup-report-builder-reports'
const PINNED_CHARTS_KEY = 'worldcup-home-pinned-charts'

// ─────────────────────────────────────────────────────────────────────────────
// Chart Builder ref (shared component)
// ─────────────────────────────────────────────────────────────────────────────
const route = useRoute()
const chartBuilder = ref<InstanceType<typeof ChartBuilder> | null>(null)
const chartNameInput = ref<HTMLInputElement | null>(null)
const editingChartId = ref<string | null>(null)

function getOptionsWithTitle(chart: SavedChart): Record<string, unknown> {
  return mergeThemeOptions(chart.chartOptions, chart.name)
}

// ─────────────────────────────────────────────────────────────────────────────
// Saved charts state
// ─────────────────────────────────────────────────────────────────────────────
const savedCharts = ref<SavedChart[]>([])
const savedPanelOpen = ref(false)
const saveModalOpen = ref(false)
const newChartName = ref('')

// Pinned charts for home page (max 4)
const pinnedChartIds = ref<Set<string>>(new Set())

// ─────────────────────────────────────────────────────────────────────────────
// Report Dashboard state
// ─────────────────────────────────────────────────────────────────────────────
const reportItems = ref<ReportItem[]>([])
const savedReports = ref<SavedReport[]>([])
const currentReportId = ref<string | null>(null)
const reportsPanelOpen = ref(false)
const addChartModalOpen = ref(false)
const saveReportModalOpen = ref(false)
const newReportName = ref('')
const selectedChartToAdd = ref<string | null>(null)
const reportNameInput = ref<HTMLInputElement | null>(null)
const gridContainer = ref<HTMLElement | null>(null)
let gridInstance: GridStack | null = null

// Initialize or reinitialize gridstack when items change
function initGridStack() {
  if (!gridContainer.value) return

  // Destroy existing instance
  if (gridInstance) {
    gridInstance.destroy(false)
    gridInstance = null
  }

  nextTick(() => {
    if (!gridContainer.value) return

    gridInstance = GridStack.init(
      {
        column: 12,
        cellHeight: 80,
        margin: 8,
        float: false,
        animate: true,
        draggable: {
          handle: '.dashboard-drag-handle',
        },
        resizable: {
          handles: 'se',
        },
      },
      gridContainer.value
    )

    // Listen for changes
    gridInstance.on('change', (_event: Event, items: unknown) => {
      if (!items) return
      for (const gsItem of items as Array<{ id?: string; x?: number; y?: number; w?: number; h?: number }>) {
        if (!gsItem.id) continue
        const item = reportItems.value.find((i) => i.id === gsItem.id)
        if (item) {
          if (gsItem.x !== undefined) item.x = gsItem.x
          if (gsItem.y !== undefined) item.y = gsItem.y
          if (gsItem.w !== undefined) item.w = gsItem.w
          if (gsItem.h !== undefined) item.h = gsItem.h
        }
      }
    })
  })
}

// Watch for reportItems changes to reinitialize grid
watch(
  () => reportItems.value.length,
  () => {
    if (reportItems.value.length > 0) {
      nextTick(() => initGridStack())
    }
  }
)

onUnmounted(() => {
  if (gridInstance) {
    gridInstance.destroy()
    gridInstance = null
  }
})

onMounted(async () => {
  loadSavedChartsFromStorage()
  loadSavedReportsFromStorage()
  if (savedReports.value.length === 0 && isLuzmoConfigured) {
    const seeded = await seedBuiltInReports()
    if (seeded) {
      loadSavedChartsFromStorage()
      loadSavedReportsFromStorage()
    }
  }
  loadPinnedCharts()
  // Open a specific report when navigated from landing with ?report=id
  const reportId = route.query.report
  if (typeof reportId === 'string' && reportId) {
    const report = savedReports.value.find((r) => r.id === reportId)
    if (report) {
      loadReport(report)
    }
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Saved Charts Logic
// ─────────────────────────────────────────────────────────────────────────────
function loadSavedChartsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      savedCharts.value = JSON.parse(raw)
    }
  } catch (e) {
    console.warn('Failed to load saved charts from localStorage', e)
  }
}

function persistSavedCharts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCharts.value))
  } catch (e) {
    console.warn('Failed to save charts to localStorage', e)
  }
}

function loadPinnedCharts() {
  try {
    const raw = localStorage.getItem(PINNED_CHARTS_KEY)
    if (raw) {
      pinnedChartIds.value = new Set(JSON.parse(raw))
    }
  } catch (e) {
    console.warn('Failed to load pinned charts', e)
  }
}

function persistPinnedCharts() {
  try {
    localStorage.setItem(PINNED_CHARTS_KEY, JSON.stringify([...pinnedChartIds.value]))
  } catch (e) {
    console.warn('Failed to save pinned charts', e)
  }
}

function togglePinChart(chartId: string) {
  if (pinnedChartIds.value.has(chartId)) {
    pinnedChartIds.value.delete(chartId)
  } else {
    // Max 4 pinned charts
    if (pinnedChartIds.value.size >= 4) {
      alert('You can pin up to 4 charts to the home page. Unpin one first.')
      return
    }
    pinnedChartIds.value.add(chartId)
  }
  // Trigger reactivity
  pinnedChartIds.value = new Set(pinnedChartIds.value)
  persistPinnedCharts()
}

// ─────────────────────────────────────────────────────────────────────────────
// Template tagging
// ─────────────────────────────────────────────────────────────────────────────
const templateModalOpen = ref(false)
const templateEditChart = ref<SavedChart | null>(null)
const templateEditType = ref<'none' | 'group' | 'match'>('none')
const templateEditColumnKey = ref('')

interface TemplateColumn {
  key: string
  columnId: string
  datasetId: string
  label: string
  datasetLabel: string
}

const templateAvailableColumns = computed<TemplateColumn[]>(() => {
  const chart = templateEditChart.value
  if (!chart) return []
  const cols: TemplateColumn[] = []
  const seen = new Set<string>()
  for (const slot of chart.slotsContents) {
    for (const entry of slot.content) {
      const e = entry as Record<string, unknown>
      const colId = e.columnId as string ?? e.column as string
      const dsId = e.datasetId as string ?? e.set as string
      if (colId && dsId && !seen.has(`${dsId}:${colId}`)) {
        seen.add(`${dsId}:${colId}`)
        const colLabel = (e.label as string) || (e.columnName as string) || colId.slice(0, 8)
        const dsLabel = dsId === allDatasetIds.value[0] ? 'Groups/Odds'
          : dsId === allDatasetIds.value[1] ? 'Team Profiles'
          : dsId === allDatasetIds.value[2] ? 'Historical'
          : dsId.slice(0, 8)
        cols.push({ key: `${dsId}:${colId}`, columnId: colId, datasetId: dsId, label: colLabel, datasetLabel: dsLabel })
      }
    }
  }
  return cols
})

function getTemplateBtnTitle(chart: SavedChart): string {
  if (chart.templateType === 'group') return 'Template: Group Page'
  if (chart.templateType === 'match') return 'Template: Match Page'
  return 'Set as template'
}

function openTemplateMenu(chart: SavedChart) {
  templateEditChart.value = chart
  templateEditType.value = (chart.templateType as 'none' | 'group' | 'match') ?? 'none'
  if (chart.filterColumn) {
    templateEditColumnKey.value = `${chart.filterColumn.datasetId}:${chart.filterColumn.columnId}`
  } else {
    templateEditColumnKey.value = ''
  }
  templateModalOpen.value = true
}

function closeTemplateModal() {
  templateModalOpen.value = false
  templateEditChart.value = null
}

function applyTemplateConfig() {
  if (!templateEditChart.value) return
  const chart = savedCharts.value.find(c => c.id === templateEditChart.value!.id)
  if (!chart) return

  chart.templateType = templateEditType.value
  if (templateEditType.value !== 'none' && templateEditColumnKey.value) {
    const parts = templateEditColumnKey.value.split(':')
    const dsId = parts[0]
    const colId = parts[1]
    if (dsId && colId) {
      chart.filterColumn = { columnId: colId, datasetId: dsId }
    }
  } else {
    chart.filterColumn = undefined
  }
  persistSavedCharts()
  closeTemplateModal()
}

function openSaveModal() {
  newChartName.value = chartBuilder.value?.chartTitle || ''
  saveModalOpen.value = true
  nextTick(() => chartNameInput.value?.focus())
}

function closeSaveModal() {
  saveModalOpen.value = false
  newChartName.value = ''
}

function saveChart() {
  if (!newChartName.value.trim() || !chartBuilder.value) return

  const b = chartBuilder.value
  const now = new Date().toISOString()
  const chart: SavedChart = {
    id: editingChartId.value || crypto.randomUUID(),
    name: newChartName.value.trim(),
    chartType: b.chartType,
    slotsContents: JSON.parse(JSON.stringify(b.slotsContents)),
    chartOptions: JSON.parse(JSON.stringify(b.chartOptions)),
    chartFilters: JSON.parse(JSON.stringify(b.chartFilters)),
    createdAt: editingChartId.value
      ? savedCharts.value.find((c) => c.id === editingChartId.value)?.createdAt || now
      : now,
    updatedAt: now,
  }

  // Update existing or add new
  const existingIdx = savedCharts.value.findIndex((c) => c.id === chart.id)
  if (existingIdx >= 0) {
    savedCharts.value[existingIdx] = chart
  } else {
    savedCharts.value.unshift(chart)
  }

  // Propagate changes to any dashboard items using this chart
  for (const item of reportItems.value) {
    if (item.chart.id === chart.id) {
      item.chart = JSON.parse(JSON.stringify(chart))
    }
  }

  editingChartId.value = chart.id
  persistSavedCharts()
  closeSaveModal()
}

function loadChart(chart: SavedChart) {
  chartBuilder.value?.loadConfig({
    chartType: chart.chartType,
    slotsContents: chart.slotsContents,
    chartOptions: chart.chartOptions,
    chartFilters: chart.chartFilters,
    name: chart.name,
  })
  editingChartId.value = chart.id
  savedPanelOpen.value = false
}

function editChartFromDashboard(chart: SavedChart) {
  chartBuilder.value?.open()
  loadChart(chart)
  nextTick(() => {
    document.querySelector('.chart-creator-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function deleteChart(id: string) {
  if (!confirm('Delete this saved chart?')) return
  savedCharts.value = savedCharts.value.filter((c) => c.id !== id)
  if (editingChartId.value === id) editingChartId.value = null
  // Also remove from pinned if present
  if (pinnedChartIds.value.has(id)) {
    pinnedChartIds.value.delete(id)
    pinnedChartIds.value = new Set(pinnedChartIds.value)
    persistPinnedCharts()
  }
  persistSavedCharts()
}

function toggleSavedPanel() {
  savedPanelOpen.value = !savedPanelOpen.value
}

function getChartTypeLabel(type: string) {
  return getChartTypeLabelFromData(type)
}

// Chart type label for save modal
const chartTypeLabel = computed(() => chartBuilder.value ? getChartTypeLabelFromData(chartBuilder.value.chartType) : '')

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Export / Import
// ─────────────────────────────────────────────────────────────────────────────
function exportAllReports() {
  const data = {
    exportedAt: new Date().toISOString(),
    charts: savedCharts.value,
  }
  downloadJSON(data, `worldcup-report-${Date.now()}.json`)
}

function exportSingleChart(chart: SavedChart) {
  const data = {
    exportedAt: new Date().toISOString(),
    charts: [chart],
  }
  downloadJSON(data, `chart-${chart.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`)
}

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function importReports(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result as string)
      if (!data.charts || !Array.isArray(data.charts)) {
        alert('Invalid report file format.')
        return
      }
      // Merge imported charts (skip duplicates by id)
      const existingIds = new Set(savedCharts.value.map((c) => c.id))
      let imported = 0
      for (const chart of data.charts as SavedChart[]) {
        if (!existingIds.has(chart.id)) {
          savedCharts.value.unshift(chart)
          imported++
        }
      }
      persistSavedCharts()
      alert(`Imported ${imported} chart(s). ${data.charts.length - imported} duplicate(s) skipped.`)
    } catch (e) {
      alert('Failed to parse the import file.')
      console.error(e)
    }
    input.value = '' // reset file input
  }
  reader.readAsText(file)
}

// ─────────────────────────────────────────────────────────────────────────────
// Report Dashboard Logic
// ─────────────────────────────────────────────────────────────────────────────
function loadSavedReportsFromStorage() {
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY)
    if (raw) {
      savedReports.value = JSON.parse(raw)
    }
  } catch (e) {
    console.warn('Failed to load saved reports from localStorage', e)
  }
}

function persistSavedReports() {
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(savedReports.value))
  } catch (e) {
    console.warn('Failed to save reports to localStorage', e)
  }
}

function openAddChartModal() {
  selectedChartToAdd.value = null
  addChartModalOpen.value = true
}

function addChartToReport() {
  if (!selectedChartToAdd.value) return
  const chart = savedCharts.value.find((c) => c.id === selectedChartToAdd.value)
  if (!chart) return

  // Find the next available y position (bottom of current items)
  const maxY = reportItems.value.reduce((max, item) => Math.max(max, item.y + item.h), 0)

  const item: ReportItem = {
    id: crypto.randomUUID(),
    chart: JSON.parse(JSON.stringify(chart)),
    x: 0,
    y: maxY,
    w: 6, // Half width (6 of 12 columns)
    h: 4, // Default height
  }
  reportItems.value.push(item)
  addChartModalOpen.value = false
}

function removeFromReport(itemId: string) {
  // Remove from gridstack first
  if (gridInstance) {
    const el = gridContainer.value?.querySelector(`[gs-id="${itemId}"]`)
    if (el) {
      gridInstance.removeWidget(el as HTMLElement, false)
    }
  }
  reportItems.value = reportItems.value.filter((i) => i.id !== itemId)
}

function clearReport() {
  if (!confirm('Clear all charts from the current report?')) return
  reportItems.value = []
  currentReportId.value = null
}

function openSaveReportModal() {
  newReportName.value = ''
  saveReportModalOpen.value = true
  nextTick(() => reportNameInput.value?.focus())
}

function saveReport() {
  if (!newReportName.value.trim()) return

  const now = new Date().toISOString()
  const report: SavedReport = {
    id: currentReportId.value || crypto.randomUUID(),
    name: newReportName.value.trim(),
    items: JSON.parse(JSON.stringify(reportItems.value)),
    createdAt: currentReportId.value
      ? savedReports.value.find((r) => r.id === currentReportId.value)?.createdAt || now
      : now,
    updatedAt: now,
  }

  const existingIdx = savedReports.value.findIndex((r) => r.id === report.id)
  if (existingIdx >= 0) {
    savedReports.value[existingIdx] = report
  } else {
    savedReports.value.unshift(report)
  }

  currentReportId.value = report.id
  persistSavedReports()
  saveReportModalOpen.value = false
}

function loadReport(report: SavedReport) {
  reportItems.value = JSON.parse(JSON.stringify(report.items))
  currentReportId.value = report.id
  reportsPanelOpen.value = false
}

function deleteReport(id: string) {
  if (!confirm('Delete this saved report?')) return
  savedReports.value = savedReports.value.filter((r) => r.id !== id)
  if (currentReportId.value === id) currentReportId.value = null
  persistSavedReports()
}

function toggleReportsPanel() {
  reportsPanelOpen.value = !reportsPanelOpen.value
}

function exportSingleReport(report: SavedReport) {
  const data = {
    exportedAt: new Date().toISOString(),
    type: 'report',
    report: report,
  }
  downloadJSON(data, `report-${report.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`)
}

// Mock data for unconfigured preview
const mockFields = [
  'Team Name',
  'Group',
  'FIFA Ranking',
  'Elo Rating',
  'Confederation',
  'Group Win Prob.',
  'Advance Prob.',
  'Tournament Win Prob.',
  'Historical Goals',
  'Historical Wins',
  'Historical Losses',
  'World Cup Appearances',
]
</script>

<style scoped>
.report-builder {
  min-height: 100vh;
  padding: 24px;
  background:
    /* Penalty arc top */
    radial-gradient(circle 180px at 50% 0%, transparent 178px, rgba(255,255,255,0.07) 178px, rgba(255,255,255,0.07) 180px, transparent 180px),
    /* Goal area top */
    linear-gradient(0deg, transparent 0px, transparent 80px, rgba(255,255,255,0.06) 80px, rgba(255,255,255,0.06) 82px, transparent 82px),
    linear-gradient(90deg, transparent calc(50% - 100px), rgba(255,255,255,0.06) calc(50% - 100px), rgba(255,255,255,0.06) calc(50% - 98px), transparent calc(50% - 98px), transparent calc(50% + 98px), rgba(255,255,255,0.06) calc(50% + 98px), rgba(255,255,255,0.06) calc(50% + 100px), transparent calc(50% + 100px)),
    /* Penalty area top */
    linear-gradient(0deg, transparent 0px, transparent 200px, rgba(255,255,255,0.05) 200px, rgba(255,255,255,0.05) 202px, transparent 202px),
    linear-gradient(90deg, transparent calc(50% - 200px), rgba(255,255,255,0.05) calc(50% - 200px), rgba(255,255,255,0.05) calc(50% - 198px), transparent calc(50% - 198px), transparent calc(50% + 198px), rgba(255,255,255,0.05) calc(50% + 198px), rgba(255,255,255,0.05) calc(50% + 200px), transparent calc(50% + 200px)),
    /* Penalty spot */
    radial-gradient(circle 3px at 50% 140px, rgba(255,255,255,0.10) 3px, transparent 3px),
    /* Corner arcs */
    radial-gradient(circle 30px at 0% 0%, transparent 28px, rgba(255,255,255,0.06) 28px, rgba(255,255,255,0.06) 30px, transparent 30px),
    radial-gradient(circle 30px at 100% 0%, transparent 28px, rgba(255,255,255,0.06) 28px, rgba(255,255,255,0.06) 30px, transparent 30px),
    radial-gradient(circle 30px at 0% 100%, transparent 28px, rgba(255,255,255,0.06) 28px, rgba(255,255,255,0.06) 30px, transparent 30px),
    radial-gradient(circle 30px at 100% 100%, transparent 28px, rgba(255,255,255,0.06) 28px, rgba(255,255,255,0.06) 30px, transparent 30px),
    /* Grass base */
    linear-gradient(180deg, #0b3d0b 0%, #0a3510 30%, #083010 60%, #062508 100%);
  background-attachment: fixed;
  position: relative;
}

/* Grass stripe texture + sideline border */
.report-builder::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    /* Boundary lines */
    linear-gradient(90deg, rgba(255,255,255,0.08) 2px, transparent 2px, transparent calc(100% - 2px), rgba(255,255,255,0.08) calc(100% - 2px)),
    linear-gradient(0deg, rgba(255,255,255,0.08) 2px, transparent 2px, transparent calc(100% - 2px), rgba(255,255,255,0.08) calc(100% - 2px)),
    /* Mowed grass stripes */
    repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 50px, transparent 50px, transparent 100px);
  pointer-events: none;
  z-index: 0;
}

/* Vignette for readability */
.report-builder::after {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse 110% 110% at 50% 40%, transparent 30%, rgba(0,0,0,0.45) 100%);
  pointer-events: none;
  z-index: 0;
}

.report-builder > * {
  position: relative;
  z-index: 1;
}

/* Header */
.builder-header {
  text-align: center;
  margin-bottom: 24px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.builder-title {
  font-size: 32px;
  font-weight: 900;
}

.builder-subtitle {
  margin-top: 10px;
  font-size: 14px;
  opacity: 0.6;
  line-height: 1.6;
}

/* Toolbar buttons (used in ChartBuilder toolbar-actions slot) */
.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
  color: #e6f1ff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toolbar-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-btn.save-btn {
  background: rgba(212, 175, 55, 0.15);
  border-color: rgba(212, 175, 55, 0.4);
  color: var(--gold);
}

.toolbar-btn.save-btn:hover:not(:disabled) {
  background: rgba(212, 175, 55, 0.25);
  border-color: var(--gold);
}

.import-btn {
  cursor: pointer;
}

.btn-icon {
  font-size: 14px;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Save Modal
   ───────────────────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 400px;
  padding: 24px;
  border-radius: 12px;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
}

.modal-body {
  margin-bottom: 24px;
}

.modal-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
  margin-bottom: 8px;
}

.modal-input {
  width: 100%;
  padding: 12px 14px;
  font-size: 14px;
  font-family: inherit;
  color: #e6f1ff;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.15s ease;
}

.modal-input:focus {
  border-color: var(--gold);
}

.modal-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.modal-hint {
  margin-top: 10px;
  font-size: 12px;
  opacity: 0.5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-btn {
  padding: 10px 20px;
  font-size: 14px;
  font-family: inherit;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-btn.cancel {
  color: #e6f1ff;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-btn.cancel:hover {
  background: rgba(255, 255, 255, 0.08);
}

.modal-btn.primary {
  color: #0a192f;
  background: var(--gold);
  border: none;
}

.modal-btn.primary:hover:not(:disabled) {
  background: #e6c84a;
}

.modal-btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease;
}
.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Saved Charts Panel
   ───────────────────────────────────────────────────────────────────────────── */
.saved-panel {
  position: fixed;
  top: 80px;
  right: 24px;
  width: 360px;
  max-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  z-index: 500;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.saved-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.close-btn {
  font-size: 24px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.6);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.close-btn:hover {
  color: #fff;
}

.saved-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.saved-chart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.saved-chart-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
}

.saved-chart-item.active {
  border-color: rgba(212, 175, 55, 0.5);
  background: rgba(212, 175, 55, 0.08);
}

.saved-chart-item.pinned {
  border-color: rgba(100, 200, 100, 0.4);
}

.pin-indicator {
  margin-right: 4px;
  font-size: 12px;
}

.icon-btn.pin-active {
  color: #64c864;
}

.saved-chart-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.saved-chart-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #e6f1ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.saved-chart-meta {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.saved-chart-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.icon-btn.danger:hover {
  background: rgba(255, 80, 80, 0.2);
  color: #ff6b6b;
}

.icon-btn.template-active {
  color: #64b5f6;
}

.template-tag-wrapper {
  position: relative;
  display: inline-flex;
}

.template-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  font-size: 8px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.template-badge.template-group {
  background: #2e7d32;
  color: #fff;
}

.template-badge.template-match {
  background: #c67c00;
  color: #fff;
}

/* Template modal */
.template-type-btns {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.template-type-btn {
  flex: 1;
  padding: 10px 12px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.template-type-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.template-type-btn.active {
  color: #fff;
  border-color: rgba(100, 181, 246, 0.6);
  background: rgba(100, 181, 246, 0.15);
}

.template-type-btn.template-type-group.active {
  border-color: rgba(76, 175, 80, 0.6);
  background: rgba(76, 175, 80, 0.15);
  color: #a5d6a7;
}

.template-type-btn.template-type-match.active {
  border-color: rgba(255, 183, 77, 0.6);
  background: rgba(255, 183, 77, 0.15);
  color: #ffcc80;
}

.modal-select {
  width: 100%;
  padding: 10px 12px;
  font-size: 13px;
  font-family: inherit;
  color: #e6f1ff;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  outline: none;
  cursor: pointer;
}

.modal-select:focus {
  border-color: var(--gold);
}

.modal-select option {
  background: #112240;
  color: #e6f1ff;
}

.saved-panel-empty {
  padding: 40px 20px;
  text-align: center;
}

.saved-panel-empty p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.saved-panel-empty .hint {
  font-size: 12px;
  margin-top: 8px;
  opacity: 0.5;
}

/* Panel slide transition */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* ACK workspace */
.builder-workspace {
  max-width: 1400px;
  margin: 0 auto;
}

/* Preview mode (unconfigured) */
.builder-preview-mode {
  max-width: 1200px;
  margin: 0 auto;
}

.preview-layout {
  display: grid;
  grid-template-columns: 220px 1fr 240px;
  gap: 16px;
  min-height: 500px;
}

.preview-sidebar,
.preview-canvas,
.preview-config {
  padding: 20px;
}

.preview-panel-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.5;
  margin-bottom: 16px;
}

.preview-field {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: default;
}

.preview-field-icon {
  color: var(--gold);
  font-size: 8px;
}

.preview-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.preview-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.4;
}

.preview-empty-state h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.preview-empty-state p {
  font-size: 13px;
  opacity: 0.5;
  max-width: 400px;
  line-height: 1.6;
}

.preview-instructions {
  margin-top: 24px;
  text-align: left;
  font-size: 13px;
  opacity: 0.6;
  line-height: 1.8;
}

.preview-instructions code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.preview-instructions ol {
  padding-left: 20px;
  margin-top: 8px;
}

.preview-slot {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  margin-bottom: 10px;
}

.preview-slot-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.5;
}

.preview-slot-drop {
  font-size: 12px;
  opacity: 0.3;
  font-style: italic;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Report Dashboard
   ═══════════════════════════════════════════════════════════════════════════ */
.dashboard-section {
  margin-bottom: 24px;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.dashboard-title-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dashboard-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
}

.dashboard-subtitle {
  font-size: 13px;
  opacity: 0.5;
}

.dashboard-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* Dashboard grid (Gridstack) */
.dashboard-grid {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  min-height: 400px;
}

/* Gridstack overrides for dark theme */
.dashboard-grid.grid-stack {
  background: transparent;
}

.dashboard-grid .grid-stack-item-content {
  background: transparent;
  inset: 4px;
}

.dashboard-grid .grid-stack-placeholder > .placeholder-content {
  background: rgba(212, 175, 55, 0.15);
  border: 2px dashed var(--gold);
  border-radius: 12px;
}

/* Resize handle styling */
.dashboard-grid .gs-resizable-handle {
  width: 16px;
  height: 16px;
}

.dashboard-grid .gs-resizable-se {
  right: 4px;
  bottom: 4px;
  background: none;
  cursor: se-resize;
}

.dashboard-grid .gs-resizable-se::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  width: 10px;
  height: 10px;
  border-right: 2px solid rgba(255, 255, 255, 0.4);
  border-bottom: 2px solid rgba(255, 255, 255, 0.4);
}

.dashboard-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  background: rgba(13, 27, 48, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dashboard-item luzmo-embed-viz-item {
  width: 100%;
  height: 100%;
  display: block;
}

/* Drag handle overlay - top left */
.dashboard-drag-handle {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.dashboard-item:hover .dashboard-drag-handle {
  opacity: 1;
}

.dashboard-drag-handle:hover {
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
}

/* Edit button overlay - top center-right */
.dashboard-edit-btn {
  position: absolute;
  top: 8px;
  right: 42px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  opacity: 0;
  transition: opacity 0.2s ease, background 0.15s ease;
  z-index: 10;
}

.dashboard-item:hover .dashboard-edit-btn {
  opacity: 1;
}

.dashboard-edit-btn:hover {
  background: rgba(212, 175, 55, 0.8);
  color: #fff;
}

/* Remove button overlay - top right */
.dashboard-remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  opacity: 0;
  transition: opacity 0.2s ease, background 0.15s ease;
  z-index: 10;
}

.dashboard-item:hover .dashboard-remove-btn {
  opacity: 1;
}

.dashboard-remove-btn:hover {
  background: rgba(220, 53, 69, 0.9);
  color: #fff;
}

/* Empty dashboard state */
.dashboard-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
  border-radius: 12px;
}

.dashboard-empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.4;
}

.dashboard-empty h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.dashboard-empty p {
  font-size: 13px;
  opacity: 0.5;
  max-width: 400px;
}

/* Add chart modal - chart picker */
.modal-wide {
  max-width: 600px;
}

.chart-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.chart-picker-item {
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.chart-picker-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}

.chart-picker-item.selected {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--gold);
}

.chart-picker-name {
  font-size: 14px;
  font-weight: 600;
  color: #e6f1ff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chart-picker-type {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

/* Reports panel position */
.reports-panel {
  right: 24px;
}

/* Responsive */
@media (max-width: 1024px) {
  .builder-main,
  .preview-layout {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
