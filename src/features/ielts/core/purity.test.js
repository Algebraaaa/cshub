// 内核纯度强制：core/ 下的实现文件只能相互相对引用，禁止 React/DOM/
// localStorage/网络/站内其他模块。新增 core 文件会自动纳入扫描。
import { describe, test, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const files = readdirSync(here)
  .filter((f) => f.endsWith('.js') && !f.endsWith('.test.js'))

const FORBIDDEN_IMPORT = /from\s+['"](?!\.)[^'"]+['"]|import\s*\(['"]?(?!\.)[^'")]+['"]?\)/
const FORBIDDEN_GLOBALS = [
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bdocument\./,
  /\bwindow\b/,
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bnavigator\b/,
  /\brequire\s*\(/,
  /from\s+['"]react/,
]

describe('ielts core 框架无关纯度', () => {
  for (const file of files) {
    test(`${file} 不引用任何外部模块/运行时`, () => {
      const raw = readFileSync(join(here, file), 'utf8')
      // 剥离注释，避免注释里出现 localStorage 等词造成误报
      const src = raw
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
      expect(FORBIDDEN_IMPORT.test(src), `${file} 存在外部 import`).toBe(false)
      for (const re of FORBIDDEN_GLOBALS) {
        expect(re.test(src), `${file} 命中禁用标识 ${re}`).toBe(false)
      }
    })
  }
})
