// MVCC 多版本并发控制可视化
// scenario: 'snapshot' | 'write-conflict' | 'vacuum'
//
// 每一步 step 结构：
// {
//   versions: [{ rowId, value, xmin, xmax, isVisible }],
//   txns: [{ id, label, status, snapshot }],
//   log: [{ txn, op, rowId, oldVal, newVal, desc }],
//   activeTxn: string,
//   highlight: { txnId, rowIds: [] },
//   phase: string,
//   description: string,
// }

function cloneTxns(txns) {
  return txns.map(t => ({ ...t, snapshot: t.snapshot ? [...t.snapshot] : [] }))
}

// MVCC 可见性规则（PostgreSQL 快照隔离口径，唐世渭/萨师煊《数据库系统概论》
// 多版本并发控制一节同类规则；xid 严格递增）：
// 对读者 reader（含 id 与开启时活跃事务列表 snapshot），版本 v 可见 iff：
//   1) 自己的写入对自己可见；否则创建者必须已提交、xmin < reader.id
//      （先于读者开始）且不在读者快照的活跃列表里；
//   2) 满足上面后，若 xmax 为空 → 可见；
//      xmax 是读者自己（自己更新/删除了该版本）→ 不可见；
//      删除事务未提交 / 在读者快照里 / xmax > reader.id（删除晚于读者开始）→ 仍可见。
function isVisible(v, reader, txns) {
  const xminTxn = txns.find(t => t.id === v.xmin)
  if (!xminTxn) return false
  const ownWrite = v.xmin === reader.id
  const xminOk = ownWrite
    || (xminTxn.status === 'committed' && v.xmin < reader.id && !reader.snapshot.includes(v.xmin))
  if (!xminOk) return false

  if (v.xmax === null || v.xmax === undefined) return true
  if (v.xmax === reader.id) return false
  const xmaxTxn = txns.find(t => t.id === v.xmax)
  if (!xmaxTxn || xmaxTxn.status !== 'committed') return true
  if (reader.snapshot.includes(v.xmax)) return true
  if (v.xmax > reader.id) return true
  return false
}

// 计算当前对指定读者可见的版本
function computeVisible(versions, reader, txns) {
  return versions.map(v => ({
    ...v,
    isVisible: reader ? isVisible(v, reader, txns) : false,
  }))
}

