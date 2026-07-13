import { useEffect, useState, useMemo } from 'react'
import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom'
import { StepProvider } from '../contexts/StepContext'
import { ALGORITHMS, ALGORITHM_LIBRARY_LIST } from '../data/algorithmMeta'
import { loadAlgorithmDetail } from '../data/algorithmDetails'
import { getPathNavigation, findPathsContaining } from '../data/paths'
import { useAchievements } from '../contexts/AchievementsContext'
import ErrorBoundary from '../components/ErrorBoundary'
import { AlgorithmPageSkeleton } from '../components/SkeletonCard'
import AlgorithmHeader from '../components/learning/AlgorithmHeader'
import InteractiveVisualization from '../components/learning/InteractiveVisualization'
import AlgorithmPlaygroundFor from '../components/learning/AlgorithmPlaygroundFor'
import AlgorithmTabs from '../components/learning/AlgorithmTabs'
import { preloadPlayground } from '../components/learning/playgroundRegistry'
import { recordRecentAlgo } from '../services/recents'

const TEXT = {
  missing: '\u7b97\u6cd5\u4e0d\u5b58\u5728',
  backHome: '\u8fd4\u56de\u9996\u9875',
  visualization: '\u4ea4\u4e92\u5f0f\u53ef\u89c6\u5316',
  previous: '\u4e0a\u4e00\u7bc7',
  next: '\u4e0b\u4e00\u7bc7',
}

// \u663e\u793a\u540d\u79f0\u53d6\u81ea\u7b97\u6cd5\u5143\u6570\u636e\u672c\u8eab\uff08SSOT\uff09\uff1a\u5148\u7528\u4e2d\u6587 name\uff0c\u56de\u9000\u5230\u82f1\u6587 nameEn\uff0c
// \u6700\u540e\u624d\u662f slug\u3002\u539f\u6765\u8fd9\u91cc\u6709\u4e00\u4e2a 65 \u884c\u7684 ALGORITHM_TITLES \u786c\u7f16\u7801\u8868\uff0c\u4e0e
// algorithms \u5b50\u6587\u4ef6\u91cc\u7684 name \u5b57\u6bb5\u91cd\u590d\uff0c\u5df2\u5220\u9664\u3002
function getDisplayName(algo) {
  return algo.name || algo.nameEn || algo.slug
}

export default function AlgorithmPage() {
  const { slug } = useParams()
  const isInfoTheorySlug = slug?.startsWith('it-')
  const meta = isInfoTheorySlug ? null : ALGORITHMS[slug]
  const [algo, setAlgo] = useState(null)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    if (isInfoTheorySlug) {
      setAlgo(null)
      setLoadError(null)
      return
    }

    if (!meta) {
      setAlgo(null)
      setLoadError(null)
      return
    }

    let cancelled = false
    setAlgo(null)
    setLoadError(null)
    const detailPromise = loadAlgorithmDetail(slug)
    const playgroundPromise = preloadPlayground(meta.viz).catch(() => null)

    Promise.all([detailPromise, playgroundPromise])
      .then(([detail]) => {
        if (!cancelled) setAlgo(detail || meta)
      })
      .catch(err => {
        if (!cancelled) {
          setLoadError(err)
          setAlgo(meta)
        }
      })
    return () => { cancelled = true }
  }, [slug, meta, isInfoTheorySlug])

  if (isInfoTheorySlug) {
    return <Navigate to={`/ai-course/lesson/${slug}`} replace />
  }

  if (!meta) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>{TEXT.missing}</h2>
        <Link to="/" style={{ color: 'var(--accent-light)' }}>{TEXT.backHome} {'\u2192'}</Link>
      </div>
    )
  }

  if (!algo) {
    return <AlgorithmPageFallback />
  }

  return (
    <StepProvider>
      <AlgorithmPageContent algo={algo} loadError={loadError} />
    </StepProvider>
  )
}

function AlgorithmPageFallback() {
  return <AlgorithmPageSkeleton />
}

