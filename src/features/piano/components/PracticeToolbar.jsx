import { Link } from 'react-router-dom'

const MODES = {
  practice: '跟弹',
  free: '自由',
}

export default function PracticeToolbar({
  song,
  isPlaying, onToggle,
  onReplay,
  mode, onModeChange,
  bpm, onBpmChange,
  volume, onVolumeChange,
  sustain, onSustainToggle,
  samplesLoaded, starting,
}) {
  const playLabel = starting && !samplesLoaded ? '加载中…' : isPlaying ? '暂停' : '播放'

  return (
    <div className="flex flex-col gap-3 rounded-3xl border-2 border-[#f5d9b8] bg-white/85 px-5 py-4 shadow-[0_6px_20px_rgba(232,140,140,0.12)]">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/piano"
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-[#9e7f7f] hover:bg-[#fff0e6]"
        >
          ← 曲库
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-[#3d2a2a] leading-tight">{song.title}</h2>
          <p className="text-xs font-semibold text-[#9e7f7f]">
            {song.composer ?? '—'} · BPM {bpm} · {'⭐'.repeat(song.difficulty ?? 1)}
          </p>
        </div>
        <button
          onClick={onToggle}
          disabled={starting && !samplesLoaded}
          className="rounded-full bg-[#e86c5d] px-7 py-2.5 text-base font-black text-white shadow-[0_4px_0_#c85a5a,0_8px_18px_rgba(232,124,124,0.32)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-60 disabled:cursor-wait"
        >
          {playLabel}
        </button>
        <button
          onClick={onReplay}
          className="rounded-full border-2 border-[#e8a4a4] bg-white px-4 py-2 text-sm font-bold text-[#e86c5d] hover:bg-[#fff0e6]"
        >
          重播
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-1 rounded-full bg-[#fdebd3] p-1" role="group" aria-label="模式">
          {Object.entries(MODES).map(([value, label]) => (
            <button
              key={value}
              onClick={() => onModeChange(value)}
              className={
                mode === value
                  ? 'rounded-full bg-white px-3 py-1 font-bold text-[#e86c5d] shadow-sm'
                  : 'rounded-full px-3 py-1 font-semibold text-[#9e7f7f] hover:bg-white/60'
              }
            >
              {label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-[#9e7f7f] font-semibold">
          <span>BPM {bpm}</span>
          <input
            type="range"
            min={50}
            max={180}
            value={bpm}
            onChange={(e) => onBpmChange(Number(e.target.value))}
            className="accent-[#e86c5d]"
          />
        </label>

        <label className="flex items-center gap-2 text-[#9e7f7f] font-semibold">
          <span>音量 {Math.round(volume * 100)}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="accent-[#e86c5d]"
          />
        </label>

        <button
          onClick={onSustainToggle}
          className={
            sustain
              ? 'rounded-full bg-[#f6d057] px-3 py-1 text-sm font-bold text-[#7a5a1a]'
              : 'rounded-full border border-[#e8a4a4] bg-white px-3 py-1 text-sm font-semibold text-[#9e7f7f]'
          }
        >
          延音 {sustain ? '开' : '关'}
        </button>
      </div>
    </div>
  )
}
