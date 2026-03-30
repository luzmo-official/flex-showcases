<template>
  <div class="chart-creator-section">
    <button class="creator-toggle" @click="isOpen = !isOpen">
      <span class="creator-toggle-icon">{{ isOpen ? '&#9660;' : '&#9654;' }}</span>
      <span class="creator-toggle-title">{{ toggleTitle }}</span>
      <span class="creator-toggle-hint" v-if="!isOpen">
        {{ toggleHint }}
      </span>
    </button>

    <Transition name="creator-slide">
      <div v-if="isOpen" class="chart-creator-body">
        <div class="builder-toolbar glass-panel">
          <div class="toolbar-section">
            <label class="toolbar-label">Chart Type</label>
            <div class="chart-type-dropdown">
              <button
                type="button"
                class="chart-type-trigger"
                :class="{ open: chartTypeDropdownOpen }"
                @click="chartTypeDropdownOpen = !chartTypeDropdownOpen"
                @blur="onChartTypeBlur"
              >
                <span>{{ chartTypeLabel }}</span>
                <span class="chart-type-arrow">&#9660;</span>
              </button>
              <Transition name="dropdown">
                <div v-show="chartTypeDropdownOpen" class="chart-type-menu">
                  <button
                    v-for="opt in chartTypeOptions"
                    :key="opt.value"
                    type="button"
                    class="chart-type-option"
                    :class="{ active: chartType === opt.value }"
                    @mousedown.prevent="selectChartType(opt.value)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </Transition>
            </div>
          </div>

          <div class="toolbar-actions">
            <slot name="toolbar-actions"></slot>
          </div>
        </div>

        <div class="builder-main">
          <!-- Left: Data fields panel -->
          <div class="builder-sidebar glass-panel">
            <h3 class="sidebar-title">Data Fields</h3>
            <p class="sidebar-hint">Click a field to add it to a slot, or drag it directly</p>
            <div class="fields-drag-panel" @click="onFieldsPanelClick">
              <luzmo-data-field-panel
                ref="dataFieldsPanel"
                :apiUrl="apiHost"
                :authKey="apiKey"
                :authToken="apiToken"
                :datasetIds="allDatasetIds"
                :datasetPicker="true"
                search="auto"
                language="en"
              >
              </luzmo-data-field-panel>
            </div>
            <Transition name="dropdown">
              <div
                v-if="clickedField"
                class="field-slot-menu"
                :style="{ top: slotMenuPosition.top + 'px', left: slotMenuPosition.left + 'px' }"
              >
                <div class="field-slot-menu-title">Add "{{ clickedField.name }}" to:</div>
                <template v-if="slotNamesForType.length">
                  <button
                    v-for="slot in slotNamesForType"
                    :key="slot"
                    type="button"
                    class="field-slot-option"
                    @click="addFieldToSelectedSlot(slot)"
                  >
                    {{ formatSlotLabel(slot) }}
                  </button>
                </template>
                <div v-else class="field-slot-empty">No slots for this chart type</div>
                <button type="button" class="field-slot-cancel" @click="clickedField = null">Cancel</button>
              </div>
            </Transition>
          </div>

          <!-- Center: Chart preview -->
          <div class="builder-center">
            <div class="builder-preview glass-panel">
              <div class="preview-header">
                <h3 class="panel-title">Preview</h3>
              </div>
              <div class="preview-content">
                <luzmo-embed-viz-item
                  ref="vizItem"
                  :appServer="appServer"
                  :apiHost="apiHost"
                  :authKey="apiKey"
                  :authToken="apiToken"
                  language="en"
                >
                </luzmo-embed-viz-item>
              </div>
            </div>
          </div>

          <!-- Right: Options + Filters -->
          <div class="builder-config glass-panel">
            <div class="config-section">
              <h3 class="panel-title">Chart Title</h3>
              <input
                type="text"
                class="title-input"
                v-model="chartTitle"
                placeholder="Enter chart title..."
              />
              <p class="title-hint">This title appears in the chart header</p>
            </div>

            <div class="config-section config-section-collapsible">
              <button type="button" class="collapsible-header" @click="slotsSectionOpen = !slotsSectionOpen">
                <span class="panel-title">Data slots</span>
                <span class="collapsible-arrow" :class="{ open: slotsSectionOpen }">&#9660;</span>
              </button>
              <div v-show="slotsSectionOpen" class="collapsible-content">
                <luzmo-item-slot-drop-panel
                  ref="dropPanel"
                  :apiUrl="apiHost"
                  :authKey="apiKey"
                  :authToken="apiToken"
                  :item-type="chartType"
                  :slotsContents="slotsContentsPlain"
                  language="en"
                  @luzmo-slots-contents-changed="onSlotsChanged"
                >
                </luzmo-item-slot-drop-panel>
                <p v-if="dropPanelEmptyHint" class="drop-panel-hint">{{ dropPanelEmptyHint }}</p>
              </div>
            </div>

            <div class="config-section">
              <h3 class="panel-title">Chart Options</h3>
              <luzmo-item-option-panel
                ref="editItem"
                :apiUrl="apiHost"
                :authKey="apiKey"
                :authToken="apiToken"
                :item-type="chartType"
                :options="chartOptions"
                :slots="slotsContents"
                language="en"
                @luzmo-options-changed="onOptionsChanged"
              >
              </luzmo-item-option-panel>
            </div>

            <div class="config-section config-section-collapsible">
              <button type="button" class="collapsible-header" @click="filtersSectionOpen = !filtersSectionOpen">
                <span class="panel-title">Filters</span>
                <span class="collapsible-arrow" :class="{ open: filtersSectionOpen }">&#9660;</span>
              </button>
              <div v-show="filtersSectionOpen" class="collapsible-content">
                <p v-if="filterHint" class="filter-hint">{{ filterHint }}</p>
                <luzmo-filters
                  ref="editFilters"
                  :apiUrl="apiHost"
                  :authKey="apiKey"
                  :authToken="apiToken"
                  :datasetIds="allDatasetIds"
                  :filters="chartFiltersPlain"
                  datasetPicker
                  language="en"
                  @luzmo-filters-changed="onFiltersChanged"
                >
                </luzmo-filters>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useLuzmo } from '../composables/useLuzmo'
