// Standard tuning: strings 1–6 from high to low E
// String index 0 = high E (e), 5 = low E (E)
export const OPEN_STRINGS = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2']
export const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E']

const SEMITONE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function noteToMidi(name) {
  const match = name.match(/^([A-G]#?)(\d)$/)
  if (!match) return 0
  const [, pitch, oct] = match
  return (parseInt(oct) + 1) * 12 + SEMITONE_NAMES.indexOf(pitch)
}

function midiToNote(midi) {
  const pitch = SEMITONE_NAMES[midi % 12]
  const oct = Math.floor(midi / 12) - 1
  return `${pitch}${oct}`
}

export function fretToNote(stringIndex, fret) {
  const openMidi = noteToMidi(OPEN_STRINGS[stringIndex])
  return midiToNote(openMidi + fret)
}

// Build chord notes from shape: array of 6 entries (fret number or 'x' for muted)
export function chordShapeToNotes(shape) {
  return shape.map((fret, si) => {
    if (fret === 'x' || fret === null) return 'x'
    return fretToNote(si, fret)
  })
}
