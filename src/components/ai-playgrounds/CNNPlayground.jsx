import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const CELL = 44
const GAP = 2

// Simple color mapping for a value in [0, 1]
function heatColor(v) {
  // purple → yellow gradient
  const t = Math.max(0, Math.min(1, v))
  const r = Math.round(40 + t * 215)
  const g = Math.round(20 + t * 150)
  const b = Math.round(100 - t * 60)
  return `rgb(${r},${g},${b})`
}

// 5x5 input images (grayscale)
const IMAGES = {
  'edge-v': [
    [0.1, 0.1, 0.9, 0.1, 0.1],
    [0.1, 0.2, 0.95, 0.2, 0.1],
    [0.2, 0.1, 0.9, 0.1, 0.2],
    [0.1, 0.2, 0.9, 0.2, 0.1],
    [0.1, 0.1, 0.95, 0.1, 0.1],
  ],
  'edge-h': [
    [0.1, 0.1, 0.1, 0.1, 0.1],
    [0.2, 0.2, 0.2, 0.2, 0.2],
    [0.9, 0.95, 0.9, 0.95, 0.9],
    [0.2, 0.2, 0.2, 0.2, 0.2],
    [0.1, 0.1, 0.1, 0.1, 0.1],
  ],
  'corner': [
    [0.9, 0.9, 0.2, 0.1, 0.1],
    [0.9, 0.9, 0.2, 0.1, 0.1],
    [0.2, 0.2, 0.2, 0.2, 0.2],
    [0.1, 0.1, 0.2, 0.1, 0.1],
    [0.1, 0.1, 0.2, 0.1, 0.1],
  ],
}

// 3x3 kernels
const KERNELS = {
  'sobel-v': [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ],
  'sobel-h': [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ],
  'blur': [
    [0.11, 0.11, 0.11],
    [0.11, 0.12, 0.11],
    [0.11, 0.11, 0.11],
  ],
  'sharpen': [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0],
  ],
}

function computeSteps({ imageKey, kernelKey }) {
  const input = IMAGES[imageKey]
  const kernel = KERNELS[kernelKey]
  const steps = []

  const N = input.length
  const K = kernel.length
  const outN = N - K + 1 // 3 for 5-3+1

  steps.push({
    description: `初始化: 5×5 输入图像, 3×3 卷积核 "${kernelKey}", 步长=1, padding=valid`,
    line: 1, phase: 'init',
    input, kernel,
    convRow: -1, convCol: -1, convSum: 0,
    featureMap: Array.from({ length: outN }, () => Array(outN).fill(null)),
    poolRow: -1, poolCol: -1, poolVal: null,
    pooled: null,
  })

  // Step through each convolution position
  for (let r = 0; r < outN; r++) {
    for (let c = 0; c < outN; c++) {
      let sum = 0
      const region = []
      for (let kr = 0; kr < K; kr++) {
        region.push([])
        for (let kc = 0; kc < K; kc++) {
          const v = input[r + kr][c + kc] * kernel[kr][kc]
          sum += v
          region[kr].push(v)
        }
      }
      steps.push({
        description: `卷积位置 (${r + 1},${c + 1}): 元素相乘求和 = ${sum.toFixed(3)}`,
        line: 3, phase: 'conv',
        input, kernel,
        convRow: r, convCol: c, convSum: sum, convRegion: region,
        featureMap: Array.from({ length: outN }, (_, rr) =>
          Array.from({ length: outN }, (_, cc) =>
            rr < r || (rr === r && cc <= c) ? (() => {
              let s = 0
              for (let kr = 0; kr < K; kr++)
                for (let kc = 0; kc < K; kc++)
                  s += input[rr + kr][cc + kc] * kernel[kr][kc]
              return s
            })() : null
          )
        ),
        poolRow: -1, poolCol: -1, poolVal: null,
        pooled: null,
      })
    }
  }

  // Full feature map computed
  const featureMap = Array.from({ length: outN }, (_, r) =>
    Array.from({ length: outN }, (_, c) => {
      let s = 0
      for (let kr = 0; kr < K; kr++)
        for (let kc = 0; kc < K; kc++)
          s += input[r + kr][c + kc] * kernel[kr][kc]
      return s
    })
  )
  // Normalize for display
  const fmMin = Math.min(...featureMap.flat())
  const fmMax = Math.max(...featureMap.flat())
  const fmNorm = featureMap.map(row => row.map(v => (v - fmMin) / Math.max(1e-6, fmMax - fmMin)))

  steps.push({
    description: `卷积完成: 5×5 ⊛ 3×3 → 3×3 特征图 (min=${fmMin.toFixed(2)}, max=${fmMax.toFixed(2)})`,
    line: 5, phase: 'conv-done',
    input, kernel,
    convRow: -1, convCol: -1, convSum: 0,
    featureMap, fmNorm,
    poolRow: -1, poolCol: -1, poolVal: null,
    pooled: null,
  })

  // Max pooling 2×2, stride 2 on 3×3 → 1×1 result (or 2×2 with padding)
  // Use 2×2 pool, stride 2: for 3×3 we take top-left 2×2 region
  const poolSize = 2
  const pooledOut = 2 // ceil(3/2)
  const pooled = []
  for (let pr = 0; pr < pooledOut; pr++) {
    pooled.push([])
    for (let pc = 0; pc < pooledOut; pc++) {
      let m = -Infinity
      for (let rr = 0; rr < poolSize; rr++) {
        for (let cc = 0; cc < poolSize; cc++) {
          const fr = pr * poolSize + rr
          const fc = pc * poolSize + cc
          if (fr < outN && fc < outN) {
            m = Math.max(m, featureMap[fr][fc])
          }
        }
      }
      pooled[pr].push(m === -Infinity ? 0 : m)
    }
  }

  // Step through each pooling position
  for (let pr = 0; pr < pooledOut; pr++) {
    for (let pc = 0; pc < pooledOut; pc++) {
      const vals = []
      for (let rr = 0; rr < poolSize; rr++) {
        vals.push([])
        for (let cc = 0; cc < poolSize; cc++) {
          const fr = pr * poolSize + rr
          const fc = pc * poolSize + cc
          vals[rr].push(fr < outN && fc < outN ? featureMap[fr][fc] : null)
        }
      }
      steps.push({
        description: `Max Pool (${pr + 1},${pc + 1}): 取 2×2 区域最大值 = ${pooled[pr][pc].toFixed(3)}`,
        line: 7, phase: 'pool',
        input, kernel,
        convRow: -1, convCol: -1, convSum: 0,
        featureMap, fmNorm,
        poolRow: pr, poolCol: pc, poolVal: pooled[pr][pc], poolRegion: vals, poolSize,
        pooled: pooled.slice(0, pr).concat([
          pooled[pr].slice(0, pc + 1).concat(Array(pooledOut - pc - 1).fill(null))
        ]).concat(Array(pooledOut - pr - 1).fill(Array(pooledOut).fill(null))),
      })
    }
  }

  steps.push({
    description: `完成: 3×3 特征图 → MaxPool(2×2, s=2) → ${pooledOut}×${pooledOut} 降采样输出`,
    line: 9, phase: 'done',
    input, kernel,
    convRow: -1, convCol: -1, convSum: 0,
    featureMap, fmNorm,
    poolRow: -1, poolCol: -1, poolVal: null,
    pooled,
  })

  return steps
}

