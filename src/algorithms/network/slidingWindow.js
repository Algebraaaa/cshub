// Go-Back-N sliding window protocol step generator.

export function slidingWindow({ totalFrames = 8, windowSize = 4, lossSet = [2, 5] } = {}) {
  const frames = Array.from({ length: totalFrames }, (_, i) => ({ seq: i, state: 'pending' }))
  const steps = []
  let senderBase = 0
  let senderNext = 0
  let receiverExpected = 0
  const lossTriggered = new Set()

  function snap(extra) {
    steps.push({
      totalFrames,
      windowSize,
      senderBase,
      senderNext,
      receiverExpected,
      frames: frames.map(f => ({ ...f })),
      metrics: {
        window: windowSize,
        base: senderBase,
        nextSeq: senderNext,
        expected: receiverExpected,
      },
      ...extra,
    })
  }

  snap({
    inFlight: [],
    phase: 'init',
    event: 'init',
    message: null,
    description: `Go-Back-N 初始化：总帧数 ${totalFrames}，发送窗口大小 ${windowSize}。`,
  })

  while (senderBase < totalFrames) {
    while (senderNext < senderBase + windowSize && senderNext < totalFrames && frames[senderNext].state !== 'acked') {
      frames[senderNext].state = 'in_flight'
      const seq = senderNext
      const willLose = lossSet.includes(seq) && !lossTriggered.has(seq)
      if (willLose) lossTriggered.add(seq)

      snap({
        inFlight: [{ seq, from: 'sender', to: 'receiver', lost: willLose }],
        message: { from: 'sender', to: 'receiver', label: `frame ${seq}`, lost: willLose },
        phase: 'send',
        event: willLose ? 'send_lost' : 'send',
        description: willLose
          ? `发送方发送 frame ${seq}，但该帧在链路中丢失。`
          : `发送方发送 frame ${seq}，当前窗口为 [${senderBase}, ${Math.min(senderBase + windowSize - 1, totalFrames - 1)}]。`,
      })

      if (willLose) {
        frames[seq].state = 'lost'
        senderNext += 1
        continue
      }

      if (seq === receiverExpected) {
        receiverExpected += 1
        snap({
          inFlight: [],
          message: { from: 'receiver', to: 'sender', label: `ACK ${receiverExpected}`, ack: receiverExpected },
          phase: 'ack',
          event: 'ack_in_order',
          description: `接收方按序收到 frame ${seq}，返回累计 ACK ${receiverExpected}。`,
        })
        frames[seq].state = 'acked'
      } else {
        snap({
          inFlight: [],
          message: { from: 'receiver', to: 'sender', label: `ACK ${receiverExpected}`, ack: receiverExpected, duplicate: true },
          phase: 'discard',
          event: 'discard',
          description: `接收方期待 frame ${receiverExpected}，丢弃乱序到达的 frame ${seq}，重发 ACK ${receiverExpected}。`,
          note: 'Go-Back-N 接收方只接收按序帧；后续乱序帧即使到达，也会被丢弃。',
        })
        frames[seq].state = 'pending'
      }
      senderNext += 1
    }

    while (senderBase < totalFrames && frames[senderBase].state === 'acked') {
      senderBase += 1
      snap({
        inFlight: [],
        message: null,
        phase: 'window_slide',
        event: 'slide',
        description: `累计 ACK 推动窗口右移：base=${senderBase}，新窗口为 [${senderBase}, ${Math.min(senderBase + windowSize - 1, totalFrames - 1)}]。`,
      })
    }

    if (senderBase < totalFrames && frames[senderBase].state !== 'acked') {
      snap({
        inFlight: [],
        message: { from: 'timer', to: 'sender', label: `timeout ${senderBase}`, timeout: true },
        phase: 'timeout',
        event: 'timeout',
        description: `frame ${senderBase} 超时：Go-Back-N 从 base 开始重传所有已发送但未确认的帧。`,
        note: 'GBN 的代价是简单但粗暴：只要最早未确认帧超时，窗口内后续未确认帧也要一起回退重传。',
      })

      for (let i = senderBase; i < senderNext; i += 1) {
        frames[i].state = 'pending'
      }
      senderNext = senderBase
    }
  }

  snap({
    inFlight: [],
    message: null,
    phase: 'done',
    event: 'done',
    description: `所有帧传输完成：共发送 ${steps.filter(s => s.event === 'send' || s.event === 'send_lost').length} 次，包含丢包后的重传。`,
  })

  return steps
}
