// 代码生成可视化：AST → TAC（三地址码）→ 伪汇编
// 支持三种预设：arith / branch / loop

function cloneAst(node, highlightId) {
  if (!node) return null
  return { ...node, highlight: node.id === highlightId, children: (node.children || []).map(c => cloneAst(c, highlightId)) }
}

// 步骤 → 详情页代码行号（data/algorithms/compiler.js 中 codeGen.code 的行号）。
// 改动那份展示代码时需同步这张表。
const LINES = {
  astVisit: { cpp: 13, python: 1 },  // genCode(root, ...) 入口/递归
  tacIntro: { cpp: 1,  python: 1 },
  tacLit:   { cpp: 2,  python: 2 },
  tacVar:   { cpp: 3,  python: 3 },
  tacNode:  { cpp: 4,  python: 4 },  // 递归处理子节点
  tacEmit:  { cpp: 7,  python: 8 },  // 生成一条 TAC
  asmEmit:  { cpp: 14, python: 8 },  // 输出指令
  done:     { cpp: 14, python: 9 },
}
function nodeLines(node) {
  if (node?.type === 'Lit') return LINES.tacLit
  if (node?.type === 'Var') return LINES.tacVar
  return LINES.tacNode
}

// arith: a = (b + c) * d - 2
const astArith = {
  id: 'r', type: 'Assign', op: '=', label: 'a = (b+c)*d-2',
  children: [
    { id: 'r_a', type: 'Var', label: 'a', children: [] },
    { id: 'r_sub', type: 'BinOp', op: '-', label: '-',
      children: [
        { id: 'r_mul', type: 'BinOp', op: '*', label: '*',
          children: [
            { id: 'r_add', type: 'BinOp', op: '+', label: '+',
              children: [
                { id: 'r_b', type: 'Var', label: 'b', children: [] },
                { id: 'r_c', type: 'Var', label: 'c', children: [] },
              ]},
            { id: 'r_d', type: 'Var', label: 'd', children: [] },
          ]},
        { id: 'r_2', type: 'Lit', label: '2', children: [] },
      ]},
  ],
}

// branch: if (x > 0) y = x else y = -x
const astBranch = {
  id: 'br', type: 'If', label: 'if (x>0)',
  children: [
    { id: 'br_cond', type: 'BinOp', op: '>', label: 'x > 0',
      children: [
        { id: 'br_x1', type: 'Var', label: 'x', children: [] },
        { id: 'br_0', type: 'Lit', label: '0', children: [] },
      ]},
    { id: 'br_then', type: 'Assign', op: '=', label: 'y = x',
      children: [
        { id: 'br_y1', type: 'Var', label: 'y', children: [] },
        { id: 'br_x2', type: 'Var', label: 'x', children: [] },
      ]},
    { id: 'br_else', type: 'Assign', op: '=', label: 'y = -x',
      children: [
        { id: 'br_y2', type: 'Var', label: 'y', children: [] },
        { id: 'br_neg', type: 'BinOp', op: 'neg', label: '-x',
          children: [{ id: 'br_x3', type: 'Var', label: 'x', children: [] }]},
      ]},
  ],
}

// loop: for i in 0..3: sum = sum + i
const astLoop = {
  id: 'lp', type: 'For', label: 'for i in 0..3',
  children: [
    { id: 'lp_init', type: 'Assign', op: '=', label: 'i = 0',
      children: [
        { id: 'lp_i1', type: 'Var', label: 'i', children: [] },
        { id: 'lp_0', type: 'Lit', label: '0', children: [] },
      ]},
    { id: 'lp_cond', type: 'BinOp', op: '<', label: 'i < 3',
      children: [
        { id: 'lp_i2', type: 'Var', label: 'i', children: [] },
        { id: 'lp_3', type: 'Lit', label: '3', children: [] },
      ]},
    { id: 'lp_body', type: 'Assign', op: '=', label: 'sum = sum+i',
      children: [
        { id: 'lp_s1', type: 'Var', label: 'sum', children: [] },
        { id: 'lp_add', type: 'BinOp', op: '+', label: '+',
          children: [
            { id: 'lp_s2', type: 'Var', label: 'sum', children: [] },
            { id: 'lp_i3', type: 'Var', label: 'i', children: [] },
          ]},
      ]},
    { id: 'lp_inc', type: 'Assign', op: '=', label: 'i = i+1',
      children: [
        { id: 'lp_i4', type: 'Var', label: 'i', children: [] },
        { id: 'lp_inc2', type: 'BinOp', op: '+', label: '+',
          children: [
            { id: 'lp_i5', type: 'Var', label: 'i', children: [] },
            { id: 'lp_1', type: 'Lit', label: '1', children: [] },
          ]},
      ]},
  ],
}

