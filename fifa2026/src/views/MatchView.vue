<template>
  <div class="match-page">
    <div class="match-content">
      <router-link to="/bracket" class="back-link">&larr; Back to Bracket</router-link>

      <div v-if="!match" class="match-not-found glass-panel">
        <h2>Match not found</h2>
        <p>The match ID "{{ matchIdNum }}" does not exist in the bracket.</p>
        <router-link to="/bracket" class="btn-secondary">Go to Bracket</router-link>
      </div>

      <template v-else>
        <div class="match-header-card glass-panel">
          <div class="round-badge">{{ roundLabel }}</div>

          <div class="matchup">
            <div class="team-side" :class="{ favorite: match.winProb1 > match.winProb2 }">
              <span v-if="match.team1" class="fi team-flag" :class="`fi-${match.team1.flagCode}`"></span>
              <span v-else class="team-tbd-flag">?</span>
              <span class="team-name">{{ match.team1?.name ?? 'TBD' }}</span>
              <span class="team-prob" v-if="match.team1 && match.team2">{{ pct(match.winProb1) }}</span>
            </div>

            <div class="vs-divider">
              <span class="vs-text">VS</span>
            </div>

            <div class="team-side right" :class="{ favorite: match.winProb2 > match.winProb1 }">
              <span v-if="match.team2" class="fi team-flag" :class="`fi-${match.team2.flagCode}`"></span>
              <span v-else class="team-tbd-flag">?</span>
              <span class="team-name">{{ match.team2?.name ?? 'TBD' }}</span>
              <span class="team-prob" v-if="match.team1 && match.team2">{{ pct(match.winProb2) }}</span>
            </div>
          </div>

          <div class="match-schedule-info" v-if="scheduleInfo">
            <div class="schedule-row">
              <svg class="schedule-icon" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2"/>
                <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
              <span class="schedule-label">Local time ({{ scheduleInfo.majorCity }}):</span>
              <span>{{ localTimeLabel }}</span>
            </div>
            <div class="schedule-row" v-if="userTimeLabel">
              <svg class="schedule-icon" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2"/>
                <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
              <span class="schedule-label">Your time:</span>
              <span>{{ userTimeLabel }}</span>
            </div>
            <div class="schedule-row schedule-row-venue">
              <svg class="schedule-icon" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5c-3 0-6 2.5-6 5.5 0 4 6 7.5 6 7.5s6-3.5 6-7.5c0-3-3-5.5-6-5.5z" stroke="currentColor" stroke-width="1.2"/>
                <circle cx="8" cy="7" r="2" stroke="currentColor" stroke-width="1.2"/>
              </svg>
              <span>{{ scheduleInfo.stadium }}, {{ scheduleInfo.majorCity }}</span>
            </div>
          </div>
        </div>

        <div class="odds-bar-section glass-panel" v-if="match.team1 && match.team2">
          <h3 class="section-label">Win Probability</h3>
          <div class="odds-bar">
            <div class="odds-bar-fill team1" :style="{ width: (match.winProb1 * 100) + '%' }">
              <span class="odds-label" v-if="match.winProb1 > 0.15">{{ match.team1.name }}</span>
            </div>
            <div class="odds-bar-fill team2" :style="{ width: (match.winProb2 * 100) + '%' }">
              <span class="odds-label" v-if="match.winProb2 > 0.15">{{ match.team2.name }}</span>
            </div>
          </div>
          <div class="odds-numbers">
            <span>{{ pct(match.winProb1) }}</span>
            <span>{{ pct(match.winProb2) }}</span>
          </div>
        </div>

        <!-- Template analytics -->
        <div class="match-analytics" v-if="isLuzmoConfigured && matchFilteredTemplates.length > 0">
          <h2 class="section-title">Match Analytics</h2>
          <p class="section-subtitle">Charts filtered for {{ match.team1?.name ?? 'TBD' }} &amp; {{ match.team2?.name ?? 'TBD' }}</p>
          <div class="template-charts-grid">
            <div
              v-for="item in matchFilteredTemplates"
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

        <div class="no-analytics glass-panel" v-else-if="isLuzmoConfigured">
          <p>No match analytics configured yet.</p>
          <p class="hint">
            <router-link to="/builder" class="template-link">Tag charts as match templates in the Report Builder</router-link>
            to see them here, filtered for each matchup.
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useBracketSimulation } from '../composables/useBracketSimulation'
import { useReportTemplates } from '../composables/useReportTemplates'
import { useLuzmo } from '../composables/useLuzmo'
import { MATCH_SCHEDULE, formatDateInTz, formatTimeInTz, tzAbbr, formatUserDateTime, userTzAbbr } from '../data/matchSchedule'

const props = defineProps<{ matchId: string }>()

const { apiKey, apiToken, appServer, apiHost, isConfigured: isLuzmoConfigured } = useLuzmo()
const { getMatch } = useBracketSimulation()
const { matchTemplates, refresh: refreshTemplates, buildFilteredChartProps, getOptionsWithTitle } = useReportTemplates()

onMounted(() => refreshTemplates())

