<template>
  <div class="group-explorer" v-if="group">
    <!-- Group header -->
    <div class="explorer-header">
      <router-link to="/" class="back-link">&larr; All Groups</router-link>
      <div class="header-content">
        <span class="group-badge">{{ group.id }}</span>
        <h1 class="group-title">{{ group.name }}</h1>
      </div>
    </div>

    <!-- Team badges -->
    <div class="teams-section">
      <TeamBadge
        v-for="team in group.teams"
        :key="team.name"
        :team="team"
        :isSelected="selectedTeam?.name === team.name"
        @click="selectTeam(team)"
      />
    </div>

    <!-- Probability chart (built-in, no Luzmo needed) -->
    <div class="charts-section">
      <div class="chart-panel glass-panel">
        <h3 class="panel-title">Group Advancement Probability</h3>
        <div class="bar-chart">
          <div
            v-for="team in sortedByAdvance"
            :key="team.name"
            class="bar-row"
          >
            <span class="fi bar-flag" :class="`fi-${team.flagCode}`"></span>
            <span class="bar-team">{{ team.name }}</span>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ width: (team.groupAdvanceProb * 100) + '%' }"
              >
                <span class="bar-value">{{ formatPct(team.groupAdvanceProb) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-panel glass-panel">
        <h3 class="panel-title">Tournament Win Probability</h3>
        <div class="bar-chart">
          <div
            v-for="team in sortedByTournament"
            :key="team.name"
            class="bar-row"
          >
            <span class="fi bar-flag" :class="`fi-${team.flagCode}`"></span>
            <span class="bar-team">{{ team.name }}</span>
            <div class="bar-track">
              <div
                class="bar-fill tournament"
                :style="{ width: Math.max(team.tournamentWinProb * 100 * 5, 2) + '%' }"
              >
                <span class="bar-value">{{ formatPct(team.tournamentWinProb) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Group Analytics: rendered from tagged templates -->
    <div class="group-analytics-section" v-if="isLuzmoConfigured && groupFilteredTemplates.length > 0">
      <h2 class="section-title">Group Analytics</h2>
      <p class="section-subtitle">Pre-built analytics filtered for Group {{ group?.id }}</p>
      <div class="template-charts-grid">
        <div
          v-for="item in groupFilteredTemplates"
          :key="item.chart.id"
          class="template-chart-card glass-panel"
        >
          <luzmo-embed-viz-item
            :appServer="appServer"
            :apiHost="apiHost"
            :authKey="apiKey"
            :authToken="apiToken"
            :type="item.chart.chartType"
            :slots="item.chart.slotsContents"
            :options="item.options"
            :filters="item.chartFilters"
            language="en"
          ></luzmo-embed-viz-item>
        </div>
      </div>
    </div>

    <div class="group-analytics-section" v-else-if="isLuzmoConfigured && groupFilteredTemplates.length === 0">
      <h2 class="section-title">Group Analytics</h2>
      <p class="section-subtitle no-templates-hint">
        No group analytics configured yet.
        <router-link to="/builder" class="template-link">Tag charts as group templates in the Report Builder</router-link>
        to see them here automatically filtered for each group.
      </p>
    </div>

    <!-- ACK-powered chart creator (shared component) -->
    <div class="ack-explorer-section" v-if="isLuzmoConfigured">
      <ChartBuilder
        :initiallyOpen="false"
        toggleTitle="Build Your Own Chart"
        toggleHint="Drag data fields into chart slots to create custom visualizations"
        :filterHint="group ? `Tip: Add a filter on &quot;group&quot; = &quot;${group.id}&quot; to show only ${group.name} data` : undefined"
      />
    </div>

    <!-- No Luzmo config notice -->
    <div class="ack-notice glass-panel" v-else>
      <h3>Luzmo ACK Integration</h3>
      <p>
        Configure your Luzmo API credentials in a <code>.env</code> file to enable
        the interactive drag-and-drop chart builder powered by the Analytics Components Kit.
      </p>
      <p class="env-hint">
        Copy <code>.env.example</code> to <code>.env</code> and fill in your credentials.
      </p>
    </div>
  </div>

  <!-- Group not found -->
  <div class="not-found" v-else>
    <h1>Group not found</h1>
    <router-link to="/" class="btn-primary">Back to Pitch</router-link>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import TeamBadge from '../components/TeamBadge.vue'
import ChartBuilder from '../components/ChartBuilder.vue'
import { getGroup, type Team } from '../data/groups'
import { useLuzmo } from '../composables/useLuzmo'
import { useReportTemplates } from '../composables/useReportTemplates'
import { seedBuiltInReports } from '../composables/useSeedBuiltInReports'

const props = defineProps<{
  groupId: string
}>()

const {
  apiKey,
  apiToken,
  appServer,
  apiHost,
  isConfigured: isLuzmoConfigured,
} = useLuzmo()

// Group data
const group = computed(() => getGroup(props.groupId))
const selectedTeam = ref<Team | null>(null)

const sortedByAdvance = computed(() =>
  group.value
    ? [...group.value.teams].sort((a, b) => b.groupAdvanceProb - a.groupAdvanceProb)
    : []
)

const sortedByTournament = computed(() =>
  group.value
    ? [...group.value.teams].sort((a, b) => b.tournamentWinProb - a.tournamentWinProb)
    : []
)

function selectTeam(team: Team) {
  selectedTeam.value = selectedTeam.value?.name === team.name ? null : team
}

// Report templates for this group
const { groupTemplates, refresh: refreshTemplates, buildFilteredChartProps, getOptionsWithTitle: getTemplateOptions } = useReportTemplates()

const groupFilteredTemplates = computed(() => {
  if (!group.value) return []
  const groupId = group.value.id
  return groupTemplates.value.map(chart => ({
    chart,
    ...buildFilteredChartProps(chart, [groupId]),
    options: getTemplateOptions(chart),
  }))
})

function formatPct(val: number): string {
  if (val < 0.01) return '<1%'
  return `${Math.round(val * 100)}%`
}

onMounted(async () => {
  await seedBuiltInReports()
  refreshTemplates()
})
</script>

<style scoped>
.group-explorer {
  min-height: 100vh;
  background: linear-gradient(180deg, #0b3d0b 0%, #0a3510 30%, #072e0c 60%, #052208 100%);
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

/* Pitch-style overlay (match BracketView / rest of site) */
.group-explorer::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(circle 120px at 50% 50%, transparent 118px, rgba(255,255,255,0.08) 118px, rgba(255,255,255,0.08) 120px, transparent 120px),
    linear-gradient(0deg, transparent calc(50% - 1px), rgba(255,255,255,0.06) calc(50% - 1px), rgba(255,255,255,0.06) calc(50% + 1px), transparent calc(50% + 1px)),
    linear-gradient(90deg, rgba(255,255,255,0.04) 2px, transparent 2px, transparent calc(100% - 2px), rgba(255,255,255,0.04) calc(100% - 2px)),
    linear-gradient(0deg, rgba(255,255,255,0.04) 2px, transparent 2px, transparent calc(100% - 2px), rgba(255,255,255,0.04) calc(100% - 2px)),
    repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 60px, transparent 60px, transparent 120px);
}

.group-explorer::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(0,0,0,0.35) 100%);
}

.group-explorer > * {
  position: relative;
  z-index: 1;
}

/* Header */
.explorer-header {
  margin-bottom: 32px;
}

.back-link {
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
  transition: color 0.15s ease;
}

.back-link:hover {
  color: #ffd700;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.group-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #d4af37, #b8962e);
  border-radius: 14px;
  font-weight: 900;
  font-size: 28px;
  color: #052208;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.group-title {
  font-size: 36px;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

/* Teams */
.teams-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 40px;
}

@media (min-width: 680px) {
  .teams-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Charts */
.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 40px;
}

.chart-panel {
  padding: 24px;
}

.panel-title {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
}

/* Bar chart */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-flag {
  font-size: 20px;
  flex-shrink: 0;
  border-radius: 2px;
}

.bar-team {
  width: 100px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 28px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4af37, #e8c84a);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  min-width: 40px;
  transition: width 0.6s ease;
}

.bar-fill.tournament {
  background: linear-gradient(90deg, #2d8a4e, #34a058);
}

.bar-value {
  font-size: 12px;
  font-weight: 700;
  color: #052208;
  text-shadow: none;
}

/* Group analytics from templates */
.group-analytics-section {
  margin-top: 40px;
}

.template-charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .template-charts-grid {
    grid-template-columns: 1fr;
  }
}

.template-chart-card {
  min-height: 300px;
  padding: 12px;
  border-radius: 12px;
}

.template-chart-card luzmo-embed-viz-item {
  width: 100%;
  height: 280px;
}

.no-templates-hint {
  color: rgba(255, 255, 255, 0.6);
}

.template-link {
  color: #ffd700;
  text-decoration: underline;
}

.template-link:hover {
  color: #e8c84a;
}

/* ACK workspace */
.ack-explorer-section {
  margin-top: 40px;
}

.section-title {
  font-size: 24px;
  font-weight: 900;
  text-align: center;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.section-subtitle {
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 24px;
}

/* Notice */
.ack-notice {
  margin-top: 40px;
  padding: 32px;
  text-align: center;
}

.ack-notice h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #fff;
}

.ack-notice p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto 12px;
}

.ack-notice code {
  background: rgba(255, 255, 255, 0.12);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.env-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px !important;
}

/* Not found (full page when group missing) */
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 56px);
  gap: 24px;
  padding: 24px;
  background: linear-gradient(180deg, #0b3d0b 0%, #0a3510 30%, #072e0c 60%, #052208 100%);
  color: #fff;
}

.not-found h1 {
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

/* Responsive */
@media (max-width: 1024px) {
  .builder-main {
    grid-template-columns: 1fr;
  }
  .charts-section {
    grid-template-columns: 1fr;
  }
  .group-title {
    font-size: 24px;
  }
}
</style>
