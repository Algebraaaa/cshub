export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export const KEYBOARD_MAP = {
  C4: 'A',
  'C#4': 'W',
  D4: 'S',
  'D#4': 'E',
  E4: 'D',
  F4: 'F',
  'F#4': 'T',
  G4: 'G',
  'G#4': 'Y',
  A4: 'H',
  'A#4': 'U',
  B4: 'J',
  C5: 'K',
  'C#5': 'O',
  D5: 'L',
  'D#5': 'P',
  E5: ';',
}

export function noteFromMidi(midi) {
  const name = NOTE_NAMES[midi % 12]
  const octave = Math.floor(midi / 12) - 1
  return `${name}${octave}`
}

function buildPianoKeys() {
  return Array.from({ length: 88 }, (_, index) => {
    const midi = index + 21
    const note = noteFromMidi(midi)
    const name = note.replace(/\d/g, '')
    const octave = Number(note.match(/\d+/)?.[0] ?? 0)
    return {
      note,
      midi,
      freq: 440 * Math.pow(2, (midi - 69) / 12),
      isBlack: name.includes('#'),
      keyboardKey: KEYBOARD_MAP[note] || '',
      octave,
    }
  })
}

export const ALL_KEYS = buildPianoKeys()
export const KEY_BY_NOTE = new Map(ALL_KEYS.map(key => [key.note, key]))

export function getVisibleKeys(zoomMode) {
  if (zoomMode === '88') return ALL_KEYS
  if (zoomMode === '49') return ALL_KEYS.filter(k => k.midi >= 36 && k.midi <= 84)
  return ALL_KEYS.filter(k => k.midi >= 48 && k.midi <= 84)
}

export function pickZoomMode(viewportWidth) {
  if (viewportWidth < 640) return '37'
  if (viewportWidth < 1100) return '49'
  return '49'
}

export function isValidNoteName(note) {
  return KEY_BY_NOTE.has(note)
}

export function normalizeSongNotes(rawNotes, songId) {
  return rawNotes.map(([note, startBeat, durationBeat, hand = 'right', velocity = 0.72, lineNumber = null], index) => ({
    id: `${songId}-${index}`,
    note,
    startBeat,
    durationBeat,
    hand,
    velocity,
    lineNumber,
  }))
}

export function songEndBeat(song) {
  return Math.max(...song.notes.map(n => n.startBeat + n.durationBeat), 8) + 1
}
