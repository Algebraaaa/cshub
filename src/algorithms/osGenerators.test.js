// OS 生成器正确性（口径：汤小丹《计算机操作系统》第四版；磁盘例题为教材通用经典
// 请求串，与 Silberschatz 例一致）。策略：教材锚点 + 独立参考实现对拍 + 不变量。
import { describe, test, expect } from 'vitest'
import { cpuSchedule, cpuFcfs, cpuSjf, cpuSrtn } from './cpuScheduling/nonPreemptive.js'
import { cpuRoundRobin } from './cpuScheduling/roundRobin.js'
import { fifo } from './pageReplacement/fifo.js'
import { lru } from './pageReplacement/lru.js'
import { opt } from './pageReplacement/opt.js'
import { fcfs } from './disk/fcfs.js'
import { sstf } from './disk/sstf.js'
import { scan } from './disk/scan.js'
import { bankersAlgorithm } from './synchronization/bankers.js'
import { diningPhilosophers } from './synchronization/philosophers.js'

// ── 独立参考实现（与被测代码不同的写法） ──
function refFifo(pages, cap) {
  const q = []; const frames = new Set(); let faults = 0
  for (const p of pages) {
    if (frames.has(p)) continue
    faults++
    if (q.length >= cap) frames.delete(q.shift())
    q.push(p); frames.add(p)
  }
  return faults
}
function refLru(pages, cap) {
  const order = []; let faults = 0
  for (const p of pages) {
    const i = order.indexOf(p)
    if (i >= 0) order.splice(i, 1)
    else { faults++; if (order.length >= cap) order.shift() }
    order.push(p)
  }
  return faults
}
function refOpt(pages, cap) {
  const frames = new Set(); let faults = 0
  for (let i = 0; i < pages.length; i++) {
    if (frames.has(pages[i])) continue
    faults++
    if (frames.size < cap) { frames.add(pages[i]); continue }
    let victim = null; let farthest = -1
    for (const f of frames) {
      let j = i + 1
      while (j < pages.length && pages[j] !== f) j++
      if (j === pages.length) { victim = f; break }
      if (j > farthest) { farthest = j; victim = f }
    }
    frames.delete(victim); frames.add(pages[i])
  }
  return faults
}

const CLASSIC = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1]

function faultCount(steps) {
  return steps.filter((s) => s.fault).length
}

describe('页面置换 FIFO/LRU/OPT', () => {
  test('经典 20 次访问串（3 帧）：FIFO 15 / LRU 12 / OPT 9', () => {
    // 教材通用经典例题（Silberschatz 9.x；汤小丹《计算机操作系统》第四版页面置换同类示例）
    expect(faultCount(fifo(CLASSIC, 3))).toBe(15)
    expect(faultCount(lru(CLASSIC, 3))).toBe(12)
    expect(faultCount(opt(CLASSIC, 3))).toBe(9)
  })

  test('边界：空序列不缺页；单元素容量 1 缺 1 次', () => {
    expect(faultCount(fifo([], 3))).toBe(0)
    expect(faultCount(lru([], 3))).toBe(0)
    expect(faultCount(opt([], 3))).toBe(0)
    for (const f of [fifo, lru, opt]) {
      const steps = f([5], 1)
      expect(faultCount(steps)).toBe(1)
      expect(steps.at(-1).faults).toBe(1)
    }
  })

  test('容量足够大时全部只缺页一次；命中+缺页=序列长度', () => {
    const seq = [1, 2, 3, 2, 1, 3, 1, 2]
    for (const [f] of [[fifo, refFifo], [lru, refLru], [opt, refOpt]]) {
      const steps = f(seq, 5)
      expect(faultCount(steps)).toBe(3)
      const visits = steps.filter((st) => st.currentIndex >= 0 && st.currentIndex < seq.length)
      expect(visits.length).toBe(seq.length)
      expect(visits.every((s) => s.frames.length <= 5)).toBe(true)
    }
  })

  test('随机序列与独立参考实现对拍（容量 1–5）', () => {
    const seq = []
    let seed = 42
    const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % 6 }
    for (let i = 0; i < 200; i++) seq.push(rand())
    for (const [f, ref] of [[fifo, refFifo], [lru, refLru], [opt, refOpt]]) {
      for (let cap = 1; cap <= 5; cap++) {
        expect(faultCount(f(seq, cap)), `${f.name} cap=${cap}`).toBe(ref(seq, cap))
      }
    }
  })

  test('LRU 命中更新最近使用顺序（与 FIFO 在重复访问下不同）', () => {
    // 1,2,3,2,4,1,2：LRU 靠最近命中少 1 次缺页（5），FIFO 为 6
    expect(faultCount(lru([1, 2, 3, 2, 4, 1, 2], 3))).toBe(5)
    expect(faultCount(fifo([1, 2, 3, 2, 4, 1, 2], 3))).toBe(6)
  })
})

