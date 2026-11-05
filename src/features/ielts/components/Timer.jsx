import { useEffect, useRef, useState } from 'react'
import { IeltsButton } from './ui.jsx'

function fmt(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// 可暂停倒计时；到点只提醒、不锁定（产品定稿第二节）。
export default function Timer({ minutes = 20, onDone }) {
  const [running, setRunning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!running) return undefined
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false)
          onDone?.()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, onDone])

  const over = secondsLeft === 0

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-2 ${over ? 'border-warning/60 bg-warning/10' : 'border-border-strong bg-surface'}`}>
      <span className={`font-mono text-2xl font-bold tabular-nums ${over ? 'text-warning' : 'text-fg'}`} aria-live="polite">
        {fmt(secondsLeft)}
      </span>
      <div className="flex gap-2">
        <IeltsButton variant="ghost" onClick={() => setRunning((r) => !r)}>
          {running ? '暂停' : secondsLeft === minutes * 60 ? '开始' : '继续'}
        </IeltsButton>
        <IeltsButton variant="ghost" onClick={() => { setRunning(false); setSecondsLeft(minutes * 60) }}>
          重置
        </IeltsButton>
      </div>
      {over ? <span className="text-xs font-semibold text-warning">时间到（仅提醒，可以继续作答）</span> : null}
    </div>
  )
}
