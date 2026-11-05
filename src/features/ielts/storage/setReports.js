// “同一套题”整套视图：按来源标签把阅读 3 篇 / 听力 4 个 Part 归成一套，
// 汇总整套用时、各部分正确率与估算分数段（趋势），并生成 Markdown 复盘报告。
// 纯函数，不接触 DOM。
import { rawToBand } from '../core/index.js'

export const SET_PARTS = {
  reading: { expected: 3, totalQuestions: 40, label: '阅读' },
  listening: { expected: 4, totalQuestions: 40, label: '听力' },
}

const DAY = 24 * 3600 * 1000

// 单部分的原始分折算（该部分正确率线性折算到整套 40 题）与 band。
function partEstimate(session) {
  if (!session || !session.total) return null
  const raw = Math.round((session.correct / session.total) * SET_PARTS[session.module].totalQuestions)
  const moduleKey = session.module === 'listening' ? 'listening' : 'reading-academic'
  return {
    raw,
    band: rawToBand(moduleKey, raw),
    correct: session.correct,
    total: session.total,
    accuracy: session.correct / session.total,
  }
}

export function groupSets(sessions) {
  const groups = new Map()
  for (const s of sessions) {
    if (!s?.module || !s.sourceLabel || typeof s.correct !== 'number' || typeof s.total !== 'number') continue
    const key = `${s.module}::${s.sourceLabel}`
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        module: s.module,
        sourceLabel: s.sourceLabel,
        sessions: [],
      })
    }
    groups.get(key).sessions.push(s)
  }

  const sets = []
  for (const g of groups.values()) {
    const parts = g.sessions
      .slice()
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
      .map((s, i) => ({
        index: i + 1,
        sessionId: s.id,
        createdAt: s.createdAt || null,
        durationSec: s.durationSec || 0,
        reasonStats: s.reasonStats || {},
        ...partEstimate(s),
      }))
    const sumCorrect = parts.reduce((n, p) => n + (p.correct || 0), 0)
    const sumTotal = parts.reduce((n, p) => n + (p.total || 0), 0)
    const raw = sumTotal ? Math.round((sumCorrect / sumTotal) * 40) : 0
    const moduleKey = g.module === 'listening' ? 'listening' : 'reading-academic'
    const expected = SET_PARTS[g.module]?.expected ?? 0
    const firstAt = parts[0]?.createdAt || null
    const lastAt = parts[parts.length - 1]?.createdAt || null
    const spanDays = firstAt && lastAt ? Math.max(1, Math.round((lastAt - firstAt) / DAY) + 1) : 1
    const reasonTotals = {}
    for (const p of parts) {
      for (const [id, n] of Object.entries(p.reasonStats || {})) {
        reasonTotals[id] = (reasonTotals[id] || 0) + n
      }
    }
    sets.push({
      ...g,
      expectedParts: expected,
      recordedParts: parts.length,
      complete: parts.length >= expected,
      parts,
      totalCorrect: sumCorrect,
      totalQuestions: sumTotal,
      totalDurationSec: parts.reduce((n, p) => n + (p.durationSec || 0), 0),
      raw,
      band: rawToBand(moduleKey, raw),
      spanDays,
      reasonTotals,
      createdAt: firstAt,
    })
  }
  sets.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  return sets
}

// 趋势：按同一标签跨次（多次做同一套题）聚合 band 序列。
// 输入为同一 module 的若干套，按标签合并完成时间排序。
export function bandTrend(setsOfLabel) {
  return setsOfLabel
    .filter((s) => s.complete)
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    .map((s) => ({ at: s.createdAt, band: s.band, raw: s.raw, label: s.sourceLabel }))
}

function fmtDate(ts) {
  return ts ? new Date(ts).toLocaleString() : '未知时间'
}
function fmtDuration(sec) {
  if (!sec) return '未记录'
  const m = Math.round(sec / 60)
  return `${Math.floor(m / 60)} 小时 ${m % 60} 分`
}
function pct(x) { return `${(x * 100).toFixed(0)}%` }

