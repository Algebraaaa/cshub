# 雅思规则来源与口径（docs/ielts/RULES.md）

> 所有规则以 IELTS / British Council / IDP / Cambridge English 公开材料为准。
> 来源目录保留候选实现记录的日期 2026-10-23，尚未逐条复核。IELTS 官方计分概览已于 2026-11-05 重新核对。
> 官方只公布锚点的，补全部分不称官方；官方未公开的细节列为「非官方假设」。

## 1. 规则出处登记

| 主题 | 出处 | 采用口径 |
|---|---|---|
| 听力/学术阅读/培训类阅读 原始分→band 锚点 | IELTS, *IELTS scoring in detail* — https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail | 官方提供部分平均原始分；系统表其他档位是非官方估算 |
| 总分取整 .25→.5 / .75→整分 | IELTS, *IELTS scoring in detail* — https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail | `round(mean*2)/2` |
| 单项分 0–9、半分一档 | British Council — https://takeielts.britishcouncil.org/score/ielts-band-scores ；IDP — https://www.idp.com/global/ielts/understanding-ielts-scores/ | 交叉核对 |
| 写作 Task 2 权重两倍于 Task 1 | British Council 写作评分说明 — https://takeielts.britishcouncil.org/take-ielts/prepare/ | `writingBand = round((T1 + 2*T2)/3)`，四维各占任务内 1/4 |
| 写作/口语评分维度与公开描述 | IELTS *Speaking and Writing performance descriptors* — https://www.ielts.org/for-test-takers/ielts-test-guide/ielts-speaking-and-writing-performance-descriptors | TR/TA、CC、LR、GRA；FC、LR、GRA、P |
| TRUE/FALSE/NOT GIVEN 定义 | BC, *Identifying information* — https://takeielts.britishcouncil.org/prepare-test/question-type/identifying-information-true-false-not-given | FALSE=与原文矛盾；NOT GIVEN=无法核实 |
| YES/NO/NOT GIVEN 定义 | BC, *Identifying writer’s views/claims* — https://takeielts.britishcouncil.org/prepare-test/question-type/identifying-writer-views-claims-yes-no-not-given | 与 TFNG 是两套标签，答混判 WRONG_LABEL_SET |
| 字数指令（ONE WORD ONLY / NO MORE THAN TWO WORDS / AND/OR A NUMBER 等） | BC, *Sentence completion* — https://takeielts.britishcouncil.org/prepare-test/question-type/sentence-completion | 见 `parseInstruction` 支持的七种指令 |
| 拼写必须正确；英/美拼写均可 | BC 同上答题说明 | key 以 `colour/color` 双写登记；编辑距离归类只用于归因提示 |

> 说明：以上链接为官方/官方备考站点的固定栏目地址；如页面迁移，以站内搜索同名页面为准。

## 2. 系统估算表（非官方完整表）

以下阈值用于本系统的粗略估算。官方只公布部分平均锚点，其余档位由系统补全，不是官方最低分数线；实际考试的换算可能不同。

### 听力 Listening（40 题）

| band | 9 | 8.5 | 8 | 7.5 | 7 | 6.5 | 6 | 5.5 | 5 | 4.5 | 4 | 3.5 | 3 | 2.5 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| raw ≥ | 39 | 37 | 35 | 32 | 30 | 26 | 23 | 18 | 16 | 13 | 11 | 8 | 6 | 4 |

### 学术类阅读 Academic Reading（40 题）

| band | 9 | 8.5 | 8 | 7.5 | 7 | 6.5 | 6 | 5.5 | 5 | 4.5 | 4 | 3.5 | 3 | 2.5 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| raw ≥ | 39 | 37 | 35 | 33 | 30 | 27 | 23 | 20 | 15 | 14 | 11 | 8 | 6 | 4 |

### 培训类阅读 General Training Reading（40 题）

| band | 9 | 8.5 | 8 | 7.5 | 7 | 6.5 | 6 | 5.5 | 5 | 4.5 | 4 | 3.5 | 3 | 2.5 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| raw ≥ | 40 | 39 | 37 | 36 | 34 | 32 | 30 | 27 | 23 | 19 | 15 | 12 | 9 | 6 |

表中部分锚点参考 IELTS 公布的平均数；补全的其他阈值和分档是系统假设，并非官方完整换算表。

## 3. 非官方假设（界面与导出都必须标注）

1. **锚点表以下**：raw=0 → band 0；1 ≤ raw < 最低锚点 → band 2.0。官方未公布，属系统外推。
2. **缩写**：T/F/NG、Y/N 一律不接受，必须写完整单词。官方答题说明没有统一的缩写许可口径，
   查不到就不接受。
3. **连字符**：`water-proof` 按一个词计字数；比较时再做一次「连字符↔空格」容错匹配。
4. **编辑距离**：与可接受写法 Levenshtein 距离 1–2 且非单复数差异 → 归「拼写」提示，
   **不自动算对**；官方只按拼写是否正确给分。
5. **写作/口语取整**：维度小分按 0.5 一档、均值按 .25/.75 取整；估分始终标「估算」，
   不显示成精确成绩。
6. **整卷估算**：单篇/单 Part 完成时按正确率线性折算 raw=round(correct/total×40) 再查锚点，
   仅用于看趋势，文案固定为「按官方锚点近似换算，非官方成绩」；官方明确说明整套（听力 4 Part、
   阅读 3 篇）共 40 题，分数以整套为准。

## 4. 判题口径细则

- 大小写不敏感；比较前去首尾标点、合并空白；撇号忽略（`don't` = `dont` 比较口径）。
- key：字符串或数组；`/` 分隔等价写法（`colour/color`）；圆括号片段可省略
  （`(the) museum` 同时接受 `museum` / `the museum`），多组括号取笛卡尔积。
- TFNG 答 YES/NO、YNNG 答 TRUE/FALSE → `WRONG_LABEL_SET`；NOT GIVEN 两套通用。
- 多选按集合相等判（顺序无关，分隔符任意）；匹配（罗马数字/字母）精确比较。
- 单复数：去/加 `s`、`es` 或 `y↔ies` 后命中等价写法 → `PLURAL`（多词答案作用于末词）。
- 字数限制：词数/数字数超限直接 `WORD_LIMIT` 判错，即使词形接近。

## 5. 版权边界

仓库不内置任何雅思官方/剑桥真题、音频、文稿；内置示例（城市蜜蜂阅读、周末课程听力、
写作图表题、口语话题、词块例句）全部原创，界面标注「原创示例，非真题」，并提示用户只使用
自己有权使用的材料。
