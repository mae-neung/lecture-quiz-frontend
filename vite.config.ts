import fs from 'node:fs'
import path from 'node:path'
import { DevupUI } from '@devup-ui/vite-plugin'
import react from '@vitejs/plugin-react'
import { loadEnv, type Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

// BrowserRouter를 GitHub Pages에서 쓰려면 딥링크·새로고침 404 대비가 필요하다.
// GitHub Pages는 없는 경로에 404.html을 돌려주므로, 빌드 산출물의 index.html을
// 404.html로 복제해 두면 SPA가 그대로 부팅되고 라우터가 원래 경로를 처리한다.
function githubPagesSpaFallback(): Plugin {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(import.meta.dirname, 'dist')
      const indexHtml = path.join(outDir, 'index.html')
      if (fs.existsSync(indexHtml)) fs.copyFileSync(indexHtml, path.join(outDir, '404.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    base: command === 'build'
      ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || 'lecture-quiz-frontend'}/`
      : '/',
    plugins: [react(), DevupUI(), githubPagesSpaFallback()],
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