import { useAckChartBuilder } from '../composables/useAckChartBuilder'
import { CHART_TYPE_OPTIONS, getChartTypeLabel, getSlotsForChartType, getSlotDisplayName } from '../data/chartTypes'
import { addFieldToSlot, normalizeSlotContents } from '../composables/useSlotHelpers'

const props = withDefaults(defineProps<{
  initiallyOpen?: boolean
  toggleTitle?: string
  toggleHint?: string
  filterHint?: string
}>(), {
  initiallyOpen: true,
  toggleTitle: 'Chart Creator',
  toggleHint: 'Create and configure charts',
})

const {
  apiKey,
  apiToken,
  appServer,
  apiHost,
  allDatasetIds,
} = useLuzmo()

const {
  chartType,
  slotsContents,
  chartOptions,
  chartFilters,
  slotsContentsPlain,
  chartFiltersPlain,
  updateVizItem: updateVizItemFromComposable,
  syncDropPanelItemType,
  onSlotsChanged: onSlotsChangedComposable,
  onOptionsChanged: onOptionsChangedComposable,
  onFiltersChanged: onFiltersChangedComposable,
  resetSlotsAndOptions,
} = useAckChartBuilder()

// Component refs
const vizItem = ref<HTMLElement | null>(null)
const dropPanel = ref<HTMLElement | null>(null)
const editItem = ref<HTMLElement | null>(null)
const dataFieldsPanel = ref<HTMLElement | null>(null)

const isOpen = ref(props.initiallyOpen)
const chartTitle = ref('')
const dropPanelEmptyHint = ref('Loading chart slots…')

// Chart type dropdown
const chartTypeDropdownOpen = ref(false)
const chartTypeOptions = CHART_TYPE_OPTIONS
const chartTypeLabel = computed(() => getChartTypeLabel(chartType.value))

function selectChartType(value: string) {
  chartType.value = value
  chartTypeDropdownOpen.value = false
}
function onChartTypeBlur() {
  setTimeout(() => { chartTypeDropdownOpen.value = false }, 150)
}

// Collapsible sections
const slotsSectionOpen = ref(true)
const filtersSectionOpen = ref(true)
const slotNamesForType = computed(() => getSlotsForChartType(chartType.value))

function formatSlotLabel(slot: string): string {
  return getSlotDisplayName(slot)
}

// Click-to-add state
interface ClickedFieldInfo {
  id: string
  name: string
  datasetId: string
  /** hierarchy | numeric | datetime - from Luzmo data field, used for valid aggregation in measure slots */
  type?: string
}
const clickedField = ref<ClickedFieldInfo | null>(null)
const slotMenuPosition = ref({ top: 0, left: 0 })

