import { test, expect } from 'vitest'
import {
  computeVariableSchema,
  extractVariableMap,
  extractStepVariables,
  formatStepValue,
  normalizeStepVariables,
} from './stepProtocol.js'

test('extracts primitive variables and skips large render fields', () => {
  const variables = extractVariableMap({
    description: 'compare two items',
    array: [5, 3, 1],
    i: 1,
    j: 2,
    found: false,
  })
  expect(variables.get('i').value).toBe('1')
  expect(variables.get('j').value).toBe('2')
  expect(variables.get('found').value).toBe('false')
  expect(variables.has('array')).toBe(false)
})

test('summarizes large arrays without flooding the panel', () => {
  expect(formatStepValue([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe('[1, 2, 3, 4, 5, 6, 7, 8, ... (9)]')
})

test('summarizes matrices with dimensions when they are large', () => {
  const matrix = Array.from({ length: 4 }, () => Array.from({ length: 6 }, (_, i) => i))
  expect(formatStepValue(matrix)).toBe('4x6 matrix')
})

test('formats small matrices inline', () => {
  expect(formatStepValue([[1, 2], [3, 4]])).toBe('[1, 2] [3, 4]')
})

test('formats Set values as compact collections', () => {
  expect(formatStepValue(new Set([1, 2, 3]))).toBe('Set([1, 2, 3])')
})

test('formats small objects and summarizes wide objects', () => {
  expect(formatStepValue({ a: 1, b: true })).toBe('{ a: 1, b: true }')
  expect(formatStepValue({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7 })).toBe('{ 7 keys }')
})

test('handles empty or missing step data safely', () => {
  expect(extractStepVariables(null)).toEqual([])
  expect(normalizeStepVariables(undefined)).toEqual({})
  expect(computeVariableSchema([])).toEqual([])
})

test('keeps variable schema stable and capped', () => {
  const schema = computeVariableSchema([
    { phase: 'scan', i: 0, j: 1, minIdx: 0 },
    { i: 1, j: 2, minIdx: 1, key: 4, pivot: 3, current: 2, queue: [1, 2], custom: 'x' },
  ], 5)
  expect(schema).toEqual(['phase', 'i', 'j', 'minIdx', 'key'])
})
