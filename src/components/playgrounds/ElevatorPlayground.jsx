import PlaygroundShell from './PlaygroundShell'
import ElevatorViz from '../ElevatorViz'
import VizCard from './VizCard'

function parseRequests(str) {
  return str.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
}

export default function ElevatorPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={{ requestsStr: '5, 18, 3, 12, 14, 21, 6, 8', initialHead: 10, maxTrack: 21 }}
      derivePayload={state => ({
        reqs: parseRequests(state.requestsStr),
        initialHead: state.initialHead,
        maxTrack: state.maxTrack,
      })}
      // 传递 maxTrack 以及根据需要传递 direction 给 SCAN 算法
      computeSteps={({ reqs, initialHead, maxTrack }) => (
        reqs.length === 0 ? [] : algoFn(reqs, initialHead, maxTrack, 'up')
      )}
      extraToolbar={({ state, setState }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 80 }}>请求楼层:</span>
            <input
              value={state.requestsStr}
              onChange={e => setState(s => ({ ...s, requestsStr: e.target.value }))}
              style={{ flex: 1, padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 80 }}>初始楼层:</span>
            <input
              type="number"
              value={state.initialHead}
              onChange={e => setState(s => ({ ...s, initialHead: parseInt(e.target.value) || 0 }))}
              style={{ width: 80, padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }}
            />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 60, marginLeft: 20 }}>最高楼层:</span>
            <input
              type="number"
              value={state.maxTrack}
              onChange={e => setState(s => ({ ...s, maxTrack: parseInt(e.target.value) || 200 }))}
              style={{ width: 80, padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      )}
      renderViz={({ current, state }) => (
        <VizCard borderRadius={8} padding={16} noInner>
          {current && <ElevatorViz state={current} maxTrack={state.maxTrack} />}
        </VizCard>
      )}
      // scan.js 的 description 用"磁头/磁道"措辞，电梯语境下改用楼层措辞
      deriveDescription={({ current }) => (
        current ? `当前楼层: ${current.currentHead} ${current.targetTrack != null ? '-> 目标: ' + current.targetTrack : ''}` : '等待运行'
      )}
    />
  )
}
