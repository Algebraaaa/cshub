// ielts:check-templates —— 讲解质量离线回归。
// 对 FIXTURES 里每个模板的每个登记版本（当前只有 v1；模板升 v2 后保留 v1
// 夹具即可同时校验两个版本）：
//   1) 所有 validOutputs 必须通过 validate + verifyOutput；
//   2) 所有 invalidOutputs 必须被 validate 或证据校验拦下；
//   3) 模板自带 mock 在夹具输入下也必须合规（模拟反馈自身不能违法）。
// 任何一条不满足即非零退出，防止改模板/校验器时悄悄放松质量门。
import { TEMPLATES } from '../../src/features/ielts/llm/templates.js'
import { FIXTURES } from './fixtures.mjs'

let failures = 0
function fail(msg) {
  console.error(`  ✗ ${msg}`)
  failures += 1
}

for (const [id, versions] of Object.entries(FIXTURES)) {
  const template = TEMPLATES[id]
  if (!template) { fail(`模板未注册：${id}`); continue }
  for (const [version, fx] of Object.entries(versions)) {
    if (Number(version) !== template.version) {
      fail(`${id} 夹具版本 v${version} 与注册版本 v${template.version} 不一致（升版本需新增夹具并保留旧版）`)
    }
    for (const out of fx.validOutputs) {
      const errors = template.validate(out)
      if (errors.length) fail(`${id} v${version} 合规样例被拒：${errors.join('；')}`)
      if (typeof template.verifyOutput === 'function') {
        const ev = template.verifyOutput(out, fx.variables)
        if (!ev.ok) fail(`${id} v${version} 合规样例证据校验失败：${ev.missing.join('|')}`)
      }
    }
    for (const bad of fx.invalidOutputs) {
      const errors = template.validate(bad.output)
      const ev = typeof template.verifyOutput === 'function'
        ? template.verifyOutput(bad.output, fx.variables)
        : { ok: true, missing: [] }
      if (errors.length === 0 && ev.ok) {
        fail(`${id} v${version} 不合规样例（${bad.reason}）竟然通过了全部检查`)
      }
    }
    // mock 自洽
    const mock = template.mock(fx.variables)
    const mockErrors = template.validate(mock)
    if (mockErrors.length) fail(`${id} v${version} 内置 mock 不合法：${mockErrors.join('；')}`)
    if (typeof template.verifyOutput === 'function') {
      const ev = template.verifyOutput(mock, fx.variables)
      if (!ev.ok) fail(`${id} v${version} 内置 mock 证据失败：${ev.missing.join('|')}`)
    }
  }
}

// 反向覆盖：注册表中的每个模板都必须有夹具，避免“新模板无回归”
for (const id of Object.keys(TEMPLATES)) {
  if (!FIXTURES[id]) fail(`模板 ${id} 缺少质量回归夹具`)
}

if (failures) {
  console.error(`\n[ielts:check-templates] ${failures} 条质量门失败`)
  process.exit(1)
}
console.log(`[ielts:check-templates] OK：${Object.keys(TEMPLATES).length} 个模板、${Object.values(FIXTURES).reduce((n, v) => n + Object.keys(v).length, 0)} 个版本全部通过`)
