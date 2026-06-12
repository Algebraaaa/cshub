// LR(0) 项集构建与 ACTION/GOTO 表模拟
// 文法（增广）：
//   S' → E       (prod 0)
//   E  → E + T   (prod 1)
//   E  → T       (prod 2)
//   T  → id      (prod 3)

const PRODUCTIONS = [
  { lhs: "S'", rhs: ['E'],           idx: 0 },
  { lhs: 'E',  rhs: ['E', '+', 'T'], idx: 1 },
  { lhs: 'E',  rhs: ['T'],           idx: 2 },
  { lhs: 'T',  rhs: ['id'],          idx: 3 },
]

const TERMINALS = ['id', '+', '$']
const NON_TERMINALS_ALL = ["S'", 'E', 'T']

// 步骤 → 详情页代码行号（data/algorithms/compiler.js 中 lr0.code 的行号）。
// 改动那份展示代码时需同步这张表。spread 进 steps.push 使用。
const L = {
  itemsInit:   { cppLine: 15, pythonLine: 15 },  // I0 = closure({S'→·E})
  itemsNew:    { cppLine: 23, pythonLine: 22 },  // goto 产生新状态
  itemsDone:   { cppLine: 27, pythonLine: 23 },  // 项集族构建完成
  tableIntro:  { cppLine: 29, pythonLine: 25 },
  tableShift:  { cppLine: 34, pythonLine: 30 },  // ACTION = shift
  tableGoto:   { cppLine: 40, pythonLine: 35 },  // GOTO 填表
  tableAccept: { cppLine: 36, pythonLine: 32 },  // S'→E· 接受项
  tableReduce: { cppLine: 37, pythonLine: 33 },  // ·在末尾 → reduce
  parseInit:   { cppLine: 44, pythonLine: 38 },
  parseError:  { cppLine: 47, pythonLine: 41 },
  parseAccept: { cppLine: 48, pythonLine: 42 },
  parseShift:  { cppLine: 49, pythonLine: 44 },
  parseReduce: { cppLine: 53, pythonLine: 48 },
}

function makeItem(prodIdx, dot) { return `${prodIdx}:${dot}` }
function parseItem(item) {
  const [p, d] = item.split(':').map(Number)
  return { prod: PRODUCTIONS[p], dot: d }
}
function itemLabel(item) {
  const { prod, dot } = parseItem(item)
  const rhs = prod.rhs.slice(); rhs.splice(dot, 0, '·')
  return `${prod.lhs} → ${rhs.join(' ')}`
}

function closure(items) {
  const set = new Set(items); const queue = [...items]
  while (queue.length) {
    const item = queue.shift()
    const { prod, dot } = parseItem(item)
    if (dot >= prod.rhs.length) continue
    const sym = prod.rhs[dot]
    if (NON_TERMINALS_ALL.includes(sym) && sym !== "S'") {
      for (const p of PRODUCTIONS) {
        if (p.lhs === sym) {
          const ni = makeItem(p.idx, 0)
          if (!set.has(ni)) { set.add(ni); queue.push(ni) }
        }
      }
    }
  }
  return [...set].sort()
}

function gotoSet(items, sym) {
  const moved = []
  for (const item of items) {
    const { prod, dot } = parseItem(item)
    if (dot < prod.rhs.length && prod.rhs[dot] === sym) moved.push(makeItem(prod.idx, dot + 1))
  }
  return moved.length === 0 ? null : closure(moved)
}

function itemSetKey(items) { return [...items].sort().join('|') }

function stateView(s) {
  const kernelItems = s.items.filter(item => {
    const { prod, dot } = parseItem(item)
    return prod.lhs === "S'" || dot > 0
  })
  const closureItems = s.items.filter(item => {
    const { prod, dot } = parseItem(item)
    return prod.lhs !== "S'" && dot === 0
  })
  return { id: s.id, kernel: kernelItems.map(itemLabel), closure: closureItems.map(itemLabel), allItems: s.items.map(itemLabel) }
}

function cloneTable(t) {
  const r = {}; for (const k of Object.keys(t)) r[k] = { ...t[k] }; return r
}

