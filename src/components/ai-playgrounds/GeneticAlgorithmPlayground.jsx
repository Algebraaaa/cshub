import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'
import { OptVizCanvas, Axes, PopulationDots, contourPaths } from './OptViz2D'

// 适应度函数（求最大值）
const fn = (x, y) => {
  return 3 * (1 - x) ** 2 * Math.exp(-x * x - (y + 1) ** 2)
    - 10 * (x / 5 - x ** 3 - y ** 5) * Math.exp(-x * x - y * y)
    - 1 / 3 * Math.exp(-Math.pow(x + 1, 2) - y * y)
}

const X_RANGE = [-3, 3]
const Y_RANGE = [-3, 3]
const LEVELS = [-2, -1, 0, 1, 2, 3, 4]

function computeSteps(popSize, crossRate, mutRate) {
  const steps = []
  // 初始化种群
  let pop = Array.from({ length: popSize }, () => ({
    x: (Math.random() - 0.5) * 6,
    y: (Math.random() - 0.5) * 6,
  }))

  const evalFitness = p => fn(p.x, p.y)

  for (let gen = 0; gen < 20; gen++) {
    const fitnesses = pop.map(evalFitness)
    const bestFit = Math.max(...fitnesses)
    const avgFit = fitnesses.reduce((s, f) => s + f, 0) / fitnesses.length
    const bestIdx = fitnesses.indexOf(bestFit)

    steps.push({
      description: `第 ${gen + 1} 代: 最佳适应度=${bestFit.toFixed(3)}, 平均=${avgFit.toFixed(3)}`,
      population: pop.map(p => ({ ...p })),
      best: { ...pop[bestIdx] },
      bestFit, avgFit, gen, popSize, crossRate, mutRate,
    })

    // 选择 + 交叉 + 变异
    const newPop = []

    // 精英保留
    newPop.push({ ...pop[bestIdx] })

    while (newPop.length < popSize) {
      // 轮盘赌选择
      const totalFit = fitnesses.reduce((s, f) => s + Math.max(f + 3, 0.01), 0)
      const pick = () => {
        let r = Math.random() * totalFit
        for (let i = 0; i < pop.length; i++) {
          r -= Math.max(fitnesses[i] + 3, 0.01)
          if (r <= 0) return pop[i]
        }
        return pop[pop.length - 1]
      }

      let p1 = pick()
      let p2 = pick()

      // 交叉
      if (Math.random() < crossRate) {
        const alpha = Math.random()
        p1 = { x: alpha * p1.x + (1 - alpha) * p2.x, y: alpha * p1.y + (1 - alpha) * p2.y }
      }

      // 变异
      if (Math.random() < mutRate) {
        p1 = { x: p1.x + (Math.random() - 0.5) * 0.5, y: p1.y + (Math.random() - 0.5) * 0.5 }
      }

      // 边界约束
      p1.x = Math.max(-3, Math.min(3, p1.x))
      p1.y = Math.max(-3, Math.min(3, p1.y))
      newPop.push(p1)
    }

    pop = newPop
  }

  const fitnesses = pop.map(evalFitness)
  const bestFit = Math.max(...fitnesses)
  const bestIdx = fitnesses.indexOf(bestFit)
  steps.push({
    description: `最终: 最佳适应度=${bestFit.toFixed(3)}`,
    population: pop.map(p => ({ ...p })),
    best: { ...pop[bestIdx] },
    bestFit, avgFit: bestFit, gen: 20, popSize, crossRate, mutRate,
  })

  return steps
}

export default function GeneticAlgorithmPlayground() {
  const presets = useMemo(() => [
    { id: 'default', label: '默认参数', state: { popSize: 30, crossRate: 0.8, mutRate: 0.05 } },
    { id: 'large', label: '大种群', state: { popSize: 60, crossRate: 0.8, mutRate: 0.05 } },
    { id: 'high-mut', label: '高变异率', state: { popSize: 30, crossRate: 0.8, mutRate: 0.3 } },
  ], [])

  const contours = useMemo(() => contourPaths(fn, X_RANGE, Y_RANGE, LEVELS), [])

  const computeStepsFn = useCallback((state) => {
    return computeSteps(state.popSize, state.crossRate, state.mutRate)
  }, [])

  return (
    <PlaygroundShell
      initialState={{ popSize: 30, crossRate: 0.8, mutRate: 0.05 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: '种群个体' },
        { color: '#f59e0b', label: '全局最优' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <OptVizCanvas>
              <Axes xRange={X_RANGE} yRange={Y_RANGE} />
              {contours.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="var(--border)" strokeWidth="0.8" opacity="0.4" />
              ))}
              <PopulationDots points={current.population} xRange={X_RANGE} yRange={Y_RANGE} color="#8b5cf6" r={4} />
              {/* 最优个体高亮 */}
              <circle
                cx={current.best.x * (360 / 6) + 240}
                cy={current.best.y * (-240 / 6) + 160}
                r="8" fill="none" stroke="#f59e0b" strokeWidth="2.5"
              >
                <animate attributeName="r" values="8;11;8" dur="0.8s" repeatCount="indefinite" />
              </circle>
            </OptVizCanvas>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>第 {current.gen} 代</span>
              <span>最佳: <b>{current.bestFit.toFixed(3)}</b></span>
              <span>种群: {current.popSize}</span>
            </div>
          </div>
        </VizCard>
      )}
    />
  )
}
