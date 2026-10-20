import path from 'node:path'
import { DevupUI } from '@devup-ui/vite-plugin'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    base: command === 'build'
      ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || 'lecture-quiz-frontend'}/`
      : '/',
    plugins: [react(), DevupUI()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      proxy: env.VITE_API_PROXY_TARGET ? {
        '/api': {
          target: env.VITE_API_PROXY_TARGET,
          changeOrigin: true,
          rewrite: (route: string) => route.replace(/^\/api/, ''),
        },
      } : undefined,
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
  }
})
