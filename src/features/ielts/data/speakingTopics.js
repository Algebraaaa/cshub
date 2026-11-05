// 口语原创话题（第七节）。Part 1/2/3 结构固定；Part 3 追问承接
// Part 2 话题。用户可导入"本季话题清单"（纯文本/JSON，见 speaking 页面）。
// 全部为原创示例，非真题。

/**
 * @typedef {Object} SpeakingTopic
 * @property {string} id
 * @property {string} topic
 * @property {string} part1Question
 * @property {{question:string, bullets:string[]}} part2Cue
 * @property {string[]} part3Questions
 * @property {boolean} builtin
 */

/** @type {SpeakingTopic[]} */
export const SPEAKING_TOPICS = [
  {
    "id": "sp-01",
    "topic": "cooking",
    "part1Question": "Do you like cooking? Who does the cooking in your home?",
    "part2Cue": {
      "question": "Describe a dish you know how to cook.",
      "bullets": [
        "what the dish is",
        "what ingredients you need",
        "how you make it",
        "and explain why you like cooking it"
      ]
    },
    "part3Questions": [
      "Do you think cooking skills are less important for young people today than in the past?",
      "Should schools teach children how to cook?",
      "How might people's eating habits change in the future?"
    ],
    "builtin": true
  },
  {
    "id": "sp-02",
    "topic": "public transport",
    "part1Question": "How do you usually travel around your city? Do you prefer buses or trains?",
    "part2Cue": {
      "question": "Describe a time you travelled by public transport.",
      "bullets": [
        "where you went",
        "who you went with",
        "what happened during the trip",
        "and explain how you felt about the journey"
      ]
    },
    "part3Questions": [
      "Why do many people still prefer driving to using public transport?",
      "Should governments make public transport free?",
      "How could public transport in cities be improved?"
    ],
    "builtin": true
  },
  {
    "id": "sp-03",
    "topic": "reading",
    "part1Question": "Do you often read? What kinds of books did you read as a child?",
    "part2Cue": {
      "question": "Describe a book or article you recently read and enjoyed.",
      "bullets": [
        "what it was about",
        "how you found it",
        "how long it took you to read",
        "and explain why you enjoyed it"
      ]
    },
    "part3Questions": [
      "Do people read less than they used to?",
      "Is reading for pleasure different from reading for study?",
      "Will printed books disappear in the future?"
    ],
    "builtin": true
  },
  {
    "id": "sp-04",
    "topic": "weather",
    "part1Question": "What kind of weather do you like most? Does the weather affect your mood?",
    "part2Cue": {
      "question": "Describe a kind of weather you particularly like or dislike.",
      "bullets": [
        "what the weather is like",
        "when this weather usually occurs",
        "what you do in this weather",
        "and explain why you like or dislike it"
      ]
    },
    "part3Questions": [
      "Does weather influence the economy of a region?",
      "How might climate change affect people's daily lives?",
      "Why do people talk about the weather so often?"
    ],
    "builtin": true
  },
  {
    "id": "sp-05",
    "topic": "photography",
    "part1Question": "Do you like taking photos? What do you usually take photos of?",
    "part2Cue": {
      "question": "Describe a photo you took that you really like.",
      "bullets": [
        "what is in the photo",
        "when and where you took it",
        "what you used to take it",
        "and explain why you like this photo"
      ]
    },
    "part3Questions": [
      "Why do people post photos online?",
      "Do photos help us remember things better than videos do?",
      "How has smartphone photography changed journalism?"
    ],
    "builtin": true
  },
  {
    "id": "sp-06",
    "topic": "learning languages",
    "part1Question": "What languages do you speak? How do you practise a new language?",
    "part2Cue": {
      "question": "Describe a language you would like to learn well.",
      "bullets": [
        "what the language is",
        "why you want to learn it",
        "how you plan to learn it",
        "and explain how it might be useful to you"
      ]
    },
    "part3Questions": [
      "Why is English so widely used around the world?",
      "Should children start learning a foreign language in primary school?",
      "Can translation technology replace language learning?"
    ],
    "builtin": true
  }
];
