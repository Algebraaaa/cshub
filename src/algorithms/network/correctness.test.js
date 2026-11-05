// 网络算法正确性回归
//
// 口径：谢希仁《计算机网络》（第8版）；GBN 与 TCP Reno 同时对照 RFC 793/RFC 5681。
//   Go-Back-N：最终全部帧按序确认，发送次数 = 首发 + 超时重传（参考实现对拍）
//   TCP Reno：慢启动翻倍、ssthresh 切换、3 重复 ACK 快恢复、超时回慢启动
//   三次握手：SYN → SYN+ACK → ACK，ack 号正确，客户端进 ESTABLISHED
import { describe, test, expect } from 'vitest'
import { slidingWindow } from './slidingWindow.js'
import { tcpCongestion } from './tcpCongestion.js'
import { tcpHandshake } from './tcpHandshake.js'

const lastOf = (steps) => steps[steps.length - 1]

// ── Go-Back-N 参考实现 ───────────────────────────────────────
function refGbn(total, win, losses) {
  const frames = Array.from({ length: total }, () => 'pending')
  let base = 0, next = 0, exp = 0
  const lost = new Set()
  let sends = 0
  while (base < total) {
    while (next < base + win && next < total && frames[next] !== 'acked') {
      frames[next] = 'in_flight'
      const seq = next
      const willLose = losses.includes(seq) && !lost.has(seq)
      sends++
      if (willLose) { lost.add(seq); frames[seq] = 'lost'; next++; continue }
      if (seq === exp) { exp++; frames[seq] = 'acked' }
      else frames[seq] = 'pending'
      next++
    }
    while (base < total && frames[base] === 'acked') base++
    if (base < total && frames[base] !== 'acked') {
      for (let i = base; i < next; i++) frames[i] = 'pending'
      next = base
    }
  }
  return { sends, exp, allAcked: frames.every(f => f === 'acked') }
}

describe('Go-Back-N 滑动窗口', () => {
  test('全部帧最终按序确认，发送次数与参考一致', () => {
    const steps = slidingWindow({ totalFrames: 8, windowSize: 4, lossSet: [2, 5] })
    const last = lastOf(steps)
    const ref = refGbn(8, 4, [2, 5])
    const sendCount = steps.filter(s => s.event === 'send' || s.event === 'send_lost').length
    expect(sendCount).toBe(ref.sends)
    expect(last.receiverExpected).toBe(8)
    expect(last.frames.every(f => f.state === 'acked')).toBe(true)
  })

  test('丢帧触发 GBN 回退重传（窗口内未确认帧一起重发）', () => {
    const steps = slidingWindow({ totalFrames: 5, windowSize: 4, lossSet: [1] })
    // 出现过 timeout 事件
    expect(steps.some(s => s.event === 'timeout')).toBe(true)
    const last = lastOf(steps)
    expect(last.frames.every(f => f.state === 'acked')).toBe(true)
  })

  test('无丢帧时无超时重传', () => {
    const steps = slidingWindow({ totalFrames: 4, windowSize: 4, lossSet: [] })
    expect(steps.some(s => s.event === 'timeout')).toBe(false)
    expect(lastOf(steps).frames.every(f => f.state === 'acked')).toBe(true)
  })

  test('与参考实现对拍（多组丢帧）', () => {
    const cases = [
      [8, 4, [2, 5]],
      [6, 3, [0]],
      [10, 5, [3, 7]],
      [5, 2, []],
    ]
    for (const [total, win, losses] of cases) {
      const steps = slidingWindow({ totalFrames: total, windowSize: win, lossSet: losses })
      const ref = refGbn(total, win, losses)
      const sendCount = steps.filter(s => s.event === 'send' || s.event === 'send_lost').length
      expect(sendCount).toBe(ref.sends)
      expect(lastOf(steps).frames.every(f => f.state === 'acked')).toBe(true)
    }
  })
})

