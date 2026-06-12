// 递归下降语法分析：算术表达式 → AST
// 文法：
//   expr   = term (('+'|'-') term)*
//   term   = factor (('*'|'/') factor)*
//   factor = number | '(' expr ')'

let _id = 0
const nextId = () => `n${++_id}`

// 步骤 → 详情页代码行号（data/algorithms/compiler.js 中 buildAst.code 的行号）。
// 改动那份展示代码时需同步这张表。
const ENTER_LINES = {
  expr:   { cpp: 3,  python: 1 },
  term:   { cpp: 12, python: 9 },
  factor: { cpp: 21, python: 16 },
}
const EXIT_LINES = {
  expr:   { cpp: 10, python: 7 },
  term:   { cpp: 19, python: 14 },
  factor: { cpp: 28, python: 19 },
}
const LINES = {
  init:       { cpp: 3,  python: 1 },
  exprOp:     { cpp: 7,  python: 5 },   // expr 看到 +/-，解析右侧 term
  exprBuild:  { cpp: 8,  python: 6 },   // 构建 +/- 二元节点
  termOp:     { cpp: 16, python: 13 },  // term 看到 */，解析右侧 factor
  termBuild:  { cpp: 17, python: 13 },  // 构建 */ 二元节点
  parenOpen:  { cpp: 24, python: 18 },  // '(' 进入子表达式
  parenClose: { cpp: 25, python: 18 },  // ')' 收束
  leaf:       { cpp: 28, python: 19 },  // 数字叶子
  done:       { cpp: 10, python: 7 },
}

function tokenize(src) {
  const tokens = []
  let i = 0
  while (i < src.length) {
    const c = src[i]
    if (/\s/.test(c)) { i++; continue }
    if (/[0-9]/.test(c)) {
      let j = i
      while (j < src.length && /[0-9.]/.test(src[j])) j++
      tokens.push({ type: 'NUM', value: src.substring(i, j), pos: i })
      i = j
    } else if ('+-*/()'.includes(c)) {
      tokens.push({ type: c, value: c, pos: i })
      i++
    } else {
      throw new Error(`unexpected char '${c}' at ${i}`)
    }
  }
  return tokens
}

function cloneTree(node) {
  if (!node) return null
  return {
    id: node.id, kind: node.kind, value: node.value,
    children: (node.children || []).map(cloneTree),
  }
}

export function buildAst(src) {
  _id = 0
  const tokens = tokenize(src)
  const steps = []
  let pos = 0
  let trees = []  // 当前栈上的 partial trees（用于可视化）
  let root = null

  function snap(focusTokenIdx, focusNodeId, ruleStack, desc, action = 'parse', lines = null) {
    steps.push({
      tokens: tokens.map(t => ({ ...t })),
      pos,
      focusTokenIdx,
      focusNodeId,
      tree: cloneTree(root) || (trees[0] ? cloneTree(trees[0]) : null),
      partial: trees.map(cloneTree),
      ruleStack: ruleStack.slice(),
      action,
      description: desc,
      ...(lines ? { cppLine: lines.cpp, pythonLine: lines.python } : {}),
    })
  }

  function peek() { return tokens[pos] }
  function consume(expected) {
    const t = tokens[pos]
    if (!t || (expected && t.type !== expected)) throw new Error(`expect ${expected} at ${pos}`)
    pos++
    return t
  }

  const rules = []
  function enter(rule) { rules.push(rule); snap(pos, null, rules, `进入规则 ${rule}（当前 token = ${peek()?.value || 'EOF'}）。`, 'enter', ENTER_LINES[rule]) }
  function exit(node) {
    const r = rules.pop()
    snap(pos, node?.id, rules, `规则 ${r} 完成，返回节点 ${node?.kind}${node?.value !== undefined ? '=' + node.value : ''}。`, 'exit', EXIT_LINES[r])
    return node
  }

  function parseExpr() {
    enter('expr')
    let left = parseTerm()
    while (peek() && (peek().type === '+' || peek().type === '-')) {
      const op = consume()
      snap(pos - 1, left.id, rules, `expr 看到 '${op.value}'，开始解析右侧 term…`, 'parse', LINES.exprOp)
      const right = parseTerm()
      const node = { id: nextId(), kind: 'Op', value: op.value, children: [left, right] }
      root = node
      snap(pos - 1, node.id, rules, `构建二元节点 (${op.value})：左子=${left.kind}, 右子=${right.kind}。`, 'build', LINES.exprBuild)
      left = node
    }
    return exit(left)
  }
  function parseTerm() {
    enter('term')
    let left = parseFactor()
    while (peek() && (peek().type === '*' || peek().type === '/')) {
      const op = consume()
      snap(pos - 1, left.id, rules, `term 看到 '${op.value}'（优先级高于 + -），开始解析右侧 factor…`, 'parse', LINES.termOp)
      const right = parseFactor()
      const node = { id: nextId(), kind: 'Op', value: op.value, children: [left, right] }
      if (root === left || root === right) root = node
      snap(pos - 1, node.id, rules, `构建二元节点 (${op.value})。* / 比 + - 先组合，因此这里先收掉。`, 'build', LINES.termBuild)
      left = node
    }
    return exit(left)
  }
  function parseFactor() {
    enter('factor')
    const t = peek()
    if (!t) throw new Error('unexpected EOF in factor')
    if (t.type === '(') {
      consume('(')
      snap(pos - 1, null, rules, `遇到 '('，进入子表达式。括号会强制覆盖优先级。`, 'parse', LINES.parenOpen)
      const inner = parseExpr()
      consume(')')
      snap(pos - 1, inner.id, rules, `匹配 ')'，子表达式收束。`, 'parse', LINES.parenClose)
      return exit(inner)
    }
    if (t.type === 'NUM') {
      consume('NUM')
      const node = { id: nextId(), kind: 'Num', value: t.value, children: [] }
      if (!root) root = node
      snap(pos - 1, node.id, rules, `匹配数字 ${t.value}，创建叶子节点。`, 'leaf', LINES.leaf)
      return exit(node)
    }
    throw new Error(`unexpected token ${t.type}`)
  }

  // 初始
  steps.push({
    tokens: tokens.map(t => ({ ...t })),
    pos: 0, focusTokenIdx: -1, focusNodeId: null,
    tree: null, partial: [], ruleStack: [],
    action: 'init',
    description: `输入 "${src}" → 词法分析得 ${tokens.length} 个 token。开始递归下降。`,
    cppLine: LINES.init.cpp, pythonLine: LINES.init.python,
  })

  root = parseExpr()
  steps.push({
    tokens: tokens.map(t => ({ ...t })),
    pos, focusTokenIdx: -1, focusNodeId: root?.id,
    tree: cloneTree(root), partial: [],
    ruleStack: [],
    action: 'done',
    description: `语法分析完成。AST 共 ${countNodes(root)} 个节点。可送入求值器或代码生成阶段。`,
    cppLine: LINES.done.cpp, pythonLine: LINES.done.python,
  })

  return steps
}

function countNodes(n) {
  if (!n) return 0
  return 1 + (n.children || []).reduce((s, c) => s + countNodes(c), 0)
}
