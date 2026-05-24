import { useState, useMemo } from 'react'
import StepController, { useStepController } from '../StepController'
import DiskViz from '../DiskViz'

export default function DiskPlayground({ algoFn }) {
  const [requestsStr, setRequestsStr] = useState('98, 183, 37, 122, 14, 124, 65, 67')
  const [initialHead, setInitialHead] = useState(53)
  const [maxTrack, setMaxTrack] = useState(200)

  const parseRequests = (str) => {
    return str.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  }

  const reqs = useMemo(() => parseRequests(requestsStr), [requestsStr])
  
  const steps = useMemo(() => {
    if (reqs.length === 0) return []
    // 增加 maxTrack 传参给支持最大磁道边界的算法，例如 SCAN
    return algoFn(reqs, initialHead, maxTrack)
  }, [algoFn, reqs, initialHead, maxTrack])

  const ctrl = useStepController(steps)
  const currentStepData = steps[ctrl.step] || null

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 80 }}>请求序列:</span>
            <input 
              value={requestsStr}
              onChange={e => setRequestsStr(e.target.value)}
              style={{ flex: 1, padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
             <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 80 }}>初始磁头:</span>
             <input 
              type="number"
              value={initialHead}
              onChange={e => setInitialHead(parseInt(e.target.value) || 0)}
              style={{ width: 80, padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }}
            />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 60, marginLeft: 20 }}>最大磁道:</span>
             <input 
              type="number"
              value={maxTrack}
              onChange={e => setMaxTrack(parseInt(e.target.value) || 200)}
              style={{ width: 80, padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </div>

      <div style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
        {currentStepData && (
          <DiskViz state={currentStepData} maxTrack={maxTrack} />
        )}
      </div>

      <div style={{ marginTop: 16 }}>
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
          reset={ctrl.reset} seek={ctrl.seek}
          description={`当前磁头: ${currentStepData?.currentHead} ${currentStepData?.targetTrack != null ? `-> 目标: ${currentStepData?.targetTrack}` : ''}`} 
        />
      </div>
    </div>
  )
}
