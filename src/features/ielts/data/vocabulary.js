// 词块库（第八节）。全部原创条目，每类 ≥20 条，带中文释义、原创例句与搭配说明。
// 用户自定义条目 category 为 'custom'；从阅读/听力复盘收藏的同义替换
// 另存于 "我的替换库"（storage/mistakeStore.js，键 ielts-my-paraphrases）。

/**
 * @typedef {Object} VocabEntry
 * @property {string} id
 * @property {'task1'|'task2'|'reading-paraphrase'|'listening-signal'|'custom'} category
 * @property {string} en
 * @property {string} zh
 * @property {string} example
 * @property {string} collocation
 * @property {boolean} builtin
 */

/** @type {VocabEntry[]} */
export const VOCAB = [
  {
    "id": "t1-01",
    "category": "task1",
    "en": "rise steadily",
    "zh": "稳步上升",
    "example": "The number of visitors rose steadily between 2010 and 2020.",
    "collocation": "rise steadily / a steady rise in sth",
    "builtin": true
  },
  {
    "id": "t1-02",
    "category": "task1",
    "en": "increase sharply",
    "zh": "急剧增加",
    "example": "Car ownership increased sharply in the final five years.",
    "collocation": "a sharp increase of + 数字",
    "builtin": true
  },
  {
    "id": "t1-03",
    "category": "task1",
    "en": "climb gradually",
    "zh": "逐渐攀升",
    "example": "The figure climbed gradually to 12 million.",
    "collocation": "climb to + 数值",
    "builtin": true
  },
  {
    "id": "t1-04",
    "category": "task1",
    "en": "fall dramatically",
    "zh": "大幅下降",
    "example": "Sales fell dramatically after 2015.",
    "collocation": "a dramatic fall in sth",
    "builtin": true
  },
  {
    "id": "t1-05",
    "category": "task1",
    "en": "decline slightly",
    "zh": "小幅下降",
    "example": "The ratio declined slightly to 38 percent.",
    "collocation": "a slight decline of + 数值",
    "builtin": true
  },
  {
    "id": "t1-06",
    "category": "task1",
    "en": "drop significantly",
    "zh": "显著下降",
    "example": "Public spending dropped significantly over the decade.",
    "collocation": "a significant drop in sth",
    "builtin": true
  },
  {
    "id": "t1-07",
    "category": "task1",
    "en": "fluctuate between",
    "zh": "在……之间波动",
    "example": "Prices fluctuated between 40 and 60 dollars.",
    "collocation": "fluctuate between A and B",
    "builtin": true
  },
  {
    "id": "t1-08",
    "category": "task1",
    "en": "remain stable",
    "zh": "保持稳定",
    "example": "The birth rate remained stable throughout the period.",
    "collocation": "remain stable/unchanged at + 数值",
    "builtin": true
  },
  {
    "id": "t1-09",
    "category": "task1",
    "en": "level off",
    "zh": "趋平；停止增长",
    "example": "After 2018 the curve levelled off at around 80 percent.",
    "collocation": "level off at + 数值",
    "builtin": true
  },
  {
    "id": "t1-10",
    "category": "task1",
    "en": "reach a peak",
    "zh": "达到峰值",
    "example": "Exports reached a peak of 90 billion in 2019.",
    "collocation": "peak at / reach a peak of",
    "builtin": true
  },
  {
    "id": "t1-11",
    "category": "task1",
    "en": "hit a low",
    "zh": "跌至低点",
    "example": "The index hit a low of 12 during the recession.",
    "collocation": "hit a low of + 数值",
    "builtin": true
  },
  {
    "id": "t1-12",
    "category": "task1",
    "en": "overtake",
    "zh": "超过；反超",
    "example": "In 2014, the train overtook the bus as the main choice.",
    "collocation": "A overtake B",
    "builtin": true
  },
  {
    "id": "t1-13",
    "category": "task1",
    "en": "double",
    "zh": "翻倍",
    "example": "The number of students doubled between 2000 and 2020.",
    "collocation": "double (不及物) / a twofold rise",
    "builtin": true
  },
  {
    "id": "t1-14",
    "category": "task1",
    "en": "be projected to",
    "zh": "预计将",
    "example": "The population is projected to age faster after 2025.",
    "collocation": "be projected/expected to do",
    "builtin": true
  },
  {
    "id": "t1-15",
    "category": "task1",
    "en": "account for",
    "zh": "占（比例）",
    "example": "Renewables accounted for nearly a quarter of the supply.",
    "collocation": "account for + 比例",
    "builtin": true
  },
  {
    "id": "t1-16",
    "category": "task1",
    "en": "make up",
    "zh": "构成；占",
    "example": "Women made up the majority of part-time workers.",
    "collocation": "make up a quarter / the majority of",
    "builtin": true
  },
  {
    "id": "t1-17",
    "category": "task1",
    "en": "a threefold increase",
    "zh": "三倍的增长",
    "example": "There was a threefold increase in cycling over the period.",
    "collocation": "a twofold/threefold increase in sth",
    "builtin": true
  },
  {
    "id": "t1-18",
    "category": "task1",
    "en": "in comparison with",
    "zh": "与……相比",
    "example": "In comparison with 2000, the 2020 figure was far higher.",
    "collocation": "compared with / in comparison with",
    "builtin": true
  },
  {
    "id": "t1-19",
    "category": "task1",
    "en": "whereas",
    "zh": "而（对比）",
    "example": "Train use rose, whereas car use fell slightly.",
    "collocation": "whereas + 从句",
    "builtin": true
  },
  {
    "id": "t1-20",
    "category": "task1",
    "en": "the figure for",
    "zh": "……的数值",
    "example": "The figure for men was consistently above that for women.",
    "collocation": "the figure for + 对象，避免重复 number",
    "builtin": true
  },
  {
    "id": "t1-21",
    "category": "task1",
    "en": "first … then …",
    "zh": "首先……然后……",
    "example": "First, the material is washed; it is then heated to 120 degrees.",
    "collocation": "流程图顺序词 + 被动",
    "builtin": true
  },
  {
    "id": "t1-22",
    "category": "task1",
    "en": "once … has been …ed",
    "zh": "一旦被……之后",
    "example": "Once the liquid has been filtered, it is bottled.",
    "collocation": "流程先后衔接",
    "builtin": true
  },
  {
    "id": "t1-23",
    "category": "task1",
    "en": "be located in",
    "zh": "位于",
    "example": "The new housing area is located in the north of the map.",
    "collocation": "be located/situated in（地图题）",
    "builtin": true
  },
  {
    "id": "t1-24",
    "category": "task1",
    "en": "be replaced by",
    "zh": "被……取代",
    "example": "The old factory was replaced by a park.",
    "collocation": "地图变化常用被动",
    "builtin": true
  },
  {
    "id": "t2-01",
    "category": "task2",
    "en": "It is often argued that",
    "zh": "人们常认为……",
    "example": "It is often argued that universities should focus on job skills.",
    "collocation": "开头引出讨论",
    "builtin": true
  },
  {
    "id": "t2-02",
    "category": "task2",
    "en": "This essay will argue that",
    "zh": "本文将论证……",
    "example": "This essay will argue that the benefits outweigh the drawbacks.",
    "collocation": "开头表明立场",
    "builtin": true
  },
  {
    "id": "t2-03",
    "category": "task2",
    "en": "There are two main reasons why",
    "zh": "……主要有两个原因",
    "example": "There are two main reasons why remote work changes cities.",
    "collocation": "论点段首句",
    "builtin": true
  },
  {
    "id": "t2-04",
    "category": "task2",
    "en": "A good case in point is",
    "zh": "一个恰当的例子是",
    "example": "A good case in point is the spread of online learning.",
    "collocation": "举例过渡",
    "builtin": true
  },
  {
    "id": "t2-05",
    "category": "task2",
    "en": "This is largely because",
    "zh": "这主要是因为",
    "example": "City centres are quieter; this is largely because fewer people commute.",
    "collocation": "因果推进",
    "builtin": true
  },
  {
    "id": "t2-06",
    "category": "task2",
    "en": "As a result",
    "zh": "因此",
    "example": "As a result, many small shops closed down.",
    "collocation": "结果衔接，句首",
    "builtin": true
  },
  {
    "id": "t2-07",
    "category": "task2",
    "en": "therefore",
    "zh": "因此",
    "example": "Higher prices would therefore reduce demand.",
    "collocation": "句中副词位置",
    "builtin": true
  },
  {
    "id": "t2-08",
    "category": "task2",
    "en": "despite the fact that",
    "zh": "尽管……",
    "example": "Despite the fact that costs rose, enrolment grew.",
    "collocation": "让步 + 从句",
    "builtin": true
  },
  {
    "id": "t2-09",
    "category": "task2",
    "en": "while it is true that",
    "zh": "诚然……",
    "example": "While it is true that taxes hurt, they fund public goods.",
    "collocation": "让步段开头",
    "builtin": true
  },
  {
    "id": "t2-10",
    "category": "task2",
    "en": "on the other hand",
    "zh": "另一方面",
    "example": "On the other hand, strict rules may reduce creativity.",
    "collocation": "转折对照",
    "builtin": true
  },
  {
    "id": "t2-11",
    "category": "task2",
    "en": "play a vital role in",
    "zh": "在……中起关键作用",
    "example": "Education plays a vital role in reducing inequality.",
    "collocation": "play a role in + 名词/动名词",
    "builtin": true
  },
  {
    "id": "t2-12",
    "category": "task2",
    "en": "have a positive impact on",
    "zh": "对……有积极影响",
    "example": "Early reading has a positive impact on later achievement.",
    "collocation": "impact on + 名词",
    "builtin": true
  },
  {
    "id": "t2-13",
    "category": "task2",
    "en": "pose a threat to",
    "zh": "对……构成威胁",
    "example": "Cheap imports pose a threat to local manufacturers.",
    "collocation": "pose a threat/challenge to",
    "builtin": true
  },
  {
    "id": "t2-14",
    "category": "task2",
    "en": "tackle the problem of",
    "zh": "解决……问题",
    "example": "Governments must tackle the problem of plastic waste.",
    "collocation": "tackle/deal with/address 互换",
    "builtin": true
  },
  {
    "id": "t2-15",
    "category": "task2",
    "en": "raise awareness of",
    "zh": "提高……意识",
    "example": "Schools should raise awareness of healthy eating.",
    "collocation": "awareness of + 名词",
    "builtin": true
  },
  {
    "id": "t2-16",
    "category": "task2",
    "en": "strike a balance between",
    "zh": "在……间取得平衡",
    "example": "Workers need to strike a balance between speed and safety.",
    "collocation": "strike a balance between A and B",
    "builtin": true
  },
  {
    "id": "t2-17",
    "category": "task2",
    "en": "in the long run",
    "zh": "从长远看",
    "example": "In the long run, renewable power becomes cheaper.",
    "collocation": "in the short/long run",
    "builtin": true
  },
  {
    "id": "t2-18",
    "category": "task2",
    "en": "to a certain extent",
    "zh": "在一定程度上",
    "example": "Technology helps, to a certain extent, but teaching matters more.",
    "collocation": "缓和绝对化语气",
    "builtin": true
  },
  {
    "id": "t2-19",
    "category": "task2",
    "en": "it is worth noting that",
    "zh": "值得注意的是",
    "example": "It is worth noting that most users did not pay for the service.",
    "collocation": "补充重要信息",
    "builtin": true
  },
  {
    "id": "t2-20",
    "category": "task2",
    "en": "a growing number of",
    "zh": "越来越多的",
    "example": "A growing number of firms allow staff to work from home.",
    "collocation": "+ 复数名词，动词用复数",
    "builtin": true
  },
  {
    "id": "t2-21",
    "category": "task2",
    "en": "be closely linked to",
    "zh": "与……密切相关",
    "example": "Poor health is closely linked to long working hours.",
    "collocation": "be linked/related to",
    "builtin": true
  },
  {
    "id": "t2-22",
    "category": "task2",
    "en": "give priority to",
    "zh": "优先考虑……",
    "example": "Cities should give priority to public transport.",
    "collocation": "give priority to + 名词",
    "builtin": true
  },
  {
    "id": "t2-23",
    "category": "task2",
    "en": "shoulder responsibility for",
    "zh": "承担……责任",
    "example": "Companies should shoulder responsibility for training staff.",
    "collocation": "shoulder/take responsibility for",
    "builtin": true
  },
  {
    "id": "t2-24",
    "category": "task2",
    "en": "in conclusion",
    "zh": "总之",
    "example": "In conclusion, the advantages outweigh the disadvantages.",
    "collocation": "结尾段开头",
    "builtin": true
  },
  {
    "id": "rp-01",
    "category": "reading-paraphrase",
    "en": "significant → considerable/major",
    "zh": "重大的 →",
    "example": "The report notes a considerable increase in costs.",
    "collocation": "形容词替换是定位后确认答案的关键",
    "builtin": true
  },
  {
    "id": "rp-02",
    "category": "reading-paraphrase",
    "en": "important → crucial/essential",
    "zh": "重要的 →",
    "example": "Sleep is essential for memory formation.",
    "collocation": "题干 important 在原文常换形",
    "builtin": true
  },
  {
    "id": "rp-03",
    "category": "reading-paraphrase",
    "en": "problem → issue/drawback",
    "zh": "问题 →",
    "example": "The main drawback of the method is its cost.",
    "collocation": "缺点类常换 drawback/downside",
    "builtin": true
  },
  {
    "id": "rp-04",
    "category": "reading-paraphrase",
    "en": "advantage → benefit/merit",
    "zh": "优点 →",
    "example": "One benefit of the scheme is lower noise.",
    "collocation": "benefit/merit/upside",
    "builtin": true
  },
  {
    "id": "rp-05",
    "category": "reading-paraphrase",
    "en": "cause → lead to/result in",
    "zh": "导致 →",
    "example": "Heavy rain resulted in widespread flooding.",
    "collocation": "因果方向不要看反",
    "builtin": true
  },
  {
    "id": "rp-06",
    "category": "reading-paraphrase",
    "en": "because → due to/owing to",
    "zh": "因为 →",
    "example": "The delay was due to a signal failure.",
    "collocation": "due to + 名词短语",
    "builtin": true
  },
  {
    "id": "rp-07",
    "category": "reading-paraphrase",
    "en": "show → reveal/indicate",
    "zh": "表明 →",
    "example": "The data reveals a clear north-south gap.",
    "collocation": "研究结论高频动词",
    "builtin": true
  },
  {
    "id": "rp-08",
    "category": "reading-paraphrase",
    "en": "suggest → imply/indicate",
    "zh": "暗示 →",
    "example": "The findings imply that age matters less.",
    "collocation": "imply 常对应“暗示/意味着”",
    "builtin": true
  },
  {
    "id": "rp-09",
    "category": "reading-paraphrase",
    "en": "increase → growth/rise",
    "zh": "增长 →",
    "example": "The growth of cities accelerated after 1990.",
    "collocation": "名词化是常见改写方向",
    "builtin": true
  },
  {
    "id": "rp-10",
    "category": "reading-paraphrase",
    "en": "decrease → decline/reduction",
    "zh": "减少 →",
    "example": "A decline in insect numbers was recorded.",
    "collocation": "注意 decline 可名可动",
    "builtin": true
  },
  {
    "id": "rp-11",
    "category": "reading-paraphrase",
    "en": "dangerous → hazardous/risky",
    "zh": "危险的 →",
    "example": "The chemicals are hazardous without gloves.",
    "collocation": "hazardous = 危险的（正式）",
    "builtin": true
  },
  {
    "id": "rp-12",
    "category": "reading-paraphrase",
    "en": "ancient → dating back centuries",
    "zh": "古老的 →",
    "example": "The bridge, dating back centuries, still carries traffic.",
    "collocation": "短语改写比单词替换更难定位",
    "builtin": true
  },
  {
    "id": "rp-13",
    "category": "reading-paraphrase",
    "en": "most people → the majority of",
    "zh": "大多数人 →",
    "example": "The majority of residents supported the plan.",
    "collocation": "most + n → the majority of + n",
    "builtin": true
  },
  {
    "id": "rp-14",
    "category": "reading-paraphrase",
    "en": "about → approximately/roughly",
    "zh": "大约 →",
    "example": "Approximately 300 birds were counted.",
    "collocation": "数字前后最常出现",
    "builtin": true
  },
  {
    "id": "rp-15",
    "category": "reading-paraphrase",
    "en": "buy → purchase",
    "zh": "购买 →",
    "example": "Customers purchased more vegetables online.",
    "collocation": "口语词 → 学术词",
    "builtin": true
  },
  {
    "id": "rp-16",
    "category": "reading-paraphrase",
    "en": "use → utilise/make use of",
    "zh": "使用 →",
    "example": "Factories make use of recycled water.",
    "collocation": "utilise = use（英式拼写）",
    "builtin": true
  },
  {
    "id": "rp-17",
    "category": "reading-paraphrase",
    "en": "difficult → challenging/demanding",
    "zh": "困难的 →",
    "example": "The task proved demanding for new staff.",
    "collocation": "demanding 还可指“要求高的”",
    "builtin": true
  },
  {
    "id": "rp-18",
    "category": "reading-paraphrase",
    "en": "change → alter/modify/shift",
    "zh": "改变 →",
    "example": "The rules were modified after the review.",
    "collocation": "shift 强调方向性变化",
    "builtin": true
  },
  {
    "id": "rp-19",
    "category": "reading-paraphrase",
    "en": "limit → restrict/constraint",
    "zh": "限制 →",
    "example": "Cost was the main constraint on the design.",
    "collocation": "restrict 动词 / constraint 名词",
    "builtin": true
  },
  {
    "id": "rp-20",
    "category": "reading-paraphrase",
    "en": "famous → renowned/well-known",
    "zh": "著名的 →",
    "example": "The region is renowned for its pottery.",
    "collocation": "renowned for",
    "builtin": true
  },
  {
    "id": "rp-21",
    "category": "reading-paraphrase",
    "en": "carry out → conduct/perform",
    "zh": "实施 →",
    "example": "The team conducted three experiments.",
    "collocation": "研究类动词群",
    "builtin": true
  },
  {
    "id": "rp-22",
    "category": "reading-paraphrase",
    "en": "depend on → rely on",
    "zh": "依赖 →",
    "example": "The village relies on a single well.",
    "collocation": "rely heavily on",
    "builtin": true
  },
  {
    "id": "ls-01",
    "category": "listening-signal",
    "en": "but / however",
    "zh": "转折，重点常在后面",
    "example": "The price rises, but students pay half.",
    "collocation": "听到转折立刻聚焦后半句",
    "builtin": true
  },
  {
    "id": "ls-02",
    "category": "listening-signal",
    "en": "actually",
    "zh": "改口/更正信号",
    "example": "It is on Tuesday — actually, Wednesday.",
    "collocation": "后面的信息才是答案",
    "builtin": true
  },
  {
    "id": "ls-03",
    "category": "listening-signal",
    "en": "sorry",
    "zh": "自我纠正",
    "example": "Meet at five, sorry, five thirty.",
    "collocation": "sorry 后覆盖前一个数字",
    "builtin": true
  },
  {
    "id": "ls-04",
    "category": "listening-signal",
    "en": "I mean",
    "zh": "改口解释",
    "example": "It is 14, I mean 40, pounds.",
    "collocation": "数字题尤其警惕",
    "builtin": true
  },
  {
    "id": "ls-05",
    "category": "listening-signal",
    "en": "no wait",
    "zh": "改口（口语）",
    "example": "The blue one — no wait, the grey one.",
    "collocation": "干扰项 → 新答案",
    "builtin": true
  },
  {
    "id": "ls-06",
    "category": "listening-signal",
    "en": "the key point is",
    "zh": "强调要点",
    "example": "The key point is that booking is required.",
    "collocation": "强调后常出答案",
    "builtin": true
  },
  {
    "id": "ls-07",
    "category": "listening-signal",
    "en": "what you must remember is",
    "zh": "强调",
    "example": "What you must remember is the reference number.",
    "collocation": "后接必考细节",
    "builtin": true
  },
  {
    "id": "ls-08",
    "category": "listening-signal",
    "en": "firstly / first of all",
    "zh": "分点 1",
    "example": "First of all, you will need a passport.",
    "collocation": "配合 secondly/finally 数要点",
    "builtin": true
  },
  {
    "id": "ls-09",
    "category": "listening-signal",
    "en": "in addition / also",
    "zh": "追加信息",
    "example": "In addition, lunch is provided.",
    "collocation": "多选题的第二个选项信号",
    "builtin": true
  },
  {
    "id": "ls-10",
    "category": "listening-signal",
    "en": "for example",
    "zh": "举例",
    "example": "Bring warm clothes, for example a fleece.",
    "collocation": "例子常是填空原词",
    "builtin": true
  },
  {
    "id": "ls-11",
    "category": "listening-signal",
    "en": "so / therefore",
    "zh": "因果结论",
    "example": "So the best choice is the morning tour.",
    "collocation": "结论句出选择答案",
    "builtin": true
  },
  {
    "id": "ls-12",
    "category": "listening-signal",
    "en": "as a result",
    "zh": "结果",
    "example": "Roads flooded; as a result, the bus was cancelled.",
    "collocation": "因果题定位",
    "builtin": true
  },
  {
    "id": "ls-13",
    "category": "listening-signal",
    "en": "although",
    "zh": "让步，重点在后",
    "example": "Although it was costly, the project continued.",
    "collocation": "不要把让步内容当结论",
    "builtin": true
  },
  {
    "id": "ls-14",
    "category": "listening-signal",
    "en": "instead of",
    "zh": "替代干扰",
    "example": "Choose wood instead of plastic.",
    "collocation": "instead of 后是被否定项",
    "builtin": true
  },
  {
    "id": "ls-15",
    "category": "listening-signal",
    "en": "rather than",
    "zh": "而不是（干扰）",
    "example": "Use a pen rather than a pencil.",
    "collocation": "rather than 后多为干扰",
    "builtin": true
  },
  {
    "id": "ls-16",
    "category": "listening-signal",
    "en": "used to",
    "zh": "过去与现在不同",
    "example": "I used to walk; now I cycle.",
    "collocation": "时态对比常设题",
    "builtin": true
  },
  {
    "id": "ls-17",
    "category": "listening-signal",
    "en": "originally",
    "zh": "原计划（常改口）",
    "example": "Originally planned for June, it moved to July.",
    "collocation": "原计划多为干扰",
    "builtin": true
  },
  {
    "id": "ls-18",
    "category": "listening-signal",
    "en": "be planning to",
    "zh": "计划（可能变）",
    "example": "We are planning to add a second workshop.",
    "collocation": "后接变更时以变更为准",
    "builtin": true
  },
  {
    "id": "ls-19",
    "category": "listening-signal",
    "en": "unfortunately",
    "zh": "坏消息/问题",
    "example": "Unfortunately, the lift is out of order.",
    "collocation": "问题与解决方案题信号",
    "builtin": true
  },
  {
    "id": "ls-20",
    "category": "listening-signal",
    "en": "on the other hand",
    "zh": "另一方面",
    "example": "On the other hand, parking is free.",
    "collocation": "对比两侧都要听清问哪侧",
    "builtin": true
  },
  {
    "id": "ls-21",
    "category": "listening-signal",
    "en": "to summarise",
    "zh": "结尾总结",
    "example": "To summarise, feedback was mostly positive.",
    "collocation": "结尾态度题",
    "builtin": true
  },
  {
    "id": "ls-22",
    "category": "listening-signal",
    "en": "double-check",
    "zh": "复核（数字/拼写）",
    "example": "Please double-check the postcode.",
    "collocation": "后接需精拼的信息",
    "builtin": true
  }
];

export const VOCAB_CATEGORIES = [
  { id: 'task1', label: 'Task 1 表达' },
  { id: 'task2', label: 'Task 2 表达' },
  { id: 'reading-paraphrase', label: '阅读同义替换' },
  { id: 'listening-signal', label: '听力信号词与干扰词' },
  { id: 'custom', label: '我的自定义' },
]
