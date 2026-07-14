import PageReplacementViz from '../PageReplacementViz'
import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import { ToolbarBtn, TextInput } from './shared'

function randomPages(n = 15, maxPage = 5) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * maxPage) + 1)
}

const LEGEND = [
  { color: 'var(--accent)', label: '当前访问' },
  { color: 'var(--red)', label: '缺页 (不命中)' },
  { color: 'var(--green)', label: '缓存命中' },
]

export default function PageReplacementPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={{ seqLen: 15, maxPage: 5, pages: randomPages(15, 5), capacity: 3, text: '' }}
      derivePayload={state => ({ pages: state.pages, capacity: state.capacity })}
      computeSteps={({ pages, capacity }) => algoFn(pages, capacity)}
      legend={LEGEND}
      extraToolbar={({ state, setState, ctrl }) => {
        function applyCustom() {
          const parsed = state.text.split(/[\s,]+/).map(Number).filter(n => !isNaN(n) && n > 0)
          if (parsed.length > 0) { setState(s => ({ ...s, pages: parsed })); ctrl.reset() }
        }
        return (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-high)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>序列长度:</span>
              <input
                type="number"
                value={state.seqLen}
                onChange={e => setState(s => ({ ...s, seqLen: Math.max(1, Number(e.target.value)) }))}
                style={{ width: 60, background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: '13px', outline: 'none' }}
              />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '4px' }}>页面种类数:</span>
              <input
                type="number"
                value={state.maxPage}
                onChange={e => setState(s => ({ ...s, maxPage: Math.max(1, Number(e.target.value)) }))}
                style={{ width: 60, background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: '13px', outline: 'none' }}
              />
              <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }} />
              <ToolbarBtn onClick={() => { setState(s => ({ ...s, pages: randomPages(s.seqLen, s.maxPage) })); ctrl.reset() }}>
                🎲 生成随机序列
              </ToolbarBtn>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>内存帧数:</span>
              {[2, 3, 4, 5].map(cap => (
                <button
                  key={cap}
                  onClick={() => { setState(s => ({ ...s, capacity: cap })); ctrl.reset() }}
                  style={{
                    background: state.capacity === cap ? 'var(--accent)' : 'var(--surface)',
                    color: state.capacity === cap ? '#fff' : 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {cap}
                </button>
              ))}
            </div>
            <TextInput value={state.text} onChange={v => setState(s => ({ ...s, text: v }))}
              placeholder="自定义：1 2 3 4 1 2 5"
              onSubmit={applyCustom} submitLabel="应用" />
          </>
        )
      }}
      renderViz={({ current, steps }) => (
        <VizCard borderRadius={10} padding="24px 16px" noInner>
          <PageReplacementViz stepData={current} steps={steps} />
        </VizCard>
      )}
    />
  )
}
