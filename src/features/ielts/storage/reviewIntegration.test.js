// 错题入库 → 间隔复习自动排期；清空数据 → SR 状态一起清。
import { describe, test, expect, beforeEach } from 'vitest'
import { persistMistakes, persistSession } from './reviewSession.js'
import { dueItems } from './spacedRepetition.js'
import { exportIeltsData, clearIeltsData } from './ieltsStore.js'

const ITEMS = [
  {
    qid: 'q1', number: 1, question: 'When?', questionType: 'gap',
    key: '2021', user: '2020', instruction: '',
    judgeType: 'gap', correct: false, errors: ['MISMATCH'], ruleReason: 'locating-failed', reasonId: 'locating-failed',
  },
]

beforeEach(() => localStorage.clear())

describe('复盘入库与间隔复习联动', () => {
  test('保存复盘后，新错题今天到期；导出含 SR 状态；清空后消失', () => {
    const created = persistMistakes('reading', ITEMS, { sourceLabel: '剑18 Test 1' })
    persistSession({ id: 'rs1', module: 'reading', sourceLabel: '剑18 Test 1', total: 4, correct: 1, reasonStats: {}, mistakeIds: created.map((m) => m.id), createdAt: Date.now() })
    const due = dueItems().filter((i) => i.kind === 'mistake')
    expect(due.length).toBe(1)
    expect(due[0].dueAt).toBeLessThanOrEqual(Date.now() + 1000)

    const pack = exportIeltsData()
    expect(pack.spacedRepetition).toBeTruthy()
    expect(Object.keys(pack.spacedRepetition)).toHaveLength(1)

    clearIeltsData()
    expect(dueItems()).toEqual([])
    expect(exportIeltsData().spacedRepetition).toEqual({})
  })
})

import { aggregateReasons } from './reviewSession.js'

describe('错因统计', () => {
  test('未归因条目不产生 unclassified 桶', () => {
    const stats = aggregateReasons([
      { correct: false, reasonId: 'locating-failed' },
      { correct: true, reasonId: '' },
      { correct: false, reasonId: '' },
    ])
    expect(stats).toEqual({ 'locating-failed': 1 })
  })
})
