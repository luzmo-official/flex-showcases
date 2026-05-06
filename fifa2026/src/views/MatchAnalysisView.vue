<template>
  <div class="match-analysis-page">
    <div class="match-content">
      <div class="page-header">
        <h1 class="page-title">Match Analysis</h1>
        <p class="page-subtitle">Compare any two teams using match analytics</p>
      </div>

      <div class="team-selectors glass-panel" :class="{ 'dropdown-open': dropdownOpenCount > 0 }">
        <div class="selector-group">
          <TeamSelect
            v-model="selectedTeam1Name"
            :teams="allTeamsSorted"
            label="Team 1"
            @open="dropdownOpenCount++"
            @close="onDropdownClose"
          />
        </div>
        <div class="vs-badge">VS</div>
        <div class="selector-group">
          <TeamSelect
            v-model="selectedTeam2Name"
            :teams="allTeamsSorted"
            label="Team 2"
            @open="dropdownOpenCount++"
            @close="onDropdownClose"
          />
        </div>
      </div>

      <template v-if="team1 && team2 && team1.name !== team2.name">
        <div class="match-header-card glass-panel">
          <div class="matchup">
            <div class="team-side" :class="{ favorite: winProb1 >= winProb2 }">
              <span class="fi team-flag" :class="`fi-${team1.flagCode}`"></span>
              <span class="team-name">{{ team1.name }}</span>
              <span class="team-prob">{{ pct(winProb1) }}</span>
            </div>
            <div class="vs-divider">
              <span class="vs-text">VS</span>
            </div>
            <div class="team-side right" :class="{ favorite: winProb2 > winProb1 }">
              <span class="fi team-flag" :class="`fi-${team2.flagCode}`"></span>
              <span class="team-name">{{ team2.name }}</span>
              <span class="team-prob">{{ pct(winProb2) }}</span>
            </div>
          </div>
        </div>

        <div class="odds-bar-section glass-panel">
          <h3 class="section-label">Win Probability</h3>
          <div class="odds-bar">
            <div class="odds-bar-fill team1" :style="{ width: (winProb1 * 100) + '%' }">
              <span class="odds-label" v-if="winProb1 > 0.15">{{ team1.name }}</span>
            </div>
            <div class="odds-bar-fill team2" :style="{ width: (winProb2 * 100) + '%' }">
              <span class="odds-label" v-if="winProb2 > 0.15">{{ team2.name }}</span>
            </div>
          </div>
          <div class="odds-numbers">
            <span>{{ pct(winProb1) }}</span>
            <span>{{ pct(winProb2) }}</span>
          </div>
        </div>

        <div class="match-analytics" v-if="isLuzmoConfigured && matchFilteredTemplates.length > 0">
          <h2 class="section-title">Match Analytics</h2>
          <p class="section-subtitle">Charts filtered for {{ team1.name }} &amp; {{ team2.name }}</p>
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

        <div class="meet-path-section glass-panel" v-if="meetPath">
          <h3 class="section-label">How they could meet</h3>
          <p v-if="meetPath.sameGroupExplanation" class="meet-path-same-group">
            {{ meetPath.sameGroupExplanation }}
          </p>
          <p v-if="meetPath.sameGroupKnockoutNote" class="meet-path-same-group-note">
            {{ meetPath.sameGroupKnockoutNote }}
          </p>
          <ul v-if="meetPath.knockoutScenarios.length > 0" class="meet-path-list">
            <li
              v-for="s in meetPath.knockoutScenarios"
              :key="s.matchId"
              class="meet-path-item"
            >
              <div class="meet-path-item-header">
                <router-link :to="`/match/${s.matchId}`" class="meet-path-match-link">Match {{ s.matchId }}</router-link>
                <span class="meet-path-round">({{ s.roundLabel }})</span>
              </div>
              <p class="meet-path-full team1-path">
                <template v-if="s.team1PathStructured.impossible">{{ s.team1FullPath }}</template>
                <template v-else>
                  <span class="highlight-country">{{ s.team1PathStructured.teamName }}</span>
                  would need to
                  <span class="highlight-position">{{ positionLabel(s.team1PathStructured.role) }}</span>
                  <span class="highlight-group"> Group {{ s.team1PathStructured.groupId }}</span>
                  <template v-if="s.team1PathStructured.role === 'third'"> and qualify as one of the best third-place teams</template>
                  <template v-if="s.team1PathStructured.matchIdsAfterR32.length">
                    , then win {{ s.team1PathStructured.matchIdsAfterR32.length === 1 ? 'Match' : 'Matches' }}
                    <span class="highlight-match">{{ s.team1PathStructured.matchIdsAfterR32.map(id => 'M' + id).join(', then ') }}</span>
                    to reach the {{ s.team1PathStructured.roundLabel }}.
                  </template>
                  <template v-else> to reach this match.</template>
                </template>
              </p>
              <p class="meet-path-full team2-path">
                <template v-if="s.team2PathStructured.impossible">{{ s.team2FullPath }}</template>
                <template v-else>
                  <span class="highlight-country">{{ s.team2PathStructured.teamName }}</span>
                  would need to
                  <span class="highlight-position">{{ positionLabel(s.team2PathStructured.role) }}</span>
                  <span class="highlight-group"> Group {{ s.team2PathStructured.groupId }}</span>
                  <template v-if="s.team2PathStructured.role === 'third'"> and qualify as one of the best third-place teams</template>
                  <template v-if="s.team2PathStructured.matchIdsAfterR32.length">
                    , then win {{ s.team2PathStructured.matchIdsAfterR32.length === 1 ? 'Match' : 'Matches' }}
                    <span class="highlight-match">{{ s.team2PathStructured.matchIdsAfterR32.map(id => 'M' + id).join(', then ') }}</span>
                    to reach the {{ s.team2PathStructured.roundLabel }}.
                  </template>
                  <template v-else> to reach this match.</template>
                </template>
              </p>
            </li>
          </ul>
          <p v-if="meetPath && !meetPath.sameGroup && meetPath.knockoutScenarios.length === 0" class="meet-path-none">
            These teams are in different groups and their bracket paths do not cross in the knockout stage, so they can only meet if one or both qualify as best third-place teams in a way that redirects their path (check third-place combination rules).
          </p>
        </div>
      </template>

      <div v-else-if="selectedTeam1Name && selectedTeam2Name && selectedTeam1Name === selectedTeam2Name" class="hint-panel glass-panel">
        <p>Select two different teams to compare.</p>
      </div>

      <div v-else class="hint-panel glass-panel">
        <p>Select two teams above to compare their analytics and win probability.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TeamSelect from '../components/TeamSelect.vue'
