<template>
  <SoccerPitch>
    <HeroSection />

    <!-- Two-column layout: left = report only, right = groups (~26%) -->
    <div class="landing-layout">
      <div class="landing-left">
        <!-- Report browser -->
        <div class="report-browser-panel">
        <template v-if="savedReports.length > 0">
          <div class="report-featured" v-if="featuredReport">
            <div class="report-featured-header">
              <button
                v-if="savedReports.length > 1"
                type="button"
                class="btn-report-nav"
                title="Previous report"
                @click="goToPrevReport"
              >
                &#8249;
              </button>
              <button
                v-if="savedReports.length > 1"
                type="button"
                class="btn-report-nav"
                title="Next report"
                @click="goToNextReport"
              >
                &#8250;
              </button>
              <div class="report-featured-title-meta">
                <h3 class="report-name">{{ featuredReport.name }}</h3>
                <p class="report-meta">
                  {{ featuredReport.items.length }} chart{{ featuredReport.items.length !== 1 ? 's' : '' }}
                  &middot; {{ formatReportDate(featuredReport.updatedAt) }}
                </p>
              </div>
              <router-link :to="reportLink(featuredReport.id)" class="btn-report-edit">
                &#9998; Edit report
              </router-link>
              <router-link to="/builder" class="btn-report-edit btn-build-new-inline">
                &#43; Build new report
              </router-link>
            </div>
            <div class="report-dashboard-preview">
              <div
                v-for="item in featuredReport.items"
                :key="item.id"
                class="report-dashboard-item glass-panel"
                :style="reportItemGridStyle(item)"
              >
                <div class="report-dashboard-chart">
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
                  />
                </div>
              </div>
            </div>
          </div>
        </template>

        <div class="report-list-empty glass-panel" v-else>
          <div class="empty-icon">&#128202;</div>
          <p class="empty-title">No reports yet</p>
          <p class="empty-hint">Create your first analytics report to see it here</p>
          <router-link to="/builder" class="btn-primary">Build Your First Report</router-link>
        </div>
      </div>
      </div>

      <!-- Groups sidebar -->
      <aside class="groups-sidebar">
        <!-- 
        <h2 class="sidebar-title">Group Stage</h2>
        <p class="sidebar-subtitle">Explore group odds &amp; team stats</p>
        -->
        <div class="groups-grid-two">
          <GroupCard
            v-for="group in groups"
            :key="group.id"
            :group="group"
          />
        </div>
      </aside>
    </div>

    <!-- Bracket (left 2/3) + Tournament favorites (right 1/3) -->
    <div class="bracket-favorites-row">
      <div class="bracket-col-two-thirds">
        <MiniBracket :get-match="getBracketMatch" :format-pct="formatPct" />
      </div>
      <div class="favorites-col-one-third">
        <TournamentFavorites :favorites="topFavoritesFormatted" />
      </div>
    </div>

    <!-- Live Analytics section - shows saved charts or built-in charts -->
    <div class="ack-section" v-if="isLuzmoConfigured">
      <div class="section-header">
        <div>
          <h2 class="section-title">Live Analytics</h2>
          <p class="section-subtitle">
            {{ hasPinnedCharts ? 'Your pinned charts' : (savedChartsForDisplay.length > 0 ? 'Your recent charts' : 'Powered by Luzmo Analytics Components Kit') }}
          </p>
        </div>
        <button
          v-if="savedCharts.length > 0"
          class="settings-btn"
          @click="showChartSettings = true"
          title="Choose which charts to display"
        >
          &#9881; Customize
        </button>
      </div>
      
      <!-- Display saved charts if available -->
      <div class="analytics-grid" v-if="savedChartsForDisplay.length > 0">
        <div
          v-for="chart in savedChartsForDisplay"
          :key="chart.id"
          class="analytics-card glass-panel"
        >
          <span v-if="isChartPinned(chart.id)" class="pin-indicator">&#128204;</span>
          <div class="chart-container">
            <luzmo-embed-viz-item
              :appServer="appServer"
              :apiHost="apiHost"
              :authKey="apiKey"
              :authToken="apiToken"
              :type="chart.chartType"
              :slots="chart.slotsContents"
              :options="getOptionsWithTitle(chart)"
              :filters="chart.chartFilters"
              language="en"
            >
            </luzmo-embed-viz-item>
          </div>
        </div>
        <div class="analytics-cta glass-panel">
          <p>You have <strong>{{ totalSavedCharts }}</strong> saved chart(s)</p>
          <router-link to="/builder" class="btn-secondary">
            Open Report Builder
          </router-link>
        </div>
      </div>

      <!-- Fallback: try to build charts from columns if no saved charts -->
      <div class="analytics-grid" v-else>
        <!-- Tournament Win Probability Chart -->
        <div class="analytics-card glass-panel">
          <h3 class="card-title">Tournament Win Probability</h3>
          <div class="chart-container">
            <luzmo-embed-viz-item
              ref="tournamentChart"
              :appServer="appServer"
              :apiHost="apiHost"
              :authKey="apiKey"
              :authToken="apiToken"
              language="en"
            >
            </luzmo-embed-viz-item>
            <div
              v-if="chartsReady.loading || !chartsReady.tournament"
              class="chart-placeholder"
            >
              <p>{{ chartsReady.loading ? 'Loading chart…' : 'Build a chart in Report Builder to see it here.' }}</p>
              <router-link to="/builder" class="btn-small">Build a Chart</router-link>
            </div>
          </div>
        </div>

        <!-- Group Advancement by Confederation -->
        <div class="analytics-card glass-panel">
          <h3 class="card-title">Group Advancement by Confederation</h3>
          <div class="chart-container">
            <luzmo-embed-viz-item
              ref="confederationChart"
              :appServer="appServer"
              :apiHost="apiHost"
              :authKey="apiKey"
              :authToken="apiToken"
              language="en"
            >
            </luzmo-embed-viz-item>
            <div
              v-if="chartsReady.loading || !chartsReady.confederation"
              class="chart-placeholder"
            >
              <p>{{ chartsReady.loading ? 'Loading chart…' : 'Build a chart in Report Builder to see it here.' }}</p>
              <router-link to="/builder" class="btn-small">Build a Chart</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart settings modal -->
      <Transition name="modal">
        <div v-if="showChartSettings" class="modal-overlay" @click.self="showChartSettings = false">
          <div class="modal-content glass-panel">
            <div class="modal-header">
              <h3 class="modal-title">Customize Home Charts</h3>
              <button class="close-btn" @click="showChartSettings = false">&times;</button>
            </div>
            <div class="modal-body">
              <p class="modal-hint">Pin up to 4 charts to display on the home page. Pinned charts appear first.</p>
              <div class="chart-list">
                <div
                  v-for="chart in savedCharts"
                  :key="chart.id"
                  class="chart-list-item"
                  :class="{ pinned: isChartPinned(chart.id) }"
                  @click="togglePinChart(chart.id)"
                >
                  <span class="chart-list-pin">{{ isChartPinned(chart.id) ? '&#128204;' : '&#9711;' }}</span>
                  <span class="chart-list-name">{{ chart.name }}</span>
                  <span class="chart-list-type">{{ chart.chartType.replace('-', ' ') }}</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-primary" @click="showChartSettings = false">Done</button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </SoccerPitch>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import SoccerPitch from '../components/SoccerPitch.vue'