const matchIdNum = computed(() => Number(props.matchId))
const match = computed(() => getMatch(matchIdNum.value))

const scheduleInfo = computed(() => MATCH_SCHEDULE[matchIdNum.value] ?? null)
const localTimeLabel = computed(() => {
  const info = scheduleInfo.value
  if (!info) return ''
  const date = formatDateInTz(info.utc, info.tz)
  const time = formatTimeInTz(info.utc, info.tz)
  const abbr = tzAbbr(info.utc, info.tz)
  return `${date} at ${time} ${abbr}`
})
const userTimeLabel = computed(() => {
  const info = scheduleInfo.value
  if (!info) return ''
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (userTz === info.tz) return null
  return `${formatUserDateTime(info.utc)} ${userTzAbbr(info.utc)}`
})

const roundLabel = computed(() => {
  const m = match.value
  if (!m) return ''
  const labels: Record<string, string> = {
    R32: 'Round of 32',
    R16: 'Round of 16',
    QF: 'Quarterfinal',
    SF: 'Semifinal',
    F: 'Final',
    '3P': 'Third Place',
  }
  return labels[m.round] ?? m.round
})

function pct(val: number): string {
  return `${Math.round(val * 100)}%`
}

const matchFilteredTemplates = computed(() => {
  const m = match.value
  if (!m || !m.team1 || !m.team2) return []
  const teamNames = [m.team1.name, m.team2.name]
  return matchTemplates.value.map(chart => ({
    chart,
    ...buildFilteredChartProps(chart, teamNames),
    options: getOptionsWithTitle(chart),
  }))
})
</script>

<style scoped>
.match-page {
  min-height: 100vh;
  padding: 32px 24px 64px;
  background: linear-gradient(180deg, #0b3d0b 0%, #0a3510 30%, #072e0c 60%, #052208 100%);
  position: relative;
}

.match-page::before {
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

.match-page::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(0,0,0,0.35) 100%);
}

.match-page .match-content {
  position: relative;
  z-index: 1;
}

.match-content {
  max-width: 960px;
  margin: 0 auto;
}

.back-link {
  display: inline-block;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 20px;
  transition: color 0.2s;
}
.back-link:hover {
  color: #e6f1ff;
}

.match-not-found {
  text-align: center;
  padding: 48px;
}
.match-not-found h2 { margin-bottom: 8px; }

.glass-panel {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(12px);
}

/* Header card */
.match-header-card {
  text-align: center;
  margin-bottom: 24px;
}

.round-badge {
  display: inline-block;
  background: rgba(245, 200, 66, 0.15);
  color: #f5c842;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 4px 16px;
  border-radius: 20px;
  margin-bottom: 20px;
}

.matchup {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.team-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 140px;
}

.team-side.favorite .team-name {
  color: #f5c842;
}

.team-flag {
  font-size: 48px;
  border-radius: 4px;
}

.team-tbd-flag {
  width: 64px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.team-name {
  font-size: 20px;
  font-weight: 700;
  color: #e6f1ff;
}

.team-prob {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
}

.vs-divider {
  display: flex;
  align-items: center;
  justify-content: center;
}

.vs-text {
  font-size: 14px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.25);
  letter-spacing: 2px;
}

.match-schedule-info {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.schedule-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
}

.schedule-row-venue {
  margin-top: 4px;
}

.schedule-label {
  color: rgba(255, 255, 255, 0.45);
  min-width: 0;
}

.schedule-icon {
  width: 14px;
  height: 14px;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

/* Odds bar */
.odds-bar-section {
  margin-bottom: 24px;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.odds-bar {
  display: flex;
  height: 36px;
  border-radius: 8px;
  overflow: hidden;
}

.odds-bar-fill {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.4s ease;
}

.odds-bar-fill.team1 {
  background: linear-gradient(90deg, rgba(100, 181, 246, 0.4), rgba(100, 181, 246, 0.25));
}

.odds-bar-fill.team2 {
  background: linear-gradient(90deg, rgba(245, 200, 66, 0.25), rgba(245, 200, 66, 0.4));
}

.odds-label {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
}

.odds-numbers {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}

/* Analytics section */
.match-analytics {
  margin-top: 32px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #e6f1ff;
  margin-bottom: 4px;
}

.section-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 16px;
}

.template-charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 768px) {
  .template-charts-grid {
    grid-template-columns: 1fr;
  }
  .matchup {
    flex-direction: column;
    gap: 12px;
  }
  .team-side {
    min-width: auto;
  }
}

.template-chart-card {
  min-height: 300px;
  padding: 12px;
}

.template-chart-card luzmo-embed-viz-item {
  width: 100%;
  height: 280px;
}

.no-analytics {
  margin-top: 32px;
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);
}

.no-analytics .hint {
  margin-top: 8px;
  font-size: 13px;
}

.template-link {
  color: #f5c842;
  text-decoration: underline;
}

.btn-secondary {
  display: inline-block;
  margin-top: 12px;
  padding: 8px 20px;
  background: rgba(100, 181, 246, 0.15);
  color: #64b5f6;
  border: 1px solid rgba(100, 181, 246, 0.3);
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}
</style>
