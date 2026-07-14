import NQueensViz from '../NQueensViz'
import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'

export default function NQueensPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={{ n: 4 }}
      computeSteps={algoFn}
      extraToolbar={({ state, setState, ctrl }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-high)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>棋盘大小 (N):</span>
          <select
            value={state.n}
            onChange={(e) => { setState({ n: Number(e.target.value) }); ctrl.reset() }}
            style={{ width: 60, background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: '13px', outline: 'none' }}
          >
            {[4, 5, 6, 8].map(k => (
              <option key={k} value={k}>{k}x{k}</option>
            ))}
          </select>
        </div>
      )}
      renderViz={({ current, state }) => (
        <VizCard borderRadius={8} padding={16} noInner style={{ display: 'flex', justifyContent: 'center' }}>
          {current && <NQueensViz data={current} nSize={state.n} />}
        </VizCard>
      )}
    />
  )
}
