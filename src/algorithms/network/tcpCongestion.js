// TCP Reno congestion control visualization.

const PHASES = {
  SLOW_START: 'slow_start',
  CONGESTION_AVOIDANCE: 'congestion_avoidance',
  FAST_RETRANSMIT: 'fast_retransmit',
  FAST_RECOVERY: 'fast_recovery',
  TIMEOUT: 'timeout',
}

export function tcpCongestion({ initialSsthresh = 16, totalRtts = 24 } = {}) {
  const steps = []
  const history = []
  let cwnd = 1
  let ssthresh = initialSsthresh
  let phase = PHASES.SLOW_START

  const SCRIPT = {
    10: 'dup_ack_3',
    18: 'timeout',
  }

  function currentPackets(event) {
    if (event === 'dup_ack_3') {
      return [
        { from: 'receiver', to: 'sender', label: 'dup ACK', count: 1, tone: 'warn' },
        { from: 'receiver', to: 'sender', label: 'dup ACK', count: 2, tone: 'warn' },
        { from: 'receiver', to: 'sender', label: 'dup ACK', count: 3, tone: 'warn' },
      ]
    }
    if (event === 'timeout') {
      return [
        { from: 'sender', to: 'receiver', label: 'DATA lost', tone: 'danger', lost: true },
      ]
    }
    if (event === 'init') return []
    return [
      { from: 'sender', to: 'receiver', label: `${Math.min(cwnd, 12)} data`, tone: 'data' },
      { from: 'receiver', to: 'sender', label: 'ACK', tone: 'ack' },
    ]
  }

  function recordStep(rtt, event, description, note) {
    history.push({ rtt, cwnd, ssthresh, phase })
    steps.push({
      rtt,
      cwnd,
      ssthresh,
      phase,
      event,
      history: history.slice(),
      packets: currentPackets(event),
      metrics: { rtt, cwnd, ssthresh, phase },
      description,
      note,
      cppLine: 1,
      pythonLine: 1,
    })
  }

  recordStep(0, 'init', `初始：cwnd=1，ssthresh=${ssthresh}，从慢启动开始探测链路容量。`)

  for (let rtt = 1; rtt <= totalRtts; rtt += 1) {
    const event = SCRIPT[rtt] || 'ack'

    if (event === 'dup_ack_3') {
      const oldCwnd = cwnd
      ssthresh = Math.max(2, Math.floor(cwnd / 2))
      cwnd = ssthresh + 3
      phase = PHASES.FAST_RECOVERY
      recordStep(
        rtt,
        event,
        `收到 3 个重复 ACK：触发快重传，ssthresh=${ssthresh}，cwnd 暂时调整为 ${cwnd}。`,
        `重复 ACK 说明后续报文仍能到达，只是中间某个报文可能丢失；因此不必等超时，直接重传缺失报文。原 cwnd=${oldCwnd}。`,
      )
      continue
    }

    if (event === 'timeout') {
      const oldCwnd = cwnd
      ssthresh = Math.max(2, Math.floor(cwnd / 2))
      cwnd = 1
      phase = PHASES.SLOW_START
      recordStep(
        rtt,
        event,
        `发生超时：认为拥塞更严重，ssthresh=${ssthresh}，cwnd 重置为 1。`,
        `超时通常意味着网络中可能丢失了多个报文，所以 TCP 退回慢启动，重新谨慎探测带宽。原 cwnd=${oldCwnd}。`,
      )
      continue
    }

    if (phase === PHASES.FAST_RECOVERY) {
      phase = PHASES.CONGESTION_AVOIDANCE
      cwnd = ssthresh
      recordStep(rtt, event, `快恢复结束：cwnd 收缩到 ssthresh=${ssthresh}，进入拥塞避免。`)
      continue
    }

    if (phase === PHASES.SLOW_START) {
      cwnd *= 2
      if (cwnd >= ssthresh) {
        cwnd = ssthresh
        phase = PHASES.CONGESTION_AVOIDANCE
        recordStep(rtt, event, `慢启动：cwnd 翻倍到 ${cwnd}，达到 ssthresh，切换到拥塞避免。`)
      } else {
        recordStep(rtt, event, `慢启动：每个 RTT 近似翻倍，当前 cwnd=${cwnd}。`)
      }
    } else {
      cwnd += 1
      recordStep(rtt, event, `拥塞避免：每个 RTT 线性增加 1，当前 cwnd=${cwnd}。`)
    }
  }

  return steps
}
