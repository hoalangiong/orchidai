import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Use '/' for mobile build, '/orchid/' for web deployment
  const isMobileBuild = process.env.MOBILE_BUILD === 'true'
  const base = isMobileBuild ? '/' : '/orchid/'

  return {
    base,
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
          chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
          assetFileNames: `assets/[name]-[hash].[ext]`
        }
      }
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          name: 'Orchid Farm',
          short_name: 'OrchidFarm',
          description: 'Quản lý vườn lan chuyên nghiệp',
          theme_color: '#16a34a',
          background_color: '#f9fafb',
          display: 'standalone',
          orientation: 'portrait',
          start_url: isMobileBuild ? '/' : '/orchid/',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          navigateFallbackDenylist: [/^\/firebase-messaging-sw\.js$/],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/provinces\.open-api\.vn\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'provinces-api',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              },
            },
          ],
        },
      }),
    ],
    server: {
      proxy: {
        '/api/diagnose': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: () => '/v1/messages',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('x-api-key', env.ANTHROPIC_API_KEY)
              proxyReq.setHeader('anthropic-version', '2023-06-01')
              proxyReq.setHeader('anthropic-dangerous-direct-browser-access', 'true')
              proxyReq.setHeader('Content-Type', 'application/json')
            })
          },
        },
        '/api/provinces': {
          target: 'https://provinces.open-api.vn/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/provinces/, ''),
        },
      },
    },
  }
})
