// 目标检测 · 真实 IoU / NMS 演算可视化
// 候选框置信度排序 → 逐对计算真实 IoU → 阈值抑制 → 输出检测结果。
// 步骤携带 pythonLine/cppLine（对应 curriculum LATE_COURSE_CODE 的代码行）。
import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

// 行号对应 curriculum.js LATE_COURSE_CODE['cv-object-detection'].code
const L = {
  feat:    { pythonLine: 2, cppLine: 2 },
  anchors: { pythonLine: 3, cppLine: 3 },
  score:   { pythonLine: 4, cppLine: 4 },
  nms:     { pythonLine: 5, cppLine: 5 },
  done:    { pythonLine: 6, cppLine: 6 },
}

// 100×70 教学画面，框 = [x, y, w, h]；两组候选框分别围着「猫」「狗」
const BOXES = [
  { id: 'A', cls: '猫', box: [12, 14, 34, 30], score: 0.92 },
  { id: 'B', cls: '猫', box: [16, 18, 32, 28], score: 0.78 },
  { id: 'C', cls: '猫', box: [10, 10, 30, 26], score: 0.61 },
  { id: 'D', cls: '狗', box: [56, 30, 36, 32], score: 0.88 },
  { id: 'E', cls: '狗', box: [60, 34, 34, 30], score: 0.70 },
  { id: 'F', cls: '狗', box: [40, 8, 22, 18], score: 0.35 },
]
const IOU_THRESHOLD = 0.5
const SCORE_THRESHOLD = 0.4

const fmt = (v) => Number(v.toFixed(3))

function iou(a, b) {
  const [ax, ay, aw, ah] = a; const [bx, by, bw, bh] = b
  const ix = Math.max(0, Math.min(ax + aw, bx + bw) - Math.max(ax, bx))
  const iy = Math.max(0, Math.min(ay + ah, by + bh) - Math.max(ay, by))
  const inter = ix * iy
  return inter / (aw * ah + bw * bh - inter)
}

function computeSteps() {
  const steps = []
  const snap = (desc, lines, extra = {}) => steps.push({
    boxes: BOXES, description: desc, ...lines, ...extra,
  })

  snap('骨干网络提取特征图，检测头对每个锚框位置回归出候选框和置信度分数。', L.feat, { phase: 'feature' })
  snap(`生成 ${BOXES.length} 个候选框（实际网络是数千个）。颜色深浅表示置信度。`, L.anchors,
    { phase: 'anchors', visible: BOXES.map(b => b.id) })

  // 置信度过滤 + 排序
  const filtered = BOXES.filter(b => b.score >= SCORE_THRESHOLD)
  const dropped = BOXES.filter(b => b.score < SCORE_THRESHOLD)
  snap(`按置信度过滤（阈值 ${SCORE_THRESHOLD}）：${dropped.map(b => `${b.id}(${b.score})`).join('、') || '无'} 被丢弃。剩余按分数降序：${[...filtered].sort((a, b) => b.score - a.score).map(b => `${b.id}(${b.score})`).join(' > ')}。`,
    L.score, { phase: 'score', visible: filtered.map(b => b.id), dim: dropped.map(b => b.id) })

  // NMS
  const sorted = [...filtered].sort((a, b) => b.score - a.score)
  const kept = []
  const suppressed = new Set()
  for (const cand of sorted) {
    if (suppressed.has(cand.id)) continue
    kept.push(cand.id)
    snap(`NMS：保留当前最高分框 ${cand.id}（${cand.cls}, score=${cand.score}），检查与剩余框的 IoU。`,
      L.nms, { phase: 'nms', visible: filtered.filter(b => !suppressed.has(b.id)).map(b => b.id), kept: [...kept], focus: cand.id })
    for (const other of sorted) {
      if (other.id === cand.id || suppressed.has(other.id) || kept.includes(other.id)) continue
      const v = iou(cand.box, other.box)
      const kill = v > IOU_THRESHOLD
      if (kill) suppressed.add(other.id)
      snap(`IoU(${cand.id}, ${other.id}) = 交集/并集 = ${fmt(v)} ${kill ? `> ${IOU_THRESHOLD} → 抑制 ${other.id}（与 ${cand.id} 检测的是同一目标）` : `≤ ${IOU_THRESHOLD} → 保留（不同目标）`}。`,
        L.nms, {
          phase: 'nms', visible: filtered.filter(b => !suppressed.has(b.id) || b.id === other.id).map(b => b.id),
          kept: [...kept], focus: cand.id, compare: other.id, iouValue: fmt(v),
          probability: fmt(v),
          suppressedNow: kill ? other.id : null,
        })
    }
  }

  snap(`NMS 完成：${kept.join('、')} 胜出，输出 ${kept.length} 个检测结果（每个目标一个框 + 类别 + 置信度）。`,
    L.done, { phase: 'done', visible: kept, kept })
  return steps
}

