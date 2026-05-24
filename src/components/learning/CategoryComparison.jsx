import { Link } from 'react-router-dom'
import { getAlgorithmsByCategory } from '../../data/algorithmMeta'
import { preloadAlgorithmDetail } from '../../data/algorithmDetails'
import { preloadPlayground } from './playgroundRegistry'

function preloadAlgorithm(algo) {
  preloadAlgorithmDetail(algo.slug)
  preloadPlayground(algo.viz).catch(() => null)
}

const HEADERS = [
  '\u7b97\u6cd5',
  '\u6700\u597d',
  '\u5e73\u5747',
  '\u6700\u574f',
  '\u7a7a\u95f4',
  '\u96be\u5ea6',
  '\u7a33\u5b9a',
]

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

const DIFFICULTY_LABELS = {
  basic: '\u57fa\u7840',
  medium: '\u4e2d\u7b49',
  advanced: '\u8fdb\u9636',
  '\u57fa\u7840': '\u57fa\u7840',
  '\u4e2d\u7b49': '\u4e2d\u7b49',
  '\u8fdb\u9636': '\u8fdb\u9636',
}

const DIFFICULTY_COLORS = {
  basic: { bg: 'var(--green-soft)', fg: 'var(--green)' },
  medium: { bg: 'var(--yellow-soft)', fg: 'var(--yellow)' },
  advanced: { bg: 'var(--red-soft)', fg: 'var(--red)' },
  '\u57fa\u7840': { bg: 'var(--green-soft)', fg: 'var(--green)' },
  '\u4e2d\u7b49': { bg: 'var(--yellow-soft)', fg: 'var(--yellow)' },
  '\u8fdb\u9636': { bg: 'var(--red-soft)', fg: 'var(--red)' },
}

export default function CategoryComparison({ algo, themeColor = '#8b5cf6' }) {
  const peers = getAlgorithmsByCategory(algo.category)
  if (peers.length <= 1) return null

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 12.5,
        fontFamily: 'var(--font-mono)',
      }}>
        <thead>
          <tr>
            {HEADERS.map((h, i) => (
              <th key={h} style={{
                padding: '8px 12px',
                background: `linear-gradient(135deg, ${themeColor}10, var(--surface-2))`,
                color: 'var(--text-tertiary)',
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: '0.05em',
                textAlign: i === 0 ? 'left' : 'center',
                borderBottom: `1px solid color-mix(in srgb, ${themeColor} 24%, var(--border))`,
                whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {peers.map((a, i) => {
            const isCurrent = a.slug === algo.slug
            const name = ALGORITHM_TITLES[a.slug] || a.nameEn || a.slug

            return (
              <tr key={a.slug} style={{
                background: isCurrent ? `${themeColor}14` : (i % 2 === 0 ? 'transparent' : 'var(--bg-elev)'),
                borderLeft: isCurrent ? `3px solid ${themeColor}` : '3px solid transparent',
              }}>
                <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)' }}>
                  {isCurrent ? (
                    <span style={{ fontWeight: 700, color: themeColor, fontFamily: 'var(--font-sans)' }}>
                      {name}
                    </span>
                  ) : (
                    <Link
                      to={`/algo/${a.slug}`}
                      style={{
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-sans)',
                        transition: 'color 0.15s',
                      }}
                      onFocus={() => preloadAlgorithm(a)}
                      onMouseEnter={e => {
                        preloadAlgorithm(a)
                        e.currentTarget.style.color = themeColor
                      }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                    >
                      {name}
                    </Link>
                  )}
                </td>
                {[
                  a.timeComplexity?.best,
                  a.timeComplexity?.average,
                  a.timeComplexity?.worst,
                  a.spaceComplexity,
                ].map((val, ci) => (
                  <td key={ci} style={{
                    padding: '9px 12px',
                    textAlign: 'center',
                    borderBottom: '1px solid var(--border)',
                    color: val ? complexityColor(val) : 'var(--text-tertiary)',
                    fontWeight: isCurrent ? 600 : 400,
                    whiteSpace: 'nowrap',
                  }}>
                    {val || '-'}
                  </td>
                ))}
                <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                  <DiffBadge level={a.difficulty} />
                </td>
                <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                  {a.stable === true
                    ? <span style={{ color: 'var(--green)', fontSize: 11, fontWeight: 600 }}>{'\u662f'}</span>
                    : a.stable === false
                    ? <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>{'\u5426'}</span>
                    : <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>N/A</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function complexityColor(val) {
  if (!val) return 'var(--text-tertiary)'
  if (/^O\(1\)$/.test(val)) return 'var(--green)'
  if (/^O\(n\)$|^O\(n\+/.test(val)) return 'var(--blue)'
  if (/log/.test(val) && !/n\^?2|n²/.test(val)) return 'var(--accent-light)'
  if (/n\^?2|n²|V\^?2|n\*m|nm/.test(val)) return 'var(--yellow)'
  if (/n!|2\^n|V\^?3|V³/.test(val)) return 'var(--red)'
  return 'var(--text-secondary)'
}

function DiffBadge({ level }) {
  const c = DIFFICULTY_COLORS[level] || DIFFICULTY_COLORS.basic
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 6px',
      borderRadius: 3,
      background: c.bg,
      color: c.fg,
      fontSize: 10,
      fontWeight: 600,
      fontFamily: 'var(--font-sans)',
    }}>{DIFFICULTY_LABELS[level] || level}</span>
  )
}
