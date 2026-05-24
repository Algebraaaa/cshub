// TCP three-way handshake + four-way termination step generator.

const STATES = {
  CLIENT: {
    CLOSED: 'CLOSED',
    SYN_SENT: 'SYN_SENT',
    ESTABLISHED: 'ESTABLISHED',
    FIN_WAIT_1: 'FIN_WAIT_1',
    FIN_WAIT_2: 'FIN_WAIT_2',
    TIME_WAIT: 'TIME_WAIT',
  },
  SERVER: {
    LISTEN: 'LISTEN',
    SYN_RCVD: 'SYN_RCVD',
    ESTABLISHED: 'ESTABLISHED',
    CLOSE_WAIT: 'CLOSE_WAIT',
    LAST_ACK: 'LAST_ACK',
    CLOSED: 'CLOSED',
  },
}

export function tcpHandshake({ initialClientSeq = 100, initialServerSeq = 300 } = {}) {
  const steps = []
  const x = initialClientSeq
  const y = initialServerSeq
  const dataSeq = x + 1
  const dataAck = y + 1
  const finSeq = x + 2
  const serverFinSeq = y + 1

  function push(step) {
    steps.push({
      event: step.packet ? step.packet.flags.join('+').toLowerCase() : step.phase,
      metrics: {
        client: step.clientState,
        server: step.serverState,
      },
      ...step,
    })
  }

  push({
    phase: 'init',
    clientState: STATES.CLIENT.CLOSED,
    serverState: STATES.SERVER.LISTEN,
    packet: null,
    description: '初始：服务端调用 listen() 进入 LISTEN，客户端尚未发起连接。',
    cppLine: 1,
    pythonLine: 1,
  })

  push({
    phase: 'handshake',
    clientState: STATES.CLIENT.SYN_SENT,
    serverState: STATES.SERVER.LISTEN,
    packet: { from: 'client', to: 'server', flags: ['SYN'], seq: x, ack: null, label: '1', text: `SYN seq=${x}` },
    description: `1. 客户端发送 SYN(seq=${x})，进入 SYN_SENT。`,
    cppLine: 3,
    pythonLine: 3,
  })

  push({
    phase: 'handshake',
    clientState: STATES.CLIENT.SYN_SENT,
    serverState: STATES.SERVER.SYN_RCVD,
    packet: { from: 'server', to: 'client', flags: ['SYN', 'ACK'], seq: y, ack: x + 1, label: '2', text: `SYN seq=${y}, ACK=${x + 1}` },
    description: `2. 服务端回复 SYN+ACK(seq=${y}, ack=${x + 1})，进入 SYN_RCVD。`,
    cppLine: 5,
    pythonLine: 5,
  })

  push({
    phase: 'handshake',
    clientState: STATES.CLIENT.ESTABLISHED,
    serverState: STATES.SERVER.SYN_RCVD,
    packet: { from: 'client', to: 'server', flags: ['ACK'], seq: x + 1, ack: y + 1, label: '3', text: `ACK=${y + 1}` },
    description: `3. 客户端发送 ACK(ack=${y + 1})，客户端进入 ESTABLISHED。`,
    note: '三次握手用于确认双方的发送与接收能力，并避免历史 SYN 报文导致服务端建立无效连接。',
    cppLine: 7,
    pythonLine: 7,
  })

  push({
    phase: 'established',
    clientState: STATES.CLIENT.ESTABLISHED,
    serverState: STATES.SERVER.ESTABLISHED,
    packet: null,
    description: '三次握手完成：双方进入 ESTABLISHED，可以开始数据传输。',
    cppLine: 8,
    pythonLine: 8,
  })

  push({
    phase: 'established',
    clientState: STATES.CLIENT.ESTABLISHED,
    serverState: STATES.SERVER.ESTABLISHED,
    packet: { from: 'client', to: 'server', flags: ['PSH', 'ACK'], seq: dataSeq, ack: dataAck, label: 'DATA', text: `seq=${dataSeq}, ACK=${dataAck}` },
    description: '数据传输阶段：连接保持 ESTABLISHED，双方可持续读写。',
    cppLine: 9,
    pythonLine: 9,
  })

  push({
    phase: 'wave',
    clientState: STATES.CLIENT.FIN_WAIT_1,
    serverState: STATES.SERVER.ESTABLISHED,
    packet: { from: 'client', to: 'server', flags: ['FIN'], seq: finSeq, ack: dataAck, label: '1', text: `FIN seq=${finSeq}, ACK=${dataAck}` },
    description: `1. 客户端主动关闭，发送 FIN(seq=${finSeq})，进入 FIN_WAIT_1。`,
    cppLine: 11,
    pythonLine: 11,
  })

  push({
    phase: 'wave',
    clientState: STATES.CLIENT.FIN_WAIT_2,
    serverState: STATES.SERVER.CLOSE_WAIT,
    packet: { from: 'server', to: 'client', flags: ['ACK'], seq: serverFinSeq, ack: finSeq + 1, label: '2', text: `ACK=${finSeq + 1}` },
    description: `2. 服务端确认 FIN，回复 ACK(ack=${finSeq + 1})；客户端进入 FIN_WAIT_2，服务端进入 CLOSE_WAIT。`,
    note: '此时 TCP 处于半关闭状态：客户端不再发送数据，但服务端可能仍有数据要发。',
    cppLine: 13,
    pythonLine: 13,
  })

  push({
    phase: 'wave',
    clientState: STATES.CLIENT.FIN_WAIT_2,
    serverState: STATES.SERVER.LAST_ACK,
    packet: { from: 'server', to: 'client', flags: ['FIN', 'ACK'], seq: serverFinSeq, ack: finSeq + 1, label: '3', text: `FIN seq=${serverFinSeq}, ACK=${finSeq + 1}` },
    description: `3. 服务端处理完剩余数据，发送 FIN(seq=${serverFinSeq})，进入 LAST_ACK。`,
    cppLine: 15,
    pythonLine: 15,
  })

  push({
    phase: 'wave',
    clientState: STATES.CLIENT.TIME_WAIT,
    serverState: STATES.SERVER.LAST_ACK,
    packet: { from: 'client', to: 'server', flags: ['ACK'], seq: finSeq + 1, ack: serverFinSeq + 1, label: '4', text: `ACK=${serverFinSeq + 1}` },
    description: `4. 客户端回复最后的 ACK(ack=${serverFinSeq + 1})，进入 TIME_WAIT。`,
    note: 'TIME_WAIT 等待 2MSL：保证最后一个 ACK 可重传，并让旧连接报文自然消失。',
    cppLine: 17,
    pythonLine: 17,
  })

  push({
    phase: 'closed',
    clientState: STATES.CLIENT.TIME_WAIT,
    serverState: STATES.SERVER.CLOSED,
    packet: null,
    description: '服务端收到最后 ACK 后进入 CLOSED；客户端继续停留在 TIME_WAIT。',
    cppLine: 19,
    pythonLine: 19,
  })

  push({
    phase: 'closed',
    clientState: STATES.CLIENT.CLOSED,
    serverState: STATES.SERVER.CLOSED,
    packet: null,
    description: '2MSL 后客户端从 TIME_WAIT 进入 CLOSED，连接彻底关闭。',
    cppLine: 20,
    pythonLine: 20,
  })

  return steps
}
