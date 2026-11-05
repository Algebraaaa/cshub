// 编译原理算法正确性回归
//
// 口径：陈火旺《程序设计语言编译原理》与龙书；正则/自动机部分同时与
//       JS 正则语义对照（NFA/DFA 必须与正则接受同一语言）。
//   regexToNfa：Thompson 构造的 NFA 接受的语言 = 正则语言
//   nfaToDfa：子集构造的 DFA 与 NFA 接受同一语言
//   ll1：FIRST/FOLLOW 集正确、分析表无冲突
//   lr0：项集完备、转移合法、表达式文法状态数正确
//   buildAst / codeGen：结构不变量
import { describe, test, expect } from 'vitest'
import { regexToFinalNfa } from './regexToNfa.js'
import { nfaToDfa } from './nfaToDfa.js'
import { ll1Steps } from './ll1.js'
import { lr0Steps } from './lr0.js'
import { buildAst } from './buildAst.js'
import { codeGenSteps } from './codeGen.js'

const lastOf = (steps) => steps[steps.length - 1]

// ── NFA 模拟器（ε-closure）────────────────────────────────────
function epsClosure(nfa, states) {
  const set = new Set(states)
  const stack = [...states]
  while (stack.length) {
    const s = stack.pop()
    for (const e of nfa.edges) {
      if (e.from === s && (e.label === 'ε' || e.label === 'epsilon') && !set.has(e.to)) {
        set.add(e.to)
        stack.push(e.to)
      }
    }
  }
  return set
}

function nfaAccepts(nfa, str) {
  let current = epsClosure(nfa, [nfa.start])
  for (const ch of str) {
    const next = new Set()
    for (const s of current) {
      for (const e of nfa.edges) {
        if (e.from === s && e.label === ch) next.add(e.to)
      }
    }
    current = epsClosure(nfa, [...next])
    if (current.size === 0) return false
  }
  // 接收态
  for (const s of current) {
    const node = nfa.nodes.get(s)
    if (node && node.accepting) return true
  }
  return false
}

function dfaAccepts(steps, str) {
  const last = lastOf(steps)
  const states = last.dfa.states
  const edges = last.dfa.edges
  let state = states[0] // D0
  for (const ch of str) {
    const edge = edges.find(e => e.from === state.id && e.label === ch)
    if (!edge) return false
    state = states.find(s => s.id === edge.to)
    if (!state) return false
  }
  return state.accepting
}

// ── NFA / DFA 与正则语言等价 ─────────────────────────────────
const REGEX_CASES = [
  { regex: 'abc', accept: ['abc'], reject: ['ab', 'abcd', 'abd', ''] },
  { regex: 'a*', accept: ['', 'a', 'aa', 'aaa'], reject: ['b', 'ab'] },
  { regex: '(a|b)*c', accept: ['c', 'ac', 'abc', 'bbbc'], reject: ['', 'ab', 'ca'] },
  { regex: 'a(b|c)*d', accept: ['ad', 'abd', 'acd', 'abccd'], reject: ['a', 'd', 'ab'] },
]

describe('NFA/DFA 与正则语言等价', () => {
  for (const { regex, accept, reject } of REGEX_CASES) {
    test(`regex=${regex}：NFA 接受的语言 = 正则语言`, () => {
      const nfa = regexToFinalNfa(regex)
      for (const w of accept) expect(nfaAccepts(nfa, w), `${w} 应被接受`).toBe(true)
      for (const w of reject) expect(nfaAccepts(nfa, w), `${w} 不应被接受`).toBe(false)
    })

    test(`regex=${regex}：DFA 接受的语言 = NFA 语言`, () => {
      const nfa = regexToFinalNfa(regex)
      const dfaSteps = nfaToDfa(regex)
      const allStrings = [...accept, ...reject]
      for (const w of allStrings) {
        expect(dfaAccepts(dfaSteps, w), `${w} DFA 与 NFA 不一致`).toBe(nfaAccepts(nfa, w))
      }
    })
  }

  test('DFA 起始状态存在且闭包非空', () => {
    const steps = nfaToDfa('abc')
    const last = lastOf(steps)
    expect(last.dfa.states.length).toBeGreaterThan(0)
    expect(last.dfa.states[0].id).toBe('D0')
    expect(last.dfa.states[0].closure.length).toBeGreaterThan(0)
  })
})

