import { useMemo } from 'react'
import StepController, { useStepController } from '../StepController'
import VizCard from './VizCard'
import { Legend } from './shared'

const STAGE_COLOR = {
  IF:    '#3b82f6',
  ID:    '#a855f7',
  EX:    '#22c55e',
  MEM:   '#f59e0b',
  WB:    '#ec4899',
  STALL: '#ef4444',
}

const LEGEND = [
  { color: STAGE_COLOR.IF,    label: 'IF 取指' },
  { color: STAGE_COLOR.ID,    label: 'ID 译码 / 读寄存器' },
  { color: STAGE_COLOR.EX,    label: 'EX 执行 / 计算地址' },
  { color: STAGE_COLOR.MEM,   label: 'MEM 访存' },
  { color: STAGE_COLOR.WB,    label: 'WB 写回' },
  { color: STAGE_COLOR.STALL, label: 'STALL 气泡（冒险）' },
]

export default function PipelinePlayground({ algoFn }) {
  const steps = useMemo(() => algoFn(), [algoFn])
  const ctrl = useStepController(steps)
  const current = steps[ctrl.step]

  return (
    <div>
      <VizCard borderRadius={10} padding="24px 20px" minHeight={360} noInner>
        <PipelineViz step={current} />
      </VizCard>

      <Legend items={LEGEND} />

      <StepController total={steps.length} ctrl={ctrl}
        description={current?.description} />
    </div>
  )
}

function PipelineViz({ step }) {
  if (!step) return null
  const { cycle, totalCycles, instructions, schedule } = step

  return (
    <div>
      {/* Mode + cycle bar */}
      <div style={{
        display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 18,
        padding: '10px 16px', borderRadius: 10,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)', fontSize: 13,
      }}>
        <Pill label="cycle" value={cycle + 1 + ' / ' + totalCycles} color="#3b82f6" />
      </div>

      {/* Pipeline diagram */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={cellStyle({ bg: 'var(--surface-2)', minWidth: 180 })}>指令</th>
              {Array.from({ length: totalCycles }).map((_, c) => (
                <th key={c} style={cellStyle({
                  bg: c === cycle ? 'rgba(168, 85, 247, 0.2)' : 'var(--surface-2)',
                  color: c === cycle ? '#a855f7' : 'var(--text-tertiary)',
                  fontWeight: 700,
                  minWidth: 44,
                })}>
                  {c + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {instructions.map((inst, i) => (
              <tr key={i}>
                <td style={cellStyle({
                  bg: 'var(--surface)',
                  borderRight: '2px solid var(--border)',
                  textAlign: 'left',
                  padding: '6px 12px',
                  minWidth: 180,
                })}>
                  <span style={{ color: 'var(--text-tertiary)' }}>I{i}: </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{inst.asm}</span>
                </td>
                {Array.from({ length: totalCycles }).map((_, c) => {
                  const stage = schedule[i][c]
                  const color = stage ? STAGE_COLOR[stage] : null
                  const isCurrent = c === cycle
                  return (
                    <td key={c} style={cellStyle({
                      bg: stage ? `${color}33` : 'transparent',
                      color: stage ? color : 'var(--text-tertiary)',
                      fontWeight: 700,
                      border: stage ? `1.5px solid ${color}` : '1px solid var(--border)',
                      boxShadow: isCurrent && stage ? `0 0 12px ${color}66, inset 0 0 4px ${color}55` : 'none',
                      minWidth: 44, height: 32,
                    })}>
                      {stage || ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
        {instructions.map((inst, i) => inst.desc && (
          <div key={i}>
            <strong style={{ color: 'var(--text-secondary)' }}>I{i}：</strong>{inst.desc}
          </div>
        ))}
      </div>
    </div>
  )
}

function cellStyle({ bg = 'transparent', color = 'var(--text-secondary)', borderRight, border, padding = '4px 6px', textAlign = 'center', minWidth = 36, fontWeight = 400, height = 28, boxShadow = 'none' }) {
  return {
    background: bg, color, padding, textAlign,
    border: border || '1px solid var(--border)',
    borderRight: borderRight || border || '1px solid var(--border)',
    minWidth, height, fontWeight, boxShadow,
    transition: 'all 0.2s',
  }
}

function Pill({ label, value, color }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <strong style={{ color, fontWeight: 700, fontSize: 13.5 }}>{value}</strong>
    </span>
  )
}