const ASTS = { arith: astArith, branch: astBranch, loop: astLoop }

export function codeGenSteps(exprId) {
  const ast = ASTS[exprId] || ASTS['arith']
  const steps = []
  const tac = []; const asm = []; const temps = {}
  let tacCount = 0; let asmCount = 0; let tempCount = 0

  function newTemp() { tempCount++; return `t${tempCount}` }
  function clearActive() { tac.forEach(t => { t.active = false }); asm.forEach(a => { a.active = false }) }

  function snap(phase, nodeId, desc, lines = null) {
    steps.push({ phase, ast: cloneAst(ast, nodeId), tac: tac.map(t => ({ ...t })), asm: asm.map(a => ({ ...a })),
      temps: { ...temps }, currentNodeId: nodeId, description: desc,
      ...(lines ? { cppLine: lines.cpp, pythonLine: lines.python } : {}) })
  }

  function addTac(instr, comment, nodeId) {
    clearActive()
    tac.push({ id: `tac${++tacCount}`, instr, active: true, comment })
    snap('tac', nodeId, `生成三地址码：${instr}${comment ? '  // ' + comment : ''}`, LINES.tacEmit)
  }

  function addAsm(instr, comment) {
    clearActive()
    asm.push({ id: `asm${++asmCount}`, instr, active: true, comment })
    snap('asm', null, `生成伪汇编：${instr}${comment ? '  ; ' + comment : ''}`, LINES.asmEmit)
  }

  // ── AST 阶段 ──────────────────────────────────────────────────────────
  snap('ast', null, `开始代码生成，输入 AST 类型：${ast.type}，标签：${ast.label}。`, LINES.astVisit)
  function visitAst(node) {
    if (!node) return
    snap('ast', node.id, `访问 AST 节点 ${node.type}（${node.label}）`, LINES.astVisit)
    for (const c of (node.children || [])) visitAst(c)
  }
  visitAst(ast)

  // ── TAC 阶段 ──────────────────────────────────────────────────────────
  snap('tac', null, '开始遍历 AST，生成三地址码（Three-Address Code）。', LINES.tacIntro)

  function genTac(node) {
    if (!node) return null
    snap('tac', node.id, `处理节点：${node.type}（${node.label}）`, nodeLines(node))
    if (node.type === 'Lit' || node.type === 'Var') return node.label
    if (node.type === 'BinOp') {
      if (node.op === 'neg') {
        const operand = genTac(node.children[0])
        const t = newTemp(); temps[t] = `-${operand}`
        addTac(`${t} = - ${operand}`, `对 ${operand} 取负`, node.id)
        return t
      }
      const left = genTac(node.children[0])
      const right = genTac(node.children[1])
      const t = newTemp(); temps[t] = `${left}${node.op}${right}`
      addTac(`${t} = ${left} ${node.op} ${right}`, `计算 ${left} ${node.op} ${right}`, node.id)
      return t
    }
    if (node.type === 'Assign') {
      const lhs = node.children[0].label
      const rhs = genTac(node.children[1])
      addTac(`${lhs} = ${rhs}`, '赋值', node.id)
      return lhs
    }
    if (node.type === 'If') {
      const cond = genTac(node.children[0])
      addTac(`if_false ${cond} goto L_else`, '条件不满足则跳转', node.id)
      addTac(`LABEL L_then`, '进入 then 分支', node.id)
      genTac(node.children[1])
      addTac(`goto L_end`, '跳过 else', node.id)
      addTac(`LABEL L_else`, '进入 else 分支', node.id)
      genTac(node.children[2])
      addTac(`LABEL L_end`, '条件语句结束', node.id)
      return null
    }
    if (node.type === 'For') {
      genTac(node.children[0])
      addTac(`LABEL L_loop`, '循环开始', node.id)
      const cond = genTac(node.children[1])
      addTac(`if_false ${cond} goto L_loop_end`, '条件不满足则退出循环', node.id)
      genTac(node.children[2])
      genTac(node.children[3])
      addTac(`goto L_loop`, '返回循环头', node.id)
      addTac(`LABEL L_loop_end`, '循环结束', node.id)
      return null
    }
    return null
  }
  genTac(ast)

  // ── ASM 阶段 ──────────────────────────────────────────────────────────
  snap('asm', null, '开始将三地址码映射为伪汇编（LOAD/STORE/ADD/SUB/MUL/NEG/CMP/JEQ/JMP/LABEL）。', LINES.asmEmit)

  const opMap = { '+': 'ADD', '-': 'SUB', '*': 'MUL', '/': 'DIV', '>': 'CMP', '<': 'CMP', '>=': 'CMP', '<=': 'CMP', '==': 'CMP' }

  for (const t of tac) {
    const instr = t.instr.trim()
    if (instr.startsWith('LABEL')) {
      addAsm(`${instr.split(' ')[1]}:`, '标签')
      continue
    }
    if (instr.startsWith('if_false')) {
      const parts = instr.split(' '); const cond = parts[1]; const label = parts[3]
      addAsm(`LOAD R0, ${cond}`, `加载条件值 ${cond}`)
      addAsm(`CMP R0, #0`, '与 0 比较')
      addAsm(`JEQ ${label}`, `条件为 false 时跳转到 ${label}`)
      continue
    }
    if (instr.startsWith('goto')) {
      const label = instr.split(' ')[1]
      addAsm(`JMP ${label}`, '无条件跳转')
      continue
    }
    const eqIdx = instr.indexOf('=')
    if (eqIdx >= 0) {
      const lhs = instr.slice(0, eqIdx).trim()
      const rhs = instr.slice(eqIdx + 1).trim()
      const parts = rhs.split(' ').filter(Boolean)
      if (parts.length === 1) {
        addAsm(`LOAD R0, ${parts[0]}`, `加载 ${parts[0]}`)
        addAsm(`STORE ${lhs}, R0`, `存储到 ${lhs}`)
      } else if (parts.length === 3) {
        const [a, op, b] = parts
        addAsm(`LOAD R0, ${a}`, `加载左操作数 ${a}`)
        addAsm(`LOAD R1, ${b}`, `加载右操作数 ${b}`)
        addAsm(`${opMap[op] || 'OP'} R0, R1`, `执行 R0 = R0 ${op} R1`)
        addAsm(`STORE ${lhs}, R0`, `存储结果到 ${lhs}`)
      } else if (parts.length === 2 && parts[0] === '-') {
        addAsm(`LOAD R0, ${parts[1]}`, `加载 ${parts[1]}`)
        addAsm(`NEG R0`, '取负')
        addAsm(`STORE ${lhs}, R0`, `存储结果到 ${lhs}`)
      }
    }
  }

  clearActive()
  steps.push({ phase: 'asm', ast: cloneAst(ast, null), tac: tac.map(t => ({ ...t })), asm: asm.map(a => ({ ...a })),
    temps: { ...temps }, currentNodeId: null,
    description: `代码生成完成。共 ${tac.length} 条三地址码，${asm.length} 条伪汇编指令。`,
    cppLine: LINES.done.cpp, pythonLine: LINES.done.python })

  return steps
}
