// 数据库生成器正确性。口径：萨师煊/王珊《数据库系统概论》MVCC/事务隔离，
// PostgreSQL/InnoDB 快照隔离通用规则；Hash Join 用嵌套循环参考实现对拍。
import { describe, test, expect } from 'vitest'
import { hashJoin } from './database/hashJoin.js'
import { bPlusTreeInsert } from './database/bPlusTree.js'
import { mvccDemo } from './database/mvcc.js'
import { txnIsolation } from './database/transaction.js'
import { queryPlanSteps } from './database/queryPlan.js'

// ── Hash Join ──
function nestedLoopJoin(R, S) {
  const out = []
  for (const r of R) for (const s of S) if (r.key === s.key) out.push([r.label, s.label])
  return out.sort()
}

describe('Hash Join', () => {
  test('结果与嵌套循环参考实现一致（含重复键与桶冲突）', () => {
    const R = [{ key: 1, label: 'r1' }, { key: 6, label: 'r6' }, { key: 11, label: 'r11' }, { key: 1, label: 'r1b' }]
    const S = [{ key: 1, label: 's1' }, { key: 99, label: 's99' }, { key: 6, label: 's6' }, { key: 1, label: 's1b' }]
    const steps = hashJoin(R, S, 5)
    const got = steps.at(-1).result.map((o) => [o.r.label, o.s.label]).sort()
    expect(got).toEqual(nestedLoopJoin(R, S))
    // r1 ⋈ s1,s1b；r1b ⋈ s1,s1b；r6 ⋈ s6 → 5 条
    expect(got.length).toBe(5)
    const phases = steps.map((s) => s.phase)
    expect(phases[0]).toBe('init')
    expect(phases).toContain('done')
    // build 项数 = |R|；miss 只对应 s99 一个 S 行，match 按输出对计数（5 对）
    expect(steps.filter((s) => s.phase === 'build-insert').length).toBe(R.length)
    expect(steps.filter((s) => s.phase === 'miss').length).toBe(1)
    expect(steps.filter((s) => s.phase === 'match').length).toBe(5)
  })

  test('边界：空表', () => {
    expect(hashJoin([], [], 5).at(-1).result).toEqual([])
    expect(hashJoin([{ key: 1, label: 'a' }], [], 5).at(-1).result).toEqual([])
  })
})

// ── B+ 树 ──
function collectLeaves(root) {
  let node = root
  while (!node.isLeaf) node = node.children[0]
  const leaves = []
  const seen = new Set()
  while (node) {
    if (seen.has(node.id)) break
    seen.add(node.id)
    leaves.push(node)
    node = node.next
  }
  return leaves
}
function searchTree(root, key) {
  let node = root
  while (!node.isLeaf) {
    let i = 0
    while (i < node.keys.length && key >= node.keys[i]) i++
    node = node.children[i]
  }
  return node.keys.includes(key)
}
function checkNode(node, m) {
  expect(node.keys.length).toBeLessThanOrEqual(m - 1)
  const sorted = [...node.keys].sort((a, b) => a - b)
  expect(node.keys).toEqual(sorted)
  if (!node.isLeaf) {
    expect(node.children.length).toBe(node.keys.length + 1)
    node.children.forEach((c) => checkNode(c, m))
  }
}

describe('B+ 树插入', () => {
  test('插入后每个键都能检索到，叶子链有序且不越界（m=3 强分裂）', () => {
    const values = [10, 20, 5, 6, 12, 30, 7, 17, 1, 25]
    const steps = bPlusTreeInsert(3, values)
    const root = steps.at(-2).tree
    for (const v of values) expect(searchTree(root, v)).toBe(true)
    expect(searchTree(root, 99)).toBe(false)
    checkNode(root, 3)
    const leaves = collectLeaves(root)
    const chain = leaves.flatMap((l) => l.keys)
    expect(chain).toEqual([...new Set(values)].sort((a, b) => a - b))
  })

  test('较大 m：随机序列不变量成立', () => {
    let seed = 7
    const rand = () => { seed = (seed * 48271) % 2147483647; return seed % 50 }
    const values = Array.from({ length: 200 }, rand)
    const steps = bPlusTreeInsert(4, values)
    const root = steps.at(-2).tree
    checkNode(root, 4)
    for (const v of new Set(values)) expect(searchTree(root, v)).toBe(true)
  })

  test('重复键跳过', () => {
    const steps = bPlusTreeInsert(4, [1, 1, 1])
    const skip = steps.filter((s) => s.action === 'skip').length
    expect(skip).toBe(2)
  })
})

