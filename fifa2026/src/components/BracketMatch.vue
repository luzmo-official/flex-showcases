<template>
  <div
    class="bracket-match"
    :class="[
      `round-${match.round.toLowerCase()}`,
      { 'is-final': match.round === 'F' },
    ]"
  >
    <div
      class="match-header"
      :class="{ navigable: bothTeamsResolved }"
      :title="matchTooltip"
      @click.stop="navigateToMatch"
    >
      <span class="match-id">M{{ match.id }}</span>
      <span v-if="scheduleInfo" class="match-schedule">
        {{ compactDate }}
        <svg class="clock-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2"/>
          <path d="M8 4.5V8L10.5 9.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ scheduleInfo.majorCity }}
      </span>
      <svg
        v-if="bothTeamsResolved"
        class="nav-icon"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div
      class="team-slot"
      :class="{
        winner: isTeam1Winner,
        picked: mode === 'fantasy' && userPick === match.team1?.name,
        clickable: mode === 'fantasy' && match.team1 != null,
      }"
      @click="onPickTeam(match.team1)"
    >
      <template v-if="match.team1">
        <span class="fi team-flag" :class="`fi-${match.team1.flagCode}`"></span>
        <span class="team-name">{{ match.team1.name }}</span>
        <span class="team-prob">{{ formatPct(match.winProb1) }}</span>
      </template>
      <template v-else>
        <span class="team-tbd">TBD</span>
      </template>
    </div>
    <div
      class="team-slot"
      :class="{
        winner: isTeam2Winner,
        picked: mode === 'fantasy' && userPick === match.team2?.name,
        clickable: mode === 'fantasy' && match.team2 != null,
      }"
      @click="onPickTeam(match.team2)"
    >
      <template v-if="match.team2">
        <span class="fi team-flag" :class="`fi-${match.team2.flagCode}`"></span>
        <span class="team-name">{{ match.team2.name }}</span>
        <span class="team-prob">{{ formatPct(match.winProb2) }}</span>
      </template>
      <template v-else>
        <span class="team-tbd">TBD</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Team } from '../data/groups'
import type { ResolvedMatch } from '../composables/useBracketSimulation'
import { MATCH_SCHEDULE, formatShortDate, getMatchTooltip } from '../data/matchSchedule'

const router = useRouter()

const props = defineProps<{
  match: ResolvedMatch
  mode: 'prediction' | 'fantasy'
  userPick: string | null
}>()

const emit = defineEmits<{
  (e: 'pick', matchId: number, teamName: string): void
}>()

const scheduleInfo = computed(() => MATCH_SCHEDULE[props.match.id] ?? null)
const compactDate = computed(() => scheduleInfo.value ? formatShortDate(scheduleInfo.value) : '')
const matchTooltip = computed(() => getMatchTooltip(props.match.id))

const isTeam1Winner = computed(() => {
  if (props.mode === 'fantasy') {
    return props.userPick === props.match.team1?.name
  }
  return (
    props.match.team1 != null &&
    props.match.team2 != null &&
    props.match.winProb1 >= props.match.winProb2
  )
})

const isTeam2Winner = computed(() => {
  if (props.mode === 'fantasy') {
    return props.userPick === props.match.team2?.name
  }
  return (
    props.match.team1 != null &&
    props.match.team2 != null &&
    props.match.winProb2 > props.match.winProb1
  )
})

function onPickTeam(team: Team | null) {
  if (props.mode !== 'fantasy' || !team) return
  emit('pick', props.match.id, team.name)
}

const bothTeamsResolved = computed(() => props.match.team1 != null && props.match.team2 != null)

function navigateToMatch() {
  if (bothTeamsResolved.value) {
    router.push(`/match/${props.match.id}`)
  }
}

function formatPct(val: number): string {
  return `${Math.round(val * 100)}%`
}
</script>

<style scoped>
.bracket-match {
  display: flex;
  flex-direction: column;
  background: rgba(10, 25, 47, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  overflow: hidden;
  width: 180px;
  flex-shrink: 0;
}

.bracket-match.is-final {
  width: 220px;
  border-color: rgba(212, 175, 55, 0.4);
}

.match-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  cursor: default;
  min-height: 18px;
  transition: background 0.15s ease;
}

.match-header.navigable {
  cursor: pointer;
}

.match-header.navigable:hover {
  background: rgba(255, 255, 255, 0.08);
}

.nav-icon {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.3);
  transition: color 0.15s;
}

.match-header.navigable:hover .nav-icon {
  color: rgba(245, 200, 66, 0.8);
}

.match-id {
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.45);
  flex-shrink: 0;
}

.match-schedule {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 8px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  justify-content: flex-end;
}

.clock-icon {
  width: 9px;
  height: 9px;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.6);
}

.team-slot {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  min-height: 28px;
  transition: background 0.15s ease;
}

.team-slot + .team-slot {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.team-slot.clickable {
  cursor: pointer;
}

.team-slot.clickable:hover {
  background: rgba(255, 255, 255, 0.06);
}

.team-slot.winner {
  background: rgba(212, 175, 55, 0.12);
}

.team-slot.winner .team-name {
  color: #ffd700;
  font-weight: 700;
}

.team-slot.picked {
  background: rgba(100, 200, 100, 0.15);
  border-left: 3px solid #64c864;
}

.team-slot.picked .team-name {
  color: #90ee90;
  font-weight: 700;
}

.team-flag {
  font-size: 14px;
  flex-shrink: 0;
  border-radius: 1px;
}

.team-name {
  flex: 1;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgba(255, 255, 255, 0.9);
}

.team-prob {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  min-width: 28px;
  text-align: right;
}

.team-slot.winner .team-prob {
  color: #d4af37;
}

.team-tbd {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}
</style>
