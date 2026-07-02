// AI 专业课 · 深度学习（dl）章节课节数据
// 从 curriculum.js 原样拆出（2026-06）。补全/注入逻辑（AI_COMPLETION_DEFAULTS、
// LATE_COURSE_CODE、completeAILessonMetadata）仍在 ../curriculum.js，
// 模块加载时会原位向这些 lesson 对象补字段。
export const DL_LESSONS = [
        {
          id: 'dl-neural-network',
          title: '神经网络基础',
          summary: '感知机、前向传播、反向传播',
          theory: `## 神经网络

神经网络由多层神经元组成，通过前向传播和反向传播学习。

### 前向传播

$$z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$$
$$a^{[l]} = g(z^{[l]})$$

### 反向传播

$$dz^{[l]} = da^{[l]} * g'(z^{[l]})$$
$$dW^{[l]} = dz^{[l]} a^{[l-1]T}$$
$$db^{[l]} = dz^{[l]}$$

### 激活函数

| 函数 | 公式 | 特点 |
|------|------|------|
| Sigmoid | $\\sigma(z) = \\frac{1}{1+e^{-z}}$ | 输出 (0,1)，梯度消失 |
| ReLU | $\\max(0, z)$ | 训练快，可能死神经元 |
| Tanh | $\\frac{e^z - e^{-z}}{e^z + e^{-z}}$ | 输出 (-1,1) |
`,
          exercise: { type: 'playground', viz: 'neuralNetwork' },
        },
        {
          id: 'dl-cnn',
          title: '卷积神经网络 (CNN)',
          summary: '卷积层、池化层、特征图',
          theory: `## CNN

卷积神经网络专门处理网格结构数据（如图像）。

### 核心层

- **卷积层**: 用滤波器提取局部特征
- **池化层**: 降维，增强平移不变性
- **全连接层**: 最终分类

### 卷积计算

输出尺寸 = $(N - F + 2P) / S + 1$

其中 N=输入尺寸, F=滤波器尺寸, P=填充, S=步长
`,
          exercise: { type: 'playground', viz: 'cnn' },
        },
        {
          id: 'dl-rnn',
          title: '循环神经网络 (RNN)',
          summary: '序列建模、LSTM、GRU',
          theory: `## RNN

循环神经网络处理序列数据，具有记忆能力。

### LSTM 门控机制

- **遗忘门**: 决定丢弃哪些信息
- **输入门**: 决定存储哪些新信息
- **输出门**: 决定输出哪些信息
`,
          exercise: { type: 'playground', viz: 'rnn' },
        },
        {
          id: 'dl-forward-propagation',
          title: '前向传播',
          summary: '输入逐层流过网络，计算预测输出',
          theory: `## 前向传播 (Forward Propagation)

数据从输入层逐层流向输出层：

$$z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$$
$$a^{[l]} = g(z^{[l]})$$

其中 $g$ 是激活函数。

### 矩阵维度

如果第 $l$ 层有 $n_l$ 个神经元，前一层有 $n_{l-1}$ 个：
- $W^{[l]}$: $n_l \\times n_{l-1}$
- $b^{[l]}$: $n_l \\times 1$
- $z^{[l]}, a^{[l]}$: $n_l \\times 1$

### 向量化

对整个 batch（$m$ 个样本）同时计算：
$$Z^{[l]} = W^{[l]} A^{[l-1]} + b^{[l]}$$
`,
          exercise: { type: 'playground', viz: 'forwardPropagation' },
          code: {
            python: `def forward_prop(X, params):
    A = X
    cache = [A]
    for l in range(1, len(params) // 2 + 1):
        W = params[f'W{l}']
        b = params[f'b{l}']
        Z = W @ A + b
        A = relu(Z) if l < len(params) // 2 else sigmoid(Z)
        cache.append((Z, A))
    return A, cache`,
            cpp: `pair<Matrix, vector<Cache>> forward_prop(Matrix X, vector<Layer> layers) {
    Matrix A = X;
    vector<Cache> caches;
    for (int l = 0; l < layers.size(); l++) {
        Matrix Z = layers[l].W * A + layers[l].b;
        caches.push_back({A, Z});
        A = (l < layers.size()-1) ? relu(Z) : sigmoid(Z);
    }
    return {A, caches};
}`,
          },
          pseudocode: `procedure FORWARD_PROP(X, layers)
    A <- X
    for l = 1 to L do
        Z[l] <- W[l] * A[l-1] + b[l]
        A[l] <- activation(Z[l])
    end for
    return A[L], cache`,
        },
        {
          id: 'dl-backward-propagation',
          title: '反向传播',
          summary: '链式法则逐层计算梯度，更新权重',
          theory: `## 反向传播 (Backpropagation)

利用**链式法则**从输出层向输入层逐层计算梯度：

### 输出层

$$dZ^{[L]} = A^{[L]} - Y$$
$$dW^{[L]} = dZ^{[L]} A^{[L-1]T} / m$$

### 隐藏层

$$dA^{[l-1]} = W^{[l]T} dZ^{[l]}$$
$$dZ^{[l-1]} = dA^{[l-1]} * g'(Z^{[l-1]})$$
$$dW^{[l-1]} = dZ^{[l-1]} A^{[l-2]T} / m$$

### 权重更新

$$W^{[l]} \\leftarrow W^{[l]} - \\alpha \\cdot dW^{[l]}$$
$$b^{[l]} \\leftarrow b^{[l]} - \\alpha \\cdot db^{[l]}$$
`,
          exercise: { type: 'playground', viz: 'backwardPropagation' },
          code: {
            python: `def backward_prop(Y, params, cache, lr):
    m = Y.shape[1]
    grads = {}
    dA = -(Y / cache[-1][1] - (1-Y) / (1-cache[-1][1]))
    for l in reversed(range(1, L+1)):
        dZ = dA * relu_derivative(cache[l-1][0])
        grads[f'dW{l}'] = dZ @ cache[l-1][1].T / m
        grads[f'db{l}'] = dZ.sum(axis=1, keepdims=True) / m
        dA = params[f'W{l}'].T @ dZ
        params[f'W{l}'] -= lr * grads[f'dW{l}']
        params[f'b{l}'] -= lr * grads[f'db{l}']
    return params`,
            cpp: `void backward_prop(Matrix Y, vector<Layer>& layers, vector<Cache> caches, double lr) {
    int m = Y.cols();
    Matrix dA = -(Y.array() / caches.back().A.array()
                  - (1-Y.array()) / (1-caches.back().A.array()));
    for (int l = layers.size()-1; l >= 0; l--) {
        Matrix dZ = dA.array() * relu_deriv(caches[l].Z).array();
        layers[l].dW = dZ * caches[l].A_prev.transpose() / m;
        layers[l].db = dZ.rowwise().sum() / m;
        dA = layers[l].W.transpose() * dZ;
        layers[l].W -= lr * layers[l].dW;
        layers[l].b -= lr * layers[l].db;
    }
}`,
          },
          pseudocode: `procedure BACKWARD_PROP(Y, cache, params)
    dZ[L] <- A[L] - Y
    for l = L down to 1 do
        dW[l] <- dZ[l] * A[l-1]^T / m
        db[l] <- sum(dZ[l]) / m
        dA[l-1] <- W[l]^T * dZ[l]
        dZ[l-1] <- dA[l-1] * g'(Z[l-1])
        W[l] <- W[l] - lr * dW[l]
    end for`,
        },
        {
          id: 'dl-activation-functions',
          title: '激活函数',
          summary: 'Sigmoid、ReLU、Tanh 等非线性变换',
          theory: `## 激活函数

激活函数为神经网络引入**非线性**，使其能拟合任意复杂函数。

### 常见激活函数

| 函数 | 公式 | 导数 | 特点 |
|------|------|------|------|
| Sigmoid | $\\frac{1}{1+e^{-z}}$ | $\\sigma(1-\\sigma)$ | 输出 (0,1)，梯度消失 |
| Tanh | $\\frac{e^z-e^{-z}}{e^z+e^{-z}}$ | $1-\\tanh^2$ | 输出 (-1,1)，零中心 |
| ReLU | $\\max(0,z)$ | $z>0? 1 : 0$ | 训练快，死神经元 |
| LeakyReLU | $\\max(0.01z, z)$ | $z>0? 1 : 0.01$ | 解决死神经元 |
| GELU | $z \\cdot \\Phi(z)$ | 近似计算 | Transformer 常用 |

### 梯度消失/爆炸

- 层数深 + Sigmoid → 梯度连乘趋近 0 → 梯度消失
- 解决方案: ReLU、残差连接、Batch Normalization
`,
          exercise: { type: 'playground', viz: 'activationFunctions' },
          code: {
            python: `def sigmoid(z): return 1 / (1 + np.exp(-z))
def sigmoid_deriv(z): s = sigmoid(z); return s * (1 - s)

def relu(z): return np.maximum(0, z)
def relu_deriv(z): return (z > 0).astype(float)

def tanh_fn(z): return np.tanh(z)
def tanh_deriv(z): return 1 - np.tanh(z)**2

def leaky_relu(z, alpha=0.01): return np.maximum(alpha*z, z)
def leaky_relu_deriv(z, alpha=0.01): return np.where(z > 0, 1, alpha)

def gelu(z): return z * 0.5 * (1 + np.tanh(np.sqrt(2/np.pi) * (z + 0.044715*z**3)))`,
            cpp: `double sigmoid(double z) { return 1.0 / (1.0 + exp(-z)); }
double relu(double z) { return max(0.0, z); }
double tanh_fn(double z) { return tanh(z); }
double leaky_relu(double z) { return z > 0 ? z : 0.01 * z; }`,
          },
          pseudocode: `procedure ACTIVATION(z, type)
    if type = SIGMOID: return 1/(1+exp(-z))
    if type = RELU: return max(0, z)
    if type = TANH: return tanh(z)
    if type = LEAKY_RELU: return max(0.01*z, z)`,
        },
        {
          id: 'dl-loss-functions',
          title: '损失函数',
          summary: 'MSE、交叉熵、Huber、Focal Loss',
          theory: `## 损失函数

衡量预测值与真实值的差异。

### 回归损失

| 函数 | 公式 | 特点 |
|------|------|------|
| MSE | $\\frac{1}{n}\\sum(y-\\hat{y})^2$ | 对大误差敏感 |
| MAE | $\\frac{1}{n}\\sum\\|y-\\hat{y}\\|$ | 鲁棒，不可微在 0 |
| Huber | MSE if $\\|e\\|<\\delta$, else MAE-like | 折中 |

### 分类损失

| 函数 | 公式 | 特点 |
|------|------|------|
| 交叉熵 | $-\\sum y\\log\\hat{y}$ | 分类标准选择 |
| Hinge | $\\max(0, 1-yf(x))$ | SVM 使用 |
| Focal | $-(1-\\hat{y})^\\gamma \\log\\hat{y}$ | 解决类别不平衡 |
`,
          exercise: { type: 'playground', viz: 'lossFunctions' },
          code: {
            python: `def mse_loss(y_true, y_pred):
    return np.mean((y_true - y_pred) ** 2)

def mae_loss(y_true, y_pred):
    return np.mean(np.abs(y_true - y_pred))

def huber_loss(y_true, y_pred, delta=1.0):
    err = y_true - y_pred
    return np.mean(np.where(np.abs(err) < delta,
                            0.5 * err**2,
                            delta * (np.abs(err) - 0.5 * delta)))

def cross_entropy(y_true, y_pred):
    eps = 1e-15
    y_pred = np.clip(y_pred, eps, 1 - eps)
    return -np.mean(y_true * np.log(y_pred) + (1-y_true) * np.log(1-y_pred))

def focal_loss(y_true, y_pred, gamma=2.0):
    p_t = y_true * y_pred + (1-y_true) * (1-y_pred)
    return -np.mean((1 - p_t)**gamma * np.log(p_t + 1e-15))`,
            cpp: `double mse(Vector y, Vector pred) { return (y - pred).squaredNorm() / y.size(); }
double cross_entropy(Vector y, Vector pred) {
    double loss = 0;
    for (int i = 0; i < y.size(); i++)
        loss -= y[i] * log(pred[i]) + (1-y[i]) * log(1-pred[i]);
    return loss / y.size();
}`,
          },
          pseudocode: `procedure LOSS(type, y_true, y_pred)
    if type = MSE: return mean((y_true - y_pred)^2)
    if type = MAE: return mean(|y_true - y_pred|)
    if type = CROSS_ENTROPY: return -mean(y*log(yhat) + (1-y)*log(1-yhat))
    if type = FOCAL: return -mean((1-pt)^gamma * log(pt))`,
        },
        {
          id: 'dl-cnn-convolution',
          title: 'CNN 卷积操作',
          summary: '滤波器滑动、特征提取、特征图生成',
          theory: `## 卷积操作 (Convolution)

滤波器（kernel）在输入上滑动，逐位置计算**元素乘法之和**：

$$O[i,j] = \\sum_m \\sum_n I[i+m, j+n] \\cdot K[m,n] + b$$

### 输出尺寸

$$O_{size} = \\lfloor \\frac{N - F + 2P}{S} \\rfloor + 1$$

- $N$: 输入尺寸, $F$: 滤波器尺寸, $P$: 填充, $S$: 步长

### 常见滤波器

| 类型 | 效果 |
|------|------|
| 边缘检测 | 突出边缘（Sobel, Laplacian） |
| 模糊 | 平均邻域（均值滤波） |
| 锐化 | 增强高频（中心正、周围负） |
`,
          exercise: { type: 'playground', viz: 'cnnConvolution' },
          code: {
            python: `def convolve2d(image, kernel, stride=1, padding=0):
    H, W = image.shape
    kH, kW = kernel.shape
    # 添加填充
    if padding > 0:
        image = np.pad(image, padding, mode='constant')
        H, W = image.shape
    # 计算输出尺寸
    out_H = (H - kH) // stride + 1
    out_W = (W - kW) // stride + 1
    output = np.zeros((out_H, out_W))
    for i in range(out_H):
        for j in range(out_W):
            region = image[i*stride:i*stride+kH, j*stride:j*stride+kW]
            output[i, j] = np.sum(region * kernel)
    return output

# 边缘检测滤波器
edge_kernel = np.array([[-1, -1, -1],
                        [-1,  8, -1],
                        [-1, -1, -1]])`,
            cpp: `Matrix convolve2d(Matrix image, Matrix kernel, int stride, int pad) {
    int H = image.rows() + 2*pad, W = image.cols() + 2*pad;
    Matrix padded = Matrix::Zero(H, W);
    padded.block(pad, pad, image.rows(), image.cols()) = image;
    int kH = kernel.rows(), kW = kernel.cols();
    int outH = (H - kH) / stride + 1, outW = (W - kW) / stride + 1;
    Matrix output(outH, outW);
    for (int i = 0; i < outH; i++)
        for (int j = 0; j < outW; j++)
            output(i,j) = (padded.block(i*stride, j*stride, kH, kW)
                          .array() * kernel.array()).sum();
    return output;
}`,
          },
          pseudocode: `procedure CONV2D(input, kernel, stride, padding)
    pad input
    for each output position (i, j) do
        region <- input[i*s : i*s+kH, j*s : j*s+kW]
        output[i, j] <- sum(region * kernel)
    end for
    return output`,
        },
        {
          id: 'dl-pooling',
          title: '池化操作',
          summary: '下采样：最大池化、平均池化',
          theory: `## 池化 (Pooling)

池化层对特征图进行**下采样**，减小空间维度：

### 最大池化 (Max Pooling)

取窗口内的最大值：$O[i,j] = \\max_{(m,n) \\in R_{ij}} I[m,n]$

### 平均池化 (Average Pooling)

取窗口内的均值：$O[i,j] = \\frac{1}{|R_{ij}|} \\sum_{(m,n) \\in R_{ij}} I[m,n]$

### 作用

- 减小特征图尺寸 → 降低计算量
- 增强**平移不变性**
- 扩大后续层的感受野

### 常见配置

- 2×2 池化, 步长 2 → 尺寸减半
- 全局平均池化 (GAP) → 替代全连接层
`,
          exercise: { type: 'playground', viz: 'pooling' },
          code: {
            python: `def max_pool2d(input, pool_size=2, stride=2):
    H, W = input.shape
    out_H = (H - pool_size) // stride + 1
    out_W = (W - pool_size) // stride + 1
    output = np.zeros((out_H, out_W))
    for i in range(out_H):
        for j in range(out_W):
            window = input[i*stride:i*stride+pool_size,
                          j*stride:j*stride+pool_size]
            output[i, j] = np.max(window)
    return output

def avg_pool2d(input, pool_size=2, stride=2):
    # 类似，但取 mean
    ...`,
            cpp: `Matrix max_pool2d(Matrix input, int pool_size, int stride) {
    int outH = (input.rows() - pool_size) / stride + 1;
    int outW = (input.cols() - pool_size) / stride + 1;
    Matrix output(outH, outW);
    for (int i = 0; i < outH; i++)
        for (int j = 0; j < outW; j++)
            output(i,j) = input.block(i*stride, j*stride,
                                      pool_size, pool_size).maxCoeff();
    return output;
}`,
          },
          pseudocode: `procedure POOL(input, pool_size, stride, type)
    for each output position (i, j) do
        window <- input[i*s:i*s+ps, j*s:j*s+ps]
        if type = MAX: output[i,j] <- max(window)
        if type = AVG: output[i,j] <- mean(window)
    end for
    return output`,
        },
]
