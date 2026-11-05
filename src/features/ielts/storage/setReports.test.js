import { describe, test, expect } from 'vitest'
import { groupSets, bandTrend, buildMarkdown, markdownToHtml, SET_PARTS } from './setReports.js'

function session(moduleName, source, n, total, correct, extra = {}) {
  return {
    id: `s${n}`, module: moduleName, sourceLabel: source, total, correct,
    durationSec: 600 + n, createdAt: Date.parse(`2026-10-${20 + n}T09:00:00Z`),
    reasonStats: { 'locating-failed': n, 'word-limit': 1 },
    ...extra,
  }
}

describe('整套分组', () => {
  test('听力 4 个 Part 齐 → complete，整套 raw/band 按总正确率折算', () => {
    const input = [1, 2, 3, 4].map((i) => session('listening', '剑18 Test1', i, 10, 8))
    const [set] = groupSets(input)
    expect(set.complete).toBe(true)
    expect(set.recordedParts).toBe(4)
    expect(set.totalCorrect).toBe(32)
    expect(set.totalQuestions).toBe(40)
    expect(set.raw).toBe(32)
    expect(set.band).toBe(7.5) // 32 → 7.5（听力锚点）
    expect(set.parts.map((p) => p.index)).toEqual([1, 2, 3, 4])
    expect(set.totalDurationSec).toBe(600 * 4 + 10)
  })

  test('阅读 3 篇齐 → complete；缺一篇不完整', () => {
    const full = [1, 2, 3].map((i) => session('reading', '剑17 Test2', i, 13, 10))
    expect(groupSets(full)[0].complete).toBe(true)
    const partial = groupSets(full.slice(0, 2))[0]
    expect(partial.complete).toBe(false)
    expect(partial.recordedParts).toBe(2)
  })

  test('不同来源标签不合并；各部分 band 按正确率折算', () => {
    const input = [
      session('listening', 'A', 1, 10, 5), // 50% → raw20 → band 5.5
      session('listening', 'A', 2, 10, 10),
      session('listening', 'A', 3, 10, 10),
      session('listening', 'A', 4, 10, 10),
      session('listening', 'B', 1, 10, 6),
    ]
    const sets = groupSets(input)
    expect(sets.length).toBe(2)
    const a = sets.find((s) => s.sourceLabel === 'A')
    expect(a.parts[0].band).toBe(5.5)
    expect(a.reasonTotals['locating-failed']).toBe(10)
  })

  test('坏数据（无标签/无成绩）被忽略', () => {
    const sets = groupSets([
      { module: 'reading', sourceLabel: '', total: 13, correct: 10 },
      { module: 'reading', sourceLabel: 'X' },
    ])
    expect(sets).toEqual([])
  })
})

describe('趋势与报告', () => {
  test('bandTrend 只取整套完成、按时间排序', () => {
    const mk = (label, day, correct) => groupSets(
      [1, 2, 3, 4].map((i) => session('listening', label, i, 10, i === 1 ? correct : 9,
        { createdAt: Date.parse(`2026-10-${day + i}T09:00:00Z`) })),
    )[0]
    const first = mk('A', 1, 6)
    const later = mk('A', 10, 8)
    const trend = bandTrend([later, first])
    expect(trend.map((t) => t.band)).toEqual([first.band, later.band])
  })

  test('Markdown 含总览、逐部分表格、错因与非官方声明', () => {
    const [set] = groupSets([1, 2, 3].map((i) => session('reading', '剑17 T2', i, 13, 11)))
    const md = buildMarkdown(set, { reasonLabels: new Map([['locating-failed', '定位失败']]) })
    expect(md).toContain('# 阅读整套复盘报告 · 剑17 T2')
    expect(md).toContain('整套估算分数段')
    expect(md).toContain('非官方成绩')
    expect(md).toContain('| 阅读 1 |')
    expect(md).toContain('定位失败：6 次')
    expect(md).toContain(`部分完成：3/${SET_PARTS.reading.expected}`)
  })

  test('markdownToHtml：表格与标题渲染、HTML 转义', () => {
    const html = markdownToHtml('# 标题\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n- x\n- y')
    expect(html).toContain('<h1>标题</h1>')
    expect(html).toContain('<tr><th>A</th><th>B</th></tr>')
    expect(html).toContain('<tr><td>1</td><td>2</td></tr>')
    expect(html).toContain('<li>x</li>')
    const esc = markdownToHtml('a < b & c')
    expect(esc).toContain('&lt;')
    expect(esc).toContain('&amp;')
  })
})
