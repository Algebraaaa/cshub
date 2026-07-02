import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const CATEGORIES = ['红', '蓝', '绿', '红', '绿', '蓝']
const COLOR_MAP = { '红': '#ef4444', '蓝': '#3b82f6', '绿': '#10b981' }

function computeSteps({ method }) {
  const steps = []
  const uniques = [...new Set(CATEGORIES)]
  const n = CATEGORIES.length

  // Step 1: 原始分类数据
  steps.push({
    description: '展示原始分类数据：6个样本的颜色类别',
    phase: 'original',
    categories: [...CATEGORIES],
    encoded: null,
    labelEncoded: null,
    highlightCol: -1,
    highlightRow: -1,
  })

  // Step 2: 识别唯一值
  steps.push({
    description: `发现 ${uniques.length} 个唯一类别：${uniques.join('、')}`,
    phase: 'identify',
    categories: [...CATEGORIES],
    encoded: null,
    labelEncoded: null,
    uniques,
    highlightCol: -1,
    highlightRow: -1,
  })

  if (method === 'onehot') {
    // 标准 One-Hot
    // Step 3: 创建二进制列
    steps.push({
      description: `为每个类别创建一列：${uniques.map(u => `is_${u}`).join('、')}`,
      phase: 'create_cols',
      categories: [...CATEGORIES],
      encoded: null,
      uniques,
      highlightCol: -1,
      highlightRow: -1,
    })

    // 逐步填充
    const encoded = CATEGORIES.map(() => uniques.map(() => 0))
    for (let i = 0; i < n; i++) {
      const catIdx = uniques.indexOf(CATEGORIES[i])
      encoded[i][catIdx] = 1
      steps.push({
        description: `样本 ${i + 1}: "${CATEGORIES[i]}" → ${uniques.map((u, j) => j === catIdx ? 1 : 0).join(', ')}`,
        phase: 'fill',
        categories: [...CATEGORIES],
        encoded: encoded.map(r => [...r]),
        uniques,
        highlightCol: catIdx,
        highlightRow: i,
      })
    }

    steps.push({
      description: 'One-Hot 编码完成！每个类别对应一列，所属类别为1',
      phase: 'result',
      categories: [...CATEGORIES],
      encoded: encoded.map(r => [...r]),
      uniques,
      highlightCol: -1,
      highlightRow: -1,
    })
  } else if (method === 'dummy') {
    // Dummy 编码（去掉第一个类别列）
    const dummyUniques = uniques.slice(1)
    steps.push({
      description: `Dummy编码：去掉第一个类别"${uniques[0]}"的列，仅保留 ${dummyUniques.map(u => `is_${u}`).join('、')}`,
      phase: 'create_cols',
      categories: [...CATEGORIES],
      encoded: null,
      uniques,
      dummyUniques,
      highlightCol: -1,
      highlightRow: -1,
    })

    const encoded = CATEGORIES.map(() => dummyUniques.map(() => 0))
    for (let i = 0; i < n; i++) {
      const catIdx = dummyUniques.indexOf(CATEGORIES[i])
      if (catIdx >= 0) encoded[i][catIdx] = 1
      steps.push({
        description: `样本 ${i + 1}: "${CATEGORIES[i]}" → [${dummyUniques.map((_, j) => encoded[i][j]).join(', ')}]`,
        phase: 'fill',
        categories: [...CATEGORIES],
        encoded: encoded.map(r => [...r]),
        uniques,
        dummyUniques,
        highlightCol: catIdx,
        highlightRow: i,
      })
    }

    steps.push({
      description: 'Dummy编码完成！比One-Hot少一列，避免共线性',
      phase: 'result',
      categories: [...CATEGORIES],
      encoded: encoded.map(r => [...r]),
      uniques,
      dummyUniques,
      highlightCol: -1,
      highlightRow: -1,
    })
  } else {
    // 标签编码对比
    const labelMap = {}
    uniques.forEach((u, i) => { labelMap[u] = i })
    steps.push({
      description: `标签编码：为每个类别分配整数编号 → ${uniques.map((u, i) => `${u}=${i}`).join('、')}`,
      phase: 'label_intro',
      categories: [...CATEGORIES],
      encoded: null,
      uniques,
      labelMap,
      highlightCol: -1,
      highlightRow: -1,
    })

    const labelEncoded = []
    for (let i = 0; i < n; i++) {
      labelEncoded.push(labelMap[CATEGORIES[i]])
      steps.push({
        description: `样本 ${i + 1}: "${CATEGORIES[i]}" → ${labelMap[CATEGORIES[i]]}`,
        phase: 'label_fill',
        categories: [...CATEGORIES],
        labelEncoded: [...labelEncoded],
        uniques,
        labelMap,
        highlightRow: i,
        highlightCol: -1,
      })
    }

    // 也展示 One-Hot 对比
    const oneHotEncoded = CATEGORIES.map(c => uniques.map(u => u === c ? 1 : 0))
    steps.push({
      description: '对比：标签编码引入了大小关系（红=0 < 蓝=1 < 绿=2），One-Hot则不会',
      phase: 'compare',
      categories: [...CATEGORIES],
      encoded: oneHotEncoded,
      labelEncoded: [...labelEncoded],
      uniques,
      labelMap,
      highlightCol: -1,
      highlightRow: -1,
    })
  }

  return steps
}

