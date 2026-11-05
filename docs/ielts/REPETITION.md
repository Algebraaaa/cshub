# 间隔复习与整套报告（docs/ielts/REPETITION.md）

> 对应代码：`features/ielts/storage/spacedRepetition.js`、`storage/setReports.js`、
> `llm/callLog.js`、`scripts/ielts/fixtures.mjs` 与 `scripts/ielts/check-templates.mjs`。

## 1. 间隔复习规则（简化 SM-2）

适用对象：错题（`mistake:<id>`）、我的替换库（`para:<id>`）、收藏词块（`vocab:<id>`）。
排期状态只存元数据（阶段、间隔、到期时间、次数、遗忘次数），不存题干或词块正文，
键：`cshub-ielts-sr-v1`。

- **新条目**：stage 0，到期时间=现在（入库当天就要复习一次）。
- 回忆后自评四档，`nextState(item, grade)` 纯函数：

| 自评 | 规则 | 间隔变化 |
|---|---|---|
| 忘了 (0) | stage 归 0，lapses+1 | 回到 1 天 |
| 困难 (1) | stage 不变 | 间隔 ×1.5（至少 1 天） |
| 正常 (2) | stage+1 | 1 → 2 → 4 → 7 → 15 → 30 → 60 天（封顶 60） |
| 简单 (3) | stage+2 | 跳过两档后再 ×1.5（封顶 60） |

- “今天该复习什么”=`dueItems(now)`：`dueAt <= now`，按到期时间排序；
  入口页卡片显示错题/替换/词块各自的到期数。
- 错题在复存入错题库时自动 `ensureMany('mistake')`；替换入库（`addParaphrase`）与
  收藏词块（★）时自动建档；删除错题/替换、取消收藏会同步删除排期。
- 状态随「导出全部数据」一起导出/导入；「清空雅思数据」一并清除。

错题的“今日复习”在错题库页按**错因分组**，先回忆再展开答案与定位句，自评后重新排期；
词块库的收藏 Tab 与我的替换库对到期条目显示自评按钮。

## 2. 整套视图（/ielts/sets）

- 归套规则：`module + 来源标签` 相同的会话归为一套；听力期望 4 个 Part、阅读期望 3 篇，
  录齐标“已录齐”，否则标“部分 N/期望”。各部分按完成时间排序（因此录入顺序建议按
  Part 1→4 / Passage 1→3）。
- 每部分：正确数、正确率、折算原始分（按该部分正确率线性折算到 40 题）与估算 band；
  整套：总正确率折算 raw→`rawToBand`、整套用时（各部分 `durationSec` 之和）。
- 趋势：卡片内逐部分 band 序列；同一标签历史上多次录齐的整套给出跨次 band 趋势。
- 分数段一律标注“按官方锚点近似换算，非官方成绩”；规则来源见 `docs/ielts/RULES.md`。
- 报告导出：
  - **Markdown**：`buildMarkdown(set)` 生成总览/逐部分表格/错因/建议，下载 `.md`；
  - **打印/PDF**：`buildPrintHtml(md)` 在新窗口输出内联样式报告（`@page` 边距、
    `@media print` 隐藏操作按钮、表格边框与页眉适配），可用浏览器“另存为 PDF”。
  - 报告渲染只覆盖报告用到的 Markdown 子集（标题/表格/引用/列表/加粗/行内代码）。

## 3. 模型调用脱敏日志与质量回归

### 3.1 本地调用日志（`llm/callLog.js`，键 `cshub-ielts-llm-calls-v1`，最多 400 条）

每次 `runTemplate` 结束（`ok/mock/http-error/invalid-output`）记录一条：

```
{ ts, templateId, version, provider, status, simulated, evidenceOk,
  validationErrors[≤5], inputVarNames[], inputChars, outputKeys[],
  outputHash(8 位 FNV-1a), evidenceFields[], ms }
```

明确**不含**：API key、system/user 全文（原文/文稿/题目/答案）、模型返回正文；
`outputHash` 是短哈希，只能判断两次输出是否相同，不可逆推内容。设置页可导出
「模型调用复现包」（日志 + 模板变量/结构登记表）或清空日志。

### 3.2 离线模板质量门（`npm run ielts:check-templates`）

`scripts/ielts/fixtures.mjs` 为每个模板按**版本**登记固定样例：合规输出数组与
故意不合规输出数组（引用不是原文子串、缺字段、错因 id 非法、issues>3、chunks<3、
出现发音分等）。`check-templates.mjs` 断言：

1. 每个 `validOutputs[i]` 都通过 `validate` 与 `verifyOutput`；
2. 每个 `invalidOutputs[i]` 必被其中一道门拦下；
3. 模板自带 `mock(variables)` 也必须合规（模拟反馈不能违法）；
4. 注册表中的每个模板都必须有夹具（防新模板无回归）。

模板升级到 v2 时**保留 v1 夹具**，同一脚本即可同时验证两个版本的结构与证据门；
若版本号与夹具不一致直接失败。已接入 CI。该脚本本轮还逼出并修掉了 7 处 validator
漏洞（见 `docs/COURSE_AUDIT.md` 与提交说明），包括：定位句空串被误判非法、
session-summary 不限制条数/不校验错因 id、写作估分不强制“估算”开头、中译英采分点
不要求 2–3 个、口语 cueCard 不封顶、chunks/grammarFixes/发音字段未强制等。
