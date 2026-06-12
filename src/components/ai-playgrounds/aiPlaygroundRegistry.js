// AI Playground 注册表 · viz key → Playground lazy loader
// 仿照 src/components/learning/playgroundRegistry.js 的模式

let modules
try {
  modules = import.meta.glob('./*Playground.jsx')
} catch {
  modules = null
}

const byName = modules
  ? Object.fromEntries(
      Object.entries(modules).map(([p, loader]) => {
        const name = p.split('/').pop().replace('.jsx', '')
        return [name, loader]
      })
    )
  : null

const stubCache = new Map()
function lookup(name) {
  if (byName) return byName[name] || null
  if (!stubCache.has(name)) {
    stubCache.set(name, () => Promise.resolve({ default: () => null }))
  }
  return stubCache.get(name)
}

export const AI_VIZ_TO_NAME = {
  // ─── 最优化方法 ───────────────────────────────────────
  gradientDescent: 'GradientDescent',
  gradientDescent3D: 'GradientDescent3D',
  gdVariants: 'GDVariants',
  momentum: 'Momentum',
  nesterov: 'Nesterov',
  adagrad: 'AdaGrad',
  rmsprop: 'RMSProp',
  adam: 'Adam',
  bfgs: 'BFGS',
  coordinateDescent: 'CoordinateDescent',
  lrCompare: 'LRCompare',
  optimizerCompare: 'OptimizerCompare',
  newtonMethod: 'NewtonMethod',
  conjugateGradient: 'ConjugateGradient',
  lineSearch: 'LineSearch',
  geneticAlgorithm: 'GeneticAlgorithm',
  pso: 'PSO',
  simulatedAnnealing: 'SimulatedAnnealing',

  // ─── 传统机器学习 ─────────────────────────────────────
  linearRegression: 'LinearRegression',
  ridgeLasso: 'RidgeLasso',
  ridgeRegression: 'RidgeRegression',
  lassoRegression: 'LassoRegression',
  logisticRegression: 'LogisticRegression',
  naiveBayes: 'NaiveBayes',
  knn: 'KNN',
  decisionTree: 'DecisionTree',
  svm: 'SVM',
  randomForest: 'RandomForest',
  adaBoost: 'AdaBoost',
  gradientBoosting: 'GradientBoosting',
  kmeans: 'KMeans',
  hierarchical: 'Hierarchical',
  hierarchicalClustering: 'HierarchicalClustering',
  dbscan: 'DBSCAN',
  pca: 'PCA',
  gmm: 'GMM',
  hmm: 'HMM',
  mleVsMap: 'MLEvsMAP',

  // ─── 最优化 / 运筹优化 ────────────────────────────────
  linearProgramming: 'LinearProgramming',
  lpSimplex: 'LPSimplex',
  simplex: 'Simplex',
  branchBound: 'BranchBound',
  branchAndBound: 'BranchAndBound',
  lagrangeKKT: 'LagrangeKKT',
  lagrangian: 'Lagrangian',
  convexOpt: 'ConvexOpt',
  convexOptimization: 'ConvexOptimization',
  integerProgramming: 'IntegerProgramming',
  dpBag: 'DPBag',
  greedyLocal: 'GreedyLocal',

  // ─── 特征工程 & 模型评估 ──────────────────────────────
  featureEngineering: 'FeatureEngineering',
  metrics: 'Metrics',
  missingValue: 'MissingValue',
  standardization: 'Standardization',
  oneHot: 'OneHot',
  oneHotEncoding: 'OneHotEncoding',
  featureSelection: 'FeatureSelection',
  polynomialFeatures: 'PolynomialFeatures',
  confusionMatrix: 'ConfusionMatrix',
  rocAuc: 'ROCAUC',
  rocCurve: 'ROCCurve',
  regressionMetrics: 'RegressionMetrics',
  overfitting: 'Overfitting',
  crossValidation: 'CrossValidation',
  biasVariance: 'BiasVariance',

  // ─── 深度学习基础 ─────────────────────────────────────
  neuralNetwork: 'NeuralNetwork',
  forwardPropagation: 'ForwardPropagation',
  backwardPropagation: 'BackwardPropagation',
  backpropagation: 'Backpropagation',
  activation: 'Activation',
  activationFunctions: 'ActivationFunctions',
  lossFunctions: 'LossFunctions',
  cnn: 'CNN',
  cnnConvolution: 'CNNConvolution',
  pooling: 'Pooling',
  rnn: 'RNN',
  rnnLSTM: 'RNNLSTM',

  // ─── 信息论（复用算法库内部可视化实现，入口归 AI 专业课）───────
  infoTheoryBridge: 'AIInfoTheoryBridge',

  // ─── NLP（真实演算可视化，2026-06 替换掉旧的 AIConcept 概念流图）──
  wordEmbedding: 'WordEmbedding',
  attention: 'Attention',
  transformer: 'Transformer',

  // ─── CV ───────────────────────────────────────────────
  imageClassification: 'ImageClassification',
  objectDetection: 'ObjectDetection',

  // ─── RL ───────────────────────────────────────────────
  qlearning: 'QLearning',
  policyGradient: 'PolicyGradient',

  // ─── LLM ──────────────────────────────────────────────
  pretraining: 'Pretraining',
  rag: 'RAG',
  agent: 'AgentLoop',
}

export const AI_PLAYGROUND_LOADERS = Object.fromEntries(
  Object.entries(AI_VIZ_TO_NAME).map(([viz, name]) => [viz, lookup(`${name}Playground`)])
)

export function getAIPlaygroundLoader(viz) {
  return AI_PLAYGROUND_LOADERS[viz] || null
}
