import { useState, useMemo, useCallback } from 'react'
import StepController, { useStepController } from '../StepController'
import { Toolbar, ToolbarBtn, Legend } from './shared'

// ─────────────────────────────────────────────────────────────
// PlaygroundShell · 模板方法（Template Method）
//
// 两种模式：
//
// 1) 静态 preset（向后兼容，HashJoin/Floyd/Topo 在用）
//    每个 preset 自身即 payload，点击切换 preset 触发重新计算步骤。
//
//      <PlaygroundShell
//        presets={[{ id, label, ...payload }]}
//        computeSteps={payload => steps}
//        renderViz={({ current, ctrl }) => <Viz/>}
//      />
//
// 2) 受控输入态（新增，适配 Sorting/Knapsack/LCS 等"用户输入决定 payload"的场景）
//    显式传 `initialState`，preset 改成"对 state 的 patch"。
//
//      <PlaygroundShell
//        initialState={{ arr: [3,1,2], text: '' }}
//        presets={[{ id, label, state: { arr: [...] } }]}
//        derivePayload={state => ({ arr: state.arr })}    // 可省略，默认 identity
//        computeSteps={payload => steps}
//        extraToolbar={({ state, setState, ctrl }) => <CustomInput/>}
//        renderViz={({ current, state, ctrl }) => <Viz/>}
//      />
//
// 共用 props：toolbarRight、initialPresetId、legend（自动渲染）、children（viz 与 controller 之间）。
// extraToolbar 接受 ReactNode 或函数 ({ state, setState, ctrl }) => ReactNode。
// ─────────────────────────────────────────────────────────────

export default function PlaygroundShell({
  presets = [],
  initialState,
  derivePayload,
  computeSteps,
  renderViz,
  initialPresetId,
  toolbarRight,
  extraToolbar,
  legend,
  children,
}) {
  const stateful = initialState !== undefined
  const [state, setState] = useState(initialState)
  const firstId = initialPresetId || presets[0]?.id
  const [presetId, setPresetId] = useState(firstId)
  const activePreset = presets.find(p => p.id === presetId) || presets[0]

  const payload = stateful
    ? (derivePayload ? derivePayload(state) : state)
    : activePreset

  // 没有 preset / initialState 时 payload 为 null——computeSteps 可忽略入参直接返回固定步骤。
  const steps = useMemo(() => computeSteps(payload), [computeSteps, payload])
  const ctrl = useStepController(steps)
  const current = steps[ctrl.step]

  const selectPreset = useCallback((p) => {
    setPresetId(p.id)
    if (stateful) {
      const patch = typeof p.state === 'function' ? p.state(state) : p.state
      if (patch) setState(prev => ({ ...prev, ...patch }))
    }
    ctrl.reset()
  }, [stateful, state, ctrl])

  const renderedExtraToolbar = typeof extraToolbar === 'function'
    ? extraToolbar({ state, setState, ctrl })
    : extraToolbar

  if (!current) {
    return (
      <div className="rounded-glass-md border border-border-soft bg-surface p-4 text-sm text-fg-faint">
        没有可演示的步骤。
      </div>
    )
  }

  return (
    <div>
      {(presets.length > 0 || renderedExtraToolbar || toolbarRight) && (
        <Toolbar>
          {presets.map(p => (
            <ToolbarBtn key={p.id} active={p.id === presetId} onClick={() => selectPreset(p)}>
              {p.label}
            </ToolbarBtn>
          ))}
          {renderedExtraToolbar && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {renderedExtraToolbar}
            </div>
          )}
          <div style={{ flex: 1 }} />
          {toolbarRight}
        </Toolbar>
      )}

      {renderViz({ current, currentStep: ctrl.step, total: steps.length, presetId, state, ctrl })}

      {legend && <Legend items={legend} />}

      {children}

      <StepController total={steps.length}
        step={ctrl.step} playing={ctrl.playing} speed={ctrl.speed} setSpeed={ctrl.setSpeed}
        play={ctrl.play} stop={ctrl.stop} prev={ctrl.prev} goNext={ctrl.goNext}
        reset={ctrl.reset} seek={ctrl.seek}
        description={current.description} />
    </div>
  )
}
