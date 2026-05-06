<template>
  <div class="app-shell">
    <nav class="top-nav" v-if="showNav">
      <router-link to="/" class="nav-brand" @click="menuOpen = false">
        <span class="brand-icon">&#9917;</span>
        <span class="brand-text">World Cup 2026</span>
        <img src="/Luzmo.png" alt="Luzmo" class="brand-luzmo-logo" />
        <span class="brand-sub">Analytics Explorer</span>
      </router-link>

      <!-- Desktop: horizontal links (visible >= 800px) -->
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

      <!-- Mobile: hamburger + dropdown (< 800px) -->
      <div class="nav-mobile">
        <button
          type="button"
          class="nav-menu-btn"
          aria-label="Open menu"
          :aria-expanded="menuOpen"
          aria-haspopup="true"
          @click="menuOpen = !menuOpen"
        >
          <span class="nav-menu-icon" aria-hidden="true"></span>
        </button>
        <Transition name="nav-drop">
          <div v-show="menuOpen" class="nav-dropdown" role="menu">
            <router-link
              to="/"
              class="nav-dropdown-link"
              role="menuitem"
              active-class="active"
              :aria-current="route.name === 'pitch' ? 'page' : undefined"
              @click="menuOpen = false"
            >
              The Pitch
            </router-link>
            <router-link
              to="/bracket"
              class="nav-dropdown-link"
              role="menuitem"
              active-class="active"
              :aria-current="route.name === 'bracket' ? 'page' : undefined"
              @click="menuOpen = false"
            >
              Bracket
            </router-link>
            <router-link
              to="/match-analysis"
              class="nav-dropdown-link"
              role="menuitem"
              active-class="active"
              :aria-current="route.name === 'match-analysis' ? 'page' : undefined"
              @click="menuOpen = false"
            >
              Match Analysis
            </router-link>
            <router-link
              to="/builder"
              class="nav-dropdown-link"
              role="menuitem"
              active-class="active"
              :aria-current="route.name === 'builder' ? 'page' : undefined"
              @click="menuOpen = false"
            >
              Report Builder
            </router-link>
          </div>
        </Transition>
      </div>
    </nav>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showNav = computed(() => route.name !== undefined)

const menuOpen = ref(false)

function closeMenuOnResize() {
  if (window.innerWidth >= 800) menuOpen.value = false
}

function closeMenuOnClickOutside(e: MouseEvent) {
  const target = e.target as Node
  const mobile = document.querySelector('.nav-mobile')
  if (mobile && !mobile.contains(target)) menuOpen.value = false
}

onMounted(() => {
  window.addEventListener('resize', closeMenuOnResize)
  document.addEventListener('click', closeMenuOnClickOutside)
})
onUnmounted(() => {
  window.removeEventListener('resize', closeMenuOnResize)
  document.removeEventListener('click', closeMenuOnClickOutside)
})
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

/* Mobile hamburger + dropdown (< 800px) */
.nav-mobile {
  display: none;
  position: relative;
}

.nav-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  width: 44px;
  height: 44px;
  margin: 0 -16px 0 0;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: background 0.15s ease;
}

.nav-menu-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.nav-menu-btn[aria-expanded="true"] {
  background: rgba(255, 255, 255, 0.1);
}

.nav-menu-icon {
  display: block;
  width: 22px;
  height: 2px;
  background: currentColor;
  border-radius: 1px;
  box-shadow: 0 6px 0 currentColor, 0 12px 0 currentColor;
}

.nav-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 200px;
  padding: 8px 0;
  background: rgba(10, 25, 47, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  z-index: 101;
}

.nav-dropdown-link {
  display: block;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.15s ease, background 0.15s ease;
}

.nav-dropdown-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}

.nav-dropdown-link.active {
  color: var(--gold);
  background: rgba(212, 175, 55, 0.12);
}

.nav-drop-enter-active,
.nav-drop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.nav-drop-enter-from,
.nav-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 799px) {
  .nav-links {
    display: none;
  }

  .nav-mobile {
    display: block;
  }
}

main {
  flex: 1;
  padding-top: 56px;
}
</style>
