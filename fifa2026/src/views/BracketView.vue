<template>
  <div class="bracket-page">
    <div class="bracket-header">
      <div>
        <h1 class="bracket-title">Tournament Bracket</h1>
        <p class="bracket-subtitle">
          {{ mode === 'prediction' ? 'Projected outcomes based on team strength ratings' : 'Click on teams to build your fantasy bracket' }}
        </p>
      </div>
      <div class="mode-toggle">
        <button
          class="mode-btn"
          :class="{ active: mode === 'prediction' }"
          @click="mode = 'prediction'"
        >
          Predictions
        </button>
        <button
          class="mode-btn"
          :class="{ active: mode === 'fantasy' }"
          @click="mode = 'fantasy'"
        >
          My Bracket
        </button>
        <button
          v-if="mode === 'prediction'"
          class="action-btn customize-btn"
          @click="copyPredictionsToFantasy"
          title="Copy predicted bracket into My Bracket for editing"
        >
          <svg class="btn-icon" viewBox="0 0 16 16" fill="none">
            <path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9.5 3.5l3 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          Customize
        </button>
        <div v-if="mode === 'fantasy'" class="bracket-actions">
          <button class="action-btn save-cookie-btn" @click="saveToCookie" title="Save bracket to browser cookie">
            <svg class="btn-icon" viewBox="0 0 16 16" fill="none"><path d="M13 5.5V14H3V2h5.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 9l6-6M10 3h3v3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            {{ cookieJustSaved ? 'Saved!' : 'Save' }}
          </button>
          <button class="action-btn" @click="loadFromCookie" title="Load bracket from browser cookie">
            <svg class="btn-icon" viewBox="0 0 16 16" fill="none"><path d="M14 10v3H2v-3M8 2v8M5 7l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Load
          </button>
          <span class="action-sep"></span>
          <button class="action-btn" @click="exportJson" title="Download bracket as JSON file">
            <svg class="btn-icon" viewBox="0 0 16 16" fill="none"><path d="M2 10v3h12v-3M8 2v8M5 7l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Export
          </button>
          <label class="action-btn import-label" title="Import bracket from JSON file">
            <svg class="btn-icon" viewBox="0 0 16 16" fill="none"><path d="M2 10v3h12v-3M8 10V2M5 5l3-3 3 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Import
            <input type="file" accept=".json,application/json" class="hidden-input" @change="importJson" />
          </label>
          <span v-if="hasAnyCustomisation" class="action-sep"></span>
          <button
            v-if="hasAnyCustomisation"
            class="reset-btn"
            @click="resetAll"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>

    <!-- ─── Group Stage Editor ────────────────────────────────────────── -->
    <div class="group-stage-section" v-if="mode === 'fantasy'">
      <button class="section-toggle" @click="groupStageOpen = !groupStageOpen">
        <span class="toggle-icon">{{ groupStageOpen ? '&#9660;' : '&#9654;' }}</span>
        <span class="toggle-title">Group Stage Results</span>
        <span class="toggle-hint" v-if="!groupStageOpen">
          {{ (hasCustomGroupRankings || hasCustomThirdPlaceOrder) ? 'Custom rankings set' : 'Click to customize group results' }}
        </span>
      </button>

      <Transition name="slide">
        <div v-if="groupStageOpen" class="group-stage-grid">
          <div
            v-for="g in groupsData"
            :key="g.id"
            class="group-mini-card"
          >
            <div class="group-mini-header">
              <span class="group-mini-letter">{{ g.id }}</span>
              <span class="group-mini-name">{{ g.name }}</span>
            </div>
            <div class="group-mini-teams">
              <div
                v-for="(teamName, idx) in getGroupRanking(g.id)"
                :key="teamName"
                class="group-mini-team"
                :class="{
                  'qualifies-auto': idx < 2,
                  'qualifies-maybe': idx === 2,
                  'eliminated': idx === 3,
                }"
              >
                <span class="group-pos">{{ idx + 1 }}</span>
                <span
                  class="fi group-team-flag"
                  :class="`fi-${getTeamByName(teamName)?.flagCode ?? 'un'}`"
                ></span>
                <span class="group-team-name">{{ teamName }}</span>
                <div class="group-team-actions">
                  <button
                    v-if="idx > 0"
                    class="move-btn"
                    @click="moveTeamUp(g.id, idx)"
                    title="Move up"
                  >&#9650;</button>
                  <button
                    v-if="idx < 3"
                    class="move-btn"
                    @click="moveTeamDown(g.id, idx)"
                    title="Move down"
                  >&#9660;</button>
                </div>
              </div>
            </div>
          </div>
          <!-- Third-place ranking -->
          <div class="third-place-panel">
            <div class="third-place-header">
              <span class="third-place-title">Third-Place Ranking</span>
              <span class="third-place-hint">Top 8 advance to Round of 32</span>
            </div>
            <div class="third-place-list">
              <div
                v-for="(gId, idx) in effectiveThirdPlaceOrder"
                :key="gId"
                class="third-place-row"
                :class="{
                  'qualifies': idx < 8,
                  'eliminated': idx >= 8,
                }"
              >
                <span class="third-pos">{{ idx + 1 }}</span>
                <span
                  class="fi third-flag"
                  :class="`fi-${getTeamByName(getThirdPlaceTeamName(gId))?.flagCode ?? 'un'}`"
                ></span>
                <span class="third-team-name">{{ getThirdPlaceTeamName(gId) }}</span>
                <span class="third-group-label">3rd Grp {{ gId }}</span>
                <div class="third-actions">
                  <button
                    v-if="idx > 0"
                    class="move-btn"
                    @click="moveThirdPlaceUp(idx)"
                    title="Move up"
                  >&#9650;</button>
                  <button
                    v-if="idx < 11"
                    class="move-btn"
                    @click="moveThirdPlaceDown(idx)"
                    title="Move down"
                  >&#9660;</button>
                </div>
              </div>
            </div>
          </div>

          <div class="group-stage-actions">
            <button
              v-if="hasCustomGroupRankings || hasCustomThirdPlaceOrder"
              class="reset-groups-btn"
              @click="resetGroupRankings"
            >
              Reset to Predictions
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ─── Bracket ───────────────────────────────────────────────────── -->
    <div class="bracket-container">
      <div class="bracket-scroll">
        <!-- Left side: R32 → R16 → QF → SF -->
        <div class="bracket-column r32-col">
          <BracketMatchVue
            v-for="id in LEFT_R32_IDS"
            :key="id"
            :match="getDisplayMatch(id)"
            :mode="mode"
            :userPick="fantasyPicks[id] ?? null"
            @pick="onPick"
          />
        </div>

        <div class="bracket-column r16-col">
          <BracketMatchVue
            v-for="id in LEFT_R16_IDS"
            :key="id"
            :match="getDisplayMatch(id)"
            :mode="mode"
            :userPick="fantasyPicks[id] ?? null"
            @pick="onPick"
          />
        </div>

        <div class="bracket-column qf-col">
          <BracketMatchVue
            v-for="id in LEFT_QF_IDS"
            :key="id"
            :match="getDisplayMatch(id)"
            :mode="mode"
            :userPick="fantasyPicks[id] ?? null"
            @pick="onPick"
          />
        </div>

        <div class="bracket-column sf-col">
          <BracketMatchVue
            v-for="id in LEFT_SF_IDS"
            :key="id"
            :match="getDisplayMatch(id)"
            :mode="mode"
            :userPick="fantasyPicks[id] ?? null"
            @pick="onPick"
          />
        </div>

        <!-- Center: Final + 3rd place -->
        <div class="bracket-column final-col">
          <div class="final-label">Final</div>
          <BracketMatchVue
            :match="getDisplayMatch(103)"
            :mode="mode"
            :userPick="fantasyPicks[103] ?? null"
            @pick="onPick"
          />
          <div v-if="champion" class="champion-banner">
            <span class="fi champion-flag" :class="`fi-${champion.flagCode}`"></span>
            <span class="champion-name">{{ champion.name }}</span>
            <span class="champion-label">{{ mode === 'prediction' ? 'Projected Champion' : 'Your Champion' }}</span>
          </div>
          <div class="third-place-block">
            <div class="final-label third-place-label">3rd place</div>
            <BracketMatchVue
              :match="getDisplayMatch(104)"
              :mode="mode"
              :userPick="fantasyPicks[104] ?? null"
              @pick="onPick"
            />
          </div>
        </div>

        <!-- Right side: SF → QF → R16 → R32 -->
        <div class="bracket-column sf-col">
          <BracketMatchVue
            v-for="id in RIGHT_SF_IDS"
            :key="id"
            :match="getDisplayMatch(id)"
            :mode="mode"
            :userPick="fantasyPicks[id] ?? null"
            @pick="onPick"
          />
        </div>

        <div class="bracket-column qf-col">
          <BracketMatchVue
            v-for="id in RIGHT_QF_IDS"
            :key="id"
            :match="getDisplayMatch(id)"
            :mode="mode"
            :userPick="fantasyPicks[id] ?? null"
            @pick="onPick"
          />
        </div>

        <div class="bracket-column r16-col">
          <BracketMatchVue
            v-for="id in RIGHT_R16_IDS"
            :key="id"
            :match="getDisplayMatch(id)"
            :mode="mode"
            :userPick="fantasyPicks[id] ?? null"
            @pick="onPick"
          />
        </div>

        <div class="bracket-column r32-col">
          <BracketMatchVue
            v-for="id in RIGHT_R32_IDS"
            :key="id"
            :match="getDisplayMatch(id)"
            :mode="mode"
            :userPick="fantasyPicks[id] ?? null"
            @pick="onPick"
          />
        </div>
      </div>
    </div>

    <!-- Round labels -->
    <div class="round-labels">
      <span>Round of 32</span>
      <span>Round of 16</span>
      <span>Quarterfinals</span>
      <span>Semifinals</span>
      <span>Final</span>
      <span>Semifinals</span>
      <span>Quarterfinals</span>
      <span>Round of 16</span>
      <span>Round of 32</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BracketMatchVue from '../components/BracketMatch.vue'
