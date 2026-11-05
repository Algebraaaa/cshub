import { afterEach, describe, expect, test, vi } from 'vitest'
import handler from '../../../../api/ielts/llm.js'

const request = (body) => new Request('https://example.test/api/ielts/llm', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ templateId: 'reading-explain', apiKey: 'test-key', ...body }),
})

afterEach(() => vi.restoreAllMocks())

describe('IELTS proxy upstream restrictions', () => {
  test.each(['https://127.0.0.1/', 'https://api.deepseek.com.attacker.test/', 'https://api.deepseek.com/chat/completions?redirect=x'])(
    'rejects an untrusted upstream %s without issuing a request', async (baseUrl) => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      const response = await handler(request({ baseUrl }))
      expect(response.status).toBe(400)
      expect(fetchSpy).not.toHaveBeenCalled()
    },
  )

  test('disallows redirects from an approved upstream', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
    const response = await handler(request({ variables: { passage: 'Sample.', question: 'Q?', answerKey: 'A', userAnswer: 'B', questionType: 'gap' } }))
    expect(response.status).toBe(200)
    expect(fetchSpy.mock.calls[0][1].redirect).toBe('error')
  })
})
