// 算法库内容完整度审计(临时脚本,跑完可删或留作 CI 检查)
// 用法: npx vite-node scripts/auditContent.mjs
const GROUPS = ['backtracking','co','compiler','dataStructures','db','dp','graph','it','math','network','os','security','sorting','string','tree']

const rows = []
for (const g of GROUPS) {
  const mod = await import(`../src/data/algorithms/${g}.js`)
  const dict = mod.default || {}
  const list = Object.values(dict)
  for (const a of list) {
    const issues = []
    const len = s => (typeof s === 'string' ? s.trim().length : 0)
    if (len(a.description) < 30) issues.push(`desc:${len(a.description)}`)
    if (len(a.intuition) < 50) issues.push(`intu:${len(a.intuition)}`)
    if (len(a.pseudocode) < 30) issues.push(`pseudo:${len(a.pseudocode)}`)
    if (!a.code?.cpp || len(a.code?.cpp) < 50) issues.push('cpp')
    if (!a.code?.python || len(a.code?.python) < 50) issues.push('py')
    if (!Array.isArray(a.applications) || a.applications.length === 0) issues.push('apps')
    rows.push({ group: g, slug: a.slug, name: a.name, issues, intuLen: len(a.intuition), descLen: len(a.description) })
  }
}

const qm = await import('../src/data/quizzes.js')
const quizSlugs = new Set(Object.keys(qm.QUIZZES || qm.default || {}))
const incomplete = rows.filter(r => r.issues.length > 0)
const noQuiz = rows.filter(r => !quizSlugs.has(r.slug))

console.log(`总算法数: ${rows.length} | 内容缺口: ${incomplete.length} | 无quiz: ${noQuiz.length}`)
const byGroup = {}
for (const r of rows) { byGroup[r.group] = byGroup[r.group] || { t: 0, b: 0 }; byGroup[r.group].t++; if (r.issues.length) byGroup[r.group].b++ }
console.log('按科目(缺口/总数):', Object.entries(byGroup).map(([g, s]) => `${g}:${s.b}/${s.t}`).join(' '))
console.log('--- 缺口明细 ---')
for (const r of incomplete) console.log(`${r.group}/${r.slug} (${r.name}): ${r.issues.join(',')}`)
console.log('--- 无 quiz slug ---')
console.log(noQuiz.map(r => `${r.group}/${r.slug}`).join('\n'))
