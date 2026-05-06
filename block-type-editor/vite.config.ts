import { defineConfig } from 'vite';

export default defineConfig({
  envPrefix: 'LUZMO_',
  css: {
    preprocessorOptions: {
      scss: {
        charset: true
      }
    }
  },
  build: {
    rollupOptions: {
      input: './index.html'
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