const W = 100, H = 70, SCALE = 4.6

function SceneViz({ current }) {
  const visible = new Set(current.visible ?? BOXES.map(b => b.id))
  const kept = new Set(current.kept || [])
  const dim = new Set(current.dim || [])
  return (
    <VizCard>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W * SCALE, background: 'var(--surface)', borderRadius: 8 }}>
          {/* 目标轮廓示意 */}
          <ellipse cx="28" cy="30" rx="13" ry="11" fill="rgba(139,92,246,0.18)" />
          <text x="28" y="33" textAnchor="middle" fontSize="7" fill="var(--text-tertiary)">猫</text>
          <ellipse cx="74" cy="46" rx="15" ry="12" fill="rgba(14,165,233,0.18)" />
          <text x="74" y="49" textAnchor="middle" fontSize="7" fill="var(--text-tertiary)">狗</text>

          {BOXES.filter(b => visible.has(b.id)).map(b => {
            const [x, y, w, h] = b.box
            const isKept = kept.has(b.id)
            const isFocus = current.focus === b.id
            const isCompare = current.compare === b.id
            const stroke = isKept ? '#10b981' : isFocus ? '#f97316' : isCompare ? '#ef4444' : 'var(--accent)'
            return (
              <g key={b.id} opacity={dim.has(b.id) ? 0.3 : current.suppressedNow === b.id ? 0.45 : 1}>
                <rect x={x} y={y} width={w} height={h} fill="none" stroke={stroke}
                  strokeWidth={isFocus || isKept ? 1.6 : 0.9}
                  strokeDasharray={isCompare ? '2.5,1.5' : undefined} />
                <text x={x + 1.5} y={y + 5} fontSize="5.5" fontWeight="700" fill={stroke}>
                  {b.id} {b.cls} {Math.round(b.score * 100)}%
                </text>
              </g>
            )
          })}
          {current.iouValue != null && current.focus && current.compare && (
            <text x={W / 2} y={H - 3} textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#f97316">
              IoU({current.focus}, {current.compare}) = {current.iouValue}
            </text>
          )}
        </svg>

        <table style={{ borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>
              <th style={{ padding: '2px 8px', textAlign: 'left' }}>框</th>
              <th style={{ padding: '2px 8px' }}>score</th>
              <th style={{ padding: '2px 8px' }}>状态</th>
            </tr>
          </thead>
          <tbody>
            {BOXES.map(b => {
              const state = kept.has(b.id) ? '✓ 保留'
                : !visible.has(b.id) ? '✗ 已抑制'
                : dim.has(b.id) ? '✗ 低分丢弃'
                : current.focus === b.id ? '★ 当前'
                : current.compare === b.id ? '… 对比中'
                : '候选'
              return (
                <tr key={b.id} style={{
                  color: kept.has(b.id) ? '#10b981' : (!visible.has(b.id) || dim.has(b.id)) ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                }}>
                  <td style={{ padding: '2px 8px', fontWeight: 700 }}>{b.id} ({b.cls})</td>
                  <td style={{ padding: '2px 8px', textAlign: 'center' }}>{b.score}</td>
                  <td style={{ padding: '2px 8px' }}>{state}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </VizCard>
  )
}

export default function ObjectDetectionPlayground() {
  const presets = useMemo(() => [{ id: 'nms', label: '候选框 + NMS', state: {} }], [])
  const computeStepsFn = useCallback(() => computeSteps(), [])
  return (
    <PlaygroundShell
      initialState={{}}
      presets={presets}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#f97316', label: '当前最高分框' },
        { color: '#ef4444', label: 'IoU 对比框' },
        { color: '#10b981', label: 'NMS 保留' },
      ]}
      renderViz={({ current }) => <SceneViz current={current} />}
    />
  )
}
