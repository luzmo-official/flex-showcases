<template>
  <router-link :to="`/group/${group.id}`" class="group-card">
    <div class="group-header">
      <span class="group-letter">GROUP {{ group.id }}</span>
      <div v-if="favorite" class="favorite-inline">
        <span class="fi favorite-flag" :class="`fi-${favorite.flagCode}`"></span>
        <span class="favorite-prob">
          <span class="favorite-pct-line">{{ formatPct(favorite.tournamentWinProb) }} to</span>
          <span class="favorite-cup-line">win the cup</span>
        </span>
      </div>
    </div>

    <div class="teams-list">
      <div
        v-for="team in group.teams"
        :key="team.name"
        class="team-row"
      >
        <span
          class="fi team-flag"
          :class="`fi-${team.flagCode}`"
        ></span>
        <span class="team-name">{{ team.name }}</span>
        <span class="team-prob">{{ formatPct(team.groupAdvanceProb) }}</span>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Group } from '../data/groups'

const props = defineProps<{
  group: Group
}>()

const favorite = computed(() =>
  [...props.group.teams].sort(
    (a, b) => b.tournamentWinProb - a.tournamentWinProb
  )[0]
)

function formatPct(val: number): string {
  if (val < 0.01) return '<1%'
  return `${Math.round(val * 100)}%`
}
</script>

<style scoped>
.group-card {
  display: flex;
  flex-direction: column;
  background: rgba(10, 25, 47, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 16px;
  text-decoration: none;
  color: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
  min-width: 0;
}

.group-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border-color: rgba(212, 175, 55, 0.5);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
}

.group-letter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  min-height: 32px;
  background: linear-gradient(135deg, #d4af37, #b8962e);
  border-radius: 8px;
  font-weight: 900;
  font-size: 11px;
  letter-spacing: 0.5px;
  color: #0a192f;
  white-space: nowrap;
}

.favorite-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  flex-shrink: 0;
  margin-left: auto;
}

.favorite-inline .favorite-flag {
  font-size: 18px;
  border-radius: 2px;
}

.favorite-inline .favorite-prob {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.25;
}

.favorite-inline .favorite-pct-line {
  color: #d4af37;
  font-weight: 700;
  font-size: 13px;
}

.favorite-inline .favorite-cup-line {
  color: rgba(255, 255, 255, 0.75);
  font-size: 10px;
  font-weight: 600;
}

.teams-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.team-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.team-flag {
  font-size: 18px;
  flex-shrink: 0;
  border-radius: 2px;
}

.team-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-prob {
  font-size: 12px;
  font-weight: 700;
  color: #d4af37;
  min-width: 36px;
  text-align: right;
}

</style>
