import { test, expect } from 'vitest'
import { ALGORITHM_LIST, ALGORITHMS, CATEGORIES, getAlgorithmsByCategory, getAlgorithmMeta } from './algorithmMeta.js'

test('algorithm metadata exposes the catalog without executable payloads', () => {
  expect(ALGORITHM_LIST.length).toBeGreaterThan(40)
  const bubble = getAlgorithmMeta('bubblesort')
  expect(bubble).toBe(ALGORITHMS.bubblesort)
  expect(bubble.name).toBe('冒泡排序')
  expect(typeof bubble.fn).toBe('undefined')
  expect(typeof bubble.code).toBe('undefined')
  expect(typeof bubble.intuition).toBe('undefined')
})

test('algorithm metadata keeps category lookups usable for list views', () => {
  expect(CATEGORIES.sorting.name).toBe('排序算法')
  const sorting = getAlgorithmsByCategory('sorting')
  expect(sorting.some(algo => algo.slug === 'quicksort')).toBe(true)
  expect(sorting.every(algo => algo.category === 'sorting')).toBe(true)
})
