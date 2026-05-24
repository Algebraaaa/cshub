import { useState, useMemo } from 'react'
import StepController, { useStepController } from '../StepController'
import { Toolbar, ToolbarBtn, TextInput } from './shared'

const PRESETS = {
  basic: {
    label: '基础示例',
    m: 7,
    ops: [
      { type: 'insert', key: 'apple', value: '苹果' },
      { type: 'insert', key: 'banana', value: '香蕉' },
      { type: 'insert', key: 'cherry', value: '樱桃' },
      { type: 'insert', key: 'date', value: '椰枣' },
      { type: 'insert', key: 'elder', value: '接骨木' },
      { type: 'lookup', key: 'banana' },
      { type: 'lookup', key: 'mango' },
      { type: 'delete', key: 'cherry' },
      { type: 'insert', key: 'fig', value: '无花果' },
    ],
  },
  collision: {
    label: '冲突演示',
    m: 5,
    ops: [
      { type: 'insert', key: 'a', value: '1' },
      { type: 'insert', key: 'f', value: '2' },
      { type: 'insert', key: 'k', value: '3' },
      { type: 'insert', key: 'b', value: '4' },
      { type: 'insert', key: 'g', value: '5' },
      { type: 'lookup', key: 'f' },
      { type: 'delete', key: 'a' },
      { type: 'lookup', key: 'k' },
    ],
  },
}

const BUCKET_H = 40
const CHAIN_W = 80
const CHAIN_GAP = 8

function actionColors(action) {
  if (action === 'insert' || action === 'update') return { bg: '#8b5cf6', fg: 'white' }
  if (action === 'found') return { bg: '#10b981', fg: 'white' }
  if (action === 'delete') return { bg: '#ef4444', fg: 'white' }
  if (action === 'miss') return { bg: '#f59e0b', fg: 'white' }
  if (action === 'hash') return { bg: '#3b82f6', fg: 'white' }
  return { bg: 'var(--surface-2)', fg: 'var(--text-primary)' }
}

