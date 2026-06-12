// 图像分类 · 真实前向计算可视化
// 8×8 教学图像 → 3×3 卷积（真实乘加）→ 2×2 最大池化 → 线性层 logits → softmax 概率。
// 步骤携带 pythonLine/cppLine（对应 curriculum LATE_COURSE_CODE 的代码行）。
import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

// 行号对应 curriculum.js LATE_COURSE_CODE['cv-image-classification'].code
const L = {
  input:   { pythonLine: 2, cppLine: 2 },
  conv:    { pythonLine: 3, cppLine: 3 },
  pool:    { pythonLine: 4, cppLine: 4 },
  logits:  { pythonLine: 5, cppLine: 5 },
  softmax: { pythonLine: 6, cppLine: 6 },
  argmax:  { pythonLine: 7, cppLine: 7 },
}

// 8×8 二值教学图：手写 "7" 与 "1"
const IMAGES = {
  seven: {
    label: '数字 7', truth: 1,
    px: [
      [0,1,1,1,1,1,1,0],
      [0,0,0,0,0,1,1,0],
      [0,0,0,0,1,1,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,1,1,0,0,0,0],
      [0,1,1,0,0,0,0,0],
      [0,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0],
    ],
  },
  one: {
    label: '数字 1', truth: 0,
    px: [
      [0,0,0,1,1,0,0,0],
      [0,0,1,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0],
    ],
  },
}
const CLASSES = ['1', '7']
// 斜向边缘检测核：对 "7" 的斜线响应强
const KERNEL = [[0, 1, -1], [1, 0, -1], [-1, -1, 1]]

const fmt = (v, d = 2) => Number(v.toFixed(d))

function conv2d(img, kernel) {
  const n = img.length - 2
  const out = []
  for (let r = 0; r < n; r++) {
    const row = []
    for (let c = 0; c < n; c++) {
      let s = 0
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += img[r + i][c + j] * kernel[i][j]
      row.push(Math.max(0, s))  // ReLU
    }
    out.push(row)
  }
  return out
}
function maxPool(f, size = 2) {
  const n = Math.floor(f.length / size)
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => {
    let m = -Infinity
    for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) m = Math.max(m, f[r * size + i][c * size + j])
    return m
  }))
}

function computeSteps({ imageId }) {
  const { px, label, truth } = IMAGES[imageId] || IMAGES.seven
  const steps = []
  const base = { image: px, kernel: KERNEL }

  steps.push({ ...base, phase: 'input',
    description: `输入 8×8 灰度图（${label}），归一化到 [0,1]。真实网络的输入是 224×224×3，原理相同。`, ...L.input })

  // 卷积：先演示左上角一个窗口的真实乘加，再给整张特征图
  const feat = conv2d(px, KERNEL)
  let win = 0
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) win += px[0 + i][1 + j] * KERNEL[i][j]
  steps.push({ ...base, phase: 'conv', convWindow: [0, 1],
    description: `3×3 边缘卷积核滑过图像。窗口 (0,1) 的计算：Σ 像素×核 = ${fmt(win)} → ReLU → ${fmt(Math.max(0, win))}。`, ...L.conv })
  steps.push({ ...base, phase: 'conv', feature: feat,
    description: `得到 6×6 特征图（ReLU 后）。斜向笔画处响应值高——这就是"这一层学到了斜边缘"的含义。`, ...L.conv })

  const pooled = maxPool(feat)
  steps.push({ ...base, phase: 'pool', feature: feat, pooled,
    description: `2×2 最大池化下采样 → 3×3。保留每个区域的最强响应，对小位移保持不变性。`, ...L.pool })

  // 线性层：w1 = 对池化和的负权重 + 偏置（偏向 1）；w7 = 正权重（偏向 7）
  const flat = pooled.flat()
  const sum = flat.reduce((a, b) => a + b, 0)
  const logits = [fmt(2.0 - 0.45 * sum), fmt(0.55 * sum - 1.2)]   // [logit(1), logit(7)]
  steps.push({ ...base, phase: 'logits', pooled, logits,
    description: `展平（${flat.length} 维）送入线性层：logits = W·x + b = [${logits.join(', ')}]（对应类别 ${CLASSES.join(' / ')}）。`, ...L.logits })

  const m = Math.max(...logits)
  const ex = logits.map(v => Math.exp(v - m))
  const Z = ex.reduce((a, b) => a + b, 0)
  const probs = ex.map(e => fmt(e / Z, 3))
  steps.push({ ...base, phase: 'softmax', pooled, logits, probs,
    probability: Math.max(...probs),
    description: `softmax：P = [${probs.join(', ')}]。指数归一化把 logits 变成总和为 1 的概率分布。`, ...L.softmax })

  const pred = probs.indexOf(Math.max(...probs))
  steps.push({ ...base, phase: 'argmax', pooled, logits, probs, pred,
    probability: Math.max(...probs), prediction: CLASSES[pred],
    accuracy: pred === truth ? 1 : 0,
    description: `argmax → 预测类别 "${CLASSES[pred]}"（置信度 ${Math.round(Math.max(...probs) * 100)}%）${pred === truth ? '，预测正确 ✓' : '，预测错误 ✗'}。`, ...L.argmax })

  return steps
}

