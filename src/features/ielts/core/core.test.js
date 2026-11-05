// 第十一节公开接口的单元测试：错误码、字数要求、判题、换算锚点、
// 取整规则、引用校验、训练路径解锁。
import { describe, test, expect } from 'vitest'
import {
  ERROR_CODES,
  validateAnswerFormat,
  judgeAnswer,
  rawToBand,
  overallBand,
  writingBand,
  speakingBand,
  verifyEvidence,
  getWritingLadder,
  canStart,
  ERROR_REASONS,
  errorCodeToReason,
  parseAnswerBlock,
} from './index.js'

// ── ERROR_CODES：六个常量且值稳定（错因统计依赖这些字符串） ──
describe('ERROR_CODES', () => {
  test('恰好六个固定常量', () => {
    expect(Object.keys(ERROR_CODES).sort()).toEqual(
      ['EMPTY', 'MISMATCH', 'PLURAL', 'SPELLING', 'WORD_LIMIT', 'WRONG_LABEL_SET'].sort(),
    )
    expect(ERROR_CODES.EMPTY).toBe('EMPTY')
  })
  test('每种错误码都能在判题中真实产生', () => {
    expect(judgeAnswer({ type: 'gap', key: 'museum' }, '').errors).toEqual([ERROR_CODES.EMPTY])
    expect(judgeAnswer(
      { type: 'gap', key: 'museum', instruction: 'ONE WORD ONLY' }, 'old wooden museum').errors,
    ).toEqual([ERROR_CODES.WORD_LIMIT])
    expect(judgeAnswer({ type: 'gap', key: 'museum' }, 'museums').errors).toEqual([ERROR_CODES.PLURAL])
    expect(judgeAnswer({ type: 'gap', key: 'museum' }, 'museam').errors).toEqual([ERROR_CODES.SPELLING])
    expect(judgeAnswer({ type: 'tfng', key: 'TRUE' }, 'YES').errors).toEqual([ERROR_CODES.WRONG_LABEL_SET])
    expect(judgeAnswer({ type: 'tfng', key: 'TRUE' }, 'FALSE').errors).toEqual([ERROR_CODES.MISMATCH])
  })
})

// ── validateAnswerFormat：每种字数要求 ──
describe('validateAnswerFormat', () => {
  const cases = [
    ['ONE WORD ONLY', 'museum', true],
    ['ONE WORD ONLY', 'two words', false],
    ['ONE WORD ONLY', '15', false],
    ['ONE WORD AND/OR A NUMBER', '15', true],
    ['ONE WORD AND/OR A NUMBER', 'desk 15', true],
    ['ONE WORD AND/OR A NUMBER', 'two words 15', false],
    ['NO MORE THAN TWO WORDS', 'old museum', true],
    ['NO MORE THAN TWO WORDS', 'the old museum', false],
    ['NO MORE THAN TWO WORDS AND/OR A NUMBER', '15 old books', true],
    ['NO MORE THAN TWO WORDS AND/OR A NUMBER', '15 very old books', false],
    ['NO MORE THAN THREE WORDS', 'one two three', true],
    ['NO MORE THAN THREE WORDS', 'one two three four', false],
    ['NO MORE THAN THREE WORDS AND/OR A NUMBER', '15 one two three', true],
    ['NO MORE THAN THREE WORDS AND/OR A NUMBER', '15 one two three four', false],
    ['A NUMBER', '15', true],
    ['A NUMBER', 'fifteen', true],
    ['A NUMBER', 'three hundred and twenty', true],
    ['A NUMBER', 'one two three', false],
    ['A NUMBER', 'cat', false],
  ]
  for (const [instruction, answer, ok] of cases) {
    test(`${instruction} · "${answer}" → ${ok}`, () => {
      expect(validateAnswerFormat(answer, instruction).ok).toBe(ok)
    })
  }
  test('大小写不敏感 + 空答案', () => {
    expect(validateAnswerFormat('museum', 'one word only').ok).toBe(true)
    expect(validateAnswerFormat('', 'ONE WORD ONLY')).toMatchObject({ ok: false, words: 0, numbers: 0 })
    expect(validateAnswerFormat('', 'ONE WORD ONLY').violations).toEqual([ERROR_CODES.EMPTY])
  })
  test('连字符词算一个词；千分位数字算数字', () => {
    const r = validateAnswerFormat('water-proof jacket', 'NO MORE THAN TWO WORDS')
    expect(r).toMatchObject({ ok: true, words: 2 })
    expect(validateAnswerFormat('1,200', 'A NUMBER')).toMatchObject({ ok: true, numbers: 1 })
  })
})