export function mvccDemo(scenario) {
  const steps = []
  let versions = []
  let txns = []
  let log = []

  function push(activeTxn, phase, description, highlightRowIds = []) {
    // 找当前活动的读事务（非 committed/aborted）用来计算可见性
    // activeTxn 可能是字符串 '1'，而 t.id 是数字，用字符串化统一比较
    const activeReader = txns.find(t => t.status === 'active' && String(t.id) === String(activeTxn))
    const visVersions = computeVisible(versions, activeReader, txns)
    steps.push({
      versions: visVersions,
      txns: cloneTxns(txns),
      log: log.slice(),
      activeTxn,
      highlight: { txnId: activeTxn, rowIds: highlightRowIds },
      phase,
      description,
    })
  }

  // ─── 场景：快照隔离 ───────────────────────────────────────────────
  if (scenario === 'snapshot') {
    // 初始：系统事务 xid=0 已写入初始数据
    txns = [
      { id: 0, label: 'INIT', status: 'committed', snapshot: [] },
    ]
    versions = [
      { rowId: 'A', value: 100, xmin: 0, xmax: null },
      { rowId: 'B', value: 200, xmin: 0, xmax: null },
    ]
    push(null, '初始状态', '数据库初始状态：行 A=100，B=200，由系统事务 xid=0 写入（已提交）。')

    // T1 开启，snapshot 记录当前活跃事务（此时无其他活跃事务）
    txns.push({ id: 1, label: 'T1', status: 'active', snapshot: [] })
    push('1', 'T1 开启', 'T1 开启事务（xid=1），拍摄快照：当前无其他活跃事务，snapshot=[]。')

    // T1 第一次读 A
    log.push({ txn: 'T1', op: 'READ A', rowId: 'A', oldVal: null, newVal: null, desc: 'T1 读取行 A' })
    push('1', 'T1 读 A（第一次）', 'T1 第一次读 A：xmin=0 已提交且不在 T1 快照中，xmax=null，版本可见 → A=100。', ['A'])

    // T2 开启
    txns.push({ id: 2, label: 'T2', status: 'active', snapshot: [1] }) // T1 此时活跃
    push('2', 'T2 开启', 'T2 开启事务（xid=2），拍摄快照：T1 仍在运行，snapshot=[1]（记录 T1 活跃）。')

    // T2 更新 A：将旧版本 xmax 置为 2，写入新版本 xmin=2
    const oldA = versions.find(v => v.rowId === 'A' && v.xmax === null)
    oldA.xmax = 2
    versions.push({ rowId: 'A', value: 150, xmin: 2, xmax: null })
    log.push({ txn: 'T2', op: 'UPDATE A=150', rowId: 'A', oldVal: 100, newVal: 150, desc: 'T2 更新 A=150（新版本 xmin=2）' })
    push('2', 'T2 更新 A', 'T2 将 A 从 100 更新为 150：旧版本 xmax 标记为 2，同时写入新版本 (xmin=2, value=150)。', ['A'])

    // T2 提交
    txns.find(t => t.id === 2).status = 'committed'
    log.push({ txn: 'T2', op: 'COMMIT', rowId: null, oldVal: null, newVal: null, desc: 'T2 提交' })
    push('2', 'T2 提交', 'T2 提交：新版本 (A=150, xmin=2) 现已持久化，但 T1 的快照仍包含"T2 曾活跃"。')

    // T1 再次读 A（快照隔离：仍看旧版本）
    log.push({ txn: 'T1', op: 'READ A（再次）', rowId: 'A', oldVal: null, newVal: null, desc: 'T1 再次读 A' })
    push('1', 'T1 再次读 A（快照隔离）',
      'T1 再次读 A：新版本 xmin=2 虽已提交，但 T2(xid=2) 晚于 T1(xid=1) 开始，对 T1 的快照不可见；'
      + '旧版本虽被 T2 更新（xmax=2），但删除发生在 T1 的快照之后，旧版本对 T1 仍然可见。'
      + '→ T1 两次读到的都是 A=100（可重复读）。', ['A'])

    // T1 读 B（正常）
    log.push({ txn: 'T1', op: 'READ B', rowId: 'B', oldVal: null, newVal: null, desc: 'T1 读取行 B' })
    push('1', 'T1 读 B', 'T1 读 B：只有一个版本 xmin=0，已提交且不在 T1 快照中，xmax=null → B=200 可见。', ['B'])

    // T1 提交
    txns.find(t => t.id === 1).status = 'committed'
    log.push({ txn: 'T1', op: 'COMMIT', rowId: null, oldVal: null, newVal: null, desc: 'T1 提交' })
    push(null, 'T1 提交', 'T1 提交。全程 T1 看到的 A=100 是事务开启时的一致快照，这就是快照隔离（Snapshot Isolation）的核心：每个事务看到自己开始时的数据库状态。')

    push(null, '演示结束', '快照隔离演示完毕。数据库中现有两个版本：旧版本 A=100(xmax=2，已删除)，新版本 A=150(xmax=null，当前)。')
  }

  // ─── 场景：写冲突 ───────────────────────────────────────────────
  if (scenario === 'write-conflict') {
    txns = [
      { id: 0, label: 'INIT', status: 'committed', snapshot: [] },
    ]
    versions = [
      { rowId: 'X', value: 50, xmin: 0, xmax: null },
    ]
    push(null, '初始状态', '初始：行 X=50，由系统事务 xid=0 写入。')

    // T1 开启
    txns.push({ id: 1, label: 'T1', status: 'active', snapshot: [] })
    push('1', 'T1 开启', 'T1 开启（xid=1），快照：snapshot=[]。')

    // T2 开启
    txns.push({ id: 2, label: 'T2', status: 'active', snapshot: [1] })
    push('2', 'T2 开启', 'T2 开启（xid=2），快照：snapshot=[1]（T1 仍活跃）。')

    // T1 尝试更新 X
    const vX = versions.find(v => v.rowId === 'X' && v.xmax === null)
    vX.xmax = 1
    versions.push({ rowId: 'X', value: 80, xmin: 1, xmax: null })
    log.push({ txn: 'T1', op: 'UPDATE X=80', rowId: 'X', oldVal: 50, newVal: 80, desc: 'T1 更新 X=80（获得行锁）' })
    push('1', 'T1 更新 X', 'T1 获得 X 的行锁，将旧版本 xmax 置为 1，写入新版本 (xmin=1, X=80)。', ['X'])

    // T2 也尝试更新 X → 检测到 T1 持有锁，等待
    log.push({ txn: 'T2', op: 'UPDATE X=30 → 等待', rowId: 'X', oldVal: 50, newVal: 30, desc: 'T2 尝试更新 X，检测到写-写冲突，进入等待' })
    push('2', 'T2 写冲突，等待', 'T2 也想更新 X，但检测到 T1 持有写锁（旧版本 xmax=1，T1 未提交）→ T2 进入等待（阻塞）。', ['X'])

    // T1 提交
    txns.find(t => t.id === 1).status = 'committed'
    log.push({ txn: 'T1', op: 'COMMIT', rowId: null, oldVal: null, newVal: null, desc: 'T1 提交' })
    push('1', 'T1 提交', 'T1 成功提交！新版本 (X=80, xmin=1) 持久化。行锁释放，T2 可以继续。', ['X'])

    // T2 被唤醒，检测到 T1 已提交后，检查策略：
    // 在 PostgreSQL 中，MVCC 下第一个写者胜，T2 需要等待 T1 提交后重新检查：
    // T1 已提交，T2 的 snapshot 包含 T1（snapshot=[1]），所以 T2 的快照"认为" T1 仍活跃，
    // 这意味着 T2 开启时的旧版本 X=50 已被 T1 更新（T1 的 xid=1，在 T2 开启前就活跃了）
    // 严格 first-updater-wins：T2 检测到冲突，T2 中止
    log.push({ txn: 'T2', op: 'ABORT（写冲突）', rowId: 'X', oldVal: null, newVal: null, desc: 'T2 中止：First-Writer-Wins 策略' })
    txns.find(t => t.id === 2).status = 'aborted'
    // 撤销 T2 未完成的操作（其实 T2 还没写入版本）
    push('2', 'T2 中止（First-Writer-Wins）', 'T1 已提交，T2 检测到 X 的最新版本由 T1（xmin=1）写入，比 T2 的快照基础版本更新，写写冲突无法解决 → T2 中止（ABORT）。MVCC First-Writer-Wins 策略。', ['X'])

    // 最终状态
    push(null, '最终状态', '最终：X=80（T1 写入），T2 的更新因写冲突而中止。数据库保持一致性：旧版本 X=50(xmax=1)，当前版本 X=80(xmax=null)。')
  }

  // ─── 场景：VACUUM 旧版本清理 ────────────────────────────────────
  if (scenario === 'vacuum') {
    txns = [
      { id: 0, label: 'INIT', status: 'committed', snapshot: [] },
    ]
    versions = [
      { rowId: 'Y', value: 10, xmin: 0, xmax: null },
    ]
    push(null, '初始状态', 'VACUUM 演示：行 Y=10。接下来经过三轮更新，每次生成旧版本，最后由 VACUUM 清理。')

    // 第一轮：T1 更新
    txns.push({ id: 1, label: 'T1', status: 'active', snapshot: [] })
    push('1', 'T1 开启', 'T1 开启（xid=1）。')
    const v0 = versions.find(v => v.rowId === 'Y' && v.xmax === null)
    v0.xmax = 1
    versions.push({ rowId: 'Y', value: 20, xmin: 1, xmax: null })
    log.push({ txn: 'T1', op: 'UPDATE Y=20', rowId: 'Y', oldVal: 10, newVal: 20, desc: 'T1 将 Y 从 10 更新为 20' })
    push('1', 'T1 更新 Y=20', 'T1 写新版本 (Y=20, xmin=1)，旧版本 xmax 置为 1。', ['Y'])
    txns.find(t => t.id === 1).status = 'committed'
    log.push({ txn: 'T1', op: 'COMMIT', rowId: null, oldVal: null, newVal: null, desc: 'T1 提交' })
    push('1', 'T1 提交', 'T1 提交。旧版本 Y=10(xmax=1) 已不是最新，但可能还有快照引用它。')

    // 第二轮：T2 更新
    txns.push({ id: 2, label: 'T2', status: 'active', snapshot: [] })
    push('2', 'T2 开启', 'T2 开启（xid=2），snapshot=[]（T1 已提交，不在 snapshot 中）。')
    const v1 = versions.find(v => v.rowId === 'Y' && v.xmax === null)
    v1.xmax = 2
    versions.push({ rowId: 'Y', value: 30, xmin: 2, xmax: null })
    log.push({ txn: 'T2', op: 'UPDATE Y=30', rowId: 'Y', oldVal: 20, newVal: 30, desc: 'T2 将 Y 从 20 更新为 30' })
    push('2', 'T2 更新 Y=30', 'T2 写新版本 (Y=30, xmin=2)，中间版本 xmax 置为 2。', ['Y'])
    txns.find(t => t.id === 2).status = 'committed'
    log.push({ txn: 'T2', op: 'COMMIT', rowId: null, oldVal: null, newVal: null, desc: 'T2 提交' })
    push('2', 'T2 提交', 'T2 提交。现在有三个版本：Y=10, Y=20, Y=30，旧版本都被 xmax 标记。')

    // 第三轮：T3 更新
    txns.push({ id: 3, label: 'T3', status: 'active', snapshot: [] })
    push('3', 'T3 开启', 'T3 开启（xid=3）。')
    const v2 = versions.find(v => v.rowId === 'Y' && v.xmax === null)
    v2.xmax = 3
    versions.push({ rowId: 'Y', value: 40, xmin: 3, xmax: null })
    log.push({ txn: 'T3', op: 'UPDATE Y=40', rowId: 'Y', oldVal: 30, newVal: 40, desc: 'T3 将 Y 从 30 更新为 40' })
    push('3', 'T3 更新 Y=40', 'T3 写新版本 (Y=40, xmin=3)。现在有四个版本，旧的三个都有 xmax 标记。', ['Y'])
    txns.find(t => t.id === 3).status = 'committed'
    log.push({ txn: 'T3', op: 'COMMIT', rowId: null, oldVal: null, newVal: null, desc: 'T3 提交' })
    push('3', 'T3 提交', 'T3 提交。四个版本共存，旧版本 Y=10,20,30 占用存储空间。')

    // 检查是否有活跃事务引用旧快照
    push(null, 'VACUUM 触发', '系统检查：当前无任何活跃事务，不存在任何快照引用旧版本（xmax 已提交且无事务的 snapshot 包含它们）。VACUUM 可以安全清理。')

    // VACUUM 清理
    log.push({ txn: 'VACUUM', op: 'CLEAN Y=10,20,30', rowId: 'Y', oldVal: null, newVal: null, desc: 'VACUUM 清理 3 个旧版本' })
    // 移除 xmax 不为 null 的旧版本
    const before = versions.length
    versions = versions.filter(v => v.xmax === null)
    const removed = before - versions.length
    push(null, `VACUUM 清理（移除 ${removed} 个旧版本）`, `VACUUM 扫描版本链：所有 xmax 已提交的旧版本都不再被任何活跃快照引用 → 物理删除 ${removed} 个旧版本，释放存储空间。`, ['Y'])

    push(null, 'VACUUM 完成', `VACUUM 完成！只保留当前版本 Y=40(xmin=3, xmax=null)。这就是 PostgreSQL 等数据库定期执行 autovacuum 的原因：防止版本链无限增长（表膨胀 Table Bloat）。`)
  }

  return steps
}
