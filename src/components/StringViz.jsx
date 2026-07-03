import { useEffect, useRef } from 'react'

// 2026-07 动画升级(对齐 VisuAlgo 字符串匹配动画):
//   - 主串/模式串放进同一个横向滚动容器,单行不换行——修复长主串
//     flex-wrap 换行后模式串 padding 对齐彻底错位的布局 bug
//   - 模式串滑动改用 transform: translateX(合成器动画,不再走
//     padding-left 的逐帧 layout),KMP 失配时"跳跃式前移"清晰可见
//   - 滑动时长跟随播放速度;比较指针位置自动滚入视野

const CELL = 44 // 40px 格子 + 4px gap 的网格步距

export default function StringViz({ stepData, speedMs = 1000 }) {
  const scrollRef = useRef(null)
  const textIdxForScroll = stepData?.textIdx
  // 活跃比较位置自动保持在可视区内(长主串横向滚动时跟随指针)
  useEffect(() => {
    const el = scrollRef.current
    if (!el || textIdxForScroll == null || textIdxForScroll < 0) return
    const target = textIdxForScroll * CELL
    const { scrollLeft, clientWidth } = el
    if (target < scrollLeft + CELL || target > scrollLeft + clientWidth - CELL * 2) {
      el.scrollTo({ left: Math.max(0, target - clientWidth / 2), behavior: 'smooth' })
    }
  }, [textIdxForScroll])

  if (!stepData) return null

  const {
    text,
    pattern,
    textIdx,
    patternIdx,
    shift,
    status,
    lps,
    lpsI,
    lpsLen,
    windowHash,
    patHash,
  } = stepData

  const isBuildingLPS = status && status.includes('lps')
  const isRabinKarp = patHash !== undefined && patHash !== null
  const m = pattern?.length || 0
  const winStart = shift
  const winEnd = winStart != null && winStart >= 0 ? winStart + m - 1 : -1
  const hashHit = isRabinKarp && windowHash != null && windowHash === patHash
  const statusMeta = status ? { label: statusLabel(status), bg: statusBg(status), fg: statusFg(status) } : null
  // 模式串滑动时长跟随播放速度(与 Sorting/Heap 同策略)
  const dur = Math.max(140, Math.min(450, speedMs * 0.45))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>

      {/* Rabin-Karp hash panel */}
      {isRabinKarp && (
        <div style={{
          display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
          padding: '10px 16px', borderRadius: 10,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)', fontSize: 13,
        }}>
          <HashPill label="窗口 hash" value={windowHash} highlight={hashHit ? 'green' : (status === 'hash_miss' ? 'orange' : null)} />
          <HashPill label="模式 hash" value={patHash} highlight={hashHit ? 'green' : null} />
          {statusMeta && (
            <span style={{
              padding: '3px 8px',
              borderRadius: 999,
              background: statusMeta.bg,
              color: statusMeta.fg,
              fontWeight: 800,
            }}>{statusMeta.label}</span>
          )}
        </div>
      )}

      {/* LPS Array visualization for KMP */}
      {lps && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ marginBottom: 8, color: 'var(--text-dim)' }}>Next (LPS) 数组</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {pattern.split('').map((char, i) => {
              let bg = 'var(--surface-sunken)'
              let border = '1px solid var(--border)'
              if (isBuildingLPS) {
                if (i === lpsI) {
                  border = '2px solid var(--blue)'
                  bg = 'var(--blue-light)'
                } else if (i === lpsLen && status !== 'lps_complete') {
                  border = '2px solid var(--purple)'
                  bg = 'var(--purple-light)'
                }
              }
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>{char}</div>
                  <div style={{
                    width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: bg, border, borderRadius: 4,
                    fontWeight: 600,
                  }}>
                    {lps[i]}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 主串 + 模式串:同一横向滚动容器,单行对齐(修复换行错位 bug) */}
      {!isBuildingLPS && text && (
      <div ref={scrollRef} style={{ width: '100%', overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ width: text.length * CELL - 4, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {text.split('').map((char, i) => {
            let bg = 'var(--surface-sunken)'
            let border = '1px solid var(--border)'
            const inWindow = isRabinKarp && winStart >= 0 && i >= winStart && i <= winEnd

            // Window background for Rabin-Karp
            if (inWindow) {
              if (status === 'match') {
                bg = 'var(--green-light)'; border = '2px solid var(--green)'
              } else if (status === 'hash_collision') {
                bg = 'rgba(251, 191, 36, 0.18)'; border = '2px solid #fbbf24'
              } else if (status === 'hash_miss') {
                bg = 'var(--surface-2)'; border = '1px dashed var(--border)'
              } else if (status === 'verifying' || status === 'rolling' || status === 'window_init') {
                bg = 'var(--blue-light)'; border = '2px solid var(--blue)'
              }
            }

            // Active char on top of window
            if (i === textIdx) {
              if (status === 'match' || status === 'comparing' || status === 'verifying') {
                border = '2px solid var(--blue)'; bg = 'var(--blue-light)'
              } else if (status === 'mismatch' || status === 'hash_collision') {
                border = '2px solid var(--red)'; bg = 'var(--red-light)'
              } else if (status === 'rolling') {
                border = '2px solid var(--purple)'; bg = 'var(--purple-light)'
              }
            } else if (shift != null && shift !== -1 && i >= shift && i < shift + m && status === 'match' && !isRabinKarp) {
              border = '2px solid var(--green)'; bg = 'var(--green-light)'
            }

            return (
              <div key={i} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>{i}</div>
                <div style={{
                  width: 40, height: 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: bg, border, borderRadius: 6,
                  fontSize: 18, fontWeight: 600,
                  transition: 'background 0.2s, border-color 0.2s',
                }}>
                  {char}
                </div>
                {i === textIdx && (
                  <div style={{ position: 'absolute', bottom: -20, fontSize: 12, color: 'var(--blue)' }}>
                    ↑ i
                  </div>
                )}
              </div>
            )
          })}
        </div>

      {/* 模式串:transform 滑动(合成器动画),KMP 失配跳跃清晰可见 */}
      {pattern && (
        <div style={{
          display: 'flex',
          gap: 4,
          width: 'max-content',
          marginTop: 24,
          transform: `translateX(${shift != null && shift !== -1 ? shift * CELL : 0}px)`,
          transition: `transform ${dur}ms cubic-bezier(0.34, 1.15, 0.64, 1)`,
          willChange: 'transform',
        }}>
          {pattern.split('').map((char, j) => {
            let bg = 'var(--surface-sunken)'
            let border = '1px solid var(--border)'

            if (status === 'match') {
              border = '2px solid var(--green)'; bg = 'var(--green-light)'
            } else if (status === 'hash_miss') {
              bg = 'var(--surface-2)'; border = '1px dashed var(--border)'
            } else if (status === 'hash_collision' && j === patternIdx) {
              border = '2px solid var(--red)'; bg = 'var(--red-light)'
            } else if (j === patternIdx) {
              if (status === 'mismatch') {
                border = '2px solid var(--red)'; bg = 'var(--red-light)'
              } else {
                border = '2px solid var(--blue)'; bg = 'var(--blue-light)'
              }
            } else if (j < patternIdx) {
              border = '2px solid var(--green)'
            }

            return (
              <div key={j} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 40, height: 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: bg, border, borderRadius: 6,
                  fontSize: 18, fontWeight: 600,
                  transition: 'background 0.2s, border-color 0.2s',
                }}>
                  {char}
                </div>
                {j === patternIdx && (
                  <div style={{ position: 'absolute', bottom: -20, fontSize: 12, color: 'var(--blue)' }}>
                    ↑ j
                  </div>
                )}
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 22 }}>{j}</div>
              </div>
            )
          })}
        </div>
      )}
        </div>
      </div>
      )}
    </div>
  )
}

