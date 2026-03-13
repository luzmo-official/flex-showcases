/**
 * World Cup 2026 Analytics Explorer – entry point.
 * Registers Vue app, router, Luzmo/ACK and global styles.
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import '@luzmo/analytics-components-kit'
import '@luzmo/embed'
import 'flag-icons/css/flag-icons.min.css'
import './style.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
