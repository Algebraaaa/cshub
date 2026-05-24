import { useCallback } from 'react'
import { playViolinNote } from '../audio/violinEngine'

export function useViolinAudio() {
  const playNote = useCallback(async (noteName, duration = '4n') => {
    await playViolinNote(noteName, duration)
  }, [])

  return { playNote }
}