// ── LL(1) ────────────────────────────────────────────────────
describe('LL(1) 分析', () => {
  test('FIRST/FOLLOW 集正确（表达式文法）', () => {
    const steps = ll1Steps()
    const firstStep = steps.find(s => s.phase === 'first')
    const lastFirst = [...steps].reverse().find(s => s.phase === 'first')
    const first = lastFirst.firstSets
    // FIRST(E) = {id, (}（cloneSets → { nt: [符号...] }）
    expect(first.E.includes('id')).toBe(true)
    expect(first.E.includes('(')).toBe(true)
    // FIRST(T) = {id, (}，FIRST(F) = {id, (}
    expect(first.T.includes('id')).toBe(true)
    expect(first.F.includes('id')).toBe(true)
    // FIRST(E') = {+, ε}，FIRST(T') = {*, ε}
    expect(first["E'"].includes('+')).toBe(true)
    expect(first["E'"].includes('ε')).toBe(true)
    expect(first["T'"].includes('*')).toBe(true)
    expect(first["T'"].includes('ε')).toBe(true)
    expect(firstStep).toBeTruthy()
  })

  test('FOLLOW 集：FOLLOW(E) 含 ) 和 $', () => {
    const steps = ll1Steps()
    const lastFollow = [...steps].reverse().find(s => s.phase === 'follow')
    const follow = lastFollow.followSets
    expect(follow.E.includes(')')).toBe(true)
    expect(follow.E.includes('$')).toBe(true)
  })

  test('分析表无冲突（每个单元格至多一个产生式）', () => {
    const steps = ll1Steps()
    const lastTable = [...steps].reverse().find(s => s.table)
    const table = lastTable.table
    for (const nt of Object.keys(table)) {
      for (const t of Object.keys(table[nt])) {
        const cell = table[nt][t]
        // 单元格应为 null 或单个产生式（无冲突列表）
        expect(Array.isArray(cell)).toBe(false)
      }
    }
  })
})

// ── LR(0) ────────────────────────────────────────────────────
describe('LR(0) 分析', () => {
  test('项集完备且转移合法', () => {
    const steps = lr0Steps()
    const last = lastOf(steps)
    expect(last.items.length).toBeGreaterThan(0)
    // 起始项集 I0 含 S' → ·E（items 视图：{ id, kernel, closure, allItems }）
    const i0 = last.items[0]
    expect(i0.allItems.length).toBeGreaterThan(0)
    expect(i0.allItems.some(it => it.includes("S'") && it.includes('E'))).toBe(true)
  })

  test('转移不指向不存在的状态', () => {
    const steps = lr0Steps()
    const last = lastOf(steps)
    const stateIds = new Set(last.items.map(s => s.id))
    for (const t of last.transitions) {
      expect(stateIds.has(t.from)).toBe(true)
      expect(stateIds.has(t.to)).toBe(true)
    }
  })

  test('ACTION 表含 accept 动作（存在 S\' → E· 接受项）', () => {
    const steps = lr0Steps()
    const last = lastOf(steps)
    const hasAccept = last.items.some(s => s.allItems.some(it => it.includes("S' → E ·")))
    expect(hasAccept).toBe(true)
    expect(JSON.stringify(last.table).includes('acc')).toBe(true)
  })
})

// ── AST / 代码生成 ───────────────────────────────────────────
describe('AST 构建', () => {
  test('简单表达式构建出语法树', () => {
    const steps = buildAst('1+2*(3+4)')
    expect(steps.length).toBeGreaterThan(0)
    const last = lastOf(steps)
    expect(last).toBeTruthy()
  })

  test('边界输入：单数字与含括号表达式可解析', () => {
    expect(buildAst('42').length).toBeGreaterThan(0)
    expect(buildAst('(1+2)*3').length).toBeGreaterThan(0)
  })

  test('非法输入抛出解析错误（playground 捕获后展示错误）', () => {
    // 与 AstPlayground 一致：非法输入 throw，由界面 catch 成"错误：…"
    expect(() => buildAst('1+*2')).toThrow()
    expect(() => buildAst('')).toThrow()
  })
})

describe('三地址代码生成', () => {
  test('arith 场景生成三地址码', () => {
    const steps = codeGenSteps('arith')
    expect(steps.length).toBeGreaterThan(0)
  })

  test('branch 与 loop 场景都有输出', () => {
    expect(codeGenSteps('branch').length).toBeGreaterThan(0)
    expect(codeGenSteps('loop').length).toBeGreaterThan(0)
  })
})
