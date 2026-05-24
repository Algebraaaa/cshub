#!/usr/bin/env node
/* eslint-disable */
// One-shot splitter: 切分 src/data/algorithms.js 的 BASE_ALGORITHMS 到
// src/data/algorithms/<subject>.js。原文件被重写为聚合器。
//
// 不依赖 AST 解析——基于已确认稳定的格式约定：
//   - 每个算法条目以 "^  <slug>: \{$" 开头
//   - 以 "^  \},$" 结尾（最后一项以 "^  \}$" 结尾，紧接 "}" 关闭 BASE_ALGORITHMS）
//   - 每个条目里有一行 "    category: 'xxx',"
//   - import 行集中在文件头部
//
// 跑这个脚本前请确认 git working tree clean，便于 diff 审查。

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const mainPath = path.join(root, 'src/data/algorithms.js')
const outDir = path.join(root, 'src/data/algorithms')

const text = fs.readFileSync(mainPath, 'utf8').replace(/\r\n/g, '\n')
const lines = text.split('\n')

// 1. 解析 imports（找 "import {...} from '../algorithms/..."）
const importLines = []
const importByIdent = new Map() // ident → 完整 import 行字符串
let firstNonImportLine = 0
for (let i = 0; i < lines.length; i++) {
  const L = lines[i]
  if (L.startsWith('import ')) {
    importLines.push(L)
    const m = L.match(/import\s*\{\s*([^}]+)\s*\}/)
    if (m) {
      m[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean)
        .forEach(ident => importByIdent.set(ident, L))
    }
  } else if (L.trim() === '' && importLines.length > 0) {
    // blank line allowed between imports
  } else if (importLines.length > 0) {
    firstNonImportLine = i
    break
  }
}

