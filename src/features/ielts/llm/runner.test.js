// 模板调用关键路径：缺变量、无 key 模拟、坏模板 id、输出不合规、
// 引用证据校验失败、合法输出成功（重试一次后仍失败的明确状态）。
import { describe, test, expect, vi, afterEach } from 'vitest'
import { runTemplate, checkVariables } from './runner.js'
import { getTemplate } from './templates.js'
import { TEMPLATES, TEMPLATE_IDS } from './templates.js'

const PASSAGE = 'The museum closed in 1998 because the council cut its funding.'
const baseVars = {
  passage: PASSAGE,
  question: 'When did the museum close?',
  questionType: 'gap',
  keyAnswer: '1998',
  userAnswer: '2001',
  judge: { correct: false, errors: ['MISMATCH'] },
  sourceLabel: 'ut',
}

afterEach(() => vi.restoreAllMocks())

describe('模板 mock 自洽', () => {
  test('每个模板的 mock 输出都通过自己的 validator/evidence', () => {
    const vars = {
      ...baseVars,
      transcript: PASSAGE,
      module: 'reading',
      correctCount: 1, totalCount: 2,
      reasonStats: { 'locating-failed': 1 },
      questions: [],
      stepId: 't1-intro', prompt: 'p', text: 'hello world this is a short text',
      knowledge: '', targetBand: '6.5', strictness: 'standard',
      level: '6.5',
      chinese: '尽管难，他还是完成了。', referenceEnglish: 'Although it was hard, he finished.',
      userTranslation: 'Though hard, he finished it.',
      part: '1', topic: 'cooking', part2Topic: 'cooking',
      answer: 'I like cooking very much, I often cook at weekend with my family.',
    }
    for (const id of TEMPLATE_IDS) {
      const t = TEMPLATES[id]
      const out = t.mock(vars)
      const errors = t.validate(out)
      expect(errors, `${id} mock 不合法: ${errors.join('；')}`).toEqual([])
      if (typeof t.verifyOutput === 'function') {
        const ev = t.verifyOutput(out, vars)
        expect(ev.ok, `${id} mock 证据校验失败: ${ev.missing.join('|')}`).toBe(true)
      }
    }
  })
})

describe('runTemplate 状态机', () => {
  test('未知模板 id → bad-template', async () => {
    const r = await runTemplate('nope', {}, { apiKey: 'k' })
    expect(r.status).toBe('bad-template')
  })

  test('缺变量 → missing-vars（含字段名）', async () => {
    const r = await runTemplate('reading-explain', { question: 'x' }, { apiKey: 'k' })
    expect(r.status).toBe('missing-vars')
    expect(r.reason).toContain('passage')
  })

  test('checkVariables 把空字符串视作缺失', () => {
    const missing = checkVariables(getTemplate('reading-explain'), { ...baseVars, passage: '   ' })
    expect(missing).toContain('passage')
  })

  test('无 key → mock，醒目标 simulated，且不触网', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const r = await runTemplate('reading-explain', baseVars, { apiKey: '' })
    expect(r.status).toBe('mock')
    expect(r.simulated).toBe(true)
    expect(r.data.whyKeyCorrect).toContain('模拟反馈')
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(r.preview.length).toBe(2) // 发送预览可用
  })

  test('模型连续两次返回不合规 JSON → invalid-output（重试一次）', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(
      JSON.stringify({ choices: [{ message: { content: 'not json at all' } }] }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    ))
    const r = await runTemplate('reading-explain', baseVars, {
      apiKey: 'k', baseUrl: 'https://example.test/chat/completions', model: 'm',
    })
    expect(r.status).toBe('invalid-output')
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  test('引用不是原文逐字子串 → 证据失败，重试后仍失败', async () => {
    const bad = {
      locationQuote: 'the museum opened in 2001',
      paraphrases: [], whyKeyCorrect: 'x', whyUserWrong: 'y',
      suggestedReasonId: 'locating-failed',
    }
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(
      JSON.stringify({ choices: [{ message: { content: JSON.stringify(bad) } }] }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    ))
    const r = await runTemplate('reading-explain', baseVars, {
      apiKey: 'k', baseUrl: 'https://example.test/chat/completions', model: 'm',
    })
    expect(r.status).toBe('invalid-output')
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  test('合法输出且引用逐字命中 → ok', async () => {
    const good = {
      locationQuote: 'The museum closed in 1998',
      paraphrases: [], whyKeyCorrect: '原文明确给出 1998。', whyUserWrong: '你写成了 2001。',
      tfngNote: '', suggestedReasonId: 'locating-failed',
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(
      JSON.stringify({ choices: [{ message: { content: JSON.stringify(good) } }] }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    ))
    const r = await runTemplate('reading-explain', baseVars, {
      apiKey: 'k', baseUrl: 'https://example.test/chat/completions', model: 'm',
    })
    expect(r.status).toBe('ok')
    expect(r.simulated).toBe(false)
    expect(r.evidenceOk).toBe(true)
  })

  test('HTTP 错误（401）→ http-error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('bad key', { status: 401 }))
    const r = await runTemplate('reading-explain', baseVars, {
      apiKey: 'k', baseUrl: 'https://example.test/chat/completions', model: 'm',
    })
    expect(r.status).toBe('http-error')
    expect(r.reason).toContain('401')
  })
})
