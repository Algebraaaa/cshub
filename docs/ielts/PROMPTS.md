# 模型模板登记（docs/ielts/PROMPTS.md）

> 唯一事实源：`src/features/ielts/llm/templates.js`。本文件与
> `dist-harness/ielts/commands.json` 都由该注册表生成/核对，改模板必须改注册表，
> 不要在页面里写散落的 prompt。
>
> 通用约定：
> - 所有输出都是**单个 JSON 对象**（`response_format: json_object`），不允许 Markdown 包裹；
> - 每条模板都带不可移除约束（见下），缺失变量直接 `missing-vars`，不发起调用；
> - 含引用字段的模板，输出先过 `validate`，再过 `verifyEvidence`（逐字子串校验），
>   不合格重试一次，仍不合格 → `invalid-output`，UI 标「讲解不可靠」。

## 通用铁律（注入每个讲解类模板）

1. 教练而非考生：解释「为什么答案册对、学生为什么错」，不重新做题、不推翻答案册。
2. 只使用本次提供的原文/文稿与答案册，不用外部常识。
3. 引用必须逐字复制，找不到就留空/明说，不许改写拼接。
4. 简体中文讲解，具体、简短、可执行，不写空泛鼓励。

---

## `reading-explain` v1 — 阅读单题讲解

- 变量：`passage, question, questionType, keyAnswer, userAnswer, judge, sourceLabel`
- 证据：`locationQuote` 及每条 `paraphrases[].passagePhrase` 必须是 `passage` 逐字子串。
- 输出：`{ locationQuote, paraphrases:[{questionPhrase,passagePhrase}], whyKeyCorrect, whyUserWrong, tfngNote?, suggestedReasonId }`
- 额外约束：判断题要把 FALSE 与 NOT GIVEN 的边界落到具体句子；`suggestedReasonId`
  只能取阅读错因 id。

## `reading-followup` v1 — 阅读单题追问

- 变量：`passage, question, keyAnswer, userQuestion`
- 输出：`{ answer, quotes:string[] }`（quotes 逐条证据校验；可空数组）
- 约束：原文没有依据时回答「原文没有提供这个信息」。

## `session-summary` v1 — 本篇/本 Part 小结

- 变量：`module, correctCount, totalCount, reasonStats, questions`
- 输出：`{ problems:[{reasonId, detail}]（≤3）, nextTips:string[]（1–2） }`
- 约束：只基于传入的判题与错因统计，不编造错误。

## `listening-explain` v1 — 听力单题讲解

- 变量：`transcript, question, questionType, keyAnswer, userAnswer, judge, reflection`
- 证据：`locationQuote` 必须是 `transcript` 逐字子串。
- 输出：`{ locationQuote, signalWords:string[], correction?, suggestedReasonId, advice }`
- 额外约束：标信号词、改口（actually/sorry/I mean）、干扰；连读弱读只能结合反思推断
  并注明「推断」；错因 id 只能取听力错因表。

## `writing-feedback` v1 — 写作分步反馈（intro/overview/body/outline/mock 通用）

- 变量：`stepId, prompt, text, knowledge, targetBand, strictness`
- 输出：`{ taskResponse, coherence, issues:[{quote,suggestion,reason}]（≤3）, expressions:string[]（1–2）, wordCountNote, estimatedBand }`
- 约束：先任务回应/构思/衔接再语言；最多 3 处问题，每处原句+改法+原因；
  绝不整篇重写/代写；outline 只查逻辑链与切题；不足 150/250 词必须提示；
  `estimatedBand` 只能给文字区间且以「估算」开头，不确定给空串。

## `translation-challenge` v1 — 中译英出题

- 变量：`level`
- 输出：`{ chinese, focus, referenceEnglish, keyPoints:string[]（2–3） }`
- 约束：侧重从句、介词搭配、常用句型；给一个自然参考译法。

## `translation-feedback` v1 — 中译英纠错

- 变量：`chinese, referenceEnglish, userTranslation`
- 输出：`{ issues:[{quote,suggestion,reason}]（≤3）, better }`
- 约束：针对语法/介词/句型，不代写整句，给一个更自然说法。

## `speaking-prompt` v1 — 口语出题（Part 1/2/3）

- 变量：`part, topic, part2Topic`
- 输出：`{ question, cueCard:string[] }`（cueCard 仅 Part 2 用，4 个提示点）
- 约束：P3 必须承接 `part2Topic` 往抽象/社会方向追问。

## `speaking-feedback` v1 — 口语反馈

- 变量：`part, question, answer`
- 输出：`{ chunks:[{meaning,native}]（3–5）, modelLines:string[]（1–2）, grammarFixes:[{quote,fix,reason}]（≤2）, interaction, estimates:{fc,lr,gra} }`
- 约束：先词块再自然示范；语法只改影响理解的（≤2）；三项估算是文字且以「估算」开头；
- 禁止：给发音分、给总分（发音仅凭文字无法评估，`speakingBand` 在缺 p 时会抛错）。

---

## 校验器强度（validator）

模板的 validate 与产品约束一一对应，且由 `npm run ielts:check-templates` 的正反夹具
强制：定位句允许空串（找不到不编造）但必须是字符串；session-summary problems ≤3 且
reasonId 必须在错因表内、nextTips 1–2 条；写作 issues ≤3、expressions 1–2、
estimatedBand 空串或以「估算」开头；中译英 keyPoints 2–3；口语 cueCard ≤4、
chunks 3–5、modelLines 1–2、grammarFixes ≤2、estimates 仅 fc/lr/gra 且以「估算」开头、
禁止发音/总分字段。

## 失败状态（runner）

| status | 含义 | UI 行为 |
|---|---|---|
| `mock` | 无 key，模板自带模拟反馈 | 醒目标「模拟反馈 · 非真实讲解」 |
| `missing-vars` | 必填变量缺失/为空 | 阻止发送，提示字段名 |
| `bad-template` | 模板 id 未注册 | 中转与前端都拒绝 |
| `invalid-output` | JSON/结构/证据两次不合格 | 「讲解不可靠」+ 重试 |
| `http-error` | 上游非 2xx/超时/无 content | 显示服务商错误，可重试 |
