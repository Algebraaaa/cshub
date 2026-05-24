import { useState, useEffect, useRef } from 'react'

/**
 * ResizableSplitPanel - iPad 风格可调节分割面板
 * 支持拖动分割线调整左右面板的宽度
 * 
 * 特性：
 * - 平滑的拖动体验
 * - 最小宽度限制防止面板太小
 * - localStorage 持久化用户偏好
 * - 自适应响应式设计
 */
export default function ResizableSplitPanel({
  left,
  right,
  storageKey = 'split-panel-ratio',
  minWidth = 200,
  defaultRatio = 0.5,
}) {
  const [ratio, setRatio] = useState(defaultRatio)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)
  
  // 初始化：从 localStorage 读取用户偏好
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        setRatio(parseFloat(saved))
      } catch {
        // 忽略解析错误，使用默认值
      }
    }
  }, [storageKey])
  
  // 处理拖动事件
  useEffect(() => {
    if (!isDragging || !containerRef.current) return
    
    const handleMouseMove = (e) => {
      const container = containerRef.current
      if (!container) return
      
      const rect = container.getBoundingClientRect()
      const newX = e.clientX - rect.left
      
      // 计算新的比例，考虑最小宽度限制
      const clampedX = Math.max(minWidth, Math.min(newX, rect.width - minWidth - 16))
      const newRatio = clampedX / rect.width
      
      setRatio(newRatio)
      
      // 实时保存到 localStorage
      localStorage.setItem(storageKey, newRatio.toString())
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, storageKey, minWidth])
  
  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }
  
  const leftWidth = ratio * 100
  const rightWidth = (1 - ratio) * 100
  
  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        flex: '1 1 auto',
        minHeight: 0,
        overflow: 'hidden',
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      {/* 左侧面板 */}
      <div
        style={{
          flex: `0 0 ${leftWidth}%`,
          minWidth: 0,
          overflow: 'auto',
          transition: isDragging ? 'none' : 'flex 0.15s',
        }}
      >
        {left}
      </div>
      
      {/* 分割线 */}
      <div
        onMouseDown={handleMouseDown}
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
          overflow: 'auto',
          transition: isDragging ? 'none' : 'flex 0.15s',
        }}
      >
        {right}
      </div>
    </div>
  )
}
