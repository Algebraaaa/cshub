// 文档防漂移守卫（自检维度 12）。
// AI 会读文档并当真，"文档说谎"比没文档更坑。本测试扫描 Markdown 里反引号
// 包住的仓库文件路径（src/ docs/ scripts/ .github/ supabase/ 前缀，precise
// 到不会误报 npm 包名 / .env.local / 命令），断言它们真实存在。
// 曾抓到：FRONTEND_SELF_CHECK 把 algorithmSmoke.test.jsx 路径写错。
import { test, expect } from 'vitest'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

// 收集要扫描的 Markdown：根目录 + docs/ 递归
function collectMarkdown(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.git')) continue
    const full = path.join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      // 只递归 docs/ 与根；避免扫进 src 里的注释
      if (full === path.join(ROOT, 'docs')) collectMarkdown(full, acc)
    } else if (name.endsWith('.md')) {
      acc.push(full)
    }
  }
  return acc
}

// 只守护「活文档」（会被当成当前真相来读的）。历史一次性报告是时间快照，
// 记录的是当时的路径，不该强求永久有效，排除之。
const IS_ARCHIVE = (name) => /REPORT|CHANGELOG/i.test(name)
const ROOT_MD = readdirSync(ROOT)
  .filter(f => f.endsWith('.md') && !IS_ARCHIVE(f))
  .map(f => path.join(ROOT, f))
const DOC_FILES = [...new Set([...ROOT_MD, ...collectMarkdown(path.join(ROOT, 'docs'))])]

// 反引号内、以已知仓库目录开头、带扩展名、无占位符/通配/空格的路径
const REPO_PREFIX = /^(src|docs|scripts|\.github|supabase)\//
const PATH_RE = /`([^`\s]+?\.[a-z0-9]+)`/gi

function extractRepoPaths(md) {
  const out = new Set()
  let m
  while ((m = PATH_RE.exec(md))) {
    const p = m[1]
    if (!REPO_PREFIX.test(p)) continue
    if (/[<>*]/.test(p)) continue         // 跳过 <subject>.js 这类模板
    out.add(p)
  }
  return out
}

test('文档里引用的仓库文件路径都真实存在（防漂移）', () => {
  const missing = []
  for (const file of DOC_FILES) {
    const md = readFileSync(file, 'utf8')
    for (const p of extractRepoPaths(md)) {
      if (!existsSync(path.join(ROOT, p))) {
        missing.push(`${path.relative(ROOT, file)} → 引用了不存在的路径: ${p}`)
      }
    }
  }
  expect(missing, missing.join('\n')).toEqual([])
})

test('至少扫描到若干文档与路径（守卫本身没空跑）', () => {
  expect(DOC_FILES.length).toBeGreaterThan(2)
  const total = DOC_FILES.reduce((n, f) => n + extractRepoPaths(readFileSync(f, 'utf8')).size, 0)
  expect(total).toBeGreaterThan(3)
})
