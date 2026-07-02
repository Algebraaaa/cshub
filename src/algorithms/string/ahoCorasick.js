// AC 自动机 (Aho-Corasick Automaton)
//
// 步骤：
//   1. 将所有模式串逐字符插入 Trie
//   2. BFS 构建 fail 指针
//   3. 沿文本逐字符扫描，跟踪 fail 链收集匹配

export function ahoCorasick({
  patterns = ['he', 'she', 'his', 'hers'],
  text = 'ahishers',
} = {}) {
  const steps = []
  let nextId = 0

  // Trie node factory
  function makeNode(char) {
    return { id: nextId++, char, children: {}, isEnd: false, fail: 0, count: 0 }
  }

  const nodes = [makeNode('')]  // root = id 0

  function cloneNodes() {
    return nodes.map(n => ({ ...n, children: { ...n.children } }))
  }

  function snap(phase, extra = {}) {
    steps.push({
      text,
      patterns,
      trie: { nodes: cloneNodes() },
      currentNode: extra.currentNode ?? 0,
      textIdx: extra.textIdx ?? -1,
      matchStart: extra.matchStart ?? -1,
      matchEnd: extra.matchEnd ?? -1,
      phase,
      failPath: extra.failPath ?? [],
      matches: extra.matches ? extra.matches.map(m => ({ ...m })) : [],
      cppLine: extra.cppLine ?? 0,
      pythonLine: extra.pythonLine ?? 0,
      description: extra.description ?? '',
    })
  }

  // ── Phase 1: Build Trie ────────────────────────────────
  snap('insert', {
    cppLine: 8, pythonLine: 7,
    description: `开始构建 Trie，插入 ${patterns.length} 个模式串：[${patterns.join(', ')}]`,
  })

  for (let pi = 0; pi < patterns.length; pi++) {
    const pat = patterns[pi]
    let cur = 0

    snap('insert', {
      currentNode: cur,
      cppLine: 12, pythonLine: 10,
      description: `插入模式串 "${pat}"（第 ${pi + 1}/${patterns.length} 个），从根节点开始`,
    })

    for (let ci = 0; ci < pat.length; ci++) {
      const ch = pat[ci]
      if (nodes[cur].children[ch] !== undefined) {
        cur = nodes[cur].children[ch]
        snap('insert', {
          currentNode: cur,
          cppLine: 15, pythonLine: 13,
          description: `字符 '${ch}' 已存在于 Trie（节点 ${cur}），继续沿路径前进`,
        })
      } else {
        const newNode = makeNode(ch)
        nodes[cur].children[ch] = newNode.id
        cur = newNode.id
        nodes.push(newNode)
        snap('insert', {
          currentNode: cur,
          cppLine: 18, pythonLine: 16,
          description: `创建新节点 ${cur}（字符 '${ch}'），挂在节点 ${nodes[cur].fail /* parent id not stored, using 0 placeholder */} 下`,
        })
      }
    }

    nodes[cur].isEnd = true
    nodes[cur].count = 1
    snap('insert', {
      currentNode: cur,
      cppLine: 21, pythonLine: 19,
      description: `模式串 "${pat}" 插入完成，标记节点 ${cur} 为终止节点`,
    })
  }

  snap('insert-done', {
    cppLine: 23, pythonLine: 21,
    description: `Trie 构建完成，共 ${nodes.length} 个节点。`,
  })

  // ── Phase 2: Build fail links (BFS) ───────────────────
  const queue = []

  // Root's direct children: fail → root
  for (const ch in nodes[0].children) {
    const childId = nodes[0].children[ch]
    nodes[childId].fail = 0
    queue.push(childId)
    snap('buildFail', {
      currentNode: childId,
      failPath: [childId, 0],
      cppLine: 29, pythonLine: 27,
      description: `根的子节点 ${childId}（'${nodes[childId].char}'）：fail → 0（根）`,
    })
  }

  while (queue.length > 0) {
    const u = queue.shift()

    for (const ch in nodes[u].children) {
      const v = nodes[u].children[ch]
      let f = nodes[u].fail

      snap('buildFail', {
        currentNode: v,
        failPath: [u],
        cppLine: 35, pythonLine: 33,
        description: `处理节点 ${v}（'${nodes[v].char}'），从父节点 ${u} 的 fail=${f} 开始查找`,
      })

      while (f !== 0 && nodes[f].children[ch] === undefined) {
        snap('buildFail', {
          currentNode: v,
          failPath: [v, f],
          cppLine: 37, pythonLine: 35,
          description: `fail 链回溯：节点 ${f} 没有字符 '${ch}' 的子节点，继续跳 fail[${f}]=${nodes[f].fail}`,
        })
        f = nodes[f].fail
      }

      nodes[v].fail = nodes[f].children[ch] !== undefined ? nodes[f].children[ch] : 0
      if (nodes[v].fail === v) nodes[v].fail = 0  // avoid self-loop

      // Accumulate count from fail chain
      nodes[v].count += nodes[nodes[v].fail].count

      snap('buildFail', {
        currentNode: v,
        failPath: [v, nodes[v].fail],
        cppLine: 39, pythonLine: 37,
        description: `节点 ${v}（'${nodes[v].char}'）的 fail → ${nodes[v].fail}${nodes[nodes[v].fail].char ? "（'" + nodes[nodes[v].fail].char + "'）" : '（根）'}，count=${nodes[v].count}`,
      })

      queue.push(v)
    }
  }

  snap('buildFail-done', {
    cppLine: 42, pythonLine: 40,
    description: `fail 指针构建完成。所有节点的 fail 链已就绪。`,
  })

  // ── Phase 3: Search ────────────────────────────────────
  const matches = []
  let cur = 0

  snap('search', {
    currentNode: cur,
    textIdx: -1,
    matches,
    cppLine: 47, pythonLine: 45,
    description: `开始在文本 "${text}" 中搜索，当前在根节点。`,
  })

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    snap('search', {
      currentNode: cur,
      textIdx: i,
      matches,
      cppLine: 50, pythonLine: 48,
      description: `扫描 text[${i}]='${ch}'，当前节点 ${cur}`,
    })

    const failTrace = []
    while (cur !== 0 && nodes[cur].children[ch] === undefined) {
      failTrace.push(cur)
      snap('search', {
        currentNode: cur,
        textIdx: i,
        failPath: [cur, nodes[cur].fail],
        matches,
        cppLine: 52, pythonLine: 50,
        description: `节点 ${cur} 无字符 '${ch}' 的子节点，沿 fail 跳到 ${nodes[cur].fail}`,
      })
      cur = nodes[cur].fail
    }

    if (nodes[cur].children[ch] !== undefined) {
      cur = nodes[cur].children[ch]
    }

    snap('search', {
      currentNode: cur,
      textIdx: i,
      failPath: failTrace,
      matches,
      cppLine: 55, pythonLine: 53,
      description: `转移到节点 ${cur}（'${nodes[cur].char}'），对应 text[${i}]='${ch}'`,
    })

    // Collect matches along the fail chain
    let tmp = cur
    while (tmp !== 0) {
      if (nodes[tmp].isEnd) {
        // Find which pattern ends here
        for (const pat of patterns) {
          if (pat.length <= i + 1) {
            const start = i - pat.length + 1
            if (start >= 0 && text.substring(start, i + 1) === pat) {
              const alreadyFound = matches.some(m => m.start === start && m.pattern === pat)
              if (!alreadyFound) {
                matches.push({ pattern: pat, start, end: i })
                snap('search', {
                  currentNode: cur,
                  textIdx: i,
                  matchStart: start,
                  matchEnd: i,
                  matches,
                  cppLine: 59, pythonLine: 57,
                  description: `发现匹配！"${pat}" 出现在 text[${start}..${i}]`,
                })
              }
            }
          }
        }
      }
      tmp = nodes[tmp].fail
    }
  }

  snap('search-done', {
    currentNode: cur,
    textIdx: text.length - 1,
    matches,
    cppLine: 63, pythonLine: 61,
    description: `搜索完成，共找到 ${matches.length} 个匹配：${matches.map(m => `"${m.pattern}"[${m.start}..${m.end}]`).join(', ') || '无'}`,
  })

  return steps
}
