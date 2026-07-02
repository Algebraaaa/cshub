// LL(1) 分析表构建与解析模拟
// 文法：
//   E  → T E'
//   E' → + T E' | ε
//   T  → F T'
//   T' → * F T' | ε
//   F  → ( E ) | id

const NON_TERMINALS = ['E', "E'", 'T', "T'", 'F']
const TERMINALS = ['+', '*', '(', ')', 'id', '$']

// 步骤 → 详情页代码行号（data/algorithms/compiler.js 中 ll1.code 的行号）。
// 改动那份展示代码时需同步这张表。spread 进 steps.push 使用。
const L = {
  firstIntro:    { cppLine: 1,  pythonLine: 1 },
  firstAdd:      { cppLine: 7,  pythonLine: 8 },   // FIRST 并入终结符/子集
  firstEps:      { cppLine: 9,  pythonLine: 11 },  // FIRST 加 ε
  followIntro:   { cppLine: 15, pythonLine: 14 },
  followStart:   { cppLine: 16, pythonLine: 15 },  // 开始符号加 $
  followRest:    { cppLine: 21, pythonLine: 20 },  // 并入后继序列的 FIRST
  followCopy:    { cppLine: 23, pythonLine: 22 },  // 末尾/可空 → 并入 FOLLOW(lhs)
  tableIntro:    { cppLine: 26, pythonLine: 24 },
  tableFill:     { cppLine: 29, pythonLine: 28 },  // 按 FIRST 填表
  tableFillEps:  { cppLine: 31, pythonLine: 31 },  // ε 产生式按 FOLLOW 填表
  parseInit:     { cppLine: 35, pythonLine: 34 },
  parseAccept:   { cppLine: 39, pythonLine: 38 },
  parseMatch:    { cppLine: 40, pythonLine: 40 },
  parseErrTerm:  { cppLine: 41, pythonLine: 42 },  // 栈顶终结符不匹配
  parseErrEmpty: { cppLine: 44, pythonLine: 46 },  // 表项为空
  parseExpand:   { cppLine: 47, pythonLine: 49 },  // 逆序压栈
  parseExpandEps:{ cppLine: 46, pythonLine: 48 },  // ε 推导不压栈
}

function cloneSets(obj) {
  const result = {}
  for (const k of Object.keys(obj)) result[k] = [...obj[k]]
  return result
}

function cloneTable(table) {
  const result = {}
  for (const nt of Object.keys(table)) {
    result[nt] = {}
    for (const t of Object.keys(table[nt])) result[nt][t] = table[nt][t]
  }
  return result
}

function firstOfSequence(seq, first) {
  const result = new Set()
  let allEpsilon = true
  for (const sym of seq) {
    if (sym === 'ε') { result.add('ε'); break }
    else if (TERMINALS.includes(sym)) { result.add(sym); allEpsilon = false; break }
    else {
      for (const f of first[sym]) { if (f !== 'ε') result.add(f) }
      if (!first[sym].has('ε')) { allEpsilon = false; break }
    }
  }
  if (allEpsilon) result.add('ε')
  return result
}

