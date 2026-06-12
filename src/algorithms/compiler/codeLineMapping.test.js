// 编译原理算法 · 步骤代码行映射验收
//
// 背景：这些算法的步骤曾经没有显式 cppLine/pythonLine，右侧代码高亮
// 依赖 inferCodeLine 的文本猜测，第二步之后经常丢失（如 /algo/regexNfa）。
// 现在每个步骤都必须携带显式行号，且行号必须落在详情页展示代码的范围内——
// 改动 data/algorithms/compiler.js 的代码示例而忘了同步算法文件里的
// LINES 表时，本测试会失败。
import { describe, test, expect } from 'vitest'
import { COMPILER_ALGORITHMS } from '../../data/algorithms/compiler.js'

// 每个算法跑多组输入，确保所有分支（char/concat/alt/star、shift/reduce、
// if/for 的 TAC 生成等）产出的步骤都有行号。
const INPUTS = {
  regexNfa: ['(a|b)*c', 'abc', 'a*', 'a(b|c)*d'],
  nfaToDfa: ['(a|b)*c', 'ab'],
  buildAst: ['1+2*(3+4)', '7*8+9', '2*(3+4)*5'],
  ll1: [undefined],
  lr0: [undefined],
  codeGen: ['arith', 'branch', 'loop'],
}

const lineCount = (code) => String(code).split('\n').length

describe.each(Object.keys(INPUTS))('%s', (slug) => {
  const algo = COMPILER_ALGORITHMS[slug]

  test('算法存在且带双语代码示例', () => {
    expect(algo, `COMPILER_ALGORITHMS.${slug}`).toBeTruthy()
    expect(typeof algo.code?.cpp).toBe('string')
    expect(typeof algo.code?.python).toBe('string')
  })

  test.each(INPUTS[slug].map(i => [i ?? '(无参)']))('输入 %s：每步都有范围内的显式行号', (label) => {
    const input = label === '(无参)' ? undefined : label
    const cppMax = lineCount(algo.code.cpp)
    const pyMax = lineCount(algo.code.python)
    const steps = algo.fn(input)

    expect(steps.length).toBeGreaterThan(1)
    steps.forEach((step, i) => {
      const ctx = `${slug} step ${i}「${String(step.description).slice(0, 28)}」`
      expect(typeof step.description, `${ctx} description`).toBe('string')
      expect(step.description.length, `${ctx} description 非空`).toBeGreaterThan(0)
      expect(Number.isInteger(step.cppLine), `${ctx} 缺 cppLine`).toBe(true)
      expect(step.cppLine, `${ctx} cppLine 越界`).toBeGreaterThanOrEqual(1)
      expect(step.cppLine, `${ctx} cppLine 越界（代码共 ${cppMax} 行）`).toBeLessThanOrEqual(cppMax)
      expect(Number.isInteger(step.pythonLine), `${ctx} 缺 pythonLine`).toBe(true)
      expect(step.pythonLine, `${ctx} pythonLine 越界`).toBeGreaterThanOrEqual(1)
      expect(step.pythonLine, `${ctx} pythonLine 越界（代码共 ${pyMax} 行）`).toBeLessThanOrEqual(pyMax)
    })
  })

  test('相邻步骤的高亮会移动（不是恒定一行）', () => {
    const input = INPUTS[slug][0]
    const steps = algo.fn(input)
    const distinctCpp = new Set(steps.map(s => s.cppLine))
    const distinctPy = new Set(steps.map(s => s.pythonLine))
    expect(distinctCpp.size, 'cppLine 应随步骤变化').toBeGreaterThan(1)
    expect(distinctPy.size, 'pythonLine 应随步骤变化').toBeGreaterThan(1)
  })
})