function onFieldsPanelClick(event: MouseEvent) {
  const path = event.composedPath() as HTMLElement[]

  let draggableItem: HTMLElement | null = null
  for (const el of path) {
    if (el instanceof HTMLElement && el.getAttribute('draggable') === 'true') {
      draggableItem = el
      break
    }
    if (el instanceof HTMLElement && el.tagName === 'LUZMO-DRAGGABLE-DATA-FIELDS-PANEL') {
      break
    }
  }

  if (!draggableItem) {
    clickedField.value = null
    return
  }

  const el = draggableItem as unknown as Record<string, unknown>
  const data = el.data as Record<string, unknown> | undefined

  const columnId = data?.columnId as string || ''
  const datasetId = data?.datasetId as string || allDatasetIds.value[0] || ''
  const nameObj = data?.name as Record<string, string> | undefined
  const nameKey = nameObj ? Object.keys(nameObj)[0] : undefined
  const fieldName = nameObj?.en ?? (nameKey ? nameObj?.[nameKey] : undefined) ?? 'Unknown field'
  const fieldType = typeof data?.type === 'string' ? data.type : undefined

  if (columnId) {
    clickedField.value = { id: columnId, name: fieldName, datasetId, type: fieldType }
    const rect = draggableItem.getBoundingClientRect()
    const sidebar = document.querySelector('.builder-sidebar')
    const sidebarRect = sidebar?.getBoundingClientRect() || { top: 0, left: 0 }
    slotMenuPosition.value = {
      top: rect.bottom - sidebarRect.top + 4,
      left: rect.left - sidebarRect.left
    }
  }
}

function addFieldToSelectedSlot(slotName: string) {
  if (!clickedField.value) return

  slotsContents.value = addFieldToSlot(
    slotsContents.value,
    chartType.value,
    slotName,
    clickedField.value.id,
    clickedField.value.datasetId,
    clickedField.value.name,
    clickedField.value.type
  )
  updateViz()
  clickedField.value = null
}

function onDocumentClickForSlotMenu(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.field-slot-menu') && !target.closest('.fields-drag-panel')) {
    clickedField.value = null
  }
}

// ACK event handlers
function onSlotsChanged(event: CustomEvent<{ slotsContents: typeof slotsContents.value }>) {
  onSlotsChangedComposable(event)
  updateViz()
}
function onOptionsChanged(event: CustomEvent<{ options: typeof chartOptions.value }>) {
  onOptionsChangedComposable(event)
  updateViz()
}
function onFiltersChanged(event: CustomEvent<{ filters: typeof chartFilters.value }>) {
  onFiltersChangedComposable(event)
  updateViz()
}

function updateViz() {
  updateVizItemFromComposable(vizItem, { chartTitleRef: chartTitle })
}

// Chart type change: reset
watch(chartType, () => {
  resetSlotsAndOptions()
  chartTitle.value = ''
  updateViz()
  nextTick(() => syncDropPanelItemType(dropPanel))
})

// Title change: update preview
watch(chartTitle, () => {
  updateViz()
})

// Check if chart has data
const hasChartData = computed(() => slotsContents.value.some((s) => s.content.length > 0))

/**
 * Load a saved chart configuration into the builder.
 */
function loadConfig(config: {
  chartType: string
  slotsContents: Array<{ name: string; content: unknown[] }>
  chartOptions: Record<string, unknown>
  chartFilters: unknown[]
  name?: string
}) {
  chartType.value = config.chartType
  nextTick(() => {
    const raw = JSON.parse(JSON.stringify(config.slotsContents))
    slotsContents.value = normalizeSlotContents(raw, config.chartType)
    chartOptions.value = JSON.parse(JSON.stringify(config.chartOptions))
    chartFilters.value = JSON.parse(JSON.stringify(config.chartFilters))
    chartTitle.value = config.name || ''
    updateViz()
    syncDropPanelItemType(dropPanel)
  })
}

function open() {
  isOpen.value = true
}

onMounted(() => {
  document.addEventListener('click', onDocumentClickForSlotMenu)
  nextTick(() => {
    updateViz()
    syncDropPanelItemType(dropPanel)
    // Refs used by template (ref="editItem", ref="dataFieldsPanel")
    void editItem.value
    void dataFieldsPanel.value
  })
  setTimeout(() => {
    dropPanelEmptyHint.value = 'Click a field to add it, or drag it to a slot.'
  }, 2500)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClickForSlotMenu)
})

defineExpose({
  chartType,
  slotsContents,
  chartOptions,
  chartFilters,
  chartTitle,
  hasChartData,
  isOpen,
  loadConfig,
  open,
})
</script>

<style scoped>
.chart-creator-section {
  margin-bottom: 24px;
}

