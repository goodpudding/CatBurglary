import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const clientRoot = resolve(__dirname, 'src/client');

/** Phaser Editor emits `client/assets/...` paths; map them to the public root. */
function clientAssetsCompat(): Plugin {
  return {
    name: 'client-assets-compat',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith('/client/assets/')) {
          req.url = req.url.replace('/client/assets/', '/');
        }
        next();
      });
    },
  };
}

/** Local browser dev without Reddit playtest — API calls fall back to defaults. */
export default defineConfig({
  root: clientRoot,
  publicDir: resolve(clientRoot, 'assets'),
  plugins: [clientAssetsCompat()],
  server: {
    port: 5173,
    open: '/splash.html',
  },
  build: {
    outDir: resolve(__dirname, 'dist-local'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        splash: resolve(clientRoot, 'splash.html'),
        game: resolve(clientRoot, 'game.html'),
      },
    },
  },
});
