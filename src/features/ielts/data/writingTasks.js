// 站内原创写作题（第六节）。Task 1 给可读数据（表格/饼图），
// 流程图与地图用文字结构描述。用户也可以自己贴题（页面内录入，不落本文件）。
// 全部为原创示例，非真题。

/**
 * @typedef {Object} WritingTask
 * @property {string} id
 * @property {'task1'|'task2'|'full'} kind
 * @property {string} [chartType]
 * @property {string} title
 * @property {string} prompt
 * @property {object} [data]
 * @property {string[]} steps 可用于哪些训练步骤
 * @property {boolean} original
 */

/** @type {WritingTask[]} */
export const WRITING_TASKS = [
  {
    "id": "wt-dynamic-1",
    "kind": "task1",
    "chartType": "dynamic",
    "title": "城市公共交通出行量（动态图 · 原创数据）",
    "prompt": "The table below shows the average number of weekday trips made by three types of public transport in one city, in three selected years. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    "data": {
      "type": "table",
      "caption": "Average weekday trips (millions)",
      "columns": [
        "",
        "2000",
        "2010",
        "2020"
      ],
      "rows": [
        [
          "Bus",
          2.1,
          1.9,
          1.4
        ],
        [
          "Underground",
          1.6,
          2.3,
          3.1
        ],
        [
          "Tram",
          0.4,
          0.5,
          0.9
        ]
      ]
    },
    "steps": [
      "t1-intro",
      "t1-overview",
      "t1-body",
      "mock-t1"
    ],
    "original": true
  },
  {
    "id": "wt-static-1",
    "kind": "task1",
    "chartType": "static",
    "title": "学生每日时间分配（静态比较 · 原创数据）",
    "prompt": "The two pie charts below show how full-time students at one college reported spending an average weekday in 2015 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    "data": {
      "type": "pies",
      "caption": "Share of a weekday (%)",
      "pies": [
        {
          "year": "2015",
          "slices": [
            [
              "Classes",
              25
            ],
            [
              "Self-study",
              12
            ],
            [
              "Part-time work",
              8
            ],
            [
              "Leisure",
              30
            ],
            [
              "Sleep and other",
              25
            ]
          ]
        },
        {
          "year": "2025",
          "slices": [
            [
              "Classes",
              22
            ],
            [
              "Self-study",
              18
            ],
            [
              "Part-time work",
              16
            ],
            [
              "Leisure",
              22
            ],
            [
              "Sleep and other",
              22
            ]
          ]
        }
      ]
    },
    "steps": [
      "t1-intro",
      "t1-overview",
      "t1-body",
      "mock-t1"
    ],
    "original": true
  },
  {
    "id": "wt-process-1",
    "kind": "task1",
    "chartType": "process",
    "title": "回收纸张再造纸的流程（流程图 · 原创文字结构）",
    "prompt": "The diagram below describes the process of recycling waste paper to make new paper products. Summarise the information by selecting and reporting the main features. Write at least 150 words.",
    "data": {
      "type": "process",
      "stages": [
        [
          "Collection",
          "Waste paper is collected from homes and offices and transported to a sorting centre."
        ],
        [
          "Sorting and cleaning",
          "Workers sort the paper by grade; it is then cleaned to remove ink and staples."
        ],
        [
          "Pulping",
          "The cleaned paper is mixed with water and chemicals, and heated until it becomes pulp."
        ],
        [
          "Rolling and drying",
          "The pulp is passed through rollers to remove water, then dried into large sheets."
        ],
        [
          "Cutting and distribution",
          "The sheets are cut into sizes and delivered to printers and shops as new products."
        ]
      ]
    },
    "steps": [
      "t1-intro",
      "t1-overview",
      "t1-body",
      "mock-t1"
    ],
    "original": true
  },
  {
    "id": "wt-map-1",
    "kind": "task1",
    "chartType": "map",
    "title": "Riverford 小镇今昔变化（地图题 · 原创文字结构）",
    "prompt": "The two maps below show the town of Riverford in 2005 and today. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    "data": {
      "type": "map",
      "changes": [
        [
          "North-west",
          "A large factory site in 2005; now replaced by blocks of flats with a small park."
        ],
        [
          "Centre",
          "The old market square remains; the shops along the high street have been converted into cafés and offices."
        ],
        [
          "South",
          "Farmland in 2005; now a new railway station with a car park beside it."
        ],
        [
          "East",
          "Woodland still exists; a cycle path now runs from the station through the woods to the river."
        ]
      ]
    },
    "steps": [
      "t1-intro",
      "t1-overview",
      "t1-body",
      "mock-t1"
    ],
    "original": true
  },
  {
    "id": "wt-t2-remote-1",
    "kind": "task2",
    "title": "远程办公（议论文 · 原创题）",
    "prompt": "Some people believe that working from home should be offered as a standard choice to all employees, while others think this causes more problems than benefits for companies and workers. Discuss both these views and give your own opinion. Write at least 250 words.",
    "steps": [
      "t2-intro",
      "t2-conclusion",
      "t2-outline",
      "t2-body",
      "mock-t2"
    ],
    "original": true
  },
  {
    "id": "wt-t2-gapyear-1",
    "kind": "task2",
    "title": "间隔年（议论文 · 原创题）",
    "prompt": "In some countries, young people are encouraged to travel or work for a year between finishing school and starting university. Do the advantages of taking such a gap year outweigh the disadvantages? Write at least 250 words.",
    "steps": [
      "t2-intro",
      "t2-conclusion",
      "t2-outline",
      "t2-body",
      "mock-t2"
    ],
    "original": true
  },
  {
    "id": "wt-full-1",
    "kind": "full",
    "title": "全套限时（小作文交通数据 + 大作文远程办公）",
    "prompt": "Task 1 使用 wt-dynamic-1；Task 2 使用 wt-t2-remote-1。先 Task 1（约 20 分钟）再 Task 2（约 40 分钟）。",
    "steps": [
      "mock-full"
    ],
    "task1Ref": "wt-dynamic-1",
    "task2Ref": "wt-t2-remote-1",
    "original": true
  }
];

/** @param {string} stepId @returns {WritingTask[]} */
export function tasksForStep(stepId) {
  return WRITING_TASKS.filter((t) => t.steps.includes(stepId))
}
