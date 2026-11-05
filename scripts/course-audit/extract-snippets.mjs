// 从 src/data/algorithms/{os,db,network,co,compiler}.js 提取 code.cpp / code.python
// 片段，输出清单（slug、语言、起止行、正文）。所有后续编译/比对都以这份
// 提取结果为输入，避免人工复制造成漂移。
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..', '..')
const FILES = ['os', 'db', 'network', 'co', 'compiler']

function extractBlocks(src, langKey) {
  // 匹配 `cpp: ` 或 `python: ` 后的模板字符串（片段内没有嵌套反引号）
  const re = new RegExp(langKey + ':\\s*`([^`]*)`', 'g')
  const out = []
  let m
  while ((m = re.exec(src))) {
    const before = src.slice(0, m.index)
    const line = before.split('\n').length
    let slug = null
    const slugRe = /slug:\s*'([^']+)'/g
    let sm
    while ((sm = slugRe.exec(before))) slug = sm[1]
    out.push({ slug, line, code: m[1] })
  }
  return out
}

const manifest = []
for (const f of FILES) {
  const src = (await import('node:fs')).readFileSync(join(root, 'src/data/algorithms', `${f}.js`), 'utf8')
  const cpp = extractBlocks(src, 'cpp')
  const py = extractBlocks(src, 'python')
  const bySlug = new Map()
  for (const b of cpp) {
    const item = { file: f, slug: b.slug, line: b.line, cpp: b.code }
    bySlug.set(b.slug, item)
    manifest.push(item)
  }
  for (const b of py) {
    const item = bySlug.get(b.slug)
    if (item) item.python = b.code
    else manifest.push({ file: f, slug: b.slug, line: b.line, python: b.code })
  }
}

for (const item of manifest) {
  if (!item.cpp || !item.python) {
    console.error(`[extract] ${item.file}:${item.slug} 缺少 cpp/python 配对`)
    process.exit(1)
  }
}

const outDir = join(here, '.work')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'snippets.json'), JSON.stringify(manifest, null, 2))
console.log(`[extract] ${manifest.length} 个算法片段（${manifest.length * 2} 段代码）→ .work/snippets.json`)
