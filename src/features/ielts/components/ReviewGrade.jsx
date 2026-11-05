// 间隔复习自评按钮与到期状态（错题/替换/词块共用）。
import { gradeItem, getSrMap, itemKey, DAY_MS } from '../storage/spacedRepetition.js'

const GRADES = [
  { value: 0, label: '忘了', cls: 'border-danger/50 text-danger' },
  { value: 1, label: '困难', cls: 'border-warning/50 text-warning' },
  { value: 2, label: '正常', cls: 'border-accent-border text-accent' },
  { value: 3, label: '简单', cls: 'border-success/50 text-success' },
]

export function dueLabel(item, now = Date.now()) {
  if (!item) return '新内容，今天复习'
  if (item.dueAt <= now) return '今天到期'
  const days = Math.ceil((item.dueAt - now) / DAY_MS)
  return `${days} 天后复习`
}

export function srItem(kind, refId) {
  return getSrMap()[itemKey(kind, refId)] || null
}

export default function GradeButtons({ kind, refId, onGraded }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] text-fg-faint">回忆后自评：</span>
      {GRADES.map((g) => (
        <button
          key={g.value}
          type="button"
          className={`rounded-full border px-2.5 py-0.5 text-[11px] ${g.cls}`}
          onClick={() => {
            const next = gradeItem(kind, refId, g.value)
            onGraded?.(next)
          }}
        >
          {g.label}
        </button>
      ))}
    </div>
  )
}