// ── TCP Reno 参考实现 ────────────────────────────────────────
function refReno(ssthresh0, total) {
  let cwnd = 1, ssthresh = ssthresh0, phase = 'slow_start'
  const out = []
  for (let rtt = 1; rtt <= total; rtt++) {
    const event = rtt === 10 ? 'dup_ack_3' : rtt === 18 ? 'timeout' : 'ack'
    if (event === 'dup_ack_3') {
      ssthresh = Math.max(2, Math.floor(cwnd / 2))
      cwnd = ssthresh + 3
      phase = 'fast_recovery'
    } else if (event === 'timeout') {
      ssthresh = Math.max(2, Math.floor(cwnd / 2))
      cwnd = 1
      phase = 'slow_start'
    } else if (phase === 'fast_recovery') {
      phase = 'congestion_avoidance'
      cwnd = ssthresh
    } else if (phase === 'slow_start') {
      cwnd *= 2
      if (cwnd >= ssthresh) { cwnd = ssthresh; phase = 'congestion_avoidance' }
    } else {
      cwnd += 1
    }
    out.push([rtt, cwnd, phase])
  }
  return out
}

describe('TCP Reno 拥塞控制', () => {
  test('cwnd 轨迹与参考一致（慢启动/CA/快恢复/超时）', () => {
    const steps = tcpCongestion({ initialSsthresh: 16, totalRtts: 24 })
    const gen = steps.filter(s => s.rtt > 0).map(s => [s.rtt, s.cwnd, s.phase])
    const ref = refReno(16, 24)
    expect(gen.length).toBe(ref.length)
    for (let i = 0; i < ref.length; i++) {
      expect(gen[i][0]).toBe(ref[i][0])
      expect(gen[i][1]).toBe(ref[i][1])
    }
  })

  test('慢启动翻倍直到 ssthresh', () => {
    const steps = tcpCongestion({ initialSsthresh: 16, totalRtts: 5 })
    const cwnds = steps.filter(s => s.rtt > 0).map(s => s.cwnd)
    expect(cwnds).toEqual([2, 4, 8, 16, 17])
  })

  test('3 个重复 ACK 触发快恢复（ssthresh 减半，cwnd=ssthresh+3）', () => {
    const steps = tcpCongestion({ initialSsthresh: 16, totalRtts: 10 })
    const rtt10 = steps.find(s => s.rtt === 10)
    expect(rtt10.event).toBe('dup_ack_3')
    // rtt9 cwnd=21 → ssthresh=floor(21/2)=10, cwnd=13
    expect(rtt10.ssthresh).toBe(10)
    expect(rtt10.cwnd).toBe(13)
  })

  test('超时回慢启动（cwnd=1）', () => {
    const steps = tcpCongestion({ initialSsthresh: 16, totalRtts: 18 })
    const rtt18 = steps.find(s => s.rtt === 18)
    expect(rtt18.event).toBe('timeout')
    expect(rtt18.cwnd).toBe(1)
    expect(rtt18.phase).toBe('slow_start')
  })
})

// ── 三次握手 ─────────────────────────────────────────────────
describe('TCP 三次握手', () => {
  test('握手包序列 SYN → SYN+ACK → ACK，ack 号正确', () => {
    const steps = tcpHandshake()
    const handshake = steps.filter(s => s.phase === 'handshake')
    expect(handshake.length).toBe(3)
    expect(handshake[0].packet.flags).toEqual(['SYN'])
    expect(handshake[1].packet.flags).toEqual(['SYN', 'ACK'])
    expect(handshake[2].packet.flags).toEqual(['ACK'])
    // ack 号：服务端 ack=x+1，客户端 ack=y+1
    const x = handshake[0].packet.seq
    const y = handshake[1].packet.seq
    expect(handshake[1].packet.ack).toBe(x + 1)
    expect(handshake[2].packet.ack).toBe(y + 1)
  })

  test('握手后客户端进入 ESTABLISHED', () => {
    const steps = tcpHandshake()
    const established = steps.find(s => s.phase === 'established' && s.clientState === 'ESTABLISHED')
    expect(established).toBeTruthy()
  })
})