function Grid({ data, cell = 18, color = (v) => `rgba(139,92,246,${Math.min(1, v)})`, mark }) {
  return (
    <svg width={data[0].length * cell} height={data.length * cell} style={{ flexShrink: 0 }}>
      {data.map((row, r) => row.map((v, c) => (
        <g key={`${r}-${c}`}>
          <rect x={c * cell} y={r * cell} width={cell - 1} height={cell - 1}
            fill={v > 0 ? color(v) : 'var(--surface)'} stroke="var(--border)" strokeWidth="0.5" />
          {cell >= 22 && <text x={c * cell + cell / 2} y={r * cell + cell / 2 + 3.5} textAnchor="middle"
            fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-secondary)">{Number(v.toFixed(1))}</text>}
        </g>
      )))}
      {mark && <rect x={mark[1] * cell} y={mark[0] * cell} width={cell * 3 - 1} height={cell * 3 - 1}
        fill="none" stroke="#f97316" strokeWidth="2" />}
    </svg>
  )
}

function PipelineViz({ current }) {
  const probs = current.probs
  return (
    <VizCard>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>输入 8×8</div>
          <Grid data={current.image} mark={current.convWindow} />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>卷积核 3×3</div>
          <Grid data={current.kernel.map(r => r.map(v => Math.abs(v)))} cell={22}
            color={() => 'rgba(249,115,22,0.35)'} />
        </div>
        {current.feature && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>特征图 6×6（ReLU）</div>
            <Grid data={current.feature} color={v => `rgba(16,185,129,${Math.min(1, v / 3)})`} />
          </div>
        )}
        {current.pooled && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>池化 3×3</div>
            <Grid data={current.pooled} cell={26} color={v => `rgba(16,185,129,${Math.min(1, v / 3)})`} />
          </div>
        )}
        {current.logits && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>分类头</div>
            {CLASSES.map((c, i) => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
                <span style={{ width: 14, fontWeight: 700, color: current.pred === i ? '#10b981' : 'var(--text-secondary)' }}>{c}</span>
                <span style={{ width: 64, color: 'var(--text-tertiary)' }}>logit {current.logits[i]}</span>
                {probs && (
                  <>
                    <div style={{ width: 90, height: 10, background: 'var(--surface)', borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ width: `${probs[i] * 100}%`, height: '100%',
                        background: current.pred === i ? '#10b981' : 'var(--accent)' }} />
                    </div>
                    <b style={{ color: current.pred === i ? '#10b981' : 'var(--text-primary)' }}>{Math.round(probs[i] * 100)}%</b>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </VizCard>
  )
}

export default function ImageClassificationPlayground() {
  const presets = useMemo(() => [
    { id: 'seven', label: '识别 “7”', state: { imageId: 'seven' } },
    { id: 'one', label: '识别 “1”', state: { imageId: 'one' } },
  ], [])
  const computeStepsFn = useCallback((state) => computeSteps(state), [])
  return (
    <PlaygroundShell
      initialState={{ imageId: 'seven' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: 'var(--accent)', label: '像素强度' },
        { color: '#10b981', label: '特征响应 / 预测类别' },
        { color: '#f97316', label: '当前卷积窗口' },
      ]}
      renderViz={({ current }) => <PipelineViz current={current} />}
    />
  )
}
