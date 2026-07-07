import { useState, useEffect, useRef, useCallback } from 'react'
import { useStepPublish } from '../contexts/StepContext'
import { useIsPhone } from '../hooks/useMediaQuery'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useKeydown } from '../hooks/useKeydown'

const SPEED_PRESETS = [
  { label: '0.5×', ms: 2000 },
  { label: '1×',   ms: 1000 },
  { label: '2×',   ms: 500  },
  { label: '4×',   ms: 250  },
  { label: '8×',   ms: 125  },
]

// ── 键盘快捷键作用域(审计 #6)──────────────────────────────
// 对比页(/compare)同时挂载两个 StepController,若都响应 window 级
// 快捷键,一次空格会同时驱动两个动画。模块级"活跃实例"登记:
// 最后挂载或最后被点击的控制器持有快捷键,其余实例忽略按键。
// 单实例页面不受影响(唯一实例恒为活跃)。
let activeControllerId = null

export function useStepController(steps) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  // useLocalStorage 替代手写的 localStorage.getItem/setItem，并处理 SSR / 私密浏览降级。
  // json: true（默认）确保读取时返回数字，向后兼容旧版存储的纯字符串 "1000"（JSON.parse 能识别）。
  const [speed, setSpeed] = useLocalStorage('algoviz-speed', 1000)
  const timerRef = useRef(null)

  // Publish step to StepContext so pseudocode section can read it
  useStepPublish(step, steps)

  const stop = useCallback(() => {
    setPlaying(false)
    clearInterval(timerRef.current)
  }, [])

  const next = useCallback(() => {
    setStep(s => {
      if (s >= steps.length - 1) { stop(); return s }
      return s + 1
    })
  }, [steps.length, stop])

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(next, speed)
      return () => clearInterval(timerRef.current)
    }
  }, [playing, next, speed])

  const play = () => {
    if (step >= steps.length - 1) setStep(0)
    setPlaying(true)
  }
  const prev = () => { stop(); setStep(s => Math.max(0, s - 1)) }
  const goNext = () => { stop(); next() }
  const reset = () => { stop(); setStep(0) }
  const seek = (n) => { stop(); setStep(Math.max(0, Math.min(n, steps.length - 1))) }

  return { step, playing, speed, setSpeed, play, stop, prev, goNext, reset, seek }
}

