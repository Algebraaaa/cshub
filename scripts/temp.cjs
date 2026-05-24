const fs = require('fs');
const txt = `import React, { useState, useMemo } from 'react'
import NQueensViz from '../NQueensViz'
import StepController, { useStepController } from '../StepController'
import { Toolbar } from './shared'

export default function NQueensPlayground({ algoFn }) {
  const [nSize, setNSize] = useState(4)

  const steps = useMemo(() => algoFn({ n: nSize }), [algoFn, nSize])
  const ctrl = useStepController(steps)
  const currentStepData = steps[ctrl.step]

  return (
    <div>
      <Toolbar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-high)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>棋盘大小 (N):</span>
          <select 
            value={nSize}
            onChange={(e) => { setNSize(Number(e.target.value)); ctrl.reset(); }}
            style={{ width: 60, background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: '13px', outline: 'none' }} 
          >
            {[4, 5, 6, 8].map(k => (
              <option key={k} value={k}>{k}x{k}</option>
            ))}
          </select>
        </div>
      </Toolbar>

      <div style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        {currentStepData && <NQueensViz state={currentStepData} nSize={nSize} />}
      </div>

      <StepController 
        total={steps.length} 
        step={ctrl.step} 
        playing={ctrl.playing}
        speed={ctrl.speed} 
        setSpeed={ctrl.setSpeed}
        play={ctrl.play} 
        stop={ctrl.stop} 
        prev={ctrl.prev} 
        goNext={ctrl.goNext} 
        reset={ctrl.reset}
        description={currentStepData?.description} 
      />
    </div>
  )
}`
fs.writeFileSync('src/components/playgrounds/NQueensPlayground.jsx', txt);
