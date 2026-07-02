// 边界场景验收（P2-10）
// 空步骤、无代码课节、Python-only 代码、visualFirst 渲染——
// 这些此前只靠组件内部兜底，没有硬性测试。
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PlaygroundShell from './PlaygroundShell'
import InteractiveVisualization from '../learning/InteractiveVisualization'
import LessonViewer from '../../features/music/components/LessonViewer'
import { StepProvider } from '../../contexts/StepContext'

describe('PlaygroundShell 空步骤', () => {
  test('computeSteps 返回空数组 → 显示占位提示而非崩溃', () => {
    render(
      <PlaygroundShell
        presets={[{ id: 'p', label: 'P' }]}
        computeSteps={() => []}
        renderViz={() => <div>viz</div>}
      />
    )
    expect(screen.getByText('没有可演示的步骤。')).toBeTruthy()
  })
})

describe('InteractiveVisualization 代码语言边界', () => {
  test('Python-only 代码：默认语言回退到 python，正常渲染代码块', () => {
    const { container } = render(
      <StepProvider>
        <InteractiveVisualization
          playground={<div>playground</div>}
          code={{ python: 'def f():\n    return 1' }}
          slug="py-only"
        />
      </StepProvider>
    )
    expect(container.textContent).toContain('py-only.py')
    expect(container.textContent).toContain('def')
  })

  test('无代码：只渲染可视化，不渲染代码面板', () => {
    const { container } = render(
      <StepProvider>
        <InteractiveVisualization
          playground={<div>only-playground</div>}
          code={null}
          slug="no-code"
          showCode={false}
        />
      </StepProvider>
    )
    expect(container.textContent).toContain('only-playground')
    expect(container.querySelector('pre')).toBeNull()
  })
})

describe('LessonViewer 课节形态边界', () => {
  const baseLesson = {
    id: 'x-test',
    title: '测试课节',
    theory: '## 原理\n\n内容',
    pseudocode: 'procedure X',
    bigO: { time: 'O(1)', space: 'O(1)', note: '-' },
    compare: [{ method: 'A', data: '-', strength: '-', tradeoff: '-' }],
    quiz: [{ q: 'Q?', options: ['a', 'b'], answer: 0, explanation: 'e' }],
  }

  test('无 code 的课节 + 练习：走简单全宽模式，练习仍可用', () => {
    const { container } = render(
      <LessonViewer lesson={baseLesson} exerciseSlot={<div>exercise-here</div>} />
    )
    expect(container.textContent).toContain('exercise-here')
    expect(container.textContent).toContain('互动练习')
    // 没有 code → 非富练习，不渲染对齐条
    expect(container.querySelector('[role="separator"]')).toBeNull()
  })

  test('无 code 且开启 fallback：显示建设中提示，但练习仍渲染（现行契约）', () => {
    const { container } = render(
      <LessonViewer
        lesson={baseLesson}
        exerciseSlot={<div>exercise-here</div>}
        showIncompleteLessonFallback
      />
    )
    expect(container.textContent).toContain('本节内容正在建设中')
    expect(container.textContent).toContain('exercise-here')
  })

  test('visualFirst 课节：练习全宽 + 参考代码收进折叠区', () => {
    const lesson = {
      ...baseLesson,
      displayMode: 'visualFirst',
      code: { python: 'print(1)', cpp: 'int x;' },
    }
    const { container } = render(
      <LessonViewer lesson={lesson} exerciseSlot={<div>formula-playground</div>} />
    )
    expect(container.textContent).toContain('公式推导优先')
    const details = container.querySelector('details')
    expect(details).toBeTruthy()
    expect(details.open).toBe(false)
    // 不应渲染并排模式的对齐条
    expect(container.querySelector('[role="separator"][aria-label="拖动对齐可视化与代码"]')).toBeNull()
  })

  test('带 code 的课节：富练习模式渲染对齐条与静态代码', () => {
    const lesson = { ...baseLesson, code: { python: 'print(1)', cpp: 'int x;' } }
    const { container } = render(
      <LessonViewer lesson={lesson} exerciseSlot={<div>rich-playground</div>} />
    )
    expect(container.querySelector('[role="separator"][aria-label="拖动对齐可视化与代码"]')).toBeTruthy()
    expect(container.textContent).toContain('静态代码对照')
  })

  test('lesson 为空：返回 null 不崩溃', () => {
    const { container } = render(<LessonViewer lesson={null} />)
    expect(container.textContent).toBe('')
  })
})
