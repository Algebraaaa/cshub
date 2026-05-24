import { useEffect, useRef, useState } from 'react'

/**
 * 时间轴播放 hook：按 bpm 推进 currentBeat，到达每个音符的 startBeat 时触发 onTrigger。
 * 不管 UI，纯定时器逻辑。
 */
export function useNotePlayback({ notes, bpm, isPlaying, endBeat, onTrigger, onEnd }) {
  const beatRef = useRef(0)
  const lastFrameRef = useRef(0)
  const triggeredRef = useRef(new Set())
  const rafRef = useRef(null)
  const [currentBeat, setCurrentBeat] = useState(0)

  const reset = (nextBeat = 0) => {
    beatRef.current = nextBeat
    lastFrameRef.current = 0
    triggeredRef.current = new Set()
    setCurrentBeat(nextBeat)
  }

  useEffect(() => {
    if (!isPlaying) {
      lastFrameRef.current = 0
      return undefined
    }

    const tick = (now) => {
      if (!lastFrameRef.current) lastFrameRef.current = now
      const dt = (now - lastFrameRef.current) / 1000
      lastFrameRef.current = now
      beatRef.current += dt * (bpm / 60)

      const beat = beatRef.current

      notes.forEach((note) => {
        if (note.startBeat <= beat && !triggeredRef.current.has(note.id)) {
          triggeredRef.current.add(note.id)
          onTrigger?.(note)
        }
      })

      setCurrentBeat(beat)

      if (beat >= endBeat) {
        onEnd?.()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying, bpm, notes, endBeat, onTrigger, onEnd])

  return { currentBeat, reset }
}
