// 排序算法边界正确性回归
//
// 补上"结果正确性"这一层：冒烟只保证不崩，这里保证"排完真的有序、
// 长度守恒"。按每个算法 playground 实际允许的输入域测：
//   - 所有排序：非负整数域（含 0、空、单元素、重复、逆序、较大集）
//   - 负数域：只测 UI 放行负数（positiveOnly=false）且算法支持的
//     （radix 已修、bucket、heapsort）；计数排序 UI 挡负数，不在此列
//
// 这类测试本可提前抓到 radix 负数崩溃 bug。
import { describe, test, expect } from 'vitest'
import { SORTING_ALGORITHMS } from './algorithms/sorting.js'

const algos = Object.values(SORTING_ALGORITHMS).filter(a => a.category === 'sorting')

// 从末步稳健提取最终数组（各 viz 存法不同：原始值 / {id,value} 对象）。
// quicksort/mergesort 为追踪元素身份，数组里存的是 { id, value } 对象。
const normalize = (arr) => arr.map(x => (x && typeof x === 'object' && 'value' in x ? x.value : x))
function finalArray(steps) {
  const last = steps[steps.length - 1]
  if (Array.isArray(last.array)) return normalize(last.array)
  if (Array.isArray(last.arr)) return normalize(last.arr)
  if (Array.isArray(last.output)) return normalize(last.output)
  return null
}

const NONNEG_INPUTS = {
  single: [7],
  withZero: [0, 3, 0, 1],
  allEqual: [5, 5, 5, 5],
  dupes: [3, 1, 3, 2, 1, 2],
  sorted: [1, 2, 3, 4, 5],
  reverse: [9, 7, 5, 3, 1],
  larger: [170, 45, 75, 90, 802, 24, 2, 66],
}

const NEG_INPUTS = {
  mixedNeg: [-3, 1, -1, 0, 2],
  allNeg: [-5, -1, -3, -2],
}

// 哪些算法的 playground 放行负数（positiveOnly={false}）且算法支持
const NEG_CAPABLE = new Set(['radixsort', 'bucketsort', 'heapsort'])

describe('排序 · 非负输入域 · 结果必须有序且长度守恒', () => {
  for (const algo of algos) {
    for (const [name, input] of Object.entries(NONNEG_INPUTS)) {
      test(`${algo.slug} · ${name}`, () => {
        let steps
        expect(() => { steps = algo.fn([...input]) }, `${algo.slug}/${name} 抛错`).not.toThrow()
        const out = finalArray(steps)
        expect(Array.isArray(out), `${algo.slug}/${name} 末步无数组字段`).toBe(true)
        expect(out.length, `${algo.slug}/${name} 长度变了`).toBe(input.length)
        expect(out, `${algo.slug}/${name} 未正确排序`).toEqual([...input].sort((a, b) => a - b))
      })
    }
  }

  test('空数组不崩', () => {
    for (const algo of algos) {
      expect(() => algo.fn([]), `${algo.slug} 空数组抛错`).not.toThrow()
    }
  })
})

describe('排序 · 负数输入域 · 仅测 UI 放行负数且算法支持的', () => {
  for (const algo of algos) {
    if (!NEG_CAPABLE.has(algo.slug)) continue
    for (const [name, input] of Object.entries(NEG_INPUTS)) {
      test(`${algo.slug} · ${name}`, () => {
        let steps
        expect(() => { steps = algo.fn([...input]) }, `${algo.slug}/${name} 抛错`).not.toThrow()
        const out = finalArray(steps)
        expect(out.length).toBe(input.length)
        expect(out, `${algo.slug}/${name} 未正确排序`).toEqual([...input].sort((a, b) => a - b))
      })
    }
  }
})