// ── CPU 调度 ──
function refSchedule(processList, algo, quantum = 3) {
  const procs = processList.map((p) => ({ ...p, remaining: p.burst, finish: -1 }))
  if (algo === 'rr') {
    const q = []; let t = 0
    const arrived = new Set()
    const enq = () => procs.forEach((p, i) => {
      if (!arrived.has(i) && p.arrival <= t && p.remaining > 0) { q.push(i); arrived.add(i) }
    })
    enq()
    while (procs.some((p) => p.remaining > 0)) {
      if (!q.length) {
        t = Math.min(...procs.filter((p) => p.remaining > 0).map((p) => p.arrival))
        enq()
      }
      const i = q.shift()
      const run = Math.min(quantum, procs[i].remaining)
      procs[i].remaining -= run
      t += run
      enq()
      if (procs[i].remaining === 0) procs[i].finish = t
      else q.push(i)
    }
  } else {
    let t = 0
    while (procs.some((p) => p.remaining > 0)) {
      const ready = procs.filter((p) => p.arrival <= t && p.remaining > 0)
      if (!ready.length) {
        t = Math.min(...procs.filter((p) => p.remaining > 0).map((p) => p.arrival))
        continue
      }
      let pick
      if (algo === 'fcfs') {
        pick = ready.sort((a, b) => procs.indexOf(a) - procs.indexOf(b))[0]
      } else if (algo === 'sjf') {
        pick = ready.sort((a, b) => a.burst - b.burst || procs.indexOf(a) - procs.indexOf(b))[0]
      } else {
        pick = ready.sort((a, b) => a.remaining - b.remaining || a.arrival - b.arrival || procs.indexOf(a) - procs.indexOf(b))[0]
      }
      if (algo === 'srtn') {
        pick.remaining -= 1; t += 1
        if (pick.remaining === 0) pick.finish = t
      } else {
        t += pick.remaining; pick.finish = t; pick.remaining = 0
      }
    }
  }
  return procs.map((p) => ({ id: p.id, finish: p.finish, turnaround: p.finish - p.arrival, waiting: p.finish - p.arrival - p.burst }))
}

const PROCS = [
  { id: 'P1', arrival: 0, burst: 6 },
  { id: 'P2', arrival: 1, burst: 3 },
  { id: 'P3', arrival: 2, burst: 8 },
  { id: 'P4', arrival: 3, burst: 2 },
  { id: 'P5', arrival: 4, burst: 5 },
]

