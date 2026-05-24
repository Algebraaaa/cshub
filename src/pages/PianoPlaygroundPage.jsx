import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { RAW_SONGS } from '../data/piano/songsIndex'
import { TonePianoEngine } from '../features/piano/audio/tonePianoEngine'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const KEYBOARD_MAP = {
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

function noteFromMidi(midi) {
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

const ALL_KEYS = buildPianoKeys()
const KEY_BY_NOTE = new Map(ALL_KEYS.map(key => [key.note, key]))

const PRACTICE_SONGS = RAW_SONGS.map(song => ({
  ...song,
  notes: normalizeSongNotes(song.notes, song.id),
}))

const MODE_LABELS = {
  practice: '跟弹',
  free: '自由',
  record: '录制',
}

const DEFAULT_STAFF_INPUT = `# 逐个音符顺序录入：音名/拍数，竖线只是分小节
C4/1 C4/1 G4/1 G4/1 | A4/1 A4/1 G4/2
F4/1 F4/1 E4/1 E4/1 | D4/1 D4/1 C4/2

# 也可以写和弦：[C3,E3,G3]/2，休止符 R/1
[C3,E3,G3]/2 R/2 [F3,A3,C4]/2 [G3,B3,D4]/2`

function isValidNoteName(note) {
  return KEY_BY_NOTE.has(note)
}

function normalizeSongNotes(rawNotes, songId) {
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

function tokenToNotes(token, startBeat, lineNumber, defaultHand = 'right') {
  const [body, durationRaw = '1'] = token.split('/')
  const durationBeat = Number(durationRaw)
  if (!Number.isFinite(durationBeat) || durationBeat <= 0) {
    throw new Error(`时值无效：${token}`)
  }

  if (body.toUpperCase() === 'R') {
    return { notes: [], durationBeat }
  }

  const chordMatch = body.match(/^\[(.+)]$/)
  const noteNames = chordMatch ? chordMatch[1].split(',').map(note => note.trim()) : [body.trim()]

  noteNames.forEach(note => {
    if (!isValidNoteName(note)) throw new Error(`无法识别音名：${note}`)
  })

  return {
    notes: noteNames.map(note => [note, startBeat, durationBeat, defaultHand, chordMatch ? 0.48 : 0.74, lineNumber]),
    durationBeat,
  }
}

function parseStaffInput(input, songId = 'custom') {
  const rawNotes = []
  const staffLines = []
  let cursorBeat = 0

  input.split('\n').forEach((rawLine, lineIndex) => {
    const line = rawLine.replace(/#.*/, '').replace(/\/\/.*/, '').trim()
    if (!line) return

    const parts = line.split(/\s+/).filter(part => part && part !== '|')
    if (!parts.length) return

    const explicitLine = parts.length >= 3 && isValidNoteName(parts[0]) && Number.isFinite(Number(parts[1])) && Number.isFinite(Number(parts[2]))
    const lineNumber = lineIndex + 1
    const lineStartBeat = cursorBeat
    let lineEndBeat = cursorBeat

    if (explicitLine) {
      const [note, startRaw, durationRaw, hand = 'right', velocityRaw = '0.74'] = parts
      const startBeat = Number(startRaw)
      const durationBeat = Number(durationRaw)
      const velocity = Number(velocityRaw)
      if (durationBeat <= 0) throw new Error(`第 ${lineIndex + 1} 行时值必须大于 0`)
      rawNotes.push([note, startBeat, durationBeat, hand === 'left' ? 'left' : 'right', Number.isFinite(velocity) ? velocity : 0.74, lineNumber])
      cursorBeat = Math.max(cursorBeat, startBeat + durationBeat)
      lineEndBeat = cursorBeat
      staffLines.push({ lineNumber, text: line, startBeat, endBeat: lineEndBeat })
      return
    }

    parts.forEach(token => {
      const parsed = tokenToNotes(token, cursorBeat, lineNumber)
      rawNotes.push(...parsed.notes)
      cursorBeat += parsed.durationBeat
      lineEndBeat = cursorBeat
    })
    staffLines.push({ lineNumber, text: line, startBeat: lineStartBeat, endBeat: lineEndBeat })
  })

  if (!rawNotes.length) throw new Error('没有解析到有效音符')

  return {
    notes: normalizeSongNotes(rawNotes, songId),
    staffLines,
  }
}


function getVisibleKeys(zoomMode) {
  if (zoomMode === '88') return ALL_KEYS
  if (zoomMode === '49') return ALL_KEYS.filter(key => key.midi >= 36 && key.midi <= 84)
  return ALL_KEYS.filter(key => key.midi >= 48 && key.midi <= 84)
}

function getSongEndBeat(song, recordedNotes) {
  const songEnd = Math.max(...song.notes.map(note => note.startBeat + note.durationBeat), 8)
  const recordEnd = recordedNotes.length
    ? Math.max(...recordedNotes.map(note => note.startBeat + note.durationBeat))
    : 0

  return Math.max(songEnd, recordEnd) + 1
}

function drawRoundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

function getStaffY(note) {
  const key = KEY_BY_NOTE.get(note)
  if (!key) return 52
  return 82 - (key.midi - 60) * 3.2
}

export default function PianoPlaygroundPage() {
  const { theme } = useTheme()
  const engineRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const lastFrameRef = useRef(0)
  const playbackBeatRef = useRef(0)
  const triggeredRef = useRef(new Set())
  const recordingStartRef = useRef(null)

  const [songId, setSongId] = useState(PRACTICE_SONGS[0].id)
  const [bpm, setBpm] = useState(PRACTICE_SONGS[0].bpm)
  const [mode, setMode] = useState('practice')
  const [zoomMode, setZoomMode] = useState(() => (window.innerWidth < 720 ? '37' : '49'))
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeKeys, setActiveKeys] = useState({})
  const [currentBeat, setCurrentBeat] = useState(0)
  const [targetIndex, setTargetIndex] = useState(0)
  const [feedback, setFeedback] = useState('选择曲目后按播放，跟着落到键盘线的音符演奏。')
  const [volume, setVolume] = useState(0.78)
  const [sustain, setSustain] = useState(false)
  const [recordedNotes, setRecordedNotes] = useState([])
  const [exportText, setExportText] = useState('')
  const [showExport, setShowExport] = useState(false)
  const [staffInput, setStaffInput] = useState(DEFAULT_STAFF_INPUT)
  const [staffBpm, setStaffBpm] = useState(92)
  const [customSong, setCustomSong] = useState(null)
  const [samplesLoaded, setSamplesLoaded] = useState(false)

  const allSongs = useMemo(() => customSong ? [...PRACTICE_SONGS, customSong] : PRACTICE_SONGS, [customSong])
  const currentSong = useMemo(() => allSongs.find(song => song.id === songId) || PRACTICE_SONGS[0], [allSongs, songId])
  const visibleKeys = useMemo(() => getVisibleKeys(zoomMode), [zoomMode])
  const visibleWhiteKeys = useMemo(() => visibleKeys.filter(key => !key.isBlack), [visibleKeys])
  const visibleBlackKeys = useMemo(() => visibleKeys.filter(key => key.isBlack), [visibleKeys])
  const melodyNotes = useMemo(() => currentSong.notes.filter(note => note.hand === 'right'), [currentSong])
  const targetNote = mode === 'practice' ? melodyNotes[targetIndex] : null
  const currentStaffLine = useMemo(() => {
    if (!currentSong.staffLines?.length) return null
    return currentSong.staffLines.find(line => currentBeat >= line.startBeat && currentBeat < line.endBeat) || currentSong.staffLines[0]
  }, [currentBeat, currentSong])
  const songEndBeat = useMemo(() => getSongEndBeat(currentSong, recordedNotes), [currentSong, recordedNotes])
  const allTimelineNotes = useMemo(() => [
    ...currentSong.notes.map(note => ({ ...note, source: 'song' })),
    ...recordedNotes.map(note => ({ ...note, source: 'recorded' })),
  ], [currentSong, recordedNotes])

  const ensureEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new TonePianoEngine()
      engineRef.current.onLoaded(() => setSamplesLoaded(true))
    }
    engineRef.current.ensure().then(() => {
      engineRef.current.setVolume(volume)
    })
    return engineRef.current
  }, [volume])

  const resetPlayback = useCallback((nextBeat = 0) => {
    playbackBeatRef.current = nextBeat
    lastFrameRef.current = 0
    triggeredRef.current = new Set()
    setCurrentBeat(nextBeat)
  }, [])

  const markActive = useCallback((note, holdMs = 180) => {
    setActiveKeys(prev => ({ ...prev, [note]: true }))
    window.setTimeout(() => {
      setActiveKeys(prev => {
        const next = { ...prev }
        delete next[note]
        return next
      })
    }, holdMs)
  }, [])

  const playKey = useCallback((key, options = {}) => {
    if (!key) return
    ensureEngine().play(key, {
      velocity: options.velocity ?? 0.76,
      sustain,
    })
    markActive(key.note, sustain ? 520 : 190)
  }, [ensureEngine, markActive, sustain])

  const handlePracticeHit = useCallback((key) => {
    if (mode !== 'practice' || !targetNote) return

    if (key.note === targetNote.note) {
      const nextIndex = targetIndex + 1
      setTargetIndex(nextIndex)
      setFeedback(nextIndex >= melodyNotes.length ? '完成。你已经跟完这首练习曲。' : `正确：${key.note}，继续下一个音。`)
    } else {
      setFeedback(`偏了：当前目标是 ${targetNote.note}，刚才弹的是 ${key.note}。`)
    }
  }, [melodyNotes.length, mode, targetIndex, targetNote])

  const handleManualKey = useCallback((key) => {
    playKey(key, { velocity: 0.82 })
    handlePracticeHit(key)

    if (mode === 'record' && isPlaying) {
      setRecordedNotes(prev => [
        ...prev,
        {
          id: `rec-${Date.now()}-${prev.length}`,
          note: key.note,
          startBeat: Number(playbackBeatRef.current.toFixed(3)),
          durationBeat: 0.65,
          hand: 'right',
          velocity: 0.82,
        },
      ])
    }
  }, [handlePracticeHit, isPlaying, mode, playKey])

  const handleSongChange = (id) => {
    const nextSong = allSongs.find(song => song.id === id) || PRACTICE_SONGS[0]
    setSongId(id)
    setBpm(nextSong.bpm)
    setIsPlaying(false)
    setRecordedNotes([])
    setTargetIndex(0)
    setFeedback('新曲目已载入。按播放查看节奏，也可以直接跟弹。')
    resetPlayback(0)
  }

  const applyStaffInput = () => {
    try {
      const parsed = parseStaffInput(staffInput, 'custom')
      const nextSong = {
        id: 'custom',
        title: '手动录入乐谱',
        subtitle: '逐行读取五线谱，并同步映射到 88 键钢琴',
        bpm: staffBpm,
        notes: parsed.notes,
        staffLines: parsed.staffLines,
      }
      setCustomSong(nextSong)
      setSongId('custom')
      setBpm(staffBpm)
      setIsPlaying(false)
      setRecordedNotes([])
      setTargetIndex(0)
      setFeedback(`已读取 ${parsed.staffLines.length} 行、${parsed.notes.length} 个音符。按播放即可逐行演奏并映射到钢琴键。`)
      resetPlayback(0)
    } catch (error) {
      setFeedback(`乐谱读取失败：${error.message}`)
    }
  }

  const handleReplay = () => {
    ensureEngine()
    setTargetIndex(0)
    setFeedback(mode === 'practice' ? '从头开始跟弹。' : '已回到开头。')
    resetPlayback(0)
    setIsPlaying(true)
  }

  const exportRecording = () => {
    const payload = {
      version: 1,
      songId,
      bpm,
      recordedNotes,
      staffInput: songId === 'custom' ? staffInput : undefined,
    }
    setExportText(JSON.stringify(payload, null, 2))
    setShowExport(true)
  }

  useEffect(() => {
    if (engineRef.current) engineRef.current.setVolume(volume)
  }, [volume])

  useEffect(() => {
    if (mode === 'record' && isPlaying && recordingStartRef.current === null) {
      recordingStartRef.current = playbackBeatRef.current
    }
    if (!isPlaying) recordingStartRef.current = null
  }, [isPlaying, mode])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.repeat) return
      if (event.key === ' ') {
        event.preventDefault()
        ensureEngine()
        setIsPlaying(prev => !prev)
        return
      }

      const pressed = event.key === ';' ? ';' : event.key.toUpperCase()
      const key = visibleKeys.find(item => item.keyboardKey === pressed)
      if (key) {
        event.preventDefault()
        handleManualKey(key)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [ensureEngine, handleManualKey, visibleKeys])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const getKeyBounds = (note) => {
      const key = KEY_BY_NOTE.get(note)
      if (!key) return null
      const whiteCount = visibleWhiteKeys.length
      const whiteWidth = canvas.clientWidth / whiteCount

      if (!key.isBlack) {
        const whiteIndex = visibleWhiteKeys.findIndex(item => item.note === note)
        if (whiteIndex < 0) return null
        return { x: whiteIndex * whiteWidth, width: whiteWidth }
      }

      const keyIndex = visibleKeys.findIndex(item => item.note === note)
      if (keyIndex < 0) return null
      const beforeWhite = visibleKeys.slice(0, keyIndex).filter(item => !item.isBlack).length
      const width = whiteWidth * 0.62
      return { x: beforeWhite * whiteWidth - width / 2, width }
    }

    const drawTimelineNote = (note, beat) => {
      const bounds = getKeyBounds(note.note)
      if (!bounds) return

      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const fallBeats = zoomMode === '88' ? 6 : 5
      const y = height - ((note.startBeat - beat) / fallBeats) * height
      const noteHeight = Math.max(12, (note.durationBeat / fallBeats) * height)
      const top = y - noteHeight

      if (top > height || y < 0) return

      const isTarget = targetNote?.id === note.id && mode === 'practice'
      const isLive = beat >= note.startBeat && beat <= note.startBeat + note.durationBeat
      const leftHand = note.hand === 'left'
      const recorded = note.source === 'recorded'

      const gradient = ctx.createLinearGradient(bounds.x, top, bounds.x + bounds.width, y)
      if (recorded) {
        gradient.addColorStop(0, '#4db6ac')
        gradient.addColorStop(1, '#91e2d8')
      } else if (leftHand) {
        gradient.addColorStop(0, '#5b75d6')
        gradient.addColorStop(1, '#aab8ff')
      } else if (isTarget || isLive) {
        gradient.addColorStop(0, '#d45b63')
        gradient.addColorStop(1, '#ffb1b6')
      } else {
        gradient.addColorStop(0, '#d17b69')
        gradient.addColorStop(1, '#ffc4a8')
      }

      ctx.fillStyle = gradient
      drawRoundRect(ctx, bounds.x + 2, top, Math.max(5, bounds.width - 4), noteHeight, 7)
      ctx.fill()

      if (isTarget || isLive) {
        ctx.strokeStyle = 'rgba(255,255,255,0.92)'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      if (bounds.width > 22 && !leftHand) {
        ctx.fillStyle = 'rgba(42, 34, 32, 0.72)'
        ctx.font = '700 10px Nunito, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(note.note, bounds.x + bounds.width / 2, Math.max(top + 14, 14))
      }

      ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(61,42,42,0.08)'
      ctx.beginPath()
      ctx.moveTo(0, height - 1)
      ctx.lineTo(width, height - 1)
      ctx.stroke()
    }

    const render = (timestamp) => {
      if (!lastFrameRef.current) lastFrameRef.current = timestamp
      const delta = timestamp - lastFrameRef.current
      lastFrameRef.current = timestamp

      if (isPlaying) {
        const nextBeat = playbackBeatRef.current + (delta / 1000) * (bpm / 60)
        playbackBeatRef.current = nextBeat
        setCurrentBeat(nextBeat)

        allTimelineNotes.forEach(note => {
          if (note.source === 'recorded' && mode === 'record') return
          if (nextBeat >= note.startBeat && !triggeredRef.current.has(note.id)) {
            triggeredRef.current.add(note.id)
            playKey(KEY_BY_NOTE.get(note.note), { velocity: note.velocity })
          }
        })

        if (nextBeat >= songEndBeat) {
          setIsPlaying(false)
          setFeedback(mode === 'practice' ? '演示结束。可以重播，或直接跟弹目标键。' : '播放结束。')
        }
      }

      const width = canvas.clientWidth
      const height = canvas.clientHeight
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = theme === 'dark' ? '#090a11' : '#fffaf7'
      ctx.fillRect(0, 0, width, height)

      const whiteWidth = width / visibleWhiteKeys.length
      for (let i = 0; i <= visibleWhiteKeys.length; i += 1) {
        ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.045)' : 'rgba(61,42,42,0.055)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(i * whiteWidth, 0)
        ctx.lineTo(i * whiteWidth, height)
        ctx.stroke()
      }

      ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(61,42,42,0.16)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, height - 2)
      ctx.lineTo(width, height - 2)
      ctx.stroke()

      allTimelineNotes.forEach(note => drawTimelineNote(note, playbackBeatRef.current))

      rafRef.current = requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize)
    rafRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [allTimelineNotes, bpm, isPlaying, mode, playKey, songEndBeat, targetNote, theme, visibleBlackKeys, visibleKeys, visibleWhiteKeys, zoomMode])

  const getBlackKeyStyle = (key) => {
    const keyIndex = visibleKeys.findIndex(item => item.note === key.note)
    const previousWhite = visibleKeys.slice(0, keyIndex).filter(item => !item.isBlack).length
    const width = 0.62 / visibleWhiteKeys.length

    return {
      left: `${(previousWhite / visibleWhiteKeys.length - width / 2) * 100}%`,
      width: `${width * 100}%`,
    }
  }

  return (
    <div className="piano-page">
      <header className="piano-topbar">
        <div className="piano-brand">
          <Link to="/growth" className="piano-back">← 成长手册</Link>
          <div>
            <h1>钢琴跟弹练习室</h1>
            <p>{currentSong.title} · {MODE_LABELS[mode]}模式 · 第 {Math.floor(currentBeat / 4) + 1} 小节</p>
          </div>
        </div>

        <div className="piano-controls" aria-label="钢琴控制栏">
          <label className="piano-select">
            <span>曲目</span>
            <select value={songId} onChange={(event) => handleSongChange(event.target.value)}>
              {allSongs.map(song => (
                <option key={song.id} value={song.id}>{song.title}</option>
              ))}
            </select>
          </label>

          <div className="piano-segment" role="group" aria-label="练习模式">
            {Object.entries(MODE_LABELS).map(([value, label]) => (
              <button
                key={value}
                className={mode === value ? 'active' : ''}
                onClick={() => {
                  setMode(value)
                  setFeedback(value === 'practice' ? '跟弹模式：按高亮目标键推进。' : value === 'record' ? '录制模式：播放时会记录你的演奏。' : '自由模式：随意弹奏，不做判定。')
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            className="piano-primary"
            onClick={() => { ensureEngine(); setIsPlaying(prev => !prev) }}
            disabled={!samplesLoaded && !!engineRef.current}
            title={!samplesLoaded && engineRef.current ? '采样加载中…' : ''}
          >
            {!samplesLoaded && engineRef.current ? '加载中…' : (isPlaying ? '暂停' : '播放')}
          </button>
          <button className="piano-ghost" onClick={handleReplay}>重播</button>

          <label className="piano-range">
            <span>BPM {bpm}</span>
            <input type="range" min="56" max="148" value={bpm} onChange={(event) => setBpm(Number(event.target.value))} />
          </label>

          <label className="piano-range">
            <span>音量 {Math.round(volume * 100)}</span>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
          </label>

          <button className={`piano-ghost ${sustain ? 'active' : ''}`} onClick={() => setSustain(prev => !prev)}>
            延音 {sustain ? '开' : '关'}
          </button>

          <button className="piano-ghost" onClick={() => { setRecordedNotes([]); setFeedback('录制内容已清空。') }}>清空录制</button>
          <button className="piano-ghost" onClick={exportRecording}>导出</button>
        </div>
      </header>

      <main className="piano-stage">
        <section className="piano-lesson-panel">
          <div>
            <span className="piano-panel-kicker">当前练习</span>
            <h2>{currentSong.title}</h2>
            <p>{currentSong.subtitle}</p>
          </div>

          <div className="piano-staff" aria-label="五线谱提示">
            <svg viewBox="0 0 320 112" role="img">
              {[28, 40, 52, 64, 76].map(y => (
                <line key={y} x1="16" y1={y} x2="304" y2={y} />
              ))}
              <text x="24" y="72" className="piano-clef">𝄞</text>
              {targetNote && (
                <g className="piano-target-note">
                  <text x="106" y={getStaffY(targetNote.note) + 4} className="piano-accidental">
                    {targetNote.note.includes('#') ? '♯' : ''}
                  </text>
                  <ellipse cx="128" cy={getStaffY(targetNote.note)} rx="9" ry="6" transform={`rotate(-18 128 ${getStaffY(targetNote.note)})`} />
                  <line x1="136" y1={getStaffY(targetNote.note)} x2="136" y2={getStaffY(targetNote.note) - 32} />
                  <text x="158" y={getStaffY(targetNote.note) + 4} className="piano-target-label">{targetNote.note}</text>
                </g>
              )}
            </svg>
          </div>

          <div className={`piano-feedback ${feedback.includes('偏了') ? 'warn' : ''}`}>
            {feedback}
          </div>

          <div className="piano-progress" aria-label="跟弹进度">
            {melodyNotes.map((note, index) => (
              <span key={note.id} className={index < targetIndex ? 'done' : index === targetIndex ? 'current' : ''}>
                {note.note}
              </span>
            ))}
          </div>

          {currentSong.staffLines?.length > 0 && (
            <div className="piano-line-reader" aria-label="逐行五线谱读取">
              <div className="piano-line-reader-head">
                <span>逐行演奏</span>
                <strong>当前第 {currentStaffLine?.lineNumber ?? 1} 行</strong>
              </div>
              {currentSong.staffLines.map(line => (
                <div
                  key={line.lineNumber}
                  className={`piano-score-line ${currentStaffLine?.lineNumber === line.lineNumber ? 'active' : ''}`}
                >
                  <span>{line.lineNumber}</span>
                  <code>{line.text}</code>
                </div>
              ))}
            </div>
          )}

          <div className="piano-teaching-grid">
            <article>
              <h3>五线谱与 88 键映射</h3>
              <p>中央 C 是 C4。五线谱上的音越高，钢琴键越靠右；带 # 的音是相邻白键之间的黑键，例如 C#4 在 C4 和 D4 中间。</p>
              <p>底部 37/49/88 键只是显示范围变化，音名和真实 88 键位置不变。瀑布流落到键盘线时，目标音会在对应琴键上高亮。</p>
            </article>
            <article>
              <h3>基础乐理</h3>
              <p>BPM 表示速度；1 拍可以理解为一个基本节奏单位。C4/1 是 C4 持续 1 拍，C4/2 是持续 2 拍。</p>
              <p>八度数字越大音越高；和弦表示多个音同时弹，例如 [C3,E3,G3]/2。</p>
            </article>
            <article>
              <h3>音源版权</h3>
              <p>当前音源不加载任何采样音频，全部由浏览器 Web Audio 实时合成，因此不涉及第三方录音或采样包授权问题。</p>
            </article>
          </div>

          <div className="piano-staff-editor">
            <div className="piano-editor-head">
              <div>
                <span className="piano-panel-kicker">手动录入五线谱</span>
                <h3>读取乐谱并演奏</h3>
              </div>
              <label>
                BPM
                <input
                  type="number"
                  min="40"
                  max="180"
                  value={staffBpm}
                  onChange={(event) => setStaffBpm(Number(event.target.value))}
                />
              </label>
            </div>
            <textarea
              value={staffInput}
              onChange={(event) => setStaffInput(event.target.value)}
              spellCheck="false"
              aria-label="手动录入五线谱"
            />
            <div className="piano-editor-actions">
              <button className="piano-primary" onClick={applyStaffInput}>读取五线谱</button>
              <button className="piano-ghost" onClick={() => { applyStaffInput(); ensureEngine(); setIsPlaying(true) }}>读取并播放</button>
            </div>
            <p className="piano-editor-help">格式：C4/1 D4/1 | E4/2；休止符：R/1；和弦：[C3,E3,G3]/2；精确格式：C4 0 1 right 0.8。</p>
          </div>
        </section>

        <section className="piano-waterfall-panel">
          <canvas ref={canvasRef} className="piano-waterfall" aria-label="瀑布流演示画布" />
        </section>
      </main>

      <section className="piano-keyboard-shell" aria-label="钢琴键盘">
        <div className="piano-keyboard-toolbar">
          <div className="piano-segment compact" role="group" aria-label="键盘范围">
            {['37', '49', '88'].map(value => (
              <button key={value} className={zoomMode === value ? 'active' : ''} onClick={() => setZoomMode(value)}>
                {value} 键
              </button>
            ))}
          </div>
          <span>电脑键盘：A S D F G H J K L 对应白键，W E T Y U O P 对应黑键，空格播放/暂停。</span>
        </div>

        <div className="piano-keyboard">
          {visibleWhiteKeys.map(key => {
            const isActive = activeKeys[key.note]
            const isTarget = targetNote?.note === key.note

            return (
              <button
                key={key.note}
                className={`piano-key piano-white-key ${isActive ? 'active' : ''} ${isTarget ? 'target' : ''}`}
                style={{ width: `${100 / visibleWhiteKeys.length}%` }}
                onMouseDown={() => handleManualKey(key)}
                onTouchStart={(event) => { event.preventDefault(); handleManualKey(key) }}
                aria-label={key.note}
              >
                <span>{zoomMode === '88' ? key.note.replace(/\d/, '') : key.note}</span>
                {key.keyboardKey && <kbd>{key.keyboardKey}</kbd>}
              </button>
            )
          })}

          {visibleBlackKeys.map(key => {
            const isActive = activeKeys[key.note]
            const isTarget = targetNote?.note === key.note

            return (
              <button
                key={key.note}
                className={`piano-key piano-black-key ${isActive ? 'active' : ''} ${isTarget ? 'target' : ''}`}
                style={getBlackKeyStyle(key)}
                onMouseDown={() => handleManualKey(key)}
                onTouchStart={(event) => { event.preventDefault(); handleManualKey(key) }}
                aria-label={key.note}
              >
                <span>{zoomMode === '88' ? '' : key.note}</span>
                {key.keyboardKey && <kbd>{key.keyboardKey}</kbd>}
              </button>
            )
          })}
        </div>
      </section>

      {showExport && (
        <div className="piano-export-overlay" role="dialog" aria-modal="true" aria-label="导出演奏记录">
          <div className="piano-export-modal">
            <div className="piano-export-head">
              <h2>导出演奏记录</h2>
              <button onClick={() => setShowExport(false)} aria-label="关闭">×</button>
            </div>
            <p>下面是当前曲目和录制音符的 JSON，可用于后续接入导入、分享或云端保存。</p>
            <textarea value={exportText} onChange={(event) => setExportText(event.target.value)} />
            <div className="piano-export-actions">
              <button className="piano-primary" onClick={() => navigator.clipboard.writeText(exportText)}>复制 JSON</button>
              <button className="piano-ghost" onClick={() => setShowExport(false)}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
