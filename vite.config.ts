import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { devvit } from '@devvit/start/vite';

/** Devvit sets Vite root to `src/client` — public assets must resolve from there. */
export default defineConfig({
  publicDir: resolve(__dirname, 'src/client/assets'),
  plugins: [
    devvit({
      client: {
        build: {
          chunkSizeWarningLimit: 2000,
        },
      },
    }),
  ],
});
