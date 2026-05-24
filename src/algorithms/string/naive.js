export function naivePatternMatching({ text, pattern }) {
  const steps = []
  const n = text.length
  const m = pattern.length

  // 边界情况：空模式、空文本或模式长于文本
  if (m === 0) {
    steps.push({
      text,
      pattern,
      textIdx: null,
      patternIdx: null,
      shift: null,
      status: 'done',
      cppLine: 3,
      pythonLine: 4,
      description: '空模式，无需匹配',
    })
    return steps
  }

  if (n === 0) {
    steps.push({
      text,
      pattern,
      textIdx: null,
      patternIdx: null,
      shift: null,
      status: 'done',
      cppLine: 5,
      pythonLine: 7,
      description: '空文本，无法匹配',
    })
    return steps
  }

  if (m > n) {
    steps.push({
      text,
      pattern,
      textIdx: null,
      patternIdx: null,
      shift: null,
      status: 'done',
      cppLine: 5,
      pythonLine: 7,
      description: `模式长度 (${m}) > 文本长度 (${n})，无法匹配`,
    })
    return steps
  }

  for (let s = 0; s <= n - m; s++) {
    let match = true
    for (let j = 0; j < m; j++) {
      steps.push({
        text,
        pattern,
        textIdx: s + j,
        patternIdx: j,
        shift: s,
        status: 'comparing',
        cppLine: 8,
        pythonLine: 10,
        description: `Compare text[${s + j}] ('${text[s + j]}') with pattern[${j}] ('${pattern[j]}')`
      })

      if (text[s + j] !== pattern[j]) {
        steps.push({
          text,
          pattern,
          textIdx: s + j,
          patternIdx: j,
          shift: s,
          status: 'mismatch',
          description: `Mismatch at position ${j}. Shift pattern by 1.`
        })
        match = false
        break
      }
    }

    if (match) {
      steps.push({
        text,
        pattern,
        textIdx: s + m - 1,
        patternIdx: m - 1,
        shift: s,
        status: 'match',
        description: `Pattern found at shift ${s}!`
      })
      // If we only want the first match, we can break or continue
      // we can continue to find all matches
    }
  }

  steps.push({
    text,
    pattern,
    textIdx: -1,
    patternIdx: -1,
    shift: -1,
    status: 'complete',
    description: 'String matching complete.'
  })

  return steps
}
