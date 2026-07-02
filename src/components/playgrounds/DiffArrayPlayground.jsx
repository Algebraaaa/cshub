import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'

const LEGEND = [
  { color: '#3b82f6', label: '原始数组' },
  { color: '#f59e0b', label: '差分数组' },
  { color: '#10b981', label: '恢复数组' },
  { color: '#ec4899', label: '当前操作位置' },
  { color: '#8b5cf6', label: '更新区间' },
]

const PHASE_COLOR = {
  init: '#3b82f6',
  build: '#f59e0b',
  'build-done': '#f59e0b',
  'update-start': '#ec4899',
  update: '#ec4899',
  'update-done': '#ec4899',
  'restore-start': '#10b981',
  restore: '#10b981',
  done: '#10b981',
}

export default function DiffArrayPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      computeSteps={() => algoFn()}
      renderViz={({ current }) => (
        <VizCard borderRadius={10} padding="24px 20px" minHeight={300} noInner>
          <DiffArrayViz step={current} />
        </VizCard>
      )}
      legend={LEGEND}
    />
  )
}

function DiffArrayViz({ step }) {
  if (!step) return null
  const { arr, diff, prefixSum, op, current, phase, highlightRange } = step
  const n = arr.length
  const color = PHASE_COLOR[phase] || 'var(--text-secondary)'

  return (
    <div>
      {/* Status bar */}
      <div style={{
        display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap',
        justifyContent: 'center', padding: '8px 14px', borderRadius: 8,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)', fontSize: 12,
      }}>
        <Pill label="阶段" value={phaseLabel(phase)} color={color} />
        {op && <Pill label="操作" value={`[${op.l},${op.r}]+=${op.val}`} color="#ec4899" />}
        {current >= 0 && <Pill label="位置" value={current} color="#f59e0b" />}
      </div>

      {/* Original array (always shown) */}
      <div style={{ marginBottom: 14 }}>
        <SectionLabel>原始数组 a[0..{n - 1}]</SectionLabel>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {arr.map((v, i) => (
            <Cell key={i} idx={i} value={v} color="#3b82f6" highlighted={false} />
          ))}
        </div>
      </div>

      {/* Diff array */}
      <div style={{ marginBottom: 14 }}>
        <SectionLabel>差分数组 d[0..{n}]</SectionLabel>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {diff.slice(0, n + 1).map((v, i) => {
            const isCurrent = i === current
            const isLeft = op && i === op.l
            const isRight = op && i === op.r + 1
            const isOpCell = (phase === 'update' || phase === 'update-start') && (isLeft || isRight)
            return (
              <Cell key={i} idx={i} value={v}
                color={isCurrent ? '#ec4899' : isOpCell ? '#ec4899' : '#f59e0b'}
                highlighted={isCurrent || isOpCell} />
            )
          })}
        </div>
        {highlightRange && (phase === 'update' || phase === 'update-start' || phase === 'update-done') && (
          <div style={{
            display: 'flex', gap: 0, marginTop: 4, marginLeft: 0,
          }}>
            {Array.from({ length: n + 1 }, (_, i) => {
              const inRange = i >= highlightRange[0] && i <= highlightRange[1]
              return (
                <div key={i} style={{
                  width: 48, height: 4,
                  background: inRange ? 'rgba(139,92,246,0.5)' : 'transparent',
                  borderRadius: 2,
                  transition: 'background 0.2s',
                }} />
              )
            })}
          </div>
        )}
      </div>

      {/* Restored / prefix-sum array */}
      <div>
        <SectionLabel>恢复数组（前缀和）</SectionLabel>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {prefixSum.map((v, i) => {
            const isCurrent = i === current && (phase === 'restore' || phase === 'done')
            const isActive = phase === 'restore' || phase === 'restore-start' || phase === 'done'
            return (
              <Cell key={i} idx={i} value={v}
                color={isCurrent ? '#ec4899' : isActive ? '#10b981' : '#64748b'}
                highlighted={isCurrent}
                dim={!isActive && v === 0} />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Cell({ idx, value, color, highlighted, dim }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 2 }}>{idx}</div>
      <div style={{
        width: 44, height: 38,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: highlighted ? `${color}30` : dim ? 'var(--surface-3)' : `${color}10`,
        border: `${highlighted ? 2 : 1}px solid ${highlighted ? color : `${color}44`}`,
        borderRadius: 6,
        fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)',
        color: dim ? 'var(--text-tertiary)' : highlighted ? color : 'var(--text-primary)',
        boxShadow: highlighted ? `0 0 8px ${color}44` : 'none',
        opacity: dim ? 0.5 : 1,
        transition: 'all 0.2s',
      }}>
        {value}
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, color: 'var(--text-tertiary)',
      letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase',
    }}>
      {children}
    </div>
  )
}

function Pill({ label, value, color }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'baseline' }}>
      <span style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <strong style={{ color, fontWeight: 700, fontSize: 13 }}>{value}</strong>
    </span>
  )
}

function phaseLabel(p) {
  return ({
    init: '初始化', build: '构建差分', 'build-done': '差分完成',
    'update-start': '区间更新', update: 'O(1) 修改', 'update-done': '更新完成',
    'restore-start': '开始恢复', restore: '前缀和', done: '完成',
  })[p] || p
}
