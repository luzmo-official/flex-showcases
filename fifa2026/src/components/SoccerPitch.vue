<template>
  <div class="pitch-container">
    <svg
      class="pitch-svg"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Pitch background with grass stripe effect -->
      <defs>
        <pattern id="grassStripes" patternUnits="userSpaceOnUse" width="80" height="800">
          <rect width="40" height="800" fill="#2d8a4e" />
          <rect x="40" width="40" height="800" fill="#34a058" />
        </pattern>
      </defs>

      <!-- Main grass -->
      <rect width="1200" height="800" fill="url(#grassStripes)" />

      <!-- Outer boundary -->
      <rect
        x="50" y="30" width="1100" height="740"
        fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5"
      />

      <!-- Halfway line -->
      <line
        x1="600" y1="30" x2="600" y2="770"
        stroke="rgba(255,255,255,0.7)" stroke-width="2.5"
      />

      <!-- Center circle -->
      <circle
        cx="600" cy="400" r="80"
        fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5"
      />

      <!-- Center spot -->
      <circle cx="600" cy="400" r="4" fill="rgba(255,255,255,0.7)" />

      <!-- Left penalty area -->
      <rect
        x="50" y="210" width="160" height="380"
        fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5"
      />

      <!-- Left goal area -->
      <rect
        x="50" y="305" width="60" height="190"
        fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5"
      />

      <!-- Left penalty arc -->
      <path
        d="M 210 335 A 80 80 0 0 1 210 465"
        fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5"
      />

      <!-- Left penalty spot -->
      <circle cx="170" cy="400" r="4" fill="rgba(255,255,255,0.7)" />

      <!-- Left goal -->
      <rect
        x="35" y="360" width="15" height="80"
        fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2"
      />

      <!-- Right penalty area -->
      <rect
        x="990" y="210" width="160" height="380"
        fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5"
      />

      <!-- Right goal area -->
      <rect
        x="1090" y="305" width="60" height="190"
        fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5"
      />

      <!-- Right penalty arc -->
      <path
        d="M 990 335 A 80 80 0 0 0 990 465"
        fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5"
      />

      <!-- Right penalty spot -->
      <circle cx="1030" cy="400" r="4" fill="rgba(255,255,255,0.7)" />

      <!-- Right goal -->
      <rect
        x="1150" y="360" width="15" height="80"
        fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2"
      />

      <!-- Corner arcs -->
      <path d="M 50 40 A 10 10 0 0 1 60 30" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" />
      <path d="M 1140 30 A 10 10 0 0 1 1150 40" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" />
      <path d="M 60 770 A 10 10 0 0 1 50 760" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" />
      <path d="M 1150 760 A 10 10 0 0 1 1140 770" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" />
    </svg>

    <!-- Overlay slot for group cards and content -->
    <div class="pitch-overlay">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// Pure visual component — no props needed
</script>

<style scoped>
.pitch-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background-color: #1a5c30;
}

.pitch-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
}

.pitch-overlay {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 100vh;
}
</style>
