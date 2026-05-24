// CPU scheduling visualization step generator.
// Supports three classical algorithms with a shared step shape:
//   'fcfs'  — First Come First Served (non-preemptive)
//   'sjf'   — Shortest Job First (non-preemptive)
//   'srtn'  — Shortest Remaining Time Next (preemptive SJF)
//
// Step shape:
// { algo, time, running, ready, completed, processes, gantt, stats, description }

function cloneProcesses(list) {
  return list.map(p => ({ ...p, remaining: p.burst, startTime: -1, finishTime: -1, waiting: 0 }))
}

const DEFAULTS = [
  { id: 'P1', arrival: 0, burst: 6 },
  { id: 'P2', arrival: 1, burst: 3 },
  { id: 'P3', arrival: 2, burst: 8 },
  { id: 'P4', arrival: 3, burst: 2 },
  { id: 'P5', arrival: 4, burst: 5 },
]

export function cpuSchedule({ algo = 'fcfs', processList = DEFAULTS } = {}) {
  const procs = cloneProcesses(processList)
  const n = procs.length
  const steps = []
  const gantt = []  // [{ id, start, end }]
  let t = 0
  let running = null   // current process index

  function snapshot(desc) {
    const ready = procs
      .map((p, i) => ({ i, ...p }))
      .filter(x => x.arrival <= t && x.remaining > 0 && x.i !== running)
    const completed = procs.filter(p => p.remaining === 0).map(p => p.id)

    // Compute partial stats for display
    const stats = procs.map(p => ({
      id: p.id,
      arrival: p.arrival,
      burst: p.burst,
      finish: p.finishTime,
      turnaround: p.finishTime >= 0 ? p.finishTime - p.arrival : -1,
      waiting: p.finishTime >= 0 ? p.finishTime - p.arrival - p.burst : -1,
    }))

    steps.push({
      algo, time: t,
      running: running != null ? procs[running].id : null,
      runningRemaining: running != null ? procs[running].remaining : 0,
      ready: ready.map(r => ({ id: r.id, remaining: r.remaining, burst: r.burst })),
      completed,
      processes: procs.map(p => ({ ...p })),
      gantt: gantt.slice(),
      stats,
      description: desc,
    })
  }

  snapshot(`初始化：${n} 个进程，时刻 t=0`)

  // Helper: pick next process to run based on algo
  function pickNext() {
    const candidates = procs
      .map((p, i) => ({ i, ...p }))
      .filter(x => x.arrival <= t && x.remaining > 0)
    if (candidates.length === 0) return -1

    if (algo === 'fcfs') {
      // earliest arrival, ties broken by index
      candidates.sort((a, b) => a.arrival - b.arrival || a.i - b.i)
    } else if (algo === 'sjf' || algo === 'srtn') {
      // shortest burst (or remaining), ties by arrival then index
      candidates.sort((a, b) => a.remaining - b.remaining || a.arrival - b.arrival || a.i - b.i)
    }
    return candidates[0].i
  }

  const totalBurst = procs.reduce((sum, p) => sum + p.burst, 0)
  const maxTime = totalBurst + procs[0].arrival + 50  // safety cap

  while (t <= maxTime && procs.some(p => p.remaining > 0)) {
    if (algo === 'srtn') {
      // Preemptive: re-pick at every tick
      const next = pickNext()
      if (next < 0) {
        snapshot(`t=${t}：CPU 空闲（无就绪进程）`)
        t++
        continue
      }
      if (next !== running) {
        running = next
        if (procs[next].startTime < 0) procs[next].startTime = t
        snapshot(`t=${t}：选择剩余时间最短的进程 ${procs[next].id}（剩余 ${procs[next].remaining}）`)
      }
      // Execute 1 time unit
      const last = gantt[gantt.length - 1]
      if (last && last.id === procs[running].id) {
        last.end = t + 1
      } else {
        gantt.push({ id: procs[running].id, start: t, end: t + 1 })
      }
      procs[running].remaining--
      t++

      if (procs[running].remaining === 0) {
        procs[running].finishTime = t
        snapshot(`✅ t=${t}：进程 ${procs[running].id} 执行完毕`)
        running = null
      }
    } else {
      // Non-preemptive: pick once, run to completion
      if (running == null || procs[running].remaining === 0) {
        const next = pickNext()
        if (next < 0) {
          snapshot(`t=${t}：CPU 空闲（无就绪进程）`)
          t++
          continue
        }
        running = next
        procs[next].startTime = t
        snapshot(`t=${t}：${algo === 'fcfs' ? '按到达顺序' : '选择最短作业'}，调度进程 ${procs[next].id}（burst=${procs[next].burst}）`)
      }
      // Run to completion
      const p = procs[running]
      const dur = p.remaining
      gantt.push({ id: p.id, start: t, end: t + dur })
      p.remaining = 0
      p.finishTime = t + dur
      t += dur
      snapshot(`✅ t=${t}：进程 ${p.id} 执行完毕（耗时 ${dur}）`)
      running = null
    }

    // Skip ahead if no process arrived yet
    if (running == null && procs.some(p => p.remaining > 0) && !procs.some(p => p.arrival <= t && p.remaining > 0)) {
      const nextArrival = Math.min(...procs.filter(p => p.remaining > 0).map(p => p.arrival))
      if (nextArrival > t) {
        t = nextArrival
        snapshot(`⏩ t=${t}：CPU 空闲，跳到下一个进程到达时刻`)
      }
    }
  }

  // Final stats
  const stats = procs.map(p => ({
    id: p.id,
    arrival: p.arrival,
    burst: p.burst,
    finish: p.finishTime,
    turnaround: p.finishTime - p.arrival,
    waiting: p.finishTime - p.arrival - p.burst,
  }))
  const avgTurnaround = stats.reduce((s, p) => s + p.turnaround, 0) / n
  const avgWaiting = stats.reduce((s, p) => s + p.waiting, 0) / n

  steps.push({
    algo, time: t,
    running: null, runningRemaining: 0,
    ready: [],
    completed: procs.map(p => p.id),
    processes: procs.map(p => ({ ...p })),
    gantt: gantt.slice(),
    stats,
    avgTurnaround, avgWaiting,
    description: `🎉 调度完成：平均周转时间 = ${avgTurnaround.toFixed(2)}，平均等待时间 = ${avgWaiting.toFixed(2)}`,
  })

  return steps
}

export function cpuFcfs(opts = {}) { return cpuSchedule({ ...opts, algo: 'fcfs' }) }
export function cpuSjf(opts = {})  { return cpuSchedule({ ...opts, algo: 'sjf'  }) }
export function cpuSrtn(opts = {}) { return cpuSchedule({ ...opts, algo: 'srtn' }) }