// ── judgeAnswer ──
describe('judgeAnswer · gap', () => {
  test('"/" 可接受写法与圆括号可省略部分', () => {
    const q = { type: 'gap', key: '(the) museum/colour/color' }
    expect(judgeAnswer(q, 'museum').correct).toBe(true)
    expect(judgeAnswer(q, 'the museum').correct).toBe(true)
    expect(judgeAnswer(q, 'colour').correct).toBe(true)
    expect(judgeAnswer(q, 'color').correct).toBe(true)
  })
  test('key 支持数组', () => {
    expect(judgeAnswer({ type: 'gap', key: ['car', 'cars'] }, 'cars').correct).toBe(true)
  })
  test('大小写与首尾标点不影响', () => {
    expect(judgeAnswer({ type: 'gap', key: 'John Smith' }, '  john  smith! ').correct).toBe(true)
  })
  test('超字数直接判错，即使词形接近', () => {
    const r = judgeAnswer({ type: 'gap', key: 'museum', instruction: 'ONE WORD ONLY' }, 'a museum')
    expect(r).toEqual({ correct: false, errors: [ERROR_CODES.WORD_LIMIT] })
  })
  test('单复数：去/加 s、es、y↔ies', () => {
    expect(judgeAnswer({ type: 'gap', key: 'box' }, 'boxes').errors).toEqual([ERROR_CODES.PLURAL])
    expect(judgeAnswer({ type: 'gap', key: 'city' }, 'cities').errors).toEqual([ERROR_CODES.PLURAL])
    expect(judgeAnswer({ type: 'gap', key: 'cities' }, 'city').errors).toEqual([ERROR_CODES.PLURAL])
    expect(judgeAnswer({ type: 'gap', key: 'car parks' }, 'car park').errors).toEqual([ERROR_CODES.PLURAL])
  })
  test('拼写：编辑距离 1–2 归 SPELLING', () => {
    expect(judgeAnswer({ type: 'gap', key: 'museum' }, 'musea').errors).toEqual([ERROR_CODES.SPELLING])
    expect(judgeAnswer({ type: 'gap', key: 'accommodation' }, 'acomodation').errors).toEqual([ERROR_CODES.SPELLING])
  })
  test('完全不相干 → MISMATCH', () => {
    expect(judgeAnswer({ type: 'gap', key: 'museum' }, 'swimming pool').errors).toEqual([ERROR_CODES.MISMATCH])
  })
})

describe('judgeAnswer · 判断题', () => {
  test('大小写不敏感、完整单词判对', () => {
    expect(judgeAnswer({ type: 'tfng', key: 'NOT GIVEN' }, 'not given').correct).toBe(true)
    expect(judgeAnswer({ type: 'ynng', key: 'YES' }, 'yes').correct).toBe(true)
  })
  test('标签体系用错 → WRONG_LABEL_SET', () => {
    expect(judgeAnswer({ type: 'tfng', key: 'FALSE' }, 'NO').errors).toEqual([ERROR_CODES.WRONG_LABEL_SET])
    expect(judgeAnswer({ type: 'ynng', key: 'YES' }, 'TRUE').errors).toEqual([ERROR_CODES.WRONG_LABEL_SET])
  })
  test('NOT GIVEN 在两套题里都合法', () => {
    expect(judgeAnswer({ type: 'tfng', key: 'NOT GIVEN' }, 'NOT GIVEN').correct).toBe(true)
    expect(judgeAnswer({ type: 'ynng', key: 'NOT GIVEN' }, 'NOT GIVEN').correct).toBe(true)
  })
  test('T/F/NG 缩写不接受（官方无说明，见 RULES.md）', () => {
    expect(judgeAnswer({ type: 'tfng', key: 'TRUE' }, 'T').errors).toEqual([ERROR_CODES.MISMATCH])
    expect(judgeAnswer({ type: 'tfng', key: 'NOT GIVEN' }, 'NG').errors).toEqual([ERROR_CODES.MISMATCH])
  })
})

