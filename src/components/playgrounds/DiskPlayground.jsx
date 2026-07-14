import PlaygroundShell from './PlaygroundShell'
import DiskViz from '../DiskViz'
import VizCard from './VizCard'

function parseRequests(str) {
  return str.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
}

export default function DiskPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={{ requestsStr: '98, 183, 37, 122, 14, 124, 65, 67', initialHead: 53, maxTrack: 200 }}
      derivePayload={state => ({
        reqs: parseRequests(state.requestsStr),
        initialHead: state.initialHead,
        maxTrack: state.maxTrack,
      })}
      // 增加 maxTrack 传参给支持最大磁道边界的算法，例如 SCAN
      computeSteps={({ reqs, initialHead, maxTrack }) => (
        reqs.length === 0 ? [] : algoFn(reqs, initialHead, maxTrack)
      )}
      extraToolbar={({ state, setState }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 80 }}>请求序列:</span>
            <input
              value={state.requestsStr}
              onChange={e => setState(s => ({ ...s, requestsStr: e.target.value }))}
              style={{ flex: 1, padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 80 }}>初始磁头:</span>
            <input
              type="number"
              value={state.initialHead}
              onChange={e => setState(s => ({ ...s, initialHead: parseInt(e.target.value) || 0 }))}
              style={{ width: 80, padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)' }}
            />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 60, marginLeft: 20 }}>最大磁道:</span>
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
          {current && <DiskViz state={current} maxTrack={state.maxTrack} />}
        </VizCard>
      )}
    />
  )
}
