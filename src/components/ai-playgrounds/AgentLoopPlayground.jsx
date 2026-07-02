// AI Agent · 真实执行循环可视化
// 目标「查三城气温求平均」：规划 → 工具调用（真实返回值）→ 记忆写入 →
// 完成判定 → 最终用真实数值计算平均并作答。记忆/草稿纸逐步演化。
import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

// 行号对应 curriculum.js LATE_COURSE_CODE['llm-agent'].code
const L = {
  goal:   { pythonLine: 2, cppLine: 2 },
  check:  { pythonLine: 3, cppLine: 3 },
  plan:   { pythonLine: 4, cppLine: 4 },
  tool:   { pythonLine: 5, cppLine: 5 },
  memory: { pythonLine: 6, cppLine: 6 },
  answer: { pythonLine: 7, cppLine: 8 },
}

const GOAL = '查询北京、上海、广州今天的气温，并计算三市平均气温'
const TEMPS = { 北京: 12, 上海: 18, 广州: 26 }
const CITIES = Object.keys(TEMPS)

function computeSteps() {
  const steps = []
  const memory = []
  const snap = (phase, desc, lines, extra = {}) => steps.push({
    phase, memory: memory.slice(), description: desc, ...lines, ...extra,
  })

  snap('goal', `读取目标：「${GOAL}」。初始化记忆（草稿纸）为空。`, L.goal)

  CITIES.forEach((city, i) => {
    snap('check', `循环判定 done(memory)：已有 ${i}/3 个城市数据 → 未完成，继续。`, L.check, { loopRound: i + 1 })
    snap('plan', `规划：记忆缺少「${city}」的气温 → 下一动作 = weather(city="${city}")。`, L.plan,
      { loopRound: i + 1, pendingTool: `weather("${city}")` })
    const t = TEMPS[city]
    snap('tool', `调用工具 weather("${city}") → 返回 ${t}°C。`, L.tool,
      { loopRound: i + 1, pendingTool: `weather("${city}")`, toolResult: `${t}°C` })
    memory.push({ key: `${city}气温`, value: `${t}°C` })
    snap('memory', `把观察结果写入记忆：${city} = ${t}°C（记忆现有 ${memory.length} 条）。`, L.memory,
      { loopRound: i + 1, justWrote: memory.length - 1 })
  })

  snap('check', `循环判定：三个城市数据齐了 → done(memory) = true，跳出循环。`, L.check, { loopDone: true })

  const vals = CITIES.map(c => TEMPS[c])
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length
  memory.push({ key: '平均气温', value: `${avg.toFixed(1)}°C` })
  snap('answer', `生成最终答案：平均 = (${vals.join(' + ')}) / ${vals.length} = ${avg.toFixed(1)}°C。Agent 的"自主性"= 这个 规划→工具→观察 循环，而不是一次性生成。`,
    L.answer, { justWrote: memory.length - 1, answered: `三市平均气温 ${avg.toFixed(1)}°C`, prediction: `${avg.toFixed(1)}°C` })
  return steps
}

const NODE = { goal: '目标', check: '判定', plan: '规划', tool: '工具', memory: '记忆', answer: '回答' }
const ORDER = ['goal', 'check', 'plan', 'tool', 'memory', 'answer']

function AgentViz({ current }) {
  return (
    <VizCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 循环链路 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {ORDER.map((key, i) => (
            <span key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                padding: '6px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                background: current.phase === key ? 'var(--accent-soft)' : 'var(--surface)',
                color: current.phase === key ? 'var(--accent-light)' : 'var(--text-tertiary)',
                border: `1.5px solid ${current.phase === key ? 'var(--accent)' : 'var(--border)'}`,
                boxShadow: current.phase === key ? '0 0 10px var(--accent-soft)' : 'none',
              }}>
                {NODE[key]}
              </span>
              {i < ORDER.length - 1 && <span style={{ color: 'var(--text-tertiary)' }}>→</span>}
            </span>
          ))}
          <span style={{ color: 'var(--text-tertiary)', fontSize: 11, marginLeft: 4 }}>
            ↺ 记忆 → 判定（循环{current.loopRound ? ` 第 ${current.loopRound} 轮` : ''}{current.loopDone ? ' · 已收敛' : ''}）
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {/* 目标 + 当前工具调用 */}
          <div style={{ flex: '1 1 260px', minWidth: 240 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>GOAL</div>
            <div style={{ padding: '8px 10px', borderRadius: 8, fontSize: 12.5, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              {GOAL}
            </div>
            {current.pendingTool && (
              <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>TOOL CALL</div>
                <div style={{
                  padding: '8px 10px', borderRadius: 8,
                  background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.4)',
                  color: '#f97316', fontWeight: 700,
                }}>
                  ▸ {current.pendingTool}
                  {current.toolResult && <span style={{ color: '#10b981' }}>  ⇒ {current.toolResult}</span>}
                </div>
              </div>
            )}
            {current.answered && (
              <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981' }}>
                ✓ {current.answered}
              </div>
            )}
          </div>

          {/* 记忆/草稿纸 */}
          <div style={{ flex: '1 1 220px', minWidth: 200 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>
              MEMORY（{current.memory.length} 条）
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {current.memory.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>（空）</div>
              )}
              {current.memory.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '5px 10px', borderRadius: 8,
                  fontSize: 12.5, fontFamily: 'var(--font-mono)',
                  background: current.justWrote === i ? 'var(--accent-soft)' : 'var(--surface)',
                  border: `1px solid ${current.justWrote === i ? 'var(--accent-border)' : 'var(--border)'}`,
                  color: 'var(--text-secondary)',
                }}>
                  <span>{m.key}</span><b style={{ color: 'var(--text-primary)' }}>{m.value}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </VizCard>
  )
}

export default function AgentLoopPlayground() {
  const presets = useMemo(() => [{ id: 'weather', label: '多城气温平均（工具循环）', state: {} }], [])
  const computeStepsFn = useCallback(() => computeSteps(), [])
  return (
    <PlaygroundShell
      initialState={{}}
      presets={presets}
      computeSteps={computeStepsFn}
      legend={[
        { color: 'var(--accent)', label: '当前环节 / 新写入记忆' },
        { color: '#f97316', label: '工具调用' },
        { color: '#10b981', label: '工具返回 / 最终答案' },
      ]}
      renderViz={({ current }) => <AgentViz current={current} />}
    />
  )
}