// 生成 Markdown 复盘报告（适合打印：纯文本表格，打印样式由查看器提供）。
export function buildMarkdown(set, opts = {}) {
  const modLabel = SET_PARTS[set.module]?.label || set.module
  const lines = []
  lines.push(`# ${modLabel}整套复盘报告 · ${set.sourceLabel}`)
  lines.push('')
  lines.push(`> 生成时间：${fmtDate(opts.at || Date.now())}。分数段为**按官方锚点近似换算的估算，非官方成绩**；`)
  lines.push(`> 单部分按正确率线性折算到 40 题，整套按总正确率折算（官方以整套 40 题为准）。`)
  lines.push('')
  lines.push('## 总览')
  lines.push('')
  lines.push(`- 部分完成：${set.recordedParts}/${set.expectedParts}${set.complete ? '（整套已录齐）' : '（尚未录齐，结果仅供趋势参考）'}`)
  lines.push(`- 总正确：${set.totalCorrect}/${set.totalQuestions}`)
  lines.push(`- 整套估算原始分（折算 /40）：${set.raw}`)
  lines.push(`- **整套估算分数段：${set.band}**`)
  lines.push(`- 整套用时：${fmtDuration(set.totalDurationSec)}`)
  lines.push('')
  lines.push('## 各部分表现')
  lines.push('')
  lines.push('| 部分 | 完成时间 | 正确 | 正确率 | 折算原始分 | 估算 band | 用时 |')
  lines.push('|---|---|---|---|---|---|---|')
  for (const p of set.parts) {
    lines.push(`| ${modLabel} ${p.index} | ${fmtDate(p.createdAt)} | ${p.correct}/${p.total} | ${pct(p.accuracy)} | ${p.raw} | ${p.band} | ${fmtDuration(p.durationSec)} |`)
  }
  lines.push('')
  const topReasons = Object.entries(set.reasonTotals).sort((a, b) => b[1] - a[1])
  if (topReasons.length) {
    lines.push('## 错因汇总')
    lines.push('')
    for (const [id, n] of topReasons) lines.push(`- ${id}：${n} 次`)
    lines.push('')
  }
  if (opts.reasonLabels?.size || opts.reasonLabels instanceof Map) {
    const map = opts.reasonLabels
    lines.push('## 错因（含中文名）')
    lines.push('')
    for (const [id, n] of topReasons) lines.push(`- ${map.get(id) || id}：${n} 次`)
    lines.push('')
  }
  lines.push('## 复盘建议')
  lines.push('')
  lines.push('- 回到错题库按错因做间隔复习；重听/重读定位句再看讲解。')
  lines.push('- 下次整套计时，先保证各部分都按考试节奏完成。')
  lines.push('')
  lines.push('---')
  lines.push('*本报告由 cshub 雅思复盘系统生成；仓库与报告均不含任何官方真题、音频或文稿。*')
  return lines.join('\n')
}

// 打印用 HTML：内联样式 + @media print，可直接在新窗口打印/另存 PDF。
export function buildPrintHtml(markdown, title) {
  const body = markdownToHtml(markdown)
  return `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>${title}</title>
<style>
  @page { margin: 18mm 16mm; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; color: #1a1a2e; line-height: 1.6; font-size: 12pt; margin: 0; padding: 24px; }
  h1 { font-size: 20pt; margin: 0 0 8px; }
  h2 { font-size: 14pt; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 20px; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 10.5pt; }
  th, td { border: 1px solid #999; padding: 5px 8px; text-align: left; }
  th { background: #eef1f8; }
  blockquote { color: #555; border-left: 3px solid #8b7cf6; margin: 8px 0; padding: 4px 12px; background: #f6f4ff; }
  code { background: #f2f2f5; padding: 1px 4px; border-radius: 3px; }
  hr { border: none; border-top: 1px solid #ccc; margin: 18px 0; }
  ul { margin: 6px 0; }
  @media print { .no-print { display: none; } body { padding: 0; } }
</style></head><body>
<div class="no-print" style="text-align:right;margin-bottom:12px">
  <button onclick="window.print()" style="padding:8px 18px;font-size:12pt;cursor:pointer">打印 / 另存为 PDF</button>
</div>
${body}
</body></html>`
}

// 极小 Markdown 子集（标题/表格/引用/列表/分隔线/加粗/行内代码），仅供报告渲染。
export function markdownToHtml(md) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const inline = (s) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
  const lines = md.split('\n')
  const html = []
  let inTable = false
  let inList = false
  const closeList = () => { if (inList) { html.push('</ul>'); inList = false } }
  const closeTable = () => { if (inTable) { html.push('</table>'); inTable = false } }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*$/.test(line)) { closeList(); continue }
    if (line.startsWith('# ')) { closeList(); closeTable(); html.push(`<h1>${inline(line.slice(2))}</h1>`); continue }
    if (line.startsWith('## ')) { closeList(); closeTable(); html.push(`<h2>${inline(line.slice(3))}</h2>`); continue }
    if (line.startsWith('> ')) { closeList(); closeTable(); html.push(`<blockquote>${inline(line.slice(2))}</blockquote>`); continue }
    if (line.startsWith('---')) { closeList(); closeTable(); html.push('<hr>'); continue }
    if (line.startsWith('- ')) {
      closeTable()
      if (!inList) { html.push('<ul>'); inList = true }
      html.push(`<li>${inline(line.slice(2))}</li>`)
      continue
    }
    if (line.startsWith('|')) {
      closeList()
      const cells = line.split('|').slice(1, -1).map((c) => c.trim())
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue // 分隔行
      if (!inTable) { html.push('<table>'); inTable = true }
      const tag = html[html.length - 1] === '<table>' ? 'th' : 'td'
      html.push(`<tr>${cells.map((c) => `<${tag}>${inline(c)}</${tag}>`).join('')}</tr>`)
      continue
    }
    closeList(); closeTable()
    html.push(`<p>${inline(line)}</p>`)
  }
  closeList(); closeTable()
  return html.join('\n')
}
