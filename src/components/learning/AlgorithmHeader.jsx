import { CATEGORIES } from '../../data/algorithmMeta'
import { useProgress } from '../../contexts/ProgressContext'

const TEXT = {
  favorite: '\u6536\u85cf',
  favorited: '\u5df2\u6536\u85cf',
  markDone: '\u6807\u8bb0\u5df2\u5b66',
  done: '\u5df2\u5b66\u5b8c',
  stable: '\u7a33\u5b9a',
  unstable: '\u4e0d\u7a33\u5b9a',
  inPlace: '\u539f\u5730',
  notInPlace: '\u975e\u539f\u5730',
  basic: '\u57fa\u7840',
  medium: '\u4e2d\u7b49',
  advanced: '\u8fdb\u9636',
  defaultDescription: '\u901a\u8fc7\u53ef\u89c6\u5316\u3001\u4f2a\u4ee3\u7801\u548c\u590d\u6742\u5ea6\u5206\u6790\u7406\u89e3\u8be5\u7b97\u6cd5\u3002',
}

const CATEGORY_META = {
  sorting: { label: '\u6392\u5e8f\u7b97\u6cd5', color: '#8b5cf6', mark: 'SORT' },
  graph: { label: '\u56fe\u7b97\u6cd5', color: '#3b82f6', mark: 'GRAPH' },
  tree: { label: '\u6811\u7ed3\u6784', color: '#10b981', mark: 'TREE' },
  dp: { label: '\u52a8\u6001\u89c4\u5212', color: '#f59e0b', mark: 'DP' },
  backtracking: { label: '\u56de\u6eaf\u7b97\u6cd5', color: '#dc2626', mark: 'DFS' },
  pageReplacement: { label: '\u9875\u9762\u7f6e\u6362', color: '#ec4899', mark: 'PAGE' },
  diskScheduling: { label: '\u78c1\u76d8\u8c03\u5ea6', color: '#8b5cf6', mark: 'DISK' },
  string: { label: '\u5b57\u7b26\u4e32\u5339\u914d', color: '#14b8a6', mark: 'STR' },
  dataStructures: { label: '\u6570\u636e\u7ed3\u6784', color: '#6366f1', mark: 'DS' },
}

const ALGORITHM_TITLES = {
  bubblesort: '\u5192\u6ce1\u6392\u5e8f',
  selectionsort: '\u9009\u62e9\u6392\u5e8f',
  shellsort: '\u5e0c\u5c14\u6392\u5e8f',
  insertionsort: '\u63d2\u5165\u6392\u5e8f',
  countingsort: '\u8ba1\u6570\u6392\u5e8f',
  quicksort: '\u5feb\u901f\u6392\u5e8f',
  mergesort: '\u5f52\u5e76\u6392\u5e8f',
  heapsort: '\u5806\u6392\u5e8f',
  radixsort: '\u57fa\u6570\u6392\u5e8f',
  bucketsort: '\u6876\u6392\u5e8f',
  bfs: '\u5e7f\u5ea6\u4f18\u5148\u641c\u7d22',
  dfs: '\u6df1\u5ea6\u4f18\u5148\u641c\u7d22',
  dijkstra: 'Dijkstra \u7b97\u6cd5',
  bellmanford: 'Bellman-Ford \u7b97\u6cd5',
  floydwarshall: 'Floyd-Warshall \u7b97\u6cd5',
  toposort: '\u62d3\u6251\u6392\u5e8f',
  prim: 'Prim \u6700\u5c0f\u751f\u6210\u6811',
  kruskal: 'Kruskal \u6700\u5c0f\u751f\u6210\u6811',
  bst: '\u4e8c\u53c9\u641c\u7d22\u6811',
  redblack: '\u7ea2\u9ed1\u6811',
  avl: 'AVL \u6811',
  treap: 'Treap',
  knapsack: '0-1 \u80cc\u5305',
  lcs: '\u6700\u957f\u516c\u5171\u5b50\u5e8f\u5217',
  lis: '\u6700\u957f\u9012\u589e\u5b50\u5e8f\u5217',
  editdistance: '\u7f16\u8f91\u8ddd\u79bb',
  coinchange: '\u786c\u5e01\u627e\u96f6',
  fifo: 'FIFO \u9875\u9762\u7f6e\u6362',
  lru: 'LRU \u9875\u9762\u7f6e\u6362',
  opt: 'OPT \u9875\u9762\u7f6e\u6362',
  diskfcfs: 'FCFS \u78c1\u76d8\u8c03\u5ea6',
  sstf: 'SSTF \u78c1\u76d8\u8c03\u5ea6',
  scan: 'SCAN \u78c1\u76d8\u8c03\u5ea6',
  naive: '\u6734\u7d20\u5b57\u7b26\u4e32\u5339\u914d',
  kmp: 'KMP \u5b57\u7b26\u4e32\u5339\u914d',
  rabinkarp: 'Rabin-Karp \u5b57\u7b26\u4e32\u5339\u914d',
  nqueens: 'N \u7687\u540e',
  unionfind: '\u5e76\u67e5\u96c6',
  trie: 'Trie \u5b57\u5178\u6811',
  linkedlist: '\u94fe\u8868',
  astar: 'A* \u641c\u7d22',
  hashtable: '\u54c8\u5e0c\u8868',
  segtree: '\u7ebf\u6bb5\u6811',
}

