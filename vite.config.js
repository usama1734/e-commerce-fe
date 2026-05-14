import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, __dirname, '');
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:4000';

  const apiBaseForClient = (env.VITE_API_BASE_URL || '').trim();
  if (command === 'build' && mode === 'production' && process.env.VERCEL === '1') {
    if (!/^https:\/\//i.test(apiBaseForClient)) {
      // eslint-disable-next-line no-console
      console.warn(
        '\n[Vite] Vercel production build: VITE_API_BASE_URL should be an absolute https:// URL to your API (e.g. https://xxx.up.railway.app/api).\n' +
          '        If it is missing or relative (/api), the deployed app will call your Vercel domain, not the backend.\n' +
          '        Set it in Vercel → Settings → Environment Variables, then redeploy.\n'
      );
    }
  }

  return {
    envDir: __dirname,
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
  };
});
