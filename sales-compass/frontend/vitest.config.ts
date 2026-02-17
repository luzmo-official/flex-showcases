import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@luzmo\/lucero\/.+$/,
        replacement: resolve(rootDir, 'src/test/stubs/lucero.ts')
      },
      {
        find: '@luzmo/icons',
        replacement: resolve(rootDir, 'src/test/stubs/icons.ts')
      }
    ]
  }
});
