// 编译原理学科算法（从 algorithms.js 拆出）
import { regexToNfa } from '../../algorithms/compiler/regexToNfa'
import { nfaToDfa } from '../../algorithms/compiler/nfaToDfa'
import { buildAst } from '../../algorithms/compiler/buildAst'

export const COMPILER_ALGORITHMS = {
  regexNfa: {
    slug: 'regexNfa',
    name: '正则 → NFA',
    nameEn: 'Regex → NFA (Thompson)',
    category: 'compilerLex',
    difficulty: '进阶',
    fn: regexToNfa,
    viz: 'regexNfa',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    stable: true,
    inPlace: false,
    description: 'Thompson 构造：把正则文法按规则递归翻译成等价的非确定有限自动机。',
    intuition: `**为什么从 NFA 开始？**
直接给一段正则写匹配代码很难，但翻译成「图」之后所有事情都变机械：状态 = 节点，字符 = 边。

**Thompson 构造的核心思想：归纳。**
- **单字符 c**：起始 → c → 接收。
- **A · B（连接）**：把 A 的接收态用 ε 边接到 B 的起始态。
- **A | B（选择）**：新建起始/接收态；起始 ε 分叉到两侧；两侧接收 ε 汇回新接收。
- **A* （Kleene 闭包）**：新建起始/接收；起始 ε 既到 A 也到接收（零次匹配）；A 接收 ε 回到 A 起始（多次）+ 到新接收（终止）。

**得到的 NFA 性质：**
- 每个状态最多 2 条 ε 出边、1 条字符出边。
- 节点数线性增长（每个正则操作至多加 2 个状态）。
- 只有一个起始、一个接收。`,
    pseudocode: `function thompson(node):
    case node of
        Char c:
            new start, accept; add edge start --c--> accept
        Concat(A, B):
            (sa, aa) = thompson(A); (sb, ab) = thompson(B)
            add edge aa --ε--> sb
            return (sa, ab)
        Alt(A, B):
            new s, a
            add ε edges s→A.start, s→B.start, A.accept→a, B.accept→a
        Star(A):
            new s, a
            ε edges: s→A.start, s→a, A.accept→A.start, A.accept→a`,
    code: {
      cpp: `// Thompson 构造（简化）
struct NFA { int start, accept; };
struct Edge { int from, to; char label; };  // '\\0' = ε
vector<Edge> edges;
int newState() { static int id = 0; return id++; }

NFA buildChar(char c) {
    int s = newState(), a = newState();
    edges.push_back({s, a, c});
    return {s, a};
}
NFA buildConcat(NFA A, NFA B) {
    edges.push_back({A.accept, B.start, '\\0'});
    return {A.start, B.accept};
}`,
      python: `def thompson(node):
    if node.kind == 'Char':
        s, a = new_state(), new_state()
        edges.append((s, a, node.value))
        return s, a
    if node.kind == 'Concat':
        sa, aa = thompson(node.left)
        sb, ab = thompson(node.right)
        edges.append((aa, sb, 'ε'))
        return sa, ab
    if node.kind == 'Alt':
        s, a = new_state(), new_state()
        sa, aa = thompson(node.left); sb, ab = thompson(node.right)
        for src, dst in [(s,sa),(s,sb),(aa,a),(ab,a)]:
            edges.append((src, dst, 'ε'))
        return s, a
    if node.kind == 'Star':
        s, a = new_state(), new_state()
        sc, ac = thompson(node.child)
        for src, dst in [(s,sc),(s,a),(ac,sc),(ac,a)]:
            edges.append((src, dst, 'ε'))
        return s, a`,
    },
    applications: [
      'grep / awk / sed 的正则引擎（POSIX 标准实现）',
      '编译器/解释器的词法分析器生成（lex / flex）',
      'IDE 的语法高亮和模糊搜索',
      '日志监控系统的模式匹配',
      '408 编译原理第 3 章必考',
    ],
  },

  nfaToDfa: {
    slug: 'nfaToDfa',
    name: 'NFA → DFA',
    nameEn: 'NFA → DFA (Subset)',
    category: 'compilerLex',
    difficulty: '进阶',
    fn: nfaToDfa,
    viz: 'nfaToDfa',
    timeComplexity: { best: 'O(2^n)', average: 'O(n·|Σ|)', worst: 'O(2^n)' },
    spaceComplexity: 'O(2^n)',
    stable: true,
    inPlace: false,
    description: '子集构造：把多路 ε-NFA 转成单一选择的 DFA，每个 DFA 状态对应一个 NFA 状态集。',
    intuition: `**NFA 的问题：**
同一个状态、同一个字符可能有多条出边，运行时要「同时走多条路」——不直接可执行。

**子集构造的核心想法：**
让一个 DFA 状态代表 NFA 中「可能同时所处」的所有状态集合。每读一个字符，整个集合一起前进。

**关键操作：**
1. **ε-closure(S)**：从集合 S 出发，沿 ε 边能到达的所有状态。
2. **move(S, c)**：从集合 S 出发，沿字符 c 边能到达的状态。
3. 每个新 DFA 状态 = ε-closure(move(旧状态, c))。
4. 若一个 NFA 集合曾出现过 → 复用同一个 DFA 状态。
5. 若集合包含 NFA 接收态 → DFA 该状态也是接收态。

**复杂度警告：**
最坏 NFA n 状态 → DFA 2^n 状态（每个子集都可能成为一个 DFA 状态）。实际中常远小于这个上限，但仍需后续 DFA 最小化（Hopcroft 算法）压缩。`,
    pseudocode: `function subsetConstruction(NFA):
    DFA.start ← ε-closure({NFA.start})
    DFA.states ← {DFA.start}
    queue ← [DFA.start]
    while queue not empty:
        D ← dequeue(queue)
        for each c in alphabet:
            target ← ε-closure(move(D, c))
            if target ∉ DFA.states:
                DFA.states.add(target)
                enqueue(queue, target)
            DFA.edges.add(D --c--> target)
            if NFA.accept ∈ target:
                target.accepting ← true`,
    code: {
      cpp: `set<int> epsilonClosure(set<int> states) {
    queue<int> q; for (int s : states) q.push(s);
    while (!q.empty()) {
        int s = q.front(); q.pop();
        for (auto& e : edges)
            if (e.from == s && e.label == 0 && !states.count(e.to)) {
                states.insert(e.to); q.push(e.to);
            }
    }
    return states;
}`,
      python: `def subset_construction(nfa):
    start = eps_closure({nfa.start})
    dfa_states = [start]
    dfa_edges = []
    queue = [start]
    while queue:
        D = queue.pop(0)
        for c in alphabet:
            target = eps_closure(move(D, c))
            if not target: continue
            if target not in dfa_states:
                dfa_states.append(target); queue.append(target)
            dfa_edges.append((D, c, target))
    return dfa_states, dfa_edges`,
    },
    applications: [
      'lex / flex 等扫描器生成器（实际生成的就是 DFA 表）',
      '正则引擎的高性能路径（Re2、Hyperscan）',
      '协议解析、入侵检测的多模式匹配',
      '硬件状态机综合',
      '408 编译原理 + 形式语言课程经典',
    ],
  },

  buildAst: {
    slug: 'buildAst',
    name: '递归下降建 AST',
    nameEn: 'Recursive Descent (AST)',
    category: 'compilerSyn',
    difficulty: '中等',
    fn: buildAst,
    viz: 'buildAst',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    stable: true,
    inPlace: false,
    description: '把算术表达式 token 流解析成抽象语法树，运算优先级通过文法分层自然处理。',
    intuition: `**优先级靠文法分层。**
算术表达式的两条基本规则：
- \`* /\` 比 \`+ -\` 优先。
- 同级运算左结合：\`1 - 2 - 3\` = \`(1 - 2) - 3\`。

把这两条直接写进文法，递归下降自然把高优先级嵌进低优先级：

\`\`\`
expr   = term   (('+'|'-') term)*
term   = factor (('*'|'/') factor)*
factor = NUMBER | '(' expr ')'
\`\`\`

**核心 trick：循环 + 左结合。**
\`while (next is + or -)\` 这种写法保证 \`1+2+3\` 解析成 \`((1+2)+3)\` 而不是右结合的 \`(1+(2+3))\`。

**括号在哪里？**
括号在 factor 里。它把任意复杂的表达式「降级」回单个 factor，从而打破优先级——\`(1+2)*3\` 中 \`1+2\` 是一个 factor，所以 \`*\` 看到的是「(1+2)」整块当左操作数。

**手写还是用工具？**
递归下降是 LL(1) 的手写实现，调试好、错误信息友好。LALR 文法（yacc、bison）能处理更多语法但调试痛苦。现代编译器（Rust、TypeScript、Go）大多手写递归下降。`,
    pseudocode: `function parseExpr():           // 加减
    left ← parseTerm()
    while peek() in {'+', '-'}:
        op ← consume()
        right ← parseTerm()
        left ← BinOp(op, left, right)
    return left

function parseTerm():           // 乘除
    left ← parseFactor()
    while peek() in {'*', '/'}:
        op ← consume()
        right ← parseFactor()
        left ← BinOp(op, left, right)
    return left

function parseFactor():
    if peek() == '(':
        consume('('); e ← parseExpr(); consume(')')
        return e
    return Num(consume(NUMBER).value)`,
    code: {
      cpp: `struct Node { string op; int value; Node *l, *r; };

Node* parseExpr();
Node* parseTerm();
Node* parseFactor();

Node* parseExpr() {
    Node* left = parseTerm();
    while (peek() == '+' || peek() == '-') {
        char op = consume();
        Node* right = parseTerm();
        left = new Node{string(1, op), 0, left, right};
    }
    return left;
}`,
      python: `def parse_expr():
    left = parse_term()
    while peek() in '+-':
        op = consume()
        right = parse_term()
        left = {'op': op, 'left': left, 'right': right}
    return left

def parse_term():
    left = parse_factor()
    while peek() in '*/':
        op = consume()
        left = {'op': op, 'left': left, 'right': parse_factor()}
    return left

def parse_factor():
    if peek() == '(':
        consume('('); e = parse_expr(); consume(')'); return e
    return {'kind': 'num', 'value': int(consume())}`,
    },
    applications: [
      '所有手写编译器/解释器的前端（Rust rustc、Go gc、TypeScript）',
      '配置语言解析（JSON、TOML 部分实现）',
      'SQL 查询解析器',
      '表达式计算器、电子表格公式',
      '面试高频：手写一个四则运算计算器',
    ],
  },
}
