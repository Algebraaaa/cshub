import { useMemo } from 'react'
import StepController, { useStepController } from '../StepController'
import { Legend } from './shared'
import { EndpointBox, MetricPill, MetricsBar, NetworkPanel, PhaseBadge, SceneTitle, TeachingNote } from './NetworkVizShared'

const PHASE_COLOR = {
  slow_start: '#10b981',
  congestion_avoidance: '#3b82f6',
  fast_retransmit: '#f59e0b',
  fast_recovery: '#a855f7',
  timeout: '#ef4444',
}

const PHASE_LABEL = {
  slow_start: '慢启动',
  congestion_avoidance: '拥塞避免',
  fast_retransmit: '快重传',
  fast_recovery: '快恢复',
  timeout: '超时',
}

const LEGEND = [
  { color: PHASE_COLOR.slow_start, label: '慢启动：指数增长' },
  { color: PHASE_COLOR.congestion_avoidance, label: '拥塞避免：线性增长' },
  { color: PHASE_COLOR.fast_recovery, label: '快恢复：减半后恢复' },
  { color: PHASE_COLOR.timeout, label: '超时：cwnd 重置为 1' },
  { color: '#fbbf24', label: 'ssthresh 阈值线' },
]

export default function TCPCongestionPlayground({ algoFn }) {
  const steps = useMemo(() => algoFn(), [algoFn])
  const ctrl = useStepController(steps)
  const current = steps[ctrl.step]

  return (
    <div>
      <NetworkPanel minHeight={520}>
        <CongestionViz step={current} totalSteps={steps.length} />
      </NetworkPanel>

      <Legend items={LEGEND} />

      <StepController
        total={steps.length}
        step={ctrl.step}
        playing={ctrl.playing}
        speed={ctrl.speed}
        setSpeed={ctrl.setSpeed}
        play={ctrl.play}
        stop={ctrl.stop}
        prev={ctrl.prev}
        goNext={ctrl.goNext}
        reset={ctrl.reset}
        seek={ctrl.seek}
        description={current?.description}
      />
    </div>
  )
}

function CongestionViz({ step, totalSteps }) {
  if (!step) return null
  const { rtt, cwnd, ssthresh, phase, history, packets = [] } = step
  const color = PHASE_COLOR[phase] || '#6b7280'

  return (
    <div style={{ minWidth: 820 }}>
      <style>{`
        @keyframes net-flow {
          from { stroke-dashoffset: 280; opacity: 0.35; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes net-pop {
          from { opacity: 0; transform: translateY(6px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <SceneTitle
        eyebrow="TCP RENO CONGESTION CONTROL"
        title="报文流动与 cwnd 曲线同步展示"
        badge={<PhaseBadge label={PHASE_LABEL[phase]} color={color} />}
      />

      <MetricsBar>
        <MetricPill label="cwnd" value={cwnd} color={color} />
        <MetricPill label="ssthresh" value={ssthresh} color="#fbbf24" />
      </MetricsBar>

      <LinkScene cwnd={cwnd} event={step.event} packets={packets} phaseColor={color} />
      <CwndChart history={history} rtt={rtt} cwnd={cwnd} ssthresh={ssthresh} totalSteps={totalSteps} />
      <TeachingNote>{step.note}</TeachingNote>
    </div>
  )
}

function LinkScene({ cwnd, event, packets, phaseColor }) {
  const W = 820
  const H = 190
  const senderX = 116
  const receiverX = 704
  const y = 86
  const dataCount = Math.min(cwnd, 12)
  const isTimeout = event === 'timeout'
  const isDupAck = event === 'dup_ack_3'

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', marginBottom: 10 }}>
      <defs>
        <marker id="cong-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M1,1 L9,5 L1,9 Z" fill="#111827" />
        </marker>
      </defs>
      <rect x="18" y="16" width={W - 36} height={H - 32} rx="10" fill="var(--surface-2)" stroke="var(--border)" />
      <EndpointBox x={senderX} y={y} title="Sender" subtitle="发送方" color="#2563eb" />
      <EndpointBox x={receiverX} y={y} title="Receiver" subtitle="接收方" color="#059669" />
      <line x1={senderX + 88} y1={y} x2={receiverX - 88} y2={y} stroke="var(--border)" strokeWidth="8" strokeLinecap="round" opacity="0.55" />

      {event === 'init' ? (
        <text x={W / 2} y={y + 5} textAnchor="middle" fill="var(--text-secondary)" fontSize="13" fontWeight="800">
          等待第一个 RTT
        </text>
      ) : (
        <>
          {Array.from({ length: dataCount }, (_, i) => {
            const x = senderX + 112 + i * ((receiverX - senderX - 224) / Math.max(dataCount - 1, 1))
            const lost = isTimeout && i === Math.floor(dataCount / 2)
            return (
              <g key={i} style={{ animation: 'net-pop 0.25s ease-out both' }}>
                <rect x={x - 12} y={y - 34} width="24" height="18" rx="4" fill={lost ? '#ef4444' : phaseColor} opacity={lost ? 0.9 : 0.78} />
                <text x={x} y={y - 20} textAnchor="middle" fill="#111827" fontSize="9" fontWeight="900">{i + 1}</text>
                {lost && (
                  <text x={x} y={y - 45} textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="900">lost</text>
                )}
              </g>
            )
          })}

          {packets.map((packet, i) => {
            const ack = packet.from === 'receiver'
            const x1 = ack ? receiverX - 88 : senderX + 88
            const x2 = ack ? senderX + 88 : receiverX - 88
            const yy = ack ? y + 42 + i * 16 : y + 26
            const stroke = packet.tone === 'danger' ? '#ef4444' : packet.tone === 'warn' ? '#f59e0b' : packet.tone === 'ack' ? '#22c55e' : phaseColor
            return (
              <g key={`${packet.label}-${i}`}>
                <line
                  x1={x1}
                  y1={yy}
                  x2={x2}
                  y2={yy}
                  stroke={stroke}
                  strokeWidth="2.5"
                  strokeDasharray="280"
                  markerEnd="url(#cong-arrow)"
                  style={{ animation: 'net-flow 0.42s ease-out both' }}
                />
                <rect x={(x1 + x2) / 2 - 44} y={yy - 14} width="88" height="24" rx="6" fill="var(--surface)" stroke={stroke} strokeOpacity="0.65" />
                <text x={(x1 + x2) / 2} y={yy + 2} textAnchor="middle" fill={stroke} fontSize="11" fontWeight="900">
                  {packet.label}{isDupAck && packet.count ? ` #${packet.count}` : ''}
                </text>
              </g>
            )
          })}
        </>
      )}
    </svg>
  )
}

