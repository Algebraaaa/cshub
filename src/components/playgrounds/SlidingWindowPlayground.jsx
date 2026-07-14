import { useCallback } from 'react'
import PlaygroundShell from './PlaygroundShell'
import { EndpointBox, MetricPill, MetricsBar, NetworkPanel, PhaseBadge, SceneTitle, TeachingNote } from './NetworkVizShared'

const STATE_COLOR = {
  pending: '#94a3b8',
  in_flight: '#3b82f6',
  acked: '#22c55e',
  lost: '#ef4444',
}

const PHASE_COLOR = {
  init: '#94a3b8',
  send: '#3b82f6',
  ack: '#22c55e',
  discard: '#f59e0b',
  window_slide: '#a855f7',
  timeout: '#ef4444',
  done: '#22c55e',
}

const LEGEND = [
  { color: STATE_COLOR.pending, label: '等待发送' },
  { color: STATE_COLOR.in_flight, label: '已发送，等待 ACK' },
  { color: STATE_COLOR.acked, label: '已确认' },
  { color: STATE_COLOR.lost, label: '丢失，等待重传' },
  { color: '#a855f7', label: '当前发送窗口' },
]

export default function SlidingWindowPlayground({ algoFn }) {
  const computeSteps = useCallback(() => algoFn(), [algoFn])

  return (
    <PlaygroundShell
      computeSteps={computeSteps}
      legend={LEGEND}
      renderViz={({ current }) => (
        <NetworkPanel minHeight={520}>
          <SWViz step={current} />
        </NetworkPanel>
      )}
    />
  )
}