.creator-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 18px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(10, 25, 47, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.creator-toggle:hover {
  background: rgba(10, 25, 47, 0.95);
  border-color: rgba(255, 255, 255, 0.18);
}

.creator-toggle-icon {
  font-size: 10px;
  color: #d4af37;
  width: 14px;
  text-align: center;
}

.creator-toggle-title {
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.creator-toggle-hint {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  margin-left: auto;
}

.chart-creator-body {
  padding-top: 16px;
}

.creator-slide-enter-active,
.creator-slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.creator-slide-enter-from,
.creator-slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
}
.creator-slide-enter-to,
.creator-slide-leave-from {
  opacity: 1;
  max-height: 3000px;
}

/* Toolbar */
.builder-toolbar {
  position: relative;
  z-index: 100;
  max-width: 1400px;
  margin: 0 auto 16px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

/* Chart type dropdown */
.chart-type-dropdown {
  position: relative;
}

.chart-type-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 160px;
  padding: 8px 16px;
  font-size: 14px;
  font-family: inherit;
  font-weight: 600;
  color: #e6f1ff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.chart-type-trigger:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
}

.chart-type-trigger.open {
  border-color: var(--gold);
  background: rgba(255, 255, 255, 0.1);
}

.chart-type-trigger:focus {
  outline: none;
  border-color: var(--gold);
}

.chart-type-arrow {
  font-size: 10px;
  opacity: 0.8;
  transition: transform 0.2s ease;
}

.chart-type-trigger.open .chart-type-arrow {
  transform: rotate(180deg);
}

.chart-type-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 100%;
  max-height: 280px;
  overflow-y: auto;
  padding: 4px 0;
  background: #112240;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 50;
}

.chart-type-option {
  display: block;
  width: 100%;
  padding: 10px 16px;
  font-size: 14px;
  font-family: inherit;
  font-weight: 500;
  color: #e6f1ff;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s ease;
}

.chart-type-option:hover {
  background: rgba(255, 255, 255, 0.08);
}

.chart-type-option.active {
  background: rgba(212, 175, 55, 0.2);
  color: var(--gold);
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 3-panel layout */
.builder-main {
  display: grid;
  grid-template-columns: 260px 1fr 300px;
  gap: 16px;
  min-height: 650px;
}

.builder-sidebar {
  padding: 16px;
  overflow-y: auto;
  position: relative;
}

.sidebar-title {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sidebar-hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 12px;
}

.fields-drag-panel {
  margin-top: 8px;
  min-height: 120px;
  cursor: pointer;
}

.fields-drag-panel luzmo-data-field-panel {
  display: block;
}

/* Slot selection menu */
.field-slot-menu {
  position: absolute;
  z-index: 100;
  background: rgba(30, 30, 50, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 0;
  min-width: 180px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.field-slot-menu-title {
  padding: 8px 12px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.field-slot-option {
  display: block;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  color: #fff;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.15s;
}

.field-slot-option:hover {
  background: rgba(99, 102, 241, 0.3);
}

.field-slot-empty {
  padding: 10px 12px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.field-slot-cancel {
  display: block;
  width: 100%;
  padding: 8px 12px;
  margin-top: 4px;
  background: none;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  cursor: pointer;
  font-size: 0.85rem;
}

.field-slot-cancel:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

/* Center panel */
.builder-center {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.builder-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 350px;
}

.preview-header {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-title {
  font-size: 12px;
  font-weight: 700;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
}

.preview-content {
  flex: 1;
  padding: 16px;
  min-height: 280px;
}

.preview-content luzmo-embed-viz-item {
  width: 100%;
  height: 100%;
  min-height: 250px;
}

/* Config panel */
.builder-config {
  padding: 16px;
  overflow-y: auto;
}

.config-section {
  margin-bottom: 24px;
}

.config-section:last-child {
  margin-bottom: 0;
}

.config-section-collapsible {
  margin-bottom: 24px;
}

.collapsible-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 0 12px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  background: none;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.collapsible-header:hover {
  color: #fff;
}

.collapsible-arrow {
  font-size: 10px;
  opacity: 0.8;
  transition: transform 0.2s ease;
}

.collapsible-arrow.open {
  transform: rotate(180deg);
}

.collapsible-content {
  padding-top: 12px;
}

.collapsible-content luzmo-item-slot-drop-panel {
  display: block;
  min-height: 140px;
}

.drop-panel-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--luzmo-font-color, rgba(255, 255, 255, 0.85));
  opacity: 0.9;
}

.title-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  color: #e6f1ff;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.15s ease;
}

.title-input:focus {
  border-color: var(--gold);
}

.title-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.title-hint {
  margin: 6px 0 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.filter-hint {
  margin: 0 0 12px;
  padding: 8px 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(99, 102, 241, 0.15);
  border-radius: 6px;
  border-left: 3px solid rgba(99, 102, 241, 0.6);
}

/* Responsive */
@media (max-width: 1024px) {
  .builder-main {
    grid-template-columns: 1fr;
  }
}
</style>
