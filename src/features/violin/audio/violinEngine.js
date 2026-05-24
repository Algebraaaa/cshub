let synth = null

async function getSynth() {
  if (synth) return synth
  const Tone = await import('tone')
  synth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.12, decay: 0.1, sustain: 0.9, release: 0.6 },
  }).toDestination()
  // Apply slight reverb for warmth
  const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.25 })
  await reverb.ready
  synth.connect(reverb)
  reverb.toDestination()
  return synth
}

const NOTE_FREQ = {
  G3: 196.00, 'G#3': 207.65, A3: 220.00, 'A#3': 233.08, B3: 246.94,
  C4: 261.63, 'C#4': 277.18, D4: 293.66, 'D#4': 311.13, E4: 329.63,
  F4: 349.23, 'F#4': 369.99, G4: 392.00, 'G#4': 415.30, A4: 440.00,
  'A#4': 466.16, B4: 493.88,
  C5: 523.25, 'C#5': 554.37, D5: 587.33, 'D#5': 622.25, E5: 659.25,
  F5: 698.46, 'F#5': 739.99, G5: 783.99, 'G#5': 830.61, A5: 880.00,
  'A#5': 932.33, B5: 987.77,
  D3: 146.83, A2: 110.00,
}

export async function playViolinNote(noteName, duration = '4n') {
  const s = await getSynth()
  const freq = NOTE_FREQ[noteName]
  if (!freq) return
  const Tone = await import('tone')
  await Tone.start()
  s.triggerAttackRelease(freq, duration)
}

export function disposeViolinEngine() {
  if (synth) {
    synth.dispose()
    synth = null
  }
}
