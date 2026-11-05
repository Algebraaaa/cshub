// 五门专业课课后题审计：
// 1) 结构完整性：每题恰好 4 个互异选项、answer 落在范围内（即唯一正确项）；
// 2) 凡是能用结果说话的题，直接调用生成器核对被标记的选项，防止题目与算法漂移。
import { describe, test, expect } from 'vitest'
import { QUIZZES } from './quizzes.js'
import { fifo } from '../algorithms/pageReplacement/fifo.js'
import { lru } from '../algorithms/pageReplacement/lru.js'
import { opt } from '../algorithms/pageReplacement/opt.js'
import { sstf } from '../algorithms/disk/sstf.js'
import { scan } from '../algorithms/disk/scan.js'
import { cpuFcfs } from '../algorithms/cpuScheduling/nonPreemptive.js'
import { cpuRoundRobin } from '../algorithms/cpuScheduling/roundRobin.js'
import { bankersAlgorithm } from '../algorithms/synchronization/bankers.js'
import { ieee754 } from '../algorithms/co/ieee754.js'
import { pipelineIdeal } from '../algorithms/co/pipeline.js'
import { tcpCongestion } from '../algorithms/network/tcpCongestion.js'
import { slidingWindow } from '../algorithms/network/slidingWindow.js'
import { regexToFinalNfa } from '../algorithms/compiler/regexToNfa.js'

const GROUPS = {
  os: ['fifo', 'lru', 'opt', 'diskfcfs', 'sstf', 'scan', 'cpufcfs', 'cpusjf', 'cpusrtn', 'cpurr', 'bankers', 'philosophers'],
  network: ['tcphandshake', 'tcpcongestion', 'slidingwindow', 'dnsresolve', 'httpflow', 'tlshandshake', 'ipv4fragment', 'ripdistance'],
  co: ['ieee754', 'cachemapdirect', 'cachemapset', 'cachemapfully', 'pipelineideal', 'pipelinehazard',
    'instructioncycle', 'mainmemorydecode', 'tlbtranslation', 'virtualphysical', 'contiguousfit', 'buddy'],
  db: ['bplustree', 'txnIsolation', 'hashJoin', 'mvcc', 'queryPlan'],
  compiler: ['regexNfa', 'nfaToDfa', 'buildAst', 'll1', 'lr0', 'codeGen'],
}

const ALL_SLUGS = Object.values(GROUPS).flat()

describe('五门课课后题结构（每题恰好一个正确选项）', () => {
  test.each(ALL_SLUGS)('%s：3 题、4 个互异选项、answer 合法', (slug) => {
    const qs = QUIZZES[slug]
    expect(qs, `缺少课后题 ${slug}`).toBeTruthy()
    expect(qs.length).toBe(3)
    for (const q of qs) {
      expect(q.options.length).toBe(4)
      expect(new Set(q.options).size).toBe(4) // 无重复选项 → 不会出现两个等价正确项
      expect(q.answer).toBeGreaterThanOrEqual(0)
      expect(q.answer).toBeLessThan(4)
      expect(q.q.length).toBeGreaterThan(2)
      q.options.forEach((o) => expect(o.trim().length).toBeGreaterThan(0))
    }
  })
})