import GroupCard from '../components/GroupCard.vue'
import HeroSection from '../components/HeroSection.vue'
import MiniBracket from '../components/MiniBracket.vue'
import TournamentFavorites from '../components/TournamentFavorites.vue'
import { groups } from '../data/groups'
import { useLuzmo } from '../composables/useLuzmo'
import { useLuzmoColumns } from '../composables/useLuzmoColumns'
import { useBracketSimulation } from '../composables/useBracketSimulation'
import { mergeThemeOptions } from '../data/luzmoTheme'
import {
  getColumnIdByNameFromEnv,
  hasMinimalColumnIdsFromEnv,
} from '../composables/useLuzmoColumnIdsFromEnv'
import { seedBuiltInReports } from '../composables/useSeedBuiltInReports'

// Types for saved charts (matches ReportBuilder)
interface SavedChart {
  id: string
  name: string
  chartType: string
  slotsContents: Array<{ name: string; content: unknown[] }>
  chartOptions: Record<string, unknown>
  chartFilters: unknown[]
  createdAt: string
  updatedAt: string
}

const CHARTS_STORAGE_KEY = 'worldcup-report-builder-charts'
const REPORTS_STORAGE_KEY = 'worldcup-report-builder-reports'
const PINNED_CHARTS_KEY = 'worldcup-home-pinned-charts'

