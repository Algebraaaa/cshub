// ─────────────────────────────────────────────────────────────
// AI 课程轻量目录索引 · 自动生成,勿手改
// 重新生成: npm run generate:ai-index
// 只含目录页与课节页同步路径需要的轻字段;课节正文经
// loadChapter.js 按章动态加载。一致性由 curriculum.test.js 锁定。
// ─────────────────────────────────────────────────────────────
export const AI_COURSE_META = {
  "id": "ai-masters",
  "title": "AI 专业课",
  "instrument": "ai",
  "icon": "🤖",
  "color": "#8b5cf6"
}

export const AI_CHAPTER_INDEX = [
  {
    "id": "optim",
    "title": "最优化方法",
    "lessons": [
      {
        "id": "optim-gd-variants",
        "title": "梯度下降变体对比",
        "summary": "BGD、SGD、Mini-batch 的收敛行为差异",
        "hasExercise": true
      },
      {
        "id": "optim-momentum",
        "title": "Momentum 动量法",
        "summary": "物理直觉：小球滚下山坡，积累速度",
        "hasExercise": true
      },
      {
        "id": "optim-rmsprop",
        "title": "RMSProp",
        "summary": "自适应学习率：梯度大的方向步长小",
        "hasExercise": true
      },
      {
        "id": "optim-adam",
        "title": "Adam 优化器",
        "summary": "结合 Momentum + RMSProp，最常用的优化器",
        "hasExercise": true
      },
      {
        "id": "optim-lr-compare",
        "title": "学习率对比实验",
        "summary": "同一出发点，不同学习率的收敛轨迹",
        "hasExercise": true
      },
      {
        "id": "optim-newton",
        "title": "牛顿法",
        "summary": "二阶优化：用 Hessian 矩阵实现二次收敛",
        "hasExercise": true
      },
      {
        "id": "optim-conjugate-gradient",
        "title": "共轭梯度法",
        "summary": "求解线性系统，n 步收敛",
        "hasExercise": true
      },
      {
        "id": "optim-line-search",
        "title": "线搜索策略",
        "summary": "黄金分割法与回溯线搜索",
        "hasExercise": true
      },
      {
        "id": "optim-ga",
        "title": "遗传算法 (GA)",
        "summary": "模拟自然选择：选择、交叉、变异",
        "hasExercise": true
      },
      {
        "id": "optim-pso",
        "title": "粒子群优化 (PSO)",
        "summary": "模拟鸟群觅食：个体最优 + 全局最优",
        "hasExercise": true
      },
      {
        "id": "optim-sa",
        "title": "模拟退火 (SA)",
        "summary": "Metropolis 准则：高温探索，低温收敛",
        "hasExercise": true
      },
      {
        "id": "optim-nesterov",
        "title": "Nesterov 加速梯度",
        "summary": "Look-ahead 梯度：先看一步再决定方向",
        "hasExercise": true
      },
      {
        "id": "optim-adagrad",
        "title": "AdaGrad 自适应学习率",
        "summary": "梯度平方累积，自动缩小频繁方向的步长",
        "hasExercise": true
      },
      {
        "id": "optim-bfgs",
        "title": "BFGS 拟牛顿法",
        "summary": "近似 Hessian 逆矩阵，超线性收敛",
        "hasExercise": true
      },
      {
        "id": "optim-coordinate-descent",
        "title": "坐标下降法",
        "summary": "每步只优化一个坐标/参数",
        "hasExercise": true
      }
    ]
  },
  {
    "id": "ml",
    "title": "机器学习基础",
    "lessons": [
      {
        "id": "ml-linear-regression",
        "title": "线性回归",
        "summary": "最小二乘法、梯度下降求解线性模型参数",
        "hasExercise": true
      },
      {
        "id": "ml-logistic-regression",
        "title": "逻辑回归",
        "summary": "Sigmoid 函数、二分类决策边界",
        "hasExercise": true
      },
      {
        "id": "ml-gradient-descent",
        "title": "梯度下降优化器",
        "summary": "BGD、SGD、Mini-batch、Momentum、Adam",
        "hasExercise": true
      },
      {
        "id": "ml-knn",
        "title": "K 近邻 (KNN)",
        "summary": "距离度量、投票机制、K 值选择",
        "hasExercise": true
      },
      {
        "id": "ml-kmeans",
        "title": "K-Means 聚类",
        "summary": "质心迭代、肘部法则、聚类评估",
        "hasExercise": true
      },
      {
        "id": "ml-decision-tree",
        "title": "决策树",
        "summary": "信息增益、基尼不纯度、剪枝",
        "hasExercise": true
      },
      {
        "id": "ml-svm",
        "title": "支持向量机 (SVM)",
        "summary": "最大间隔、核技巧、软间隔",
        "hasExercise": true
      },
      {
        "id": "ml-gradient-descent-3d",
        "title": "梯度下降 2D/3D 可视化",
        "summary": "二维等高线 + 三维损失曲面 + 收敛轨迹",
        "hasExercise": true
      },
      {
        "id": "ml-ridge-regression",
        "title": "岭回归 (Ridge)",
        "summary": "L2 正则化：缩小权重，防止过拟合",
        "hasExercise": true
      },
      {
        "id": "ml-lasso-regression",
        "title": "Lasso 回归",
        "summary": "L1 正则化：产生稀疏解，自动特征选择",
        "hasExercise": true
      },
      {
        "id": "ml-naive-bayes",
        "title": "朴素贝叶斯",
        "summary": "贝叶斯定理 + 特征独立假设",
        "hasExercise": true
      },
      {
        "id": "ml-random-forest",
        "title": "随机森林",
        "summary": "多棵决策树 + Bagging + 特征随机子集",
        "hasExercise": true
      },
      {
        "id": "ml-adaboost",
        "title": "AdaBoost 自适应提升",
        "summary": "逐步关注错分样本，组合弱学习器",
        "hasExercise": true
      },
      {
        "id": "ml-gradient-boosting",
        "title": "梯度提升 (GBDT)",
        "summary": "每棵新树拟合前一轮的残差/负梯度",
        "hasExercise": true
      },
      {
        "id": "ml-hierarchical-clustering",
        "title": "层次聚类",
        "summary": "自底向上合并，构建树状图",
        "hasExercise": true
      },
      {
        "id": "ml-dbscan",
        "title": "DBSCAN 密度聚类",
        "summary": "基于密度的聚类，自动发现任意形状的簇",
        "hasExercise": true
      },
      {
        "id": "ml-pca",
        "title": "PCA 主成分分析",
        "summary": "降维：找到方差最大的投影方向",
        "hasExercise": true
      },
      {
        "id": "ml-gmm",
        "title": "GMM 高斯混合模型",
        "summary": "EM 算法：软聚类 + 概率框架",
        "hasExercise": true
      },
      {
        "id": "ml-hmm",
        "title": "HMM 隐马尔可夫模型",
        "summary": "状态转移 + 观测概率 + Viterbi 解码",
        "hasExercise": true
      },
      {
        "id": "ml-mle-map",
        "title": "MLE 与 MAP 估计",
        "summary": "最大似然 vs 最大后验，先验的影响",
        "hasExercise": true
      }
    ]
  },
  {
    "id": "dl",
    "title": "深度学习",
    "lessons": [
      {
        "id": "dl-neural-network",
        "title": "神经网络基础",
        "summary": "感知机、前向传播、反向传播",
        "hasExercise": true
      },
      {
        "id": "dl-cnn",
        "title": "卷积神经网络 (CNN)",
        "summary": "卷积层、池化层、特征图",
        "hasExercise": true
      },
      {
        "id": "dl-rnn",
        "title": "循环神经网络 (RNN)",
        "summary": "序列建模、LSTM、GRU",
        "hasExercise": true
      },
      {
        "id": "dl-forward-propagation",
        "title": "前向传播",
        "summary": "输入逐层流过网络，计算预测输出",
        "hasExercise": true
      },
      {
        "id": "dl-backward-propagation",
        "title": "反向传播",
        "summary": "链式法则逐层计算梯度，更新权重",
        "hasExercise": true
      },
      {
        "id": "dl-activation-functions",
        "title": "激活函数",
        "summary": "Sigmoid、ReLU、Tanh 等非线性变换",
        "hasExercise": true
      },
      {
        "id": "dl-loss-functions",
        "title": "损失函数",
        "summary": "MSE、交叉熵、Huber、Focal Loss",
        "hasExercise": true
      },
      {
        "id": "dl-cnn-convolution",
        "title": "CNN 卷积操作",
        "summary": "滤波器滑动、特征提取、特征图生成",
        "hasExercise": true
      },
      {
        "id": "dl-pooling",
        "title": "池化操作",
        "summary": "下采样：最大池化、平均池化",
        "hasExercise": true
      }
    ]
  },
  {
    "id": "or",
    "title": "最优化与运筹优化",
    "lessons": [
      {
        "id": "or-linear-programming",
        "title": "线性规划",
        "summary": "约束、可行域、目标等值线与最优顶点",
        "hasExercise": true
      },
      {
        "id": "or-simplex",
        "title": "单纯形法",
        "summary": "线性规划的顶点搜索算法",
        "hasExercise": true
      },
      {
        "id": "or-branch-and-bound",
        "title": "分支定界法",
        "summary": "整数规划的树搜索 + 剪枝",
        "hasExercise": true
      },
      {
        "id": "or-lagrangian",
        "title": "拉格朗日乘子法",
        "summary": "将约束优化转化为无约束优化",
        "hasExercise": true
      },
      {
        "id": "or-convex-optimization",
        "title": "凸优化基础",
        "summary": "凸函数、凸集、局部最优即全局最优",
        "hasExercise": true
      },
      {
        "id": "or-integer-programming",
        "title": "整数规划",
        "summary": "变量必须取整数值，NP-hard 问题",
        "hasExercise": true
      }
    ]
  },
  {
    "id": "feature",
    "title": "特征工程与模型评估",
    "lessons": [
      {
        "id": "feature-standardization",
        "title": "标准化与归一化",
        "summary": "Z-score 标准化 vs Min-Max 归一化",
        "hasExercise": true
      },
      {
        "id": "feature-one-hot",
        "title": "One-Hot 编码",
        "summary": "类别变量转二进制向量",
        "hasExercise": true
      },
      {
        "id": "feature-selection",
        "title": "特征选择",
        "summary": "Filter、Wrapper、Embedded 三种方法",
        "hasExercise": true
      },
      {
        "id": "feature-polynomial",
        "title": "多项式特征",
        "summary": "通过特征交叉和幂次扩展特征空间",
        "hasExercise": true
      },
      {
        "id": "feature-confusion-matrix",
        "title": "混淆矩阵",
        "summary": "TP、FP、TN、FN 与派生指标",
        "hasExercise": true
      },
      {
        "id": "feature-roc-curve",
        "title": "ROC 曲线与 AUC",
        "summary": "阈值变化下的 TPR-FPR 权衡",
        "hasExercise": true
      },
      {
        "id": "feature-cross-validation",
        "title": "交叉验证",
        "summary": "K-fold、留一法、分层抽样",
        "hasExercise": true
      },
      {
        "id": "feature-bias-variance",
        "title": "偏差-方差权衡",
        "summary": "欠拟合、过拟合与模型复杂度",
        "hasExercise": true
      }
    ]
  },
  {
    "id": "it",
    "title": "信息论与编码",
    "lessons": [
      {
        "id": "it-selfinfo",
        "title": "自信息与信息量",
        "summary": "概率越小，信息量越大",
        "hasExercise": true
      },
      {
        "id": "it-entropy",
        "title": "信息熵 Entropy",
        "summary": "离散分布的平均不确定性",
        "hasExercise": true
      },
      {
        "id": "it-joint-conditional",
        "title": "联合熵与条件熵",
        "summary": "联合概率表上的 H(X,Y) 与 H(Y|X)",
        "hasExercise": true
      },
      {
        "id": "it-mutual",
        "title": "互信息 Mutual Information",
        "summary": "两个随机变量共享的信息量",
        "hasExercise": true
      },
      {
        "id": "it-kl-crossentropy",
        "title": "KL 散度与交叉熵",
        "summary": "两个概率分布的差异与分类损失",
        "hasExercise": true
      },
      {
        "id": "it-entropyrate",
        "title": "熵率 Entropy Rate",
        "summary": "随机过程单位时间的不确定性",
        "hasExercise": true
      },
      {
        "id": "it-channel",
        "title": "信道模型 BSC/BEC",
        "summary": "转移概率、噪声和输出符号",
        "hasExercise": true
      },
      {
        "id": "it-channelcapacity",
        "title": "信道容量",
        "summary": "最大化输入分布下的互信息",
        "hasExercise": true
      },
      {
        "id": "it-markov-source",
        "title": "马尔可夫信源",
        "summary": "状态图、转移矩阵与平稳分布",
        "hasExercise": true
      },
      {
        "id": "it-markov-channel",
        "title": "马尔可夫信道",
        "summary": "信道状态随时间变化的输入输出过程",
        "hasExercise": true
      },
      {
        "id": "it-huffman",
        "title": "霍夫曼编码",
        "summary": "频率统计、节点合并和最优前缀码",
        "hasExercise": true
      },
      {
        "id": "it-shannonfano",
        "title": "香农-费诺编码",
        "summary": "概率排序、递归划分和码字分配",
        "hasExercise": true
      },
      {
        "id": "it-errorcorrect",
        "title": "纠错编码基础",
        "summary": "校验、定位错误和纠错",
        "hasExercise": true
      },
      {
        "id": "it-datacompression",
        "title": "数据压缩与冗余度",
        "summary": "平均码长、编码效率与冗余",
        "hasExercise": true
      }
    ]
  },
  {
    "id": "nlp",
    "title": "自然语言处理",
    "lessons": [
      {
        "id": "nlp-word-embedding",
        "title": "词嵌入",
        "summary": "Word2Vec、GloVe、词向量空间",
        "hasExercise": true
      },
      {
        "id": "nlp-tokenization",
        "title": "分词与子词编码",
        "summary": "Word、Subword（BPE）、Character tokenization",
        "hasExercise": true
      },
      {
        "id": "nlp-word2vec",
        "title": "Word2Vec 训练",
        "summary": "CBOW vs Skip-gram、负采样",
        "hasExercise": true
      },
      {
        "id": "nlp-glove",
        "title": "GloVe 全局向量",
        "summary": "全局词共现、加权最小二乘",
        "hasExercise": true
      },
      {
        "id": "nlp-attention",
        "title": "注意力机制",
        "summary": "Self-Attention、缩放点积注意力",
        "hasExercise": true
      },
      {
        "id": "nlp-multihead-attention",
        "title": "多头注意力",
        "summary": "并行注意力头、拼接与线性变换",
        "hasExercise": true
      },
      {
        "id": "nlp-masked-attention",
        "title": "掩码注意力",
        "summary": "因果掩码、填充掩码、防止未来信息泄露",
        "hasExercise": true
      },
      {
        "id": "nlp-positional-encoding",
        "title": "位置编码",
        "summary": "正弦位置编码、学习式位置编码、旋转位置编码",
        "hasExercise": true
      },
      {
        "id": "nlp-transformer",
        "title": "Transformer 架构",
        "summary": "编码器-解码器、多头注意力、前馈网络、层归一化",
        "hasExercise": true
      },
      {
        "id": "nlp-bert-gpt",
        "title": "BERT 与 GPT",
        "summary": "编码器-only vs 解码器-only、预训练目标对比",
        "hasExercise": true
      }
    ]
  },
  {
    "id": "cv",
    "title": "计算机视觉",
    "lessons": [
      {
        "id": "cv-image-classification",
        "title": "图像分类",
        "summary": "经典 CNN 架构：LeNet、AlexNet、VGG、ResNet、EfficientNet",
        "hasExercise": true
      },
      {
        "id": "cv-cnn-evolution",
        "title": "CNN 架构演进",
        "summary": "从 LeNet 到 EfficientNet：深度、残差、复合缩放的进化之路",
        "hasExercise": true
      },
      {
        "id": "cv-image-augmentation",
        "title": "图像数据增强",
        "summary": "翻转、旋转、颜色抖动、随机裁剪、MixUp 等增强策略",
        "hasExercise": true
      },
      {
        "id": "cv-transfer-learning",
        "title": "迁移学习",
        "summary": "预训练 + 微调：将大数据集学到的知识迁移到小数据集",
        "hasExercise": true
      },
      {
        "id": "cv-object-detection",
        "title": "目标检测",
        "summary": "两阶段 vs 单阶段：从 R-CNN 到 YOLO 的演进",
        "hasExercise": true
      },
      {
        "id": "cv-iou",
        "title": "IoU 与 mAP",
        "summary": "交并比计算、阈值设定、平均精度均值",
        "hasExercise": true
      },
      {
        "id": "cv-nms",
        "title": "NMS 非极大值抑制",
        "summary": "贪婪 NMS、Soft-NMS、DIoU-NMS 的原理与对比",
        "hasExercise": true
      },
      {
        "id": "cv-anchor-box",
        "title": "锚框机制",
        "summary": "生成、匹配与多尺度检测的锚框策略",
        "hasExercise": true
      },
      {
        "id": "cv-yolo",
        "title": "YOLO 目标检测",
        "summary": "单阶段检测：网格预测、损失函数、架构演进",
        "hasExercise": true
      },
      {
        "id": "cv-segmentation",
        "title": "图像分割",
        "summary": "语义分割与实例分割：U-Net、Mask R-CNN",
        "hasExercise": true
      }
    ]
  },
  {
    "id": "rl",
    "title": "强化学习",
    "lessons": [
      {
        "id": "rl-mdp",
        "title": "马尔可夫决策过程 (MDP)",
        "summary": "状态、动作、奖励、转移概率、折扣因子",
        "hasExercise": true
      },
      {
        "id": "rl-bellman",
        "title": "贝尔曼方程",
        "summary": "值函数、最优性、动态规划基础",
        "hasExercise": true
      },
      {
        "id": "rl-value-iteration",
        "title": "值迭代",
        "summary": "同步/异步更新、收敛性证明",
        "hasExercise": true
      },
      {
        "id": "rl-policy-iteration",
        "title": "策略迭代",
        "summary": "策略评估 + 策略改进，两阶段交替",
        "hasExercise": true
      },
      {
        "id": "rl-qlearning",
        "title": "Q-Learning",
        "summary": "Q 表、贝尔曼方程、ε-greedy 策略",
        "hasExercise": true
      },
      {
        "id": "rl-sarsa",
        "title": "SARSA",
        "summary": "同策略 TD 学习，与 Q-Learning 对比",
        "hasExercise": true
      },
      {
        "id": "rl-experience-replay",
        "title": "经验回放",
        "summary": "回放缓冲区、随机采样、打破样本相关性",
        "hasExercise": true
      },
      {
        "id": "rl-dqn",
        "title": "深度 Q 网络 (DQN)",
        "summary": "神经网络近似 Q 函数、目标网络、Double DQN",
        "hasExercise": true
      },
      {
        "id": "rl-policy-gradient",
        "title": "策略梯度",
        "summary": "REINFORCE 算法、基线、方差缩减",
        "hasExercise": true
      },
      {
        "id": "rl-actor-critic",
        "title": "Actor-Critic",
        "summary": "优势函数、A2C、PPO 算法",
        "hasExercise": true
      }
    ]
  },
  {
    "id": "llm",
    "title": "大语言模型",
    "lessons": [
      {
        "id": "llm-tokenization",
        "title": "Tokenization 分词",
        "summary": "BPE、WordPiece、SentencePiece、词表构建",
        "hasExercise": true
      },
      {
        "id": "llm-pretraining",
        "title": "预训练与微调",
        "summary": "语言模型预训练、SFT、RLHF",
        "hasExercise": true
      },
      {
        "id": "llm-mlm",
        "title": "掩码语言模型 (MLM)",
        "summary": "BERT 预训练目标、15% 掩码策略",
        "hasExercise": true
      },
      {
        "id": "llm-clm",
        "title": "因果语言模型 (CLM)",
        "summary": "GPT 预训练目标、自回归生成、Teacher Forcing",
        "hasExercise": true
      },
      {
        "id": "llm-sft",
        "title": "监督微调 (SFT)",
        "summary": "指令数据、损失掩码、超参数",
        "hasExercise": true
      },
      {
        "id": "llm-rlhf",
        "title": "RLHF 与 PPO",
        "summary": "奖励模型训练、PPO 对齐、DPO 替代",
        "hasExercise": true
      },
      {
        "id": "llm-rag",
        "title": "RAG 检索增强生成",
        "summary": "向量数据库、语义检索、上下文注入",
        "hasExercise": true
      },
      {
        "id": "llm-tool-calling",
        "title": "工具调用与 Function Calling",
        "summary": "Schema 定义、规划、执行循环、ReAct",
        "hasExercise": true
      },
      {
        "id": "llm-chain-of-thought",
        "title": "思维链 (CoT)",
        "summary": "Prompting 技术、自一致性、Tree-of-Thought",
        "hasExercise": true
      },
      {
        "id": "llm-agent",
        "title": "AI Agent",
        "summary": "工具调用、规划、记忆、多智能体协作",
        "hasExercise": true
      }
    ]
  }
]

export const AI_LESSON_ALIASES = {
  "opt-branch-bound": "or-branch-and-bound",
  "or-branch-bound": "or-branch-and-bound",
  "dl-attention": "nlp-attention",
  "attention": "nlp-attention"
}

// id → { chapterId, title } 扁平查找表(派生)
export const AI_LESSON_INDEX = Object.fromEntries(
  AI_CHAPTER_INDEX.flatMap(ch => ch.lessons.map(l => [l.id, { chapterId: ch.id, title: l.title }]))
)

export const AI_TOTAL_LESSONS = AI_CHAPTER_INDEX.reduce((sum, ch) => sum + ch.lessons.length, 0)
