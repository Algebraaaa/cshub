import { useState, useMemo } from 'react'
import StepController, { useStepController } from '../StepController'
import ElevatorViz from '../ElevatorViz'
import VizCard from './VizCard'

export default function ElevatorPlayground({ algoFn }) {
  const [requestsStr, setRequestsStr] = useState('5, 18, 3, 12, 14, 21, 6, 8')
  const [initialHead, setInitialHead] = useState(10)
  const [maxTrack, setMaxTrack] = useState(21)

  const parseRequests = (str) => {
    return str.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  }

  const reqs = useMemo(() => parseRequests(requestsStr), [requestsStr])
  
  const steps = useMemo(() => {
    if (reqs.length === 0) return []
    // 传递 maxTrack 以及根据需要传递 direction 给 SCAN 算法
    return algoFn(reqs, initialHead, maxTrack, 'up')
  }, [algoFn, reqs, initialHead, maxTrack])

  const ctrl = useStepController(steps)
  const currentStepData = steps[ctrl.step] || null

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 80 }}>请求楼层:</span>
            <input 
              value={requestsStr}
              onChange={e => setRequestsStr(e.target.value)}
              style={{ flex: 1, padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
             <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 80 }}>初始楼层:</span>
             <input 
              type="number"
              value={initialHead}
              onChange={e => setInitialHead(parseInt(e.target.value) || 0)}
              style={{ width: 80, padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }}
            />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 60, marginLeft: 20 }}>最高楼层:</span>
             <input 
              type="number"
              value={maxTrack}
              onChange={e => setMaxTrack(parseInt(e.target.value) || 200)}
              style={{ width: 80, padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </div>

      <VizCard borderRadius={8} padding={16} noInner>
        {currentStepData && (
          <ElevatorViz state={currentStepData} maxTrack={maxTrack} />
        )}
      </VizCard>

      <div style={{ marginTop: 16 }}>
        <StepController 
          total={steps.length} 
          ctrl={ctrl}
          description={currentStepData ? `当前楼层: ${currentStepData.currentHead} ${currentStepData.targetTrack != null ? '-> 目标: ' + currentStepData.targetTrack : ''}` : '等待运行'} 
        />
      </div>
    </div>
  )
}
