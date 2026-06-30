import { defineConfig } from 'vite';
import { devvit } from '@devvit/start/vite';

export default defineConfig({
  publicDir: 'src/client/assets',
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
