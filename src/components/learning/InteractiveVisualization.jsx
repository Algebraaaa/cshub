import { useState, useEffect, memo } from 'react'
import { useOutletContext } from 'react-router-dom'
import CodeBlock from './CodeBlock'
import ResizableSplitPanel from './ResizableSplitPanel'
import VariablePanel from './VariablePanel'
import { useStepData } from '../../contexts/StepContext'
import { useIsPhone } from '../../hooks/useMediaQuery'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { inferCodeLine } from './codeLineInference'

const ALL_LANGS = [
  { key: 'cpp', label: 'C++', ext: 'cpp' },
  { key: 'python', label: 'Python', ext: 'py' },
  { key: 'java', label: 'Java', ext: 'java' },
]

/**
 * InteractiveVisualization 组件
 * 并排显示动画和代码，让学习者能够同时看到执行过程和对应代码
 * 在小屏幕上自动切换为单列布局
 * 当侧栏折叠时，自动调整并排显示的宽度
 */
// memo：playground/code/slug 在算法加载后引用稳定；
// 主题切换只更新 data-theme 属性，CSS 变量自动更新，无需 React 重渲染此组件。
// playground prop 需由父级用 useMemo 稳定引用，才能让 memo 生效。
const InteractiveVisualization = memo(function InteractiveVisualization({ playground, code, slug, showCode = true, forceStacked = false }) {
  const LANGS = code ? ALL_LANGS.filter(l => code[l.key]) : ALL_LANGS.slice(0, 2)
  const [lang, setLang] = useState(() => {
    if (code?.cpp) return 'cpp'
    if (code?.python) return 'python'
    return Object.keys(code || {})[0] || 'cpp'
  })
  const [stackedMode, setStackedMode] = useState(false)
  // 高度策略：默认「完整展开」——代码不内部滚动，整页随内容滚动；
  // 「固定视口」保留旧行为（面板钉在一屏内、代码区内滚），适合边播动画边看代码。
  const [pinned, setPinned] = useLocalStorage('algoviz-viz-pinned', false)
  const [isNarrow, setIsNarrow] = useState(false)
  const stepData = useStepData()
  const isPhone = useIsPhone()
  const outletContext = useOutletContext() || {}
  const sidebarCollapsed = outletContext.sidebarCollapsed || false
  const currentLang = LANGS.find(x => x.key === lang) || LANGS[0] || ALL_LANGS[0]
  const activeLang = currentLang.key
  const currentCode = code?.[activeLang] || ''

  // 检测屏幕宽度，当侧栏折叠时调整阈值
  useEffect(() => {
    const checkWidth = () => {
      // 侧栏宽度为 248px，折叠时增加 248px 可用空间
      // 当侧栏展开时，更高的阈值触发竖排 (1400px)
      // 当侧栏折叠时，更低的阈值 (1200px)，因为已经有更多空间
      const threshold = sidebarCollapsed ? 900 : 1100
      setIsNarrow(window.innerWidth < threshold)
    }
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [sidebarCollapsed])
  
  // 从步骤数据中提取代码行号；没有显式映射时按描述自动推断
  const highlightLine = stepData?.current && showCode
    ? inferCodeLine(currentCode, stepData.current, activeLang)
    : null
  
  const shouldStackCode = stackedMode || isNarrow || forceStacked || !showCode || !currentCode

  const visualPanel = (
    <div style={{
      minWidth: 0,
      // 固定视口：面板内滚；完整展开：自然高度，跟随页面滚动
      height: pinned ? '100%' : undefined,
      overflow: pinned ? 'auto' : 'visible',
      paddingRight: 2,
    }}>
      {playground}
    </div>
  )
  
  // 代码选择工具栏
  const codeToolbar = (
    <div style={{
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      marginBottom: 12,
    }}>
      {isPhone ? (
        // 手机端：用原生 select 节省横向空间（3 个 tab 约 240px，太宽）
        <select
          value={activeLang}
          onChange={e => setLang(e.target.value)}
          style={{
            padding: '7px 12px',
            fontSize: 12.5,
            fontWeight: 600,
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            minHeight: 36,
          }}
          aria-label="选择代码语言"
        >
          {LANGS.map(l => (
            <option key={l.key} value={l.key}>{l.label}</option>
          ))}
        </select>
      ) : (
        // 桌面 / iPad：tab 按钮组
        <div style={{
          display: 'flex',
          gap: 2,
          padding: 4,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          width: 'fit-content',
        }}>
          {LANGS.map(l => {
            const active = activeLang === l.key
            return (
              <button key={l.key} onClick={() => setLang(l.key)}
                style={{
                  padding: '6px 18px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  borderRadius: 5,
                  border: 'none',
                  background: active ? 'var(--bg)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                }}>
                {l.label}
              </button>
            )
          })}
        </div>
      )}
      
      {/* 布局切换按钮组 */}
      <div style={{ display: 'flex', gap: 6 }}>
        {showCode && (
          <button
            onClick={() => setPinned(p => !p)}
            style={{
              padding: '5px 12px',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 5,
              border: '1px solid var(--border)',
              background: pinned ? 'var(--accent-soft)' : 'var(--surface)',
              color: pinned ? 'var(--accent-light)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            title={pinned
              ? '完整展开：代码全部铺开，整页滚动，适合通读代码'
              : '固定视口：面板钉在一屏内、代码区内部滚动，适合边播动画边看代码'}
          >
            {pinned ? '📜 完整展开' : '📌 固定视口'}
          </button>
        )}
        {!isNarrow && !forceStacked && showCode && (
          <button
            onClick={() => setStackedMode(!stackedMode)}
            style={{
              padding: '5px 12px',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 5,
              border: '1px solid var(--border)',
              background: stackedMode ? 'var(--accent-soft)' : 'var(--surface)',
              color: stackedMode ? 'var(--accent-light)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            title={stackedMode ? '切换到并排显示' : '切换到竖排显示'}
          >
            {stackedMode ? '⬅️ 并排' : '⬇️ 竖排'}
          </button>
        )}
      </div>
    </div>
  )
  
  // 代码面板组件 · 固定视口时 fill（内部滚动），完整展开时自然铺开
  const codePanel = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      flex: pinned ? '1 1 auto' : '0 0 auto',
      minHeight: 0,
    }}>
      {codeToolbar}
      <CodeBlock
        code={currentCode}
        lang={activeLang}
        title={`${slug}.${currentLang.ext}`}
        highlightLine={highlightLine}
        noAutoScroll={!pinned}
        fill={pinned}
      />
    </div>
  )

  const executionPanel = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      height: pinned ? '100%' : undefined,
      minHeight: 0,
      overflow: pinned ? 'hidden' : 'visible',
    }}>
      <div style={{
        flex: '0 0 auto',
        maxHeight: pinned ? 190 : undefined,
        overflow: pinned ? 'auto' : 'visible',
      }}>
        <VariablePanel />
      </div>
      {showCode && currentCode && codePanel}
    </div>
  )
  
  return (
    <>
      {/* 并排显示：使用可调节分割面板
          完整展开（默认）：高度随内容生长，代码不内滚，整页滚动；
          固定视口：钉死一屏高度，代码区内部滚动（旧行为） */}
      {!shouldStackCode && showCode && currentCode ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          height: pinned ? 'clamp(480px, calc(100vh - 180px), 760px)' : undefined,
          minHeight: pinned ? 0 : 480,
        }}>
          {/* 提示标签 */}
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            letterSpacing: '0.05em',
          }}>
            <span style={{
              width: 4,
              height: 4,
              background: 'var(--accent-light)',
              borderRadius: '50%',
              display: 'inline-block',
            }} />
            💡 提示：拖动中间的分割线调整窗口大小
          </div>
          
          <ResizableSplitPanel
            left={visualPanel}
            right={executionPanel}
            storageKey={`split-ratio-${slug}`}
            minWidth={250}
            defaultRatio={0.58}
          />
        </div>
      ) : (
        /* 竖排显示或无代码：使用简单布局 */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {/* 动画可视化 */}
          {visualPanel}

          {/* 代码 · 完整展开时自然高度 */}
          <div style={{
            height: pinned && showCode && currentCode ? 'min(620px, calc(100vh - 120px))' : 'auto',
            minHeight: pinned && showCode && currentCode ? 420 : 'auto',
          }}>
            {executionPanel}
          </div>
        </div>
      )}
    </>
  )
})

export default InteractiveVisualization
