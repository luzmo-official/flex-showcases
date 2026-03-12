import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'pitch',
      component: () => import('../views/PitchView.vue'),
    },
    {
      path: '/group/:groupId',
      name: 'group',
      component: () => import('../views/GroupExplorer.vue'),
      props: true,
    },
    {
      path: '/bracket',
      name: 'bracket',
      component: () => import('../views/BracketView.vue'),
    },
    {
      path: '/match/:matchId',
      name: 'match',
      component: () => import('../views/MatchView.vue'),
      props: true,
    },
    {
      path: '/match-analysis',
      name: 'match-analysis',
      component: () => import('../views/MatchAnalysisView.vue'),
    },
    {
      path: '/builder',
      name: 'builder',
      component: () => import('../views/ReportBuilder.vue'),
    },
  ],
})

export default router
