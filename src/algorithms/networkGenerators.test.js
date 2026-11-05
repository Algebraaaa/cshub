// 网络生成器正确性。口径：谢希仁《计算机网络》（第 8 版）TCP/GBN 章节，
// RFC 5681（TCP 拥塞控制）、RFC 9293（TCP）。
import { describe, test, expect } from 'vitest'
import { slidingWindow } from './network/slidingWindow.js'
import { tcpHandshake } from './network/tcpHandshake.js'
import { tcpCongestion } from './network/tcpCongestion.js'

describe('Go-Back-N 滑动窗口', () => {
  test('无丢包：帧按序确认，窗口滑动到全部完成', () => {
    const steps = slidingWindow({ totalFrames: 6, windowSize: 3, lossSet: [] })
    const done = steps.at(-1)
    expect(done.event).toBe('done')
    expect(done.senderBase).toBe(6)
    expect(done.receiverExpected).toBe(6)
    // 6 次发送，0 次超时
    expect(steps.filter((s) => s.event === 'send').length).toBe(6)
    expect(steps.filter((s) => s.event === 'timeout').length).toBe(0)
  })

  test('丢帧触发超时并从 base 重传，最终全部 acked（GBN 回退 N）', () => {
    const steps = slidingWindow({ totalFrames: 8, windowSize: 4, lossSet: [2, 5] })
    const done = steps.at(-1)
    expect(done.senderBase).toBe(8)
    expect(done.receiverExpected).toBe(8)
    // 丢了 2、5 两帧 → 至少两次超时
    expect(steps.filter((s) => s.event === 'timeout').length).toBeGreaterThanOrEqual(2)
    // 重传次数 > 0（send_lost 与重传的 send 总数大于总帧数）
    const sends = steps.filter((s) => s.event === 'send' || s.event === 'send_lost').length
    expect(sends).toBeGreaterThan(8)
    // 丢包事件存在
    expect(steps.some((s) => s.event === 'send_lost')).toBe(true)
  })

  test('乱序帧被接收方丢弃并重复 ACK（GBN 不缓存乱序帧）', () => {
    // window 4，丢 0：1、2、3 到达时都是乱序 → discard
    const steps = slidingWindow({ totalFrames: 4, windowSize: 4, lossSet: [0] })
    expect(steps.some((s) => s.event === 'discard')).toBe(true)
  })

  test('边界：0 帧立即完成；窗口=1 退化为停等', () => {
    expect(slidingWindow({ totalFrames: 0, windowSize: 3 }).at(-1).event).toBe('done')
    const steps = slidingWindow({ totalFrames: 3, windowSize: 1, lossSet: [1] })
    expect(steps.at(-1).receiverExpected).toBe(3)
  })
})

describe('TCP 三次握手与四次挥手', () => {
  const steps = tcpHandshake({ initialClientSeq: 100, initialServerSeq: 300 })
  const packets = steps.filter((s) => s.packet).map((s) => s.packet)

  test('握手三段：SYN → SYN+ACK → ACK，序号正确', () => {
    const hs = packets.slice(0, 3)
    expect(hs[0].flags).toEqual(['SYN'])
    expect(hs[0].seq).toBe(100)
    expect(hs[1].flags).toEqual(['SYN', 'ACK'])
    expect(hs[1].seq).toBe(300)
    expect(hs[1].ack).toBe(101)
    expect(hs[2].flags).toEqual(['ACK'])
    expect(hs[2].ack).toBe(301)
  })

  test('握手后双方 ESTABLISHED', () => {
    const est = steps.find((s) => s.clientState === 'ESTABLISHED' && s.serverState === 'ESTABLISHED')
    expect(est).toBeTruthy()
  })

  test('挥手：FIN → ACK → FIN+ACK → ACK，客户端经过 TIME_WAIT', () => {
    const waves = steps.filter((s) => s.phase === 'wave').map((s) => s.packet.flags)
    expect(waves).toEqual([['FIN'], ['ACK'], ['FIN', 'ACK'], ['ACK']])
    expect(steps.some((s) => s.clientState === 'TIME_WAIT')).toBe(true)
    expect(steps.at(-1).clientState).toBe('CLOSED')
    expect(steps.at(-1).serverState).toBe('CLOSED')
  })

  test('自定义初始序号正确传播（ISN 随机性）', () => {
    const s = tcpHandshake({ initialClientSeq: 7, initialServerSeq: 9 })
    expect(s[1].packet.seq).toBe(7)
    expect(s[2].packet.ack).toBe(8)
  })
})

describe('TCP Reno 拥塞控制（RFC 5681）', () => {
  test('慢启动指数增长到 ssthresh 后转拥塞避免线性增长', () => {
    const steps = tcpCongestion({ initialSsthresh: 16, totalRtts: 9 })
    const cwnds = steps.map((s) => s.cwnd)
    expect(cwnds.slice(0, 6)).toEqual([1, 2, 4, 8, 16, 17])
    expect(steps[4].phase).toBe('congestion_avoidance')
  })

  test('3 个重复 ACK：ssthresh=cwnd/2，cwnd=ssthresh+3，再进入拥塞避免', () => {
    const steps = tcpCongestion({ initialSsthresh: 16, totalRtts: 12 })
    const dup = steps.find((s) => s.event === 'dup_ack_3')
    expect(dup.rtt).toBe(10)
    expect(dup.ssthresh).toBe(10) // floor(21/2)
    expect(dup.cwnd).toBe(13)
    expect(dup.phase).toBe('fast_recovery')
    const next = steps.find((s) => s.rtt === 11)
    expect(next.cwnd).toBe(10)
    expect(next.phase).toBe('congestion_avoidance')
  })

  test('超时：ssthresh=cwnd/2 且 cwnd 归 1，回到慢启动', () => {
    const steps = tcpCongestion({ initialSsthresh: 16, totalRtts: 20 })
    const to = steps.find((s) => s.event === 'timeout')
    expect(to.rtt).toBe(18)
    expect(to.ssthresh).toBe(8)
    expect(to.cwnd).toBe(1)
    expect(to.phase).toBe('slow_start')
  })
})