describe('CPU 调度', () => {
  const algos = {
    fcfs: (ps) => cpuSchedule({ algo: 'fcfs', processList: ps }),
    sjf: (ps) => cpuSchedule({ algo: 'sjf', processList: ps }),
    srtn: (ps) => cpuSchedule({ algo: 'srtn', processList: ps }),
    rr: (ps) => cpuRoundRobin({ processList: ps, quantum: 3 }),
  }

  for (const [name, run] of Object.entries(algos)) {
    test(`${name}：finish/turnaround/waiting 与独立参考实现一致`, () => {
      const steps = run(PROCS)
      const got = steps.at(-1).stats.map((s) => ({ id: s.id, finish: s.finish, turnaround: s.turnaround, waiting: s.waiting }))
      expect(got).toEqual(refSchedule(PROCS, name, 3))
    })

    test(`${name}：gantt 总执行时长等于 burst 之和且无空洞越界`, () => {
      const steps = run(PROCS)
      const g = steps.at(-1).gantt
      const totalRun = g.reduce((s, seg) => s + (seg.end - seg.start), 0)
      expect(totalRun).toBe(PROCS.reduce((s, p) => s + p.burst, 0))
      for (let i = 1; i < g.length; i++) expect(g[i].start).toBeGreaterThanOrEqual(g[i - 1].end)
      expect(gotWaitingNonNegative(steps)).toBe(true)
    })
  }

  function gotWaitingNonNegative(steps) {
    return steps.at(-1).stats.every((s) => (s.waiting === -1 ? true : s.waiting >= 0))
  }

  test('FCFS 教材短作业集：到达即服务，finish 可手算（SJF 平均等待更短）', () => {
    // 汤小丹《计算机操作系统》第四版 FCFS/SJF 例题口径：同到达 0 的作业按输入序
    const sameStart = [
      { id: 'A', arrival: 0, burst: 4 },
      { id: 'B', arrival: 0, burst: 3 },
      { id: 'C', arrival: 0, burst: 5 },
      { id: 'D', arrival: 0, burst: 2 },
    ]
    const fcfsSteps = cpuFcfs({ processList: sameStart })
    expect(fcfsSteps.at(-1).gantt.map((g) => g.id)).toEqual(['A', 'B', 'C', 'D'])
    const sjfSteps = cpuSjf({ processList: sameStart })
    expect(sjfSteps.at(-1).gantt.map((g) => g.id)).toEqual(['D', 'B', 'A', 'C'])
    expect(sjfSteps.at(-1).avgWaiting).toBeLessThan(fcfsSteps.at(-1).avgWaiting)
  })

  test('SRTN 可抢占：短作业到达立即切换', () => {
    const steps = cpuSrtn({ processList: PROCS })
    // P1(0,6) 在 t=1 P2(剩3) 到达后被抢占，先跑完的是 P2/P4 等短作业
    const finishOrder = steps
      .filter((s) => s.description?.includes('执行完毕'))
      .map((s) => s.completed.slice(-1)[0])
    expect(finishOrder[0]).not.toBe('P1')
  })

  test('RR：时间片到了重新排队（经典 4 进程 quantum=2）', () => {
    const ps = [
      { id: 'A', arrival: 0, burst: 5 },
      { id: 'B', arrival: 0, burst: 2 },
      { id: 'C', arrival: 0, burst: burst4() },
    ]
    const steps = cpuRoundRobin({ processList: ps, quantum: 2 })
    // 首个 gantt 片段是 A，B 在 2 时刻完成前 A 必须被切走
    expect(steps.at(-1).gantt[0].id).toBe('A')
    expect(steps.at(-1).gantt[0].end - steps.at(-1).gantt[0].start).toBe(2)
    expect(steps.at(-1).completed).toEqual(['A', 'B', 'C'])
  })
  function burst4() { return 4 }

  test('边界：单进程 finish=arrival+burst；空到达间隙被跳过', () => {
    const steps = cpuFcfs({ processList: [{ id: 'X', arrival: 0, burst: 3 }] })
    const f = steps.at(-1).stats[0]
    expect(f.finish).toBe(3); expect(f.waiting).toBe(0)
    const gap = cpuFcfs({ processList: [{ id: 'Y', arrival: 5, burst: 2 }] })
    expect(gap.at(-1).stats[0].finish).toBe(7)
  })
})

// ── 磁盘调度 ──
const DISK_REQ = [55, 58, 39, 18, 90, 160, 150, 38, 184]

