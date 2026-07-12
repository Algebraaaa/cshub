// 全量算法冒烟守卫
//
// 渲染每一个算法的 playground（经 AlgorithmPlaygroundFor 分发）并单步走几步，
// 断言不崩溃、有实际内容。这补上了一个真实存在过的盲区：此前的测试只验
// `typeof fn === 'function'`，从不真正运行算法，所以"某算法在特定输入下崩溃"
// 根本抓不到（radix 负数崩溃 bug 就是这么漏掉的）。
//
// 依赖 src/test/setup.js 里对 scrollIntoView/scrollTo/ResizeObserver 的 polyfill，
// 否则单步走触及滚动的组件会在 jsdom 抛错。
import { describe, test, expect } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { StepProvider } from '../contexts/StepContext'
import PlaygroundFor from '../components/learning/AlgorithmPlaygroundFor'
import { ALGORITHMS } from './algorithms.js'

const all = Object.values(ALGORITHMS)

describe('全量 playground 冒烟（渲染 + 单步不崩）', () => {
  for (const algo of all) {
    test(`${algo.slug} (${algo.viz})`, async () => {
      const errors = []
      const origErr = console.error
      console.error = (...a) => { errors.push(a.map(String).join(' ')); origErr(...a) }
      try {
        const { container } = render(
          <StepProvider>
            <PlaygroundFor algo={algo} />
          </StepProvider>
        )
        // 等 lazy playground 加载出内容（非白屏）
        await waitFor(() => {
          expect(container.textContent.length).toBeGreaterThan(0)
        }, { timeout: 3000 })

        // 有「下一步」就连点几步，触发步骤序列的不同分支
        const nextBtns = screen.queryAllByRole('button', { name: '下一步' })
        if (nextBtns.length) {
          for (let i = 0; i < 4; i++) {
            await act(async () => { fireEvent.click(nextBtns[0]) })
          }
        }
      } finally {
        console.error = origErr
      }

      // 只留真实运行时错误：过滤 act() 提示、React 开发提示等噪声
      const real = errors.filter(e =>
        !/not wrapped in act|Warning: ReactDOM|deprecated|Download the React|\[monitoring\]/i.test(e))
      expect(real, `${algo.slug} 渲染/单步出错:\n${real.slice(0, 2).join('\n---\n')}`).toEqual([])
    })
  }
})
