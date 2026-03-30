<template>
  <div class="bracket-preview-compact glass-panel">
    <h3 class="compact-section-title">Bracket</h3>
    <div class="bracket-and-button">
      <div ref="containerRef" class="bracket-container">
        <div
          ref="contentRef"
          class="bracket-scaled"
          :style="scaledStyle"
        >
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
            <!-- Center: Final + View Full Bracket button (between lowest competitors) -->
            <div class="mini-bracket-col mini-final-col">
              <span class="mini-final-label">Final</span>
              <div class="mini-match">
                <MiniBracketSlot :match="getMatch(103)" :format-pct="formatPct" />
              </div>
              <router-link to="/bracket" class="btn-secondary btn-bracket">View Full Bracket</router-link>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
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

const containerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const scale = ref(1)

function updateScale() {
  const container = containerRef.value
  const content = contentRef.value
  if (!container || !content) return
  const cw = container.clientWidth
  const ch = container.clientHeight
  // Use offsetWidth/offsetHeight so we get natural (unscaled) size; getBoundingClientRect is affected by transform
  const w = content.offsetWidth
  const h = content.offsetHeight
  if (w <= 0 || h <= 0) return
  const s = Math.min(cw / w, ch / h, 2.5)
  scale.value = Math.max(0.3, Math.min(2.5, s))
}

const scaledStyle = computed(() => {
  const s = scale.value
  return {
    transform: `translate(-50%, -50%) scale(${s})`,
  }
})

let observer: ResizeObserver | null = null
onMounted(() => {
  nextTick(() => {
    updateScale()
    observer = new ResizeObserver(() => {
      requestAnimationFrame(updateScale)
    })
    if (containerRef.value) observer.observe(containerRef.value)
    if (contentRef.value) observer.observe(contentRef.value)
  })
})
onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.bracket-preview-compact {
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.compact-section-title {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px 0;
  flex-shrink: 0;
}

.bracket-and-button {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bracket-container {
  flex: 1;
  min-height: 0;
  min-width: 100%;
  position: relative;
  overflow: hidden;
}

.bracket-scaled {
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center center;
  /* transform: translate(-50%, -50%) scale(s) applied inline */
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

.btn-bracket {
  display: block;
  text-align: center;
  flex-shrink: 0;
  margin-top: 10px;
  white-space: nowrap;
}

/* Keep bracket visible on narrow screens (e.g. below 769px) */
@media (max-width: 768px) {
  .bracket-and-button {
    min-height: 260px;
  }
}
</style>