// 2. 定位 BASE_ALGORITHMS 块边界
let baseStart = -1, baseEnd = -1
for (let i = 0; i < lines.length; i++) {
  if (/^const BASE_ALGORITHMS\s*=\s*\{$/.test(lines[i])) {
    baseStart = i + 1
    break
  }
}
if (baseStart < 0) throw new Error('找不到 BASE_ALGORITHMS = { 开头')

// 找到对应的关闭 "}"——注意要跳过 C++/Python 代码模板里的 "}"。
// 真正的 BASE_ALGORITHMS 关闭是在 "export const ALGORITHMS" 之前最近的 "^}$"。
let exportLine = -1
for (let i = baseStart; i < lines.length; i++) {
  if (/^export const ALGORITHMS\b/.test(lines[i])) {
    exportLine = i
    break
  }
}
if (exportLine < 0) throw new Error('找不到 export const ALGORITHMS')
for (let i = exportLine - 1; i >= baseStart; i--) {
  if (lines[i] === '}') {
    baseEnd = i
    break
  }
}
if (baseEnd < 0) throw new Error('找不到 BASE_ALGORITHMS 的 } 结尾')

// 3. 提取每个 entry 块
const entries = []
let curStart = -1
let curSlug = null
for (let i = baseStart; i < baseEnd; i++) {
  const L = lines[i]
  const m = L.match(/^  ([a-zA-Z0-9_]+):\s*\{$/)
  if (m) {
    if (curStart >= 0) {
      throw new Error(`未闭合的 entry "${curSlug}" 在 line ${curStart + 1}`)
    }
    curStart = i
    curSlug = m[1]
  } else if (curStart >= 0 && /^  \},?$/.test(L)) {
    const body = lines.slice(curStart, i + 1).join('\n')
    entries.push({ slug: curSlug, startLine: curStart, endLine: i, body })
    curStart = -1
    curSlug = null
  }
}
if (curStart >= 0) throw new Error(`末尾未闭合的 entry "${curSlug}"`)

console.log(`Found ${entries.length} entries.`)

// 4. 对每个 entry 找 category + 用到的 imports
function findCategory(body) {
  const m = body.match(/^\s*category:\s*['"]([^'"]+)['"]/m)
  return m ? m[1] : null
}
function findUsedIdents(body) {
  const used = new Set()
  // 简单匹配 import idents 出现在 body 里的（精确单词）
  for (const ident of importByIdent.keys()) {
    const re = new RegExp(`\\b${ident}\\b`)
    if (re.test(body)) used.add(ident)
  }
  return used
}

// 5. category → subject 映射（用于 multi-cat-per-subject 学科文件）
const CAT_TO_SUBJECT = {
  sorting: 'sorting',
  graph: 'graph',
  tree: 'tree',
  dp: 'dp',
  backtracking: 'backtracking',
  string: 'string',
  dataStructures: 'dataStructures',
  network: 'network',
  security: 'security',
  co: 'co',
  pageReplacement: 'os',
  diskScheduling: 'os',
  cpuScheduling: 'os',
  synchronization: 'os',
  memoryManagement: 'os',
}

const grouped = {} // subject → { entries, usedIdents }
for (const e of entries) {
  const cat = findCategory(e.body)
  const subj = CAT_TO_SUBJECT[cat]
  if (!subj) throw new Error(`未映射的 category "${cat}" (entry ${e.slug})`)
  grouped[subj] = grouped[subj] || { entries: [], usedIdents: new Set() }
  grouped[subj].entries.push(e)
  for (const id of findUsedIdents(e.body)) grouped[subj].usedIdents.add(id)
}

// 6. 写出每个 subject 文件
fs.mkdirSync(outDir, { recursive: true })
for (const [subj, { entries: subjEntries, usedIdents }] of Object.entries(grouped)) {
  // 按导入路径排序后输出，做相对路径调整（../algorithms → ../../algorithms）
  const importsForSubj = [...usedIdents].map(id => {
    const orig = importByIdent.get(id)
    return orig.replace("from '../algorithms/", "from '../../algorithms/")
  })
  // dedup full import lines
  const dedup = [...new Set(importsForSubj)]
  dedup.sort()

  const constName = `${subj.toUpperCase()}_ALGORITHMS`
  // 每个 entry 自带尾随 `,`，直接 join 即可，不要再加额外逗号
  const body = subjEntries.map(e => e.body).join('\n\n')
  const content = `// 自动从 algorithms.js 拆分（${subjEntries.length} 个算法 · ${subj} 学科）
${dedup.join('\n')}

export const ${constName} = {
${body}

}

export default ${constName}
`
  const outPath = path.join(outDir, `${subj}.js`)
  fs.writeFileSync(outPath, content, 'utf8')
  console.log(`Wrote ${outPath} (${subjEntries.length} entries)`)
}

// 7. 重写主 algorithms.js：保留 CATEGORIES + 聚合器 + EXTRA_ALGORITHMS 显式 import
// 跳过 DB_ALGORITHMS / COMPILER_ALGORITHMS 的显式 import（glob 接管后变冗余）
const categoriesBlock = lines.slice(firstNonImportLine, baseStart - 1)
  .filter(L => !/from '\.\/algorithms\/(db|compiler)'/.test(L))
  .filter(L => !/^\/\/\s*按学科拆分/.test(L))
  .join('\n')

// 提取 baseEnd 之后的尾部，但跳过原 `export const ALGORITHMS = { ... }` 块（避免重复声明）
const tailLines = lines.slice(baseEnd + 1)
let skipStart = -1, skipEnd = -1
for (let i = 0; i < tailLines.length; i++) {
  if (/^export const ALGORITHMS\s*=\s*\{/.test(tailLines[i])) {
    skipStart = i
    for (let j = i; j < tailLines.length; j++) {
      if (tailLines[j] === '}') { skipEnd = j; break }
    }
    break
  }
}
const trailing = (skipStart >= 0
  ? tailLines.slice(0, skipStart).concat(tailLines.slice(skipEnd + 1))
  : tailLines
).join('\n').trim()

const newMain = `// 顶层 algorithms 聚合器：通过 Vite import.meta.glob 自动收集
// src/data/algorithms/<subject>.js 下所有学科文件的默认导出。
// 新增/修改算法只需改对应学科文件，本聚合器无需修改。
//
// EXTRA_ALGORITHMS 居住在 src/data/extraAlgorithms.js（不在 algorithms/ 子目录），
// 因此仍然显式 import 并参与最终聚合。
import { EXTRA_ALGORITHMS } from './extraAlgorithms'

${categoriesBlock}

const __subjectModules = import.meta.glob('./algorithms/*.js', { eager: true })

const __collected = Object.values(__subjectModules)
  .map(m => m.default ?? Object.values(m).find(v => v && typeof v === 'object' && !Array.isArray(v)))
  .filter(Boolean)

export const ALGORITHMS = Object.assign({}, ...__collected, EXTRA_ALGORITHMS)

${trailing}
`
fs.writeFileSync(mainPath, newMain, 'utf8')
console.log(`Rewrote ${mainPath} (now ${newMain.split('\n').length} lines)`)
