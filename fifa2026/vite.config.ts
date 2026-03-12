/// <reference types="vitest/config" />
import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat all luzmo-* tags as custom elements (web components)
          isCustomElement: (tag) => tag.startsWith('luzmo-'),
        },
      },
    }),
  ],
  optimizeDeps: {
    include: ['@luzmo/embed', 'gridstack'],
    // Exclude ACK so its dynamic slot-config imports (e.g. bar-chart-slots.config-xxx.js) resolve correctly
    exclude: ['@luzmo/analytics-components-kit'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', '**/*.spec.ts', '**/*.test.ts'],
    },
  },
})
