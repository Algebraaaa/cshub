// 讲解质量回归夹具：每个模板的【固定样例输入】【合规输出样例】【故意不合规
// 输出样例】，按版本登记。模板升到 v2 时保留 v1 夹具，就能用同一份脚本同时
// 检查“同一模板两个版本的输出结构是否都合规、引用是否都能通过逐字校验”。
//
// 注意：这里的文字是为回归测试专门编写的短样例（原创、非真题），与页面示例无关。

const PASSAGE = 'The council planted wildflowers in 2021 and counted more bees the following summer.'

export const SAMPLE_VARS = {
  readingExplain: {
    passage: PASSAGE,
    question: 'When did the council plant wildflowers?',
    questionType: 'gap',
    keyAnswer: '2021',
    userAnswer: '2020',
    judge: { correct: false, errors: ['MISMATCH'] },
    sourceLabel: 'fixture',
  },
  readingFollowup: {
    passage: PASSAGE,
    question: 'When did the council plant wildflowers?',
    keyAnswer: '2021',
    userQuestion: 'Was it in 2019?',
  },
  sessionSummary: {
    module: 'reading',
    correctCount: 2,
    totalCount: 4,
    reasonStats: { 'locating-failed': 2 },
    questions: [],
  },
  listeningExplain: {
    transcript: PASSAGE,
    question: 'When did they plant flowers?',
    questionType: 'gap',
    keyAnswer: '2021',
    userAnswer: '2020',
    judge: { correct: false, errors: ['MISMATCH'] },
    reflection: '听成了 2020',
  },
  writingFeedback: {
    stepId: 't1-intro',
    prompt: 'Describe a chart.',
    text: 'The chart shows three forms of transport over ten years.',
    knowledge: '',
    targetBand: '6.5',
    strictness: 'standard',
  },
  translationChallenge: { level: '6.5' },
  translationFeedback: {
    chinese: '尽管下雨，他还是准时到了。',
    referenceEnglish: 'Although it was raining, he arrived on time.',
    userTranslation: 'Though rain, he arrived on time.',
  },
  speakingPrompt: { part: '2', topic: 'cooking', part2Topic: 'cooking' },
  speakingFeedback: {
    part: '1',
    question: 'Do you like cooking?',
    answer: 'Yes I like cooking very much and I often cook at weekends.',
  },
}

