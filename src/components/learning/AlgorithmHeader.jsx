import { memo } from 'react'
import { CATEGORIES } from '../../data/algorithmMeta'
import { useProgress } from '../../contexts/ProgressContext'
import { useIsPhone } from '../../hooks/useMediaQuery'

const TEXT = {
  favorite: '\u6536\u85cf',
  favorited: '\u5df2\u6536\u85cf',
  markDone: '\u6807\u8bb0\u5df2\u5b66',
  done: '\u5df2\u5b66\u5b8c',
  stable: '\u7a33\u5b9a',
  unstable: '\u4e0d\u7a33\u5b9a',
  inPlace: '\u539f\u5730',
  notInPlace: '\u975e\u539f\u5730',
  defaultDescription: '\u901a\u8fc7\u53ef\u89c6\u5316\u3001\u4f2a\u4ee3\u7801\u548c\u590d\u6742\u5ea6\u5206\u6790\u7406\u89e3\u8be5\u7b97\u6cd5\u3002',
}

// \u5404 category \u7684\u6c34\u5370\u7f29\u5199\uff08\u4ec5\u6b64\u5904\u9700\u8981\uff0c\u65e0\u6cd5\u4ece CATEGORIES \u6d3e\u751f\uff09
const CATEGORY_MARK = {
  sorting: 'SORT', graph: 'GRAPH', tree: 'TREE', dp: 'DP',
  backtracking: 'DFS', pageReplacement: 'PAGE', diskScheduling: 'DISK',
  string: 'STR', dataStructures: 'DS', network: 'NET', security: 'SEC',
  co: 'CO', cpuScheduling: 'CPU', synchronization: 'SYNC',
  memoryManagement: 'MEM', dbIndex: 'IDX', dbTxn: 'TXN', dbQuery: 'QRY',
  compilerLex: 'LEX', compilerSyn: 'SYN', compilerCode: 'ASM',
}

// memo：algo 对象在加载后引用稳定，主题切换不应重渲染此组件
// （视觉已由 CSS 变量处理，React 状态更新无需触发重渲染）
const AlgorithmHeader = memo(function AlgorithmHeader({ algo }) {
  const cat = CATEGORIES[algo.category]
  const { isFavorite, isCompleted, toggleFavorite, toggleCompleted } = useProgress()
  const fav = isFavorite(algo.slug)
  const done = isCompleted(algo.slug)
  const isPhone = useIsPhone()
  // 从 CATEGORIES（SSOT）读取 label/color，仅 mark 需要本地映射
  const meta = {
    label: cat?.name || algo.category,
    color: cat?.color || '#8b5cf6',
    mark: CATEGORY_MARK[algo.category] || algo.category.slice(0, 4).toUpperCase(),
  }
  // 标题取自算法元数据（SSOT）：name > nameEn > slug
  const title = algo.name || algo.nameEn || algo.slug
  const subtitle = algo.nameEn || algo.slug

  return (
    <section style={{
      marginBottom: isPhone ? 20 : 34,
      position: 'relative',
      overflow: 'hidden',
      borderRadius: isPhone ? 18 : 28,
      border: '1px solid var(--glass-border-strong)',
      background: 'linear-gradient(135deg, var(--glass-bg-mid), var(--glass-bg))',
      backdropFilter: 'blur(42px) saturate(210%)',
      WebkitBackdropFilter: 'blur(42px) saturate(210%)',
      boxShadow: `0 18px 60px ${meta.color}18, var(--glass-shine)`,
      padding: isPhone ? '18px 18px' : '30px 32px',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at 18% 18%, ${meta.color}35, transparent 34%), radial-gradient(circle at 92% 10%, ${meta.color}22, transparent 26%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        right: -28,
        bottom: -42,
        fontSize: 112,
        lineHeight: 1,
        fontWeight: 900,
        color: meta.color,
        opacity: 0.07,
        letterSpacing: 0,
        pointerEvents: 'none',
        fontFamily: 'var(--font-mono)',
      }}>{meta.mark}</div>

      <div className="algo-header-grid" style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: 24,
        alignItems: 'center',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 14,
          }}>
            <Tag color={meta.color}>{meta.label}</Tag>
            {algo.stable !== undefined && (
              <Tag>{algo.stable ? TEXT.stable : TEXT.unstable}</Tag>
            )}
            {algo.inPlace !== undefined && (
              <Tag>{algo.inPlace ? TEXT.inPlace : TEXT.notInPlace}</Tag>
            )}
          </div>

          <h1 className="algo-title" style={{
            // 桌面 42 / iPad 36 / 手机由 CSS @768 强制 28
            fontSize: isPhone ? 26 : 42,
            fontWeight: 850,
            margin: 0,
            letterSpacing: '-0.03em',
            lineHeight: 1.08,
            color: 'var(--text-primary)',
          }}>
            {title}
          </h1>

          <div style={{
            marginTop: 8,
            fontSize: 13,
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
          }}>
            {subtitle}
          </div>

          <p style={{
            fontSize: 14.5,
            color: 'var(--text-secondary)',
            lineHeight: 1.75,
            margin: '14px 0 0',
            maxWidth: 700,
          }}>
            {TEXT.defaultDescription}
          </p>
        </div>

        <div style={{
          display: 'flex',
          // 手机端横排两个按钮，避免一行内一个按钮独占
          flexDirection: isPhone ? 'row' : 'column',
          gap: 8,
          alignItems: 'stretch',
          minWidth: isPhone ? 0 : 132,
          flexWrap: 'wrap',
        }}>
          <GlassActionBtn
            active={fav}
            onClick={() => toggleFavorite(algo.slug)}
            activeColor="var(--yellow)"
            activeGlow="rgba(251,191,36,0.2)"
          >
            <StarIcon filled={fav} />
            <span>{fav ? TEXT.favorited : TEXT.favorite}</span>
          </GlassActionBtn>
          <GlassActionBtn
            active={done}
            onClick={() => toggleCompleted(algo.slug)}
            activeColor="var(--green)"
            activeGlow="rgba(52,211,153,0.2)"
          >
            <CheckIcon />
            <span>{done ? TEXT.done : TEXT.markDone}</span>
          </GlassActionBtn>
        </div>
      </div>
    </section>
  )
})

export default AlgorithmHeader

function GlassActionBtn({ active, onClick, children, activeColor, activeGlow }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: '9px 14px',
      fontSize: 12.5, fontWeight: 700,
      borderRadius: 'var(--r-md)',
      background: active ? `color-mix(in srgb, ${activeColor} 12%, transparent)` : 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: `1px solid ${active ? activeColor + '60' : 'var(--glass-border)'}`,
      boxShadow: active ? `var(--glass-shine), 0 4px 16px ${activeGlow}` : 'var(--glass-shine)',
      color: active ? activeColor : 'var(--text-secondary)',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </button>
  )
}

function StarIcon({ filled }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function Tag({ children, color = 'var(--text-tertiary)' }) {
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: 20,
      background: 'var(--glass-bg-mid)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--glass-shine)',
      color,
      fontSize: 11,
      fontWeight: 750,
      letterSpacing: '0.02em',
    }}>{children}</span>
  )
}
