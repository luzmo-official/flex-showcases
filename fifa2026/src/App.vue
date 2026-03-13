<template>
  <div class="app-shell">
    <nav class="top-nav" v-if="showNav">
      <router-link to="/" class="nav-brand">
        <span class="brand-icon">&#9917;</span>
        <span class="brand-text">World Cup 2026</span>
        <img src="/Luzmo.png" alt="Luzmo" class="brand-luzmo-logo" />
        <span class="brand-sub">Analytics Explorer</span>
      </router-link>

      <div class="nav-links">
        <router-link
          to="/"
          class="nav-link"
          active-class="active"
          :aria-current="route.name === 'pitch' ? 'page' : undefined"
        >
          The Pitch
        </router-link>
        <router-link
          to="/bracket"
          class="nav-link"
          active-class="active"
          :aria-current="route.name === 'bracket' ? 'page' : undefined"
        >
          Bracket
        </router-link>
        <router-link
          to="/match-analysis"
          class="nav-link"
          active-class="active"
          :aria-current="route.name === 'match-analysis' ? 'page' : undefined"
        >
          Match Analysis
        </router-link>
        <router-link
          to="/builder"
          class="nav-link"
          active-class="active"
          :aria-current="route.name === 'builder' ? 'page' : undefined"
        >
          Report Builder
        </router-link>
      </div>
    </nav>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showNav = computed(() => route.name !== undefined)
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  background: rgba(10, 25, 47, 0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #fff;
}

.brand-icon {
  font-size: 24px;
}

.brand-text {
  font-weight: 900;
  font-size: 16px;
  letter-spacing: 0.5px;
}

.brand-luzmo-logo {
  height: 24px;
  width: auto;
  object-fit: contain;
  display: block;
}

.brand-sub {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.nav-links {
  display: flex;
  gap: 4px;
}

.nav-link {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  border-radius: 6px;
  transition: color 0.15s ease, background 0.15s ease;
}

.nav-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}

.nav-link.active {
  color: var(--gold);
  background: rgba(212, 175, 55, 0.1);
}

main {
  flex: 1;
  padding-top: 56px;
}
</style>
