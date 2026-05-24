import { useMemo } from 'react'
import StepController, { useStepController } from '../StepController'
import { Legend } from './shared'
import { NetworkPanel, PhaseBadge, SceneTitle, TeachingNote } from './NetworkVizShared'

const CLIENT_X = 210
const SERVER_X = 610
const TOP = 92
const ROW = 76
const WIDTH = 820
const BOTTOM = 84

const LEGEND = [
  { color: '#2563eb', label: '客户端 Client' },
  { color: '#059669', label: '服务端 Server' },
  { color: '#f59e0b', label: 'SYN / FIN 报文' },
  { color: '#8b5cf6', label: 'ACK / 数据报文' },
  { color: '#ef4444', label: '当前时间点' },
]

const PHASE_META = {
  init: { label: '初始状态', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.10)' },
  handshake: { label: '连接建立：三次握手', color: '#84cc16', bg: 'rgba(132, 204, 22, 0.13)' },
  established: { label: '数据传输', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.13)' },
  wave: { label: '断开连接：四次挥手', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)' },
  closed: { label: '连接关闭', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.10)' },
}

const STATE_COLOR = {
  CLOSED: '#94a3b8',
  LISTEN: '#22c55e',
  SYN_SENT: '#f59e0b',
  SYN_RCVD: '#f59e0b',
  ESTABLISHED: '#ec4899',
  FIN_WAIT_1: '#a855f7',
  FIN_WAIT_2: '#a855f7',
  CLOSE_WAIT: '#0ea5e9',
  LAST_ACK: '#0ea5e9',
  TIME_WAIT: '#ef4444',
}