function CwndChart({ history, rtt, cwnd, ssthresh, totalSteps }) {
  const W = 820
  const H = 260
  const padding = { left: 52, right: 32, top: 22, bottom: 42 }
  const plotW = W - padding.left - padding.right
  const plotH = H - padding.top - padding.bottom
  const maxRtt = Math.max(24, totalSteps - 1)
  const maxCwnd = Math.max(20, ...history.map(h => h.cwnd), ssthresh + 4)
  const xScale = (r) => padding.left + (r / maxRtt) * plotW
  const yScale = (c) => padding.top + plotH - (c / maxCwnd) * plotH
  const yTicks = []
  for (let v = 0; v <= maxCwnd; v += 4) yTicks.push(v)

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <rect x="18" y="0" width={W - 36} height={H - 8} rx="10" fill="rgba(255,255,255,0.035)" stroke="var(--border)" />
      {yTicks.map(v => (
        <g key={v}>
          <line x1={padding.left} y1={yScale(v)} x2={W - padding.right} y2={yScale(v)} stroke="var(--border)" strokeWidth="1" opacity="0.36" />
          <text x={padding.left - 8} y={yScale(v) + 4} fontSize="10" textAnchor="end" fill="var(--text-tertiary)" fontFamily="monospace">{v}</text>
        </g>
      ))}
      {Array.from({ length: Math.floor(maxRtt / 4) + 1 }, (_, i) => i * 4).map(x => (
        <g key={x}>
          <line x1={xScale(x)} y1={padding.top} x2={xScale(x)} y2={H - padding.bottom} stroke="var(--border)" strokeWidth="1" opacity="0.22" />
          <text x={xScale(x)} y={H - padding.bottom + 18} fontSize="10" textAnchor="middle" fill="var(--text-tertiary)" fontFamily="monospace">{x}</text>
        </g>
      ))}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={H - padding.bottom} stroke="var(--text-secondary)" strokeWidth="1.5" />
      <line x1={padding.left} y1={H - padding.bottom} x2={W - padding.right} y2={H - padding.bottom} stroke="var(--text-secondary)" strokeWidth="1.5" />
      <text x={padding.left - 34} y={padding.top + 12} fontSize="11" fill="var(--text-secondary)" fontFamily="monospace">cwnd</text>
      <text x={W - padding.right} y={H - padding.bottom + 18} fontSize="11" textAnchor="end" fill="var(--text-secondary)" fontFamily="monospace">RTT</text>
      <line x1={padding.left} y1={yScale(ssthresh)} x2={W - padding.right} y2={yScale(ssthresh)} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.85" />
      <text x={W - padding.right - 4} y={yScale(ssthresh) - 6} fontSize="10" fill="#fbbf24" fontFamily="monospace" textAnchor="end">ssthresh={ssthresh}</text>
      {history.slice(1).map((cur, i) => {
        const prev = history[i]
        return (
          <line key={cur.rtt} x1={xScale(prev.rtt)} y1={yScale(prev.cwnd)} x2={xScale(cur.rtt)} y2={yScale(cur.cwnd)} stroke={PHASE_COLOR[cur.phase] || '#6b7280'} strokeWidth="2.6" strokeLinecap="round" />
        )
      })}
      {history.map((h, i) => (
        <circle key={h.rtt} cx={xScale(h.rtt)} cy={yScale(h.cwnd)} r={i === history.length - 1 ? 6 : 3} fill={PHASE_COLOR[h.phase] || '#6b7280'} stroke={i === history.length - 1 ? '#fff' : 'none'} strokeWidth="1.5" />
      ))}
      <text x={xScale(rtt) + 10} y={yScale(cwnd) - 8} fontSize="11" fontWeight="800" fill={PHASE_COLOR[history[history.length - 1]?.phase] || '#6b7280'} fontFamily="monospace">
        ({rtt}, {cwnd})
      </text>
    </svg>
  )
}
