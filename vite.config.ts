import path from 'node:path'
import { DevupUI } from '@devup-ui/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build'
    ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || 'lecture-quiz-frontend'}/`
    : '/',
  plugins: [react(), DevupUI()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
}))
