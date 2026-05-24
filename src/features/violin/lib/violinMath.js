// Violin standard tuning (low to high): G3 D4 A4 E5
export const OPEN_STRINGS = ['G3', 'D4', 'A4', 'E5']
export const STRING_LABELS = ['G', 'D', 'A', 'E']
export const STRING_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444']

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

// Returns the note name for a given string (0=G, 3=E) and finger position (0=open, 1-4=fingers)
export function fingerToNote(stringIndex, finger) {
  const baseMidi = noteToMidi(OPEN_STRINGS[stringIndex])
  // First position: each finger = one whole tone (2 semitones), except between 1-2 fingers which is also 2 semitones
  // Simplified: 0=open, 1=+2, 2=+4, 3=+5, 4=+7
  const semitones = [0, 2, 4, 5, 7]
  return midiToNote(baseMidi + (semitones[finger] ?? finger * 2))
}

// First position notes for each string
export const FIRST_POSITION = OPEN_STRINGS.map((open, si) =>
  [0, 1, 2, 3, 4].map(f => ({ finger: f, note: fingerToNote(si, f) }))
)
