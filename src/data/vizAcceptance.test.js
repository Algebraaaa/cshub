// 可视化数据一致性验收
//
// 防住两类已经真实发生过的事故：
// 1. tree.js 嵌套残留的旧版 avl/treap 定义（viz: 'tree'）被元数据生成器
//    先扫到，生成出 registry 里不存在的 viz key —— 静态目录与详情页脱节。
// 2. pipelinehazard 在 co.js 和 extraAlgorithms.js 各有一份定义，
//    元数据取了前者、运行时聚合取了后者 —— 目录显示与页面内容不一致。
import { test, expect } from 'vitest'
import { ALGORITHMS as META } from './algorithmMeta.js'
import { ALGORITHMS as RUNTIME } from './algorithms.js'
import { getPlaygroundLoader } from '../components/learning/playgroundRegistry.js'

test('每个运行时算法的 viz key 都有对应 Playground loader', () => {
  const missing = Object.values(RUNTIME)
    .filter(a => !getPlaygroundLoader(a.viz))
    .map(a => `${a.slug} (viz: ${a.viz})`)
  expect(missing).toEqual([])
})

test('每个静态元数据算法的 viz key 都有对应 Playground loader', () => {
  const missing = Object.values(META)
    .filter(a => !getPlaygroundLoader(a.viz))
    .map(a => `${a.slug} (viz: ${a.viz})`)
  expect(missing).toEqual([])
})

test('静态元数据与运行时聚合：slug 集合一致、viz 一致', () => {
  const problems = []
  for (const [slug, meta] of Object.entries(META)) {
    const rt = RUNTIME[slug]
    if (!rt) { problems.push(`${slug}：元数据有、运行时缺`); continue }
    if (rt.viz !== meta.viz) problems.push(`${slug}：meta viz=${meta.viz} ≠ runtime viz=${rt.viz}`)
  }
  for (const slug of Object.keys(RUNTIME)) {
    if (!META[slug]) problems.push(`${slug}：运行时有、元数据缺（需要 npm run generate:meta）`)
  }
  expect(problems).toEqual([])
})

test('每个运行时算法都有可执行的步骤函数', () => {
  const missing = Object.values(RUNTIME)
    .filter(a => typeof a.fn !== 'function')
    .map(a => a.slug)
  expect(missing).toEqual([])
})