function normalizeDifficulty(value) {
  const raw = String(value || '').toLowerCase()
  if (raw.includes('advanced') || raw.includes('\u8fdb') || raw.includes('\u6d89') || raw.includes('\u6c49')) {
    return { label: TEXT.advanced, color: 'var(--red)' }
  }
  if (raw.includes('medium') || raw.includes('\u4e2d') || raw.includes('\u5747') || raw.includes('\u74e7')) {
    return { label: TEXT.medium, color: 'var(--yellow)' }
  }
  return { label: TEXT.basic, color: 'var(--green)' }
}

export default function AlgorithmHeader({ algo }) {
  const cat = CATEGORIES[algo.category]
  const { isFavorite, isCompleted, toggleFavorite, toggleCompleted } = useProgress()
  const fav = isFavorite(algo.slug)
  const done = isCompleted(algo.slug)
  const meta = CATEGORY_META[algo.category] || {
    label: cat?.name || '',
    color: cat?.color || '#8b5cf6',
    mark: 'ALGO',
  }
  const difficulty = normalizeDifficulty(algo.difficulty)
  const title = ALGORITHM_TITLES[algo.slug] || algo.name || algo.nameEn || algo.slug
  const subtitle = algo.nameEn || algo.slug

  return (
    <section style={{
      marginBottom: 34,
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 28,
      border: '1px solid var(--glass-border-strong)',
      background: 'linear-gradient(135deg, var(--glass-bg-mid), var(--glass-bg))',
      backdropFilter: 'blur(42px) saturate(210%)',
      WebkitBackdropFilter: 'blur(42px) saturate(210%)',
      boxShadow: `0 18px 60px ${meta.color}18, var(--glass-shine)`,
      padding: '30px 32px',
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
            <Tag color={difficulty.color}>{difficulty.label}</Tag>
            {algo.stable !== undefined && (
              <Tag>{algo.stable ? TEXT.stable : TEXT.unstable}</Tag>
            )}
            {algo.inPlace !== undefined && (
              <Tag>{algo.inPlace ? TEXT.inPlace : TEXT.notInPlace}</Tag>
            )}
          </div>

          <h1 className="algo-title" style={{
            fontSize: 42,
            fontWeight: 850,
            margin: 0,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
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
          flexDirection: 'column',
          gap: 10,
          alignItems: 'stretch',
          minWidth: 132,
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
}

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
