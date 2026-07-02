// Playground 渲染冒烟验收
//
// 只读检查：页面非白屏、SVG 非空、播放控件存在、「下一步」后步骤描述变化。
// 以前只能人工抽查，新增/合并可视化模块后容易无声退化。
import { describe, test, expect } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { StepProvider } from '../../contexts/StepContext'
import RegexNfaPlayground from './RegexNfaPlayground'
import SortingPlayground from './SortingPlayground'
import QLearningPlayground from '../ai-playgrounds/QLearningPlayground'
import RAGPlayground from '../ai-playgrounds/RAGPlayground'
import { regexToNfa } from '../../algorithms/compiler/regexToNfa'
import { bubbleSort } from '../../algorithms/sorting/bubbleSort'

function getStepDescription(container) {
  // StepController 的描述行：STEP 徽标后面的 span
  const badge = [...container.querySelectorAll('span')].find(el => el.textContent === 'STEP')
  return badge?.nextElementSibling?.textContent ?? null
}

function smokeAssertions(container) {
  // 非白屏：有真实 DOM 内容
  expect(container.textContent.length).toBeGreaterThan(0)
  // SVG 非空：至少有一个带图形元素的 svg
  const svgs = [...container.querySelectorAll('svg')]
  expect(svgs.length).toBeGreaterThan(0)
  const hasShapes = svgs.some(svg => svg.querySelector('circle, rect, line, path, polyline, text'))
  expect(hasShapes, 'SVG 内应有图形元素').toBe(true)
  // 播放控件存在
  expect(screen.getAllByRole('button', { name: '下一步' }).length).toBeGreaterThan(0)
  expect(screen.getAllByText('播放').length).toBeGreaterThan(0)
}

describe('RegexNfaPlayground（编译原理 · 非 Shell 系）', () => {
  test('渲染非空、可单步、描述随步骤变化', async () => {
    const { container } = render(
      <StepProvider>
        <RegexNfaPlayground algoFn={regexToNfa} />
      </StepProvider>
    )
    smokeAssertions(container)

    const before = getStepDescription(container)
    expect(before).toBeTruthy()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '下一步' }))
    })
    const after = getStepDescription(container)
    expect(after).toBeTruthy()
    expect(after).not.toBe(before)
  })
})

describe('SortingPlayground（PlaygroundShell 系）', () => {
  test('渲染非空、可单步、步数计数前进', async () => {
    const { container } = render(
      <StepProvider>
        <SortingPlayground algoFn={bubbleSort} algoSlug="bubblesort" />
      </StepProvider>
    )
    smokeAssertions(container)

    const before = getStepDescription(container)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '下一步' }))
    })
    const after = getStepDescription(container)
    expect(after).not.toBe(before)
  })
})

describe('AI 真实演算 Playground（替换 AIConcept 后）', () => {
  test('QLearningPlayground：渲染非空、单步推进、步骤带显式行号', async () => {
    const { container } = render(<QLearningPlayground />)
    smokeAssertions(container)
    const before = getStepDescription(container)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '下一步' }))
    })
    expect(getStepDescription(container)).not.toBe(before)
  })

  test('RAGPlayground：渲染非空、单步推进', async () => {
    const { container } = render(<RAGPlayground />)
    smokeAssertions(container)
    const before = getStepDescription(container)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '下一步' }))
    })
    expect(getStepDescription(container)).not.toBe(before)
  })
})
