// ─────────────────────────────────────────────────────────────
// playgroundRegistry · viz key → Playground lazy loader
//
// 设计：
// - Playground 组件文件通过 Vite 的 import.meta.glob 自动发现（无需手工 import 路径）。
// - viz key → 文件名靠约定推导：忽略大小写等于文件名（去 Playground 后缀）即可命中，
//   candidateKeys() 同时生成 lowercase 和 camelCase 两种候选，覆盖两种命名习惯
//   （如 ieee754/hashtable 全小写 vs pageReplacement/hashJoin 驼峰）。
// - ALIASES 只登记约定推导不出来的行：语义已改名的（如 counting→CountingSort），
//   以及真正的多对一共享（bst/rb/avl/treap → Tree）。
//
// 新增一个 Playground 文件时：
//   - viz key 与文件名只差大小写 → 无需改动本文件，约定自动命中。
//   - viz key 与文件名对不上（改名/多对一）→ 在下方 ALIASES 加一行。
//
// Node 测试环境（无 import.meta.glob）：
// - 退回 stub 缓存，每个 name 返回同一占位函数，保证引用相等
//   （bst/rb/avl/treap 共享 loader）以及 typeof === 'function'。
// - 此路径依赖真实文件名做约定推导；modules 为 null 时无法枚举文件，
//   故此分支下 VIZ_TO_NAME 仅含 ALIASES（当前无任何测试/构建路径会触发此分支，
//   import.meta.glob 经 Vite 在 vitest 下正常工作）。
// ─────────────────────────────────────────────────────────────

// Vite transforms `import.meta.glob('...')` at build time into an object literal.
// In Node test runs (no Vite transform), the runtime expression throws because
// `import.meta.glob` is undefined — the try/catch keeps the registry importable
// in both environments and lets the test fall back to stub loaders.
let modules
try {
  modules = import.meta.glob('../playgrounds/*Playground.jsx')
} catch {
  modules = null
}

const byName = modules
  ? Object.fromEntries(
      Object.entries(modules).map(([p, loader]) => {
        const name = p.split('/').pop().replace('.jsx', '')
        return [name, loader]
      })
    )
  : null

// Node test fallback: cache stub loaders per name so identity comparisons hold.
const stubCache = new Map()
function lookup(name) {
  if (byName) return byName[name] || null
  if (!stubCache.has(name)) {
    stubCache.set(name, () => Promise.resolve({ default: () => null }))
  }
  return stubCache.get(name)
}

// viz key → Playground 文件名（不带 .jsx）的显式例外表。
// 只登记约定推导不出来的两类行：
//   1) 语义已改名，viz key 和文件名对不上（如 counting → CountingSort）
//   2) 真正的多对一共享（bst/rb/avl/treap 都渲染 TreePlayground）
// 其余 viz key 一律靠"忽略大小写等于文件名"的约定自动解析，不在此登记。
const ALIASES = {
  counting: 'CountingSort',
  radix: 'RadixSort',
  bucket: 'BucketSort',
  tarjancp: 'TarjanCutpoint',
  backtracking: 'NQueens',
  protocol: 'ProtocolTimeline',
  txnIsolation: 'Transaction',
  buildAst: 'Ast',
  // 树（共享 TreePlayground）
  bst: 'Tree',
  rb: 'Tree',
  avl: 'Tree',
  treap: 'Tree',
}

// 每个发现的文件贡献两个候选 viz key：全小写（ieee754/hashtable 风格）
// 和首字母小写的驼峰（pageReplacement/hashJoin 风格）——覆盖数据层两种命名习惯。
function candidateKeys(name) {
  const camel = name[0].toLowerCase() + name.slice(1)
  const lower = name.toLowerCase()
  return camel === lower ? [lower] : [camel, lower]
}

function buildVizToName() {
  const derived = {}
  if (byName) {
    for (const fileName of Object.keys(byName)) {
      const name = fileName.replace(/Playground$/, '')
      for (const key of candidateKeys(name)) derived[key] = name
    }
  }
  return { ...derived, ...ALIASES }
}

// viz key → Playground 文件名（不带 .jsx）。见上方 ALIASES 注释。
export const VIZ_TO_NAME = buildVizToName()

export const PLAYGROUND_LOADERS = Object.fromEntries(
  Object.entries(VIZ_TO_NAME).map(([viz, name]) => [viz, lookup(`${name}Playground`)])
)

export function getPlaygroundLoader(viz) {
  return PLAYGROUND_LOADERS[viz] || null
}

const preloadCache = new Map()

export function preloadPlayground(viz) {
  const loader = getPlaygroundLoader(viz)
  if (!loader) return Promise.resolve(null)
  if (!preloadCache.has(viz)) {
    preloadCache.set(viz, loader().catch(err => {
      preloadCache.delete(viz)
      throw err
    }))
  }
  return preloadCache.get(viz)
}
