// 自动从 algorithms.js 拆分（3 个算法 · network 学科）
import { slidingWindow } from '../../algorithms/network/slidingWindow'
import { tcpCongestion } from '../../algorithms/network/tcpCongestion'
import { tcpHandshake } from '../../algorithms/network/tcpHandshake'

export const NETWORK_ALGORITHMS = {
  tcphandshake: {
    slug: 'tcphandshake',
    name: 'TCP 三次握手 / 四次挥手',
    nameEn: 'TCP Handshake & Termination',
    category: 'network',
    difficulty: '中等',
    fn: tcpHandshake,
    viz: 'tcphandshake',
    timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
    spaceComplexity: 'O(1)',
    description: 'TCP 建立连接的三次握手与关闭连接的四次挥手状态机演示。',
    intuition: `TCP 是 **面向连接** 的可靠传输协议，连接的"建立"和"关闭"都靠状态机完成。\n\n**三次握手（建立连接）**：\n1. 客户端发 SYN → 进入 SYN_SENT\n2. 服务端回 SYN+ACK → 进入 SYN_RCVD\n3. 客户端再回 ACK → 双方 ESTABLISHED\n\n为什么三次而不是两次？两次握手时，服务端无法确认 **客户端的接收能力**——历史滞留的 SYN 报文可能让服务端建立一个客户端实际没要的连接。\n\n**四次挥手（关闭连接）**：\n1. 主动方发 FIN → FIN_WAIT_1\n2. 被动方回 ACK → CLOSE_WAIT（主动方进入 FIN_WAIT_2）\n3. 被动方处理完剩余数据，发 FIN → LAST_ACK\n4. 主动方回 ACK → TIME_WAIT（等待 2MSL）\n\n为什么四次？因为 TCP 是 **全双工**，关闭要双向独立进行；ACK 和 FIN 不能合并，因为被动方收到 FIN 后可能还有数据要发。\n\n**TIME_WAIT 为什么等 2MSL**：① 保证最后一个 ACK 能到达被动方；② 防止本次连接的旧报文影响后续新连接。`,
    pseudocode: `// 建立连接
1. Client → Server: SYN, seq=x
2. Server → Client: SYN+ACK, seq=y, ack=x+1
3. Client → Server: ACK, seq=x+1, ack=y+1
   → Both ESTABLISHED

// 关闭连接（客户端主动）
4. Client → Server: FIN, seq=u
5. Server → Client: ACK, ack=u+1
6. Server → Client: FIN, seq=v
7. Client → Server: ACK, ack=v+1
   → Client TIME_WAIT (2MSL)
   → Server CLOSED`,
    code: {
      cpp: `// TCP 状态转换（伪代码，Linux 内核 tcp_input.c 简化版）
enum TCPState {
    CLOSED, LISTEN, SYN_SENT, SYN_RCVD, ESTABLISHED,
    FIN_WAIT_1, FIN_WAIT_2, CLOSE_WAIT, LAST_ACK, TIME_WAIT
};

void tcp_state_transition(TCPState& s, Event e) {
    switch (s) {
        case CLOSED:
            if (e == ACTIVE_OPEN) { send(SYN); s = SYN_SENT; }
            if (e == PASSIVE_OPEN) s = LISTEN;
            break;
        case SYN_SENT:
            if (e == RECV_SYN_ACK) { send(ACK); s = ESTABLISHED; }
            break;
        case ESTABLISHED:
            if (e == CLOSE) { send(FIN); s = FIN_WAIT_1; }
            if (e == RECV_FIN) { send(ACK); s = CLOSE_WAIT; }
            break;
        case FIN_WAIT_1:
            if (e == RECV_ACK) s = FIN_WAIT_2;
            break;
        case FIN_WAIT_2:
            if (e == RECV_FIN) { send(ACK); s = TIME_WAIT; }
            break;
        case TIME_WAIT:
            if (e == TIMEOUT_2MSL) s = CLOSED;
            break;
        // ...
    }
}`,
      python: `# Python 客户端的 TCP socket 简单示例
import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# 底层进行三次握手
sock.connect(('example.com', 80))
# 状态机：CLOSED → SYN_SENT → ESTABLISHED

sock.sendall(b'GET / HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n')
data = sock.recv(4096)

# 底层进行四次挥手
sock.close()
# 状态机：ESTABLISHED → FIN_WAIT_1 → FIN_WAIT_2 → TIME_WAIT → CLOSED`,
    },
    applications: [
      'TCP 连接管理的内核实现（Linux tcp_input.c）',
      '面试高频题：可靠传输协议的核心机制',
      '抓包工具（Wireshark / tcpdump）的状态分析依据',
      '理解 CLOSE_WAIT / TIME_WAIT 异常的根因（服务端 CLOSE_WAIT 堆积 = 没正确 close）',
      'HTTP keep-alive、长连接的底层支撑',
    ],
  },

  tcpcongestion: {
    slug: 'tcpcongestion',
    name: 'TCP 拥塞控制',
    nameEn: 'TCP Congestion Control',
    category: 'network',
    difficulty: '中等',
    fn: tcpCongestion,
    viz: 'tcpcongestion',
    timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
    spaceComplexity: 'O(1)',
    description: 'TCP Reno 拥塞控制四阶段：慢启动、拥塞避免、快重传、快恢复。',
    intuition: `TCP 不仅要 **可靠传输**，还要 **公平共享网络带宽**。拥塞控制就是动态调节 **拥塞窗口 cwnd**（一次最多能发出多少未确认报文）的算法。\n\n**四个核心阶段（Reno 版本）**：\n\n1. **慢启动 (Slow Start)**：cwnd 从 1 开始，每收到一个 ACK 加 1 → 每个 RTT cwnd 翻倍（**指数增长**）。这名字其实有点误导——增长一点都不慢。\n2. **拥塞避免 (Congestion Avoidance)**：cwnd 达到 ssthresh 后切换。每个 RTT cwnd 加 1（**线性增长**），谨慎探测带宽上限。\n3. **快重传 (Fast Retransmit)**：收到 3 个重复 ACK 时，不等超时直接重传丢失报文，比超时省一个 RTO。\n4. **快恢复 (Fast Recovery)**：快重传触发后，ssthresh = cwnd/2，cwnd = ssthresh + 3，进入拥塞避免（**不回到慢启动**）。\n\n**超时（严重拥塞）**：超时认为网络拥塞严重，ssthresh = cwnd/2，cwnd 直接重置为 1，回到慢启动。\n\n这个 AIMD（Additive Increase, Multiplicative Decrease）策略让多条 TCP 流公平共享带宽，是互联网能稳定工作的核心算法之一。\n\n现代版本：Cubic（Linux 默认）、BBR（Google）用了不同的拥塞窗口曲线，但核心思想一致。`,
    pseudocode: `procedure tcpReno():
    cwnd ← 1
    ssthresh ← 16
    while connected:
        send packets up to cwnd
        on every ACK:
            if cwnd < ssthresh:           // 慢启动
                cwnd ← cwnd + 1           // 每 RTT 翻倍
            else:                         // 拥塞避免
                cwnd ← cwnd + 1/cwnd      // 每 RTT 加 1
        on 3 duplicate ACKs:              // 快重传 + 快恢复
            ssthresh ← cwnd / 2
            cwnd ← ssthresh + 3
            retransmit lost packet
        on timeout:                       // 严重拥塞
            ssthresh ← cwnd / 2
            cwnd ← 1
            // 回到慢启动`,
    code: {
      cpp: `// Linux 内核 tcp_input.c 中拥塞控制的简化逻辑
struct tcp_sock {
    u32 cwnd;        // 拥塞窗口（单位：MSS）
    u32 ssthresh;    // 慢启动阈值
    u8  ca_state;    // OPEN / DISORDER / CWR / RECOVERY / LOSS
};

void on_ack_received(tcp_sock* sk) {
    if (sk->cwnd < sk->ssthresh) {
        sk->cwnd += 1;                // 慢启动
    } else {
        sk->cwnd += 1 / sk->cwnd;     // 拥塞避免
    }
}

void on_three_dup_acks(tcp_sock* sk) {
    sk->ssthresh = max(sk->cwnd / 2, 2);
    sk->cwnd = sk->ssthresh + 3;      // 快恢复
    retransmit_lost_segment(sk);
}

void on_timeout(tcp_sock* sk) {
    sk->ssthresh = max(sk->cwnd / 2, 2);
    sk->cwnd = 1;                     // 严重拥塞，回到慢启动
}`,
      python: `# 教学用 TCP Reno 模拟器（不是真实实现）
class TCPReno:
    def __init__(self):
        self.cwnd = 1
        self.ssthresh = 16

    def on_ack(self):
        if self.cwnd < self.ssthresh:
            self.cwnd *= 2          # 慢启动：每 RTT 翻倍
        else:
            self.cwnd += 1          # 拥塞避免：每 RTT 加 1

    def on_three_dup_acks(self):
        # 快重传 + 快恢复
        self.ssthresh = max(self.cwnd // 2, 2)
        self.cwnd = self.ssthresh + 3

    def on_timeout(self):
        # 严重拥塞
        self.ssthresh = max(self.cwnd // 2, 2)
        self.cwnd = 1               # 回到慢启动`,
    },
    applications: [
      '互联网带宽公平分配的核心机制',
      '面试高频题：能画 cwnd × 时间曲线（必考）',
      '现代变种：Cubic（Linux 默认）、BBR（Google）、Vegas',
      '理解视频会议 / 直播 / 下载工具的速率波动',
      '抓包工具中 cwnd 变化的解读',
    ],
  },

  slidingwindow: {
    slug: 'slidingwindow',
    name: '滑动窗口协议（Go-Back-N）',
    nameEn: 'Sliding Window (GBN)',
    category: 'network',
    difficulty: '中等',
    fn: slidingWindow,
    viz: 'slidingwindow',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n·W)' },
    spaceComplexity: 'O(W)',
    description: '可靠传输的核心机制：发送方维护窗口，连续发送，按累计 ACK 推进。',
    intuition: `**滑动窗口** 是 TCP / 数据链路层等可靠传输协议的核心。\n\n相比"停等协议"（每发一帧等 ACK，效率低），滑动窗口允许 **连续发送 W 个帧**（W 为窗口大小），收到 ACK 后窗口右移。\n\n**Go-Back-N (GBN)**（本可视化）：\n- 发送方：发送序号在 [base, base+W) 内的帧。一旦最早未确认帧超时，**整个窗口全部重发**（"回退 N"）。\n- 接收方：只接收按序到达的帧。乱序丢弃，重复发送对最后一个按序帧的 ACK（累计 ACK）。\n- 优点：接收方简单，缓冲区小\n- 缺点：丢一帧导致后面已正确收到的帧也要重传，浪费带宽\n\n**Selective Repeat (SR)**：\n- 接收方缓冲乱序帧，发送方只重传具体丢失的帧\n- 优点：高效，丢包代价低\n- 缺点：接收方实现复杂，缓冲区大\n\nTCP 实际用的是 **SR 的变种**（选择性确认 SACK）。\n\n**窗口大小限制**：用 n 位序号，GBN 最大 2^n − 1，SR 最大 2^(n-1)。否则新旧帧无法区分。`,
    pseudocode: `// Go-Back-N 发送方
base ← 0
nextSeq ← 0
while base < N:
    while nextSeq < base + W and nextSeq < N:
        send frame[nextSeq]
        nextSeq ← nextSeq + 1
    wait for ACK or timeout:
        if ACK(k) received and k > base:
            base ← k
        else if timeout:
            nextSeq ← base    // 回退，重发所有

// 接收方
expected ← 0
on receive frame[k]:
    if k == expected:
        deliver, expected ← expected + 1
    send ACK(expected)        // 累计 ACK`,
    code: {
      cpp: `// Go-Back-N 发送方（简化）
const int W = 4, N = 8;
int base = 0, nextSeq = 0;

void senderLoop() {
    while (base < N) {
        while (nextSeq < base + W && nextSeq < N) {
            sendFrame(nextSeq);
            nextSeq++;
        }
        Event e = waitEvent();
        if (e.type == ACK && e.seq >= base) {
            base = e.seq + 1;
        } else if (e.type == TIMEOUT) {
            nextSeq = base;     // 回退重传
        }
    }
}`,
      python: `class GBNSender:
    def __init__(self, n, w):
        self.n, self.w = n, w
        self.base = 0
        self.next_seq = 0

    def can_send(self):
        return self.next_seq < self.base + self.w and self.next_seq < self.n

    def on_ack(self, k):
        if k > self.base:
            self.base = k

    def on_timeout(self):
        self.next_seq = self.base  # 回退重传`,
    },
    applications: [
      'TCP 可靠传输（实际用 SR 变种 SACK）',
      '数据链路层（HDLC、PPP）',
      '考研 408 计算机网络必考',
      'QUIC / HTTP/3 等新协议依然沿用滑动窗口思想',
    ],
  },

}

export default NETWORK_ALGORITHMS
