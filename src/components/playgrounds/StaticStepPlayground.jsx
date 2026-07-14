import { useCallback } from 'react'
import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'

export default function StaticStepPlayground({
  algoFn,
  legend,
  minHeight = 360,
  frameStyle,
  renderViz,
}) {
  // algoFn 本身不吃 payload(无 preset/initialState 场景);包一层丢弃 Shell 传入的
  // payload,保持与旧版 useMemo(() => algoFn(), [algoFn]) 完全一致的记忆化语义。
  const computeSteps = useCallback(() => algoFn(), [algoFn])

  return (
    <PlaygroundShell
      computeSteps={computeSteps}
      legend={legend}
      renderViz={({ current, steps, currentStep }) => (
        <VizCard
          borderRadius={10}
          padding="24px 20px"
          minHeight={minHeight}
          noInner
          style={frameStyle}
        >
          {renderViz({ current, steps, stepIndex: currentStep })}
        </VizCard>
      )}
    />
  )
}