export function lr0Steps() {
  const steps = []

  // ── 阶段 1：构建 LR(0) 项集 ──────────────────────────────────────────
  const I0items = closure([makeItem(0, 0)])
  const states = [{ id: 0, items: I0items }]
  const transitions = []
  const stateMap = new Map([[itemSetKey(I0items), 0]])

  steps.push({ phase: 'items', items: [stateView(states[0])], transitions: [], table: {},
    stack: [], input: [], action: '', highlight: { stateId: 0 },
    description: `构建初始项集 I0：closure({S' → · E}) = {${I0items.map(itemLabel).join('; ')}}。`, ...L.itemsInit })

  const bfsQueue = [0]
  while (bfsQueue.length) {
    const sid = bfsQueue.shift()
    const sItems = states[sid].items
    const symbols = new Set()
    for (const item of sItems) {
      const { prod, dot } = parseItem(item)
      if (dot < prod.rhs.length) symbols.add(prod.rhs[dot])
    }
    for (const sym of symbols) {
      const nextItems = gotoSet(sItems, sym)
      if (!nextItems || nextItems.length === 0) continue
      const key = itemSetKey(nextItems)
      let nextId
      if (stateMap.has(key)) {
        nextId = stateMap.get(key)
      } else {
        nextId = states.length
        states.push({ id: nextId, items: nextItems })
        stateMap.set(key, nextId)
        bfsQueue.push(nextId)
        steps.push({ phase: 'items', items: states.map(stateView), transitions: transitions.map(t => ({ ...t })), table: {},
          stack: [], input: [], action: '', highlight: { stateId: nextId },
          description: `goto(I${sid}, ${sym}) = I${nextId}：${nextItems.map(itemLabel).join(' ; ')}。`, ...L.itemsNew })
      }
      transitions.push({ from: sid, symbol: sym, to: nextId })
    }
  }

  steps.push({ phase: 'items', items: states.map(stateView), transitions: transitions.map(t => ({ ...t })), table: {},
    stack: [], input: [], action: '', highlight: null,
    description: `LR(0) 项集构建完成，共 ${states.length} 个状态（I0–I${states.length - 1}），${transitions.length} 条转移边。`, ...L.itemsDone })

  // ── 阶段 2：构建 ACTION/GOTO 表 ──────────────────────────────────────
  const table = {}
  for (const s of states) { table[s.id] = {}; for (const t of TERMINALS) table[s.id][t] = null; for (const nt of ['E', 'T']) table[s.id][nt] = null }

  steps.push({ phase: 'table', items: states.map(stateView), transitions: transitions.map(t => ({ ...t })), table: cloneTable(table),
    stack: [], input: [], action: '', highlight: null,
    description: '开始构建 ACTION/GOTO 表。Shift 项填 sN，规约项（·在末尾）填 rN，S\'→E· 填 accept。', ...L.tableIntro })

  function fillCell(stateId, sym, val, desc, lines) {
    table[stateId][sym] = val
    steps.push({ phase: 'table', items: states.map(stateView), transitions: transitions.map(t => ({ ...t })), table: cloneTable(table),
      stack: [], input: [], action: '', highlight: { stateId, sym }, description: desc, ...(lines || {}) })
  }

  for (const tr of transitions) {
    if (TERMINALS.includes(tr.symbol)) {
      fillCell(tr.from, tr.symbol, `s${tr.to}`, `goto(I${tr.from}, ${tr.symbol}) = I${tr.to}，ACTION[${tr.from}, ${tr.symbol}] = shift ${tr.to}。`, L.tableShift)
    } else {
      fillCell(tr.from, tr.symbol, `g${tr.to}`, `goto(I${tr.from}, ${tr.symbol}) = I${tr.to}，GOTO[${tr.from}, ${tr.symbol}] = ${tr.to}。`, L.tableGoto)
    }
  }

  for (const s of states) {
    for (const item of s.items) {
      const { prod, dot } = parseItem(item)
      if (dot === prod.rhs.length) {
        if (prod.lhs === "S'") {
          fillCell(s.id, '$', 'acc', `I${s.id} 含 S' → E ·（接受项），ACTION[${s.id}, $] = accept。`, L.tableAccept)
        } else {
          for (const t of TERMINALS) {
            if (table[s.id][t] === null) {
              fillCell(s.id, t, `r${prod.idx}`, `I${s.id} 含 ${itemLabel(item)}（· 在末尾），ACTION[${s.id}, ${t}] = reduce by ${prod.lhs} → ${prod.rhs.join(' ')}（产生式 ${prod.idx}）。`, L.tableReduce)
            }
          }
        }
      }
    }
  }

  // ── 阶段 3：模拟解析 `id + id` ──────────────────────────────────────
  const parseInput = ['id', '+', 'id', '$']
  const stk = [{ state: 0, symbol: '$' }]

  steps.push({ phase: 'parse', items: states.map(stateView), transitions: transitions.map(t => ({ ...t })), table: cloneTable(table),
    stack: stk.map(s => ({ ...s })), input: [...parseInput], action: '初始化', currentState: 0, highlight: null,
    description: "开始 LR(0) 驱动解析输入 id + id $。初始栈 [{0,$}]。", ...L.parseInit })

  let ip = 0; let iter = 0
  while (iter < 30) {
    iter++
    const curState = stk[stk.length - 1].state
    const curInput = parseInput[ip]
    const act = table[curState] ? table[curState][curInput] : null

    if (!act) {
      steps.push({ phase: 'parse', items: states.map(stateView), transitions: transitions.map(t => ({ ...t })), table: cloneTable(table),
        stack: stk.map(s => ({ ...s })), input: parseInput.slice(ip), action: '错误', currentState: curState,
        highlight: { stateId: curState, sym: curInput }, description: `ACTION[${curState}, ${curInput}] 为空，解析错误。`, ...L.parseError })
      break
    }

    if (act === 'acc') {
      steps.push({ phase: 'parse', items: states.map(stateView), transitions: transitions.map(t => ({ ...t })), table: cloneTable(table),
        stack: stk.map(s => ({ ...s })), input: parseInput.slice(ip), action: '接受！', currentState: curState,
        highlight: { stateId: curState, sym: '$' }, description: `ACTION[${curState}, $] = accept，解析成功！`, ...L.parseAccept })
      break
    }

    if (act.startsWith('s')) {
      const nextState = parseInt(act.slice(1))
      stk.push({ state: nextState, symbol: curInput }); ip++
      steps.push({ phase: 'parse', items: states.map(stateView), transitions: transitions.map(t => ({ ...t })), table: cloneTable(table),
        stack: stk.map(s => ({ ...s })), input: parseInput.slice(ip), action: `shift ${nextState}`, currentState: nextState,
        highlight: { stateId: curState, sym: curInput }, description: `ACTION[${curState}, ${curInput}] = shift ${nextState}，压入 (${nextState}, ${curInput})。`, ...L.parseShift })
    } else if (act.startsWith('r')) {
      const prodIdx = parseInt(act.slice(1))
      const prod = PRODUCTIONS[prodIdx]
      for (let i = 0; i < prod.rhs.length; i++) stk.pop()
      const topState = stk[stk.length - 1].state
      const gv = table[topState][prod.lhs]
      const nextState = gv ? parseInt(gv.slice(1)) : -1
      stk.push({ state: nextState, symbol: prod.lhs })
      steps.push({ phase: 'parse', items: states.map(stateView), transitions: transitions.map(t => ({ ...t })), table: cloneTable(table),
        stack: stk.map(s => ({ ...s })), input: parseInput.slice(ip), action: `reduce ${prod.lhs} → ${prod.rhs.join(' ')}`,
        currentState: nextState, highlight: { stateId: topState, sym: prod.lhs },
        description: `ACTION[${curState}, ${curInput}] = reduce by ${prod.lhs}→${prod.rhs.join(' ')}，弹出 ${prod.rhs.length} 项，GOTO[${topState}, ${prod.lhs}] = ${nextState}，压入 (${nextState}, ${prod.lhs})。`, ...L.parseReduce })
    }
  }

  return steps
}