export default function TCPHandshakePlayground({ algoFn }) {
  const steps = useMemo(() => algoFn(), [algoFn])
  const ctrl = useStepController(steps)
  const current = steps[ctrl.step]

  return (
    <div>
      <NetworkPanel minHeight={520}>
        <TCPViz steps={steps} stepIndex={ctrl.step} />
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

function TCPViz({ steps, stepIndex }) {
  const current = steps[stepIndex]
  if (!current) return null

  const events = steps.map((item, index) => ({ ...item, index }))
  const height = TOP + events.length * ROW + BOTTOM
  const phaseBands = collectPhaseBands(events)
  const meta = PHASE_META[current.phase] || PHASE_META.init

  return (
    <div style={{ minWidth: WIDTH }}>
      <style>{`
        @keyframes tcp-draw {
          from { stroke-dashoffset: 460; opacity: 0.35; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes tcp-pop {
          from { opacity: 0; transform: translateY(7px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <SceneTitle
        eyebrow="TCP STATE TIMELINE"
        title="三次握手 / 四次挥手按时间线向下展开"
        badge={<PhaseBadge label={meta.label} color={meta.color} />}
      />

      <svg width="100%" viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label="TCP 三次握手和四次挥手时间线">
        <defs>
          <marker id="tcp-arrow-right" markerWidth="11" markerHeight="11" refX="9" refY="5.5" orient="auto" markerUnits="strokeWidth">
            <path d="M1,1 L10,5.5 L1,10 Z" fill="#111827" />
          </marker>
          <marker id="tcp-arrow-left" markerWidth="11" markerHeight="11" refX="2" refY="5.5" orient="auto" markerUnits="strokeWidth">
            <path d="M10,1 L1,5.5 L10,10 Z" fill="#111827" />
          </marker>
        </defs>

        {phaseBands.map(band => (
          <PhaseBand key={`${band.phase}-${band.start}`} band={band} />
        ))}

        <EndpointHeader x={CLIENT_X} y={38} title="Client" subtitle="客户端" color="#2563eb" />
        <EndpointHeader x={SERVER_X} y={38} title="Server" subtitle="服务端" color="#059669" />

        <line x1={CLIENT_X} y1={72} x2={CLIENT_X} y2={height - 42} stroke="#2563eb" strokeWidth="2" opacity="0.82" />
        <line x1={SERVER_X} y1={72} x2={SERVER_X} y2={height - 42} stroke="#059669" strokeWidth="2" opacity="0.82" />

        {events.map((event, visualIndex) => (
          <TimelineEvent
            key={`${event.phase}-${event.index}`}
            event={event}
            visualIndex={visualIndex}
            revealed={event.index <= stepIndex}
            current={event.index === stepIndex}
          />
        ))}
      </svg>

      <TeachingNote>{current.note}</TeachingNote>
    </div>
  )
}

function collectPhaseBands(events) {
  const bands = []
  let start = 0
  for (let i = 1; i <= events.length; i += 1) {
    if (i === events.length || events[i].phase !== events[start].phase) {
      bands.push({ phase: events[start].phase, start, end: i - 1 })
      start = i
    }
  }
  return bands
}

function PhaseBand({ band }) {
  const meta = PHASE_META[band.phase] || PHASE_META.init
  const y = TOP - 38 + band.start * ROW
  const height = (band.end - band.start + 1) * ROW

  return (
    <g>
      <rect x="28" y={y} width={WIDTH - 56} height={height} rx="8" fill={meta.bg} stroke={meta.color} strokeOpacity="0.18" />
      <line x1="28" y1={y} x2={WIDTH - 28} y2={y} stroke={meta.color} strokeOpacity="0.26" strokeDasharray="4 5" />
      <text x="54" y={y + height / 2} fill={meta.color} fontSize="13" fontWeight="800" textAnchor="middle" transform={`rotate(-90 54 ${y + height / 2})`}>
        {meta.label}
      </text>
    </g>
  )
}

function EndpointHeader({ x, y, title, subtitle, color }) {
  return (
    <g>
      <circle cx={x} cy={y + 26} r="5" fill={color} />
      <text x={x} y={y} textAnchor="middle" fill="var(--text-primary)" fontSize="20" fontWeight="900">{title}</text>
      <text x={x} y={y + 20} textAnchor="middle" fill="var(--text-secondary)" fontSize="12" fontWeight="700">{subtitle}</text>
    </g>
  )
}

function TimelineEvent({ event, visualIndex, revealed, current }) {
  const y = TOP + visualIndex * ROW
  const packet = event.packet

  if (!revealed) {
    return (
      <g opacity={0.18}>
        <circle cx={CLIENT_X} cy={y} r="3.5" fill="#2563eb" />
        <circle cx={SERVER_X} cy={y} r="3.5" fill="#059669" />
      </g>
    )
  }

  return (
    <g opacity={1}>
      <circle cx={CLIENT_X} cy={y} r={current ? 6 : 4} fill={current ? '#ef4444' : '#2563eb'} />
      <circle cx={SERVER_X} cy={y} r={current ? 6 : 4} fill={current ? '#ef4444' : '#059669'} />
      <StateLabel x={CLIENT_X - 24} y={y + 5} state={event.clientState} align="end" />
      <StateLabel x={SERVER_X + 24} y={y + 5} state={event.serverState} align="start" />
      {packet ? <PacketLine packet={packet} y={y} current={current} /> : <Checkpoint event={event} y={y} current={current} />}
    </g>
  )
}

function StateLabel({ x, y, state, align }) {
  const color = STATE_COLOR[state] || 'var(--text-secondary)'
  const width = state.length > 9 ? 100 : 84
  const boxX = align === 'end' ? x - width : x

  return (
    <g>
      <rect x={boxX} y={y - 22} width={width} height="27" rx="6" fill={`${color}22`} stroke={color} strokeOpacity="0.44" />
      <text x={align === 'end' ? x - 10 : x + 10} y={y - 4} textAnchor={align} fill={color} fontSize="12" fontWeight="900" fontFamily="monospace">
        {state}
      </text>
    </g>
  )
}

function PacketLine({ packet, y, current }) {
  const goesRight = packet.from === 'client'
  const color = packet.flags.includes('SYN') || packet.flags.includes('FIN') ? '#f59e0b' : '#8b5cf6'
  const x1 = goesRight ? CLIENT_X + 8 : SERVER_X - 8
  const x2 = goesRight ? SERVER_X - 8 : CLIENT_X + 8
  const y1 = y - 12
  const y2 = y + 24
  const labelX = (x1 + x2) / 2
  const labelY = (y1 + y2) / 2 - 8
  const marker = goesRight ? 'url(#tcp-arrow-right)' : 'url(#tcp-arrow-left)'
  const style = current ? { strokeDasharray: 460, animation: 'tcp-draw 0.42s ease-out both' } : undefined

  return (
    <g style={current ? { animation: 'tcp-pop 0.28s ease-out both' } : undefined}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={current ? 3 : 2} markerEnd={marker} style={style} />
      <rect x={labelX - 92} y={labelY - 17} width="184" height="30" rx="6" fill="var(--surface-2)" stroke={color} strokeOpacity={current ? 0.9 : 0.55} />
      <text x={labelX} y={labelY + 3} textAnchor="middle" fill="var(--text-primary)" fontSize="12" fontWeight="800" fontFamily="monospace">
        {packet.text || `${packet.flags.join('+')} seq=${packet.seq}${packet.ack ? ` ACK=${packet.ack}` : ''}`}
      </text>
      <circle cx={goesRight ? x1 - 16 : x1 + 16} cy={y1 - 2} r="11" fill={color} />
      <text x={goesRight ? x1 - 16 : x1 + 16} y={y1 + 2} textAnchor="middle" fill="#111827" fontSize="10" fontWeight="900">
        {packet.label}
      </text>
    </g>
  )
}

function Checkpoint({ event, y, current }) {
  const meta = PHASE_META[event.phase] || PHASE_META.init
  const label = event.phase === 'init'
    ? 'listen()'
    : event.phase === 'established'
      ? 'ESTABLISHED'
      : event.phase === 'closed'
        ? 'CLOSED'
        : meta.label

  return (
    <g style={current ? { animation: 'tcp-pop 0.28s ease-out both' } : undefined}>
      <line x1={CLIENT_X + 12} y1={y} x2={SERVER_X - 12} y2={y} stroke={meta.color} strokeDasharray="6 7" strokeWidth="2" opacity="0.58" />
      <rect x={(CLIENT_X + SERVER_X) / 2 - 68} y={y - 17} width="136" height="34" rx="8" fill="var(--surface-2)" stroke={meta.color} strokeOpacity={current ? 0.9 : 0.45} />
      <text x={(CLIENT_X + SERVER_X) / 2} y={y + 5} textAnchor="middle" fill={meta.color} fontSize="12" fontWeight="900">
        {label}
      </text>
    </g>
  )
}