export default function StepController({
  total, step, playing, speed, setSpeed,
  play, stop, prev, goNext, reset, seek, description,
  customInput,
}) {
  const scrubberRef = useRef(null)
  const isDragging = useRef(false)
  // 拖拽期间挂在 window 上的监听器的卸载函数；组件若在拖拽中途 unmount，
  // 由下面的 useEffect cleanup 兜底移除，避免监听器泄漏。
  const detachDragListeners = useRef(null)
  const isPhone = useIsPhone()

  useEffect(() => {
    return () => { detachDragListeners.current?.() }
  }, [])

  // 活跃实例登记:挂载即认领;卸载时若仍是自己则释放
  const idRef = useRef(null)
  if (!idRef.current) idRef.current = Symbol('step-controller')
  useEffect(() => {
    activeControllerId = idRef.current
    return () => {
      if (activeControllerId === idRef.current) activeControllerId = null
    }
  }, [])
  const claim = () => { activeControllerId = idRef.current }
  const isActive = () => activeControllerId === null || activeControllerId === idRef.current

  // Keyboard shortcuts — 由 useKeydown 自动处理 input 焦点过滤和清理;
  // 仅活跃实例响应(多 playground 页面一次按键只驱动一个动画)
  useKeydown({
    Space:      (e) => { if (!isActive()) return; e.preventDefault(); playing ? stop() : play() },
    ArrowLeft:  (e) => { if (!isActive()) return; e.preventDefault(); prev() },
    ArrowRight: (e) => { if (!isActive()) return; e.preventDefault(); goNext() },
    KeyR:       (e) => { if (!isActive()) return; e.preventDefault(); reset() },
  })

  function posToStep(clientX) {
    const rect = scrubberRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(ratio * (total - 1))
  }

  function handleScrubberMouseDown(e) {
    isDragging.current = true
    seek(posToStep(e.clientX))
    window.addEventListener('mousemove', handleScrubberMouseMove)
    window.addEventListener('mouseup', handleScrubberMouseUp)
    detachDragListeners.current = () => {
      window.removeEventListener('mousemove', handleScrubberMouseMove)
      window.removeEventListener('mouseup', handleScrubberMouseUp)
      detachDragListeners.current = null
    }
  }
  function handleScrubberMouseMove(e) {
    if (isDragging.current) seek(posToStep(e.clientX))
  }
  function handleScrubberMouseUp() {
    isDragging.current = false
    detachDragListeners.current?.()
  }
  function handleScrubberTouch(e) {
    seek(posToStep(e.touches[0].clientX))
  }

  const progress = total > 1 ? step / (total - 1) : 0
  return (
    <div onPointerDown={claim} style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--glass-shadow), var(--glass-shine)',
      borderRadius: 'var(--r-lg)',
      padding: isPhone ? '12px 12px' : '14px 16px',
    }}>
      {/* Description */}
      <div style={{
        minHeight: 24, marginBottom: 12,
        fontSize: 13, color: 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
        display: 'flex', alignItems: 'flex-start', gap: 8,
      }}>
        <span style={{
          padding: '2px 9px', borderRadius: 20, flexShrink: 0,
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent-border)',
          fontSize: 10, fontWeight: 700,
          color: 'var(--accent-light)', lineHeight: '18px',
          letterSpacing: '0.06em',
        }}>STEP</span>
        <span style={{ lineHeight: 1.6, color: 'var(--accent-light)' }}>{description || '—'}</span>
      </div>

      {/* Scrubber timeline · 手机端拉高至 32 增大触摸命中区 */}
      <div
        ref={scrubberRef}
        onMouseDown={handleScrubberMouseDown}
        onTouchStart={handleScrubberTouch}
        onTouchMove={handleScrubberTouch}
        style={{
          position: 'relative', height: isPhone ? 32 : 22,
          display: 'flex', alignItems: 'center',
          cursor: 'pointer', marginBottom: 12,
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* Track */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 4,
          borderRadius: 4,
          background: 'var(--glass-bg-mid)',
          border: '1px solid var(--glass-border)',
        }}>
          <div style={{
            height: '100%', width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, var(--accent), var(--pink))',
            borderRadius: 4,
            boxShadow: '0 0 8px var(--accent-soft)',
            transition: 'width 0.1s',
          }} />
        </div>

        {/* Tick marks · total=1 时 i/(total-1) 是 0/0 → NaN%，钳到 0 */}
        {total <= 40 && Array.from({ length: total }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${total > 1 ? (i / (total - 1)) * 100 : 0}%`,
            width: i === step ? 3 : 2,
            height: i === step ? 10 : 5,
            borderRadius: 2,
            background: i < step ? 'var(--accent)' : i === step ? 'var(--pink)' : 'var(--glass-border-strong)',
            transform: 'translateX(-50%)',
            transition: 'all 0.15s',
            boxShadow: i === step ? '0 0 6px var(--pink)' : 'none',
          }} />
        ))}

        {/* Thumb */}
        <div style={{
          position: 'absolute',
          left: `${progress * 100}%`,
          width: 15, height: 15,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.7))',
          border: '2px solid var(--accent)',
          boxShadow: '0 0 0 3px var(--accent-soft), 0 2px 8px rgba(0,0,0,0.3)',
          transform: 'translateX(-50%)',
          transition: 'left 0.1s',
          zIndex: 1,
        }} />
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
        <IconBtn onClick={reset} title="重置" isPhone={isPhone}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>
          </svg>
        </IconBtn>
        <IconBtn onClick={prev} title="上一步" isPhone={isPhone}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="19 20 9 12 19 4 19 20"/>
          </svg>
        </IconBtn>

        {playing ? (
          <button onClick={stop} style={primaryBtn('#f87171', 'rgba(248,113,113,0.2)', isPhone)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
            暂停
          </button>
        ) : (
          <button onClick={play} style={primaryBtn('var(--accent)', 'var(--accent-soft)', isPhone)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            播放
          </button>
        )}

        <IconBtn onClick={goNext} title="下一步" isPhone={isPhone}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="5 4 15 12 5 20 5 4"/>
          </svg>
        </IconBtn>

        <span style={{
          marginLeft: 6, fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-tertiary)',
          minWidth: 50,
        }}>
          {step + 1}<span style={{ opacity: 0.4 }}> / {total}</span>
        </span>

        <div style={{ flex: 1 }} />

        {/* Speed presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginRight: 3, fontWeight: 600, letterSpacing: '0.04em' }}>速度</span>
          {SPEED_PRESETS.map(p => {
            const active = p.ms === speed
            return (
              <button key={p.label} onClick={() => setSpeed(p.ms)}
                style={{
                  padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  border: `1px solid ${active ? 'var(--accent-border)' : 'var(--glass-border)'}`,
                  background: active ? 'var(--accent-soft)' : 'var(--glass-bg-mid)',
                  backdropFilter: 'var(--glass-blur)',
                  WebkitBackdropFilter: 'var(--glass-blur)',
                  color: active ? 'var(--accent-light)' : 'var(--text-tertiary)',
                  fontFamily: 'var(--font-mono)',
                  boxShadow: active ? '0 0 10px var(--accent-soft)' : 'none',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--accent-border)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--glass-border)' }}>
                {p.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom input slot */}
      {customInput && (
        <div style={{
          marginTop: 12, paddingTop: 12,
          borderTop: '1px solid var(--glass-border)',
        }}>
          {customInput}
        </div>
      )}
    </div>
  )
}

function IconBtn({ children, onClick, title, isPhone }) {
  const size = isPhone ? 40 : 33
  return (
    <button onClick={onClick} title={title} aria-label={title} style={{
      width: size, height: size,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--glass-bg-mid)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      color: 'var(--text-secondary)',
      borderRadius: 'var(--r-sm)',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--glass-shine)',
      transition: 'all 0.15s',
      WebkitTapHighlightColor: 'transparent',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.color = 'var(--text-primary)'
      e.currentTarget.style.borderColor = 'var(--accent-border)'
      e.currentTarget.style.background = 'var(--glass-bg-strong)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.color = 'var(--text-secondary)'
      e.currentTarget.style.borderColor = 'var(--glass-border)'
      e.currentTarget.style.background = 'var(--glass-bg-mid)'
    }}>
      {children}
    </button>
  )
}

function primaryBtn(color, glow, isPhone) {
  return {
    height: isPhone ? 40 : 33,
    padding: isPhone ? '0 18px' : '0 16px',
    display: 'flex', alignItems: 'center', gap: 6,
    background: `color-mix(in srgb, ${color} 18%, transparent)`,
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    border: `1px solid ${color}55`,
    borderRadius: 'var(--r-sm)',
    boxShadow: `var(--glass-shine), 0 0 16px ${glow}`,
    color: color,
    fontSize: isPhone ? 14 : 13,
    fontWeight: 700,
    WebkitTapHighlightColor: 'transparent',
  }
}
