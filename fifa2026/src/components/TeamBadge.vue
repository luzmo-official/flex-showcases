<template>
  <div class="team-badge" :class="{ selected: isSelected }">
    <span
      class="fi team-flag-lg"
      :class="`fi-${team.flagCode}`"
    ></span>
    <div class="team-info">
      <span class="team-name">{{ team.name }}</span>
      <span class="team-meta">
        FIFA #{{ team.fifaRanking }} &middot; {{ team.confederation }}
      </span>
    </div>
    <div class="team-stats">
      <div class="stat">
        <span class="stat-value">{{ formatPct(team.groupAdvanceProb) }}</span>
        <span class="stat-label">Advance</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ formatPct(team.groupWinProb) }}</span>
        <span class="stat-label">Win Group</span>
      </div>
      <div class="stat highlight">
        <span class="stat-value">{{ formatPct(team.tournamentWinProb) }}</span>
        <span class="stat-label">Win Cup</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Team } from '../data/groups'

defineProps<{
  team: Team
  isSelected?: boolean
}>()

function formatPct(val: number): string {
  if (val < 0.01) return '<1%'
  return `${Math.round(val * 100)}%`
}
</script>

<style scoped>
.team-badge {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(10, 25, 47, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.team-badge.selected {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
}

.team-badge:hover {
  border-color: rgba(255, 255, 255, 0.25);
}

.team-flag-lg {
  font-size: 36px;
  flex-shrink: 0;
  border-radius: 4px;
}

.team-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
}

.team-name {
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-meta {
  font-size: 12px;
  opacity: 0.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-stats {
  display: flex;
  gap: 20px;
  flex-shrink: 0;
  min-width: 220px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 60px;
  box-sizing: border-box;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
}

.stat-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.5;
  white-space: nowrap;
}

.stat.highlight .stat-value {
  color: #d4af37;
}
</style>
