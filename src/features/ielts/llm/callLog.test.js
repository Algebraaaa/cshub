import { describe, test, expect, beforeEach } from 'vitest'
import {
  fnv1a, buildLogEntry, getCallLogs, recordCall, clearCallLogs, buildReproPack, CALL_LOG_KEY,
} from './callLog.js'

beforeEach(() => localStorage.clear())

describe('脱敏调用日志', () => {
  test('只记录结构信号，不含原文/key/输出正文', () => {
    const entry = buildLogEntry({
      templateId: 'reading-explain',
      version: 1,
      result: {
        status: 'ok', simulated: false, evidenceOk: true,
        validationErrors: [], evidenceFields: ['locationQuote'],
        data: { locationQuote: 'The museum closed in 1998', whyKeyCorrect: '秘密答案 42' },
      },
      variables: { passage: 'The museum closed in 1998.', keyAnswer: '1998', apiKey: 'sk-secret' },
      provider: 'deepseek',
      ms: 120,
    })
    const dumped = JSON.stringify(entry)
    expect(dumped).not.toContain('The museum')
    expect(dumped).not.toContain('秘密答案')
    expect(dumped).not.toContain('sk-secret')
    expect(entry).toMatchObject({
      templateId: 'reading-explain', version: 1, status: 'ok',
      simulated: false, evidenceOk: true, provider: 'deepseek', ms: 120,
      inputVarNames: expect.arrayContaining(['passage']),
      outputKeys: expect.arrayContaining(['locationQuote']),
    })
    expect(entry.inputChars).toBeGreaterThan(0)
    expect(entry.outputHash).toMatch(/^[0-9a-f]{8}$/)
  })

  test('同内容同哈希、不同内容不同哈希（可复现比对）', () => {
    const a = fnv1a(JSON.stringify({ x: 1 }))
    const b = fnv1a(JSON.stringify({ x: 1 }))
    const c = fnv1a(JSON.stringify({ x: 2 }))
    expect(a).toBe(b)
    expect(a).not.toBe(c)
  })

  test('记录持久化且超过 400 条自动截断', () => {
    for (let i = 0; i < 405; i++) {
      recordCall(buildLogEntry({
        templateId: 'reading-explain', version: 1,
        result: { status: 'mock', simulated: true, evidenceOk: true, data: { i } },
        variables: {}, provider: '', ms: 1, ts: i + 1,
      }))
    }
    const logs = getCallLogs()
    expect(logs.length).toBe(400)
    expect(logs[0].ts).toBe(6)
    expect(logs.at(-1).ts).toBe(405)
  })

  test('证据失败与校验错误进入日志，复现包含模板结构', () => {
    recordCall(buildLogEntry({
      templateId: 'listening-explain', version: 1,
      result: {
        status: 'invalid-output', simulated: false, evidenceOk: false,
        validationErrors: ['locationQuote 必须是非空字符串'],
        evidenceFields: ['locationQuote'],
        data: null,
      },
      variables: { transcript: 'x'.repeat(100) }, provider: 'proxy', ms: 30,
    }))
    const pack = buildReproPack([{
      id: 'listening-explain', version: 1,
      variables: ['transcript'], evidenceSourceVar: 'transcript',
      evidenceFields: ['locationQuote'], outputSchema: { locationQuote: 'string' },
    }])
    expect(pack.logs[0].status).toBe('invalid-output')
    expect(pack.logs[0].validationErrors[0]).toContain('locationQuote')
    expect(pack.templates[0]).toMatchObject({ id: 'listening-explain', version: 1 })
    expect(JSON.stringify(pack)).not.toContain('x'.repeat(50))
    expect(clearCallLogs()).toBeUndefined()
    expect(getCallLogs().length).toBe(0)
    expect(CALL_LOG_KEY).toBeTruthy()
  })
})
