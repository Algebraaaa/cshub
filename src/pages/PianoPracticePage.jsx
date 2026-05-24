import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SONGS_BY_ID } from '../data/piano/songsIndex'
import {
  getVisibleKeys,
  KEY_BY_NOTE,
  normalizeSongNotes,
  pickZoomMode,
  songEndBeat,
} from '../features/piano/lib/noteMath'
import { useTonePiano } from '../features/piano/hooks/useTonePiano'
import { useNotePlayback } from '../features/piano/hooks/useNotePlayback'
import { useKeyboardInput } from '../features/piano/hooks/useKeyboardInput'
import PianoKeyboard from '../features/piano/components/PianoKeyboard'
import NoteWaterfall from '../features/piano/components/NoteWaterfall'
import PracticeToolbar from '../features/piano/components/PracticeToolbar'

export default function PianoPracticePage() {
  const { slug } = useParams()
  const rawSong = SONGS_BY_ID[slug]

  // 派生数据（必须在所有 hooks 之前 useMemo —— 但需要支持 song 找不到的情况）
  const song = useMemo(() => {
    if (!rawSong) return null
    return { ...rawSong, notes: normalizeSongNotes(rawSong.notes, rawSong.id) }
  }, [rawSong])

  const initialBpm = rawSong?.bpm ?? 90
  const [mode, setMode] = useState('practice')
  const [bpm, setBpm] = useState(initialBpm)
  const [volume, setVolume] = useState(0.78)
  const [sustain, setSustain] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeNotes, setActiveNotes] = useState(new Set())
  const [targetIndex, setTargetIndex] = useState(0)
  const [feedback, setFeedback] = useState('点击播放，跟着落下的音符按琴键。')
  const [zoomMode, setZoomMode] = useState('49')

  useEffect(() => {
    const update = () => setZoomMode(pickZoomMode(window.innerWidth))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const visibleKeys = useMemo(() => getVisibleKeys(zoomMode), [zoomMode])

  const { ensure, play, loaded, starting } = useTonePiano(volume)

  const melodyNotes = useMemo(() => song?.notes.filter(n => n.hand === 'right') ?? [], [song])
  const targetNote = mode === 'practice' && song ? melodyNotes[targetIndex] : null

  const endBeat = useMemo(() => (song ? songEndBeat(song) : 0), [song])

  const markActive = useCallback((noteName, holdMs = 180) => {
    setActiveNotes(prev => {
      const next = new Set(prev); next.add(noteName); return next
    })
    window.setTimeout(() => {
      setActiveNotes(prev => {
        const next = new Set(prev); next.delete(noteName); return next
      })
    }, holdMs)
  }, [])

  const handleAutoplay = useCallback((note) => {
    const key = KEY_BY_NOTE.get(note.note)
    if (!key) return
    play(key, { velocity: note.velocity, sustain })
    markActive(note.note, sustain ? 520 : 220)
  }, [play, sustain, markActive])

  const handlePlaybackEnd = useCallback(() => {
    setIsPlaying(false)
    setFeedback('演奏完成 🌟')
  }, [])

  const { currentBeat, reset } = useNotePlayback({
    notes: song?.notes ?? [],
    bpm,
    isPlaying,
    endBeat,
    onTrigger: handleAutoplay,
    onEnd: handlePlaybackEnd,
  })

  const handlePress = useCallback((key) => {
    ensure()
    play(key, { velocity: 0.82, sustain })
    markActive(key.note, sustain ? 520 : 200)

    if (mode === 'practice' && targetNote) {
      if (key.note === targetNote.note) {
        const next = targetIndex + 1
        setTargetIndex(next)
        setFeedback(next >= melodyNotes.length
          ? '完成。你已经跟完这首练习曲 ✓'
          : `正确：${key.note}`)
      } else {
        setFeedback(`偏了：目标 ${targetNote.note}，你弹了 ${key.note}`)
      }
    }
  }, [ensure, play, sustain, markActive, mode, targetNote, targetIndex, melodyNotes.length])

  const handleToggle = useCallback(async () => {
    await ensure()
    setIsPlaying(prev => !prev)
  }, [ensure])

  const handleReplay = useCallback(() => {
    ensure()
    reset(0)
    setTargetIndex(0)
    setFeedback(mode === 'practice' ? '从头开始跟弹。' : '已回到开头。')
    setIsPlaying(true)
  }, [ensure, reset, mode])

  useKeyboardInput({
    visibleKeys,
    onKey: handlePress,
    onSpace: handleToggle,
  })

  if (!rawSong) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff5ec] to-[#fdebd3] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <p className="text-6xl mb-4">🎹</p>
          <h1 className="text-2xl font-black text-[#3d2a2a] mb-2">找不到这首曲子</h1>
          <p className="text-[#9e7f7f] mb-6">slug "{slug}" 不在曲库里。</p>
          <Link to="/piano" className="rounded-full bg-[#e86c5d] px-6 py-2 text-white font-bold">← 回曲库</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff5ec] via-[#fff8f0] to-[#fdebd3] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-4">
        <PracticeToolbar
          song={song}
          isPlaying={isPlaying}
          onToggle={handleToggle}
          onReplay={handleReplay}
          mode={mode}
          onModeChange={setMode}
          bpm={bpm}
          onBpmChange={setBpm}
          volume={volume}
          onVolumeChange={setVolume}
          sustain={sustain}
          onSustainToggle={() => setSustain(s => !s)}
          samplesLoaded={loaded}
          starting={starting}
        />

        <div className="rounded-3xl border-2 border-dashed border-[#f5d9b8] bg-white/70 px-5 py-2.5 text-center text-sm font-semibold text-[#9e7f7f]">
          {feedback}
          {!loaded && starting && <span className="ml-2 text-[#e86c5d]">（采样首次加载，请稍候）</span>}
        </div>

        <NoteWaterfall
          notes={song.notes}
          currentBeat={currentBeat}
          visibleKeys={visibleKeys}
          fallBeats={6}
          height={300}
        />

        <PianoKeyboard
          visibleKeys={visibleKeys}
          activeNotes={activeNotes}
          targetNote={targetNote?.note ?? null}
          onPress={handlePress}
          showLabels
        />

        <p className="text-center text-xs text-[#b78a6e]">
          电脑键盘：A S D F G H J K L ; = 白键 · W E T Y U O P = 黑键 · 空格 = 播放/暂停
        </p>
      </div>
    </div>
  )
}
