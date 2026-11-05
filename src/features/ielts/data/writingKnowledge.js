// 写作知识库（第六节）。Task 1 按四类图分开，每类覆盖开头改写、
// overview、主体分组与常用表达；Task 2 覆盖开头/结尾/立场/论证/让步；
// 通用卡覆盖连接词、介词、高频词块。全部原创。用户可编辑、可导入
// Markdown 或 JSON（见 storage/noteStore.js），导入内容与内置内容一起检索。

/**
 * @typedef {Object} KnowledgeCard
 * @property {string} id
 * @property {'task1-dynamic'|'task1-static'|'task1-process'|'task1-map'|'task2'|'general'} area
 * @property {string} title
 * @property {string} body Markdown 正文
 * @property {boolean} builtin
 */

/** @type {KnowledgeCard[]} */
export const WRITING_KNOWLEDGE = [
  {
    "id": "wk-01",
    "area": "task1-dynamic",
    "title": "开头改写（动态图）",
    "body": "改写题目只做三件事：换动词、换句型、概括时间跨度，**不要照抄题面**。\n- 句型：The line chart compares + 对象 + in terms of … / over the period from … to …\n- 动词替换：shows → compares / illustrates / gives information about\n- 例：题面 \"The chart below shows the number of tourists visiting three cities between 2000 and 2020.\"\n  改写：The line chart compares the numbers of tourists who visited three different cities over the period from 2000 to 2020.\n- 红线：不写背景、不写观点、不出现 I think。",
    "builtin": true
  },
  {
    "id": "wk-02",
    "area": "task1-dynamic",
    "title": "overview 写法（动态图）",
    "body": "overview 通常放在开头之后、主体之前，2 句话：\n1. 总体趋势：谁整体升、谁整体降、谁最稳定；\n2. 最突出的比较：谁一直最高/最低，或谁在末尾反超。\n- 开头用 Overall, / It is clear that …，只写\"看得见的整体\"，不写具体数字（数字留给主体段）。\n- 例：Overall, visitor numbers rose in all three cities, with City A remaining the most popular destination throughout the period.\n- 常见错误：把 overview 写成结尾段、或只描述一条线。",
    "builtin": true
  },
  {
    "id": "wk-03",
    "area": "task1-dynamic",
    "title": "主体段分组（动态图）",
    "body": "按\"信息块\"分两段，不要按年份流水账：\n- 分组法 A：主要对象一段、次要对象一段；\n- 分组法 B：上升的一段、下降/波动的一段；\n- 分组法 C：前期一段、后期一段（仅当出现明显阶段性变化时用）。\n每段 4–6 句：起点 → 关键节点（峰、谷、交叉）→ 终点，带具体数字；对比用 while / in contrast / overtake。",
    "builtin": true
  },
  {
    "id": "wk-04",
    "area": "task1-dynamic",
    "title": "常用表达（动态图）",
    "body": "趋势动词：rise / grow / climb / increase；fall / decline / drop / decrease。\n强弱搭配：sharply / dramatically / significantly / slightly / gradually / steadily。\n名词化：a sharp rise / a gradual decline / a threefold increase。\n节点：peak at / reach a peak of；bottom out at / hit a low of；level off at；fluctuate between A and B。\n时间：between 2000 and 2010 / over the period / by 2015（到某时点为止）/ in the following five years。",
    "builtin": true
  },
  {
    "id": "wk-05",
    "area": "task1-static",
    "title": "开头改写（静态图）",
    "body": "静态图（饼图、表格、静态柱图）没有时间轴，改写时突出\"比较对象 + 维度\"：\n- The pie chart compares … in terms of …\n- The table provides information about … broken down by …\n- 例：The two pie charts compare the proportions of household spending on five categories in 1990 and 2020.\n（即使是两个年份的饼图，若重点是构成对比，也按静态比较处理。）",
    "builtin": true
  },
  {
    "id": "wk-06",
    "area": "task1-static",
    "title": "overview 写法（静态图）",
    "body": "静态 overview 的两条\"最\"：\n1. 占比/数值最大或最突出的类别是谁；\n2. 最明显的对比关系（谁远高于谁、谁最接近）。\n- 例：Overall, food accounted for the largest share of spending in both years, while the smallest proportion went on transport.\n- 饼图可合并小类别叙述（all other categories together made up …）。",
    "builtin": true
  },
  {
    "id": "wk-07",
    "area": "task1-static",
    "title": "主体段分组（静态图）",
    "body": "- 饼图：最大两块放一段细写，其余类别合并成一段；\n- 表格：先按行或按列找\"最\"，再写剩余数据，避免逐格翻译；\n- 柱图：按系列（series）或按组（group）分段，每组都要带比较。\n比较表达：account for / make up / represent；twice/three times as much as；a quarter / a third / the majority of；A is slightly/considerably higher than B。\n没有特征的数字可以\"打包\"：The remaining categories each contributed less than 10 percent.",
    "builtin": true
  },
  {
    "id": "wk-08",
    "area": "task1-static",
    "title": "常用表达（静态比较）",
    "body": "占比：account for / make up / represent / constitute + 比例。\n倍数与分数：twice as many/much as；three times the figure for；a quarter of；just under/over 40 percent。\n排序：the largest/smallest proportion；rank first/second；be followed by。\n对比：while / whereas / in contrast / compared with / respectively（两个数字并列时：60 and 40 percent, respectively）。",
    "builtin": true
  },
  {
    "id": "wk-09",
    "area": "task1-process",
    "title": "开头改写（流程图）",
    "body": "说明\"这是什么过程、分几个大阶段\"：\n- The diagram illustrates how … is produced / how … works.\n- The flow chart shows the stages involved in …\n- 例：The diagram illustrates how bricks are manufactured for use in the building industry.\n先数清阶段数（通常 2–3 个大阶段），overview 里点出来。",
    "builtin": true
  },
  {
    "id": "wk-10",
    "area": "task1-process",
    "title": "overview 写法（流程图）",
    "body": "流程图 overview 只写结构，不写细节：\n1. 过程分几个大阶段（准备 → 制作 → 收尾）；\n2. 是否循环、从什么原料开始、最终产物是什么。\n- 例：Overall, the process consists of three main stages, beginning with the collection of raw materials and ending with the delivery of finished products.",
    "builtin": true
  },
  {
    "id": "wk-11",
    "area": "task1-process",
    "title": "主体段 + 常用表达（流程图）",
    "body": "按阶段分段，每一步都要写，用被动语态（物品被加工）：\n- First / Initially / At the first stage, … is/are + 过去分词\n- Next / Then / After that / Once … has been …ed, …\n- Finally / The final stage involves …\n例句：Once the mixture has been heated to 120 degrees, it is poured into moulds and left to cool.\n高频：be mixed with / be heated to / be transferred to / be stored in。",
    "builtin": true
  },
  {
    "id": "wk-12",
    "area": "task1-map",
    "title": "开头改写（地图）",
    "body": "说明地图比较的是\"哪里、什么时间、什么变化\"：\n- The two maps show how the town of … changed between … and …\n- The diagram illustrates planned developments in the village of …\n区分\"已发生变化\"（过去时）与\"规划变化\"（be planned/proposed，表将来）。",
    "builtin": true
  },
  {
    "id": "wk-13",
    "area": "task1-map",
    "title": "overview 写法（地图）",
    "body": "地图 overview 抓两条：\n1. 区域整体变更现代化/更密集/更绿；\n2. 最显著的功能变化（工业化、住宅化、交通升级）。\n- 例：Overall, the area became significantly more developed, with the most notable change being the construction of a large housing estate in the north.",
    "builtin": true
  },
  {
    "id": "wk-14",
    "area": "task1-map",
    "title": "主体段 + 方位变化表达",
    "body": "按方位或变化类型分两段（北/南，或拆除/新建）。\n方位：in the north/south of；to the east of；opposite / next to / along the river。\n变化（多用被动）：be replaced by；be converted into；be added to；be constructed/built；be demolished/removed；be expanded。\n道路河流作参照物：A new road was built connecting the two housing areas.",
    "builtin": true
  },
  {
    "id": "wk-15",
    "area": "task2",
    "title": "开头改写与立场",
    "body": "开头两句：背景改写 + 立场（或全文走向）。\n- 背景改写：换主语、换词性、换语态，避免照抄题面。\n  题面 \"Some people think governments should spend money on railways rather than roads.\"\n  改写：Whether public funds should be directed mainly towards railways instead of road networks is a matter of debate.\n- 立场要明确：This essay will argue that … / I strongly believe that …；不要写 \"Every coin has two sides\" 式废话。\n- 讨论双方类（discuss both views）开头可以不站队，但要预告结构。",
    "builtin": true
  },
  {
    "id": "wk-16",
    "area": "task2",
    "title": "结尾总结",
    "body": "结尾 2–3 句：复述立场 + 概括两个主体段的核心理由，不引入新论据、不用新例子。\n- In conclusion, … / To conclude, … / Overall, …\n- 例：In conclusion, although investing in roads brings short-term relief, railways offer the more effective long-term solution to urban congestion.\n结尾出现新论点是 Task Response 扣分项。",
    "builtin": true
  },
  {
    "id": "wk-17",
    "area": "task2",
    "title": "立场表达与论点展开",
    "body": "一个主体段一个中心论点（topic sentence 直接回应题目）：\n1. topic sentence：论点；\n2. explain：为什么成立（因果链说完整，不要跳步）；\n3. example：具体例子（国家、城市、研究、生活场景均可，要扣题）；\n4. link：小结回扣题目（This means that … / As a result, …）。\n立场强度可用：I would argue that … / I am convinced that …；弱化用 to a certain extent。",
    "builtin": true
  },
  {
    "id": "wk-18",
    "area": "task2",
    "title": "让步与转折",
    "body": "让步段增强说服力，但必须\"让一步、拉回来\"：\n- 让步：While it is true that … / Admittedly, … / Opponents argue that …\n- 拉回：However, … / Nevertheless, … / This argument overlooks the fact that …\n- 例：While it is true that higher prices reduce consumer choice, this effect is outweighed by the environmental benefits of cutting plastic use.\n红线：让步句不能写成自相矛盾（段落立场要始终清楚）。",
    "builtin": true
  },
  {
    "id": "wk-19",
    "area": "task2",
    "title": "论证方法清单",
    "body": "- 因果：because / as / since / therefore / as a result / lead to / result in（注意因果方向）。\n- 举例：for example / for instance / a good case in point is …（例子必须服务论点）。\n- 对比：by contrast / while / whereas（过去 vs 现在、A 群体 vs B 群体）。\n- 假设：if … , … / without … , … would …。\n- 数据可以泛指：studies have shown that / in many large cities，不编造具体数字。",
    "builtin": true
  },
  {
    "id": "wk-20",
    "area": "general",
    "title": "逻辑连接词",
    "body": "增补：in addition, moreover, furthermore, another point is that …\n因果：because, since, as（+ 句子）；due to / owing to（+ 名词）；therefore, as a result, consequently。\n转折：however, nevertheless, in contrast, while, whereas。\n举例：for example, for instance, such as, a good case in point。\n顺序：firstly, secondly, finally, first of all, last but not least。\n连接词不是越多越好：每段 2–3 个、用得准比用得多重要。",
    "builtin": true
  },
  {
    "id": "wk-21",
    "area": "general",
    "title": "常用介词搭配",
    "body": "- 影响：an impact/effect **on** sth\n- 原因：a reason **for** sth；result **in**（导致）/ result **from**（源于）\n- 负责：be responsible **for** / take responsibility **for**\n- 解决：a solution **to** a problem；tackle/deal **with**\n- 投资：invest **in**；spend money **on**\n- 由……组成：consist **of**（主动）/ be composed **of**\n- 擅长/差：be good/bad **at**；an expert **in**\n- 缺乏：lack sth（动词，不加 of）/ a lack **of** sth（名词）",
    "builtin": true
  },
  {
    "id": "wk-22",
    "area": "general",
    "title": "高频写作词块（替代口语词）",
    "body": "big → significant / substantial / considerable\na lot of → a large number of（可数）/ a great deal of（不可数）\nget → obtain / receive / achieve（按搭配选）\nhelp → assist / support / facilitate\nuse → utilise / make use of\nshow → demonstrate / reveal / indicate\nimportant → crucial / essential / vital\nthing → factor / aspect / issue（必须换具体）\nkids → children；boss → employer/manager；job → employment / work。\n原则：先保证准确，再追求\"高级\"；不确定的搭配不要硬用。",
    "builtin": true
  }
];

export const KNOWLEDGE_AREAS = [
  { id: 'task1-dynamic', label: 'Task 1 · 动态图（线图/变化柱图）' },
  { id: 'task1-static', label: 'Task 1 · 静态比较图（饼图/表格/静态柱图）' },
  { id: 'task1-process', label: 'Task 1 · 流程图' },
  { id: 'task1-map', label: 'Task 1 · 地图' },
  { id: 'task2', label: 'Task 2 议论文' },
  { id: 'general', label: '通用（连接词/介词/词块）' },
]

/** 全文检索：标题与正文匹配任一关键词（小写包含即可）。 */
export function searchKnowledge(cards, query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return cards
  const terms = q.split(/\s+/).filter(Boolean)
  return cards.filter((c) => {
    const hay = (c.title + '\n' + c.body).toLowerCase()
    return terms.every((t) => hay.includes(t))
  })
}
