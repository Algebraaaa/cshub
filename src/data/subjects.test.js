import { test, expect } from 'vitest'
import { ALGORITHM_LIST } from './algorithmMeta.js'
import { CATEGORY_TO_SUBJECT, SUBJECTS } from './subjects.js'

test('CATEGORY_TO_SUBJECT is derived from SUBJECTS[].categories', () => {
  const expected = Object.fromEntries(
    Object.values(SUBJECTS).flatMap(s => (s.categories || []).map(c => [c, s.id]))
  )
  expect(CATEGORY_TO_SUBJECT).toEqual(expected)
})

test('every category used by an algorithm is registered to some subject', () => {
  const usedCategories = new Set(ALGORITHM_LIST.map(a => a.category).filter(Boolean))
  const unmapped = [...usedCategories].filter(c => !(c in CATEGORY_TO_SUBJECT))
  expect(unmapped).toEqual([], `categories without subject mapping: ${unmapped.join(', ')}`)
})