describe('judgeAnswer · 选择与匹配', () => {
  test('单选字母大小写不敏感', () => {
    expect(judgeAnswer({ type: 'mcq', key: 'B' }, 'b').correct).toBe(true)
    expect(judgeAnswer({ type: 'mcq', key: 'B' }, 'C').errors).toEqual([ERROR_CODES.MISMATCH])
  })
  test('多选集合相等（分隔符任意、顺序无关）', () => {
    const q = { type: 'mcq-multi', key: ['B', 'D'] }
    expect(judgeAnswer(q, 'B D').correct).toBe(true)
    expect(judgeAnswer(q, 'd,b').correct).toBe(true)
    expect(judgeAnswer(q, 'BD').correct).toBe(true)
    expect(judgeAnswer(q, 'B').errors).toEqual([ERROR_CODES.MISMATCH])
    expect(judgeAnswer(q, 'B C D').errors).toEqual([ERROR_CODES.MISMATCH])
  })
  test('匹配（罗马数字/字母）精确比较', () => {
    expect(judgeAnswer({ type: 'matching', key: 'iii' }, 'III').correct).toBe(true)
    expect(judgeAnswer({ type: 'matching', key: 'B' }, 'D').errors).toEqual([ERROR_CODES.MISMATCH])
  })
})

// ── 换算锚点（官方公布的最低原始分） ──
describe('rawToBand 官方锚点', () => {
  test('listening 锚点', () => {
    const pairs = [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6],
      [18, 5.5], [16, 5], [13, 4.5], [11, 4], [8, 3.5], [6, 3], [4, 2.5]]
    for (const [raw, band] of pairs) expect(rawToBand('listening', raw)).toBe(band)
    expect(rawToBand('listening', 40)).toBe(9)
  })
  test('academic reading 锚点', () => {
    const pairs = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6],
      [20, 5.5], [17, 5], [15, 5], [14, 4.5], [11, 4], [8, 3.5], [6, 3], [4, 2.5]]
    for (const [raw, band] of pairs) expect(rawToBand('reading-academic', raw)).toBe(band)
  })
  test('general training reading 锚点', () => {
    const pairs = [[40, 9], [39, 8.5], [37, 8], [36, 7.5], [34, 7], [32, 6.5], [30, 6],
      [27, 5.5], [23, 5], [19, 4.5], [15, 4], [12, 3.5], [9, 3], [6, 2.5]]
    for (const [raw, band] of pairs) expect(rawToBand('reading-general', raw)).toBe(band)
  })
  test('0.5 一档：阈值之间取低档', () => {
    expect(rawToBand('listening', 38)).toBe(8.5)
    expect(rawToBand('listening', 36)).toBe(8)
  })
  test('非法输入抛错；raw 取整', () => {
    expect(() => rawToBand('speaking', 30)).toThrow(RangeError)
    expect(() => rawToBand('listening', 41)).toThrow(RangeError)
    expect(() => rawToBand('listening', -1)).toThrow(RangeError)
    expect(rawToBand('listening', '30')).toBe(7)
  })
})

describe('overall / writing / speaking band 取整', () => {
  test('总分：.25 上进 .5、.75 上进整分', () => {
    expect(overallBand({ listening: 6.5, reading: 6.5, writing: 5.5, speaking: 6.5 })).toBe(6.5)
    expect(overallBand({ listening: 6.5, reading: 6.5, writing: 6, speaking: 6 })).toBe(6.5) // 6.25
    expect(overallBand({ listening: 7, reading: 7, writing: 6, speaking: 7 })).toBe(7) // 6.75
    expect(overallBand({ listening: 9, reading: 9, writing: 9, speaking: 9 })).toBe(9)
  })
  test('写作：Task2 权重两倍（官方口径）', () => {
    const b = writingBand({
      task1: { ta: 6, cc: 6, lr: 6, gra: 6 },
      task2: { tr: 7, cc: 7, lr: 7, gra: 7 },
    })
    // (6 + 14)/3 = 6.667 → 6.5
    expect(b).toBe(6.5)
    expect(writingBand({
      task1: { ta: 7, cc: 7, lr: 7, gra: 7 },
      task2: { tr: 7, cc: 7, lr: 7, gra: 7 },
    })).toBe(7)
  })
  test('口语：四项等权；缺发音分必须抛错，不允许编造', () => {
    expect(speakingBand({ fc: 6, lr: 7, gra: 6, p: 7 })).toBe(6.5)
    expect(() => speakingBand({ fc: 6, lr: 7, gra: 6 })).toThrow()
  })
})