import { useReportTemplates } from '../composables/useReportTemplates'
import { useLuzmo } from '../composables/useLuzmo'
import { getHeadToHeadOdds } from '../composables/useOddsModel'
import { getMeetPath } from '../composables/useMeetPath'
import { groups } from '../data/groups'
import type { Team } from '../data/groups'

const { apiKey, apiToken, appServer, apiHost, isConfigured: isLuzmoConfigured } = useLuzmo()
const { matchTemplates, refresh: refreshTemplates, buildFilteredChartProps, getOptionsWithTitle } = useReportTemplates()

onMounted(() => refreshTemplates())

const allTeams = computed(() => groups.flatMap(g => g.teams))
const allTeamsSorted = computed(() => [...allTeams.value].sort((a, b) => a.name.localeCompare(b.name)))

const teamByName = computed(() => {
  const map = new Map<string, Team>()
  for (const t of allTeams.value) map.set(t.name, t)
  return map
})

const selectedTeam1Name = ref('')
const selectedTeam2Name = ref('')
const dropdownOpenCount = ref(0)
function onDropdownClose() {
  dropdownOpenCount.value = Math.max(0, dropdownOpenCount.value - 1)
}

const team1 = computed(() => selectedTeam1Name.value ? teamByName.value.get(selectedTeam1Name.value) ?? null : null)
const team2 = computed(() => selectedTeam2Name.value ? teamByName.value.get(selectedTeam2Name.value) ?? null : null)