export const FIXTURES = {
  'reading-explain': {
    1: {
      variables: SAMPLE_VARS.readingExplain,
      validOutputs: [
        {
          locationQuote: 'The council planted wildflowers in 2021',
          paraphrases: [{ questionPhrase: 'when', passagePhrase: 'in 2021' }],
          whyKeyCorrect: '原句给出 2021。',
          whyUserWrong: '你写了 2020。',
          tfngNote: '',
          suggestedReasonId: 'locating-failed',
        },
        // locationQuote 留空也必须合法（找不到定位时不许编造）
        {
          locationQuote: '',
          paraphrases: [],
          whyKeyCorrect: '依据答案册。',
          whyUserWrong: '不一致。',
          tfngNote: '',
          suggestedReasonId: 'spelling-format',
        },
      ],
      invalidOutputs: [
        { reason: 'quote-not-substring', output: {
          locationQuote: 'the council planted flowers in 2019',
          paraphrases: [], whyKeyCorrect: 'x', whyUserWrong: 'y', tfngNote: '',
          suggestedReasonId: 'locating-failed',
        } },
        { reason: 'missing-required-fields', output: { locationQuote: 'x' } },
        { reason: 'bad-reason-id', output: {
          locationQuote: PASSAGE, paraphrases: [], whyKeyCorrect: 'x', whyUserWrong: 'y',
          tfngNote: '', suggestedReasonId: 'not-a-real-reason',
        } },
      ],
    },
  },
  'reading-followup': {
    1: {
      variables: SAMPLE_VARS.readingFollowup,
      validOutputs: [
        { answer: '原文没有提供 2019 的信息。', quotes: [] },
        { answer: '时间是 2021。', quotes: ['planted wildflowers in 2021'] },
      ],
      invalidOutputs: [
        { reason: 'quote-not-substring', output: { answer: 'x', quotes: ['in 2019 they planted'] } },
        { reason: 'answer-not-string', output: { answer: 42, quotes: [] } },
      ],
    },
  },
  'session-summary': {
    1: {
      variables: SAMPLE_VARS.sessionSummary,
      validOutputs: [
        { problems: [{ reasonId: 'locating-failed', detail: '两次定位失败。' }], nextTips: ['先读题干划定位词。'] },
        { problems: [], nextTips: ['保持练习节奏。', '复盘错题。'] },
      ],
      invalidOutputs: [
        { reason: 'too-many-problems', output: { problems: [1, 2, 3, 4].map((i) => ({ reasonId: 'locating-failed', detail: String(i) })), nextTips: [] } },
        { reason: 'unknown-reason', output: { problems: [{ reasonId: 'nope', detail: 'x' }], nextTips: [] } },
      ],
    },
  },
  'listening-explain': {
    1: {
      variables: SAMPLE_VARS.listeningExplain,
      validOutputs: [
        {
          locationQuote: 'The council planted wildflowers in 2021',
          signalWords: ['actually'], correction: '', suggestedReasonId: 'missed-audio', advice: '注意改口信号。',
        },
      ],
      invalidOutputs: [
        { reason: 'quote-not-substring', output: {
          locationQuote: 'in 2020 they planted', signalWords: [], correction: '',
          suggestedReasonId: 'number-time-date', advice: 'x',
        } },
        { reason: 'bad-reason-id', output: {
          locationQuote: PASSAGE, signalWords: [], correction: '', suggestedReasonId: 'reading-only-reason', advice: 'x',
        } },
      ],
    },
  },
  'writing-feedback': {
    1: {
      variables: SAMPLE_VARS.writingFeedback,
      validOutputs: [
        {
          taskResponse: '回应了题目。', coherence: '结构清晰。',
          issues: [{ quote: 'shows', suggestion: 'illustrates', reason: '更书面' }],
          expressions: ['The chart illustrates'],
          wordCountNote: '', estimatedBand: '估算 6.0–6.5',
        },
        {
          taskResponse: 'ok', coherence: 'ok', issues: [],
          expressions: ['The chart illustrates the change in ...'],
          wordCountNote: '不足 150 词', estimatedBand: '',
        },
      ],
      invalidOutputs: [
        { reason: 'too-many-issues', output: {
          taskResponse: 'x', coherence: 'x',
          issues: [1, 2, 3, 4].map((i) => ({ quote: 'a', suggestion: 'b', reason: String(i) })),
          expressions: [], wordCountNote: '', estimatedBand: '',
        } },
        { reason: 'estimated-band-not-estimate', output: {
          taskResponse: 'x', coherence: 'x', issues: [], expressions: [],
          wordCountNote: '', estimatedBand: '6.5',
        } },
      ],
    },
  },
  'translation-challenge': {
    1: {
      variables: SAMPLE_VARS.translationChallenge,
      validOutputs: [
        { chinese: '尽管下雨他还是到了。', focus: '让步状语从句', referenceEnglish: 'Although it rained, he arrived.', keyPoints: ['although', 'on time'] },
      ],
      invalidOutputs: [
        { reason: 'too-few-keypoints', output: { chinese: 'x', focus: 'y', referenceEnglish: 'z', keyPoints: ['only one'] } },
      ],
    },
  },
  'translation-feedback': {
    1: {
      variables: SAMPLE_VARS.translationFeedback,
      validOutputs: [
        { issues: [], better: 'Although it was raining, he arrived on time.' },
        { issues: [{ quote: 'Though rain', suggestion: 'Though it was raining', reason: '从句要完整' }], better: 'Although it was raining, he arrived on time.' },
      ],
      invalidOutputs: [
        { reason: 'missing-better', output: { issues: [] } },
      ],
    },
  },
  'speaking-prompt': {
    1: {
      variables: SAMPLE_VARS.speakingPrompt,
      validOutputs: [
        { question: 'Describe a meal you enjoyed cooking.', cueCard: ['what you cooked', 'who you cooked for'] },
        { question: 'Do you like cooking?', cueCard: [] },
      ],
      invalidOutputs: [
        { reason: 'cuecard-too-many', output: { question: 'x', cueCard: ['a', 'b', 'c', 'd', 'e'] } },
      ],
    },
  },
  'speaking-feedback': {
    1: {
      variables: SAMPLE_VARS.speakingFeedback,
      validOutputs: [
        {
          chunks: [
            { meaning: '我很喜欢', native: 'I am really into' },
            { meaning: '在周末', native: 'at weekends' },
            { meaning: '家常饭', native: 'home-cooked meals' },
          ],
          modelLines: ['Well, I am really into cooking home-cooked meals at weekends.'],
          grammarFixes: [], interaction: '回答直接，建议再补一个细节。',
          estimates: { fc: '估算 6.0', lr: '估算 6.0', gra: '估算 6.5' },
        },
      ],
      invalidOutputs: [
        { reason: 'too-few-chunks', output: { chunks: [{ meaning: 'x', native: 'y' }], modelLines: ['a'], grammarFixes: [], interaction: 'z', estimates: { fc: '估算 6', lr: '', gra: '' } } },
        { reason: 'too-many-grammar-fixes', output: { chunks: [1, 2, 3].map((i) => ({ meaning: String(i), native: `n${i}` })), modelLines: ['a'], grammarFixes: [1, 2, 3].map((i) => ({ quote: 'q', fix: 'f', reason: 'r' })), interaction: 'z', estimates: { fc: '', lr: '', gra: '' } } },
        { reason: 'pronunciation-score-forbidden', output: { chunks: [1, 2, 3].map((i) => ({ meaning: String(i), native: `n${i}` })), modelLines: ['a'], grammarFixes: [], interaction: 'z', estimates: { fc: '', lr: '', gra: '', pronunciation: 7 } } },
      ],
    },
  },
}
