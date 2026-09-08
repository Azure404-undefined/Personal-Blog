import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { compression } from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    command === 'serve' && vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    command === 'build' && compression({ algorithms: ['gzip'], threshold: 1024 }),
  ],
  server: {
    host: true,
    port: 3000,
    open: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/tokens.scss" as *; @use "@/styles/mixins.scss" as *;`,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // 只聚合框架级稳定库(长缓存);Element Plus 保持按需分片,不整库聚合
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return
          if (/[\\/]node_modules[\\/](vue|@vue|vue-router|pinia)[\\/]/.test(id)) return 'vendor-vue'
          if (/[\\/]node_modules[\\/]axios[\\/]/.test(id)) return 'vendor-http'
          if (/[\\/]node_modules[\\/](markdown-it|dompurify)[\\/]/.test(id)) return 'vendor-content'
        },
      },
    },
  },
}))
