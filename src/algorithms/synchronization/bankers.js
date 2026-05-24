// Banker's Algorithm — deadlock avoidance via safe-sequence checking.
//
// Step shape:
// { available, max, allocation, need, processes, finished, work, safeSequence,
//   checking, phase, description }

const DEFAULT_INPUT = {
  // 5 processes, 3 resource types (A, B, C)
  available: [3, 3, 2],
  allocation: [
    [0, 1, 0], // P0
    [2, 0, 0], // P1
    [3, 0, 2], // P2
    [2, 1, 1], // P3
    [0, 0, 2], // P4
  ],
  max: [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
  ],
}

function vecSub(a, b) { return a.map((v, i) => v - b[i]) }
function vecAdd(a, b) { return a.map((v, i) => v + b[i]) }
function vecLE(a, b)  { return a.every((v, i) => v <= b[i]) }

export function bankersAlgorithm({ input = DEFAULT_INPUT } = {}) {
  const { available, allocation, max } = input
  const n = allocation.length
  const m = available.length
  const need = max.map((row, i) => vecSub(row, allocation[i]))
  const steps = []
  const processes = Array.from({ length: n }, (_, i) => `P${i}`)

  function snapshot(extra) {
    steps.push({
      available: extra.work ? extra.work.slice() : available.slice(),
      max: max.map(r => r.slice()),
      allocation: allocation.map(r => r.slice()),
      need: need.map(r => r.slice()),
      processes,
      finished: (extra.finished || []).slice(),
      work: (extra.work || available).slice(),
      safeSequence: (extra.safeSequence || []).slice(),
      checking: extra.checking !== undefined ? extra.checking : -1,
      phase: extra.phase,
      description: extra.description,
    })
  }

  // Step 1: Initialize matrices
  snapshot({
    work: available, finished: [], safeSequence: [], phase: 'init',
    description: `初始化：Available = [${available.join(', ')}]，Need = Max − Allocation`,
  })

  // Step 2: Run safety algorithm
  const work = available.slice()
  const finished = new Array(n).fill(false)
  const safeSequence = []
  let progressed = true

  snapshot({
    work, finished: [], safeSequence: [], phase: 'safety_start',
    description: `开始安全性检测：Work = Available = [${work.join(', ')}]，所有 Finish[i] = false`,
  })

  while (progressed && safeSequence.length < n) {
    progressed = false
    for (let i = 0; i < n; i++) {
      if (finished[i]) continue

      snapshot({
        work, finished: processes.filter((_, k) => finished[k]),
        safeSequence: safeSequence.slice(),
        checking: i,
        phase: 'check',
        description: `检查 P${i}：Need[${i}] = [${need[i].join(', ')}]，Work = [${work.join(', ')}]`,
      })

      if (vecLE(need[i], work)) {
        // Pretend to allocate, then release
        const newWork = vecAdd(work, allocation[i])
        for (let k = 0; k < m; k++) work[k] = newWork[k]
        finished[i] = true
        safeSequence.push(`P${i}`)
        progressed = true

        snapshot({
          work, finished: processes.filter((_, k) => finished[k]),
          safeSequence: safeSequence.slice(),
          checking: i,
          phase: 'execute',
          description: `✅ P${i} 满足条件，假设执行完成并释放：Work += Allocation[${i}] → [${work.join(', ')}]，加入安全序列`,
        })
      } else {
        snapshot({
          work, finished: processes.filter((_, k) => finished[k]),
          safeSequence: safeSequence.slice(),
          checking: i,
          phase: 'skip',
          description: `❌ P${i} Need 超过 Work，跳过`,
        })
      }
    }
  }

  if (safeSequence.length === n) {
    snapshot({
      work, finished: processes,
      safeSequence,
      phase: 'safe',
      description: `🎉 系统处于安全状态！安全序列：${safeSequence.join(' → ')}`,
    })
  } else {
    snapshot({
      work, finished: processes.filter((_, k) => finished[k]),
      safeSequence,
      phase: 'unsafe',
      description: `🚨 系统处于不安全状态！可能死锁。已找到部分序列：${safeSequence.join(' → ')}`,
    })
  }

  return steps
}