interface SavedReport {
  id: string
  name: string
  items: Array<{ id: string; chart: SavedChart; x: number; y: number; w: number; h: number }>
  createdAt: string
  updatedAt: string
}

const savedReports = ref<SavedReport[]>([])

function loadSavedReports() {
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY)
    if (raw) {
      savedReports.value = JSON.parse(raw)
    }
  } catch (e) {
    console.warn('Failed to load saved reports', e)
  }
}

function formatReportDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function reportLink(reportId: string): { path: string; query: { report: string } } {
  return { path: '/builder', query: { report: reportId } }
}

const featuredReportIndex = ref(0)
const featuredReport = computed(() => {
  const list = savedReports.value
  if (list.length === 0) return null
  const idx = Math.min(featuredReportIndex.value, list.length - 1)
  return list[idx] ?? null
})

watch(savedReports, (list) => {
  if (list.length > 0 && featuredReportIndex.value >= list.length) {
    featuredReportIndex.value = list.length - 1
  }
}, { immediate: true })

function goToPrevReport() {
  const n = savedReports.value.length
  if (n <= 1) return
  featuredReportIndex.value = (featuredReportIndex.value - 1 + n) % n
}

function goToNextReport() {
  const n = savedReports.value.length
  if (n <= 1) return
  featuredReportIndex.value = (featuredReportIndex.value + 1) % n
}

function reportItemGridStyle(item: { x: number; y: number; w: number; h: number }): Record<string, string> {
  return {
    gridColumn: `${item.x + 1} / span ${item.w}`,
    gridRow: `${item.y + 1} / span ${item.h}`,
  }
}

const {
  apiKey,
  apiToken,
  appServer,
  apiHost,
  datasetGroupsOdds,
  isConfigured: isLuzmoConfigured,
} = useLuzmo()

const { columnIdByName } = useLuzmoColumns(
  apiHost,
  apiKey,
  apiToken,
  datasetGroupsOdds
)

// Chart refs
const tournamentChart = ref<HTMLElement | null>(null)
const confederationChart = ref<HTMLElement | null>(null)

/** When we have column IDs and have applied config to both charts */
const chartsReady = ref({ loading: true, tournament: false, confederation: false })

// Saved charts from Report Builder
const savedCharts = ref<SavedChart[]>([])
const pinnedChartIds = ref<string[]>([])
const showChartSettings = ref(false)

const totalSavedCharts = computed(() => savedCharts.value.length)

// Charts to display: pinned charts first, then fall back to recent
const savedChartsForDisplay = computed(() => {
  if (pinnedChartIds.value.length > 0) {
    // Show pinned charts in order
    return pinnedChartIds.value
      .map((id) => savedCharts.value.find((c) => c.id === id))
      .filter((c): c is SavedChart => c !== undefined)
  }
  // Fall back to most recent 3
  return savedCharts.value.slice(0, 3)
})

const hasPinnedCharts = computed(() => pinnedChartIds.value.length > 0)

function getOptionsWithTitle(chart: SavedChart): Record<string, unknown> {
  return mergeThemeOptions(chart.chartOptions, chart.name)
}

function loadSavedCharts() {
  try {
    const raw = localStorage.getItem(CHARTS_STORAGE_KEY)
    if (raw) {
      savedCharts.value = JSON.parse(raw)
    }
  } catch (e) {
    console.warn('Failed to load saved charts', e)
  }
}

