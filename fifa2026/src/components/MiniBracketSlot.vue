<template>
  <div class="mini-match-slots">
    <div class="mini-slot">
      <span
        class="fi mini-flag"
        :class="match?.team1 ? `fi-${match.team1.flagCode}` : 'mini-flag-empty'"
      ></span>
      <span class="mini-pct">{{ match?.team1 ? formatPct(match.winProb1) : '–' }}</span>
    </div>
    <div class="mini-slot">
      <span
        class="fi mini-flag"
        :class="match?.team2 ? `fi-${match.team2.flagCode}` : 'mini-flag-empty'"
      ></span>
      <span class="mini-pct">{{ match?.team2 ? formatPct(match.winProb2) : '–' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResolvedMatch } from '@/composables/useBracketSimulation'

defineProps<{
  match: ResolvedMatch | undefined
  formatPct: (val: number) => string
}>()
</script>

<style scoped>
.mini-match-slots {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mini-slot {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.mini-flag {
  width: 18px;
  height: 14px;
  border-radius: 2px;
  flex-shrink: 0;
  display: inline-block;
}

.mini-flag-empty {
  background: rgba(255, 255, 255, 0.08);
}

.mini-pct {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  min-width: 28px;
}
</style>