function GridCell({ v, size, highlight, showText, border }) {
  const norm = typeof v === 'number' ? (v + 2) / 4 : 0.2 // rough normalize so negatives show
  const color = typeof v === 'number' ? heatColor(norm) : 'var(--surface-2)'
  return (
    <div style={{
      width: size, height: size,
      background: color,
      border: highlight ? `2px solid #f97316` : border || `1px solid var(--border)`,
      borderRadius: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      fontSize: size < 28 ? 9 : 11,
      color: (typeof v === 'number' && norm > 0.6) ? 'white' : 'var(--text-primary)',
      fontWeight: 600,
      transition: 'all 0.3s',
    }}>
      {showText && v !== null && v !== undefined ? (typeof v === 'number' ? v.toFixed(2) : v) : ''}
    </div>
  )
}

function HeatmapGrid({ data, cellSize, highlightRect, showText, label }) {
  const n = data.length
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {label && <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</div>}
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${n}, ${cellSize + GAP}px)`, gap: GAP }}>
        {data.map((row, r) =>
          row.map((v, c) => {
            const inRect = highlightRect && r >= highlightRect.r && r < highlightRect.r + highlightRect.size
              && c >= highlightRect.c && c < highlightRect.c + highlightRect.size
            return <GridCell key={`${r}-${c}`} v={v} size={cellSize} highlight={inRect} showText={showText} />
          })
        )}
      </div>
    </div>
  )
}

function ConvRegionView({ input, kernel, r, c, region }) {
  const K = kernel.length
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 600 }}>感受野 (Input)</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${K}, 30px)`, gap: GAP }}>
          {region?.map((row, rr) => row.map((v, cc) => {
            const orig = input[r + rr][c + cc]
            return <GridCell key={`ir-${rr}-${cc}`} v={orig} size={30} showText />
          }))}
        </div>
      </div>
      <div style={{ fontSize: 22, color: 'var(--text-secondary)', fontWeight: 300 }}>⊙</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ fontSize: 11, color: '#f97316', fontWeight: 600 }}>Kernel</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${K}, 30px)`, gap: GAP }}>
          {kernel.map((row, rr) => row.map((v, cc) => (
            <GridCell key={`k-${rr}-${cc}`} v={v} size={30} showText border="1px solid #f9731680" />
          )))}
        </div>
      </div>
      <div style={{ fontSize: 22, color: 'var(--text-secondary)', fontWeight: 300 }}>=</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Sum</div>
        <div style={{
          width: 50, height: 50,
          background: '#10b98120',
          border: '2px solid #10b981',
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#10b981',
        }}>
          {region ? region.flat().reduce((a, b) => a + b, 0).toFixed(2) : '—'}
        </div>
      </div>
    </div>
  )
}

function PoolRegionView({ poolRegion, poolVal }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 600 }}>Pool 区域</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${poolRegion.length}, 34px)`, gap: GAP }}>
          {poolRegion.map((row, rr) => row.map((v, cc) => (
            <GridCell key={`pr-${rr}-${cc}`} v={v} size={34} showText />
          )))}
        </div>
      </div>
      <div style={{ fontSize: 20, color: 'var(--text-secondary)' }}>max →</div>
      <div style={{
        width: 50, height: 50,
        background: '#10b98120',
        border: '2px solid #10b981',
        borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#10b981',
      }}>{poolVal?.toFixed(2) ?? '—'}</div>
    </div>
  )
}

