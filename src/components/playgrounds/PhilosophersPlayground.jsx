import { useMemo } from 'react'
import StepController, { useStepController } from '../StepController'
import VizCard from './VizCard'
import { Legend } from './shared'

const STATE_COLOR = {
  thinking: '#94a3b8',
  hungry: '#fbbf24',
  has_left: '#3b82f6',
  has_right: '#3b82f6',
  waiting: '#ef4444',
  eating: '#22c55e',
}

const STATE_EMOJI = {
  thinking: '🤔',
  hungry: '😋',
  has_left: '🤲',
  has_right: '🤲',
  waiting: '⏳',
  eating: '🍝',
}

const LEGEND = [
  { color: STATE_COLOR.thinking, label: '🤔 思考 thinking' },
  { color: STATE_COLOR.hungry,   label: '😋 饥饿 hungry' },
  { color: STATE_COLOR.has_left, label: '🤲 已拿一只叉' },
  { color: STATE_COLOR.waiting,  label: '⏳ 等待（潜在死锁）' },
  { color: STATE_COLOR.eating,   label: '🍝 进餐 eating' },
]

export default function PhilosophersPlayground({ algoFn }) {
  const steps = useMemo(() => algoFn(), [algoFn])
  const ctrl = useStepController(steps)
  const current = steps[ctrl.step]

  return (
    <div>
      <VizCard borderRadius={10} padding="24px 20px" minHeight={460} noInner overflowX="hidden">
        <PhilosophersViz step={current} />
      </VizCard>

      <Legend items={LEGEND} />

      <StepController total={steps.length} ctrl={ctrl}
        description={current?.description} />
    </div>
  )
}

function PhilosophersViz({ step }) {
  if (!step) return null
  const { philosophers, forks, mode, currentPhilosopher, phase, n } = step

  const radius = 130
  const center = { x: 220, y: 220 }
  const philR = 36
  // Angles for philosophers (P0 top, going clockwise)
  function philAngle(i) { return -Math.PI / 2 + (i * 2 * Math.PI) / n }
  // Fork i is between philosopher i and i+1 (i+1 % n)
  function forkAngle(i) { return -Math.PI / 2 + ((i + 0.5) * 2 * Math.PI) / n }

  const modeLabel = mode === 'naive' ? '场景 1：朴素解法（死锁演示）' : '场景 2：资源序号解法（无死锁）'
  const modeBg = mode === 'naive' ? 'rgba(239, 68, 68, 0.10)' : 'rgba(34, 197, 94, 0.10)'
  const modeColor = mode === 'naive' ? '#ef4444' : '#22c55e'

  return (
    <div>
      {/* Mode badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
        <span style={{
          padding: '6px 16px', borderRadius: 99,
          background: modeBg, border: `1px solid ${modeColor}55`,
          fontSize: 12.5, fontWeight: 700, color: modeColor,
        }}>{modeLabel}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width="440" height="440" style={{ maxWidth: '100%' }}>
          {/* Round table */}
          <circle cx={center.x} cy={center.y} r={radius - 30}
            fill="rgba(120, 80, 40, 0.18)"
            stroke="rgba(120, 80, 40, 0.4)" strokeWidth="2" />

          {/* Forks */}
          {forks.map((owner, i) => {
            const ang = forkAngle(i)
            const fx = center.x + Math.cos(ang) * (radius - 10)
            const fy = center.y + Math.sin(ang) * (radius - 10)
            const fxe = center.x + Math.cos(ang) * (radius + 30)
            const fye = center.y + Math.sin(ang) * (radius + 30)

            const isOwned = owner >= 0
            // If owned by philosopher i, draw fork toward that philosopher
            let x1 = fx, y1 = fy, x2 = fxe, y2 = fye
            if (isOwned) {
              const pa = philAngle(owner)
              const px = center.x + Math.cos(pa) * (radius + 10)
              const py = center.y + Math.sin(pa) * (radius + 10)
              x2 = px
              y2 = py
            }
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isOwned ? '#fbbf24' : '#94a3b8'}
                  strokeWidth={isOwned ? 4 : 3}
                  strokeLinecap="round" />
                {!isOwned && (
                  <text x={(x1 + x2) / 2 + 8} y={(y1 + y2) / 2 + 8}
                    fontSize="11" fill="#94a3b8" fontFamily="var(--font-mono)">F{i}</text>
                )}
              </g>
            )
          })}

          {/* Philosophers */}
          {philosophers.map((p, i) => {
            const ang = philAngle(i)
            const x = center.x + Math.cos(ang) * (radius + 50)
            const y = center.y + Math.sin(ang) * (radius + 50)
            const isCurrent = i === currentPhilosopher
            const color = STATE_COLOR[p.state] || '#6b7280'

            return (
              <g key={i}>
                <circle cx={x} cy={y} r={philR}
                  fill={`${color}30`}
                  stroke={color}
                  strokeWidth={isCurrent ? 3 : 2} />
                <text x={x} y={y - 4} textAnchor="middle" fontSize="20">
                  {STATE_EMOJI[p.state] || '🧑'}
                </text>
                <text x={x} y={y + 18} textAnchor="middle"
                  fontSize="12" fontWeight="700" fill={color}
                  fontFamily="var(--font-mono)">P{i}</text>
              </g>
            )
          })}

          {/* Center label */}
          <text x={center.x} y={center.y - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-secondary)">
            {phase === 'deadlock' ? '⚠️ DEADLOCK' : '哲学家就餐'}
          </text>
          <text x={center.x} y={center.y + 14} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">
            n={n}
          </text>
        </svg>
      </div>
    </div>
  )
}
