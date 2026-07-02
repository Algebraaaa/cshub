// 公式面板 · 逐行高亮
// 类似于 CodeBlock，但内容是公式，使用 LaTeX-like 文本，逐行高亮显示
import { useEffect, useLayoutEffect, useRef } from 'react'
import { useIsPhone } from '../../hooks/useMediaQuery'

export default function FormulaPanel({ lines, highlightLine, title = '公式推导' }) {
  const lineRefs = useRef({})
  const isPhone = useIsPhone()
  const isFirstRef = useRef(true)
  const prevRef = useRef(undefined)
  useLayoutEffect(() => { isFirstRef.current = true }, [])
  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = highlightLine
    if (isFirstRef.current) { isFirstRef.current = false; return }
    if (prev == null) return
    if (highlightLine != null && lineRefs.current[highlightLine]) {
      lineRefs.current[highlightLine].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [highlightLine])

  if (!lines || lines.length === 0) return null

  return (
    <div style={{
      background: 'var(--code-bg)',
      border: '1px solid var(--code-border)',
      borderRadius: 10,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '8px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <Dot color="#ff5f57"/><Dot color="#febc2e"/><Dot color="#28c840"/>
        </div>
        <span style={{
          marginLeft: 14, fontSize: 11,
          color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
        }}>{title}</span>
      </div>
      <pre style={{
        margin: 0,
        padding: isPhone ? '12px 0' : '16px 0',
        fontFamily: 'var(--font-mono)',
        fontSize: isPhone ? 12 : 13.5,
        lineHeight: 1.8,
        overflow: 'auto',
        flex: '1 1 auto',
        minHeight: 0,
      }}>
        <code style={{ display: 'block' }}>
          {lines.map((line, i) => {
            const lineNum = i + 1
            const isHl = highlightLine === lineNum
            return (
              <div key={i} ref={el => { lineRefs.current[lineNum] = el }}
                style={{
                  display: 'flex', paddingRight: 16,
                  background: isHl ? 'rgba(139,92,246,0.16)' : 'transparent',
                  borderLeft: isHl ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'background 0.2s, border-color 0.2s',
                }}>
                <span style={{
                  width: isPhone ? 32 : 44,
                  textAlign: 'right',
                  paddingRight: isPhone ? 10 : 16,
                  color: isHl ? 'var(--accent-light)' : 'var(--text-tertiary)',
                  userSelect: 'none', opacity: isHl ? 1 : 0.5, flexShrink: 0,
                  fontWeight: isHl ? 700 : 400,
                }}>{lineNum}</span>
                <span style={{
                  color: isHl ? 'var(--accent-light)' : 'var(--text-primary)',
                  fontWeight: isHl ? 600 : 400,
                  letterSpacing: '0.01em',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>{line}</span>
              </div>
            )
          })}
        </code>
      </pre>
    </div>
  )
}

function Dot({ color }) {
  return <span style={{ width: 11, height: 11, borderRadius: '50%', background: color, display: 'inline-block' }} />
}
