// 哈希联接（Hash Join）可视化
// Build phase: 用较小的表 R 建立哈希表 H，key = join column
// Probe phase: 遍历较大的表 S，对每行 hash 后到 H 中找配对，输出 join 结果

function h(key, m) {
  return ((key * 2654435761) >>> 0) % m
}

export function hashJoin(R, S, m = 5) {
  const steps = []
  const ht = Array.from({ length: m }, () => [])  // bucket → [{ row, hash }]
  const result = []

  function snap(phase, focusR, focusS, focusBucket, focusKey, desc, cppLine) {
    steps.push({
      ht: ht.map(b => b.map(e => ({ ...e, row: { ...e.row } }))),
      result: result.map(r => ({ ...r })),
      R: R.map(r => ({ ...r })),
      S: S.map(s => ({ ...s })),
      phase, focusR, focusS, focusBucket, focusKey,
      description: desc,
      cppLine,
    })
  }

  snap('init', -1, -1, -1, null,
    `初始化：R 共 ${R.length} 行（build side），S 共 ${S.length} 行（probe side），哈希表桶数 m = ${m}。`, 3)

  // BUILD
  for (let i = 0; i < R.length; i++) {
    const row = R[i]
    const bucket = h(row.key, m)
    snap('build-hash', i, -1, bucket, row.key,
      `Build：取 R[${i}] = (key=${row.key}, ${row.label})，hash(${row.key}) = ${bucket}。`, 7)
    ht[bucket].push({ row, hash: bucket })
    snap('build-insert', i, -1, bucket, row.key,
      `将 (${row.key}, ${row.label}) 放入桶 ${bucket}${ht[bucket].length > 1 ? '（链上已有，发生冲突）' : ''}。`, 8)
  }

  snap('probe-start', -1, -1, -1, null,
    `Build 完成。哈希表中共 ${R.length} 项，最长链 = ${Math.max(...ht.map(b => b.length))}。开始 Probe。`, 11)

  // PROBE
  for (let j = 0; j < S.length; j++) {
    const srow = S[j]
    const bucket = h(srow.key, m)
    snap('probe-hash', -1, j, bucket, srow.key,
      `Probe：取 S[${j}] = (key=${srow.key}, ${srow.label})，hash(${srow.key}) = ${bucket}，访问桶。`, 13)
    let matched = 0
    for (const entry of ht[bucket]) {
      if (entry.row.key === srow.key) {
        const out = { r: entry.row, s: srow }
        result.push(out)
        matched++
        snap('match', R.indexOf(entry.row), j, bucket, srow.key,
          `匹配：R(${entry.row.key}, ${entry.row.label}) ⋈ S(${srow.key}, ${srow.label}) → 输出 join 结果。`, 15)
      }
    }
    if (matched === 0) {
      snap('miss', -1, j, bucket, srow.key,
        `桶 ${bucket} 中没有 key=${srow.key} 的项，S[${j}] 无匹配（inner join 跳过）。`, 17)
    }
  }

  snap('done', -1, -1, -1, null,
    `Hash Join 完成：共输出 ${result.length} 条结果。`, 20)

  return steps
}
