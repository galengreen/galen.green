import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const cmsUrl = env.CMS_URL || 'http://localhost:3000'
  const matomoUrl = env.MATOMO_URL || 'http://localhost:8080'

  return {
    plugins: [vue(), vueJsx(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia'],
    },
    server: {
      proxy: {
        '/api': {
          target: cmsUrl,
          changeOrigin: true,
          secure: true,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
        },
        '/media': {
          target: cmsUrl,
          changeOrigin: true,
          secure: true,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
        },
        '/analytics': {
          target: matomoUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/analytics/, ''),
        },
      },
    },
  }
})
