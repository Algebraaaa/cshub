// 正则表达式 → NFA（Thompson 构造）
// 支持：单字符（a-z 0-9）、连接 ab、选择 a|b、Kleene 闭包 a*、括号 ()
// 步骤格式：{ nfa: { nodes, edges, start, accept }, action, focus, description, regex, ast }

let _id = 0
const nextId = () => `s${++_id}`

// ─── 1. 词法 + 语法（递归下降）──
// expr   = term ('|' term)*
// term   = factor+
// factor = atom ('*')?
// atom   = char | '(' expr ')'

function parse(re) {
  let i = 0
  function peek() { return re[i] }
  function eat(c) { if (re[i] !== c) throw new Error(`expect ${c} at ${i}`); i++ }

  function parseAtom() {
    if (peek() === '(') {
      eat('(')
      const e = parseExpr()
      eat(')')
      return e
    }
    const c = re[i++]
    if (!c) throw new Error('unexpected end')
    return { type: 'Char', value: c }
  }
  function parseFactor() {
    let a = parseAtom()
    while (peek() === '*') {
      eat('*')
      a = { type: 'Star', child: a }
    }
    return a
  }
  function parseTerm() {
    let t = parseFactor()
    while (peek() && peek() !== '|' && peek() !== ')') {
      t = { type: 'Concat', left: t, right: parseFactor() }
    }
    return t
  }
  function parseExpr() {
    let e = parseTerm()
    while (peek() === '|') {
      eat('|')
      e = { type: 'Alt', left: e, right: parseTerm() }
    }
    return e
  }
  return parseExpr()
}

// ─── 2. Thompson 构造 ──
// 每个子 NFA：{ start, accept, nodes: Map<id,{accepting:boolean}>, edges: [{from,to,label}] }
function makeNode(map) {
  const id = nextId()
  map.set(id, { id, accepting: false })
  return id
}

function thompson(ast, snapshot) {
  const nodes = new Map()
  const edges = []

  function add(from, to, label) {
    edges.push({ id: `e${edges.length}`, from, to, label })
  }

  function build(node) {
    if (node.type === 'Char') {
      const s = makeNode(nodes), a = makeNode(nodes)
      add(s, a, node.value)
      snapshot(['char-' + node.value],
        `字符 '${node.value}' → 两个状态 + 一条 '${node.value}' 边。`,
        { nodes: new Map(nodes), edges: edges.slice(), start: s, accept: a, ast: node })
      return { start: s, accept: a }
    }
    if (node.type === 'Concat') {
      const l = build(node.left)
      const r = build(node.right)
      add(l.accept, r.start, 'ε')
      snapshot([l.accept, r.start],
        `连接：把左子的接收态与右子的起始态用 ε 连起来。`,
        { nodes: new Map(nodes), edges: edges.slice(), start: l.start, accept: r.accept, ast: node })
      return { start: l.start, accept: r.accept }
    }
    if (node.type === 'Alt') {
      const l = build(node.left)
      const r = build(node.right)
      const s = makeNode(nodes), a = makeNode(nodes)
      add(s, l.start, 'ε'); add(s, r.start, 'ε')
      add(l.accept, a, 'ε'); add(r.accept, a, 'ε')
      snapshot([s, a],
        `选择 (A|B)：新建起始/接收态；起始 ε 分叉到两侧；两侧接收 ε 合到新接收。`,
        { nodes: new Map(nodes), edges: edges.slice(), start: s, accept: a, ast: node })
      return { start: s, accept: a }
    }
    if (node.type === 'Star') {
      const c = build(node.child)
      const s = makeNode(nodes), a = makeNode(nodes)
      add(s, c.start, 'ε'); add(s, a, 'ε')              // 跳过（零次）
      add(c.accept, c.start, 'ε'); add(c.accept, a, 'ε') // 循环 + 收束
      snapshot([s, a],
        `Kleene 闭包 A*：起始 ε 分叉到 A 或直接接收（零次）；A 接收 ε 既可循环又可结束。`,
        { nodes: new Map(nodes), edges: edges.slice(), start: s, accept: a, ast: node })
      return { start: s, accept: a }
    }
    throw new Error('unknown node ' + node.type)
  }

  return { build, nodes, edges }
}

export function regexToNfa(regex) {
  _id = 0
  const steps = []
  const ast = parse(regex)

  // 初始：展示 AST
  steps.push({
    nfa: { nodes: new Map(), edges: [], start: null, accept: null },
    focus: [], ast, regex,
    description: `解析正则 "${regex}"，得到语法树。下一步开始按 Thompson 规则逐子树构造 NFA。`,
  })

  const ctx = thompson(ast, (focus, description, snap) => {
    snap.nodes.get(snap.accept).accepting = true
    steps.push({
      nfa: {
        nodes: new Map(snap.nodes),
        edges: snap.edges.slice(),
        start: snap.start,
        accept: snap.accept,
      },
      focus, ast, regex,
      description,
    })
    snap.nodes.get(snap.accept).accepting = false  // 还原（中间快照只是看）
  })

  const root = ctx.build(ast)
  // 最终：设接收态
  const finalNodes = new Map(ctx.nodes)
  finalNodes.get(root.accept).accepting = true
  steps.push({
    nfa: { nodes: finalNodes, edges: ctx.edges.slice(), start: root.start, accept: root.accept },
    focus: [root.start, root.accept],
    ast, regex,
    description: `构造完成。共 ${finalNodes.size} 个状态、${ctx.edges.length} 条边。起始 ${root.start}，接收 ${root.accept}。`,
  })

  return steps
}

// 导出 NFA 数据形式给 NFA→DFA 使用
export function regexToFinalNfa(regex) {
  const steps = regexToNfa(regex)
  return steps[steps.length - 1].nfa
}