function AlgorithmPageContent({ algo, loadError }) {
  // useMemo 稳定 playground JSX 引用：algo 在加载后不会重建，
  // 因此 playground 引用不变，InteractiveVisualization 的 memo 才能生效。
  const playground = useMemo(
    () => <AlgorithmPlaygroundFor key={algo.slug} algo={algo} />,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [algo.slug],   // slug 变化时才重建（切换算法）
  )
  const showCode = Boolean(algo.code)
  const pageTitle = getDisplayName(algo)
  const [searchParams] = useSearchParams()
  const pathId = searchParams.get('path')
  const pathNav = useMemo(
    () => pathId ? getPathNavigation(pathId, algo.slug) : null,
    [pathId, algo.slug]
  )
  const { ping } = useAchievements()

  useEffect(() => {
    const prev = document.title
    document.title = `${pageTitle} - AlgoViz`
    recordRecentAlgo(algo.slug)
    ping()  // 访问算法页 → 触发当日打卡
    return () => { document.title = prev }
  }, [pageTitle, algo.slug, ping])

  return (
    <article>
      {loadError && (
        <div style={{
          marginBottom: 16,
          padding: '10px 14px',
          borderRadius: 10,
          background: 'rgba(251,191,36,0.10)',
          border: '1px solid rgba(251,191,36,0.35)',
          color: 'var(--text-secondary)',
          fontSize: 12,
        }}>
          Failed to load full algorithm detail. Showing metadata-only fallback.
        </div>
      )}
      {pathNav && <PathBanner nav={pathNav} />}
      <AlgorithmHeader algo={algo} />

      {/* 永显：交互式可视化 */}
      <section className="mb-2">
        <ErrorBoundary>
          <InteractiveVisualization
            playground={playground}
            code={algo.code}
            slug={algo.slug}
            showCode={showCode}
          />
        </ErrorBoundary>
      </section>

      {/* Tab 区：原理/伪代码/复杂度/对比/测验/笔记 */}
      <AlgorithmTabs algo={algo} />

      <PathHints currentSlug={algo.slug} activePathId={pathId} />

      <RelatedNav algo={algo} pathNav={pathNav} />
    </article>
  )
}

function PathBanner({ nav }) {
  const { path, index, total, prev, next } = nav
  return (
    <div style={{
      marginBottom: 18,
      padding: '12px 16px',
      borderRadius: 14,
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${path.color}55`,
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 16 }}>🛣️</span>
      <Link to={`/path/${path.id}`} style={{ fontSize: 13, fontWeight: 700, color: path.color }}>
        {path.name}
      </Link>
      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
        第 {index + 1} / {total} 步
      </span>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        {prev && <Link to={`/algo/${prev}?path=${path.id}`} style={pathBtnStyle(path.color)}>← 上一步</Link>}
        {next && <Link to={`/algo/${next}?path=${path.id}`} style={pathBtnStyle(path.color)}>下一步 →</Link>}
      </div>
    </div>
  )
}

function PathHints({ currentSlug, activePathId }) {
  const paths = findPathsContaining(currentSlug).filter(p => p.id !== activePathId)
  if (paths.length === 0) return null
  return (
    <div style={{ marginTop: 24, padding: '14px 18px', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
        本题出现在以下学习路径
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {paths.map(p => (
          <Link key={p.id} to={`/algo/${currentSlug}?path=${p.id}`} style={{
            padding: '4px 10px', borderRadius: 99,
            background: `${p.color}22`, color: p.color,
            fontSize: 12, fontWeight: 700,
            border: `1px solid ${p.color}44`,
          }}>
            🛣️ {p.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

function pathBtnStyle(color) {
  return {
    fontSize: 12, fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 8,
    background: `${color}22`,
    border: `1px solid ${color}44`,
    color,
  }
}

function RelatedNav({ algo, pathNav }) {
  // 路径内导航优先
  if (pathNav && (pathNav.prev || pathNav.next)) {
    const prevAlgo = pathNav.prev ? ALGORITHMS[pathNav.prev] : null
    const nextAlgo = pathNav.next ? ALGORITHMS[pathNav.next] : null
    return (
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
        marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--glass-border)',
      }}>
        {prevAlgo ? <NavCard to={`/algo/${prevAlgo.slug}?path=${pathNav.path.id}`} name={getDisplayName(prevAlgo)} /> : <div />}
        {nextAlgo ? <NavCard to={`/algo/${nextAlgo.slug}?path=${pathNav.path.id}`} name={getDisplayName(nextAlgo)} align="right" /> : <div />}
      </div>
    )
  }

  const sameCategory = ALGORITHM_LIBRARY_LIST.filter(a => a.category === algo.category)
  const idx = sameCategory.findIndex(a => a.slug === algo.slug)
  const prev = idx > 0 ? sameCategory[idx - 1] : null
  const next = idx < sameCategory.length - 1 ? sameCategory[idx + 1] : null

  if (!prev && !next) return null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
      marginTop: 48,
      paddingTop: 40,
      borderTop: '1px solid var(--glass-border)',
    }}>
      {prev ? (
        <NavCard to={`/algo/${prev.slug}`} name={getDisplayName(prev)} />
      ) : <div />}
      {next ? (
        <NavCard to={`/algo/${next.slug}`} name={getDisplayName(next)} align="right" />
      ) : <div />}
    </div>
  )
}

function NavCard({ to, name, align = 'left' }) {
  return (
    <Link to={to} className="nav-card" style={{ textAlign: align }}>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
        {align === 'right' ? `${TEXT.next} \u2192` : `\u2190 ${TEXT.previous}`}
      </div>
      <div style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 700 }}>
        {name}
      </div>
    </Link>
  )
}
