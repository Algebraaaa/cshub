import { useMemo } from 'react'
import StepController, { useStepController } from '../StepController'
import { Legend } from './shared'

const LEGEND = [
  { color: '#3b82f6', label: '当前访问的地址 / 块' },
  { color: '#22c55e', label: '命中（HIT）' },
  { color: '#ef4444', label: '不命中（MISS）' },
  { color: '#fbbf24', label: '被替换的块' },
  { color: '#94a3b8', label: '无效（valid=0）' },
]

export default function CacheMapPlayground({ algoFn }) {
  const steps = useMemo(() => algoFn(), [algoFn])
  const ctrl = useStepController(steps)
  const current = steps[ctrl.step]

  return (
    <div>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        marginBottom: 16,
        padding: '24px 20px',
        overflowX: 'auto',
        minHeight: 360,
      }}>
        <CacheViz step={current} />
      </div>

      <Legend items={LEGEND} />

      <StepController total={steps.length} step={ctrl.step} playing={ctrl.playing}
        speed={ctrl.speed} setSpeed={ctrl.setSpeed}
        play={ctrl.play} stop={ctrl.stop} prev={ctrl.prev} goNext={ctrl.goNext} reset={ctrl.reset} seek={ctrl.seek}
        description={current?.description} />
    </div>
  )
}

function CacheViz({ step }) {
  if (!step) return null
  const { mode, accesses, currentIdx, address, addrBits, tag, index, offset, tagBits, indexBits, offsetBits, cache, hit, way, stats } = step

  return (
    <div>
      {/* Top metrics */}
      <div style={{
        display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 18,
        padding: '10px 16px', borderRadius: 10,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)', fontSize: 13,
      }}>
        <Pill label="HIT" value={stats?.hits ?? 0} color="#22c55e" />
        <Pill label="MISS" value={stats?.misses ?? 0} color="#ef4444" />
        <Pill label="命中率" value={stats?.hitRate ? stats.hitRate + '%' : '—'} color="#fbbf24" />
      </div>

      {/* Address breakdown */}
      {address >= 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 1, marginBottom: 6 }}>
            当前地址：0x{address.toString(16).toUpperCase().padStart(2, '0')} = {addrBits}₂
          </div>
          <AddressBits bits={addrBits} tagBits={tagBits} indexBits={indexBits} offsetBits={offsetBits} tag={tag} index={index} offset={offset} />
        </div>
      )}

      {/* Access sequence */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 1, marginBottom: 6 }}>访问序列</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {accesses.map((a, i) => {
            const isCurrent = i === currentIdx
            const isPast = i < currentIdx
            return (
              <div key={i} style={{
                padding: '4px 9px', borderRadius: 6,
                background: isCurrent ? '#3b82f622' : isPast ? 'var(--surface-2)' : 'transparent',
                border: `1px solid ${isCurrent ? '#3b82f6' : 'var(--border)'}`,
                fontFamily: 'var(--font-mono)', fontSize: 12,
                color: isCurrent ? '#3b82f6' : isPast ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                fontWeight: isCurrent ? 700 : 400,
              }}>
                0x{a.toString(16).toUpperCase().padStart(2, '0')}
              </div>
            )
          })}
        </div>
      </div>

      {/* Cache state */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 1, marginBottom: 8 }}>
          Cache 状态（{cache.length} {mode === 'set' ? '组 × 2 路' : '行'}）
        </div>
        {mode === 'set' ? (
          <SetAssocView cache={cache} highlightIdx={index} hit={hit} way={way} />
        ) : (
          <FlatView cache={cache} highlightIdx={mode === 'direct' ? index : -1} hit={hit} way={way} mode={mode} />
        )}
      </div>
    </div>
  )
}

function AddressBits({ bits, tagBits, indexBits, offsetBits, tag, index, offset }) {
  if (!bits) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', gap: 1 }}>
        {bits.split('').map((b, i) => {
          let color
          if (i < tagBits) color = '#3b82f6'
          else if (i < tagBits + indexBits) color = '#22c55e'
          else color = '#fbbf24'
          return (
            <div key={i} style={{
              width: 22, height: 26,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${color}22`,
              border: `1px solid ${color}`,
              borderRadius: 4,
              fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color,
            }}>{b}</div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 1, fontSize: 10, fontFamily: 'var(--font-mono)' }}>
        <span style={{ width: 22 * tagBits + tagBits - 1, textAlign: 'center', color: '#3b82f6', fontWeight: 700 }}>
          Tag = {tag}
        </span>
        {indexBits > 0 && (
          <span style={{ width: 22 * indexBits + indexBits - 1, textAlign: 'center', color: '#22c55e', fontWeight: 700, marginLeft: 1 }}>
            Index = {index}
          </span>
        )}
        <span style={{ width: 22 * offsetBits + offsetBits - 1, textAlign: 'center', color: '#fbbf24', fontWeight: 700, marginLeft: 1 }}>
          Off = {offset}
        </span>
      </div>
    </div>
  )
}

function FlatView({ cache, highlightIdx, hit, way, mode }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {cache.map((line, i) => {
        const isCurrent = i === highlightIdx || (mode === 'fully' && i === way)
        const color = !line.valid ? '#94a3b8' : isCurrent ? (hit ? '#22c55e' : '#ef4444') : 'var(--text-secondary)'
        return (
          <div key={i} style={{
            padding: '6px 8px', borderRadius: 6,
            background: isCurrent ? `${color}18` : 'var(--surface-2)',
            border: `${isCurrent ? 2 : 1}px solid ${isCurrent ? color : 'var(--border)'}`,
            minWidth: 60,
            fontFamily: 'var(--font-mono)', fontSize: 11,
          }}>
            <div style={{ color: 'var(--text-tertiary)', fontSize: 9 }}>L{i}</div>
            <div style={{ color, fontWeight: 700 }}>
              {line.valid ? `tag=${line.tag}` : '—'}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SetAssocView({ cache, highlightIdx, hit, way }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
      {cache.map((set, i) => {
        const isCurrentSet = i === highlightIdx
        return (
          <div key={i} style={{
            padding: 8, borderRadius: 8,
            background: isCurrentSet ? 'rgba(59, 130, 246, 0.05)' : 'var(--surface-2)',
            border: `${isCurrentSet ? 2 : 1}px solid ${isCurrentSet ? '#3b82f6' : 'var(--border)'}`,
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>Set {i}</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {set.map((w, j) => {
                const isHitWay = isCurrentSet && j === way
                const color = !w.valid ? '#94a3b8' : isHitWay ? (hit ? '#22c55e' : '#ef4444') : 'var(--text-secondary)'
                return (
                  <div key={j} style={{
                    flex: 1, padding: '4px 6px', borderRadius: 4,
                    background: isHitWay ? `${color}22` : 'var(--surface)',
                    border: `1px solid ${isHitWay ? color : 'var(--border)'}`,
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                  }}>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 9 }}>W{j}</div>
                    <div style={{ color, fontWeight: 700 }}>{w.valid ? `t${w.tag}` : '—'}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Pill({ label, value, color }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <strong style={{ color, fontWeight: 700, fontSize: 13.5 }}>{value}</strong>
    </span>
  )
}
