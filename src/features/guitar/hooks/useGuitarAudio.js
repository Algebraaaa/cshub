import { useCallback } from 'react'
import { playString, playChord } from '../audio/guitarEngine'
import { chordShapeToNotes } from '../lib/guitarMath'

export function useGuitarAudio() {
  const strumChord = useCallback(async (shape) => {
    const notes = chordShapeToNotes(shape)
    // Reverse so low strings strum first (natural downstroke)
    await playChord([...notes].reverse(), 35)
  }, [])

  const pluckString = useCallback(async (stringIndex, fret = 0) => {
    const { fretToNote } = await import('../lib/guitarMath')
    const note = fretToNote(stringIndex, fret)
    await playString(note)
  }, [])

  return { strumChord, pluckString }
}
