import { useState, useMemo } from 'react'
import PageReplacementViz from '../PageReplacementViz'
import StepController, { useStepController } from '../StepController'
import VizCard from './VizCard'
import { Toolbar, ToolbarBtn, TextInput, Legend } from './shared'

function randomPages(n = 15, maxPage = 5) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * maxPage) + 1)
}

const LEGEND = [
  { color: 'var(--accent)', label: '当前访问' },
  { color: 'var(--red)', label: '缺页 (不命中)' },
  { color: 'var(--green)', label: '缓存命中' },
]

export default function PageReplacementPlayground({ algoFn }) {
  const [seqLen, setSeqLen] = useState(15)
  const [maxPage, setMaxPage] = useState(5)
  const [pages, setPages] = useState(() => randomPages(15, 5))
  const [text, setText] = useState('')
  const [capacity, setCapacity] = useState(3)

  const steps = useMemo(() => algoFn(pages, capacity), [algoFn, pages, capacity])
  const ctrl = useStepController(steps)
  const current = steps[ctrl.step]

  function applyCustom() {
    const parsed = text.split(/[\s,]+/).map(Number).filter(n => !isNaN(n) && n > 0)
    if (parsed.length > 0) { setPages(parsed); ctrl.reset() }
  }

  return (
    <div>
      <Toolbar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-high)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>序列长度:</span>
          <input 
            type="number" 
            value={seqLen} 
            onChange={e => setSeqLen(Math.max(1, Number(e.target.value)))} 
            style={{ width: 60, background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: '13px', outline: 'none' }} 
          />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '4px' }}>页面种类数:</span>
          <input 
            type="number" 
            value={maxPage} 
            onChange={e => setMaxPage(Math.max(1, Number(e.target.value)))} 
            style={{ width: 60, background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: '13px', outline: 'none' }} 
          />
          <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }} />
          <ToolbarBtn onClick={() => { setPages(randomPages(seqLen, maxPage)); ctrl.reset() }}>
            🎲 生成随机序列
          </ToolbarBtn>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>内存帧数:</span>
          {[2, 3, 4, 5].map(cap => (
            <button
              key={cap}
              onClick={() => { setCapacity(cap); ctrl.reset() }}
              style={{
                background: capacity === cap ? 'var(--accent)' : 'var(--surface)',
                color: capacity === cap ? '#fff' : 'var(--text-primary)',
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
        <div style={{ flex: 1 }} />
        <TextInput value={text} onChange={setText} placeholder="自定义：1 2 3 4 1 2 5"
          onSubmit={applyCustom} submitLabel="应用" />
      </Toolbar>

      <VizCard borderRadius={10} padding="24px 16px" noInner>
        <PageReplacementViz stepData={current} steps={steps} />
      </VizCard>

      <Legend items={LEGEND} />

      <StepController total={steps.length} ctrl={ctrl}
        description={current?.description} />
    </div>
  )
}
