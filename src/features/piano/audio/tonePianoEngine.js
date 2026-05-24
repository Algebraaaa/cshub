import * as Tone from 'tone'

const SAMPLER_URLS = {
  A0: 'A0.mp3',
  C1: 'C1.mp3',
  'D#1': 'Ds1.mp3',
  'F#1': 'Fs1.mp3',
  A1: 'A1.mp3',
  C2: 'C2.mp3',
  'D#2': 'Ds2.mp3',
  'F#2': 'Fs2.mp3',
  A2: 'A2.mp3',
  C3: 'C3.mp3',
  'D#3': 'Ds3.mp3',
  'F#3': 'Fs3.mp3',
  A3: 'A3.mp3',
  C4: 'C4.mp3',
  'D#4': 'Ds4.mp3',
  'F#4': 'Fs4.mp3',
  A4: 'A4.mp3',
  C5: 'C5.mp3',
  'D#5': 'Ds5.mp3',
  'F#5': 'Fs5.mp3',
  A5: 'A5.mp3',
  C6: 'C6.mp3',
  'D#6': 'Ds6.mp3',
  'F#6': 'Fs6.mp3',
  A6: 'A6.mp3',
  C7: 'C7.mp3',
  'D#7': 'Ds7.mp3',
  'F#7': 'Fs7.mp3',
  A7: 'A7.mp3',
  C8: 'C8.mp3',
}

const SAMPLE_BASE = 'https://tonejs.github.io/audio/salamander/'

/**
 * Drop-in replacement for the old WebAudioPianoEngine class.
 * Same external API surface — { ensure(), setVolume(), play(key, options) } — so
 * PianoPlaygroundPage doesn't need to change beyond the import + new keyword.
 */
export class TonePianoEngine {
  constructor() {
    this.sampler = null
    this.reverb = null
    this.gain = null
    this.startedPromise = null
    this.loaded = false
    this.loadCallbacks = new Set()
    this.heldNotes = new Set()
  }

  onLoaded(cb) {
    if (this.loaded) {
      cb()
      return () => {}
    }
    this.loadCallbacks.add(cb)
    return () => this.loadCallbacks.delete(cb)
  }

  isLoaded() {
    return this.loaded
  }

  async ensure() {
    if (this.startedPromise) return this.startedPromise

    this.startedPromise = (async () => {
      await Tone.start()

      this.gain = new Tone.Gain(0.78)
      this.reverb = new Tone.Reverb({ decay: 1.8, wet: 0.18 })
      await this.reverb.generate()

      this.sampler = new Tone.Sampler({
        urls: SAMPLER_URLS,
        baseUrl: SAMPLE_BASE,
        release: 1,
      })

      this.sampler.chain(this.reverb, this.gain, Tone.getDestination())

      await Tone.loaded()
      this.loaded = true
      this.loadCallbacks.forEach(cb => {
        try { cb() } catch (err) { console.error(err) }
      })
      this.loadCallbacks.clear()
    })()

    return this.startedPromise
  }

  setVolume(value) {
    if (!this.gain) return
    this.gain.gain.rampTo(value, 0.02)
  }

  play(key, options = {}) {
    if (!key) return
    if (!this.sampler || !this.loaded) {
      // 采样还没加载好就忽略点击，避免无声排队
      return
    }
    const velocity = Math.min(0.95, Math.max(0.12, options.velocity ?? 0.75))
    const sustain = options.sustain ?? false
    // Sustain 模式：使用 attack + 等待 release（暂时通过更长的 duration 模拟踏板效果）
    const duration = sustain ? '2n' : '4n'
    this.sampler.triggerAttackRelease(key.note, duration, undefined, velocity)
  }

  dispose() {
    this.sampler?.dispose()
    this.reverb?.dispose()
    this.gain?.dispose()
    this.sampler = null
    this.reverb = null
    this.gain = null
    this.loaded = false
    this.startedPromise = null
  }
}
