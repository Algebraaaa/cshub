// 事务隔离级别可视化：在两个事务 T1 / T2 的时间线上演示
// 脏读（Dirty Read）、不可重复读（Non-repeatable Read）、幻读（Phantom Read）
//
// 每一步快照：{ rows, log, focusTxn, actionKind, level, description }
// rows: [{ id, value, lockedBy }]  ← 当前可见的物理行（简化模型）
// log:  [{ txn, op, target, value }, ...]  ← 时间线上的事件
//
// scenario: 'dirty' | 'nonrepeatable' | 'phantom'
// level:    'read-uncommitted' | 'read-committed' | 'repeatable-read' | 'serializable'

const LEVEL_NAMES = {
  'read-uncommitted': '读未提交（RU）',
  'read-committed':   '读已提交（RC）',
  'repeatable-read':  '可重复读（RR）',
  'serializable':     '可串行化（S）',
}

function clone(rows) { return rows.map(r => ({ ...r })) }

export function transactionScenario(scenario, level) {
  const steps = []
  // 初始数据
  let committed = [{ id: 1, balance: 100 }, { id: 2, balance: 50 }]
  // 各事务的未提交快照
  const drafts = { T1: null, T2: null }
  // 仓库内的物理行（已提交版本，模拟）
  let physical = clone(committed)
  // 各事务读到的内容（演示不可重复读 / 幻读）
  const seen = { T1: [], T2: [] }
  const log = []

  function push(focusTxn, actionKind, desc) {
    steps.push({
      rows: clone(physical),
      drafts: { T1: drafts.T1 ? clone(drafts.T1) : null, T2: drafts.T2 ? clone(drafts.T2) : null },
      log: log.slice(),
      seen: { T1: seen.T1.slice(), T2: seen.T2.slice() },
      committed: clone(committed),
      focusTxn, actionKind, level,
      levelName: LEVEL_NAMES[level],
      scenario,
      description: desc,
    })
  }

  // 通用：T 事务读取 id 这行
  function read(T, id) {
    let value
    // RU：读未提交 → 任何 draft 都可见
    // RC：只读已提交（committed）
    // RR：第一次读建立快照，后续都从快照读
    // S：等价于 RR（这里简化）
    if (level === 'read-uncommitted') {
      // 如果对方事务的 draft 有这行，看 draft；否则看 committed
      const otherT = T === 'T1' ? 'T2' : 'T1'
      const draftRow = drafts[otherT]?.find(r => r.id === id)
      const myDraft = drafts[T]?.find(r => r.id === id)
      const phys = physical.find(r => r.id === id)
      value = myDraft?.balance ?? draftRow?.balance ?? phys?.balance
    } else if (level === 'read-committed') {
      const myDraft = drafts[T]?.find(r => r.id === id)
      const c = committed.find(r => r.id === id)
      value = myDraft?.balance ?? c?.balance
    } else {
      // RR / S：第一次读建立快照
      if (!seen[T]._snapshot) seen[T]._snapshot = clone(committed)
      const snap = seen[T]._snapshot.find(r => r.id === id)
      const myDraft = drafts[T]?.find(r => r.id === id)
      value = myDraft?.balance ?? snap?.balance
    }
    seen[T].push({ id, value, at: log.length })
    return value
  }

  function readAll(T) {
    let rows
    if (level === 'read-uncommitted') {
      // 看 physical（含未提交 draft 数据）
      rows = clone(physical)
    } else if (level === 'read-committed') {
      // 当前 committed 的全部
      rows = clone(committed)
    } else {
      if (!seen[T]._snapshot) seen[T]._snapshot = clone(committed)
      rows = clone(seen[T]._snapshot)
    }
    return rows
  }

  function write(T, id, delta) {
    if (!drafts[T]) drafts[T] = clone(committed)
    const row = drafts[T].find(r => r.id === id)
    if (row) row.balance += delta
    // RU 下 physical 立即反映；其他级别要等 commit 才反映
    if (level === 'read-uncommitted') {
      const p = physical.find(r => r.id === id)
      if (p) p.balance += delta
    }
  }

  function insert(T, id, balance) {
    if (!drafts[T]) drafts[T] = clone(committed)
    drafts[T].push({ id, balance })
    if (level === 'read-uncommitted') physical.push({ id, balance })
  }

  function commit(T) {
    if (!drafts[T]) return
    committed = clone(drafts[T])
    physical = clone(committed)
    drafts[T] = null
  }

  function rollback(T) {
    drafts[T] = null
    if (level === 'read-uncommitted') physical = clone(committed)
  }

  // ─── 场景脚本 ──
  push(null, 'init', `场景：${scenarioName(scenario)} · 隔离级别：${LEVEL_NAMES[level]}。初始余额 A=100，B=50。`)

  if (scenario === 'dirty') {
    log.push({ txn: 'T1', op: 'BEGIN' }); push('T1', 'begin', 'T1 开启事务。')
    log.push({ txn: 'T1', op: 'UPDATE A -= 60' }); write('T1', 1, -60); push('T1', 'write', 'T1：UPDATE accounts SET balance = balance - 60 WHERE id = 1（但尚未提交）。')
    log.push({ txn: 'T2', op: 'BEGIN' }); push('T2', 'begin', 'T2 开启事务（与 T1 并发）。')
    const v = read('T2', 1)
    log.push({ txn: 'T2', op: `READ A → ${v}` }); push('T2', 'read', leveledDirtyMsg(level, v))
    log.push({ txn: 'T1', op: 'ROLLBACK' }); rollback('T1'); push('T1', 'rollback', 'T1 回滚！它的修改全部撤销。')
    log.push({ txn: 'T2', op: 'COMMIT' }); commit('T2'); push('T2', 'commit', dirtyOutcome(level, v))
  }

  if (scenario === 'nonrepeatable') {
    log.push({ txn: 'T1', op: 'BEGIN' }); push('T1', 'begin', 'T1 开启事务，准备读两次以验证一致性。')
    const v1 = read('T1', 1)
    log.push({ txn: 'T1', op: `READ A → ${v1}` }); push('T1', 'read', `T1：第一次读 A，得到 ${v1}。`)
    log.push({ txn: 'T2', op: 'BEGIN' }); push('T2', 'begin', 'T2 开启事务。')
    log.push({ txn: 'T2', op: 'UPDATE A += 200' }); write('T2', 1, 200); push('T2', 'write', 'T2：UPDATE accounts SET balance = balance + 200 WHERE id = 1。')
    log.push({ txn: 'T2', op: 'COMMIT' }); commit('T2'); push('T2', 'commit', 'T2 提交：A 持久化为新值。')
    const v2 = read('T1', 1)
    log.push({ txn: 'T1', op: `READ A → ${v2}` }); push('T1', 'read', nonrepMsg(level, v1, v2))
    log.push({ txn: 'T1', op: 'COMMIT' }); commit('T1'); push('T1', 'commit', nonrepOutcome(level, v1, v2))
  }

  if (scenario === 'phantom') {
    log.push({ txn: 'T1', op: 'BEGIN' }); push('T1', 'begin', 'T1 开启事务，准备两次 SELECT * 检查行数。')
    const r1 = readAll('T1')
    log.push({ txn: 'T1', op: `SELECT * → ${r1.length} rows` }); push('T1', 'readAll', `T1：第一次 SELECT，看到 ${r1.length} 行。`)
    log.push({ txn: 'T2', op: 'BEGIN' }); push('T2', 'begin', 'T2 开启事务。')
    log.push({ txn: 'T2', op: 'INSERT id=3 bal=300' }); insert('T2', 3, 300); push('T2', 'insert', 'T2：INSERT INTO accounts VALUES (3, 300)。')
    log.push({ txn: 'T2', op: 'COMMIT' }); commit('T2'); push('T2', 'commit', 'T2 提交：表中多了一行。')
    const r2 = readAll('T1')
    log.push({ txn: 'T1', op: `SELECT * → ${r2.length} rows` }); push('T1', 'readAll', phantomMsg(level, r1.length, r2.length))
    log.push({ txn: 'T1', op: 'COMMIT' }); commit('T1'); push('T1', 'commit', phantomOutcome(level, r1.length, r2.length))
  }

  return steps
}