describe('磁盘调度', () => {
  test('FCFS：顺序服务，总寻道手算可验', () => {
    const states = fcfs(DISK_REQ, 100)
    expect(states.at(-1).completed).toEqual(DISK_REQ)
    // |100-55|=45,|55-58|=3,|58-39|=19,|39-18|=21,|18-90|=72,
    // |90-160|=70,|160-150|=10,|150-38|=112,|38-184|=146 → 498
    expect(states.at(-1).totalSeek).toBe(498)
  })

  test('SSTF 教材经典例题：序列与总寻道 248', () => {
    // 汤小丹《计算机操作系统》第四版磁盘调度例题（磁头 100）
    const states = sstf(DISK_REQ, 100)
    expect(states.slice(1).map((s) => s.targetTrack)).toEqual([90, 58, 55, 39, 38, 18, 150, 160, 184])
    expect(states.at(-1).totalSeek).toBe(248)
    expect(states.at(-1).completed.sort((a, b) => a - b)).toEqual([...DISK_REQ].sort((a, b) => a - b))
  })

  test('SCAN（现行口径：到磁道边界再折返）总寻道与路径', () => {
    const states = scan(DISK_REQ, 100, 200, 'up')
    // A 200-track disk is numbered 0..199.
    expect(states.slice(1).map((s) => s.targetTrack)).toEqual([150, 160, 184, 199, 90, 58, 55, 39, 38, 18])
    expect(states.at(-1).totalSeek).toBe(280)
    expect(scan(DISK_REQ, 100, 200, 'up', 'look').at(-1).totalSeek).toBe(250)
  })

  test('SCAN down 方向对称', () => {
    const states = scan(DISK_REQ, 100, 200, 'down')
    expect(states.slice(1).map((s) => s.targetTrack)).toEqual([90, 58, 55, 39, 38, 18, 0, 150, 160, 184])
  })

  test('边界：空请求零寻道；单请求 FCFS/SSTF 一致', () => {
    expect(fcfs([], 50).at(-1).totalSeek).toBe(0)
    expect(sstf([], 50).at(-1).totalSeek).toBe(0)
    expect(fcfs([73], 50).at(-1).totalSeek).toBe(23)
    expect(sstf([73], 50).at(-1).totalSeek).toBe(23)
  })
})

describe('银行家算法', () => {
  test('经典 5 进程 3 资源样例为安全态，序列 P1→P3→P4→P0→P2', () => {
    // Silberschatz 经典例，汤小丹《计算机操作系统》第四版银行家算法引用同类数据
    const steps = bankersAlgorithm()
    const safe = steps.find((s) => s.phase === 'safe')
    expect(safe.safeSequence).toEqual(['P1', 'P3', 'P4', 'P0', 'P2'])
  })

  test('安全序列确实可执行：最终 Work = Available + ΣAllocation', () => {
    const steps = bankersAlgorithm()
    const safe = steps.find((s) => s.phase === 'safe')
    const input = steps[0]
    const sumAlloc = input.allocation.reduce((acc, row) => acc.map((v, i) => v + row[i]), [0, 0, 0])
    expect(safe.work).toEqual(input.available.map((v, i) => v + sumAlloc[i]))
  })

  test('不安全输入：无法找全序列', () => {
    const steps = bankersAlgorithm({
      input: {
        available: [0, 0, 0],
        allocation: [[0, 0, 0], [1, 0, 0]],
        max: [[1, 0, 0], [2, 0, 0]],
      },
    })
    expect(steps.at(-1).phase).toBe('unsafe')
    expect(steps.at(-1).safeSequence.length).toBeLessThan(2)
  })
})

describe('哲学家就餐（脚本化演示）', () => {
  test('naive 场景进入死锁；资源序号场景无人重复持叉', () => {
    const steps = diningPhilosophers()
    expect(steps.some((s) => s.mode === 'naive' && s.phase === 'deadlock')).toBe(true)
    // 不变量：同时在吃面的哲学家所持叉子集合两两不相交
    for (const s of steps) {
      expect(s.philosophers.length).toBe(5)
      const eating = new Set(
        s.philosophers.map((st, i) => (st === 'eating' ? i : -1)).filter((i) => i >= 0),
      )
      const used = new Set()
      for (const i of eating) {
        for (const f of [i, (i + 1) % 5]) {
          expect(used.has(f), `step 叉子 ${f} 被两位吃面者共享`).toBe(false)
          used.add(f)
          expect(s.forks[f]).toBe(i) // 吃面者必须确实持有左右叉
        }
      }
    }
    expect(steps.at(-1).phase).toBe('done')
    expect(steps.at(-1).forks.every((f) => f === -1)).toBe(true)
  })
})
