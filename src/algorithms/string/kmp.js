export function kmp({ text, pattern }) {
  const steps = []
  const n = text.length
  const m = pattern.length

  if (m === 0) return steps

  // Compute lps array
  const lps = new Array(m).fill(0)
  let len = 0
  let i = 1

  steps.push({
    text,
    pattern,
    lps: [...lps],
    status: 'building_lps',
    cppLine: 4,
    pythonLine: 4,
    description: 'Start computing the LPS (Longest Prefix Suffix) array.',
    lpsI: 0,
    lpsLen: 0
  })

  while (i < m) {
    steps.push({
      text,
      pattern,
      lps: [...lps],
      status: 'building_lps',
      cppLine: 6, pythonLine: 7,
      description: `Compare pattern[${i}] ('${pattern[i]}') with pattern[${len}] ('${pattern[len]}')`,
      lpsI: i,
      lpsLen: len
    })

    if (pattern[i] === pattern[len]) {
      len++
      lps[i] = len
      steps.push({
        text,
        pattern,
        lps: [...lps],
        status: 'building_lps_match',
        cppLine: 7, pythonLine: 9,
        description: `Match! lps[${i}] becomes ${len}. Move to next character.`,
        lpsI: i,
        lpsLen: len
      })
      i++
    } else {
      if (len !== 0) {
        steps.push({
          text,
          pattern,
          lps: [...lps],
          status: 'building_lps_mismatch',
          cppLine: 10, pythonLine: 13,
          description: `Mismatch! Update length to lps[${len - 1}] = ${lps[len - 1]}.`,
          lpsI: i,
          lpsLen: len
        })
        len = lps[len - 1]
      } else {
        lps[i] = 0
        steps.push({
          text,
          pattern,
          lps: [...lps],
          status: 'building_lps_mismatch',
          cppLine: 12, pythonLine: 15,
          description: `Mismatch and length is 0. Set lps[${i}] to 0. Move to next character.`,
          lpsI: i,
          lpsLen: 0
        })
        i++
      }
    }
  }

  steps.push({
    text,
    pattern,
    lps: [...lps],
    status: 'lps_complete',
    cppLine: 16, pythonLine: 17,
    description: `LPS array computed: [${lps.join(', ')}]`,
    lpsI: -1,
    lpsLen: -1
  })

  // Pattern matching
  i = 0 // index for text
  let j = 0 // index for pattern

  while (n - i >= m - j) {
    steps.push({
      text,
      pattern,
      lps: [...lps],
      textIdx: i,
      patternIdx: j,
      shift: i - j,
      status: 'comparing',
      cppLine: 26, pythonLine: 27,
      description: `Compare text[${i}] ('${text[i]}') with pattern[${j}] ('${pattern[j]}')`
    })

    if (pattern[j] === text[i]) {
      j++
      i++
      if (j === m) {
        steps.push({
          text,
          pattern,
          lps: [...lps],
          textIdx: i - 1,
          patternIdx: j - 1,
          shift: i - j,
          status: 'match',
          cppLine: 28, pythonLine: 31,
          description: `Pattern found at shift ${i - j}!`
        })
        // j = lps[j - 1] // Continue searching for next matches
        steps.push({
          text,
          pattern,
          lps: [...lps],
          textIdx: i - 1,
          patternIdx: j - 1,
          shift: i - j,
          status: 'shifting',
          cppLine: 30, pythonLine: 34,
          description: `Shift pattern using lps[${j - 1}]: j becomes ${lps[j - 1]}`
        })
        j = lps[j - 1]
      }
    } else {
      steps.push({
        text,
        pattern,
        lps: [...lps],
        textIdx: i,
        patternIdx: j,
        shift: i - j,
        status: 'mismatch',
        cppLine: 29, pythonLine: 32,
        description: `Mismatch at text[${i}] and pattern[${j}].`
      })
      if (j !== 0) {
        steps.push({
          text,
          pattern,
          lps: [...lps],
          textIdx: i,
          patternIdx: j,
          shift: i - j,
          status: 'shifting',
          cppLine: 30, pythonLine: 34,
          description: `Shift pattern using lps[${j - 1}]: j becomes ${lps[j - 1]}`
        })
        j = lps[j - 1]
      } else {
        steps.push({
          text,
          pattern,
          lps: [...lps],
          textIdx: i,
          patternIdx: j,
          shift: i - j,
          status: 'shifting',
          cppLine: 31, pythonLine: 36,
          description: `j is 0, just move to next text character (i++).`
        })
        i++
      }
    }
  }

  steps.push({
    text,
    pattern,
    lps: [...lps],
    textIdx: -1,
    patternIdx: -1,
    shift: -1,
    status: 'complete',
    cppLine: 34, pythonLine: 37,
    description: 'KMP matching complete.'
  })

  return steps;
}
