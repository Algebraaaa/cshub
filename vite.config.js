import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'dist'],
  },
  modulePreload: {
    resolveDependencies(_filename, deps) {
      return deps.filter(dep => ![
        'algorithms-',
        'AIAssistant-',
        'vendor-markdown-',
        'vendor-supabase-',
        'vendor-tone-',
        'tonePianoEngine-',
      ].some(prefix => dep.includes(prefix)))
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          const normalized = id.replaceAll('\\', '/')
          if (
            normalized.includes('/node_modules/react') ||
            normalized.includes('/node_modules/react-dom') ||
            normalized.includes('/node_modules/react-router') ||
            normalized.includes('/node_modules/react-router-dom') ||
            normalized.includes('/node_modules/scheduler')
          ) {
            return 'vendor-react'
          }
          if (
            normalized.includes('/node_modules/@babel/') ||
            normalized.includes('/node_modules/tslib/')
          ) {
            return 'vendor-helpers'
          }
          if (normalized.includes('/node_modules/@supabase/')) {
            return 'vendor-supabase'
          }
          if (normalized.includes('/node_modules/tone/')) {
            return 'vendor-tone'
          }
          if (
            normalized.includes('/node_modules/react-markdown') ||
            normalized.includes('/node_modules/remark') ||
            normalized.includes('/node_modules/rehype') ||
            normalized.includes('/node_modules/unified') ||
            normalized.includes('/node_modules/hast') ||
            normalized.includes('/node_modules/mdast') ||
            normalized.includes('/node_modules/micromark') ||
            normalized.includes('/node_modules/vfile')
          ) {
            return 'vendor-markdown'
          }
        },
      },
    },
  },
})
