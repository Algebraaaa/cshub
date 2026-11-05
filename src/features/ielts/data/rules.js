// ─────────────────────────────────────────────────────────────
// rules · 规则来源登记（第十二节）
//
// 每条规则记录链接、访问日期与适用范围。官方只公布锚点的，补全表
// 不称官方；官方未公开的取整细节做成 ASSUMPTIONS（非官方假设）。
// 同步维护 docs/ielts/RULES.md。
// ─────────────────────────────────────────────────────────────

// Date carried forward from the candidate's source inventory; individual links
// still require verification. The scoring overview was checked on 2026-11-05.
export const ACCESS_DATE = '2026-10-23'

/**
 * @typedef {Object} RuleSource
 * @property {string} id
 * @property {string} topic 规则主题
 * @property {string} url 官方出处
 * @property {string} publisher IELTS / British Council / IDP / Cambridge
 * @property {string} scope 适用范围与本系统采用的口径
 */

/** @type {RuleSource[]} */
export const RULE_SOURCES = [
  {
    id: 'raw-band-anchors',
    topic: '听力 / 学术类阅读 / 培训类阅读 原始分 → 等级分锚点',
    url: 'https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail',
    publisher: 'IELTS',
    scope: '2026-11-05 核对：官方公布部分平均原始分锚点。RAW_BAND_ANCHORS 还含系统补全的估算阈值，完整表格并非官方表；实际考试换算可能不同。',
  },
  {
    id: 'overall-rounding',
    topic: '总分取整：.25 进 .5，.75 进整分',
    url: 'https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail',
    publisher: 'IELTS',
    scope: '四项平均后按官方规则取整到整分或半分，overallBand 采用 round(x*2)/2。',
  },
  {
    id: 'bc-band-scores',
    topic: '四个单项与总分说明（0–9、0.5 一档）',
    url: 'https://takeielts.britishcouncil.org/score/ielts-band-scores',
    publisher: 'British Council',
    scope: '交叉核对 band 含义与取整描述。',
  },
  {
    id: 'idp-scores',
    topic: 'IDP 对评分与取整的说明',
    url: 'https://www.idp.com/global/ielts/understanding-ielts-scores/',
    publisher: 'IDP',
    scope: '交叉核对。',
  },
  {
    id: 'writing-weight',
    topic: '写作 Task 2 权重为 Task 1 两倍',
    url: 'https://takeielts.britishcouncil.org/take-ielts/prepare/writing-practice-test-1/writing-practice-test-1',
    publisher: 'British Council',
    scope: '官方写作评分说明：Task 2 contributes twice as much as Task 1。writingBand = round((T1 + 2*T2)/3)。',
  },
  {
    id: 'writing-descriptors',
    topic: '写作四项评分维度（TR/TA、CC、LR、GRA）与公开评分描述',
    url: 'https://www.ielts.org/for-test-takers/ielts-test-guide/ielts-speaking-and-writing-performance-descriptors',
    publisher: 'IELTS',
    scope: '反馈模板按四维度组织；估分仅给文字估算并标“估算”。',
  },
  {
    id: 'speaking-descriptors',
    topic: '口语四项评分维度（FC、LR、GRA、P）',
    url: 'https://www.ielts.org/for-test-takers/ielts-test-guide/ielts-speaking-and-writing-performance-descriptors',
    publisher: 'IELTS',
    scope: '文字作答无法评估发音；界面缺发音分时不调用 speakingBand，不编造总分。',
  },
  {
    id: 'tfng',
    topic: 'TRUE / FALSE / NOT GIVEN 定义（FALSE 与 NOT GIVEN 区别）',
    url: 'https://takeielts.britishcouncil.org/prepare-test/question-type/identifying-information-true-false-not-given',
    publisher: 'British Council',
    scope: 'FALSE = 与原文陈述矛盾；NOT GIVEN = 无法核实。讲解模板必须把区别落到具体原文句。',
  },
  {
    id: 'ynng',
    topic: 'YES / NO / NOT GIVEN 定义（作者观点/主张）',
    url: 'https://takeielts.britishcouncil.org/prepare-test/question-type/identifying-writer-views-claims-yes-no-not-given',
    publisher: 'British Council',
    scope: '与 TFNG 是两套标签，答混判 WRONG_LABEL_SET。',
  },
  {
    id: 'word-instructions',
    topic: 'ONE WORD ONLY / NO MORE THAN TWO WORDS / AND/OR A NUMBER 等答题指令',
    url: 'https://takeielts.britishcouncil.org/prepare-test/question-type/sentence-completion',
    publisher: 'British Council',
    scope: 'validateAnswerFormat 支持第七节列出的七种指令；连字符词按一个词计（官方练习题口径）。',
  },
  {
    id: 'answer-spelling',
    topic: '答案必须拼写正确；英式/美式拼写均可接受',
    url: 'https://takeielts.britishcouncil.org/prepare-test/question-type/sentence-completion',
    publisher: 'British Council',
    scope: 'key 以 "colour/color" 形式登记两种写法；编辑距离 1–2 的近形拼写判 SPELLING（系统辅助口径，非官方规则）。',
  },
]

/**
 * 非官方假设（官方未公开或仅公布锚点的部分）。界面与文档必须标注。
 * @type {{id: string, assumption: string, rationale: string}[]}
 */
export const ASSUMPTIONS = [
  {
    id: 'below-table-band',
    assumption: 'raw=0 → band 0；1 至系统最低阈值之间 → band 2.0。',
    rationale: '系统阈值以下的处理属于非官方外推，不代表实际考试分数。',
  },
  {
    id: 'abbreviations',
    assumption: 'T/F/NG、Y/N 等缩写一律不接受，必须写完整单词。',
    rationale: '官方答题说明没有统一的缩写许可口径；查不到就不接受，并在规则文档写明。',
  },
  {
    id: 'hyphen-one-word',
    assumption: '连字符词在字数统计中按一个词处理。',
    rationale: '官方练习题与备考机构主流口径一致；若考区指令另有说明以试卷为准。',
  },
  {
    id: 'edit-distance-spelling',
    assumption: '与可接受写法编辑距离 1–2 的答案归为“拼写”提示，不自动算对。',
    rationale: '官方只按拼写是否正确给分；距离分类只是帮学生归因，绝不改变判题结果。',
  },
  {
    id: 'criteria-rounding',
    assumption: '写作/口语四项小分平均后按 .25/.75 规则取整；单项小分本身按 0.5 一档由用户/模型选择。',
    rationale: '官方公开了维度与取整例子，但未公开每份试卷的精确合成过程；估分始终标注“估算”。',
  },
]
