// 统一高亮协议 · getStepCodeLine 解析优先级验收
import { test, expect, describe } from 'vitest'
import { getStepCodeLine } from './stepProtocol.js'

describe('getStepCodeLine', () => {
  test('按语言显式行号最优先', () => {
    const step = { cppLine: 9, pythonLine: 4, codeLines: { cpp: 1, python: 1 }, codeLine: 99 }
    expect(getStepCodeLine(step, 'cpp')).toBe(9)
    expect(getStepCodeLine(step, 'python')).toBe(4)
  })

  test('codeLines 对象写法次优先', () => {
    const step = { codeLines: { cpp: 13, python: 9 } }
    expect(getStepCodeLine(step, 'cpp')).toBe(13)
    expect(getStepCodeLine(step, 'python')).toBe(9)
  })

  test('泛化兜底顺序：codeLine → line → pseudoLine', () => {
    expect(getStepCodeLine({ codeLine: 5, line: 6, pseudoLine: 7 }, 'cpp')).toBe(5)
    expect(getStepCodeLine({ line: 6, pseudoLine: 7 }, 'cpp')).toBe(6)
    expect(getStepCodeLine({ pseudoLine: 7 }, 'cpp')).toBe(7)
  })

  test('explicitOnly 忽略泛化字段（AI 课场景：step.line 可能另有含义）', () => {
    const step = { line: 3, codeLine: 5, pseudoLine: 7 }
    expect(getStepCodeLine(step, 'python', { explicitOnly: true })).toBeNull()
    expect(getStepCodeLine({ ...step, pythonLine: 8 }, 'python', { explicitOnly: true })).toBe(8)
  })

  test('非整数与空入参返回 null', () => {
    expect(getStepCodeLine(null, 'cpp')).toBeNull()
    expect(getStepCodeLine({}, 'cpp')).toBeNull()
    expect(getStepCodeLine({ cppLine: 2.5 }, 'cpp')).toBeNull()
    expect(getStepCodeLine({ cppLine: '3' }, 'cpp')).toBeNull()
  })
})