function loadPinnedCharts() {
  try {
    const raw = localStorage.getItem(PINNED_CHARTS_KEY)
    if (raw) {
      pinnedChartIds.value = JSON.parse(raw)
    }
  } catch (e) {
    console.warn('Failed to load pinned charts', e)
  }
}

function persistPinnedCharts() {
  try {
    localStorage.setItem(PINNED_CHARTS_KEY, JSON.stringify(pinnedChartIds.value))
  } catch (e) {
    console.warn('Failed to save pinned charts', e)
  }
}

function togglePinChart(chartId: string) {
  const idx = pinnedChartIds.value.indexOf(chartId)
  if (idx >= 0) {
    pinnedChartIds.value.splice(idx, 1)
  } else {
    if (pinnedChartIds.value.length >= 4) {
      alert('You can pin up to 4 charts. Unpin one first.')
      return
    }
    pinnedChartIds.value.push(chartId)
  }
  persistPinnedCharts()
}

function isChartPinned(chartId: string): boolean {
  return pinnedChartIds.value.includes(chartId)
}

// ─── Bracket preview ──────────────────────────────────────────────────────

const { getMatch: getBracketMatch } = useBracketSimulation()

/** Top 8 tournament favorites sorted by win probability */
const topFavorites = computed(() => {
  const allTeams = groups.flatMap((g) =>
    g.teams.map((t) => ({ team: t, group: g }))
  )
  return allTeams
    .sort((a, b) => b.team.tournamentWinProb - a.team.tournamentWinProb)
    .slice(0, 8)
})

/** Formatted for TournamentFavorites component: { team, pct } */
const topFavoritesFormatted = computed(() => {
  return topFavorites.value.map((item) => ({
    team: item.team,
    pct: formatPct(item.team.tournamentWinProb),
  }))
})

function formatPct(val: number): string {
  if (val < 0.01) return '<1%'
  return `${Math.round(val * 100)}%`
}

/** Luzmo Embed expects type, slots, options, filters as separate properties (no "item") */
function applyChartConfig(
  el: HTMLElement | null,
  config: { type: string; slots: Array<{ name: string; content: unknown[] }>; options: Record<string, unknown>; filters?: unknown[] }
) {
  if (!el) return
  const viz = el as HTMLElement & { type?: string; slots?: unknown[]; options?: unknown; filters?: unknown[] }
  viz.type = config.type
  viz.slots = config.slots
  viz.options = mergeThemeOptions(config.options)
  if (config.filters) viz.filters = config.filters
}

function buildCharts() {
  const dsId = datasetGroupsOdds.value
  const byName = columnIdByName.value
  const measureCol = byName['tournament_win_prob'] ?? byName['tournament win prob']
  const teamCol = byName['team']
  const advanceCol = byName['group_advance_prob'] ?? byName['group advance prob']
  const confCol = byName['confederation']
  const groupCol = byName['group']

  if (!dsId || !measureCol || !teamCol) {
    chartsReady.value = { loading: false, tournament: false, confederation: false }
    return
  }

  nextTick(() => {
    // Tournament Win Probability - Bar Chart (use type/slots/options/filters, not item)
    if (tournamentChart.value) {
      applyChartConfig(tournamentChart.value, {
        type: 'bar-chart',
        options: {
          display: { title: false },
          bars: { roundedCorners: 4 },
          legend: { position: 'none' },
        },
        slots: [
          {
            name: 'measure',
            content: [
              { columnId: measureCol, datasetId: dsId, type: 'numeric', format: '.0%', aggregationFunc: 'sum' },
            ],
          },
          {
            name: 'y-axis',
            content: [{ columnId: teamCol, datasetId: dsId, type: 'hierarchy' }],
          },
        ],
        filters: groupCol
          ? [
              {
                condition: 'and',
                filters: [
                  {
                    expression: '? > ?',
                    parameters: [{ columnId: measureCol, datasetId: dsId }, 0.02],
                  },
                ],
              },
            ]
          : undefined,
      })
      chartsReady.value = { ...chartsReady.value, loading: false, tournament: true }
    }

    // Group Advance by Confederation - Donut
    if (confederationChart.value && advanceCol && confCol) {
      applyChartConfig(confederationChart.value, {
        type: 'donut-chart',
        options: { display: { title: false }, legend: { position: 'right' } },
        slots: [
          {
            name: 'measure',
            content: [
              { columnId: advanceCol, datasetId: dsId, type: 'numeric', format: '.0%', aggregationFunc: 'sum' },
            ],
          },
          {
            name: 'category',
            content: [{ columnId: confCol, datasetId: dsId, type: 'hierarchy' }],
          },
        ],
      })
      chartsReady.value = { ...chartsReady.value, confederation: true }
    } else {
      chartsReady.value = { ...chartsReady.value, confederation: false }
    }
  })
}

