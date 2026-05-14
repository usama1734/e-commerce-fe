import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolvePublicApiBase } from './vite.resolveApiBase.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, __dirname, '');
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:4000';

  /** Injected into the client bundle — see src/config/apiBase.ts */
  const publicApiBase = resolvePublicApiBase(env);

  if (command === 'build' && mode === 'production' && process.env.VERCEL === '1') {
    const ok = publicApiBase && !publicApiBase.startsWith('/') && /^https:\/\//i.test(publicApiBase);
    if (!ok) {
      // eslint-disable-next-line no-console
      console.warn(
        '\n[Vite] Vercel production build: set an absolute API URL so the app does not call itself.\n' +
          '        Use one of (then redeploy): VITE_API_BASE_URL, VITE_BACKEND_URL, BACKEND_URL, BACKEND_PUBLIC_URL\n' +
          '        Example: https://your-api.up.railway.app or https://your-api.up.railway.app/api\n'
      );
    }
  }

  return {
    envDir: __dirname,
    define: {
      __APP_API_BASE__: JSON.stringify(publicApiBase),
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      allowedHosts: ['all'],
    },
  };
});
