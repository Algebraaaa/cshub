import { useMemo } from 'react'
import StepController, { useStepController } from '../StepController'
import { Legend } from './shared'

export default function StaticStepPlayground({
  algoFn,
  legend,
  minHeight = 360,
  frameStyle,
  renderViz,
}) {
  const steps = useMemo(() => algoFn(), [algoFn])
  const ctrl = useStepController(steps)
  const current = steps[ctrl.step]

  return (
    <div>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        marginBottom: 16,
        padding: '24px 20px',
        overflowX: 'auto',
        minHeight,
        ...frameStyle,
      }}>
        {renderViz({ current, steps, stepIndex: ctrl.step })}
      </div>

      {legend && <Legend items={legend} />}

      <StepController total={steps.length} step={ctrl.step} playing={ctrl.playing}
        speed={ctrl.speed} setSpeed={ctrl.setSpeed}
        play={ctrl.play} stop={ctrl.stop} prev={ctrl.prev} goNext={ctrl.goNext} reset={ctrl.reset} seek={ctrl.seek}
        description={current?.description} />
    </div>
  )
}
