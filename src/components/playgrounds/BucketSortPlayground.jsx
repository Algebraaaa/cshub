import PlaygroundShell from './PlaygroundShell'
import { randomArray, ArrayTextInput } from './inputs/ArrayInput'

const BUCKET_COLORS = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  '#a78bfa', '#60a5fa',
]

const LEGEND = [
  { color: '#8b5cf6', label: '桶 0' },
  { color: '#3b82f6', label: '桶 1' },
  { color: '#10b981', label: '桶 2' },
  { color: '#f59e0b', label: '桶 3+' },
]

const DEFAULT_ARR = [64, 12, 90, 37, 55, 78, 23, 11, 88, 45]
const EIGHT = [29, 25, 3, 49, 9, 37, 21, 43]

const PRESETS = [
  { id: 'ten',    label: '10元素',  state: () => ({ arr: DEFAULT_ARR.slice() }) },
  { id: 'eight',  label: '8元素',   state: () => ({ arr: EIGHT.slice() }) },
  { id: 'random', label: '🎲 随机', state: () => ({ arr: randomArray(10, { min: 0, max: 99 }) }) },
]

export default function BucketSortPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={{ arr: DEFAULT_ARR.slice(), text: '' }}
      presets={PRESETS}
      derivePayload={s => s.arr}
      computeSteps={arr => algoFn(arr)}
      extraToolbar={({ state, setState, ctrl }) => (
        <ArrayTextInput state={state} setState={setState} ctrl={ctrl}
          placeholder="自定义: 64 12 90 37" minLen={2}
          positiveOnly={false} width={180} />
      )}
      renderViz={({ current }) => (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, marginBottom: 16, padding: '20px 16px',
          minHeight: 300,
        }}>
          <BucketVizContent step={current} />
        </div>
      )}
      legend={LEGEND}
    />
  )
}

function BucketVizContent({ step }) {
  if (!step) return null
  const { arr, buckets, phase, bucketCount, minVal, maxVal } = step

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: phase === 'done' ? 'var(--green)' : phase === 'distribute' ? 'var(--accent-light)' : phase === 'sort_buckets' ? 'var(--yellow)' : 'var(--text-tertiary)',
        }}>
          {phase === 'init' ? '初始化'
            : phase === 'distribute' ? '▼ 分配到桶'
            : phase === 'sort_buckets' ? '⚡ 桶内排序'
            : '✓ 合并完成'}
        </span>
        {bucketCount && (
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            {bucketCount} 个桶 · 范围 [{minVal}, {maxVal}]
          </span>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 600 }}>
          {phase === 'done' ? '✓ 已排序数组' : '当前数组'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {arr.map((v, i) => (
            <div key={i} style={{
              width: 48, height: 48, borderRadius: 8,
              background: phase === 'done' ? 'rgba(16,185,129,0.15)' : 'var(--surface-2)',
              border: `2px solid ${phase === 'done' ? 'var(--green)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)',
              color: phase === 'done' ? 'var(--green)' : 'var(--text-primary)',
              transition: 'all 0.4s',
            }}>
              {v}
            </div>
          ))}
        </div>
      </div>

      {buckets && (
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 600 }}>
            桶结构（{phase === 'sort_buckets' ? '桶内已排序' : '元素已分配'}）
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {buckets.map((bucket, bi) => {
              const color = BUCKET_COLORS[bi % BUCKET_COLORS.length]
              return (
                <div key={bi} style={{
                  background: `${color}12`,
                  border: `1.5px solid ${bucket.length > 0 ? color : 'var(--border)'}`,
                  borderRadius: 10, padding: '8px 10px', minWidth: 60, minHeight: 70,
                  transition: 'all 0.3s',
                  flex: '1 1 60px', maxWidth: 100,
                }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color,
                    marginBottom: 6, textAlign: 'center',
                  }}>
                    桶 {bi}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                    {bucket.map((v, vi) => (
                      <div key={vi} style={{
                        fontSize: 12, fontWeight: 600,
                        background: color,
                        color: 'white', borderRadius: 4,
                        padding: '2px 8px', fontFamily: 'var(--font-mono)',
                        transition: 'all 0.2s',
                      }}>
                        {v}
                      </div>
                    ))}
                    {bucket.length === 0 && (
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', padding: '4px 0' }}>空</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
