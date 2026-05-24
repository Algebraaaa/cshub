import PlaygroundShell from './PlaygroundShell'
import { randomArray, ArrayTextInput } from './inputs/ArrayInput'

const BUCKET_COLORS = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
]

const LEGEND = [
  { color: BUCKET_COLORS[0], label: '桶 0' },
  { color: BUCKET_COLORS[1], label: '桶 1' },
  { color: BUCKET_COLORS[4], label: '桶 4' },
  { color: '#10b981', label: '当前轮已排序' },
]

const CLASSIC = [170, 45, 75, 90, 802, 24, 2, 66]
const SEVEN = [329, 457, 657, 839, 436, 720, 355]

const PRESETS = [
  { id: 'classic', label: '经典示例', state: () => ({ arr: CLASSIC.slice() }) },
  { id: 'seven',   label: '七元素',   state: () => ({ arr: SEVEN.slice() }) },
  { id: 'random',  label: '🎲 随机',  state: () => ({ arr: randomArray(8, { min: 10, max: 909 }) }) },
]

export default function RadixSortPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={{ arr: CLASSIC.slice(), text: '' }}
      presets={PRESETS}
      derivePayload={s => s.arr}
      computeSteps={arr => algoFn(arr)}
      extraToolbar={({ state, setState, ctrl }) => (
        <ArrayTextInput state={state} setState={setState} ctrl={ctrl}
          placeholder="自定义（0-9999）: 170 45 75" minLen={2}
          positiveOnly={false} width={200} />
      )}
      renderViz={({ current }) => (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, marginBottom: 16, padding: '20px 16px',
          minHeight: 300,
        }}>
          <RadixVizContent step={current} />
        </div>
      )}
      legend={LEGEND}
    />
  )
}

function RadixVizContent({ step }) {
  if (!step) return null
  const { arr, buckets, phase, digit, digitLabel } = step

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          color: phase === 'done' ? 'var(--green)' : phase === 'distribute' ? 'var(--accent-light)' : 'var(--text-tertiary)',
          textTransform: 'uppercase',
        }}>
          {phase === 'init' ? '初始化' : phase === 'distribute' ? `▼ 分配 (${digitLabel})` : phase === 'collect' ? `▲ 收集 (${digitLabel})` : '✓ 完成'}
        </span>
        {digit !== undefined && digit > 0 && (
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>第 {digit + 1} 轮</span>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 600 }}>当前数组</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {arr.map((v, i) => (
            <div key={i} style={{
              width: 52, height: 52, borderRadius: 8,
              background: phase === 'done' ? 'rgba(16,185,129,0.15)' : 'var(--surface-2)',
              border: `2px solid ${phase === 'done' ? 'var(--green)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)',
              color: phase === 'done' ? 'var(--green)' : 'var(--text-primary)',
              transition: 'all 0.3s',
            }}>
              {v}
            </div>
          ))}
        </div>
      </div>

      {buckets && (
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 600 }}>
            桶分配（按 {digitLabel}）
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6 }}>
            {buckets.map((bucket, bi) => (
              <div key={bi} style={{
                background: `${BUCKET_COLORS[bi]}15`,
                border: `1px solid ${bucket.length > 0 ? BUCKET_COLORS[bi] : 'var(--border)'}`,
                borderRadius: 8, padding: '6px 4px', minHeight: 60,
                transition: 'all 0.3s',
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: BUCKET_COLORS[bi],
                  textAlign: 'center', marginBottom: 4,
                }}>桶{bi}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                  {bucket.map((v, vi) => (
                    <div key={vi} style={{
                      fontSize: 11, fontWeight: 600,
                      background: BUCKET_COLORS[bi],
                      color: 'white', borderRadius: 4,
                      padding: '1px 6px', fontFamily: 'var(--font-mono)',
                    }}>
                      {v}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