const odds = computed(() => {
  if (!team1.value || !team2.value) return { winProb1: 0.5, winProb2: 0.5 }
  const o = getHeadToHeadOdds(team1.value, team2.value)
  return { winProb1: o.winA, winProb2: o.winB }
})
const winProb1 = computed(() => odds.value.winProb1)
const winProb2 = computed(() => odds.value.winProb2)

const meetPath = computed(() => {
  const t1 = team1.value
  const t2 = team2.value
  if (!t1 || !t2 || t1.name === t2.name) return null
  return getMeetPath(t1.name, t2.name)
})

const matchFilteredTemplates = computed(() => {
  const t1 = team1.value
  const t2 = team2.value
  if (!t1 || !t2 || t1.name === t2.name) return []
  const teamNames = [t1.name, t2.name]
  return matchTemplates.value.map(chart => ({
    chart,
    ...buildFilteredChartProps(chart, teamNames),
    options: getOptionsWithTitle(chart),
  }))
})

function pct(val: number): string {
  return `${Math.round(val * 100)}%`
}

function positionLabel(role: 'winner' | 'runner' | 'third' | null): string {
  if (!role) return ''
  switch (role) {
    case 'winner': return 'win'
    case 'runner': return 'finish second in'
    case 'third': return 'finish third in'
    default: return ''
  }
}
</script>

<style scoped>
.match-analysis-page {
  min-height: 100vh;
  padding: 32px 24px 64px;
  background: linear-gradient(180deg, #0b3d0b 0%, #0a3510 30%, #072e0c 60%, #052208 100%);
  position: relative;
}

.match-analysis-page::before {
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

.match-analysis-page::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(0,0,0,0.35) 100%);
}

.match-content {
  position: relative;
  z-index: 1;
  max-width: 960px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #e6f1ff;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(12px);
}

.team-selectors {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  overflow: visible;
  position: relative;
  z-index: 1;
}

.team-selectors.dropdown-open {
  z-index: 300;
}

.selector-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 180px;
}

.selector-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.vs-badge {
  font-size: 14px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.25);
  letter-spacing: 2px;
  align-self: center;
  padding-bottom: 10px;
}

/* Matchup card (same as MatchView) */
.match-header-card {
  text-align: center;
  margin-bottom: 24px;
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

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.odds-bar-section {
  margin-bottom: 24px;
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

.meet-path-section {
  margin-bottom: 24px;
}

.meet-path-section .section-label {
  margin-bottom: 12px;
}

.meet-path-same-group {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  margin: 0;
}

.meet-path-same-group-note {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.5;
  margin: 8px 0 0 0;
  padding-left: 12px;
  border-left: 2px solid rgba(245, 200, 66, 0.4);
}

.meet-path-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.meet-path-item {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.meet-path-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.meet-path-item-header {
  margin-bottom: 8px;
}

.meet-path-match-link {
  color: #f5c842;
  font-weight: 600;
  text-decoration: none;
}

.meet-path-match-link:hover {
  text-decoration: underline;
}

.meet-path-round {
  color: rgba(255, 255, 255, 0.6);
}

.meet-path-full {
  margin: 4px 0 0 0;
  padding-left: 12px;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.highlight-country {
  font-weight: 700;
  color: #e6f1ff;
}

.highlight-position {
  font-weight: 600;
  color: #f5c842;
}

.highlight-group {
  font-weight: 600;
  color: #7dd3fc;
}

.highlight-match {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.meet-path-none {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  margin: 0;
}

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
  .team-selectors {
    flex-direction: column;
    align-items: stretch;
  }
  .selector-group {
    min-width: auto;
  }
  .vs-badge {
    padding-bottom: 0;
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

.no-analytics,
.hint-panel {
  margin-top: 24px;
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);
}

.no-analytics .hint,
.hint-panel p {
  margin-top: 8px;
  font-size: 13px;
}

.template-link {
  color: #f5c842;
  text-decoration: underline;
}
</style>
