// NFA → DFA（子集构造，含 ε-closure）
// 输入：regex 字符串。先用 Thompson 构造得到 NFA，再做子集构造。
// 输出步骤：{ nfa, dfa, focusClosure, focusDfaState, action, description }

import { regexToFinalNfa } from './regexToNfa'

function epsilonClosure(nfa, stateIds) {
  // BFS 沿 ε 边扩展
  const visited = new Set(stateIds)
  const stack = [...stateIds]
  while (stack.length > 0) {
    const id = stack.pop()
    for (const e of nfa.edges) {
      if (e.from === id && e.label === 'ε' && !visited.has(e.to)) {
        visited.add(e.to)
        stack.push(e.to)
      }
    }
  }
  return Array.from(visited).sort()
}

function move(nfa, stateIds, symbol) {
  const result = new Set()
  for (const e of nfa.edges) {
    if (stateIds.includes(e.from) && e.label === symbol) result.add(e.to)
  }
  return Array.from(result).sort()
}

function setKey(arr) { return arr.join(',') }

// action → 详情页代码行号（data/algorithms/compiler.js 中 nfaToDfa.code 的行号）。
// 改动那份展示代码时需同步这张表。
const LINES = {
  'init':      { cpp: 14, python: 2 },   // start = ε-closure({nfa.start})
  'no-move':   { cpp: 21, python: 10 },  // 空集 → continue
  'new-state': { cpp: 23, python: 12 },  // 新建 DFA 状态并入队
  'existing':  { cpp: 22, python: 11 },  // 集合已出现 → 复用
  'edge':      { cpp: 25, python: 13 },  // 添加 DFA 转移
  'done':      { cpp: 27, python: 14 },  // 队列空 → 完成
}

export function nfaToDfa(regex) {
  const nfa = regexToFinalNfa(regex)
  const alphabet = Array.from(new Set(nfa.edges.map(e => e.label).filter(l => l !== 'ε'))).sort()

  const steps = []
  const dfaStates = []   // [{ id, closure: [], accepting }]
  const dfaEdges = []    // [{ from, to, label }]
  const keyToIdx = new Map()

  function snap(focusClosure, focusDfaState, action, desc, focusEdge = null) {
    const lines = LINES[action]
    steps.push({
      nfa,
      alphabet,
      dfa: {
        states: dfaStates.map(s => ({ ...s, closure: s.closure.slice() })),
        edges: dfaEdges.slice(),
      },
      focusClosure, focusDfaState, focusEdge,
      action,
      description: desc,
      ...(lines ? { cppLine: lines.cpp, pythonLine: lines.python } : {}),
    })
  }

  // 1. 起始 DFA 状态 = ε-closure(nfa.start)
  const startClosure = epsilonClosure(nfa, [nfa.start])
  const startKey = setKey(startClosure)
  const startAccepting = startClosure.includes(nfa.accept)
  dfaStates.push({ id: 'D0', closure: startClosure, accepting: startAccepting })
  keyToIdx.set(startKey, 0)
  snap(startClosure, 'D0', 'init',
    `NFA 起始状态 ε-closure → DFA 起始状态 D0 = {${startClosure.join(', ')}}${startAccepting ? '（已包含接收态）' : ''}。字母表 = {${alphabet.join(', ')}}。`)

  // 2. 工作队列
  const queue = ['D0']
  while (queue.length > 0) {
    const dId = queue.shift()
    const dIdx = parseInt(dId.slice(1), 10)
    const closure = dfaStates[dIdx].closure
    for (const symbol of alphabet) {
      const mov = move(nfa, closure, symbol)
      if (mov.length === 0) {
        snap(closure, dId, 'no-move',
          `从 ${dId} = {${closure.join(', ')}} 读 '${symbol}' → 空（无该字符的出边）。`)
        continue
      }
      const next = epsilonClosure(nfa, mov)
      const key = setKey(next)
      let targetIdx = keyToIdx.get(key)
      if (targetIdx === undefined) {
        targetIdx = dfaStates.length
        const accepting = next.includes(nfa.accept)
        dfaStates.push({ id: `D${targetIdx}`, closure: next, accepting })
        keyToIdx.set(key, targetIdx)
        snap(next, `D${targetIdx}`, 'new-state',
          `move({${closure.join(', ')}}, '${symbol}') = {${mov.join(', ')}} → ε-closure = {${next.join(', ')}}。新建 DFA 状态 D${targetIdx}${accepting ? '（接收态）' : ''}。`)
      } else {
        snap(next, `D${targetIdx}`, 'existing',
          `move({${closure.join(', ')}}, '${symbol}') = {${mov.join(', ')}} → ε-closure = {${next.join(', ')}}。已存在 → 复用 D${targetIdx}。`)
      }
      const edge = { from: dId, to: `D${targetIdx}`, label: symbol }
      dfaEdges.push(edge)
      snap(next, `D${targetIdx}`, 'edge',
        `添加 DFA 转移：${dId} --${symbol}--> D${targetIdx}。`, dfaEdges.length - 1)
      if (targetIdx === dfaStates.length - 1) queue.push(`D${targetIdx}`)
    }
  }

  snap([], null, 'done',
    `子集构造完成。NFA ${nfa.nodes.size} 状态 → DFA ${dfaStates.length} 状态、${dfaEdges.length} 条转移。${dfaStates.filter(s => s.accepting).length} 个接收态。`)

  return steps
}