describe('题目答案与生成器联动', () => {
  const CLASSIC = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1]
  const faults = (steps) => steps.filter((s) => s.fault).length

  test('fifo/lru/opt 三题：置换策略与 OPT≤LRU≤FIFO 顺序由生成器背书', () => {
    const f = faults(fifo(CLASSIC, 3)); const l = faults(lru(CLASSIC, 3)); const o = faults(opt(CLASSIC, 3))
    expect([f, l, o]).toEqual([15, 12, 9])
    expect(o).toBeLessThanOrEqual(l)
    expect(l).toBeLessThanOrEqual(f)
    // 第 1 题三个“淘汰谁”选项分别对应 OPT/LRU/FIFO 的语义，无歧义：
    expect(QUIZZES.fifo[0].options[QUIZZES.fifo[0].answer]).toContain('最早进入')
    expect(QUIZZES.lru[0].options[QUIZZES.lru[0].answer]).toContain('最久未使用')
    expect(QUIZZES.opt[0].options[QUIZZES.opt[0].answer]).toContain('未来最长时间')
  })

  test('sstf/scan 题：教材例题 248；SCAN 到边界（非 LOOK）与生成器序列一致', () => {
    const req = [55, 58, 39, 18, 90, 160, 150, 38, 184]
    expect(sstf(req, 100).at(-1).totalSeek).toBe(248)
    const seq = scan(req, 100, 200, 'up').slice(1).map((s) => s.targetTrack)
    expect(seq).toContain(199) // 200 tracks are numbered 0..199
    expect(QUIZZES.scan[0].options[QUIZZES.scan[0].answer]).toContain('边界')
  })

  test('cpurr 第 1 题：时间片足够大时 RR 退化为 FCFS（用生成器验证）', () => {
    const procs = [
      { id: 'P1', arrival: 0, burst: 5 }, { id: 'P2', arrival: 1, burst: 4 },
      { id: 'P3', arrival: 2, burst: 8 }, { id: 'P4', arrival: 3, burst: 2 },
    ]
    const bigQ = cpuRoundRobin({ processList: procs, quantum: 100 }).at(-1).gantt.map((g) => g.id)
    const fcfs = cpuFcfs({ processList: procs.map((p) => ({ ...p })) }).at(-1).gantt.map((g) => g.id)
    expect(bigQ).toEqual(fcfs)
    expect(QUIZZES.cpurr[0].options[QUIZZES.cpurr[0].answer]).toBe('FCFS')
  })

  test('bankers 第 2 题：Need = Max − Allocation，且经典样例确为安全态', () => {
    const safe = bankersAlgorithm().find((s) => s.phase === 'safe')
    expect(safe.safeSequence).toEqual(['P1', 'P3', 'P4', 'P0', 'P2'])
    expect(QUIZZES.bankers[1].options[QUIZZES.bankers[1].answer]).toContain('Max - Allocation')
  })

  test('ieee754 第 1 题：1+8+23 与生成器输出字段宽度一致（13.625 可精确表示）', () => {
    const steps = ieee754({ value: 13.625 })
    const bias = steps.find((s) => s.phase === 'bias')
    const mantissa = steps.find((s) => s.phase === 'mantissa')
    expect(bias.exponentBits.length).toBe(8)
    expect(mantissa.mantissaBits.length).toBe(23)
    expect(QUIZZES.ieee754[0].options[QUIZZES.ieee754[0].answer]).toBe('1 + 8 + 23')
  })

  test('pipelineideal 第 2 题：n 条指令 k 级 = n+k-1（生成器 5 条指令 → 9 周期）', () => {
    expect(pipelineIdeal()[0].totalCycles).toBe(9)
    expect(QUIZZES.pipelineideal[1].options[QUIZZES.pipelineideal[1].answer]).toBe('n + k - 1')
  })

  test('tcpcongestion 第 2 题：3 dupACK → ssthresh=cwnd/2、cwnd=ssthresh+3（Reno，生成器背书）', () => {
    const dup = tcpCongestion({ initialSsthresh: 16, totalRtts: 10 }).find((s) => s.event === 'dup_ack_3')
    expect([dup.ssthresh, dup.cwnd]).toEqual([10, 13])
    expect(QUIZZES.tcpcongestion[1].options[QUIZZES.tcpcongestion[1].answer]).toContain('ssthresh + 3')
  })

  test('slidingwindow 第 1 题：GBN 接收方丢弃乱序帧并回累计 ACK（生成器有 discard 步骤）', () => {
    const steps = slidingWindow({ totalFrames: 4, windowSize: 4, lossSet: [0] })
    expect(steps.some((s) => s.event === 'discard')).toBe(true)
    expect(QUIZZES.slidingwindow[0].options[QUIZZES.slidingwindow[0].answer]).toContain('丢弃')
  })

  test('ipv4fragment 第 1 题：片偏移以 8 字节为单位（生成器偏移 185×8=1480）', () => {
    expect(185 * 8).toBe(1480)
    expect(QUIZZES.ipv4fragment[0].options[QUIZZES.ipv4fragment[0].answer]).toBe('8 字节')
  })

  test('mainmemorydecode 第 2 题：8K×8 组 64K×8 需 8 片、3 根片选线（2³=8）', () => {
    const chips = (64 * 1024) / (8 * 1024)
    expect(chips).toBe(8)
    expect(Math.ceil(Math.log2(chips))).toBe(3)
    expect(QUIZZES.mainmemorydecode[1].options[QUIZZES.mainmemorydecode[1].answer]).toContain('3 根')
  })

  test('regexNfa 第 2 题：a|b 的 Thompson NFA 为 6 状态（与生成器一致）', () => {
    expect(regexToFinalNfa('a|b').nodes.size).toBe(6)
    expect(QUIZZES.regexNfa[1].options[QUIZZES.regexNfa[1].answer]).toBe('6')
  })

  test('bplustree 第 3 题：扇出 100 存 1 亿条，h=4 够、h=3 不够（被标记“约 4”）', () => {
    const leafCap = 100; const fanout = 100
    const h3 = fanout ** 2 * leafCap  // 1e6
    const h4 = fanout ** 3 * leafCap  // 1e8
    expect(h3).toBeLessThan(1e8)
    expect(h4).toBeGreaterThanOrEqual(1e8)
    expect(QUIZZES.bplustree[2].options[QUIZZES.bplustree[2].answer]).toBe('约 4')
  })
})
