// 每个 AI Playground 都必须能无异常渲染（崩溃回归守卫）
//
// 背景：NeuralNetworkPlayground 曾因 `layer.size.map`（size 是数字不是数组）
// 在打开 dl-neural-network 课节时抛错，被 App 级 ErrorBoundary 兜住显示
// "该模块加载失败"。当时没有任何测试覆盖到组件渲染，靠人工/浏览器才发现。
// 这个测试把全部 ai-playgrounds 的 *Playground.jsx 逐个挂载，任一抛错即失败。
import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'
import { AIPlaygroundTelemetryProvider } from './AIPlaygroundTelemetryContext'

// Vite 在测试环境同样支持 import.meta.glob（eager 直接拿到模块）
const modules = import.meta.glob('./*Playground.jsx', { eager: true })

// 这些是「分发器/上下文」而非具体可视化，需要特定 props，单独在别处测，跳过。
const SKIP = new Set(['AIPlaygroundFor', 'AIInfoTheoryBridgePlayground'])

const entries = Object.entries(modules)
  .map(([path, mod]) => [path.split('/').pop().replace('.jsx', ''), mod.default])
  .filter(([name, comp]) => typeof comp === 'function' && !SKIP.has(name))

test('收集到一批 AI playground 组件', () => {
  // 防止 glob 失效导致测试空跑而误判通过
  expect(entries.length).toBeGreaterThan(40)
})

describe.each(entries)('%s', (name, Comp) => {
  test('挂载不抛异常，且产出可视内容', () => {
    // 大多数 playground 内部自带 preset，不依赖 props；少数读 viz/lesson，
    // 缺省时应优雅降级而非崩溃。用 telemetry provider 包一层模拟真实环境。
    let container
    expect(() => {
      ;({ container } = render(
        <AIPlaygroundTelemetryProvider onSnapshotChange={() => {}}>
          <Comp viz={undefined} lesson={{ id: 'test', title: name }} />
        </AIPlaygroundTelemetryProvider>
      ))
    }, `${name} 渲染时抛异常`).not.toThrow()
    // 渲染出真实 DOM（svg / 表格 / 文本），不是空壳
    expect(container.querySelector('svg, table, canvas, div')).toBeTruthy()
  })
})