function SmallTable({ headers, rows, highlightRow, highlightCol, cellColor }) {
  const hs = {
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 700,
    border: '1px solid var(--border)',
    background: 'rgba(139,92,246,0.1)',
    color: 'var(--text-primary)',
    textAlign: 'center',
  }
  const cs = (ri, ci) => ({
    padding: '5px 12px',
    fontSize: 12,
    border: '1px solid var(--border)',
    textAlign: 'center',
    background: ri === highlightRow && ci === highlightCol
      ? 'rgba(16,185,129,0.2)'
      : 'var(--surface)',
    color: ri === highlightRow && ci === highlightCol
      ? '#10b981'
      : 'var(--text-primary)',
    fontWeight: ri === highlightRow && ci === highlightCol ? 700 : 400,
    transition: 'background 0.3s',
  })
  return (
    <table style={{ borderCollapse: 'collapse' }}>
      <thead><tr>{headers.map((h, i) => <th key={i} style={hs}>{h}</th>)}</tr></thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((v, ci) => (
              <td key={ci} style={cs(ri, ci)}>
                {v !== null && v !== undefined ? String(v) : ''}
                {cellColor && v && typeof v === 'string' && COLOR_MAP[v] && (
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: COLOR_MAP[v], marginLeft: 4, verticalAlign: 'middle' }} />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function OneHotEncodingPlayground() {
  const presets = useMemo(() => [
    { id: 'onehot', label: '标准One-Hot', state: { method: 'onehot' } },
    { id: 'dummy', label: 'Dummy编码', state: { method: 'dummy' } },
    { id: 'label', label: '标签编码对比', state: { method: 'label' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ method: 'onehot' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: '原始类别' },
        { color: '#10b981', label: '编码结果' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, overflowX: 'auto' }}>
            {/* 标签编码行 */}
            {(current.phase === 'label_fill' || current.phase === 'compare' || current.phase === 'label_intro') && current.labelEncoded && (
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, textAlign: 'center' }}>标签编码</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <SmallTable
                    headers={['#', '颜色', '编码值']}
                    rows={current.labelEncoded.map((v, i) => [i + 1, current.categories[i], v])}
                    highlightRow={current.highlightRow}
                    highlightCol={2}
                  />
                </div>
              </div>
            )}

            {/* One-Hot / Dummy 表格 */}
            {current.encoded && (
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, textAlign: 'center' }}>
                  {current.dummyUniques ? 'Dummy编码' : 'One-Hot编码'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <SmallTable
                    headers={['#', '颜色', ...(current.dummyUniques || current.uniques).map(u => `is_${u}`)]}
                    rows={current.encoded.map((row, i) => [i + 1, current.categories[i], ...row])}
                    highlightRow={current.highlightRow}
                    highlightCol={current.highlightCol !== -1 ? current.highlightCol + 2 : -1}
                    cellColor
                  />
                </div>
              </div>
            )}

            {/* 无编码时展示原始数据 */}
            {!current.encoded && !current.labelEncoded && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <SmallTable
                  headers={['#', '颜色']}
                  rows={current.categories.map((c, i) => [i + 1, c])}
                  highlightRow={-1}
                  highlightCol={-1}
                  cellColor
                />
              </div>
            )}

            {/* 唯一值指示 */}
            {current.uniques && current.phase === 'identify' && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {current.uniques.map(u => (
                  <span key={u} style={{ padding: '2px 10px', background: `${COLOR_MAP[u]}20`, border: `1px solid ${COLOR_MAP[u]}40`, borderRadius: 4, fontSize: 12, color: 'var(--text-primary)' }}>
                    {u}
                  </span>
                ))}
              </div>
            )}
          </div>
        </VizCard>
      )}
    />
  )
}