// ── verifyEvidence ──
describe('verifyEvidence', () => {
  const passage = 'The museum was closed in 1998, when the council cut its funding.'
  test('逐字命中（空白/大小写归一化）', () => {
    expect(verifyEvidence(passage, ['The museum was closed in 1998']).ok).toBe(true)
    expect(verifyEvidence(passage, ['  the  museum was closed in   1998 ']).ok).toBe(true)
  })
  test('杜撰引用进 missing', () => {
    const r = verifyEvidence(passage, ['the museum opened in 2001'])
    expect(r.ok).toBe(false)
    expect(r.missing).toEqual(['the museum opened in 2001'])
  })
  test('多条混合', () => {
    const r = verifyEvidence(passage, ['when the council cut its funding', 'totally made up quote'])
    expect(r.ok).toBe(false)
    expect(r.missing).toEqual(['totally made up quote'])
  })
})

// ── 训练路径解锁 ──
describe('writing ladder', () => {
  test('固定 11 个练习项', () => {
    expect(getWritingLadder().map((i) => i.id)).toEqual([
      't1-intro', 't1-overview', 't1-body', 'mock-t1',
      't2-intro', 't2-conclusion', 't2-outline', 't2-body', 'mock-t2',
      'mock-full', 'translation',
    ])
  })
  test('Task1 链式解锁', () => {
    expect(canStart({ completed: [] }, 't1-intro')).toBe(true)
    expect(canStart({ completed: [] }, 't1-overview')).toBe(false)
    expect(canStart({ completed: ['t1-intro'] }, 't1-overview')).toBe(true)
    expect(canStart({ completed: ['t1-intro', 't1-overview'] }, 't1-body')).toBe(true)
    expect(canStart({ completed: ['t1-intro', 't1-overview'] }, 'mock-t1')).toBe(false)
    expect(canStart({ completed: ['t1-intro', 't1-overview', 't1-body'] }, 'mock-t1')).toBe(true)
  })
  test('Task2：intro 与 conclusion 都完成才解锁 outline', () => {
    expect(canStart({ completed: [] }, 't2-outline')).toBe(false)
    expect(canStart({ completed: ['t2-intro'] }, 't2-outline')).toBe(false)
    expect(canStart({ completed: ['t2-intro', 't2-conclusion'] }, 't2-outline')).toBe(true)
    expect(canStart({ completed: ['t2-intro', 't2-conclusion', 't2-outline'] }, 't2-body')).toBe(true)
    expect(canStart({ completed: ['t2-intro', 't2-conclusion', 't2-outline', 't2-body'] }, 'mock-t2')).toBe(true)
  })
  test('mock-full 需要两篇 mock 都完成', () => {
    expect(canStart({ completed: ['mock-t1'] }, 'mock-full')).toBe(false)
    expect(canStart({ completed: ['mock-t1', 'mock-t2'] }, 'mock-full')).toBe(true)
  })
  test('translation 随时可练；未知 id 为 false', () => {
    expect(canStart({ completed: [] }, 'translation')).toBe(true)
    expect(canStart({ completed: [] }, 'nope')).toBe(false)
    expect(canStart(undefined, 't1-intro')).toBe(false)
  })
})

describe('固定错因表', () => {
  test('阅读/听力错因齐全', () => {
    const ids = ERROR_REASONS.map((r) => r.id)
    for (const id of ['locating-failed', 'paraphrase-missed', 'over-inference', 'tfng-confusion',
      'task-type-misread', 'spelling-format', 'plural', 'word-limit', 'ran-out-of-time',
      'missed-audio', 'paraphrase-audio-missed', 'distractor-correction', 'number-time-date',
      'connected-speech', 'unknown-vocab']) {
      expect(ids).toContain(id)
    }
  })
  test('规则错因映射', () => {
    expect(errorCodeToReason(ERROR_CODES.PLURAL)).toBe('plural')
    expect(errorCodeToReason(ERROR_CODES.WORD_LIMIT)).toBe('word-limit')
    expect(errorCodeToReason(ERROR_CODES.SPELLING)).toBe('spelling-format')
    expect(errorCodeToReason(ERROR_CODES.WRONG_LABEL_SET)).toBe('spelling-format')
    expect(errorCodeToReason(ERROR_CODES.MISMATCH)).toBeNull()
  })
})

describe('粘贴拆题', () => {
  test('带题号答案册', () => {
    const map = parseAnswerBlock('1. TRUE\n2. FALSE\n3. NOT GIVEN')
    expect(map[1]).toBe('TRUE')
    expect(map[3]).toBe('NOT GIVEN')
  })
  test('无题号按行顺序', () => {
    const map = parseAnswerBlock('TRUE\nFALSE\nNOT GIVEN')
    expect(map[2]).toBe('FALSE')
  })
})
