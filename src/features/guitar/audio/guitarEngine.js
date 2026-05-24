let synth = null

async function getSynth() {
  if (synth) return synth
  const Tone = await import('tone')
  synth = new Tone.PluckSynth({
    attackNoise: 2,
    dampening: 4000,
    resonance: 0.96,
  }).toDestination()
  return synth
}

const NOTE_FREQ = {
  E2: 82.41, A2: 110.00, D3: 146.83, G3: 196.00, B3: 246.94, E4: 329.63,
  F2: 87.31, 'F#2': 92.50, G2: 98.00, 'G#2': 103.83,
  'A#2': 116.54, B2: 123.47, C3: 130.81, 'C#3': 138.59,
  'D#3': 155.56, E3: 164.81, F3: 174.61, 'F#3': 185.00,
  'G#3': 207.65, A3: 220.00, 'A#3': 233.08, B3b: 233.08,
  C4: 261.63, 'C#4': 277.18, D4: 293.66, 'D#4': 311.13,
  E4b: 311.13, F4: 349.23, 'F#4': 369.99, G4: 392.00,
  'G#4': 415.30, A4: 440.00,
}

export async function playString(noteName) {
  const s = await getSynth()
  const freq = NOTE_FREQ[noteName]
  if (!freq) return
  const Tone = await import('tone')
  await Tone.start()
  s.triggerAttack(freq)
}

export async function playChord(noteNames, strumDelayMs = 40) {
  for (let i = 0; i < noteNames.length; i++) {
    const note = noteNames[i]
    if (note !== 'x') {
      setTimeout(() => playString(note), i * strumDelayMs)
    }
  }
}

export function disposeGuitarEngine() {
  if (synth) {
    synth.dispose()
    synth = null
  }
}
