import { describe, test, expect, beforeEach } from 'vitest'
import {
  GOOD_STEPS, DAY_MS, makeItem, nextState, ensureItem, ensureMany, gradeItem,
  dueItems, dueSummary, itemKey, removeItem, pruneItems, getSrMap,
} from './spacedRepetition.js'

const T0 = Date.parse('2026-10-23T00:00:00Z')

beforeEach(() => localStorage.clear())

describe('间隔复习排期规则（纯函数）', () => {
  test('新条目立即到期（今天就该复习）', () => {
    const it = makeItem('mistake', 'm1', T0)
    expect(it.dueAt).toBe(T0)
    expect(it.stage).toBe(0)
    expect(it.intervalDays).toBe(1)
  })

  test('连续“正常”：间隔按 1→2→4→7→15→30→60 天推进', () => {
    let it = makeItem('mistake', 'm1', T0)
    const expected = [1, 2, 4, 7, 15, 30, 60]
    for (let i = 0; i < expected.length; i++) {
      it = nextState(it, 2, T0)
      expect(it.intervalDays).toBe(expected[i])
      expect(it.dueAt).toBe(T0 + expected[i] * DAY_MS)
      // 把时钟推到到期点，继续评“正常”
      it = { ...it }
    }
    // 超过档位数后封顶 60
    const more = nextState(it, 2, it.dueAt)
    expect(more.intervalDays).toBe(60)
  })

  test('“忘了”归零到 1 天且 lapses+1；“困难”间隔×1.5', () => {
    let it = nextState(makeItem('vocab', 'v1', T0), 2, T0) // 1 天
    it = nextState(it, 2, T0) // 2 天
    it = nextState(it, 0, T0)
    expect(it.stage).toBe(0)
    expect(it.intervalDays).toBe(1)
    expect(it.lapses).toBe(1)
    const hard = nextState(makeItem('para', 'p1', T0), 1, T0)
    expect(hard.intervalDays).toBe(2) // round(1*1.5)
  })

  test('“简单”跳两档并再 ×1.5，封顶 60 天', () => {
    const easy = nextState(makeItem('mistake', 'x', T0), 3, T0)
    expect(easy.stage).toBe(2)
    // 跳过 1/2 天两档，在 2 天档上再 ×1.5
    expect(easy.intervalDays).toBe(Math.round(GOOD_STEPS[1] * 1.5)) // 3
    expect(easy.intervalDays).toBeLessThanOrEqual(60)
  })
})

describe('持久化与到期查询', () => {
  test('ensure/grade 写本地，到期查询只返回 dueAt<=now', () => {
    ensureItem('mistake', 'm1', T0)
    gradeItem('mistake', 'm1', 2, T0) // due T0+1d
    ensureItem('para', 'p1', T0)
    expect(dueItems(T0).map((i) => i.refId)).toEqual(['p1'])
    expect(dueItems(T0 + DAY_MS + 1).length).toBe(2)
  })

  test('ensureMany 幂等；重复 ensure 不覆盖已有排期', () => {
    ensureMany('vocab', ['a', 'b'], T0)
    gradeItem('vocab', 'a', 2, T0)
    ensureMany('vocab', ['a', 'b', 'c'], T0)
    const map = getSrMap()
    expect(map[itemKey('vocab', 'a')].reps).toBe(1)
    expect(Object.keys(map)).toHaveLength(3)
  })

  test('dueSummary 按类别统计', () => {
    ensureMany('mistake', ['m1'], T0)
    ensureMany('para', ['p1', 'p2'], T0)
    gradeItem('para', 'p2', 2, T0)
    const s = dueSummary(T0)
    expect(s.due).toBe(2)
    expect(s.byKind).toMatchObject({ mistake: 1, para: 1, vocab: 0 })
  })

  test('删除条目后不再参与复习；prune 对账清除悬挂引用', () => {
    ensureMany('mistake', ['m1', 'm2'], T0)
    expect(removeItem('mistake', 'm1')).toBe(true)
    expect(removeItem('mistake', 'm1')).toBe(false)
    gradeItem('vocab', 'gone', 2, T0)
    const removed = pruneItems({ mistake: new Set(['m2']), para: new Set(), vocab: new Set() })
    expect(removed).toBe(1)
    expect(dueItems(T0 + 10 * DAY_MS).map((i) => i.refId)).toEqual(['m2'])
  })
})