export function ll1Steps() {
  const steps = []
  const first = {}
  const follow = {}
  for (const nt of NON_TERMINALS) { first[nt] = new Set(); follow[nt] = new Set() }
  const table = {}
  for (const nt of NON_TERMINALS) { table[nt] = {}; for (const t of TERMINALS) table[nt][t] = null }

  // ── 阶段 1：FIRST 集计算 ──────────────────────────────────────────────
  steps.push({ phase: 'first', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: null,
    description: '开始计算 FIRST 集。FIRST(X) 是从 X 出发能推导出的串的第一个终结符集合（含 ε）。', ...L.firstIntro })

  first['F'].add('id')
  steps.push({ phase: 'first', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: 'F',
    description: "规则 F → id：产生式首符是终结符 id，FIRST(F) 加入 {id}。", ...L.firstAdd })

  first['F'].add('(')
  steps.push({ phase: 'first', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: 'F',
    description: "规则 F → ( E )：产生式首符是终结符 (，FIRST(F) 加入 {(}。", ...L.firstAdd })

  first["T'"].add('ε')
  steps.push({ phase: 'first', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: "T'",
    description: "规则 T' → ε：可推导空串，FIRST(T') 加入 {ε}。", ...L.firstEps })

  first["T'"].add('*')
  steps.push({ phase: 'first', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: "T'",
    description: "规则 T' → * F T'：首符是终结符 *，FIRST(T') 加入 {*}。", ...L.firstAdd })

  for (const f of first['F']) { if (f !== 'ε') first['T'].add(f) }
  steps.push({ phase: 'first', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: 'T',
    description: "规则 T → F T'：首符由 FIRST(F)\\{ε} 决定（F 不能推 ε），FIRST(T) = {id, (}。", ...L.firstAdd })

  first["E'"].add('ε')
  steps.push({ phase: 'first', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: "E'",
    description: "规则 E' → ε：可推导空串，FIRST(E') 加入 {ε}。", ...L.firstEps })

  first["E'"].add('+')
  steps.push({ phase: 'first', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: "E'",
    description: "规则 E' → + T E'：首符是终结符 +，FIRST(E') 加入 {+}。", ...L.firstAdd })

  for (const f of first['T']) { if (f !== 'ε') first['E'].add(f) }
  steps.push({ phase: 'first', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: 'E',
    description: "规则 E → T E'：首符由 FIRST(T)\\{ε} 决定（T 不能推 ε），FIRST(E) = {id, (}。", ...L.firstAdd })

  // ── 阶段 2：FOLLOW 集计算 ──────────────────────────────────────────────
  steps.push({ phase: 'follow', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: null,
    description: '开始计算 FOLLOW 集。FOLLOW(A) 是能紧跟在 A 后面出现的终结符集合（开始符号加 $）。', ...L.followIntro })

  follow['E'].add('$')
  steps.push({ phase: 'follow', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: 'E',
    description: 'E 是文法开始符号，FOLLOW(E) 初始加入 $。', ...L.followStart })

  follow['E'].add(')')
  steps.push({ phase: 'follow', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: 'E',
    description: "规则 F → ( E )：E 右边直接是 )，FOLLOW(E) 加入 {)}。现 FOLLOW(E) = {$, )}。", ...L.followRest })

  for (const f of follow['E']) follow["E'"].add(f)
  steps.push({ phase: 'follow', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: "E'",
    description: "规则 E → T E'：E' 处于产生式末尾，FOLLOW(E') ⊇ FOLLOW(E) = {$, )}。", ...L.followCopy })

  follow['T'].add('+')
  steps.push({ phase: 'follow', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: 'T',
    description: "规则 E → T E'：T 后面是 E'，FIRST(E')\\{ε} = {+}，FOLLOW(T) 加入 {+}。", ...L.followRest })

  for (const f of follow["E'"]) follow['T'].add(f)
  steps.push({ phase: 'follow', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: 'T',
    description: "E' 可推 ε，故 FOLLOW(T) ⊇ FOLLOW(E')，FOLLOW(T) = {+, $, )}。", ...L.followCopy })

  for (const f of follow['T']) follow["T'"].add(f)
  steps.push({ phase: 'follow', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: "T'",
    description: "规则 T → F T'：T' 处于末尾，FOLLOW(T') ⊇ FOLLOW(T) = {+, $, )}。", ...L.followCopy })

  follow['F'].add('*')
  steps.push({ phase: 'follow', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: 'F',
    description: "规则 T → F T'：F 后面是 T'，FIRST(T')\\{ε} = {*}，FOLLOW(F) 加入 {*}。", ...L.followRest })

  for (const f of follow["T'"]) follow['F'].add(f)
  steps.push({ phase: 'follow', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightNT: 'F',
    description: "T' 可推 ε，故 FOLLOW(F) ⊇ FOLLOW(T')，FOLLOW(F) = {*, +, $, )}。", ...L.followCopy })

  // ── 阶段 3：构建 LL(1) 分析表 ──────────────────────────────────────────
  steps.push({ phase: 'table', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table), highlightCell: null,
    description: '开始构建 LL(1) 分析表。规则：对 A→α，将其填入 M[A,t]，t∈FIRST(α)\\{ε}；若 ε∈FIRST(α) 则对 FOLLOW(A) 中每个 t 也填入。', ...L.tableIntro })

  function fillTable(nt, production, desc) {
    const fa = firstOfSequence(production, first)
    for (const t of fa) {
      if (t !== 'ε' && TERMINALS.includes(t)) table[nt][t] = production.join(' ')
    }
    if (fa.has('ε')) {
      for (const t of follow[nt]) {
        if (TERMINALS.includes(t)) table[nt][t] = production.join(' ')
      }
    }
    steps.push({ phase: 'table', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table),
      highlightCell: { nt, production: production.join(' ') }, description: desc,
      ...(fa.has('ε') ? L.tableFillEps : L.tableFill) })
  }

  fillTable('E', ['T', "E'"], "E → T E'：FIRST(T E') = {id, (}，填 M[E, id] = M[E, (] = \"T E'\"。")
  fillTable("E'", ['+', 'T', "E'"], "E' → + T E'：FIRST = {+}，填 M[E', +] = \"+ T E'\"。")
  fillTable("E'", ['ε'], "E' → ε：ε∈FIRST，对 FOLLOW(E') = {$, )} 填 M[E', $] = M[E', )] = ε。")
  fillTable('T', ['F', "T'"], "T → F T'：FIRST = {id, (}，填 M[T, id] = M[T, (] = \"F T'\"。")
  fillTable("T'", ['*', 'F', "T'"], "T' → * F T'：FIRST = {*}，填 M[T', *] = \"* F T'\"。")
  fillTable("T'", ['ε'], "T' → ε：ε∈FIRST，对 FOLLOW(T') = {+, $, )} 填 M[T', +] = M[T', $] = M[T', )] = ε。")
  fillTable('F', ['(', 'E', ')'], "F → ( E )：FIRST = {(}，填 M[F, (] = \"( E )\"。")
  fillTable('F', ['id'], "F → id：FIRST = {id}，填 M[F, id] = \"id\"。")

  // ── 阶段 4：模拟解析 `id + id * id` ────────────────────────────────────
  const inputArr = ['id', '+', 'id', '*', 'id', '$']
  const parseStack = ['$', 'E']
  steps.push({ phase: 'parse', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table),
    stack: [...parseStack], input: [...inputArr], action: '初始化', highlight: null,
    description: "开始 LL(1) 驱动解析 id + id * id $。初始栈 = [$, E]（栈顶在右）。", ...L.parseInit })

  let inputPos = 0
  const input = [...inputArr]

  function pushParseStep(action, hl, desc, lines = null) {
    steps.push({ phase: 'parse', firstSets: cloneSets(first), followSets: cloneSets(follow), table: cloneTable(table),
      stack: [...parseStack], input: input.slice(inputPos), action, highlight: hl, description: desc,
      ...(lines || {}) })
  }

  let iters = 0
  while (parseStack.length > 0 && iters < 40) {
    iters++
    const top = parseStack[parseStack.length - 1]
    const curr = input[inputPos]
    if (top === curr) {
      parseStack.pop()
      if (top !== '$') inputPos++
      const act = top === '$' ? '接受！' : `匹配 ${top}`
      pushParseStep(act, null, top === '$' ? '栈顶和输入均为 $，解析成功接受！' : `栈顶 "${top}" == 输入 "${curr}"，匹配消去，指针前进。`,
        top === '$' ? L.parseAccept : L.parseMatch)
      if (top === '$') break
    } else if (TERMINALS.includes(top)) {
      pushParseStep(`错误：${top}≠${curr}`, null, `错误：栈顶终结符 "${top}" 与当前输入 "${curr}" 不匹配。`, L.parseErrTerm)
      break
    } else {
      const prod = table[top][curr]
      const hl = { nonTerminal: top, terminal: curr }
      if (!prod) { pushParseStep(`错误：M[${top},${curr}] 为空`, hl, `错误：查表 M[${top}, ${curr}] 为空，文法不接受此输入。`, L.parseErrEmpty); break }
      parseStack.pop()
      if (prod !== 'ε') {
        const syms = prod.split(' ').reverse()
        for (const s of syms) parseStack.push(s)
      }
      pushParseStep(`展开 ${top} → ${prod}`, hl,
        `查表 M[${top}, ${curr}] = "${prod}"，弹出 ${top}，${prod === 'ε' ? '推导为 ε（不压栈）' : `压入 ${prod}`}。`,
        prod === 'ε' ? L.parseExpandEps : L.parseExpand)
    }
  }

  return steps
}
