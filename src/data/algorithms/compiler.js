// 编译原理学科算法（从 algorithms.js 拆出）
import { regexToNfa } from '../../algorithms/compiler/regexToNfa'
import { nfaToDfa } from '../../algorithms/compiler/nfaToDfa'
import { buildAst } from '../../algorithms/compiler/buildAst'
// 编译原理新增算法（等对应算法文件生成后取消注释）
import { ll1Steps } from '../../algorithms/compiler/ll1'
import { lr0Steps } from '../../algorithms/compiler/lr0'
import { codeGenSteps } from '../../algorithms/compiler/codeGen'

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
    // 注意：regexToNfa.js 的步骤通过 cppLine/pythonLine 引用下方代码的行号，
    // 增删行后需同步更新 src/algorithms/compiler/regexToNfa.js 里的 LINES 表。
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
}
NFA buildAlt(NFA A, NFA B) {
    int s = newState(), a = newState();
    edges.push_back({s, A.start, '\\0'});
    edges.push_back({s, B.start, '\\0'});
    edges.push_back({A.accept, a, '\\0'});
    edges.push_back({B.accept, a, '\\0'});
    return {s, a};
}
NFA buildStar(NFA A) {
    int s = newState(), a = newState();
    edges.push_back({s, A.start, '\\0'});        // 进入 A
    edges.push_back({s, a, '\\0'});              // 跳过（零次）
    edges.push_back({A.accept, A.start, '\\0'}); // 循环
    edges.push_back({A.accept, a, '\\0'});       // 收束
    return {s, a};
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
    // 注意：nfaToDfa.js 的步骤通过 cppLine/pythonLine 引用下方代码的行号，
    // 增删行后需同步更新 src/algorithms/compiler/nfaToDfa.js 里的 LINES 表。
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
}