// ── MVCC ──
describe('MVCC 快照隔离', () => {
  test('【回归】T1 快照内看不到晚开始的 T2 提交：两次读 A 都是 100', () => {
    const steps = mvccDemo('snapshot')
    const readASteps = steps.filter((st) => String(st.activeTxn) === '1' && st.phase.includes('读 A'))
    expect(readASteps).toHaveLength(2)
    for (const st of readASteps) {
      const visible = st.versions.filter((v) => v.isVisible).map((v) => v.value)
      expect(visible).not.toContain(150)
      expect(visible).toContain(100)
    }
  })

  test('写冲突：T2 被中止，最终只保留 T1 的版本', () => {
    const steps = mvccDemo('write-conflict')
    const aborted = steps.some((s) => s.phase.includes('中止'))
    expect(aborted).toBe(true)
    const t2Wait = steps.filter((s) => String(s.activeTxn) === '2')
      .find((s) => s.phase.includes('写冲突'))
    // 等待时 T2 只能看到旧值 50（T1 未提交）
    expect(t2Wait.versions.find((v) => v.rowId === 'X' && v.isVisible)?.value).toBe(50)
  })

  test('VACUUM 后只保留当前版本', () => {
    const steps = mvccDemo('vacuum')
    const cleaned = steps.find((s) => s.phase.startsWith('VACUUM 清理'))
    expect(cleaned.versions).toHaveLength(1)
    expect(cleaned.versions[0]).toMatchObject({ rowId: 'Y', value: 40, xmax: null })
  })
})

// ── 事务隔离场景 ──
function readResults(scenario, level) {
  const steps = txnIsolation(scenario, level)
  return steps
    .filter((s) => s.focusTxn === 'T2' && s.actionKind === 'read')
    .map((s) => s.seen.T2.at(-1)?.value)
}

describe('事务隔离级别', () => {
  test('脏读：RU 读到未提交 40，RC 读已提交 100', () => {
    expect(readResults('dirty', 'read-uncommitted')).toContain(40)
    expect(readResults('dirty', 'read-committed')).toEqual([100])
  })

  test('不可重复读：RC 两次读不同，RR 两次一致', () => {
    function t1Reads(level) {
      return txnIsolation('nonrepeatable', level)
        .filter((s) => s.focusTxn === 'T1' && s.actionKind === 'read')
        .map((s) => s.seen.T1.at(-1)?.value)
    }
    const rc = t1Reads('read-committed')
    const rr = t1Reads('repeatable-read')
    expect(rc[0]).not.toBe(rc[1])
    expect(rr[0]).toBe(rr[1])
  })

  test('幻读：RC 行数变化，RR 快照下行数不变', () => {
    function secondReadDesc(level) {
      return txnIsolation('phantom', level)
        .filter((s) => s.focusTxn === 'T1' && s.actionKind === 'readAll')
        .at(-1).description
    }
    expect(secondReadDesc('read-committed')).toContain('看到 3 行')
    expect(secondReadDesc('repeatable-read')).toContain('仍是 2 行')
  })
})

describe('查询计划脚本', () => {
  for (const id of ['select', 'join', 'group']) {
    test(`${id}：节点边步骤齐全且每节点都有 done`, () => {
      const steps = queryPlanSteps(id)
      const nodeIds = new Set(steps[0].nodes.map((n) => n.id))
      for (const id2 of nodeIds) {
        expect(steps.some((s) => s.activeNodeId === id2
          && s.nodes.find((n) => n.id === id2)?.status === 'done')).toBe(true)
      }
    })
  }
})
