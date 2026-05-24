function makeNode(char = '') {
  return { char, children: {}, isEnd: false, id: Math.random() }
}

export function trieOps(words, queries) {
  const root = makeNode('')
  const steps = []

  function snapshot(type, word, currentPath, highlightIds, desc, cppLine, pythonLine) {
    steps.push({
      root: cloneTree(root),
      type,
      word,
      currentPath: [...currentPath],
      highlightIds: [...highlightIds],
      cppLine,
      pythonLine,
      description: desc,
    })
  }

  function cloneTree(node) {
    const clone = { char: node.char, isEnd: node.isEnd, id: node.id, children: {} }
    for (const [k, child] of Object.entries(node.children)) {
      clone.children[k] = cloneTree(child)
    }
    return clone
  }

  snapshot('init', '', [], [], `空 Trie，根节点代表空字符串，每条从根到叶的路径对应一个单词。`, 7, 8)

  for (const word of words) {
    let curr = root
    const path = [root.id]
    const ids = [root.id]

    for (let i = 0; i < word.length; i++) {
      const ch = word[i]
      snapshot('insert-step', word, path, ids,
        `插入 "${word}"，当前处理字符 '${ch}'（第 ${i + 1} 位），在节点寻找子节点 '${ch}'。`, 11, 12)

      if (!curr.children[ch]) {
        curr.children[ch] = makeNode(ch)
        snapshot('insert-new', word, path, ids,
          `节点 '${ch}' 不存在，新建节点并连接到当前路径。`, 13, 14)
      }
      curr = curr.children[ch]
      path.push(curr.id)
      ids.push(curr.id)
    }

    curr.isEnd = true
    snapshot('insert-end', word, path, ids,
      `插入完成：将末尾节点标记为单词结尾，"${word}" 已存入 Trie。`, 16, 16)
  }

  for (const q of queries) {
    let curr = root
    const path = [root.id]
    const ids = [root.id]
    let found = true

    for (let i = 0; i < q.length; i++) {
      const ch = q[i]
      snapshot('search-step', q, path, ids,
        `搜索 "${q}"，当前字符 '${ch}'，在节点中查找子节点。`, 20, 20)

      if (!curr.children[ch]) {
        found = false
        snapshot('search-miss', q, path, ids,
          `未找到子节点 '${ch}'，"${q}" 不在 Trie 中。`, 21, 22)
        break
      }
      curr = curr.children[ch]
      path.push(curr.id)
      ids.push(curr.id)
    }

    if (found) {
      snapshot(curr.isEnd ? 'search-found' : 'search-prefix', q, path, ids,
        curr.isEnd
          ? `搜索完成：末尾节点已标记为单词结尾，"${q}" 存在于 Trie 中！`
          : `路径存在但末尾未标记为单词，"${q}" 只是某个单词的前缀，非完整单词。`, 24, 24)
    }
  }

  return steps
}