export default function HashTablePlayground({ algoFn }) {
  const [preset, setPreset] = useState('basic')
  const [customOps, setCustomOps] = useState(null)
  const [inputText, setInputText] = useState('')
  const { m, ops: presetOps } = PRESETS[preset]
  const ops = customOps ?? presetOps

  const steps = useMemo(() => algoFn(m, ops), [algoFn, m, ops])
  const ctrl = useStepController(steps)
  const current = steps[ctrl.step]

  function applyCustomKeys() {
    const keys = inputText.split(/[\s,，]+/).map(s => s.trim()).filter(Boolean).slice(0, 10)
    if (keys.length >= 1) {
      setCustomOps(keys.map(k => ({ type: 'insert', key: k, value: k })))
      ctrl.reset()
    }
  }

  if (!current) return null

  const { buckets, action, bucket: activeBucket, key: activeKey } = current
  const { bg: activeBg, fg: activeFg } = actionColors(action)

  const maxChain = Math.max(...buckets.map(b => b.length), 0)
  const svgW = Math.max(120 + maxChain * (CHAIN_W + CHAIN_GAP) + 20, 400)
  const svgH = 20 + m * (BUCKET_H + 4) + 10

  return (
    <div>
      <Toolbar>
        {Object.entries(PRESETS).map(([key, p]) => (
          <ToolbarBtn key={key} active={preset === key} onClick={() => { setPreset(key); setCustomOps(null); ctrl.reset() }}>
            {p.label}
          </ToolbarBtn>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          桶数 m={m}
        </span>
      </Toolbar>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16, overflowX: 'auto' }}>
        <svg width={svgW} height={svgH} style={{ display: 'block' }}>
          {/* Header */}
          <text x={10} y={16} fill="var(--text-tertiary)" fontSize={10} fontWeight={700}>桶</text>
          <text x={110} y={16} fill="var(--text-tertiary)" fontSize={10} fontWeight={700}>链表</text>

          {buckets.map((chain, i) => {
            const y = 22 + i * (BUCKET_H + 4)
            const isActive = i === activeBucket

            return (
              <g key={i}>
                {/* Bucket index box */}
                <rect x={10} y={y} width={40} height={BUCKET_H} rx={4}
                  fill={isActive ? activeBg : 'var(--surface-2)'}
                  stroke={isActive ? activeBg : 'var(--border)'}
                  strokeWidth={isActive ? 2 : 1} />
                <text x={30} y={y + BUCKET_H / 2} textAnchor="middle" dominantBaseline="central"
                  fill={isActive ? activeFg : 'var(--text-secondary)'}
                  fontSize={12} fontWeight={700} fontFamily="var(--font-mono)">{i}</text>

                {/* Arrow to chain */}
                {chain.length > 0 && (
                  <line x1={52} y1={y + BUCKET_H / 2} x2={66} y2={y + BUCKET_H / 2}
                    stroke="var(--text-tertiary)" strokeWidth={1.5}
                    markerEnd="url(#arrowH)" />
                )}
                {chain.length === 0 && (
                  <text x={58} y={y + BUCKET_H / 2} dominantBaseline="central"
                    fill="var(--text-tertiary)" fontSize={10}>null</text>
                )}

                {/* Chain nodes */}
                {chain.map((entry, j) => {
                  const cx = 68 + j * (CHAIN_W + CHAIN_GAP)
                  const isHighlight = isActive && entry.key === activeKey
                  const bg = isHighlight ? activeBg : 'var(--surface-2)'
                  const fg = isHighlight ? activeFg : 'var(--text-primary)'

                  return (
                    <g key={j}>
                      <rect x={cx} y={y} width={CHAIN_W} height={BUCKET_H} rx={4}
                        fill={bg} stroke={isHighlight ? activeBg : 'var(--border)'}
                        strokeWidth={isHighlight ? 2 : 1} />
                      <text x={cx + CHAIN_W / 2} y={y + 13} textAnchor="middle"
                        fill={fg} fontSize={10} fontWeight={700} fontFamily="var(--font-mono)">
                        {entry.key}
                      </text>
                      <text x={cx + CHAIN_W / 2} y={y + 28} textAnchor="middle"
                        fill={isHighlight ? 'rgba(255,255,255,0.8)' : 'var(--text-tertiary)'}
                        fontSize={9} fontFamily="var(--font-mono)">
                        {entry.value}
                      </text>
                      {j < chain.length - 1 && (
                        <line x1={cx + CHAIN_W} y1={y + BUCKET_H / 2}
                          x2={cx + CHAIN_W + CHAIN_GAP} y2={y + BUCKET_H / 2}
                          stroke="var(--text-tertiary)" strokeWidth={1.5} markerEnd="url(#arrowH)" />
                      )}
                      {j === chain.length - 1 && (
                        <text x={cx + CHAIN_W + 4} y={y + BUCKET_H / 2} dominantBaseline="central"
                          fill="var(--text-tertiary)" fontSize={9}>null</text>
                      )}
                    </g>
                  )
                })}
              </g>
            )
          })}

          <defs>
            <marker id="arrowH" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto">
              <path d="M0,0 L5,2.5 L0,5 Z" fill="var(--text-tertiary)" />
            </marker>
          </defs>
        </svg>

        <div style={{ display: 'flex', gap: 16, padding: '8px 16px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {[
            { color: '#3b82f6', label: '计算哈希' },
            { color: '#8b5cf6', label: '插入节点' },
            { color: '#10b981', label: '查找命中' },
            { color: '#f59e0b', label: '查找未命中' },
            { color: '#ef4444', label: '删除' },
          ].map(({ color, label }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-secondary)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <StepController total={steps.length} step={ctrl.step} playing={ctrl.playing}
        speed={ctrl.speed} setSpeed={ctrl.setSpeed}
        play={ctrl.play} stop={ctrl.stop} prev={ctrl.prev} goNext={ctrl.goNext} reset={ctrl.reset} seek={ctrl.seek}
        description={current?.description}
        customInput={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>自定义键</span>
            <TextInput value={inputText} onChange={setInputText}
              placeholder="例：hello world foo bar"
              onSubmit={applyCustomKeys} submitLabel="插入" />
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>最多 10 个</span>
          </div>
        } />
    </div>
  )
}
