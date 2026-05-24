import { Link, useParams, Navigate } from 'react-router-dom'
import { PATH_LIST, getPath, getPathProgress } from '../data/paths'
import { ALGORITHMS } from '../data/algorithmMeta'
import { useProgress } from '../contexts/ProgressContext'

export default function PathPage() {
  const { pathId } = useParams()
  const { isCompleted, completed } = useProgress()

  if (!pathId) return <PathListing />

  const path = getPath(pathId)
  if (!path) return <Navigate to="/path" replace />

  const progress = getPathProgress(pathId, completed)

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '40px 32px 120px' }}>
      <Link to="/path" style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        ← 所有学习路径
      </Link>
      <div style={{
        marginTop: 12,
        padding: 28,
        borderRadius: 24,
        background: 'var(--glass-bg-mid)',
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        border: '1px solid var(--glass-border-strong)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.14), inset 0 1px 1px rgba(255,255,255,0.18)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          background: path.gradient, opacity: 0.10, pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: path.gradient,
            color: 'white', fontSize: 24, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 12px 32px ${path.color}44`,
            flexShrink: 0,
          }}>🛣️</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{path.name}</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '6px 0 0' }}>{path.desc}</p>
            <div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-tertiary)' }}>
              <span>难度：<span style={{ color: path.color, fontWeight: 700 }}>{path.level}</span></span>
              {path.estimate && <span>预计：{path.estimate}</span>}
              <span>{progress.done} / {progress.total} 已学</span>
            </div>
          </div>
          <div style={{ width: 140, textAlign: 'right' }}>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-mono)', color: path.color }}>{progress.pct}%</div>
            <div style={{ marginTop: 6, height: 6, borderRadius: 99, background: 'var(--surface-3)', overflow: 'hidden' }}>
              <div style={{ width: `${progress.pct}%`, height: '100%', background: path.gradient }} />
            </div>
          </div>
        </div>
      </div>

      {/* 时间轴 */}
      <ol style={{
        marginTop: 30, padding: '6px 0 0 0', listStyle: 'none',
        position: 'relative',
      }}>
        <div aria-hidden="true" style={{
          position: 'absolute',
          left: 19,
          top: 18,
          bottom: 18,
          width: 2,
          background: 'linear-gradient(180deg, var(--glass-border-strong), transparent)',
        }} />
        {path.slugs.map((slug, i) => {
          const algo = ALGORITHMS[slug]
          if (!algo) return null
          const done = isCompleted(slug)
          return (
            <li key={slug} style={{
              position: 'relative',
              paddingLeft: 56,
              marginBottom: 12,
            }}>
              <div style={{
                position: 'absolute',
                left: 5, top: 14,
                width: 30, height: 30, borderRadius: '50%',
                background: done ? path.color : 'var(--surface-2)',
                border: `2px solid ${done ? path.color : 'var(--glass-border-strong)'}`,
                color: done ? 'white' : 'var(--text-tertiary)',
                fontSize: 12, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: done ? `0 6px 16px ${path.color}55` : 'none',
                fontFamily: 'var(--font-mono)',
              }}>{done ? '✓' : i + 1}</div>
              <Link to={`/algo/${slug}?path=${path.id}`} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${done ? path.color + '44' : 'var(--glass-border)'}`,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--glass-bg-strong)'
                e.currentTarget.style.borderColor = path.color + '88'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.borderColor = done ? path.color + '44' : 'var(--glass-border)'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{algo.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{algo.nameEn} · {algo.difficulty}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  {algo.timeComplexity?.average || ''}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function PathListing() {
  const { completed } = useProgress()
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 32px 120px' }}>
      <Link to="/" style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        ← 返回首页
      </Link>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 12, letterSpacing: '-0.03em' }}>学习路径</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, marginBottom: 28 }}>
        把零散算法组织成有序序列，沿着路径推进会带 prev/next 导航。
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
      }}>
        {PATH_LIST.map(p => {
          const prog = getPathProgress(p.id, completed)
          return (
            <Link key={p.id} to={`/path/${p.id}`} style={{
              padding: 20, borderRadius: 18,
              background: 'var(--glass-bg-mid)',
              border: '1px solid var(--glass-border-strong)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              display: 'flex', flexDirection: 'column', gap: 10,
              position: 'relative', overflow: 'hidden',
            }}>
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: p.gradient, opacity: 0.08, pointerEvents: 'none' }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{p.name}</span>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: `${p.color}22`, color: p.color, fontWeight: 700 }}>{p.level}</span>
              </div>
              <div style={{ position: 'relative', fontSize: 12.5, color: 'var(--text-tertiary)', lineHeight: 1.55 }}>{p.desc}</div>
              <div style={{ position: 'relative', marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 700, marginBottom: 5 }}>
                  <span>{prog.done} / {prog.total}</span>
                  <span style={{ color: p.color, fontFamily: 'var(--font-mono)' }}>{prog.pct}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: 'var(--surface-3)', overflow: 'hidden' }}>
                  <div style={{ width: `${prog.pct}%`, height: '100%', background: p.gradient }} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
