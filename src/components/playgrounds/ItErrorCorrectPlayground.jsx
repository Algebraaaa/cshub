import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import FormulaPanel from './FormulaPanel'

const LINES = [
  '汉明码 Hamming(7,4): 4 位数据 → 7 位码字',
  '位置: 1(r1) 2(r2) 3(d1) 4(r4) 5(d2) 6(d3) 7(d4)',
  'r1 = d1 ⊕ d2 ⊕ d4   // 奇位覆盖',
  'r2 = d1 ⊕ d3 ⊕ d4   // 2-3, 6-7 覆盖',
  'r4 = d2 ⊕ d3 ⊕ d4   // 4-7 覆盖',
  '编码完成：[r1,r2,d1,r4,d2,d3,d4]',
  '// 传输中某一位翻转',
  '译码：s1 s2 s3 = 重算校验值异或接收值',
  'S = s3·4 + s2·2 + s1，指向出错位置（0=无错）',
  '翻转该位完成纠错，提取数据位',
]

const PRESETS = [
  { id: 'p1', label: '数据 1011', state: { data: [1, 0, 1, 1] } },
  { id: 'p2', label: '数据 0000', state: { data: [0, 0, 0, 0] } },
  { id: 'p3', label: '数据 1111', state: { data: [1, 1, 1, 1] } },
]

export default function ItErrorCorrectPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={PRESETS}
      initialState={{ data: [1, 0, 1, 1] }}
      derivePayload={s => ({ data: s.data })}
      computeSteps={payload => algoFn(payload)}
      renderViz={({ current }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 440 }}>
          <VizCard>
            <ErrorCorrectViz current={current} />
          </VizCard>
          <FormulaPanel lines={LINES} highlightLine={current.highlightLine} />
        </div>
      )}
    />
  )
}

function ErrorCorrectViz({ current }) {
  const { d, encoded, received, errorPos, s1, s2, s3, syndrome, corrected } = current
  const W = 400, He = 360
  const posLabels = ['1(r1)', '2(r2)', '3(d1)', '4(r4)', '5(d2)', '6(d3)', '7(d4)']
  const isCheck = [true, true, false, true, false, false, false]

  // 当前高亮的位
  const phaseMap = {
    data: [-1],
    r1: [0],
    r2: [1],
    r4: [3],
    encode: [-1],
    error: [errorPos],
    s1: [0, 2, 4, 6],
    s2: [1, 2, 5, 6],
    s3: [3, 4, 5, 6],
    syndrome: [syndrome > 0 ? syndrome - 1 : -1],
    done: [-1],
  }
  const hlBits = phaseMap[current.phase] || []

  return (
    <svg viewBox={`0 0 ${W} ${He}`} style={{ width: '100%', height: 'auto', maxHeight: 380 }}>
      {/* 数据输入 */}
      <g transform="translate(20, 25)">
        <text x="0" y="0" fontSize="11" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" fontWeight="700">4 位数据 d₁d₂d₃d₄：</text>
        {d.map((v, i) => (
          <g key={i} transform={`translate(${i * 40 + 2}, 14)`}>
            <rect width="36" height="30" rx="4" fill="var(--accent-soft)" stroke="var(--accent-border)" />
            <text x="18" y="21" fontSize="16" textAnchor="middle" fill="var(--accent-light)" fontFamily="var(--font-mono)" fontWeight="800">{v}</text>
          </g>
        ))}
      </g>
      {/* 编码 */}
      <g transform="translate(10, 90)">
        <text x="0" y="0" fontSize="11" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" fontWeight="700">7 位编码：</text>
        {encoded.map((v, i) => {
          const highlight = hlBits.includes(i)
          const isErr = errorPos === i
          return (
            <g key={i} transform={`translate(${i * 54 + 2}, 14)`} style={{ transition: 'all 0.3s' }}>
              <rect width="50" height="38" rx="5"
                    fill={highlight ? (isCheck[i] ? 'rgba(251,191,36,0.3)' : 'var(--accent-soft)') : 'var(--surface)'}
                    stroke={highlight ? 'var(--yellow)' : isErr ? 'var(--red)' : 'var(--border)'}
                    strokeWidth={highlight || isErr ? 2.5 : 1}
                    style={{ filter: highlight ? 'drop-shadow(0 0 6px var(--yellow))' : isErr ? 'drop-shadow(0 0 6px var(--red))' : 'none' }} />
              <text x="25" y="14" fontSize="9" textAnchor="middle" fill="var(--text-tertiary)" fontFamily="var(--font-mono)">{posLabels[i]}</text>
              <text x="25" y="30" fontSize="16" textAnchor="middle"
                    fill={isErr ? 'var(--red)' : highlight ? 'var(--yellow)' : 'var(--text-primary)'}
                    fontFamily="var(--font-mono)" fontWeight="800">{v}</text>
            </g>
          )
        })}
      </g>
      {/* 信道错误 */}
      <g transform="translate(10, 160)">
        <text x="0" y="0" fontSize="11" fill="var(--text-tertiary)" fontFamily="var(--font-mono)" fontWeight="700">
          接收码字 {errorPos >= 0 ? `(位 ${errorPos + 1} 被翻转)` : ''}：
        </text>
        {received.map((v, i) => {
          const isErr = errorPos === i
          return (
            <g key={i} transform={`translate(${i * 54 + 2}, 14)`}>
              <rect width="50" height="34" rx="5"
                    fill={isErr ? 'rgba(248,113,113,0.2)' : 'var(--surface)'}
                    stroke={isErr ? 'var(--red)' : 'var(--border)'}
                    strokeWidth={isErr ? 2.5 : 1}
                    style={{ filter: isErr ? 'drop-shadow(0 0 6px var(--red))' : 'none' }} />
              <text x="25" y="22" fontSize="15" textAnchor="middle"
                    fill={isErr ? 'var(--red)' : 'var(--text-primary)'} fontFamily="var(--font-mono)" fontWeight="800">{v}</text>
            </g>
          )
        })}
      </g>
      {/* 校验子与纠错 */}
      <g transform="translate(20, 230)">
        <rect width={W - 40} height="116" rx="6" fill="var(--surface)" stroke="var(--border)" />
        <text x="10" y="18" fontSize="11" fill="var(--text-primary)" fontFamily="var(--font-mono)" fontWeight="700">
          译码计算：
        </text>
        <text x="10" y="38" fontSize="11" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
          s₁ = r1⊕d1⊕d2⊕d4 = {s1}    s₂ = r2⊕d1⊕d3⊕d4 = {s2}    s₃ = r4⊕d2⊕d3⊕d4 = {s3}
        </text>
        <text x="10" y="60" fontSize="12" fill={syndrome > 0 ? 'var(--red)' : 'var(--green)'} fontFamily="var(--font-mono)" fontWeight="800">
          校验子 S = s₃s₂s₁ = {s3}{s2}{s1} = {syndrome} → {syndrome === 0 ? '无错误 ✓' : `第 ${syndrome} 位出错`}
        </text>
        {corrected && (
          <>
            <text x="10" y="82" fontSize="11" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
              纠正后：[{corrected.join(', ')}]
            </text>
            <text x="10" y="102" fontSize="11" fill="var(--green)" fontFamily="var(--font-mono)" fontWeight="700">
              提取数据 d₁d₂d₃d₄ = [{corrected[2]}, {corrected[4]}, {corrected[5]}, {corrected[6]}]  ✓ 与原始一致
            </text>
          </>
        )}
      </g>
    </svg>
  )
}