function HashPill({ label, value, highlight }) {
  const color = highlight === 'green' ? 'var(--green)'
              : highlight === 'orange' ? '#fbbf24'
              : 'var(--text-secondary)'
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <strong style={{ color, fontWeight: 700 }}>{value ?? '—'}</strong>
    </span>
  )
}

function statusLabel(s) {
  switch (s) {
    case 'init':           return '预计算 hash'
    case 'window_init':    return '首窗就位'
    case 'hash_miss':      return 'Hash 不等，跳过'
    case 'hash_collision': return 'Hash 碰撞！需验证'
    case 'verifying':      return '逐字符验证'
    case 'rolling':        return '滚动到下一窗'
    case 'match':          return '匹配成功'
    case 'done':           return '完成'
    default:               return s
  }
}

function statusBg(s) {
  if (s === 'match' || s === 'done') return 'rgba(34, 197, 94, 0.15)'
  if (s === 'hash_collision') return 'rgba(251, 191, 36, 0.18)'
  if (s === 'hash_miss') return 'rgba(148, 163, 184, 0.15)'
  if (s === 'verifying' || s === 'rolling' || s === 'window_init') return 'rgba(59, 130, 246, 0.15)'
  return 'var(--surface-2)'
}
function statusFg(s) {
  if (s === 'match' || s === 'done') return 'var(--green)'
  if (s === 'hash_collision') return '#fbbf24'
  if (s === 'verifying' || s === 'rolling' || s === 'window_init') return 'var(--blue)'
  return 'var(--text-secondary)'
}
