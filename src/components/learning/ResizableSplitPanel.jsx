import { useState, useRef } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useDrag } from '../../hooks/useDrag'

/**
 * ResizableSplitPanel - iPad 风格可调节分割面板
 * 支持拖动分割线调整左右面板的宽度
 *
 * 特性：
 * - 平滑的拖动体验（由 useDrag 统一处理 mousedown / mousemove / mouseup + 触屏）
 * - 最小宽度限制防止面板太小
 * - localStorage 持久化用户偏好（由 useLocalStorage 统一处理）
 * - 自适应响应式设计
 */
export default function ResizableSplitPanel({
  left,
  right,
  storageKey = 'split-panel-ratio',
  minWidth = 200,
  defaultRatio = 0.5,
}) {
  const [ratio, setRatio] = useLocalStorage(storageKey, defaultRatio)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)

  // useDrag 抽出 mousedown → 全局 mousemove/up → cleanup 模板
  const handleMouseDown = useDrag({
    cursor: 'col-resize',
    onStart: () => setIsDragging(true),
    onEnd:   () => setIsDragging(false),
    onMove:  (e) => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const newX = e.clientX - rect.left
      const clampedX = Math.max(minWidth, Math.min(newX, rect.width - minWidth - 16))
      setRatio(clampedX / rect.width)
    },
  })
  
  const leftWidth = ratio * 100
  const rightWidth = (1 - ratio) * 100
  
  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        width: '100%',
        minHeight: '100%',
        flex: '1 1 auto',
        overflow: 'visible',
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      {/* 左侧面板 */}
      <div
        style={{
          flex: `0 0 ${leftWidth}%`,
          minWidth: 0,
          overflow: 'visible',
          transition: isDragging ? 'none' : 'flex 0.15s',
        }}
      >
        {left}
      </div>
      
      {/* 分割线 */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        style={{
          width: 8,
          flex: '0 0 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--border)',
          cursor: 'col-resize',
          transition: isDragging ? 'none' : 'all 0.2s',
          position: 'relative',
          userSelect: 'none',
          opacity: isDragging ? 1 : 0.6,
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.opacity = '1'
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.opacity = '0.6'
          }
        }}
        title="拖动调整面板大小"
      >
        {/* 分割线上的可视化标记 */}
        <div
          style={{
            width: 1.5,
            height: 24,
            background: isDragging ? 'var(--accent-light)' : 'var(--text-secondary)',
            borderRadius: 1,
            opacity: isDragging ? 1 : 0.4,
            transition: 'all 0.2s',
          }}
        />
      </div>
      
      {/* 右侧面板 */}
      <div
        style={{
          flex: `0 0 ${rightWidth}%`,
          minWidth: 0,
          overflow: 'visible',
          transition: isDragging ? 'none' : 'flex 0.15s',
        }}
      >
        {right}
      </div>
    </div>
  )
}