onMounted(async () => {
  loadSavedReports()
  loadSavedCharts()
  loadPinnedCharts()

  if (savedReports.value.length === 0 && isLuzmoConfigured) {
    const seeded = await seedBuiltInReports()
    if (seeded) {
      loadSavedReports()
      loadSavedCharts()
    }
  }

  // If we have saved charts, we're done - they'll display automatically
  if (savedCharts.value.length > 0) {
    chartsReady.value = { loading: false, tournament: true, confederation: true }
    return
  }

  // Otherwise, try to build default charts from env column IDs only (no API call)
  if (!isLuzmoConfigured || !datasetGroupsOdds.value) {
    chartsReady.value = { loading: false, tournament: false, confederation: false }
    return
  }
  if (hasMinimalColumnIdsFromEnv()) {
    columnIdByName.value = getColumnIdByNameFromEnv()
    buildCharts()
  } else {
    chartsReady.value = { loading: false, tournament: false, confederation: false }
  }
})

</script>

<style scoped>
/* Two-column layout: left = report only, right = groups (~26%) */
.landing-layout {
  display: grid;
  grid-template-columns: 1fr 26%;
  gap: 0;
  width: 100%;
  align-items: start;
}

.landing-left {
  min-width: 0;
  padding: 0 24px 40px;
}

/* Full-width sections below the report+groups row */
.full-width-wrap {
  width: 100%;
  box-sizing: border-box;
  padding: 24px 24px 32px;
  margin-top: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.report-browser-panel {
  min-width: 0;
}

/* Groups sidebar */
.groups-sidebar {
  position: sticky;
  top: 72px;
  padding: 20px 20px 32px;
  backdrop-filter: blur(12px);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 100%;
}

.groups-sidebar .sidebar-title {
  font-size: 16px;
  font-weight: 800;
  margin: 0 0 4px;
  text-align: left;
}

.groups-sidebar .sidebar-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 16px;
}

.groups-grid-two {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.report-browser-header {
  margin-bottom: 24px;
}

.report-browser-header .panel-title {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 4px;
  text-align: left;
}

.report-browser-header .panel-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 16px;
}

.report-featured {
  margin-bottom: 24px;
}

.report-featured-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  margin-bottom: 16px;
}

.btn-report-nav {
  padding: 8px 12px;
  font-size: 18px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.btn-report-nav:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 215, 0, 0.4);
  color: #ffd700;
}

.report-featured-title-meta {
  flex: 1;
  min-width: 0;
}

.report-featured-header .report-name {
  margin: 0;
  font-size: 18px;
}

.report-featured-header .report-meta {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.report-featured-header .btn-report-edit,
.report-featured-header .btn-build-new-inline {
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.4);
  border-radius: 8px;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.report-featured-header .btn-report-edit:hover,
.report-featured-header .btn-build-new-inline:hover {
  background: rgba(255, 215, 0, 0.12);
  border-color: rgba(255, 215, 0, 0.6);
}

.btn-build-new-inline {
  color: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 255, 255, 0.25);
}

.btn-build-new-inline:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.4);
}

.report-dashboard-preview {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(80px, auto);
  gap: 12px;
  width: 100%;
  min-height: 200px;
}

