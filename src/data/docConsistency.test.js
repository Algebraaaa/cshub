// 文档防漂移守卫（自检维度 12）。
// AI 会读文档并当真，"文档说谎"比没文档更坑。本测试扫描 Markdown 里反引号
// 包住的仓库文件路径（src/ docs/ scripts/ .github/ supabase/ 前缀，precise
// 到不会误报 npm 包名 / .env.local / 命令），断言它们真实存在。
// 曾抓到：FRONTEND_SELF_CHECK 把 algorithmSmoke.test.jsx 路径写错。
import { test, expect } from 'vitest'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

// 只守护「活文档」（会被当成当前真相来读的）。历史一次性报告是时间快照，
// 记录的是当时的路径，不该强求永久有效，排除之。
// 例：docs/reports/ML_OPTIMIZATION_INTEGRATION_REPORT.md 引用的
// AIConceptPlayground.jsx 已于 2026-06 被逐概念 Playground 取代，属正常过期。
const SNAPSHOT_DIRS = new Set(['archive', 'reports'])
const IS_SNAPSHOT = (name) => /REPORT|CHANGELOG/i.test(name)

// 收集要扫描的 Markdown：根目录 + docs/ 递归（含 guides/ 等子目录，
// 但整体跳过快照目录）。
// 注意：本函数只应以 docs/ 为起点调用，根目录由 ROOT_MD 单独处理——
// 否则会递归进 src/ 扫到代码注释里的路径。
function collectMarkdown(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.git')) continue
    if (SNAPSHOT_DIRS.has(name)) continue
    const full = path.join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      collectMarkdown(full, acc)
    } else if (name.endsWith('.md')) {
      // docs/ 内按目录判定快照即可；docs/CHANGELOG.md 这类虽名为 CHANGELOG，
      // 却引用当前源码路径、会被当成真相读，必须守护。
      acc.push(full)
    }
  }
  return acc
}

const ROOT_MD = readdirSync(ROOT)
  .filter(f => f.endsWith('.md') && !IS_SNAPSHOT(f))
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
