import { useEffect, useRef, useState, useCallback } from 'react'
import { TonePianoEngine } from '../audio/tonePianoEngine'

export function useTonePiano(volume = 0.78) {
  const engineRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [starting, setStarting] = useState(false)

  const ensure = useCallback(async () => {
    if (!engineRef.current) {
      engineRef.current = new TonePianoEngine()
      engineRef.current.onLoaded(() => setLoaded(true))
    }
    setStarting(true)
    try {
      await engineRef.current.ensure()
      engineRef.current.setVolume(volume)
    } finally {
      setStarting(false)
    }
    return engineRef.current
  }, [volume])

  useEffect(() => {
    if (engineRef.current) engineRef.current.setVolume(volume)
  }, [volume])

  useEffect(() => () => {
    engineRef.current?.dispose()
    engineRef.current = null
  }, [])

  const play = useCallback((key, options = {}) => {
    engineRef.current?.play(key, options)
  }, [])

  return { ensure, play, loaded, starting, engine: engineRef }
}
