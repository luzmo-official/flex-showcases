<template>
  <div class="favorites-section-compact glass-panel">
    <h3 class="compact-section-title">Tournament Favorites</h3>
    <div class="favorites-strip favorites-strip-vertical">
      <div
        v-for="item in favorites"
        :key="item.team.name"
        class="favorite-chip"
      >
        <span class="fi favorite-flag" :class="`fi-${item.team.flagCode}`"></span>
        <span class="favorite-name">{{ item.team.name }}</span>
        <span class="favorite-pct">{{ item.pct }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Team } from '@/types'

defineProps<{
  favorites: Array<{ team: Team; pct: string }>
}>()
</script>

<style scoped>
.favorites-section-compact {
  padding: 20px;
}

.compact-section-title {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px 0;
}

.favorites-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.favorites-strip-vertical {
  flex-direction: column;
}

.favorite-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.favorite-flag {
  font-size: 20px;
  border-radius: 3px;
  flex-shrink: 0;
}

.favorite-name {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #e6f1ff;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.favorite-pct {
  font-size: 12px;
  font-weight: 700;
  color: #f5c842;
  flex-shrink: 0;
}
</style>
