// Round Robin CPU scheduling visualization step generator.
//
// Step shape (compatible with CPUSchedulePlayground):
// { algo, time, running, runningRemaining, ready, completed, processes, gantt, stats,
//   quantum, quantumLeft, description }

const DEFAULTS = [
  { id: 'P1', arrival: 0, burst: 5 },
  { id: 'P2', arrival: 1, burst: 4 },
  { id: 'P3', arrival: 2, burst: 8 },
  { id: 'P4', arrival: 3, burst: 2 },
]

export function cpuRoundRobin({ processList = DEFAULTS, quantum = 3 } = {}) {
  const procs = processList.map(p => ({ ...p, remaining: p.burst, startTime: -1, finishTime: -1 }))
  const n = procs.length
  const steps = []
  const gantt = []
  const queue = [] // indices of ready processes (FIFO)
  let t = 0
  let runningIdx = -1
  let quantumLeft = 0

  function statsSnapshot() {
    return procs.map(p => ({
      id: p.id, arrival: p.arrival, burst: p.burst,
      finish: p.finishTime,
      turnaround: p.finishTime >= 0 ? p.finishTime - p.arrival : -1,
      waiting: p.finishTime >= 0 ? p.finishTime - p.arrival - p.burst : -1,
    }))
  }

  function snapshot(desc) {
    steps.push({
      algo: 'rr', time: t,
      running: runningIdx >= 0 ? procs[runningIdx].id : null,
      runningRemaining: runningIdx >= 0 ? procs[runningIdx].remaining : 0,
      ready: queue.map(i => ({ id: procs[i].id, remaining: procs[i].remaining })),
      completed: procs.filter(p => p.remaining === 0).map(p => p.id),
      processes: procs.map(p => ({ ...p })),
      gantt: gantt.slice(),
      stats: statsSnapshot(),
      quantum,
      quantumLeft,
      description: desc,
    })
  }

  // Push newly arrived processes (at time t) into the queue
  const arrived = new Set()
  function enqueueArrivals() {
    for (let i = 0; i < n; i++) {
      if (!arrived.has(i) && procs[i].arrival <= t && procs[i].remaining > 0) {
        queue.push(i)
        arrived.add(i)
      }
    }
  }

  enqueueArrivals()
  snapshot(`初始化 RR：时间片 quantum = ${quantum}，已到达 ${queue.length} 个进程进入就绪队列`)

  const maxIter = 500
  let iter = 0
  while (procs.some(p => p.remaining > 0) && iter++ < maxIter) {
    if (runningIdx < 0) {
      if (queue.length === 0) {
        // CPU idle; jump to next arrival
        const nextT = Math.min(...procs.filter(p => p.remaining > 0).map(p => p.arrival))
        if (nextT > t) {
          t = nextT
          enqueueArrivals()
          snapshot(`⏩ CPU 空闲，跳到 t=${t}`)
        }
        continue
      }
      runningIdx = queue.shift()
      quantumLeft = quantum
      if (procs[runningIdx].startTime < 0) procs[runningIdx].startTime = t
      snapshot(`t=${t}：从队头取出 ${procs[runningIdx].id}（剩余 ${procs[runningIdx].remaining}），分配时间片 ${quantum}`)
    }

    // Execute 1 time unit
    const last = gantt[gantt.length - 1]
    if (last && last.id === procs[runningIdx].id && last.end === t) {
      last.end = t + 1
    } else {
      gantt.push({ id: procs[runningIdx].id, start: t, end: t + 1 })
    }
    procs[runningIdx].remaining--
    quantumLeft--
    t++
    enqueueArrivals()

    if (procs[runningIdx].remaining === 0) {
      procs[runningIdx].finishTime = t
      const finishedId = procs[runningIdx].id
      runningIdx = -1
      quantumLeft = 0
      snapshot(`✅ t=${t}：${finishedId} 执行完毕`)
    } else if (quantumLeft === 0) {
      // Preempt: put back to the tail of queue
      const preemptedId = procs[runningIdx].id
      queue.push(runningIdx)
      runningIdx = -1
      snapshot(`⏱️ t=${t}：${preemptedId} 时间片用完（剩余 ${procs[queue[queue.length - 1]].remaining}），放回队尾`)
    }
  }

  const stats = statsSnapshot()
  const avgTurnaround = stats.reduce((s, p) => s + p.turnaround, 0) / n
  const avgWaiting = stats.reduce((s, p) => s + p.waiting, 0) / n

  steps.push({
    algo: 'rr', time: t,
    running: null, runningRemaining: 0,
    ready: [],
    completed: procs.map(p => p.id),
    processes: procs.map(p => ({ ...p })),
    gantt: gantt.slice(),
    stats,
    avgTurnaround, avgWaiting,
    quantum, quantumLeft: 0,
    description: `🎉 RR 调度完成：平均周转 = ${avgTurnaround.toFixed(2)}，平均等待 = ${avgWaiting.toFixed(2)}`,
  })

  return steps
}
