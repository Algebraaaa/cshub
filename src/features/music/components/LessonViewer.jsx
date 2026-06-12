import { useState, useMemo, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import CodeBlock from '../../../components/learning/CodeBlock'
import ResizableSplitPanel from '../../../components/learning/ResizableSplitPanel'
import { useIsPhone } from '../../../hooks/useMediaQuery'
import { useDrag } from '../../../hooks/useDrag'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import { getStepCodeLine } from '../../../utils/stepProtocol'

const REMARK_PLUGINS = [remarkGfm, remarkMath]
const REHYPE_PLUGINS = [rehypeKatex]

const LANGS = [
  { key: 'cpp', label: 'C++', ext: 'cpp' },
  { key: 'python', label: 'Python', ext: 'py' },
]

const DETAIL_TABS = [
  { id: 'why', label: '原理', short: 'why', icon: '💡', title: '原理说明' },
  { id: 'pseudocode', label: '伪代码', short: 'pseudocode', icon: '🧩', title: '伪代码' },
  { id: 'bigO', label: '复杂度', short: 'big-o', icon: '📈', title: '复杂度' },
  { id: 'compare', label: '对比', short: 'compare', icon: '⚖️', title: '方法对比' },
  { id: 'quiz', label: '测验', short: 'quiz', icon: '📝', title: '小测验' },
  { id: 'notes', label: '笔记', short: 'notes', icon: '📓', title: '笔记' },
]

const VARIANT_LABELS = {
  bgd: 'BGD',
  sgd: 'SGD',
  mini: 'Mini-batch',
}

const MAX_VISUAL_OFFSET = 400

export default function LessonViewer({
  lesson,
  completed,
  onComplete,
  exerciseSlot,
  playgroundSnapshot,
  showDetailTabs = false,
  showIncompleteLessonFallback = false,
}) {
  const [lang, setLang] = useState('cpp')
  const [activeTab, setActiveTab] = useState('why')
  const [quizChoice, setQuizChoice] = useState(null)
  const [quizRevealed, setQuizRevealed] = useState(false)
  const [note, setNote] = useState('')
  if (!lesson) return null

  const isRichExercise = !!lesson.code && !!exerciseSlot
  // visualFirst：可视化自带公式/矩阵推导面板（如信息论模块），全宽展示、
  // 不再并排静态代码面板抢焦点；通用示例代码降级为折叠参考。
  const isVisualFirst = isRichExercise && lesson.displayMode === 'visualFirst'
  const shouldShowDetailTabs = isRichExercise || showDetailTabs
  const shouldShowConstructionNotice = showIncompleteLessonFallback && !isRichExercise && isLessonIncomplete(lesson)
  const articleClass = isVisualFirst
    ? 'w-full max-w-[1200px] min-w-0 mx-auto pb-16'
    : isRichExercise
      ? 'w-full max-w-[1700px] min-w-0 mx-auto pb-16'
      : 'max-w-2xl mx-auto pb-16'
  const currentLang = LANGS.find(item => item.key === lang) || LANGS[0]

  return (
    <article className={articleClass}>
      <header className={isRichExercise ? 'max-w-2xl mx-auto mb-6' : 'mb-8'}>
        <h1 className="text-2xl font-bold text-fg mb-1">{lesson.title}</h1>
        {lesson.summary && (
          <p className="text-fg-muted text-sm">{lesson.summary}</p>
        )}
      </header>

      {lesson.theory && (
        <MarkdownSection
          text={lesson.theory}
          className={isRichExercise ? 'prose-lesson max-w-2xl mx-auto mb-8' : 'prose-lesson mb-8'}
        />
      )}

      {shouldShowConstructionNotice && (
        <LessonConstructionNotice lesson={lesson} />
      )}

      {exerciseSlot && (
        isVisualFirst ? (
          <VisualFirstExercise
            key={lesson.id}
            lesson={lesson}
            exerciseSlot={exerciseSlot}
            lang={lang}
            currentLang={currentLang}
            onLangChange={setLang}
          />
        ) : isRichExercise ? (
          /* key=lesson.id：切换课节时重置对齐偏移、竖排开关等局部状态，
             并让 useLocalStorage 按新课节的 key 重新读取持久化值 */
          <RichExercise
            key={lesson.id}
            lesson={lesson}
            exerciseSlot={exerciseSlot}
            lang={lang}
            currentLang={currentLang}
            onLangChange={setLang}
            playgroundSnapshot={playgroundSnapshot}
          />
        ) : (
          <section className="mb-8 p-4 rounded-xl bg-surface border border-border-soft">
            <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint mb-3">
              互动练习
            </div>
            {exerciseSlot}
          </section>
        )
      )}

      {shouldShowDetailTabs && (
        <LessonDetailTabs
          lesson={lesson}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          quizChoice={quizChoice}
          onQuizChoice={setQuizChoice}
          quizRevealed={quizRevealed}
          onQuizReveal={() => setQuizRevealed(true)}
          note={note}
          onNoteChange={setNote}
        />
      )}

      {lesson.song && (
        <section className="mb-8 p-4 rounded-xl bg-surface border border-border-soft">
          <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint mb-2">
            配套曲目
          </div>
          <a
            href={lesson.song.href}
            className="inline-flex items-center gap-2 text-accent font-semibold text-sm hover:underline"
          >
            🎵 {lesson.song.label} →
          </a>
        </section>
      )}

      <div className={isRichExercise
        ? 'max-w-2xl mx-auto pt-6 border-t border-border-soft flex items-center gap-4'
        : 'pt-6 border-t border-border-soft flex items-center gap-4'
      }>
        {completed ? (
          <span className="inline-flex items-center gap-2 text-success text-sm font-semibold">
            <span className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center text-xs">✓</span>
            已完成
          </span>
        ) : (
          <button
            onClick={onComplete}
            className="btn-primary text-sm px-5 py-2"
          >
            完成本节 ✓
          </button>
        )}
      </div>
    </article>
  )
}

function RichExercise({ lesson, exerciseSlot, lang, currentLang, onLangChange, playgroundSnapshot }) {
  // 对齐偏移按课节持久化；组件以 key=lesson.id 挂载，key 变化时重新读取
  const [visualOffset, setVisualOffset] = useLocalStorage(`ai-visual-offset-${lesson.id}`, 0)
  const [stackedMode, setStackedMode] = useState(false)
  const isPhone = useIsPhone()

  // 可拖动对齐条：按住上下拖动可视化面板，与右侧代码高亮行对齐；双击复位
  const alignDragRef = useRef({ y: 0, offset: 0 })
  const onAlignDragStart = useDrag({
    cursor: 'row-resize',
    onStart: (e) => { alignDragRef.current = { y: e.clientY, offset: visualOffset } },
    onMove: (e) => {
      const next = alignDragRef.current.offset + (e.clientY - alignDragRef.current.y)
      setVisualOffset(Math.round(Math.max(0, Math.min(MAX_VISUAL_OFFSET, next))))
    },
  })
  const codeFocus = getCodeFocus(lesson, playgroundSnapshot)
  const highlightLine = getHighlightLine(lesson, lang, codeFocus, playgroundSnapshot)
  const snapshot = buildVariableSnapshot(lesson, playgroundSnapshot, codeFocus)
  const stepLabel = playgroundSnapshot?.currentStep != null
    ? `step ${playgroundSnapshot.currentStep + 1}`
    : '当前预设'

  const visualPanel = useMemo(() => (
    <div className="min-w-0 flex flex-col" style={{ overflow: 'visible', paddingRight: 2 }}>
      {/* 对齐条：直接上下拖动可视化面板（替代旧的上移/下移滑条），双击复位 */}
      <div
        role="separator"
        aria-label="拖动对齐可视化与代码"
        title="按住上下拖动，把可视化对齐到右侧代码高亮行；双击复位"
        onMouseDown={onAlignDragStart}
        onTouchStart={onAlignDragStart}
        onDoubleClick={() => setVisualOffset(0)}
        className="mb-2 flex select-none items-center gap-2 rounded-lg border border-border-soft bg-[var(--bg)] px-3 py-1.5 text-[11px] text-fg-faint transition-colors hover:border-accent hover:text-fg-muted"
        style={{ cursor: 'row-resize', touchAction: 'none' }}
      >
        <span aria-hidden className="tracking-[0.2em] font-bold">⋮⋮</span>
        <span className="font-semibold">对齐条 · 拖动与代码对齐</span>
        <span className="ml-auto font-mono">
          {visualOffset > 0 ? `↓ ${visualOffset}px · 双击复位` : '双击复位'}
        </span>
      </div>
      <div
        data-ai-visual-offset
        className="transition-[margin] duration-75 ease-out"
        style={{ marginTop: visualOffset }}
      >
        {exerciseSlot}
      </div>
    </div>
  ), [exerciseSlot, visualOffset, onAlignDragStart, setVisualOffset])

  const codePanel = useMemo(() => (
    <aside className="min-w-0 flex flex-col gap-3 overflow-visible p-1">
      <VariableSnapshot snapshot={snapshot} />
      <div className="flex flex-col">
        <div className="flex-shrink-0 flex items-center gap-2 mb-2">
          <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint">静态代码对照</div>
          <div className="ml-auto flex items-center gap-2">
            {!isPhone && (
              <button
                onClick={() => setStackedMode(s => !s)}
                className="rounded-md border border-border-soft px-2 py-1 text-[11px] font-semibold transition-colors"
                style={{
                  background: stackedMode ? 'var(--accent-soft)' : 'var(--surface)',
                  color: stackedMode ? 'var(--accent-light)' : 'var(--text-secondary)',
                }}
                title={stackedMode ? '切换到并排显示' : '切换到竖排显示'}
              >{stackedMode ? '⬅ 并排' : '⬇ 竖排'}</button>
            )}
            <div className="flex gap-1 text-[11px]">
              {LANGS.map(item => (
                <button
                  key={item.key} type="button"
                  onClick={() => onLangChange(item.key)}
                  className={[
                    'px-2.5 py-1 rounded-md border font-semibold transition-colors',
                    lang === item.key
                      ? 'bg-accent-soft text-accent border-accent'
                      : 'border-border-soft text-fg-muted hover:bg-surface hover:text-fg',
                  ].join(' ')}
                >{item.label}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col" style={{ overflow: 'visible' }}>
          <CodeBlock
            code={lesson.code?.[lang] || ''}
            lang={lang}
            title={`${lesson.id}.${currentLang.ext}`}
            highlightLine={highlightLine}
            maxHeight={undefined}
          />
        </div>
        <div className="mt-2 flex-shrink-0 rounded-md border border-border-soft bg-[var(--bg)] px-2.5 py-2 text-[11px] leading-5 text-fg-faint">
          当前高亮：{lesson.codeFocusLabels?.[codeFocus] ?? VARIANT_LABELS[codeFocus] ?? codeFocus}，{stepLabel} 对应代码行。
          动画步进、播放和左侧预设切换会同步更新变量与代码。
        </div>
      </div>
    </aside>
  ), [lesson, lang, currentLang, onLangChange, highlightLine, snapshot, stepLabel, codeFocus, isPhone, stackedMode])

  // 移动端或竖排：简单纵向；桌面：ResizableSplitPanel 拖拽对齐
  if (isPhone || stackedMode) {
    return (
      <section
        data-ai-rich-exercise={lesson.id}
        className="mb-8 min-w-0 rounded-xl bg-surface border border-border-soft p-3 lg:p-4 2xl:p-5"
      >
        <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint mb-3">互动练习</div>
        <div className="flex flex-col gap-4">
          <div className="min-w-0">{visualPanel}</div>
          <div className="min-w-0">{codePanel}</div>
        </div>
      </section>
    )
  }

  return (
    <section
      data-ai-rich-exercise={lesson.id}
      className="mb-8 min-w-0 rounded-xl bg-surface border border-border-soft p-3 lg:p-4 2xl:p-5"
    >
      <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint mb-3">互动练习</div>
      <div className="mb-2 flex items-center gap-2 text-[11px] text-fg-faint">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-light)] inline-block" />
        💡 提示：拖动中间分割线可调整可视化与代码面板大小。
      </div>
      <div style={{ minHeight: 'min(900px, calc(100vh - 120px))' }}>
        <ResizableSplitPanel
          left={visualPanel}
          right={codePanel}
          storageKey={`ai-split-${lesson.id}`}
          minWidth={280}
          defaultRatio={0.56}
        />
      </div>
    </section>
  )
}

// 公式高亮优先模式：可视化（自带公式/矩阵推导面板）全宽独占教学焦点，
// 通用示例代码收进折叠区，按需展开参考。用于信息论等"公式比代码重要"的课节。
function VisualFirstExercise({ lesson, exerciseSlot, lang, currentLang, onLangChange }) {
  return (
    <section
      data-ai-rich-exercise={lesson.id}
      className="mb-8 min-w-0 rounded-xl bg-surface border border-border-soft p-3 lg:p-4 2xl:p-5"
    >
      <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint mb-3">
        互动练习 · 公式推导优先
      </div>
      <div className="min-w-0">{exerciseSlot}</div>

      {lesson.code && (
        <details className="mt-4 rounded-lg border border-border-soft bg-[var(--bg)] px-3 py-2">
          <summary className="cursor-pointer select-none text-[12px] font-semibold text-fg-muted hover:text-fg">
            参考实现代码（通用示例，与上方推导面板不联动）
          </summary>
          <div className="mt-3">
            <div className="mb-2 flex gap-1 text-[11px]">
              {LANGS.map(item => (
                <button
                  key={item.key} type="button"
                  onClick={() => onLangChange(item.key)}
                  className={[
                    'px-2.5 py-1 rounded-md border font-semibold transition-colors',
                    lang === item.key
                      ? 'bg-accent-soft text-accent border-accent'
                      : 'border-border-soft text-fg-muted hover:bg-surface hover:text-fg',
                  ].join(' ')}
                >{item.label}</button>
              ))}
            </div>
            <CodeBlock
              code={lesson.code?.[lang] || ''}
              lang={lang}
              title={`${lesson.id}.${currentLang.ext}`}
              noAutoScroll
            />
          </div>
        </details>
      )}
    </section>
  )
}

function isLessonIncomplete(lesson) {
  return !lesson.theory
    || !lesson.code
    || !lesson.pseudocode
    || !lesson.bigO
    || !Array.isArray(lesson.compare)
    || lesson.compare.length === 0
    || !Array.isArray(lesson.quiz)
    || lesson.quiz.length === 0
}

function LessonConstructionNotice({ lesson }) {
  return (
    <section className="mb-8 rounded-xl border border-border-soft bg-surface p-5">
      <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint mb-2">
        建设中
      </div>
      <h2 className="text-lg font-bold text-fg mb-2">{lesson.title}</h2>
      <p className="text-sm leading-7 text-fg-muted mb-3">
        本节内容正在建设中。
      </p>
      <div className="rounded-lg border border-border-soft bg-[var(--bg)] px-3 py-2 text-xs font-mono text-fg-muted">
        lesson id: {lesson.id}
      </div>
      <p className="mt-3 text-sm leading-7 text-fg-muted">
        后续会补充：原理、伪代码、复杂度、可视化、测验、笔记。
      </p>
    </section>
  )
}

function VariableSnapshot({ snapshot = {} }) {
  const rows = Object.entries(snapshot)

  return (
    <section className="flex-shrink-0">
      <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint mb-2">
        变量快照
      </div>
      <div className="grid grid-cols-2 gap-2">
        {rows.map(([key, value]) => (
          <div key={key} className="ai-variable-snapshot-card rounded-md border border-border-soft px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-fg-faint font-mono">{key}</div>
            <div className="text-sm text-accent font-mono mt-1 truncate">{value}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function getCodeFocus(lesson, playgroundSnapshot) {
  const explicit = playgroundSnapshot?.current?.codeFocus
    ?? playgroundSnapshot?.current?.variant
    ?? playgroundSnapshot?.state?.variant
    ?? playgroundSnapshot?.presetId
  return explicit || lesson.defaultCodeFocus || 'default'
}

function getHighlightLine(lesson, lang, codeFocus, playgroundSnapshot) {
  // 最高优先级：playground 步骤自带的显式行号（统一高亮协议，
  // 见 utils/stepProtocol.getStepCodeLine）。explicitOnly —— AI 步骤里的
  // `line` 字段可能另有含义，不做泛化兜底。
  const direct = getStepCodeLine(playgroundSnapshot?.current, lang, { explicitOnly: true })
  if (direct != null) return direct

  const stepLineSet = lesson.codeStepHighlightLines?.[lang]
  const stepLines = Array.isArray(stepLineSet)
    ? stepLineSet
    : stepLineSet?.[codeFocus] ?? stepLineSet?.default

  if (stepLines?.length && playgroundSnapshot?.currentStep != null) {
    const index = playgroundSnapshot.currentStep % stepLines.length
    return stepLines[index]
  }

  if (playgroundSnapshot?.currentStep != null && lesson.code?.[lang]) {
    const nonEmptyLines = lesson.code[lang]
      .split('\n')
      .map((text, index) => ({ text, line: index + 1 }))
      .filter(item => item.text.trim().length > 0)
      .map(item => item.line)
    if (nonEmptyLines.length) {
      return nonEmptyLines[playgroundSnapshot.currentStep % nonEmptyLines.length]
    }
  }

  return lesson.codeHighlightLines?.[lang]?.[codeFocus]
    ?? lesson.codeHighlightLines?.[lang]?.default
    ?? null
}

function buildVariableSnapshot(lesson, playgroundSnapshot, codeFocus) {
  const base = { ...(lesson.variablesSnapshot || {}) }
  const current = playgroundSnapshot?.current || {}
  const state = playgroundSnapshot?.state || {}
  const label = lesson.codeFocusLabels?.[codeFocus] ?? VARIANT_LABELS[codeFocus] ?? codeFocus

  if (codeFocus && codeFocus !== 'default') base.variant = label
  if (state.lr != null) base.learningRate = formatNumber(state.lr, 5)
  if (state.learningRate != null) base.learningRate = formatNumber(state.learningRate, 5)
  if (current.x != null && current.y != null) base.position = `(${formatNumber(current.x, 2)}, ${formatNumber(current.y, 2)})`
  if (current.loss != null) base.loss = formatNumber(current.loss, 4)
  if (current.fx != null) base.loss = formatNumber(current.fx, 4)
  if (current.mse != null) base.mse = formatNumber(current.mse, 4)
  if (current.accuracy != null) base.accuracy = `${Math.round(current.accuracy * 100)}%`
  if (current.probability != null) base.probability = formatNumber(current.probability, 3)
  if (current.prediction != null) base.prediction = current.prediction
  if (current.k != null) base.k = current.k
  if (current.radius != null) base.radius = formatNumber(current.radius, 3)
  if (current.inertia != null) base.inertia = formatNumber(current.inertia, 3)
  if (current.centroidShift != null) base.centroidShift = formatNumber(current.centroidShift, 3)
  if (current.phase != null) base.phase = current.phase
  if (current.impurity != null) base.impurity = formatNumber(current.impurity, 3)
  if (current.margin != null) base.margin = formatNumber(current.margin, 3)
  if (current.hingeLoss != null) base.hingeLoss = formatNumber(current.hingeLoss, 3)
  if (current.supportVectors != null) base.supportVectors = current.supportVectors
  if (current.w != null) base.weight = formatNumber(current.w, 3)
  if (current.b != null) base.bias = formatNumber(current.b, 3)
  if (playgroundSnapshot?.currentStep != null && playgroundSnapshot?.total != null) {
    base.step = `${playgroundSnapshot.currentStep + 1} / ${playgroundSnapshot.total}`
  }
  return base
}

function formatNumber(value, digits = 3) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return value
  return Number(value.toFixed(digits)).toString()
}

function LessonDetailTabs({
  lesson,
  activeTab,
  onTabChange,
  quizChoice,
  onQuizChoice,
  quizRevealed,
  onQuizReveal,
  note,
  onNoteChange,
}) {
  const active = DETAIL_TABS.find(tab => tab.id === activeTab) || DETAIL_TABS[0]

  return (
    <section className="mb-8">
      <div
        role="tablist"
        aria-label="AI 课节说明"
        className="sticky top-2 sm:top-14 z-10 mb-4 flex flex-nowrap items-center gap-1 overflow-x-auto rounded-xl border border-[var(--glass-border-strong)] bg-[var(--glass-bg-mid)] px-2 py-1.5 backdrop-blur-xl"
        style={{ scrollbarWidth: 'thin' }}
      >
        {DETAIL_TABS.map(tab => {
          const selected = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onTabChange(tab.id)}
              className={[
                'inline-flex items-center rounded-lg px-3 py-1.5 text-[12px] font-bold tracking-wide whitespace-nowrap transition-colors',
                selected
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-light)] shadow-[inset_0_0_0_1px_var(--accent-border)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--glass-bg-strong)] hover:text-[var(--text-primary)]',
              ].join(' ')}
            >
              <span className="text-[15px] leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="hidden text-[10px] font-mono lowercase tracking-wide text-[var(--text-tertiary)] sm:inline">
                {tab.short}
              </span>
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl border border-[var(--glass-border-strong)] bg-[var(--glass-bg-mid)] p-5 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.10),inset_0_1px_1px_rgba(255,255,255,0.16)]">
        <h2 className="mb-4 text-base font-bold tracking-tight text-fg">{active.title}</h2>
        <LessonTabPanel
          lesson={lesson}
          activeTab={activeTab}
          quizChoice={quizChoice}
          onQuizChoice={onQuizChoice}
          quizRevealed={quizRevealed}
          onQuizReveal={onQuizReveal}
          note={note}
          onNoteChange={onNoteChange}
        />
      </div>
    </section>
  )
}

function LessonTabPanel({
  lesson,
  activeTab,
  quizChoice,
  onQuizChoice,
  quizRevealed,
  onQuizReveal,
  note,
  onNoteChange,
}) {
  if (activeTab === 'why') {
    if (!lesson.theory) return <TabPlaceholder lesson={lesson} label="原理" />
    return <MarkdownSection text={lesson.theory} className="prose-lesson" />
  }

  if (activeTab === 'pseudocode') {
    if (!lesson.pseudocode) return <TabPlaceholder lesson={lesson} label="伪代码" />
    return (
      <CodeBlock
        code={lesson.pseudocode}
        lang="pseudo"
        title={`${lesson.id}.pseudo`}
        noAutoScroll
      />
    )
  }

  if (activeTab === 'bigO') {
    return <BigOPanel bigO={lesson.bigO} lesson={lesson} />
  }

  if (activeTab === 'compare') {
    return <ComparePanel rows={lesson.compare} lesson={lesson} />
  }

  if (activeTab === 'quiz') {
    return (
      <QuizPanel
        question={lesson.quiz?.[0]}
        choice={quizChoice}
        revealed={quizRevealed}
        onChoice={onQuizChoice}
        onReveal={onQuizReveal}
        lesson={lesson}
      />
    )
  }

  return (
    <textarea
      value={note}
      onChange={event => onNoteChange(event.target.value)}
      placeholder="记录你对 BGD / SGD / Mini-batch 差异的理解。"
      className="min-h-[180px] w-full resize-y rounded-lg border border-border-soft bg-surface p-3 text-sm text-fg outline-none focus:border-accent"
    />
  )
}

function MarkdownSection({ text, className }) {
  if (!text) return null
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS}>
        {text}
      </ReactMarkdown>
    </div>
  )
}

function TabPlaceholder({ lesson, label }) {
  return (
    <div className="rounded-xl border border-border-soft bg-surface p-4 text-sm leading-7 text-fg-muted">
      <p className="m-0 font-semibold text-fg">{label}内容正在建设中。</p>
      <p className="m-0 mt-2">lesson id: <span className="font-mono text-accent">{lesson.id}</span></p>
      <p className="m-0 mt-2">后续会补充：原理、伪代码、复杂度、可视化、测验、笔记。</p>
    </div>
  )
}

function BigOPanel({ bigO, lesson }) {
  if (!bigO) return <TabPlaceholder lesson={lesson} label="复杂度" />
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {[
        ['时间', bigO.time],
        ['空间', bigO.space],
        ['说明', bigO.note],
      ].map(([label, value]) => (
        <div key={label} className="rounded-lg border border-border-soft bg-surface p-4">
          <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint mb-2">
            {label}
          </div>
          <p className="text-sm leading-7 text-fg-muted m-0">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ComparePanel({ rows = [], lesson }) {
  if (rows.length === 0) return <TabPlaceholder lesson={lesson} label="方法对比" />
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border-soft text-left text-[11px] uppercase tracking-wide text-fg-faint">
            <th className="py-2 pr-3">方法</th>
            <th className="py-2 pr-3">每步数据</th>
            <th className="py-2 pr-3">优点</th>
            <th className="py-2">代价</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.method} className="border-b border-border-soft last:border-b-0">
              <td className="py-2.5 pr-3 font-semibold text-fg">{row.method}</td>
              <td className="py-2.5 pr-3 text-fg-muted">{row.data}</td>
              <td className="py-2.5 pr-3 text-fg-muted">{row.strength}</td>
              <td className="py-2.5 text-fg-muted">{row.tradeoff}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function QuizPanel({ question, choice, revealed, onChoice, onReveal, lesson }) {
  if (!question) return <TabPlaceholder lesson={lesson} label="测验" />
  return (
    <div className="max-w-2xl">
      <p className="mb-4 text-sm font-semibold text-fg">{question.q}</p>
      <div className="flex flex-col gap-2">
        {question.options.map((option, index) => {
          const selected = choice === index
          const correct = revealed && question.answer === index
          const wrong = revealed && selected && question.answer !== index
          return (
            <button
              key={option}
              type="button"
              onClick={() => !revealed && onChoice(index)}
              className={[
                'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                correct
                  ? 'border-success bg-success/10 text-success'
                  : wrong
                    ? 'border-danger bg-danger/10 text-danger'
                    : selected
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-border-soft bg-surface text-fg-muted hover:text-fg',
              ].join(' ')}
            >
              {option}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        disabled={choice == null || revealed}
        onClick={onReveal}
        className="btn-primary mt-4 disabled:opacity-50"
      >
        确认答案
      </button>
      {revealed && (
        <p className="mt-3 rounded-lg border border-border-soft bg-surface p-3 text-sm leading-7 text-fg-muted">
          {question.explanation}
        </p>
      )}
    </div>
  )
}