void subsetConstruction(NFA nfa) {
    auto start = epsilonClosure({nfa.start});
    vector<StateSet> dfaStates = {start};
    queue<StateSet> work; work.push(start);
    while (!work.empty()) {
        StateSet D = work.front(); work.pop();
        for (char c : alphabet) {
            auto target = epsilonClosure(move(D, c));
            if (target.empty()) continue;
            if (!contains(dfaStates, target)) {
                dfaStates.push_back(target); work.push(target);
            }
            dfaEdges.push_back({D, c, target});
        }
    }
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
    // 注意：buildAst.js 的步骤通过 cppLine/pythonLine 引用下方代码的行号，
    // 增删行后需同步更新 src/algorithms/compiler/buildAst.js 里的 LINES 表。
    code: {
      cpp: `struct Node { string op; int value; Node *l, *r; };

Node* parseExpr() {
    Node* left = parseTerm();
    while (peek() == '+' || peek() == '-') {
        char op = consume();
        Node* right = parseTerm();
        left = new Node{string(1, op), 0, left, right};
    }
    return left;
}
Node* parseTerm() {
    Node* left = parseFactor();
    while (peek() == '*' || peek() == '/') {
        char op = consume();
        Node* right = parseFactor();
        left = new Node{string(1, op), 0, left, right};
    }
    return left;
}
Node* parseFactor() {
    if (peek() == '(') {
        consume();                 // '('
        Node* e = parseExpr();
        consume();                 // ')'
        return e;
    }
    return new Node{"num", consumeNumber(), nullptr, nullptr};
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

  ll1: {
    slug: 'll1',
    name: 'LL(1) 分析表',
    nameEn: 'LL(1) Parse Table',
    category: 'compilerSyn',
    difficulty: '进阶',
    fn: ll1Steps,
    viz: 'll1',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(|G|)',
    stable: true,
    inPlace: false,
    description: '自顶向下的预测分析：先计算 FIRST/FOLLOW 集，构造 LL(1) 分析表，再用栈 + 输入串驱动解析。',
    intuition: `**什么是 LL(1) 分析？**

LL(1)：从**左**到右扫描输入，产生**最左**推导，向前看 **1** 个符号做决策。

**三步走：**

**第一步：计算 FIRST 集**
\`FIRST(A)\` = 从 A 出发能推导出的所有串的首终结符集合。
例：\`E → T E'\`，\`T → F T'\`，\`F → id | ( E )\`
→ \`FIRST(F) = {id, (}\`，\`FIRST(T) = FIRST(F) = {id, (}\`，\`FIRST(E) = {id, (}\`

**第二步：计算 FOLLOW 集**
\`FOLLOW(A)\` = 在某个句型中紧跟 A 之后出现的终结符集合。
\`FOLLOW(E) = {), $}\`（E 后面要么是 \`)\` 要么是串尾 \`$\`）

**第三步：填表**
对每条产生式 \`A → α\`：
- 对 \`FIRST(α)\` 中每个终结符 \`a\`，填 \`M[A,a] = α\`
- 若 ε ∈ \`FIRST(α)\`，再对 \`FOLLOW(A)\` 中每个终结符填 ε 产生式

**解析过程（下推自动机）**
栈：\`[$ E]\`，输入：\`id + id * id $\`
查表 M[E, id] = T E'，弹出 E，压入 E' T（逆序压栈）
循环直到栈空。`,
    pseudocode: `// 计算 FIRST 集（迭代到不动点）
function computeFirst(grammar):
    for each terminal a: FIRST[a] = {a}
    repeat until no change:
        for each rule A → X1 X2 ... Xk:
            add FIRST(X1) - {ε} to FIRST[A]
            if ε ∈ FIRST(X1): add FIRST(X2) - {ε} ...
            if all Xi can derive ε: add ε to FIRST[A]

// 构建 LL(1) 分析表
function buildTable(grammar, FIRST, FOLLOW):
    for each rule A → α:
        for each a in FIRST(α) - {ε}: M[A][a] = α
        if ε in FIRST(α):
            for each b in FOLLOW[A]: M[A][b] = ε

// LL(1) 解析
function parse(input, table):
    stack = ['$', 'S']
    while stack.top != '$':
        X = stack.top; a = input.peek
        if X is terminal: match and advance
        else: push reverse(table[X][a])`,
    // 注意：ll1.js 的步骤通过 cppLine/pythonLine 引用下方代码的行号，
    // 增删行后需同步更新 src/algorithms/compiler/ll1.js 里的 LINES 表。
    code: {
      cpp: `void computeFirst(Rules& rules, Sets& first) {
    bool changed = true;
    while (changed) { changed = false;
        for (auto& [lhs, rhs] : rules) {
            size_t before = first[lhs].size();
            for (auto& sym : rhs) {
                addAllButEps(first[lhs], first[sym]);
                if (!first[sym].count("ε")) break;
                if (&sym == &rhs.back()) first[lhs].insert("ε");
            }
            changed |= first[lhs].size() != before;
        }
    }
}
void computeFollow(Rules& rules, Sets& first, Sets& follow) {
    follow["E"].insert("$");                  // 开始符号
    for (auto& [lhs, rhs] : rules)
        for (int i = 0; i < rhs.size(); i++) {
            if (!isNonTerminal(rhs[i])) continue;
            auto rest = firstOfSeq(rhs, i + 1, first);
            addAllButEps(follow[rhs[i]], rest);
            if (rest.count("ε") || i + 1 == rhs.size())
                addAll(follow[rhs[i]], follow[lhs]);
        }
}
void buildTable(Rules& rules, Sets& first, Sets& follow, Table& M) {
    for (auto& [lhs, rhs] : rules) {
        auto fa = firstOfSeq(rhs, 0, first);
        for (auto& t : fa) if (t != "ε") M[lhs][t] = rhs;
        if (fa.count("ε"))
            for (auto& t : follow[lhs]) M[lhs][t] = {"ε"};
    }
}
bool parse(vector<string> tokens, Table& M) {
    vector<string> stk = {"$", "E"};
    int pos = 0;
    while (!stk.empty()) {
        string top = stk.back(), cur = tokens[pos];
        if (top == "$" && cur == "$") return true; // 接受
        if (top == cur) { stk.pop_back(); pos++; } // 匹配
        else if (isTerminal(top)) return false;    // 不匹配
        else {
            auto prod = M[top][cur];               // 查表
            if (prod.empty()) return false;        // 表空 → 拒绝
            stk.pop_back();
            if (prod != Prod{"ε"})
                pushReversed(stk, prod);           // 逆序压栈
        }
    }
    return false;
}`,
      python: `def compute_first(rules, first):
    changed = True
    while changed:
        changed = False
        for lhs, rhs in rules:
            before = len(first[lhs])
            for sym in rhs:
                first[lhs] |= first[sym] - {'ε'}
                if 'ε' not in first[sym]: break
            else:
                first[lhs].add('ε')
            changed |= len(first[lhs]) != before

def compute_follow(rules, first, follow, start):
    follow[start].add('$')          # 开始符号
    for lhs, rhs in rules:
        for i, A in enumerate(rhs):
            if not is_nonterminal(A): continue
            rest = first_of_seq(rhs[i+1:], first)
            follow[A] |= rest - {'ε'}
            if 'ε' in rest or i == len(rhs) - 1:
                follow[A] |= follow[lhs]

def build_table(rules, first, follow, table):
    for lhs, rhs in rules:
        fa = first_of_seq(rhs, first)
        for t in fa - {'ε'}:
            table[lhs][t] = rhs
        if 'ε' in fa:
            for t in follow[lhs]:
                table[lhs][t] = ('ε',)

def parse(tokens, table):
    stack, pos = ['$', 'E'], 0
    while stack:
        top, cur = stack[-1], tokens[pos]
        if top == cur == '$':
            return True             # 接受
        if top == cur:
            stack.pop(); pos += 1   # 匹配终结符
        elif top in TERMINALS:
            raise SyntaxError(top)  # 终结符不匹配
        else:
            prod = table[top][cur]  # 查表
            if prod is None:
                raise SyntaxError(cur)
            stack.pop()
            if prod != ('ε',):
                stack.extend(reversed(prod))`,
    },
    applications: [
      '手写解析器（Recursive Descent Parser 是 LL(1) 的递归实现）',
      'JSON/XML/YAML 等配置文件解析器',
      'GCC/Clang 前端（GCC 用 LALR(1)，理解 LL 是基础）',
      '编译原理课大作业：实现 miniC 编译器',
      '408 编译原理：语法分析章节必考点',
    ],
  },

  lr0: {
    slug: 'lr0',
    name: 'LR(0) 归约',
    nameEn: 'LR(0) Parsing',
    category: 'compilerSyn',
    difficulty: '进阶',
    fn: lr0Steps,
    viz: 'lr0',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(|states|)',
    stable: true,
    inPlace: false,
    description: '自底向上的移进-归约分析：构造 LR(0) 项集族（自动机），生成 ACTION/GOTO 表，用状态栈驱动解析。',
    intuition: `**LR 分析为什么比 LL 更强？**

LL(k) 只能向前看 k 个符号来决定用哪条产生式**展开**（自顶向下）。
LR(k) 等待看到更多输入再决定是否**归约**（自底向上），能处理更多文法。

**LR(0) 项（Item）**
产生式带一个点 \`·\`，表示当前已看到点左边的符号：
\`E → E · + T\`：已识别 \`E\`，等待 \`+ T\`
\`E → E + T ·\`：点在最右，**可以归约**

**构造 LR(0) 项集族**
1. 增广文法加入 \`S' → · E\`
2. \`closure\`：若项集含 \`A → α · B β\`，则加入所有 \`B → · γ\`
3. \`goto(I, X)\`：把 I 中所有 \`A → α · X β\` 的点右移一位，再取 closure

**ACTION 表（移进/归约）**
- 点在字符前 → 移进（shift）
- 点在最右 → 归约（reduce）

**解析过程**
状态栈 + 符号栈，每步查 ACTION 表决定 shift 还是 reduce：
- shift：把下一个输入压栈
- reduce：弹出产生式右部长度的栈帧，查 GOTO 压新状态`,
    pseudocode: `// 构造 LR(0) 项集族
function buildItems(grammar):
    I0 = closure({S' → ·S})
    C = {I0}
    repeat:
        for each I in C, symbol X:
            J = goto(I, X)
            if J not empty and J not in C: add J to C

function goto(I, X):
    J = { A→αX·β | A→α·Xβ ∈ I }
    return closure(J)

// 填 ACTION 表
for each state I:
    for each [A→α·aβ] in I: ACTION[I][a] = shift goto(I,a)
    for each [A→α·] in I: ACTION[I][*] = reduce A→α

// 解析循环
function parse(input, table):
    stack = [0]
    while True:
        s = stack.top; a = input.peek
        if ACTION[s][a] = shift t: push t; advance
        elif ACTION[s][a] = reduce A→β:
            pop |β| states; push GOTO[stack.top][A]
        elif ACTION[s][a] = accept: return OK`,
    // 注意：lr0.js 的步骤通过 cppLine/pythonLine 引用下方代码的行号，
    // 增删行后需同步更新 src/algorithms/compiler/lr0.js 里的 LINES 表。
    code: {
      cpp: `set<Item> closure(set<Item> items, Grammar& g) {
    bool changed = true;
    while (changed) { changed = false;
        for (auto& [r, d] : items) {
            if (d >= g.rules[r].rhs.size()) continue;
            char B = g.rules[r].rhs[d];
            for (int i = 0; i < g.rules.size(); i++)
                if (g.rules[i].lhs == B)
                    changed |= items.insert({i, 0}).second;
        }
    }
    return items;
}
vector<set<Item>> buildStates(Grammar& g) {
    auto I0 = closure({{0, 0}}, g);
    vector<set<Item>> states = {I0};
    queue<set<Item>> work; work.push(I0);
    while (!work.empty()) {
        auto I = work.front(); work.pop();
        for (char X : symbolsAfterDot(I)) {
            auto J = closure(gotoSet(I, X), g);
            if (!J.empty() && !contains(states, J)) {
                states.push_back(J); work.push(J);
            }
        }
    }
    return states;
}
void buildTable(vector<set<Item>>& states, Grammar& g) {
    for (int i = 0; i < states.size(); i++) {
        for (auto& [r, dot] : states[i]) {
            auto& rule = g.rules[r];
            if (dot < rule.rhs.size() && isTerminal(rule.rhs[dot]))
                ACTION[i][rule.rhs[dot]] = shift(gotoId(i, rule.rhs[dot]));
            else if (dot == rule.rhs.size())
                rule.isStart ? ACTION[i]['$'] = accept()
                             : fillReduce(ACTION[i], r);
        }
        for (char nt : NON_TERMINALS)
            GOTO[i][nt] = gotoId(i, nt);
    }
}
bool parse(vector<string> tokens) {
    vector<int> stk = {0}; int pos = 0;
    while (true) {
        Action act = ACTION[stk.back()][tokens[pos]];
        if (act.kind == ERROR) return false;
        if (act.kind == ACCEPT) return true;
        if (act.kind == SHIFT) { stk.push_back(act.state); pos++; }
        else {  // REDUCE
            auto& rule = g.rules[act.rule];
            stk.resize(stk.size() - rule.rhs.size());
            stk.push_back(GOTO[stk.back()][rule.lhs]);
        }
    }
}`,
      python: `def closure(items, grammar):
    items, changed = set(items), True
    while changed:
        changed = False
        for (rule_id, dot) in list(items):
            rhs = grammar[rule_id][1]
            if dot >= len(rhs): continue
            B = rhs[dot]
            for i, (lhs, _) in enumerate(grammar):
                if lhs == B and (i, 0) not in items:
                    items.add((i, 0)); changed = True
    return items

def build_states(grammar):
    I0 = closure({(0, 0)}, grammar)
    states, work = [I0], [I0]
    while work:
        I = work.pop(0)
        for X in symbols_after_dot(I):
            J = closure(goto(I, X), grammar)
            if J and J not in states:
                states.append(J); work.append(J)
    return states

def build_table(states, grammar):
    for i, I in enumerate(states):
        for (r, dot) in I:
            lhs, rhs = grammar[r]
            if dot < len(rhs) and is_terminal(rhs[dot]):
                ACTION[i][rhs[dot]] = ('shift', goto_id(i, rhs[dot]))
            elif dot == len(rhs):
                if lhs == "S'": ACTION[i]['$'] = 'accept'
                else: fill_reduce(ACTION[i], r)
        for nt in NON_TERMINALS:
            GOTO[i][nt] = goto_id(i, nt)

def parse(tokens):
    stack, pos = [0], 0
    while True:
        act = ACTION[stack[-1]].get(tokens[pos])
        if act is None: raise SyntaxError(tokens[pos])
        if act == 'accept': return True
        if act[0] == 'shift':
            stack.append(act[1]); pos += 1
        else:  # reduce
            lhs, rhs = grammar[act[1]]
            del stack[-len(rhs):]
            stack.append(GOTO[stack[-1]][lhs])`,
    },
    applications: [
      'yacc / bison（LALR(1) 是 LR(0) 的加强版，底层思路相同）',
      'GCC、Clang 的语法分析器底层',
      '编译原理课大作业：实现 LR 分析器',
      '面试高频：「LL 和 LR 分析的区别？LR(1) 比 LR(0) 多什么？」',
      '408 编译原理：语法分析第二部分必考',
    ],
  },

  codeGen: {
    slug: 'codeGen',
    name: '代码生成',
    nameEn: 'Code Generation (TAC → ASM)',
    category: 'compilerCode',
    difficulty: '进阶',
    fn: codeGenSteps,
    viz: 'codeGen',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    stable: true,
    inPlace: false,
    description: '编译器后端：将 AST 翻译为三地址码（TAC），再映射到简单伪汇编指令序列，展示表达式求值顺序与临时变量分配。',
    intuition: `**前端产出 AST，后端怎么变成机器码？**

编译器后端分三步：
1. **AST → 中间表示（IR / TAC）**：把树状结构线性化
2. **IR 优化**（常量折叠、公共子表达式消除等，本可视化略）
3. **IR → 目标代码**（寄存器分配 + 指令选择）

**三地址码（Three-Address Code）**
每条指令最多三个操作数，形如 \`t1 = b + c\`。
这种形式很适合后续优化和寄存器分配。

**AST 后序遍历 → TAC**
对 \`a = (b + c) * d\`：
\`\`\`
后序遍历：b → c → + → d → * → a → =
生成：t1 = b + c
      t2 = t1 * d
      a  = t2
\`\`\`

**TAC → 伪汇编**
每条 TAC 指令映射到若干汇编指令：
\`\`\`
t1 = b + c  →  LOAD r1, b
                LOAD r2, c
                ADD  r1, r1, r2
                STORE t1, r1
\`\`\`

**临时变量（Temps）**：编译器自动分配 t1、t2、t3 等，不对应源码变量，只在寄存器分配后才知道用哪个物理寄存器。`,
    pseudocode: `// AST → 三地址码（后序遍历）
function genCode(node):
    case node.type of
        Lit(v):  return v              // 字面量直接返回
        Var(x):  return x              // 变量直接返回
        BinOp(op, l, r):
            lv = genCode(l)
            rv = genCode(r)
            t = newTemp()             // 分配新临时变量
            emit(t + " = " + lv + op + rv)
            return t
        Assign(x, expr):
            v = genCode(expr)
            emit(x + " = " + v)

// TAC → 汇编（简化，不做寄存器分配）
function tacToAsm(tac):
    for instr in tac:
        match instr:
            "t = a op b":
                emit LOAD r1, a
                emit LOAD r2, b
                emit OP  r1, r1, r2
                emit STORE t, r1
            "x = t":
                emit LOAD r1, t
                emit STORE x, r1`,
    code: {
      cpp: `string genCode(ASTNode* n, vector<string>& code, int& tmp) {
    if (n->type == Lit) return n->val;
    if (n->type == Var) return n->name;
    string l = genCode(n->left, code, tmp);
    string r = genCode(n->right, code, tmp);
    string t = "t" + to_string(++tmp);
    code.push_back(t + " = " + l + " " + n->op + " " + r);
    return t;
}
// 调用入口
void compile(ASTNode* root) {
    vector<string> tac; int tmp = 0;
    genCode(root, tac, tmp);
    for (auto& line : tac) cout << line << "\\n";
}`,
      python: `def gen_code(node, code, temps):
    if node['type'] == 'Lit': return str(node['val'])
    if node['type'] == 'Var': return node['name']
    l = gen_code(node['left'], code, temps)
    r = gen_code(node['right'], code, temps)
    t = f't{len(temps)+1}'
    temps[t] = f'{l}{node["op"]}{r}'
    code.append(f'{t} = {l} {node["op"]} {r}')
    return t`,
    },
    applications: [
      '编译器后端：GCC -O0 不优化时的代码生成',
      'LLVM IR：现代编译器的中间表示层',
      '即时编译（JIT）：Python / JavaScript 引擎把字节码编译为机器码',
      '静态分析工具：通过 TAC 做控制流/数据流分析',
      '408 编译原理：中间代码生成章节',
    ],
  },
}