import {
  useBracketSimulation,
  simulateBracket,
  getDefaultGroupRankings,
  getDefaultThirdPlaceOrder,
  type ResolvedMatch,
  type CustomGroupRankings,
  type CustomThirdPlaceOrder,
  type BracketCustomisation,
} from '../composables/useBracketSimulation'
import { getHeadToHeadOdds } from '../composables/useOddsModel'
import { groups, type Team } from '../data/groups'
import {
  ALL_MATCHES,
  LEFT_R32_IDS, RIGHT_R32_IDS,
  LEFT_R16_IDS, RIGHT_R16_IDS,
  LEFT_QF_IDS, RIGHT_QF_IDS,
  LEFT_SF_IDS, RIGHT_SF_IDS,
} from '../data/bracket'

const FANTASY_STORAGE_KEY = 'worldcup-fantasy-bracket'
const GROUP_RANKINGS_STORAGE_KEY = 'worldcup-fantasy-group-rankings'
const THIRD_PLACE_STORAGE_KEY = 'worldcup-fantasy-third-place-order'

const mode = ref<'prediction' | 'fantasy'>('prediction')
const groupStageOpen = ref(false)
const groupsData = groups

// ─── Custom group rankings ──────────────────────────────────────────────────

const customGroupRankings = ref<CustomGroupRankings | undefined>(loadGroupRankings())

