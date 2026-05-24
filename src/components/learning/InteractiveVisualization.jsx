import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import CodeBlock from './CodeBlock'
import ResizableSplitPanel from './ResizableSplitPanel'
import VariablePanel from './VariablePanel'
import { useStepData } from '../../contexts/StepContext'
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
export default function InteractiveVisualization({ playground, code, slug, showCode = true, forceStacked = false }) {
  const LANGS = code ? ALL_LANGS.filter(l => code[l.key]) : ALL_LANGS.slice(0, 2)
  const [lang, setLang] = useState('cpp')
  const [stackedMode, setStackedMode] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)
  const stepData = useStepData()
  const outletContext = useOutletContext() || {}
  const sidebarCollapsed = outletContext.sidebarCollapsed || false
  
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
    ? inferCodeLine(code?.[lang], stepData.current, lang)
    : null
  
  const shouldStackCode = stackedMode || isNarrow || forceStacked || !showCode

  const visualPanel = (
    <div style={{
      minWidth: 0,
      height: '100%',
      overflow: 'auto',
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
          const active = lang === l.key
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
      
      {/* 布局切换按钮 */}
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
  )
  
  // 代码面板组件
  const codePanel = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      flex: '1 1 auto',
      minHeight: 0,
    }}>
      {codeToolbar}
      <CodeBlock
        code={code[lang]}
        lang={lang}
        title={`${slug}.${LANGS.find(x => x.key === lang).ext}`}
        highlightLine={highlightLine}
        noAutoScroll={false}
        fill
      />
    </div>
  )

  const executionPanel = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      height: '100%',
      minHeight: 0,
      overflow: 'hidden',
    }}>
      <div style={{
        flex: '0 0 auto',
        maxHeight: 190,
        overflow: 'auto',
      }}>
        <VariablePanel />
      </div>
      {showCode && code && codePanel}
    </div>
  )
  
  return (
    <>
      {/* 并排显示：使用可调节分割面板 */}
      {!shouldStackCode && showCode && code ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          height: 'clamp(480px, calc(100vh - 180px), 760px)',
          minHeight: 0,
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
          
          {/* 代码 */}
          <div style={{
            height: showCode && code ? 'min(620px, calc(100vh - 120px))' : 'auto',
            minHeight: showCode && code ? 420 : 'auto',
          }}>
            {executionPanel}
          </div>
        </div>
      )}
    </>
  )
}