.report-dashboard-item {
  min-height: 0;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.report-dashboard-chart {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.report-dashboard-chart :deep(luzmo-embed-viz-item) {
  flex: 1;
  min-height: 120px;
  width: 100%;
}

.btn-build-new {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  border-radius: 10px;
  transition: background 0.2s ease, transform 0.1s ease;
}

.btn-build-new:hover {
  transform: translateY(-1px);
}

.report-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.report-card:hover {
  border-color: rgba(212, 175, 55, 0.4);
  background: rgba(255, 255, 255, 0.03);
}

.report-card-body {
  min-width: 0;
}

.report-name {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #e6f1ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.report-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.btn-report-edit {
  flex-shrink: 0;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #d4af37;
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-report-edit:hover {
  background: rgba(212, 175, 55, 0.2);
  border-color: #d4af37;
}

.report-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.15);
}

.report-list-empty .empty-icon {
  font-size: 48px;
  opacity: 0.4;
  margin-bottom: 16px;
}

.report-list-empty .empty-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px;
}

.report-list-empty .empty-hint {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 20px;
}

/* Compact sections inside report panel */
.favorites-section-compact {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.full-width-wrap .favorites-section-compact {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

/* Bracket (left 2/3) + Favorites (right 1/3) row */
.bracket-favorites-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  align-items: stretch;
  padding: 0 24px 24px;
  max-width: 100%;
  box-sizing: border-box;
}

.bracket-col-two-thirds {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.bracket-col-two-thirds .bracket-preview-compact {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.bracket-col-two-thirds .mini-bracket-scroll {
  flex: 1;
  min-height: 0;
}

.favorites-col-one-third {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.favorites-col-one-third .favorites-section-compact {
  flex: 1;
  margin-top: 0;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  text-align: center;
}

.favorites-col-one-third .compact-section-title {
  text-align: center;
}

.favorites-col-one-third .favorite-chip {
  justify-content: center;
}

.favorites-strip-vertical {
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: flex-start;
  gap: 8px;
}

.compact-section-title {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 12px;
}

.bracket-preview-compact {
  margin-top: 20px;
  padding: 20px;
  border-radius: 12px;
}

/* Mini bracket: same shape as full bracket (left R16→QF→SF | Final | right SF→QF→R16) */
.mini-bracket-scroll {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px 10px;
  margin-bottom: 16px;
  overflow: auto;
  padding: 8px 0;
  flex: 1;
  min-height: 0;
  container-type: size;
  container-name: bracket-card;
}

.mini-bracket-inner {
  display: flex;
  align-items: center;
  gap: calc(6px * var(--bracket-scale, 1)) calc(10px * var(--bracket-scale, 1));
}

@container bracket-card (min-width: 280px) {
  .mini-bracket-inner { --bracket-scale: 1.15; }
}
@container bracket-card (min-width: 360px) {
  .mini-bracket-inner { --bracket-scale: 1.3; }
}
@container bracket-card (min-width: 440px) {
  .mini-bracket-inner { --bracket-scale: 1.45; }
}
@container bracket-card (min-width: 520px) {
  .mini-bracket-inner { --bracket-scale: 1.6; }
}
@container bracket-card (min-width: 600px) {
  .mini-bracket-inner { --bracket-scale: 1.75; }
}

.mini-bracket-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

/* Pyramid gaps: more space toward center so columns align in bracket shape (scaled by container) */
.mini-r16-col {
  gap: calc(6px * var(--bracket-scale, 1));
}

.mini-qf-col {
  gap: calc(34px * var(--bracket-scale, 1));
}

.mini-sf-col {
  gap: calc(82px * var(--bracket-scale, 1));
}

.mini-final-col {
  gap: calc(8px * var(--bracket-scale, 1));
}

.mini-final-label {
  font-size: calc(9px * var(--bracket-scale, 1));
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 215, 0, 0.9);
}

.mini-match {
  display: flex;
  flex-direction: column;
  gap: calc(2px * var(--bracket-scale, 1));
  min-width: calc(48px * var(--bracket-scale, 1));
  padding: calc(4px * var(--bracket-scale, 1)) calc(6px * var(--bracket-scale, 1));
  background: rgba(255, 255, 255, 0.06);
  border-radius: calc(6px * var(--bracket-scale, 1));
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.mini-slot {
  display: flex;
  align-items: center;
  gap: calc(4px * var(--bracket-scale, 1));
  font-size: calc(11px * var(--bracket-scale, 1));
}

.mini-flag {
  width: calc(18px * var(--bracket-scale, 1));
  height: calc(14px * var(--bracket-scale, 1));
  flex-shrink: 0;
  display: inline-block;
  border-radius: 2px;
}

.mini-flag-empty {
  background: rgba(255, 255, 255, 0.1);
}

.mini-pct {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  min-width: calc(28px * var(--bracket-scale, 1));
}

.btn-block {
  display: block;
  text-align: center;
  margin-top: 12px;
}

/* Sections (ack-section below landing) */
.favorites-section,
.ack-section {
  padding: 40px 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.section-title {
  font-size: 28px;
  font-weight: 900;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.section-subtitle {
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  opacity: 0.6;
  margin-bottom: 32px;
}

/* Favorites strip */
.favorites-strip {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.favorite-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: rgba(10, 25, 47, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
}

.favorite-flag {
  font-size: 20px;
  border-radius: 2px;
}

.favorite-name {
  font-weight: 700;
  font-size: 14px;
}

.favorite-pct {
  font-weight: 700;
  font-size: 16px;
  color: #d4af37;
}

.final-flag {
  font-size: 24px;
  border-radius: 2px;
}

.final-name {
  font-size: 16px;
  font-weight: 800;
}

.final-pct {
  font-size: 14px;
  font-weight: 700;
  color: #d4af37;
}

/* Analytics section */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.analytics-card {
  position: relative;
  padding: 20px;
}

.chart-container {
  position: relative;
  height: 320px;
  border-radius: 8px;
  overflow: hidden;
}

.chart-container luzmo-embed-viz-item {
  width: 100%;
  height: 100%;
}

.chart-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 25, 47, 0.85);
  border-radius: 8px;
}

.chart-placeholder p {
  margin: 0 0 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  max-width: 280px;
}

.btn-small {
  display: inline-block;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #0a192f;
  background: var(--gold);
  border-radius: 6px;
  text-decoration: none;
  transition: background 0.2s ease;
}

.btn-small:hover {
  background: #e8c84a;
}

/* CTA card in analytics grid */
.analytics-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  gap: 16px;
}

.analytics-cta p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.btn-secondary {
  display: inline-block;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  color: #e6f1ff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Section header with settings button */
.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
}

.section-header .section-title,
.section-header .section-subtitle {
  text-align: left;
  margin-bottom: 0;
}

.section-header .section-subtitle {
  margin-top: 8px;
}

.settings-btn {
  padding: 8px 16px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

.pin-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
  border-radius: 6px;
  z-index: 10;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.6);
  background: none;
  border: none;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.modal-body {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
}

.modal-hint {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 16px;
}

.chart-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chart-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.chart-list-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
}

.chart-list-item.pinned {
  background: rgba(100, 200, 100, 0.1);
  border-color: rgba(100, 200, 100, 0.3);
}

.chart-list-pin {
  font-size: 16px;
  width: 24px;
  text-align: center;
}

.chart-list-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
}

.chart-list-type {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: capitalize;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .landing-layout {
    grid-template-columns: 1fr;
  }

  .groups-sidebar {
    position: static;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding: 24px;
  }

  .groups-grid-two {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .bracket-favorites-row {
    grid-template-columns: 1fr;
    padding-left: 16px;
    padding-right: 16px;
  }
  .hero-title {
    font-size: 36px;
  }
  .hero-year-img {
    height: 64px;
  }
  .groups-grid-two {
    grid-template-columns: 1fr;
  }
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .landing-left {
    padding-left: 16px;
    padding-right: 16px;
  }
  .groups-sidebar {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
