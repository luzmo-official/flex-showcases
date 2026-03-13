<template>
  <div class="bracket-preview-compact glass-panel">
    <h3 class="compact-section-title">Bracket</h3>
    <div class="mini-bracket-scroll">
      <div class="mini-bracket-inner">
        <!-- Left: R16 → QF → SF -->
        <div class="mini-bracket-col mini-r16-col">
          <div v-for="id in LEFT_R16_IDS" :key="id" class="mini-match">
            <MiniBracketSlot :match="getMatch(id)" :format-pct="formatPct" />
          </div>
        </div>
        <div class="mini-bracket-col mini-qf-col">
          <div v-for="id in LEFT_QF_IDS" :key="id" class="mini-match">
            <MiniBracketSlot :match="getMatch(id)" :format-pct="formatPct" />
          </div>
        </div>
        <div class="mini-bracket-col mini-sf-col">
          <div v-for="id in LEFT_SF_IDS" :key="id" class="mini-match">
            <MiniBracketSlot :match="getMatch(id)" :format-pct="formatPct" />
          </div>
        </div>
        <!-- Center: Final -->
        <div class="mini-bracket-col mini-final-col">
          <span class="mini-final-label">Final</span>
          <div class="mini-match">
            <MiniBracketSlot :match="getMatch(103)" :format-pct="formatPct" />
          </div>
        </div>
        <!-- Right: SF → QF → R16 -->
        <div class="mini-bracket-col mini-sf-col">
          <div v-for="id in RIGHT_SF_IDS" :key="id" class="mini-match">
            <MiniBracketSlot :match="getMatch(id)" :format-pct="formatPct" />
          </div>
        </div>
        <div class="mini-bracket-col mini-qf-col">
          <div v-for="id in RIGHT_QF_IDS" :key="id" class="mini-match">
            <MiniBracketSlot :match="getMatch(id)" :format-pct="formatPct" />
          </div>
        </div>
        <div class="mini-bracket-col mini-r16-col">
          <div v-for="id in RIGHT_R16_IDS" :key="id" class="mini-match">
            <MiniBracketSlot :match="getMatch(id)" :format-pct="formatPct" />
          </div>
        </div>
      </div>
    </div>
    <router-link to="/bracket" class="btn-secondary btn-block">View Full Bracket</router-link>
  </div>
</template>

<script setup lang="ts">
import MiniBracketSlot from './MiniBracketSlot.vue'
import type { ResolvedMatch } from '@/composables/useBracketSimulation'
import {
  LEFT_R16_IDS,
  RIGHT_R16_IDS,
  LEFT_QF_IDS,
  RIGHT_QF_IDS,
  LEFT_SF_IDS,
  RIGHT_SF_IDS,
} from '@/data/bracket'

defineProps<{
  getMatch: (id: number) => ResolvedMatch | undefined
  formatPct: (val: number) => string
}>()
</script>

<style scoped>
.bracket-preview-compact {
  padding: 16px;
}

.compact-section-title {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px 0;
}

.mini-bracket-scroll {
  overflow-x: auto;
  margin-bottom: 12px;
}

.mini-bracket-inner {
  display: flex;
  align-items: stretch;
  gap: 8px;
  min-width: min-content;
  padding: 4px 0;
}

.mini-bracket-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
}

.mini-r16-col {
  min-width: 72px;
}

.mini-qf-col {
  min-width: 72px;
}

.mini-sf-col {
  min-width: 72px;
}

.mini-final-col {
  min-width: 80px;
  align-items: center;
  gap: 6px;
}

.mini-final-label {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.mini-match {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.btn-block {
  display: block;
  text-align: center;
  width: 100%;
}
</style>
