import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { createProxyMiddleware } from 'http-proxy-middleware'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3003,
    open: false,
    hmr: {
      port: 3003
    },
    middlewareMode: false,
    // Отключаем кэширование в development
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    // Proxy для API запросов
    proxy: {
      // PostgREST API
      '/rest': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      // Прямые запросы к API
      '/storage_folders': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            proxyRes.headers['content-type'] = 'application/json; charset=utf-8'
          })
        }
      },
      '/storage_objects': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            proxyRes.headers['content-type'] = 'application/json; charset=utf-8'
          })
        }
      },
      '/storage_buckets': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/media_statistics': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/rpc': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      // Таблицы БД
      '/issues': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/articles': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/authors': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/sections': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/genres': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/essays': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      // Auth API (GoTrue)
      '/auth': {
        target: 'http://localhost:9999',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      // Upload API — прокси на Upload Server (порт 3001)
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
