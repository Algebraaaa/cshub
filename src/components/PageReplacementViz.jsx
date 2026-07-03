export default function PageReplacementViz({ stepData, steps }) {
  if (!stepData) return null
  const { pages, frames, currentIndex, fault, capacity, faults } = stepData

  const isFinished = currentIndex === pages.length
  const totalProcessed = isFinished ? pages.length : Math.max(0, currentIndex + (fault === null ? 0 : 1))
  const hits = totalProcessed - faults
  const hitRate = totalProcessed > 0 ? ((hits / totalProcessed) * 100).toFixed(1) : '0.0'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '16px 0' }}>
      {/* Pages Sequence */}
      <div>
        <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
          <span>访问序列</span>
          {isFinished && (
            <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>命中率: {hitRate}% ({hits}/{pages.length})</span>
          )}
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {pages.map((p, i) => {
            const isCurrent = i === currentIndex
            const isPast = i < currentIndex
            
            let bg = 'var(--surface)'
            let borderColor = 'var(--border)'
            let shadow = 'none'
            let color = 'var(--text-primary)'
            let borderThickness = isCurrent ? '2px' : '1px'

            if (isCurrent) {
              bg = 'var(--accent)'
              borderColor = 'var(--accent-light)'
              shadow = '0 0 12px var(--accent-soft)'
              color = '#fff'
            } else if (isPast) {
              let isHit;
              if (steps && steps[i + 1]) {
                isHit = !steps[i + 1].fault
              } else {
                isHit = false
              }
              bg = isHit ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
              borderColor = isHit ? 'var(--green)' : 'var(--red)'
              color = '#fff'
            }

            return (
              <div
                key={i}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: bg,
                  color: color,
                  boxShadow: shadow,
                  borderRadius: '6px',
                  border: `${borderThickness} solid ${borderColor}`,
                  fontWeight: isCurrent ? 'bold' : 'normal',
                  transition: 'all 0.3s ease'
                }}
              >
                {p}
              </div>
            )
          })}
        </div>
      </div>

      {/* Memory Frames */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
          <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>内存帧 (容量 {capacity})</h4>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
            缺页次数: <span style={{ color: 'var(--red)' }}>{faults}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {Array.from({ length: capacity }).map((_, i) => {
            const pageInFrame = frames[i]
            const isNewlyInserted = fault && currentIndex >= 0 && pages[currentIndex] === pageInFrame
            const isHit = !fault && currentIndex >= 0 && pages[currentIndex] === pageInFrame

            return (
              <div
                key={`frame-${i}`}
                style={{
                  width: '64px',
                  height: '80px',
                  background: 'var(--surface)',
                  border: `2px solid ${isNewlyInserted ? 'var(--red)' : isHit ? 'var(--green)' : 'var(--border)'}`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: pageInFrame !== undefined ? 'var(--text-primary)' : 'transparent',
                  boxShadow: isNewlyInserted ? '0 0 12px rgba(239, 68, 68, 0.4)' : isHit ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                  position: 'relative'
                }}
              >
                  {pageInFrame !== undefined && (
                    // key 换值即重挂载 → 新调入的页播放 pop 入场(换出/换入一目了然)
                    <div
                      key={pageInFrame}
                      style={{ animation: 'pop 0.3s ease-out' }}
                    >
                      {pageInFrame}
                    </div>
                  )}
                <div style={{ position: 'absolute', bottom: -24, fontSize: '12px', color: 'var(--text-secondary)' }}>
                  帧 {i}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