function scenarioName(s) {
  return { dirty: '脏读', nonrepeatable: '不可重复读', phantom: '幻读' }[s] || s
}

function leveledDirtyMsg(level, v) {
  if (level === 'read-uncommitted') return `T2：读 A，看到 ${v}（**脏数据**！T1 还未提交）。`
  return `T2：读 A，看到 ${v}（隔离级别保护了 T2，看到的仍是 100）。`
}
function dirtyOutcome(level, v) {
  if (level === 'read-uncommitted') return `结果：T2 基于脏数据 ${v} 决策——经典脏读 bug。`
  return `结果：T2 全程看到一致的 committed 状态，**未发生脏读**。`
}
function nonrepMsg(level, v1, v2) {
  if (v1 !== v2) return `T1：第二次读 A，得到 ${v2}（与第一次的 ${v1} 不同！**不可重复读**）。`
  return `T1：第二次读 A，仍是 ${v1}（隔离级别保护了一致读取）。`
}
function nonrepOutcome(level, v1, v2) {
  if (v1 !== v2) return `结果：同一事务内两次读结果不同，发生不可重复读。RC 级别允许此现象。`
  return `结果：RR/S 级别确保事务内可重复读。T1 视角内始终是 ${v1}。`
}
function phantomMsg(level, n1, n2) {
  if (n1 !== n2) return `T1：第二次 SELECT，看到 ${n2} 行（与第一次的 ${n1} 不同！**幻读**）。`
  return `T1：第二次 SELECT，仍是 ${n1} 行（快照隔离保护了 T1）。`
}
function phantomOutcome(level, n1, n2) {
  if (n1 !== n2) return `结果：T1 看到「幻影行」。仅 Serializable / 谓词锁 / 间隙锁能完全消除幻读。`
  return `结果：RR（如 MySQL InnoDB）通过快照避免了幻读现象。`
}

// 入口：把场景和级别压成一个 ops 数组（Playground 直接传两个字符串）
export function txnIsolation(scenario, level) {
  return transactionScenario(scenario, level)
}
