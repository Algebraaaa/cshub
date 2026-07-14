import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'scripts', '_artifact_reviews', 'node_modules']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Node 运行时上下文：根级 *.config.js（vite/playwright 配置）、单测
    // （vitest 测试常用 node:fs/node:path 做断言，如 docConsistency.test.js）、
    // e2e/（Playwright 在 Node 里跑，非浏览器）。追加 node globals（与上面
    // 的 browser globals 合并，不互斥），修复 process/__dirname 等 no-undef。
    files: ['*.config.js', 'src/**/*.test.{js,jsx}', 'e2e/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