function SWViz({ step }) {
  if (!step) return null
  const { totalFrames, windowSize, senderBase, senderNext, receiverExpected, frames, message, phase } = step
  const phaseColor = PHASE_COLOR[phase] || '#94a3b8'

  return (
    <div style={{ minWidth: 820 }}>
      <style>{`
        @keyframes sw-draw {
          from { stroke-dashoffset: 420; opacity: 0.35; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes sw-pop {
          from { opacity: 0; transform: translateY(6px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <SceneTitle
        eyebrow="GO-BACK-N SLIDING WINDOW"
        title="发送窗口、累计 ACK 与回退重传同步展示"
        badge={<PhaseBadge label={phaseLabel(phase)} color={phaseColor} />}
      />

      <MetricsBar>
        <MetricPill label="base" value={senderBase} color="#3b82f6" />
        <MetricPill label="nextSeq" value={senderNext} color="#3b82f6" />
        <MetricPill label="expect" value={receiverExpected} color="#22c55e" />
      </MetricsBar>

      <FrameStrip
        frames={frames}
        totalFrames={totalFrames}
        windowSize={windowSize}
        senderBase={senderBase}
      />
      <SwimlaneScene
        message={message}
        phase={phase}
        senderBase={senderBase}
        senderNext={senderNext}
        receiverExpected={receiverExpected}
        frames={frames}
      />
      <TeachingNote>{step.note}</TeachingNote>
    </div>
  )
}

function FrameStrip({ frames, totalFrames, windowSize, senderBase }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>
        发送方帧序列：紫色边框表示当前可发送窗口，绿色表示已被累计 ACK 覆盖
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${totalFrames}, minmax(48px, 1fr))`, gap: 6 }}>
        {frames.map((frame, i) => {
          const inWindow = i >= senderBase && i < senderBase + windowSize
          const color = STATE_COLOR[frame.state] || '#94a3b8'
          return (
            <div key={frame.seq} style={{
              height: 58,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${color}1f`,
              border: `${inWindow ? 2 : 1}px solid ${inWindow ? '#a855f7' : color}`,
              borderRadius: 8,
              fontFamily: 'var(--font-mono)',
              position: 'relative',
              transition: 'all 0.2s',
            }}>
              {inWindow && i === senderBase && (
                <div style={{ position: 'absolute', top: -18, fontSize: 10, color: '#a855f7', fontWeight: 900 }}>base</div>
              )}
              <div style={{ fontSize: 15, fontWeight: 900, color }}>{frame.seq}</div>
              <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)', marginTop: 3 }}>{stateLabel(frame.state)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SwimlaneScene({ message, phase, senderBase, senderNext, receiverExpected, frames }) {
  const W = 820
  const H = 270
  const senderX = 120
  const receiverX = 700
  const topY = 78
  const bottomY = 190
  const unacked = frames.filter(f => f.state === 'in_flight' || f.state === 'lost').map(f => f.seq)

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <marker id="sw-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M1,1 L9,5 L1,9 Z" fill="#111827" />
        </marker>
      </defs>
      <rect x="18" y="12" width={W - 36} height={H - 26} rx="10" fill="var(--surface-2)" stroke="var(--border)" />
      <EndpointBox x={senderX} y={topY} title="Sender" subtitle="发送方" color="#2563eb" />
      <EndpointBox x={receiverX} y={topY} title="Receiver" subtitle="接收方" color="#059669" />
      <line x1={senderX + 88} y1={topY} x2={receiverX - 88} y2={topY} stroke="var(--border)" strokeWidth="8" strokeLinecap="round" opacity="0.48" />
      <line x1={receiverX - 88} y1={bottomY} x2={senderX + 88} y2={bottomY} stroke="var(--border)" strokeWidth="8" strokeLinecap="round" opacity="0.32" />

      <MiniQueue x={senderX} y={150} title="未确认" values={unacked} color="#3b82f6" />
      <MiniQueue x={receiverX} y={150} title="期待" values={[receiverExpected]} color="#22c55e" />

      {message ? (
        <MessageArrow message={message} topY={topY} bottomY={bottomY} senderX={senderX} receiverX={receiverX} />
      ) : (
        <text x={W / 2} y={topY + 5} textAnchor="middle" fill="var(--text-secondary)" fontSize="13" fontWeight="800">
          {phase === 'window_slide' ? `窗口右移，base=${senderBase}` : phase === 'done' ? '所有帧已确认' : '等待发送'}
        </text>
      )}

      {phase === 'timeout' && (
        <g style={{ animation: 'sw-pop 0.25s ease-out both' }}>
          <rect x="336" y="220" width="148" height="28" rx="7" fill="rgba(239,68,68,0.14)" stroke="#ef4444" />
          <text x="410" y="238" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="900">从 base 回退重传</text>
        </g>
      )}
      <text x="36" y="252" fill="var(--text-tertiary)" fontSize="11" fontFamily="monospace">
        senderNext={senderNext}
      </text>
    </svg>
  )
}

function MessageArrow({ message, topY, bottomY, senderX, receiverX }) {
  const fromSender = message.from === 'sender'
  const timeout = message.timeout
  const lost = message.lost
  const y = timeout ? bottomY + 36 : fromSender ? topY : bottomY
  const x1 = timeout ? senderX - 8 : fromSender ? senderX + 88 : receiverX - 88
  const x2 = timeout ? senderX + 92 : fromSender ? receiverX - 88 : senderX + 88
  const color = timeout || lost ? '#ef4444' : message.duplicate ? '#f59e0b' : fromSender ? '#3b82f6' : '#22c55e'

  return (
    <g style={{ animation: 'sw-pop 0.25s ease-out both' }}>
      <line
        x1={x1}
        y1={y}
        x2={x2}
        y2={y}
        stroke={color}
        strokeWidth="3"
        strokeDasharray="420"
        markerEnd={timeout ? undefined : 'url(#sw-arrow)'}
        style={{ animation: 'sw-draw 0.42s ease-out both' }}
      />
      {lost && (
        <g>
          <line x1={(x1 + x2) / 2 - 10} y1={y - 13} x2={(x1 + x2) / 2 + 10} y2={y + 13} stroke="#ef4444" strokeWidth="3" />
          <line x1={(x1 + x2) / 2 + 10} y1={y - 13} x2={(x1 + x2) / 2 - 10} y2={y + 13} stroke="#ef4444" strokeWidth="3" />
        </g>
      )}
      <rect x={(x1 + x2) / 2 - 58} y={y - 17} width="116" height="30" rx="7" fill="var(--surface)" stroke={color} strokeOpacity="0.75" />
      <text x={(x1 + x2) / 2} y={y + 3} textAnchor="middle" fill={color} fontSize="12" fontWeight="900">
        {message.label}
      </text>
    </g>
  )
}

function MiniQueue({ x, y, title, values, color }) {
  return (
    <g>
      <text x={x} y={y - 14} textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontWeight="800">{title}</text>
      <rect x={x - 58} y={y - 3} width="116" height="36" rx="8" fill={`${color}14`} stroke={color} strokeOpacity="0.45" />
      {values.length ? values.slice(0, 4).map((value, i) => (
        <g key={`${value}-${i}`}>
          <circle cx={x - 34 + i * 23} cy={y + 15} r="9" fill={`${color}30`} stroke={color} />
          <text x={x - 34 + i * 23} y={y + 18} textAnchor="middle" fill={color} fontSize="10" fontWeight="900">{value}</text>
        </g>
      )) : (
        <text x={x} y={y + 19} textAnchor="middle" fill="var(--text-tertiary)" fontSize="11">空</text>
      )}
    </g>
  )
}

function stateLabel(state) {
  return ({
    pending: '等待',
    in_flight: '飞行中',
    acked: '已确认',
    lost: '丢失',
  })[state] || state
}

function phaseLabel(phase) {
  return ({
    init: '初始化',
    send: '发送帧',
    ack: '累计 ACK',
    discard: '乱序丢弃',
    window_slide: '窗口滑动',
    timeout: '超时重传',
    done: '完成',
  })[phase] || phase
}
