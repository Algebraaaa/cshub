// 错题统一存储：老键无损迁移 + 算法/雅思 CRUD
import { describe, test, expect, beforeEach } from 'vitest'
import {
  migrateInto,
  recordAlgoQuiz,
  deleteAlgoMistake,
  getAlgoWrongMap,
  addIeltsMistake,
  updateIeltsMistake,
  deleteIeltsMistake,
  listIeltsMistakes,
  clearIeltsMistakes,
  MISTAKE_KEY,
  MIGRATION_FLAG,
  LEGACY_WRONG_KEY,
  LEGACY_QUIZ_KEY,
  getMistakeState,
} from './mistakeStore'

beforeEach(() => {
  localStorage.clear()
})

describe('老数据无损迁移（纯函数）', () => {
  test('两个老键合并进 algo，wrongIndices 以错题键为准', () => {
    const state = { version: 1, algo: {}, ielts: [] }
    const migrated = migrateInto(
      state,
      { quicksort: [0, 2], bfs: [1] },
      { quicksort: { correct: 1, total: 3, lastAt: 100 } },
    )
    expect(migrated.algo.quicksort).toEqual({ wrongIndices: [0, 2], correct: 1, total: 3, lastAt: 100 })
    expect(migrated.algo.bfs).toEqual({ wrongIndices: [1], correct: undefined, total: undefined, lastAt: undefined })
  })
  test('只有 quiz 分数、没有错题索引时不丢分数', () => {
    const migrated = migrateInto({ version: 1, algo: {}, ielts: [] }, {}, { dfs: { correct: 3, total: 3, lastAt: 5 } })
    expect(migrated.algo.dfs).toMatchObject({ correct: 3, total: 3 })
    expect(migrated.algo.dfs.wrongIndices).toEqual([])
  })
  test('已有新数据不被覆盖（幂等再来一遍也安全）', () => {
    const once = migrateInto({ version: 1, algo: {}, ielts: [] }, { a: [1] }, { a: { correct: 2, total: 3 } })
    const twice = migrateInto(once, { a: [1] }, { a: { correct: 2, total: 3 } })
    expect(twice.algo.a).toEqual(once.algo.a)
  })
})

describe('DOM 迁移路径', () => {
  test('首次访问自动迁移，老键保留，重复访问不重做', () => {
    localStorage.setItem(LEGACY_WRONG_KEY, JSON.stringify({ quicksort: [1] }))
    localStorage.setItem(LEGACY_QUIZ_KEY, JSON.stringify({ quicksort: { correct: 2, total: 3, lastAt: 9 } }))
    const state = getMistakeState()
    expect(state.algo.quicksort).toMatchObject({ wrongIndices: [1], correct: 2, total: 3 })
    expect(localStorage.getItem(LEGACY_WRONG_KEY)).not.toBeNull() // 老键不删
    expect(localStorage.getItem(MIGRATION_FLAG)).not.toBeNull()
    const saved = JSON.parse(localStorage.getItem(MISTAKE_KEY))
    expect(saved.algo.quicksort.wrongIndices).toEqual([1])
  })
})

describe('算法错题写入（兼容旧组件用法）', () => {
  test('全对清空该 slug；getAlgoWrongMap 形状与旧键一致', () => {
    recordAlgoQuiz('bfs', { correct: 3, total: 3, wrongIndices: [] })
    expect(getAlgoWrongMap().bfs).toBeUndefined()
    recordAlgoQuiz('bfs', { correct: 1, total: 3, wrongIndices: [0, 2] })
    expect(getAlgoWrongMap().bfs).toEqual([0, 2])
    deleteAlgoMistake('bfs')
    expect(getAlgoWrongMap().bfs).toBeUndefined()
  })
})

describe('雅思错题 CRUD', () => {
  test('增改删与清空', () => {
    const rec = addIeltsMistake({
      module: 'reading', questionType: 'tfng', sourceLabel: '原创示例 P1',
      questionSummary: '第 1 题', userAnswer: 'YES', keyAnswer: 'FALSE',
      reasonId: 'spelling-format', reasonSource: 'rule',
      locationQuote: '', explanation: '标签体系用错', reflection: '',
    })
    expect(rec.id).toMatch(/^im-/)
    expect(listIeltsMistakes()).toHaveLength(1)
    updateIeltsMistake(rec.id, { reasonId: 'tfng-confusion', reasonSource: 'model' })
    expect(listIeltsMistakes()[0].reasonId).toBe('tfng-confusion')
    expect(deleteIeltsMistake(rec.id)).toBe(true)
    expect(listIeltsMistakes()).toHaveLength(0)
    addIeltsMistake({ module: 'listening' })
    clearIeltsMistakes()
    expect(listIeltsMistakes()).toHaveLength(0)
  })
})
