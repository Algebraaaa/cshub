// radixSort 回归测试
// 修复前：含负数会崩（Math.floor(v/exp)%10 得负索引 → buckets[负] undefined → push 崩），
// 全负数会静默返回未排序（maxVal<0 → log10 得 NaN → 位数 NaN → 分配循环跳过）。
// 修复用整体平移 offset，输入非负时行为不变。
import { test, expect } from 'vitest'
import { radixSort } from './radixSort.js'

const finalArr = (steps) => steps[steps.length - 1].arr
const isSorted = (a) => a.every((v, i) => i === 0 || a[i - 1] <= v)

test('非负输入：行为不变，正确排序', () => {
  const out = finalArr(radixSort([170, 45, 75, 90, 802, 24, 2, 66]))
  expect(out).toEqual([2, 24, 45, 66, 75, 90, 170, 802])
})

test('含 0：正常排序', () => {
  expect(finalArr(radixSort([0, 5, 0, 3]))).toEqual([0, 0, 3, 5])
})

test('含负数不再崩溃，且正确排序', () => {
  const out = finalArr(radixSort([-3, 1, -1, 0, 2]))
  expect(out).toEqual([-3, -1, 0, 1, 2])
})

test('全负数正确排序（此前静默返回未排序）', () => {
  const out = finalArr(radixSort([-3, -1, -2, -10]))
  expect(out).toEqual([-10, -3, -2, -1])
})

test('随机含负整数：始终有序且长度守恒', () => {
  for (let t = 0; t < 50; t++) {
    const n = 3 + Math.floor(Math.random() * 8)
    const inp = Array.from({ length: n }, () => Math.floor(Math.random() * 400) - 200)
    const out = finalArr(radixSort([...inp]))
    expect(out.length).toBe(inp.length)
    expect(isSorted(out), `未排序: ${inp} -> ${out}`).toBe(true)
    expect([...out].sort((a, b) => a - b)).toEqual(out)
  }
})

test('单元素 / 全相等', () => {
  expect(finalArr(radixSort([7]))).toEqual([7])
  expect(finalArr(radixSort([5, 5, 5]))).toEqual([5, 5, 5])
})
