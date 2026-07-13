import { useMemo } from 'react'
import StepController, { useStepController } from '../StepController'
import VizCard from './VizCard'
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
      <VizCard
        borderRadius={10}
        padding="24px 20px"
        minHeight={minHeight}
        noInner
        style={frameStyle}
      >
        {renderViz({ current, steps, stepIndex: ctrl.step })}
      </VizCard>

      {legend && <Legend items={legend} />}

      <StepController total={steps.length} ctrl={ctrl}
        description={current?.description} />
    </div>
  )
}
