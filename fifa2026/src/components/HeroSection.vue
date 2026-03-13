<template>
  <div class="hero-section hero-full-width">
    <h1 class="hero-title">
      FIFA World Cup
      <img src="/worldcup-2026-hero.png" alt="2026" class="hero-year-img" />
    </h1>
    <p class="hero-subtitle">
      48 teams &middot; 12 groups &middot; 16 host cities &middot;
      <span class="gold-text">1 champion</span>
    </p>
    <p class="hero-tagline">
      Explore group odds, team stats, and build your own analytics reports
    </p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px 32px;
  min-height: 0;
}

.hero-title {
  font-size: 56px;
  font-weight: 900;
  letter-spacing: -1px;
  line-height: 1.1;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.hero-year-img {
  display: block;
  margin: 0 auto;
  height: 96px;
  width: auto;
  max-width: min(420px, 90vw);
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))
    drop-shadow(0 0 16px rgba(255, 193, 37, 0.35))
    drop-shadow(0 0 30px rgba(255, 165, 0, 0.25));
  animation: festiveGlowImg 2.5s ease-in-out infinite;
}

@keyframes festiveGlowImg {
  0%,
  100% {
    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))
      drop-shadow(0 0 16px rgba(255, 193, 37, 0.35))
      drop-shadow(0 0 30px rgba(255, 165, 0, 0.25));
  }
  50% {
    filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.65))
      drop-shadow(0 0 20px rgba(255, 193, 37, 0.45))
      drop-shadow(0 0 40px rgba(255, 165, 0, 0.3));
  }
}

.hero-subtitle {
  margin-top: 16px;
  font-size: 20px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
  letter-spacing: 0.5px;
}

.hero-tagline {
  margin-top: 8px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.75);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}

.gold-text {
  font-weight: 700;
  color: #ffd700;
}

.hero-full-width {
  width: 100%;
  box-sizing: border-box;
}
</style>
