import { test, expect } from 'vitest'
import { escapeHtml, isSafeHttpUrl, renderLimitedMarkdown } from './safeHtml.js'

test('escapes raw html before rendering markdown', () => {
  const html = renderLimitedMarkdown('<img src=x onerror=alert(1)> **ok**')
  expect(html).toMatch(/&lt;img src=x onerror=alert\(1\)&gt;/)
  expect(html).toMatch(/<strong>ok<\/strong>/)
})

test('allows only http and https links', () => {
  expect(isSafeHttpUrl('https://example.com')).toBe(true)
  expect(isSafeHttpUrl('http://example.com')).toBe(true)
  expect(isSafeHttpUrl('javascript:alert')).toBe(false)
  expect(renderLimitedMarkdown('[x](javascript:alert)')).toBe('<p>x</p>')
})

test('escapes text utility consistently', () => {
  expect(escapeHtml('a < b && c > d')).toBe('a &lt; b &amp;&amp; c &gt; d')
})