export default function CNNPlayground() {
  const presets = useMemo(() => [
    { id: 'sv', label: 'Sobel-V · 竖边', state: { imageKey: 'edge-v', kernelKey: 'sobel-v' } },
    { id: 'sh', label: 'Sobel-H · 横边', state: { imageKey: 'edge-h', kernelKey: 'sobel-h' } },
    { id: 'corner-blur', label: '角点 · Blur', state: { imageKey: 'corner', kernelKey: 'blur' } },
    { id: 'edge-sharp', label: '竖边 · Sharpen', state: { imageKey: 'edge-v', kernelKey: 'sharpen' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ imageKey: 'edge-v', kernelKey: 'sobel-v' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: 'rgb(140,80,220)', label: '低值' },
        { color: 'rgb(220,170,60)', label: '高值' },
        { color: '#f97316', label: '当前感受野' },
      ]}
      renderViz={({ current }) => {
        const K = current.kernel.length

        // Compute convolution viewing window for overlay
        const convRect = current.convRow >= 0
          ? { r: current.convRow, c: current.convCol, size: K }
          : null
        const poolRect = current.poolRow >= 0 && current.poolSize
          ? { r: current.poolRow * current.poolSize, c: current.poolCol * current.poolSize, size: current.poolSize }
          : null

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              {/* Top: input + kernel + feature map */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
                <HeatmapGrid
                  data={current.input}
                  cellSize={CELL}
                  highlightRect={convRect}
                  showText
                  label="Input (5×5)"
                />
                <div style={{ fontSize: 22, color: 'var(--text-secondary)', alignSelf: 'center', fontWeight: 300 }}>⊛</div>
                <HeatmapGrid
                  data={current.kernel}
                  cellSize={CELL}
                  showText
                  label="Kernel (3×3)"
                />
                <div style={{ fontSize: 22, color: 'var(--text-secondary)', alignSelf: 'center', fontWeight: 300 }}>=</div>
                <HeatmapGrid
                  data={current.fmNorm || current.featureMap.map(r => r.map(v => v === null ? null : 0.5))}
                  cellSize={CELL}
                  highlightRect={current.phase === 'conv' ? { r: current.convRow, c: current.convCol, size: 1 } : poolRect}
                  showText
                  label="Feature Map (3×3)"
                />
              </div>

              {/* Middle: step-by-step detail */}
              {current.phase === 'conv' && current.convRegion && (
                <ConvRegionView
                  input={current.input}
                  kernel={current.kernel}
                  r={current.convRow}
                  c={current.convCol}
                  region={current.convRegion}
                />
              )}
              {current.phase === 'pool' && current.poolRegion && (
                <PoolRegionView
                  poolRegion={current.poolRegion}
                  poolVal={current.poolVal}
                />
              )}

              {/* Bottom: pooled output */}
              {current.pooled && (
                <HeatmapGrid
                  data={current.pooled}
                  cellSize={CELL}
                  highlightRect={current.phase === 'pool' ? { r: current.poolRow, c: current.poolCol, size: 1 } : null}
                  showText
                  label="Pooled Output"
                />
              )}

              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span>phase: <b style={{ color: 'var(--text-primary)' }}>{current.phase}</b></span>
                {current.phase === 'conv' && (
                  <span>position: <b>({current.convRow + 1},{current.convCol + 1})</b></span>
                )}
                {current.phase === 'pool' && (
                  <span>pool: <b>({current.poolRow + 1},{current.poolCol + 1})</b></span>
                )}
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