function loadGroupRankings(): CustomGroupRankings | undefined {
  try {
    const raw = localStorage.getItem(GROUP_RANKINGS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

function persistGroupRankings() {
  if (customGroupRankings.value) {
    localStorage.setItem(GROUP_RANKINGS_STORAGE_KEY, JSON.stringify(customGroupRankings.value))
  } else {
    localStorage.removeItem(GROUP_RANKINGS_STORAGE_KEY)
  }
}

watch(customGroupRankings, persistGroupRankings, { deep: true })

const defaultRankings = getDefaultGroupRankings()

const hasCustomGroupRankings = computed(() => {
  if (!customGroupRankings.value) return false
  for (const gId of Object.keys(defaultRankings)) {
    const custom = customGroupRankings.value[gId]
    const def = defaultRankings[gId]
    if (custom && JSON.stringify(custom) !== JSON.stringify(def)) return true
  }
  return false
})

function getGroupRanking(groupId: string): string[] {
  return customGroupRankings.value?.[groupId] ?? defaultRankings[groupId] ?? []
}

function ensureCustomRankings() {
  if (!customGroupRankings.value) {
    customGroupRankings.value = JSON.parse(JSON.stringify(defaultRankings))
  }
}

function moveTeamUp(groupId: string, idx: number) {
  if (idx <= 0) return
  ensureCustomRankings()
  const arr = [...(customGroupRankings.value![groupId] ?? [])]
  const a = arr[idx - 1]!
  const b = arr[idx]!
  arr[idx - 1] = b
  arr[idx] = a
  customGroupRankings.value![groupId] = arr
  clearKnockoutPicksOnGroupChange()
}

function moveTeamDown(groupId: string, idx: number) {
  if (idx >= 3) return
  ensureCustomRankings()
  const arr = [...(customGroupRankings.value![groupId] ?? [])]
  const a = arr[idx]!
  const b = arr[idx + 1]!
  arr[idx] = b
  arr[idx + 1] = a
  customGroupRankings.value![groupId] = arr
  clearKnockoutPicksOnGroupChange()
}

function resetGroupRankings() {
  customGroupRankings.value = undefined
  customThirdPlaceOrder.value = undefined
  fantasyPicks.value = {}
}

function clearKnockoutPicksOnGroupChange() {
  fantasyPicks.value = {}
  // Re-derive third-place order when groups change since 3rd-place teams shift
  customThirdPlaceOrder.value = undefined
}

// ─── Custom third-place order ───────────────────────────────────────────────

const customThirdPlaceOrder = ref<CustomThirdPlaceOrder | undefined>(loadThirdPlaceOrder())

function loadThirdPlaceOrder(): CustomThirdPlaceOrder | undefined {
  try {
    const raw = localStorage.getItem(THIRD_PLACE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

function persistThirdPlaceOrder() {
  if (customThirdPlaceOrder.value) {
    localStorage.setItem(THIRD_PLACE_STORAGE_KEY, JSON.stringify(customThirdPlaceOrder.value))
  } else {
    localStorage.removeItem(THIRD_PLACE_STORAGE_KEY)
  }
}

watch(customThirdPlaceOrder, persistThirdPlaceOrder, { deep: true })

const defaultThirdPlaceOrder = computed(() => getDefaultThirdPlaceOrder())

/**
 * The effective third-place ordering: custom if set, else default.
 * All 12 groups are listed; first 8 qualify.
 */
const effectiveThirdPlaceOrder = computed<string[]>(() =>
  customThirdPlaceOrder.value ?? defaultThirdPlaceOrder.value ?? []
)

const hasCustomThirdPlaceOrder = computed(() => {
  if (!customThirdPlaceOrder.value) return false
  return JSON.stringify(customThirdPlaceOrder.value) !== JSON.stringify(defaultThirdPlaceOrder.value)
})

/** Get the 3rd-place team name for a group, based on current group rankings */
function getThirdPlaceTeamName(groupId: string): string {
  const ranking = getGroupRanking(groupId)
  return ranking[2] ?? ''
}

function moveThirdPlaceUp(idx: number) {
  if (idx <= 0) return
  ensureCustomThirdPlaceOrder()
  const order = customThirdPlaceOrder.value
  if (!order) return
  const arr = [...order]
  const a = arr[idx - 1]!
  const b = arr[idx]!
  arr[idx - 1] = b
  arr[idx] = a
  customThirdPlaceOrder.value = arr
  fantasyPicks.value = {}
}

function moveThirdPlaceDown(idx: number) {
  if (idx >= 11) return
  ensureCustomThirdPlaceOrder()
  const order = customThirdPlaceOrder.value
  if (!order) return
  const arr = [...order]
  const a = arr[idx]!
  const b = arr[idx + 1]!
  arr[idx] = b
  arr[idx + 1] = a
  customThirdPlaceOrder.value = arr
  fantasyPicks.value = {}
}

function ensureCustomThirdPlaceOrder() {
  if (!customThirdPlaceOrder.value) {
    customThirdPlaceOrder.value = [...defaultThirdPlaceOrder.value]
  }
}

// ─── Simulation ─────────────────────────────────────────────────────────────

const activeCustomisation = computed<BracketCustomisation | undefined>(() => {
  if (mode.value !== 'fantasy') return undefined
  const has = customGroupRankings.value || customThirdPlaceOrder.value
  if (!has) return undefined
  return {
    groupRankings: customGroupRankings.value,
    thirdPlaceOrder: customThirdPlaceOrder.value,
  }
})

const { resolvedMatches, getMatch } = useBracketSimulation(activeCustomisation)

const simMatchMap = computed(() => {
  const map = new Map<number, ResolvedMatch>()
  for (const m of resolvedMatches.value) {
    map.set(m.id, m)
  }
  return map
})

// ─── Fantasy picks ──────────────────────────────────────────────────────────

const fantasyPicks = ref<Record<number, string>>(loadPicks())

function loadPicks(): Record<number, string> {
  try {
    const raw = localStorage.getItem(FANTASY_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function persistPicks() {
  localStorage.setItem(FANTASY_STORAGE_KEY, JSON.stringify(fantasyPicks.value))
}

watch(fantasyPicks, persistPicks, { deep: true })

const hasAnyCustomisation = computed(() =>
  Object.keys(fantasyPicks.value).length > 0 || hasCustomGroupRankings.value || hasCustomThirdPlaceOrder.value
)

function onPick(matchId: number, teamName: string) {
  if (mode.value !== 'fantasy') return

  const current = fantasyPicks.value[matchId]
  if (current === teamName) {
    delete fantasyPicks.value[matchId]
    cascadeRemove(matchId, teamName)
  } else {
    if (current) {
      cascadeRemove(matchId, current)
    }
    fantasyPicks.value[matchId] = teamName
  }
}

function cascadeRemove(matchId: number, removedTeam: string) {
  const downstream = ALL_MATCHES.filter(
    m => (m.slot1.type === 'match-winner' && m.slot1.matchId === matchId)
      || (m.slot2.type === 'match-winner' && m.slot2.matchId === matchId)
  )
  for (const dm of downstream) {
    const pick = fantasyPicks.value[dm.id]
    if (pick === removedTeam) {
      delete fantasyPicks.value[dm.id]
      cascadeRemove(dm.id, removedTeam)
    }
  }
}

function resetAll() {
  fantasyPicks.value = {}
  customGroupRankings.value = undefined
  customThirdPlaceOrder.value = undefined
}

function copyPredictionsToFantasy() {
  const { matches } = simulateBracket()
  const picks: Record<number, string> = {}
  for (const m of matches) {
    if (m.projectedWinner) {
      picks[m.id] = m.projectedWinner.name
    }
  }
  fantasyPicks.value = picks
  customGroupRankings.value = undefined
  customThirdPlaceOrder.value = undefined
  mode.value = 'fantasy'
}

// ─── Fantasy bracket resolution ─────────────────────────────────────────────

const allTeams = computed(() => {
  const map = new Map<string, Team>()
  for (const g of groups) {
    for (const t of g.teams) {
      map.set(t.name, t)
    }
  }
  return map
})

function getTeamByName(name: string): Team | null {
  return allTeams.value.get(name) ?? null
}

function getFantasyMatch(matchId: number): ResolvedMatch {
  const simMatch = simMatchMap.value.get(matchId)
  const matchDef = ALL_MATCHES.find(m => m.id === matchId)

  if (!matchDef || !simMatch) {
    return simMatch ?? { id: matchId, round: 'R32', team1: null, team2: null, winProb1: 0.5, winProb2: 0.5, projectedWinner: null }
  }

  let team1: Team | null
  let team2: Team | null

  if (matchDef.slot1.type === 'match-winner') {
    const pickedName = fantasyPicks.value[matchDef.slot1.matchId!]
    team1 = pickedName ? getTeamByName(pickedName) : null
  } else if (matchDef.slot1.type === 'match-loser') {
    const prevMatch = simMatchMap.value.get(matchDef.slot1.matchId!)
    const winnerName = fantasyPicks.value[matchDef.slot1.matchId!]
    if (prevMatch?.team1 && prevMatch?.team2) {
      team1 = winnerName === prevMatch.team1.name ? prevMatch.team2 : prevMatch.team1
    } else {
      team1 = prevMatch?.projectedWinner === prevMatch?.team1 ? prevMatch?.team2 ?? null : prevMatch?.team1 ?? null
    }
  } else {
    team1 = simMatch.team1
  }

  if (matchDef.slot2.type === 'match-winner') {
    const pickedName = fantasyPicks.value[matchDef.slot2.matchId!]
    team2 = pickedName ? getTeamByName(pickedName) : null
  } else if (matchDef.slot2.type === 'match-loser') {
    const prevMatch = simMatchMap.value.get(matchDef.slot2.matchId!)
    const winnerName = fantasyPicks.value[matchDef.slot2.matchId!]
    if (prevMatch?.team1 && prevMatch?.team2) {
      team2 = winnerName === prevMatch.team1.name ? prevMatch.team2 : prevMatch.team1
    } else {
      team2 = prevMatch?.projectedWinner === prevMatch?.team1 ? prevMatch?.team2 ?? null : prevMatch?.team1 ?? null
    }
  } else {
    team2 = simMatch.team2
  }

  let winProb1 = 0.5
  let winProb2 = 0.5
  let projectedWinner: Team | null = null

  if (team1 && team2) {
    const odds = getHeadToHeadOdds(team1, team2)
    winProb1 = odds.winA
    winProb2 = odds.winB
    projectedWinner = winProb1 >= winProb2 ? team1 : team2
  } else if (team1) {
    winProb1 = 1; winProb2 = 0; projectedWinner = team1
  } else if (team2) {
    winProb1 = 0; winProb2 = 1; projectedWinner = team2
  }

  return {
    id: matchId,
    round: matchDef.round,
    team1,
    team2,
    winProb1,
    winProb2,
    projectedWinner,
  }
}

// ─── Display match (switches source based on mode) ──────────────────────────

function getDisplayMatch(matchId: number): ResolvedMatch {
  if (mode.value === 'fantasy') {
    return getFantasyMatch(matchId)
  }
  return simMatchMap.value.get(matchId) ?? {
    id: matchId, round: 'R32', team1: null, team2: null,
    winProb1: 0.5, winProb2: 0.5, projectedWinner: null,
  }
}

// ─── Cookie & JSON save / load ──────────────────────────────────────────────

const COOKIE_NAME = 'worldcup-bracket'
const cookieJustSaved = ref(false)

interface BracketSnapshot {
  version: 1
  fantasyPicks: Record<number, string>
  groupRankings?: CustomGroupRankings
  thirdPlaceOrder?: CustomThirdPlaceOrder
}

function buildSnapshot(): BracketSnapshot {
  return {
    version: 1,
    fantasyPicks: { ...fantasyPicks.value },
    groupRankings: customGroupRankings.value ? JSON.parse(JSON.stringify(customGroupRankings.value)) : undefined,
    thirdPlaceOrder: customThirdPlaceOrder.value ? [...customThirdPlaceOrder.value] : undefined,
  }
}

function applySnapshot(snap: BracketSnapshot) {
  fantasyPicks.value = snap.fantasyPicks ?? {}
  customGroupRankings.value = snap.groupRankings ?? undefined
  customThirdPlaceOrder.value = snap.thirdPlaceOrder ?? undefined
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match && match[1] ? decodeURIComponent(match[1]) : null
}

function saveToCookie() {
  const json = JSON.stringify(buildSnapshot())
  setCookie(COOKIE_NAME, json, 365)
  cookieJustSaved.value = true
  setTimeout(() => { cookieJustSaved.value = false }, 2000)
}

function loadFromCookie() {
  const raw = getCookie(COOKIE_NAME)
  if (!raw) {
    alert('No saved bracket found in cookies.')
    return
  }
  try {
    const snap: BracketSnapshot = JSON.parse(raw)
    applySnapshot(snap)
  } catch {
    alert('Could not read saved bracket. The cookie data may be corrupted.')
  }
}

function exportJson() {
  const snap = buildSnapshot()
  const blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `worldcup-bracket-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importJson(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const snap: BracketSnapshot = JSON.parse(reader.result as string)
      if (!snap.version || typeof snap.fantasyPicks !== 'object') {
        throw new Error('Invalid format')
      }
      applySnapshot(snap)
    } catch {
      alert('Invalid bracket file. Please select a valid exported JSON.')
    }
  }
  reader.readAsText(file)
  input.value = ''
}

// ─── Champion display ───────────────────────────────────────────────────────

const champion = computed<Team | null>(() => {
  if (mode.value === 'fantasy') {
    const pick = fantasyPicks.value[103]
    return pick ? getTeamByName(pick) : null
  }
  return getMatch(103)?.projectedWinner ?? null
})
</script>

<style scoped>
.bracket-page {
  padding: 80px 24px 40px;
  min-height: 100vh;
  overflow-x: auto;
  background: linear-gradient(180deg, #0b3d0b 0%, #0a3510 30%, #072e0c 60%, #052208 100%);
  position: relative;
}

/* Football pitch markings */
.bracket-page::before {
  content: '';
  position: fixed;
  inset: 0;
  /* Pitch boundary */
  background:
    /* Center circle */
    radial-gradient(circle 120px at 50% 50%, transparent 118px, rgba(255,255,255,0.10) 118px, rgba(255,255,255,0.10) 120px, transparent 120px),
    /* Center dot */
    radial-gradient(circle 4px at 50% 50%, rgba(255,255,255,0.12) 4px, transparent 4px),
    /* Center line (horizontal) */
    linear-gradient(0deg, transparent calc(50% - 1px), rgba(255,255,255,0.10) calc(50% - 1px), rgba(255,255,255,0.10) calc(50% + 1px), transparent calc(50% + 1px)),
    /* Left penalty area */
    linear-gradient(90deg, transparent 4%, rgba(255,255,255,0.08) 4%, rgba(255,255,255,0.08) 4.15%, transparent 4.15%),
    linear-gradient(0deg, transparent 30%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 30.15%, transparent 30.15%),
    linear-gradient(0deg, transparent 69.85%, rgba(255,255,255,0.08) 69.85%, rgba(255,255,255,0.08) 70%, transparent 70%),
    /* Right penalty area */
    linear-gradient(90deg, transparent 95.85%, rgba(255,255,255,0.08) 95.85%, rgba(255,255,255,0.08) 96%, transparent 96%),
    /* Sidelines */
    linear-gradient(90deg, rgba(255,255,255,0.06) 2px, transparent 2px, transparent calc(100% - 2px), rgba(255,255,255,0.06) calc(100% - 2px)),
    linear-gradient(0deg, rgba(255,255,255,0.06) 2px, transparent 2px, transparent calc(100% - 2px), rgba(255,255,255,0.06) calc(100% - 2px)),
    /* Grass stripe texture */
    repeating-linear-gradient(90deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 60px, transparent 60px, transparent 120px);
  pointer-events: none;
  z-index: 0;
}

/* Vignette overlay for readability */
.bracket-page::after {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, rgba(0,0,0,0.4) 100%);
  pointer-events: none;
  z-index: 0;
}

.bracket-page > * {
  position: relative;
  z-index: 1;
}

.bracket-header {
  max-width: 1400px;
  margin: 0 auto 24px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.bracket-title {
  font-size: 32px;
  font-weight: 900;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.bracket-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

.mode-toggle {
  display: flex;
  gap: 4px;
  align-items: center;
}

.mode-btn {
  padding: 8px 20px;
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

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.mode-btn.active {
  color: #ffd700;
  background: rgba(212, 175, 55, 0.15);
  border-color: rgba(212, 175, 55, 0.4);
}

.customize-btn {
  color: rgba(212, 175, 55, 0.9);
  border-color: rgba(212, 175, 55, 0.3);
  background: rgba(212, 175, 55, 0.08);
}

.customize-btn:hover {
  background: rgba(212, 175, 55, 0.18);
  color: #ffd700;
  border-color: rgba(212, 175, 55, 0.5);
}

.bracket-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  font-size: 12px;
  font-family: inherit;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.save-cookie-btn {
  color: rgba(100, 200, 140, 0.9);
  border-color: rgba(100, 200, 140, 0.25);
  background: rgba(100, 200, 140, 0.08);
}

.save-cookie-btn:hover {
  background: rgba(100, 200, 140, 0.18);
  color: #90eeb0;
}

.import-label {
  cursor: pointer;
}

.hidden-input {
  display: none;
}

.btn-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.action-sep {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.12);
  margin: 0 4px;
}

.reset-btn {
  display: inline-flex;
  align-items: center;
  padding: 7px 14px;
  font-size: 12px;
  font-family: inherit;
  font-weight: 600;
  color: rgba(255, 120, 120, 0.9);
  background: rgba(255, 80, 80, 0.1);
  border: 1px solid rgba(255, 80, 80, 0.25);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.reset-btn:hover {
  background: rgba(255, 80, 80, 0.2);
}

/* ─── Group Stage Editor ─────────────────────────────────────────────── */

.group-stage-section {
  max-width: 1400px;
  margin: 0 auto 24px;
}

.section-toggle {
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

.section-toggle:hover {
  background: rgba(10, 25, 47, 0.95);
  border-color: rgba(255, 255, 255, 0.18);
}

.toggle-icon {
  font-size: 10px;
  color: #d4af37;
  width: 14px;
  text-align: center;
}

.toggle-title {
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toggle-hint {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  margin-left: auto;
}

.group-stage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  padding: 16px 0;
}

.group-mini-card {
  background: rgba(10, 25, 47, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.group-mini-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.group-mini-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #d4af37, #b8962e);
  border-radius: 5px;
  font-weight: 900;
  font-size: 12px;
  color: #0a192f;
}

.group-mini-name {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.7);
}

.group-mini-teams {
  display: flex;
  flex-direction: column;
}

.group-mini-team {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  transition: background 0.1s ease;
}

.group-mini-team + .group-mini-team {
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.group-mini-team.qualifies-auto {
  background: rgba(100, 200, 100, 0.06);
}

.group-mini-team.qualifies-maybe {
  background: rgba(212, 175, 55, 0.06);
}

.group-mini-team.eliminated {
  opacity: 0.45;
}

.group-pos {
  font-size: 10px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.35);
  width: 14px;
  text-align: center;
}

.qualifies-auto .group-pos {
  color: rgba(100, 200, 100, 0.7);
}

.qualifies-maybe .group-pos {
  color: rgba(212, 175, 55, 0.7);
}

.group-team-flag {
  font-size: 14px;
  flex-shrink: 0;
  border-radius: 1px;
}

.group-team-name {
  flex: 1;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-team-actions {
  display: flex;
  gap: 2px;
  margin-left: auto;
}

.move-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 18px;
  font-size: 8px;
  color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.1s ease;
  padding: 0;
  font-family: inherit;
}

.move-btn:hover {
  color: #ffd700;
  background: rgba(212, 175, 55, 0.15);
  border-color: rgba(212, 175, 55, 0.3);
}

/* ─── Third-place panel ──────────────────────────────────────────────── */

.third-place-panel {
  grid-column: 1 / -1;
  background: rgba(10, 25, 47, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.third-place-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.third-place-title {
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.9);
}

.third-place-hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.third-place-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0;
}

.third-place-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.1s ease;
}

.third-place-row.qualifies {
  background: rgba(100, 200, 100, 0.05);
}

.third-place-row.eliminated {
  opacity: 0.4;
}

.third-pos {
  font-size: 10px;
  font-weight: 800;
  width: 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.35);
}

.qualifies .third-pos {
  color: rgba(100, 200, 100, 0.7);
}

.third-flag {
  font-size: 14px;
  flex-shrink: 0;
  border-radius: 1px;
}

.third-team-name {
  flex: 1;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.third-group-label {
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.third-actions {
  display: flex;
  gap: 2px;
}

.group-stage-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.reset-groups-btn {
  padding: 8px 20px;
  font-size: 12px;
  font-family: inherit;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.reset-groups-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 1000px;
}

/* ─── Bracket layout ─────────────────────────────────────────────────── */

.bracket-container {
  overflow-x: auto;
  padding-bottom: 16px;
}

.bracket-scroll {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: max-content;
  padding: 16px 0;
}

.bracket-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.r32-col {
  gap: 8px;
}

.r16-col {
  gap: 76px;
}

.qf-col {
  gap: 220px;
}

.sf-col {
  gap: 510px;
}

.final-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.final-label {
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #ffd700;
  text-shadow: 0 0 12px rgba(255, 215, 0, 0.3);
}

.champion-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 24px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(184, 134, 11, 0.1));
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 12px;
  min-width: 180px;
}

.champion-flag {
  font-size: 32px;
  border-radius: 3px;
}

.champion-name {
  font-size: 18px;
  font-weight: 900;
  color: #ffd700;
}

.champion-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.5);
}

.third-place-block {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.third-place-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

/* ─── Round labels ───────────────────────────────────────────────────── */

.round-labels {
  display: flex;
  justify-content: space-between;
  max-width: max-content;
  min-width: max-content;
  padding: 12px 0;
  gap: 12px;
  margin: 0 auto;
}

.round-labels span {
  width: 180px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

/* ─── Responsive ─────────────────────────────────────────────────────── */

@media (max-width: 768px) {
  .bracket-header {
    flex-direction: column;
  }
  .bracket-title {
    font-size: 24px;
  }
  .group-stage-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}
</style>
