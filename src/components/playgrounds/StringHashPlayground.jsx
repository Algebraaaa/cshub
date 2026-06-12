import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'

const LEGEND = [
  { color: '#3b82f6', label: '文本字符' },
  { color: '#10b981', label: '哈希数组 H[i]' },
  { color: '#f59e0b', label: '当前计算位置' },
  { color: '#a855f7', label: '查询区间' },
]

export default function StringHashPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      computeSteps={() => algoFn({
        text: 'abcdef',
        queries: [
          { type: 'build' },
          { type: 'compare', l1: 0, r1: 2, l2: 3, r2: 5 },
        ],
      })}
      renderViz={({ current }) => (
        <VizCard borderRadius={10} padding="24px 20px" minHeight={340} noInner>
          <StringHashViz step={current} />
        </VizCard>
      )}
      legend={LEGEND}
    />
  )
}

function StringHashViz({ step }) {
  if (!step) return null
  const { text, hashArr, powArr, highlightIdx, query, hashValues, phase } = step

  return (
    <div>
      {/* Info bar */}
      <div style={{
        display: 'flex', gap: 14, marginBottom: 18, flexWrap: 'wrap', justifyContent: 'center',
        padding: '10px 16px', borderRadius: 10,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)', fontSize: 13,
      }}>
        <Pill label="BASE" value={131} color="#3b82f6" />
        <Pill label="MOD" value="2^64" color="#a855f7" />
        <Pill label="阶段" value={phaseLabel(phase)} color="#f59e0b" />
      </div>

      {/* Text characters */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 1, marginBottom: 8 }}>
          文本 text[0..{text.length - 1}]
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {text.split('').map((ch, i) => {
            const inQuery = query && query.type === 'compare' && (
              (i >= query.l1 && i <= query.r1) || (i >= query.l2 && i <= query.r2)
            )
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 3 }}>{i}</div>
                <div style={{
                  width: 44, height: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: inQuery ? '#a855f730' : 'var(--surface)',
                  border: `${inQuery ? 2 : 1}px solid ${inQuery ? '#a855f7' : 'var(--border)'}`,
                  borderRadius: 8,
                  fontSize: 16, fontWeight: 700,
                  color: inQuery ? '#a855f7' : 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {ch}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Hash array */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 1, marginBottom: 8 }}>
          前缀哈希 H[0..{text.length}]
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {hashArr.map((v, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 3 }}>{i}</div>
              <div style={{
                width: 52, height: 38,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i === highlightIdx ? '#f59e0b30' : '#10b98112',
                border: `${i === highlightIdx ? 2 : 1}px solid ${i === highlightIdx ? '#f59e0b' : '#10b98155'}`,
                borderRadius: 6,
                fontSize: 11, fontWeight: 600,
                color: i === highlightIdx ? '#f59e0b' : 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                transition: 'all 0.2s',
                overflow: 'hidden',
              }}>
                {v}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Power array */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 1, marginBottom: 8 }}>
          幂次 P[0..{text.length}]（mod 10^9+7 显示）
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {powArr.map((v, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 3 }}>{i}</div>
              <div style={{
                width: 52, height: 38,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#6366f112',
                border: '1px solid #6366f155',
                borderRadius: 6,
                fontSize: 11, fontWeight: 600,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
              }}>
                {v}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Query result */}
      {phase === 'query' && hashValues.h1 !== undefined && (
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          fontSize: 13, fontFamily: 'var(--font-mono)',
        }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>
            查询比较：
            <span style={{ color: '#a855f7', fontWeight: 700 }}>
              [{query?.l1}..{query?.r1}]="{text.slice(query?.l1, query?.r1 + 1)}"
            </span>
            {' vs '}
            <span style={{ color: '#a855f7', fontWeight: 700 }}>
              [{query?.l2}..{query?.r2}]="{text.slice(query?.l2, query?.r2 + 1)}"
            </span>
          </div>
          {hashValues.h1 !== undefined && (
            <span style={{ color: '#3b82f6' }}>hash1 = {hashValues.h1}</span>
          )}
          {hashValues.h2 !== undefined && (
            <>
              <span style={{ color: 'var(--text-tertiary)', margin: '0 8px' }}>|</span>
              <span style={{ color: '#ec4899' }}>hash2 = {hashValues.h2}</span>
            </>
          )}
          {hashValues.equal !== undefined && (
            <div style={{
              marginTop: 8, fontWeight: 700,
              color: hashValues.equal ? '#10b981' : '#ef4444',
            }}>
              {hashValues.equal ? '哈希相等 → 子串大概率相同' : '哈希不等 → 子串不同'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Pill({ label, value, color }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <strong style={{ color, fontWeight: 700, fontSize: 14 }}>{value}</strong>
    </span>
  )
}

function phaseLabel(p) {
  return { init: '初始化', build: '构建哈希', query: '查询', done: '完成' }[p] || p
}
