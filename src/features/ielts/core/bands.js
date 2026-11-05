// ─────────────────────────────────────────────────────────────
// bands · IELTS 原始分 ↔ 等级分换算
//
// 官方只公布部分平均原始分锚点；本表其余档位由系统补全，属于估算，
// 不能称为官方完整换算表或保证某场考试的最低分数线。
// 表外区间与补全档位均为非官方假设，见 docs/ielts/RULES.md。
// ─────────────────────────────────────────────────────────────

/**
 * 系统估算阈值：band → 用于本系统估算的原始分；仅部分点为官方平均锚点。
 * @type {Record<string, Record<string, number>>}
 */
export const RAW_BAND_ANCHORS = {
  listening: {
    9: 39, 8.5: 37, 8: 35, 7.5: 32, 7: 30, 6.5: 26, 6: 23,
    5.5: 18, 5: 16, 4.5: 13, 4: 11, 3.5: 8, 3: 6, 2.5: 4,
  },
  'reading-academic': {
    9: 39, 8.5: 37, 8: 35, 7.5: 33, 7: 30, 6.5: 27, 6: 23,
    5.5: 20, 5: 15, 4.5: 14, 4: 11, 3.5: 8, 3: 6, 2.5: 4,
  },
  'reading-general': {
    9: 40, 8.5: 39, 8: 37, 7.5: 36, 7: 34, 6.5: 32, 6: 30,
    5.5: 27, 5: 23, 4.5: 19, 4: 15, 3.5: 12, 3: 9, 2.5: 6,
  },
}

/**
 * 非官方假设：官方锚点表以下的分数如何处理。
 * - raw 0：band 0（缺考/全错口径，非官方）
 * - 1 ≤ raw < 最低锚点：band 2.0（外推一档，非官方）
 */
export const BELOW_TABLE_POLICY = {
  zeroBand: 0,
  extrapolatedBand: 2.0,
  official: false,
}

/**
 * 原始分 → 等级分（0.5 一档）。
 * @param {'listening'|'reading-academic'|'reading-general'} module
 * @param {number} raw 0–40 的整数
 * @returns {number} band（0 或 2.0–9，0.5 一档）
 */
export function rawToBand(module, raw) {
  const table = RAW_BAND_ANCHORS[module]
  if (!table) {
    throw new RangeError(`rawToBand: unknown module "${module}"`)
  }
  const num = Number(raw)
  if (!Number.isFinite(num)) throw new TypeError(`rawToBand: raw 不是数字 (${raw})`)
  const score = Math.round(num)
  if (score < 0 || score > 40) throw new RangeError(`rawToBand: raw 超出 0–40 (${raw})`)
  if (score === 0) return BELOW_TABLE_POLICY.zeroBand
  const bands = Object.keys(table)
    .map(Number)
    .sort((a, b) => b - a)
  for (const band of bands) {
    if (score >= table[band]) return band
  }
  return BELOW_TABLE_POLICY.extrapolatedBand
}

/**
 * 官方取整：均值落在 .25 进 .5、.75 进下一个整分（其余就近取 0.5）。
 * JS Math.round 对半值向上取整，×2 后 round 再 /2 正好实现该规则。
 * @param {number} x
 * @returns {number}
 */
export function roundToHalf(x) {
  return Math.round(x * 2) / 2
}

/**
 * 总分：四项平均后按官方规则取整到整分/半分。
 * @param {{listening: number, reading: number, writing: number, speaking: number}} scores
 * @returns {number}
 */
export function overallBand({ listening, reading, writing, speaking }) {
  const parts = [listening, reading, writing, speaking]
  if (parts.some((s) => typeof s !== 'number' || !Number.isFinite(s))) {
    throw new TypeError('overallBand: 四项分数都必须是数字')
  }
  if (parts.some((s) => s < 0 || s > 9)) throw new RangeError('overallBand: 分数必须在 0–9')
  const mean = parts.reduce((a, b) => a + b, 0) / 4
  return roundToHalf(mean)
}

/**
 * 写作汇总：Task 2 权重为 Task 1 的两倍（官方口径），再按 .25/.75 取整。
 * @param {{task1: {ta:number,cc:number,lr:number,gra:number},
 *          task2: {tr:number,cc:number,lr:number,gra:number}}} input
 * @returns {number}
 */
export function writingBand({ task1, task2 }) {
  if (!task1 || !task2) throw new TypeError('writingBand: 需要 task1 与 task2 两项小分')
  const t1Scores = [task1.ta, task1.cc, task1.lr, task1.gra]
  const t2Scores = [task2.tr, task2.cc, task2.lr, task2.gra]
  const all = [...t1Scores, ...t2Scores]
  if (all.some((s) => typeof s !== 'number' || !Number.isFinite(s))) {
    throw new TypeError('writingBand: 八个小分都必须是数字')
  }
  if (all.some((s) => s < 0 || s > 9)) throw new RangeError('writingBand: 小分必须在 0–9')
  const t1 = t1Scores.reduce((a, b) => a + b, 0) / 4
  const t2 = t2Scores.reduce((a, b) => a + b, 0) / 4
  return roundToHalf((t1 + 2 * t2) / 3)
}

/**
 * 口语汇总：四项等权平均后取整。四项（含发音 p）都给定时才能调用——
 * 仅凭文字无法评估发音，界面不得在缺 p 时用它编造总分。
 * @param {{fc:number, lr:number, gra:number, p:number}} input
 * @returns {number}
 */
export function speakingBand({ fc, lr, gra, p }) {
  const parts = [fc, lr, gra, p]
  if (parts.some((s) => s === undefined || s === null)) {
    throw new TypeError('speakingBand: 四项小分（含发音 p）必须全部提供')
  }
  if (parts.some((s) => typeof s !== 'number' || !Number.isFinite(s))) {
    throw new TypeError('speakingBand: 四项小分都必须是数字')
  }
  if (parts.some((s) => s < 0 || s > 9)) throw new RangeError('speakingBand: 小分必须在 0–9')
  return roundToHalf((fc + lr + gra + p) / 4)
}
