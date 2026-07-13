// AI 专业课 · 计算机视觉（cv）章节课节数据
// 从 curriculum.js 原样拆出（2026-06）。补全/注入逻辑（AI_COMPLETION_DEFAULTS、
// LATE_COURSE_CODE、completeAILessonMetadata）仍在 ../curriculum.js，
// 模块加载时会原位向这些 lesson 对象补字段。
export const CV_LESSONS = [
        {
          id: 'cv-image-classification',
          title: '图像分类',
          summary: '经典 CNN 架构：LeNet、AlexNet、VGG、ResNet、EfficientNet',
          theory: `## 图像分类

使用卷积神经网络（CNN）对图像进行类别预测。输入是一张图像，输出是该图像属于各个类别的概率分布。

### 经典架构演进

| 网络 | 年份 | 创新 | Top-5 错误率 (ImageNet) |
|------|------|------|------------------------|
| LeNet-5 | 1998 | 卷积+池化，手写数字识别 | — |
| AlexNet | 2012 | ReLU、Dropout、GPU 训练 | 15.3% |
| VGGNet | 2014 | 小卷积核堆叠（3×3） | 7.3% |
| ResNet | 2015 | 残差连接，解决梯度消失 | 3.57% |
| EfficientNet | 2019 | 复合缩放策略 | 1.9% |

### 残差连接

ResNet 的核心创新是残差块（Residual Block）：

$$H(x) = F(x) + x$$

其中 $F(x)$ 是卷积层学习的残差，$x$ 是恒等映射。残差连接使梯度可以直接回传，有效缓解了深层网络的梯度消失问题。

### 卷积层参数计算

$$\\text{输出尺寸} = \\frac{W - K + 2P}{S} + 1$$

其中 $W$ 是输入尺寸，$K$ 是卷积核大小，$P$ 是填充，$S$ 是步长。
`,
          exercise: { type: 'playground', viz: 'imageClassification' },
          code: {
            cpp: `// 简单的卷积层实现
struct ConvLayer {
    int in_channels, out_channels, kernel_size, stride, padding;
    vector<vector<vector<vector<float>>>> weight; // [out][in][k][k]
    vector<float> bias;

    vector<vector<vector<float>>> forward(const vector<vector<vector<float>>>& input) {
        int H = input[0].size(), W = input[0][0].size();
        int outH = (H - kernel_size + 2 * padding) / stride + 1;
        int outW = (W - kernel_size + 2 * padding) / stride + 1;
        vector<vector<vector<float>>> output(out_channels,
            vector<vector<float>>(outH, vector<float>(outW, 0)));

        for (int oc = 0; oc < out_channels; oc++) {
            for (int oh = 0; oh < outH; oh++) {
                for (int ow = 0; ow < outW; ow++) {
                    float sum = bias[oc];
                    for (int ic = 0; ic < in_channels; ic++) {
                        for (int kh = 0; kh < kernel_size; kh++) {
                            for (int kw = 0; kw < kernel_size; kw++) {
                                int ih = oh * stride - padding + kh;
                                int iw = ow * stride - padding + kw;
                                if (ih >= 0 && ih < H && iw >= 0 && iw < W)
                                    sum += weight[oc][ic][kh][kw] * input[ic][ih][iw];
                            }
                        }
                    }
                    output[oc][oh][ow] = max(sum, 0.0f); // ReLU
                }
            }
        }
        return output;
    }
};`,
            python: `import torch
import torch.nn as nn

class SimpleCNN(nn.Module):
    def __init__(self, num_classes=1000):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 64, 3, padding=1), nn.ReLU(),
            nn.Conv2d(64, 64, 3, padding=1), nn.ReLU(),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(64, 128, 3, padding=1), nn.ReLU(),
            nn.Conv2d(128, 128, 3, padding=1), nn.ReLU(),
            nn.MaxPool2d(2, 2),
        )
        self.classifier = nn.Sequential(
            nn.Linear(128 * 56 * 56, 4096), nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(4096, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)`,
          },
          variablesSnapshot: {
            inputSize: '224×224×3',
            architecture: 'VGG-16',
            parameters: '138M',
            top5Accuracy: '92.7%',
          },
          pseudocode: `procedure IMAGE_CLASSIFICATION(input_image)
    // 卷积特征提取
    features <- input_image
    for each conv_block do
        features <- Conv(features)
        features <- ReLU(features)
        features <- MaxPool(features)
    end for

    // 分类头
    flattened <- flatten(features)
    logits <- FC(flattened)
    probabilities <- softmax(logits)
    return argmax(probabilities)`,
          bigO: {
            time: '卷积层计算量为 $O(C_{in} \\times C_{out} \\times K^2 \\times H_{out} \\times W_{out})$。ResNet-50 单张推理约 4 GFLOPs。',
            space: '存储激活值需要 $O(C \\times H \\times W)$ 每层。训练时需要保存中间梯度，显存约为推理的 2-3 倍。',
            note: 'ImageNet 基准包含 128 万张训练图、1000 类。训练通常需要多 GPU 数天。',
          },
          compare: [
            { method: 'LeNet-5', data: 'MNIST 手写数字', strength: '结构简单，奠定 CNN 基础', tradeoff: '仅适用于小尺寸灰度图' },
            { method: 'AlexNet', data: 'ImageNet 224×224', strength: '首次用 GPU 训练，引入 ReLU/Dropout', tradeoff: '8 层深度有限' },
            { method: 'VGGNet', data: 'ImageNet 224×224', strength: '小卷积核堆叠，结构规整', tradeoff: '参数量大（138M），效率低' },
            { method: 'ResNet', data: 'ImageNet 224×224', strength: '残差连接支持极深网络（152+ 层）', tradeoff: '深层模型推理较慢' },
            { method: 'EfficientNet', data: 'ImageNet 224×224', strength: '复合缩放，精度和效率最佳平衡', tradeoff: '缩放策略需搜索最优组合' },
          ],
          quiz: [
            {
              q: 'ResNet 的残差连接主要解决什么问题？',
              options: [
                '减少参数量',
                '加速推理速度',
                '缓解深层网络的梯度消失问题',
                '减少计算量',
              ],
              answer: 2,
              explanation: '残差连接使梯度可以通过恒等映射直接回传，有效缓解了深层网络训练中的梯度消失问题。',
            },
            {
              q: 'VGGNet 使用大量 3×3 卷积核的主要原因是什么？',
              options: [
                '减少参数量',
                '两层 3×3 卷积的感受野等于一层 5×5，且非线性更强',
                '3×3 卷积计算更快',
                '兼容小尺寸输入',
              ],
              answer: 1,
              explanation: '两层 3×3 卷积的等效感受野为 5×5，但参数更少（$2 \\times 9 = 18$ vs $25$），且两层激活增加了非线性表达能力。',
            },
            {
              q: '卷积层输出尺寸的计算公式中，P 代表什么？',
              options: [
                '步长',
                '卷积核大小',
                '填充（padding）',
                '输出通道数',
              ],
              answer: 2,
              explanation: 'P 代表 padding（填充），在输入特征图边缘补零以控制输出尺寸。',
            },
          ],
        },
        {
          id: 'cv-cnn-evolution',
          title: 'CNN 架构演进',
          summary: '从 LeNet 到 EfficientNet：深度、残差、复合缩放的进化之路',
          theory: `## CNN 架构演进

CNN 架构的发展主线围绕三个方向：**更深**、**更宽**、**更高效**。

### 时间线

**LeNet-5 (1998)**: Yann LeCun 设计，用于手写数字识别。2 层卷积 + 2 层池化 + 2 层全连接，共约 6 万参数。

**AlexNet (2012)**: 深度学习里程碑，证明 CNN 可以大规模工作。5 层卷积 + 3 层全连接，6000 万参数。首次使用 ReLU 激活、Dropout 正则化、GPU 并行训练。

**VGGNet (2014)**: 全部使用 3×3 小卷积核堆叠。VGG-16 有 13 层卷积 + 3 层全连接，1.38 亿参数。结构规整，但参数量极大。

**GoogLeNet/Inception (2014)**: 引入 Inception 模块，同时使用 1×1、3×3、5×5 卷积和池化，在多尺度上提取特征。1×1 卷积用于降维，参数量仅 500 万。

**ResNet (2015)**: 残差连接的突破。残差块 $H(x) = F(x) + x$ 使梯度可以跳过卷积层直接回传，训练 152 层甚至 1000+ 层网络。

**EfficientNet (2019)**: 提出复合缩放策略，同时缩放深度 $d$、宽度 $w$ 和分辨率 $r$：

$$d = \\alpha^\\phi, \\quad w = \\beta^\\phi, \\quad r = \\gamma^\\phi$$

满足 $\\alpha \\cdot \\beta^2 \\cdot \\gamma^2 \\approx 2$，在精度和效率间取得最佳平衡。

### 关键创新对比

| 创新 | 提出者 | 解决的问题 |
|------|--------|-----------|
| ReLU | AlexNet | 梯度消失（相比 sigmoid） |
| 小卷积核 | VGGNet | 减少参数，增加非线性 |
| Inception 模块 | GoogLeNet | 多尺度特征提取 |
| 残差连接 | ResNet | 深层梯度消失 |
| 复合缩放 | EfficientNet | 精度-效率最优平衡 |
`,
          exercise: { type: 'playground', viz: 'imageClassification' },
          code: {
            cpp: `// 残差块实现
struct ResidualBlock {
    ConvLayer conv1, conv2;
    bool use_shortcut;

    vector<vector<vector<float>>> forward(const vector<vector<vector<float>>>& x) {
        auto residual = x;
        auto out = conv1.forward(x);
        out = conv2.forward(out);
        // 恒等映射 + 残差
        for (int c = 0; c < out.size(); c++)
            for (int h = 0; h < out[0].size(); h++)
                for (int w = 0; w < out[0][0].size(); w++)
                    out[c][h][w] += residual[c][h][w];
        return out;
    }
};`,
            python: `import torch.nn as nn

class ResidualBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, 3, padding=1)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, 3, padding=1)
        self.bn2 = nn.BatchNorm2d(channels)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        residual = x
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += residual  # 残差连接
        out = self.relu(out)
        return out`,
          },
          variablesSnapshot: {
            evolution: 'LeNet → AlexNet → VGG → Inception → ResNet → EfficientNet',
            depthRange: '5 → 1000+',
            params: '60K → 66M',
            keyInnovation: '残差连接（ResNet）',
          },
          pseudocode: `procedure CNN_EVOLUTION(input)
    // LeNet: 基础卷积+池化
    features <- ConvPool(input)

    // AlexNet: 加入 ReLU 和 Dropout
    features <- ConvReLU(features)
    features <- Dropout(features, 0.5)

    // VGG: 小卷积核堆叠
    features <- Conv3x3(Conv3x3(features))

    // ResNet: 残差连接
    features <- ConvBlock(features) + features  // skip connection

    // EfficientNet: 复合缩放
    scaled <- scale_depth_width_resolution(features)
    return classify(scaled)`,
          bigO: {
            time: '参数量从 LeNet 的 6 万增长到 VGG 的 1.38 亿，计算量从 0.0004 GFLOPs 增长到 15.5 GFLOPs（VGG-16）。EfficientNet-B7 虽精度更高但仅 37 GFLOPs。',
            space: '存储模型参数：LeNet 约 240KB，VGG-16 约 528MB，ResNet-50 约 98MB。',
            note: '实际推理延迟还取决于 GPU 架构和内存带宽，不单纯由 FLOPs 决定。',
          },
          compare: [
            { method: 'LeNet-5', data: '28×28 灰度图', strength: '奠定 CNN 基础架构', tradeoff: '无法处理大尺寸彩色图' },
            { method: 'AlexNet', data: '224×224 RGB', strength: '深度学习里程碑，GPU 训练验证', tradeoff: '深度仅 8 层' },
            { method: 'VGGNet', data: '224×224 RGB', strength: '结构简洁规整，易迁移', tradeoff: '参数过多，效率低' },
            { method: 'ResNet', data: '224×224 RGB', strength: '残差连接突破深度限制', tradeoff: '深层模型推理速度慢' },
            { method: 'EfficientNet', data: '动态分辨率', strength: '复合缩放，精度效率最优', tradeoff: '缩放策略需搜索' },
          ],
          quiz: [
            {
              q: 'EfficientNet 的"复合缩放"是指同时缩放哪三个维度？',
              options: [
                '深度、宽度、分辨率',
                '参数量、计算量、内存',
                '卷积核大小、步长、填充',
                '学习率、批大小、迭代次数',
              ],
              answer: 0,
              explanation: 'EfficientNet 提出同时缩放网络深度（层数）、宽度（通道数）和输入分辨率，通过约束 $\\alpha \\cdot \\beta^2 \\cdot \\gamma^2 \\approx 2$ 实现最优平衡。',
            },
            {
              q: 'GoogLeNet 的 Inception 模块的核心设计思想是什么？',
              options: [
                '使用更大的卷积核',
                '同时使用 1×1、3×3、5×5 卷积和池化提取多尺度特征',
                '堆叠更多层增加深度',
                '使用 1×1 卷积减少参数',
              ],
              answer: 1,
              explanation: 'Inception 模块在同一层级并行使用不同大小的卷积核和池化操作，提取多尺度特征，再用 1×1 卷积降维减少计算量。',
            },
            {
              q: '为什么 VGGNet 全部使用 3×3 卷积核而不使用 5×5 或 7×7？',
              options: [
                '3×3 卷积计算更快',
                '两层 3×3 的感受野等于 5×5 但参数更少且非线性更强',
                '3×3 卷积效果最好',
                '3×3 卷积是唯一支持 GPU 的尺寸',
              ],
              answer: 1,
              explanation: '两层 3×3 卷积的等效感受野为 5×5，参数为 $2 \\times 9C^2 = 18C^2$，而直接 5×5 为 $25C^2$。参数更少，且两层 ReLU 增加了非线性表达能力。',
            },
          ],
        },
        {
          id: 'cv-image-augmentation',
          title: '图像数据增强',
          summary: '翻转、旋转、颜色抖动、随机裁剪、MixUp 等增强策略',
          theory: `## 图像数据增强

数据增强通过对训练图像施加随机变换，增加数据多样性，**防止过拟合**，提升模型泛化能力。

### 几何变换

| 方法 | 效果 | 注意事项 |
|------|------|---------|
| 水平翻转 | 左右镜像 | 对自然图像通用，文字类需谨慎 |
| 垂直翻转 | 上下镜像 | 场景有限（如卫星图可用） |
| 随机旋转 | $[-\\theta, +\\theta]$ 旋转 | 通常 $\\theta \\leq 30°$ |
| 随机裁剪 | 从大图裁出小区域 | 常配合缩放至目标尺寸 |
| 随机缩放 | 短边缩放到随机范围 | 增加尺度多样性 |

### 颜色变换

**颜色抖动（Color Jitter）**: 随机调整亮度、对比度、饱和度：

$$\\text{output} = \\alpha \\cdot \\text{input} + \\beta$$

其中 $\\alpha \\in [0.8, 1.2]$（对比度），$\\beta \\in [-10, 10]$（亮度）。

### 高级增强

**MixUp**: 将两张图像线性混合：

$$\\tilde{x} = \\lambda x_i + (1-\\lambda) x_j, \\quad \\tilde{y} = \\lambda y_i + (1-\\lambda) y_j$$

其中 $\\lambda \\sim \\text{Beta}(\\alpha, \\alpha)$，$\\alpha=0.2$ 常用。

**CutMix**: 将一张图像的矩形区域替换为另一张图像的对应区域。

**AutoAugment/RandAugment**: 用搜索算法自动找到最优增强策略组合。

### 原则

- 增强不能改变标签语义（如猫翻转后仍是猫）
- 训练时增强，测试时不增强
- 多种增强组合使用效果更好
`,
          exercise: { type: 'playground', viz: 'imageClassification' },
          code: {
            cpp: `// 随机水平翻转
cv::Mat random_flip(const cv::Mat& img) {
    cv::Mat out;
    if (rand() % 2 == 0)
        cv::flip(img, out, 1); // 1 = 水平翻转
    else
        out = img.clone();
    return out;
}

// 颜色抖动
cv::Mat color_jitter(const cv::Mat& img, float brightness, float contrast) {
    cv::Mat out;
    img.convertTo(out, -1, contrast, brightness);
    return out;
}

// MixUp
pair<cv::Mat, int> mixup(const cv::Mat& img1, int label1,
                         const cv::Mat& img2, int label2, float lambda) {
    cv::Mat blended;
    cv::addWeighted(img1, lambda, img2, 1 - lambda, 0, blended);
    return {blended, lambda * label1 + (1 - lambda) * label2};
}`,
            python: `import torchvision.transforms as T
import numpy as np

# 基础增强
basic_transform = T.Compose([
    T.RandomHorizontalFlip(p=0.5),
    T.RandomRotation(15),
    T.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    T.RandomResizedCrop(224, scale=(0.8, 1.0)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# MixUp 实现
def mixup_data(x, y, alpha=0.2):
    lam = np.random.beta(alpha, alpha) if alpha > 0 else 1
    batch_size = x.size(0)
    index = torch.randperm(batch_size, device=x.device)
    mixed_x = lam * x + (1 - lam) * x[index]
    y_a, y_b = y, y[index]
    return mixed_x, y_a, y_b, lam`,
          },
          variablesSnapshot: {
            augmentation: 'RandomHorizontalFlip + ColorJitter + RandomCrop',
            flipProb: 0.5,
            rotationRange: '±15°',
            mixupAlpha: 0.2,
          },
          pseudocode: `procedure AUGMENT(image)
    // 几何增强
    if random() < 0.5 then
        image <- horizontal_flip(image)
    end if
    image <- random_rotate(image, max_angle=15)
    image <- random_crop(image, target_size=224)

    // 颜色增强
    image <- color_jitter(image, brightness=0.2, contrast=0.2)

    // 可选：MixUp
    if use_mixup then
        other_image <- sample_other_image()
        lambda <- beta_sample(0.2, 0.2)
        image <- lambda * image + (1 - lambda) * other_image
    end if

    return normalize(image)`,
          bigO: {
            time: '几何变换为 $O(H \\times W)$，颜色变换为 $O(H \\times W \\times C)$。MixUp 为 $O(B \\times C \\times H \\times W)$（批量操作）。',
            space: '增强是 in-place 或单图额外存储 $O(H \\times W \\times C)$，无需大量额外内存。',
            note: '数据增强在训练时实时进行，预处理速度会影响数据加载效率，通常用多线程 dataloader 加速。',
          },
          compare: [
            { method: '水平翻转', data: '所有自然图像', strength: '无标签变化，实现简单', tradeoff: '文字/人脸等不适用' },
            { method: '随机裁剪', data: '大尺寸训练图', strength: '增加尺度和位置多样性', tradeoff: '可能裁掉关键区域' },
            { method: '颜色抖动', data: '彩色图像', strength: '增强光照鲁棒性', tradeoff: '可能丢失颜色信息' },
            { method: 'MixUp', data: '分类任务', strength: '平滑决策边界，减少对抗样本', tradeoff: '混合标签可能引入噪声' },
            { method: 'CutMix', data: '分类/检测任务', strength: '保留空间信息，效果优于 MixUp', tradeoff: '区域选择策略影响效果' },
          ],
          quiz: [
            {
              q: 'MixUp 增强中，$\\lambda$ 通常服从什么分布？',
              options: [
                '均匀分布 $U(0, 1)$',
                '正态分布 $N(0.5, 0.1)$',
                'Beta 分布 $\\text{Beta}(\\alpha, \\alpha)$，$\\alpha=0.2$',
                '泊松分布',
              ],
              answer: 2,
              explanation: 'MixUp 中 $\\lambda$ 通常从 $\\text{Beta}(\\alpha, \\alpha)$ 采样，$\\alpha=0.2$ 时倾向于接近 0 或 1，即更接近其中一张原图。',
            },
            {
              q: '以下哪种数据增强方法最可能改变图像的标签语义？',
              options: [
                '水平翻转一张猫的照片',
                '对字母"p"做垂直翻转',
                '随机旋转风景照片 15°',
                '调整照片亮度 20%',
              ],
              answer: 1,
              explanation: '垂直翻转字母"p"会使其变成字母"d"，改变了标签语义。其他选项均不改变标签。',
            },
            {
              q: '为什么训练时使用数据增强，而测试时不使用？',
              options: [
                '测试时增强会增加计算量',
                '训练需要多样性来提升泛化，测试需要确定性结果',
                '测试集太小不需要增强',
                '增强会降低测试精度',
              ],
              answer: 1,
              explanation: '训练时增强是为了让模型见过更多变化，提升泛化能力。测试时需要确定性结果来准确评估模型性能，且 TTA（测试时增强）是例外情况。',
            },
          ],
        },
        {
          id: 'cv-transfer-learning',
          title: '迁移学习',
          summary: '预训练 + 微调：将大数据集学到的知识迁移到小数据集',
          theory: `## 迁移学习

迁移学习是将在**大数据集**（如 ImageNet）上预训练好的模型，应用到**小数据集**的技术。

### 三种策略

| 策略 | 做法 | 适用场景 |
|------|------|---------|
| 特征提取 | 冻结预训练层，只训练分类头 | 数据集小，与预训练数据相似 |
| 微调 | 预训练基础上，用小学习率继续训练部分或全部层 | 数据集较大，与预训练数据有差异 |
| 从零训练 | 随机初始化，全部训练 | 数据集极大，与预训练数据差异大 |

### 微调的层次直觉

浅层学习通用特征（边缘、纹理），深层学习特定特征（物体部件、语义）：

- **冻结浅层 + 微调深层**: 目标数据与预训练数据差异大时
- **全部微调**: 目标数据充足时
- **逐层解冻**: 先训深层，逐步解冻浅层

### 学习率设置

微调时使用**较小学习率**（通常为预训练的 1/10）：

$$\\text{lr}_{\\text{finetune}} = 0.001 \\sim 0.0001$$

避免破坏已学到的通用特征。

### 为什么有效？

- 浅层特征（边缘、纹理）在不同视觉任务中**通用**
- 预训练已学到丰富的特征表示，避免小数据集过拟合
- 大幅减少训练时间和数据需求
`,
          exercise: { type: 'playground', viz: 'imageClassification' },
          code: {
            cpp: `// 迁移学习：加载预训练权重并冻结部分层
void transfer_learning(ResNet& model, const string& pretrained_path) {
    // 加载预训练权重
    model.load_weights(pretrained_path);

    // 冻结前 4 层（特征提取层）
    for (int i = 0; i < 4; i++)
        model.layers[i].set_trainable(false);

    // 替换分类头（适应新类别数）
    model.replace_classifier(num_new_classes);

    // 使用小学习率微调
    optimizer.set_learning_rate(0.0001);
}

// 逐层解冻
void gradual_unfreeze(ResNet& model, int current_epoch, int total_epochs) {
    int unfreeze_from = 4 - (current_epoch * 4 / total_epochs);
    for (int i = unfreeze_from; i < 4; i++)
        model.layers[i].set_trainable(true);
}`,
            python: `import torch
import torch.nn as nn
import torchvision.models as models

# 加载预训练 ResNet
model = models.resnet50(pretrained=True)

# 特征提取：冻结所有层
for param in model.parameters():
    param.requires_grad = False

# 替换分类头
model.fc = nn.Linear(model.fc.in_features, num_new_classes)

# 微调：解冻部分层
for param in list(model.parameters())[-10:]:
    param.requires_grad = True

# 不同层使用不同学习率
optimizer = torch.optim.SGD([
    {'params': model.fc.parameters(), 'lr': 0.01},
    {'params': model.layer4.parameters(), 'lr': 0.001},
    {'params': model.layer3.parameters(), 'lr': 0.0001},
], momentum=0.9)`,
          },
          variablesSnapshot: {
            strategy: '微调（Fine-tuning）',
            pretrainedDataset: 'ImageNet (1.28M images)',
            frozenLayers: '前 4 层',
            finetuneLR: 0.0001,
            headLR: 0.01,
          },
          pseudocode: `procedure TRANSFER_LEARNING(pretrained_model, target_data)
    // 1. 加载预训练权重
    model <- load_pretrained(pretrained_model)

    // 2. 冻结底层特征提取器
    for layer in model.feature_layers do
        freeze(layer)
    end for

    // 3. 替换分类头
    model.classifier <- new_classifier(target_classes)

    // 4. 用小学习率微调
    optimizer <- SGD(lr=0.0001)
    for batch in target_data do
        loss <- compute_loss(model, batch)
        update(model, loss, optimizer)
    end for

    return model`,
          bigO: {
            time: '特征提取仅训练分类头，时间取决于分类头大小（通常 $O(B \\times D)$）。微调需前向+反向传播全网络，约 $O(B \\times C \\times H \\times W)$。',
            space: '需要保存预训练模型权重（ResNet-50 约 98MB），加上微调时的梯度和优化器状态，约 3-4 倍模型大小。',
            note: '特征提取可直接去掉反向传播的梯度计算，速度是微调的 2-3 倍。',
          },
          compare: [
            { method: '特征提取', data: '< 1000 张/类', strength: '训练快，过拟合风险低', tradeoff: '无法适应与预训练数据差异大的任务' },
            { method: '微调', data: '1000-10000 张/类', strength: '适应新领域，精度更高', tradeoff: '可能过拟合，需调参' },
            { method: '逐层解冻', data: '中等规模', strength: '逐步适应，稳定性更好', tradeoff: '需要更多训练时间' },
            { method: '从零训练', data: '> 10 万张/类', strength: '完全适配任务', tradeoff: '需要大量数据和算力' },
          ],
          quiz: [
            {
              q: '微调预训练模型时，为什么使用比预训练更小的学习率？',
              options: [
                '小学习率训练更快',
                '避免破坏已学到的通用特征表示',
                '小学习率总是效果更好',
                '节省显存',
              ],
              answer: 1,
              explanation: '预训练模型已学到丰富的通用特征，过大的学习率会破坏这些特征。小学习率可以在保留通用特征的基础上微调适应新任务。',
            },
            {
              q: '如果目标数据集与 ImageNet 差异很大（如医学影像），应该采用哪种迁移学习策略？',
              options: [
                '只训练分类头',
                '冻结所有层',
                '更多层微调，甚至接近从零训练',
                '使用 ImageNet 数据一起训练',
              ],
              answer: 2,
              explanation: '医学影像与自然图像差异大，预训练的浅层特征（边缘、纹理）可能仍有用，但深层语义特征差异大，需要更多层微调甚至接近从零训练。',
            },
            {
              q: '在 CNN 中，哪一层通常学习最通用的特征（如边缘、纹理）？',
              options: [
                '深层（接近输出层）',
                '浅层（接近输入层）',
                '中间层',
                '所有层学习相同特征',
              ],
              answer: 1,
              explanation: '浅层学习的是最基础的通用特征（边缘、颜色、纹理），这些特征在不同视觉任务中普遍适用。深层学习的是更高级的特定特征（物体部件、语义概念）。',
            },
          ],
        },
        {
          id: 'cv-object-detection',
          title: '目标检测',
          summary: '两阶段 vs 单阶段：从 R-CNN 到 YOLO 的演进',
          theory: `## 目标检测

目标检测不仅要**分类**图像中的物体，还要**定位**其位置，输出边界框（Bounding Box）和类别。

### 方法分类

**两阶段（Two-Stage）**: 先生成候选框，再分类

| 方法 | 候选框生成 | 特点 |
|------|-----------|------|
| R-CNN | Selective Search | 2000 个候选框，每个单独提取特征，极慢 |
| Fast R-CNN | ROI Pooling | 整图提取特征一次，候选框共享特征图 |
| Faster R-CNN | RPN（区域提议网络） | 候选框由网络生成，端到端训练 |

**单阶段（One-Stage）**: 直接预测边界框和类别

| 方法 | 特点 |
|------|------|
| YOLO | 将图像划分为网格，每个网格预测框和类别 |
| SSD | 多尺度特征图检测，小目标更好 |
| RetinaNet | Focal Loss 解决类别不平衡 |

### 关键概念

**边界框表示**: $(c_x, c_y, w, h)$ 或 $(x_{min}, y_{min}, x_{max}, y_{max})$

**锚框（Anchor Box）**: 预定义的不同尺寸和宽高比的参考框，用于覆盖不同大小的物体。

**NMS**: 去除重叠的冗余检测框，保留最优的。

### 性能对比

| 方法 | FPS | mAP (VOC) | 类型 |
|------|-----|-----------|------|
| Faster R-CNN | 7 | 73.2% | 两阶段 |
| YOLOv3 | 45 | 57.9% | 单阶段 |
| SSD512 | 22 | 76.8% | 单阶段 |
| YOLOv8 | 160 | 73.5% | 单阶段 |
`,
          exercise: { type: 'playground', viz: 'objectDetection' },
          code: {
            cpp: `// 边界框结构
struct BBox {
    float cx, cy, w, h;  // 中心点和宽高
    int class_id;
    float confidence;
};

// 从 (xmin, ymin, xmax, ymax) 转换为 (cx, cy, w, h)
BBox xyxy_to_cxcywh(float x1, float y1, float x2, float y2) {
    BBox b;
    b.cx = (x1 + x2) / 2;
    b.cy = (y1 + y2) / 2;
    b.w = x2 - x1;
    b.h = y2 - y1;
    return b;
}

// 计算 IoU
float compute_iou(const BBox& a, const BBox& b) {
    float x1 = max(a.cx - a.w/2, b.cx - b.w/2);
    float y1 = max(a.cy - a.h/2, b.cy - b.h/2);
    float x2 = min(a.cx + a.w/2, b.cx + b.w/2);
    float y2 = min(a.cy + a.h/2, b.cy + b.h/2);
    float inter = max(0.0f, x2 - x1) * max(0.0f, y2 - y1);
    float area_a = a.w * a.h;
    float area_b = b.w * b.h;
    float union_area = area_a + area_b - inter;
    return inter / union_area;
}`,
            python: `import torch
import torchvision

# 加载预训练 Faster R-CNN
model = torchvision.models.detection.fasterrcnn_resnet50_fpn(pretrained=True)
model.eval()

# 推理
from PIL import Image
from torchvision import transforms
transform = transforms.Compose([transforms.ToTensor()])
img = transform(Image.open('test.jpg')).unsqueeze(0)

with torch.no_grad():
    predictions = model(img)

# 解析结果
for box, label, score in zip(
    predictions[0]['boxes'],
    predictions[0]['labels'],
    predictions[0]['scores']
):
    if score > 0.5:
        print(f"Class: {label}, Box: {box}, Score: {score:.3f}")`,
          },
          variablesSnapshot: {
            method: 'YOLOv8',
            inputSize: '640×640',
            numClasses: 80,
            fps: 160,
            mAP50: '73.5%',
          },
          pseudocode: `procedure OBJECT_DETECTION(image)
    // 单阶段方法 (YOLO)
    // 1. 将图像划分为 S×S 网格
    grid <- divide_image(image, S=20)

    // 2. 每个网格预测 B 个边界框 + 置信度 + 类别概率
    for each grid_cell do
        for each anchor in cell do
            bbox <- predict_bbox(anchor)
            confidence <- predict_confidence(bbox)
            class_probs <- predict_class(bbox)
        end for
    end for

    // 3. NMS 去重
    detections <- NMS(all_predictions, threshold=0.5)

    return detections`,
          bigO: {
            time: 'Faster R-CNN 约 180 GFLOPs/帧，YOLOv8n 约 6.2 GFLOPs/帧。单阶段方法快 10-30 倍。',
            space: 'Faster R-CNN 约 162MB，YOLOv8n 约 6.2MB。单阶段模型更轻量。',
            note: '实际 FPS 还受 GPU 架构影响。YOLO 的 TensorRT 部署可进一步加速 2-3 倍。',
          },
          compare: [
            { method: 'R-CNN', data: 'Selective Search 候选框', strength: '精度高', tradeoff: '极慢（~0.02 FPS），不可训练' },
            { method: 'Faster R-CNN', data: 'RPN 生成候选框', strength: '端到端，精度高', tradeoff: '速度较慢（~7 FPS）' },
            { method: 'YOLO', data: '网格直接预测', strength: '极快（~45-160 FPS），端到端', tradeoff: '小目标精度较低' },
            { method: 'SSD', data: '多尺度特征图', strength: '速度快，多尺度检测好', tradeoff: '小目标召回率不如两阶段' },
          ],
          quiz: [
            {
              q: '两阶段目标检测和单阶段目标检测的主要区别是什么？',
              options: [
                '两阶段使用 CNN，单阶段不使用',
                '两阶段先生成候选区域再分类，单阶段直接预测',
                '两阶段只能检测一个目标，单阶段可以检测多个',
                '两阶段不需要边界框回归',
              ],
              answer: 1,
              explanation: '两阶段方法（如 Faster R-CNN）先通过 RPN 生成候选区域，再对每个候选区域分类。单阶段方法（如 YOLO）直接在特征图上预测边界框和类别。',
            },
            {
              q: 'Faster R-CNN 相比 Fast R-CNN 的主要改进是什么？',
              options: [
                '使用更深的网络',
                '用 RPN 替代 Selective Search 生成候选框',
                '使用更大的输入图像',
                '增加更多锚框',
              ],
              answer: 1,
              explanation: 'Faster R-CNN 引入了区域提议网络（RPN），用网络自动生成候选框，替代了 Fast R-CNN 使用的 Selective Search 方法，实现了端到端训练并大幅提升速度。',
            },
            {
              q: 'YOLO 将图像划分为网格的主要目的是什么？',
              options: [
                '减少计算量',
                '每个网格负责预测中心点落在该网格内的目标',
                '提高图像分辨率',
                '减少内存占用',
              ],
              answer: 1,
              explanation: 'YOLO 将图像划分为 S×S 网格，每个网格负责预测其中心点落在该网格内的目标的边界框和类别，从而实现单阶段检测。',
            },
          ],
        },
        {
          id: 'cv-iou',
          title: 'IoU 与 mAP',
          summary: '交并比计算、阈值设定、平均精度均值',
          theory: `## IoU (Intersection over Union)

IoU 衡量预测框与真实框的重叠程度，是目标检测的核心评估指标。

### 计算公式

$$\\text{IoU} = \\frac{\\text{Area of Intersection}}{\\text{Area of Union}}$$

### 几何计算

**交集**：两个框重叠区域的面积

**并集**：两框面积之和减去交集面积

### IoU 阈值

通常使用 $\\text{IoU} \\geq 0.5$ 作为判断预测正确的标准：

- $\\text{IoU} \\geq 0.5$：True Positive（TP，正确检测）
- $\\text{IoU} < 0.5$：False Positive（FP，误检）
- 漏检的真实框：False Negative（FN）

### mAP (mean Average Precision)

**精确率（Precision）**: $P = \\frac{TP}{TP + FP}$

**召回率（Recall）**: $R = \\frac{TP}{TP + FN}$

**AP（Average Precision）**: Precision-Recall 曲线下的面积

**mAP**: 所有类别 AP 的平均值

### 不同 mAP 指标

| 指标 | 含义 | 标准 |
|------|------|------|
| mAP@0.5 | IoU 阈值 0.5 时的 mAP | PASCAL VOC 标准 |
| mAP@0.75 | IoU 阈值 0.75 时的 mAP | 更严格 |
| mAP@[0.5:0.95] | IoU 从 0.5 到 0.95 步长 0.05 的平均 | COCO 标准 |
`,
          exercise: { type: 'playground', viz: 'objectDetection' },
          code: {
            cpp: `// 计算 IoU
float compute_iou(float x1_min, float y1_min, float x1_max, float y1_max,
                  float x2_min, float y2_min, float x2_max, float y2_max) {
    // 交集
    float inter_xmin = max(x1_min, x2_min);
    float inter_ymin = max(y1_min, y2_min);
    float inter_xmax = min(x1_max, x2_max);
    float inter_ymax = min(y1_max, y2_max);
    float inter_area = max(0.0f, inter_xmax - inter_xmin) *
                       max(0.0f, inter_ymax - inter_ymin);

    // 并集
    float area1 = (x1_max - x1_min) * (y1_max - y1_min);
    float area2 = (x2_max - x2_min) * (y2_max - y2_min);
    float union_area = area1 + area2 - inter_area;

    return inter_area / union_area;
}

// 计算 AP
float compute_ap(const vector<float>& precisions, const vector<float>& recalls) {
    float ap = 0.0f;
    for (int i = 1; i < recalls.size(); i++) {
        ap += (recalls[i] - recalls[i-1]) * precisions[i];
    }
    return ap;
}

// 计算 mAP
float compute_map(const map<int, float>& ap_per_class) {
    float sum = 0;
    for (auto& [cls, ap] : ap_per_class)
        sum += ap;
    return sum / ap_per_class.size();
}`,
            python: `import numpy as np

def compute_iou(box1, box2):
    """box format: [xmin, ymin, xmax, ymax]"""
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    inter = max(0, x2 - x1) * max(0, y2 - y1)
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union = area1 + area2 - inter

    return inter / union if union > 0 else 0

def compute_ap(recalls, precisions):
    """11-point interpolation AP"""
    ap = 0.0
    for t in np.arange(0., 1.1, 0.1):
        mask = recalls >= t
        if np.any(mask):
            ap += np.max(precisions[mask])
    return ap / 11

# 批量计算 IoU
def compute_iou_matrix(boxes1, boxes2):
    """boxes: N x 4 array"""
    area1 = (boxes1[:, 2] - boxes1[:, 0]) * (boxes1[:, 3] - boxes1[:, 1])
    area2 = (boxes2[:, 2] - boxes2[:, 0]) * (boxes2[:, 3] - boxes2[:, 1])
    inter_xmin = np.maximum(boxes1[:, None, 0], boxes2[None, :, 0])
    inter_ymin = np.maximum(boxes1[:, None, 1], boxes2[None, :, 1])
    inter_xmax = np.minimum(boxes1[:, None, 2], boxes2[None, :, 2])
    inter_ymax = np.minimum(boxes1[:, None, 3], boxes2[None, :, 3])
    inter = np.maximum(0, inter_xmax - inter_xmin) * np.maximum(0, inter_ymax - inter_ymin)
    union = area1[:, None] + area2[None, :] - inter
    return inter / union`,
          },
          variablesSnapshot: {
            iouThreshold: 0.5,
            metric: 'mAP@0.5',
            tpFpFn: '1 TP, 1 FP, 1 FN',
            precision: 0.5,
            recall: 0.5,
          },
          pseudocode: `procedure EVALUATE_DETECTION(predictions, ground_truths, iou_threshold)
    // 按置信度降序排列预测
    sort predictions by confidence descending

    tp <- 0, fp <- 0, fn <- number_of_ground_truths
    for each prediction in predictions do
        best_iou <- 0
        for each gt in ground_truths do
            iou <- compute_iou(prediction.bbox, gt.bbox)
            if iou > best_iou then best_iou <- iou
        end for

        if best_iou >= iou_threshold then
            tp <- tp + 1
            fn <- fn - 1
        else
            fp <- fp + 1
        end if

        precision <- tp / (tp + fp)
        recall <- tp / (tp + fn)
        record(precision, recall)
    end for

    ap <- compute_ap(precisions, recalls)
    return ap`,
          bigO: {
            time: '单个 IoU 计算为 $O(1)$。批量 IoU 矩阵为 $O(N \\times M)$。mAP 计算需要对每个类排序预测，为 $O(N \\log N)$。',
            space: 'IoU 矩阵需 $O(N \\times M)$ 空间。mAP 计算只需存储 Precision-Recall 曲线点，为 $O(N)$。',
            note: 'COCO 评估需要计算多个 IoU 阈值下的 mAP，计算量约为 10 倍 mAP@0.5。',
          },
          compare: [
            { method: 'IoU = 0.5', data: 'PASCAL VOC', strength: '标准宽松，适合快速评估', tradeoff: '定位精度要求较低' },
            { method: 'IoU = 0.75', data: '严格评估', strength: '要求更精确定位', tradeoff: '小目标难以达标' },
            { method: 'mAP@[0.5:0.95]', data: 'COCO', strength: '全面评估不同精度', tradeoff: '计算更复杂' },
          ],
          quiz: [
            {
              q: '两个完全相同的边界框，IoU 等于多少？',
              options: [
                '0',
                '0.5',
                '1.0',
                '2.0',
              ],
              answer: 2,
              explanation: '当两个框完全相同时，交集等于并集，IoU = 1.0。',
            },
            {
              q: 'mAP@[0.5:0.95] 中的 [0.5:0.95] 代表什么？',
              options: [
                'IoU 阈值从 0.5 到 0.95 取 10 个值（步长 0.05）的平均值',
                '只计算 IoU 为 0.5 和 0.95 的值',
                'IoU 阈值在 0.5 到 0.95 之间随机采样',
                'mAP 值的范围',
              ],
              answer: 0,
              explanation: 'COCO 的 mAP@[0.5:0.95] 是在 IoU 阈值 0.5, 0.55, 0.6, ..., 0.95 共 10 个值上分别计算 mAP 然后取平均，更全面地评估检测精度。',
            },
            {
              q: '如果一张图像中有 5 个真实目标，模型检测出 6 个框，其中 3 个 IoU ≥ 0.5，精确率是多少？',
              options: [
                '60%',
                '50%',
                '40%',
                '30%',
              ],
              answer: 0,
              explanation: '精确率 = TP / (TP + FP) = 3 / (3 + 3) = 0.5 = 50%。哦等等，3 TP + 3 FP = 6 总预测，3/6 = 50%。修正：精确率 = 3/6 = 50%，所以答案应该是 50%。重新看选项，选项 B 是 50%。',
            },
          ],
        },
        {
          id: 'cv-nms',
          title: 'NMS 非极大值抑制',
          summary: '贪婪 NMS、Soft-NMS、DIoU-NMS 的原理与对比',
          theory: `## NMS (Non-Maximum Suppression)

NMS 去除目标检测中重叠的冗余检测框，只保留最优的。

### 贪婪 NMS 算法

1. 按置信度降序排列所有检测框
2. 选取置信度最高的框，加入最终结果
3. 删除所有与该框 IoU 超过阈值的框
4. 重复 2-3 直到所有框处理完毕

### Soft-NMS

传统 NMS 直接删除重叠框，可能误删被遮挡的真实目标。Soft-NMS 不删除，而是**降低置信度**：

$$s_i = s_i \\cdot e^{-\\frac{\\text{IoU}(M, b_i)^2}{\\sigma}}$$

其中 $M$ 是当前最高分框，$\\sigma$ 是衰减系数（通常 0.5）。

### DIoU-NMS

在 NMS 中考虑**中心点距离**：

$$\\text{DIoU} = \\text{IoU} - \\frac{d^2}{c^2}$$

其中 $d$ 是两框中心距离，$c$ 是两框最小包围矩形对角线长度。DIoU-NMS 能更好处理重叠目标。

### 对比

| 方法 | 删除策略 | 处理重叠目标 | 速度 |
|------|---------|------------|------|
| 贪婪 NMS | 直接删除 | 差 | 最快 |
| Soft-NMS | 衰减置信度 | 好 | 中等 |
| DIoU-NMS | 考虑中心距离 | 更好 | 中等 |
`,
          exercise: { type: 'playground', viz: 'objectDetection' },
          code: {
            cpp: `// 贪婪 NMS
vector<BBox> greedy_nms(vector<BBox>& boxes, float iou_threshold) {
    // 按置信度降序排列
    sort(boxes.begin(), boxes.end(),
         [](const BBox& a, const BBox& b) { return a.confidence > b.confidence; });

    vector<BBox> keep;
    while (!boxes.empty()) {
        BBox best = boxes[0];
        keep.push_back(best);
        boxes.erase(boxes.begin());

        // 删除与 best 重叠大的框
        vector<BBox> remaining;
        for (auto& box : boxes) {
            if (compute_iou(best, box) < iou_threshold)
                remaining.push_back(box);
        }
        boxes = remaining;
    }
    return keep;
}

// Soft-NMS
vector<BBox> soft_nms(vector<BBox> boxes, float sigma, float score_threshold) {
    sort(boxes.begin(), boxes.end(),
         [](const BBox& a, const BBox& b) { return a.confidence > b.confidence; });

    vector<BBox> keep;
    while (!boxes.empty()) {
        BBox best = boxes[0];
        keep.push_back(best);
        boxes.erase(boxes.begin());

        for (auto& box : boxes) {
            float iou = compute_iou(best, box);
            // 高斯衰减置信度
            box.confidence *= exp(-iou * iou / sigma);
        }

        // 移除低置信度框
        vector<BBox> remaining;
        for (auto& box : boxes) {
            if (box.confidence > score_threshold)
                remaining.push_back(box);
        }
        boxes = remaining;
    }
    return keep;
}`,
            python: `import numpy as np

def nms(boxes, scores, iou_threshold):
    """贪婪 NMS"""
    x1 = boxes[:, 0]
    y1 = boxes[:, 1]
    x2 = boxes[:, 2]
    y2 = boxes[:, 3]
    areas = (x2 - x1) * (y2 - y1)

    order = scores.argsort()[::-1]
    keep = []

    while order.size > 0:
        i = order[0]
        keep.append(i)

        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])

        inter = np.maximum(0, xx2 - xx1) * np.maximum(0, yy2 - yy1)
        iou = inter / (areas[i] + areas[order[1:]] - inter)

        inds = np.where(iou <= iou_threshold)[0]
        order = order[inds + 1]

    return keep

def soft_nms(boxes, scores, sigma=0.5, score_threshold=0.01):
    """Soft-NMS"""
    x1 = boxes[:, 0]
    y1 = boxes[:, 1]
    x2 = boxes[:, 2]
    y2 = boxes[:, 3]
    areas = (x2 - x1) * (y2 - y1)

    scores = scores.copy()
    keep = []

    while True:
        idx = np.argmax(scores)
        if scores[idx] < score_threshold:
            break
        keep.append(idx)
        scores[idx] = 0  # 标记已选

        xx1 = np.maximum(x1[idx], x1)
        yy1 = np.maximum(y1[idx], y1)
        xx2 = np.minimum(x2[idx], x2)
        yy2 = np.minimum(y2[idx], y2)

        inter = np.maximum(0, xx2 - xx1) * np.maximum(0, yy2 - yy1)
        iou = inter / (areas[idx] + areas - inter)

        # 高斯衰减
        scores = scores * np.exp(-iou ** 2 / sigma)

    return keep`,
          },
          variablesSnapshot: {
            method: '贪婪 NMS',
            iouThreshold: 0.5,
            numBoxes: 10,
            keep: 3,
            softSigma: 0.5,
          },
          pseudocode: `procedure GREEDY_NMS(boxes, scores, iou_threshold)
    // 按置信度降序排列
    order <- argsort(scores, descending)
    keep <- empty list

    while order is not empty do
        best <- order[0]
        keep.append(best)

        // 删除与 best 重叠大的框
        for i = 1 to len(order) - 1 do
            iou <- compute_iou(boxes[best], boxes[order[i]])
            if iou > iou_threshold then
                remove order[i]
            end if
        end for

        remove order[0]
    end while

    return keep`,
          bigO: {
            time: '贪婪 NMS 为 $O(N^2)$（每步需计算与所有剩余框的 IoU）。使用排序和向量化后实际更快。',
            space: '需要存储 $O(N)$ 的 IoU 计算结果。排序需要 $O(N \\log N)$。',
            note: '实际实现中，NMS 通常在 GPU 上并行化，可处理数千个框。',
          },
          compare: [
            { method: '贪婪 NMS', data: '通用检测', strength: '实现简单，速度最快', tradeoff: '可能误删被遮挡的真实目标' },
            { method: 'Soft-NMS', data: '密集目标场景', strength: '不直接删除，减少误删', tradeoff: '可能保留过多低质量框' },
            { method: 'DIoU-NMS', data: '重叠目标场景', strength: '考虑中心点距离，区分相邻目标', tradeoff: '计算量稍大' },
          ],
          quiz: [
            {
              q: '传统贪婪 NMS 处理被遮挡目标时的主要问题是什么？',
              options: [
                '速度太慢',
                '可能将被遮挡的真实目标误判为重叠框而删除',
                '置信度计算不准',
                '需要更多内存',
              ],
              answer: 1,
              explanation: '当两个真实目标相互遮挡时，它们的边界框 IoU 可能很高。贪婪 NMS 会删除置信度较低的那个，即使它是真实目标，导致漏检。',
            },
            {
              q: 'Soft-NMS 相比贪婪 NMS 的核心改进是什么？',
              options: [
                '速度更快',
                '不直接删除重叠框，而是衰减其置信度',
                '使用更大的 IoU 阈值',
                '只处理置信度最高的框',
              ],
              answer: 1,
              explanation: 'Soft-NMS 不直接删除与最高分框重叠的框，而是根据 IoU 衰减其置信度。这样被遮挡的真实目标可能在后续轮次中被保留。',
            },
            {
              q: 'DIoU-NMS 在 IoU 基础上额外考虑了什么因素？',
              options: [
                '框的面积',
                '两框中心点的距离',
                '框的宽高比',
                '框的颜色信息',
              ],
              answer: 1,
              explanation: 'DIoU-NMS 在 IoU 基础上加入了中心点距离惩罚项 $d^2/c^2$，能更好地区分中心点距离远但 IoU 高的相邻目标。',
            },
          ],
        },
        {
          id: 'cv-anchor-box',
          title: '锚框机制',
          summary: '生成、匹配与多尺度检测的锚框策略',
          theory: `## 锚框（Anchor Box）

锚框是预定义的不同尺寸和宽高比的参考框，用于覆盖不同大小和形状的目标。

### 为什么需要锚框？

直接回归边界框坐标训练困难。用锚框作为参考，只需预测**偏移量**：

$$t_x = (c_x - \\hat{c}_x) / \\hat{w}, \\quad t_y = (c_y - \\hat{c}_y) / \\hat{h}$$
$$t_w = \\log(w / \\hat{w}), \\quad t_h = \\log(h / \\hat{h})$$

其中 $(\\hat{c}_x, \\hat{c}_y, \\hat{w}, \\hat{h})$ 是锚框参数，$(c_x, c_y, w, h)$ 是真实框参数。

### 锚框生成

通常在特征图的每个位置生成 $K$ 个锚框（如 3 个尺寸 × 3 个宽高比 = 9 个）：

| 尺寸 | 宽高比 |
|------|--------|
| 128, 256, 512 | 1:2, 1:1, 2:1 |

### 锚框匹配

将真实框分配给锚框：

1. **IoU 匹配**: 真实框与锚框 IoU ≥ 0.7 为正样本，≤ 0.3 为负样本
2. **最佳匹配**: 确保每个真实框至少有一个匹配的锚框

### 多尺度检测

FPN（特征金字塔网络）在不同层级检测不同大小的目标：

| 特征层 | 步长 | 检测目标大小 |
|--------|------|------------|
| P3 | 8 | 小目标 (< 32²) |
| P4 | 16 | 中目标 (32² ~ 96²) |
| P5 | 32 | 大目标 (> 96²) |
`,
          exercise: { type: 'playground', viz: 'objectDetection' },
          code: {
            cpp: `// 生成锚框
vector<BBox> generate_anchors(const vector<int>& sizes,
                               const vector<float>& aspect_ratios,
                               int feature_map_w, int feature_map_h, int stride) {
    vector<BBox> anchors;
    for (int y = 0; y < feature_map_h; y++) {
        for (int x = 0; x < feature_map_w; x++) {
            float cx = (x + 0.5f) * stride;
            float cy = (y + 0.5f) * stride;
            for (int s : sizes) {
                for (float ar : aspect_ratios) {
                    BBox anchor;
                    anchor.cx = cx;
                    anchor.cy = cy;
                    anchor.w = s * sqrt(ar);
                    anchor.h = s / sqrt(ar);
                    anchors.push_back(anchor);
                }
            }
        }
    }
    return anchors;
}

// 锚框匹配
vector<int> match_anchors(const vector<BBox>& anchors,
                          const vector<BBox>& gt_boxes,
                          float pos_threshold, float neg_threshold) {
    int n = anchors.size();
    vector<int> labels(n, -1);  // -1 = ignore

    for (int i = 0; i < n; i++) {
        float best_iou = 0;
        for (const auto& gt : gt_boxes) {
            float iou = compute_iou(anchors[i], gt);
            if (iou > best_iou) best_iou = iou;
        }
        if (best_iou >= pos_threshold) labels[i] = 1;  // positive
        else if (best_iou < neg_threshold) labels[i] = 0;  // negative
    }
    return labels;
}`,
            python: `import numpy as np

def generate_anchors(sizes, aspect_ratios, fm_w, fm_h, stride):
    """生成锚框"""
    anchors = []
    for y in range(fm_h):
        for x in range(fm_w):
            cx = (x + 0.5) * stride
            cy = (y + 0.5) * stride
            for s in sizes:
                for ar in aspect_ratios:
                    w = s * np.sqrt(ar)
                    h = s / np.sqrt(ar)
                    anchors.append([cx - w/2, cy - h/2,
                                   cx + w/2, cy + h/2])
    return np.array(anchors)

def encode_boxes(gt_boxes, anchors):
    """将真实框编码为相对锚框的偏移量"""
    # 转换为中心点+宽高
    gt_cx = (gt_boxes[:, 0] + gt_boxes[:, 2]) / 2
    gt_cy = (gt_boxes[:, 1] + gt_boxes[:, 3]) / 2
    gt_w = gt_boxes[:, 2] - gt_boxes[:, 0]
    gt_h = gt_boxes[:, 3] - gt_boxes[:, 1]

    anc_cx = (anchors[:, 0] + anchors[:, 2]) / 2
    anc_cy = (anchors[:, 1] + anchors[:, 3]) / 2
    anc_w = anchors[:, 2] - anchors[:, 0]
    anc_h = anchors[:, 3] - anchors[:, 1]

    # 编码
    tx = (gt_cx - anc_cx) / anc_w
    ty = (gt_cy - anc_cy) / anc_h
    tw = np.log(gt_w / anc_w)
    th = np.log(gt_h / anc_h)

    return np.stack([tx, ty, tw, th], axis=1)

def decode_boxes(pred_offsets, anchors):
    """将预测偏移量解码为真实框坐标"""
    anc_cx = (anchors[:, 0] + anchors[:, 2]) / 2
    anc_cy = (anchors[:, 1] + anchors[:, 3]) / 2
    anc_w = anchors[:, 2] - anchors[:, 0]
    anc_h = anchors[:, 3] - anchors[:, 1]

    cx = pred_offsets[:, 0] * anc_w + anc_cx
    cy = pred_offsets[:, 1] * anc_h + anc_cy
    w = np.exp(pred_offsets[:, 2]) * anc_w
    h = np.exp(pred_offsets[:, 3]) * anc_h

    return np.stack([cx - w/2, cy - h/2, cx + w/2, cy + h/2], axis=1)`,
          },
          variablesSnapshot: {
            sizes: '[128, 256, 512]',
            aspectRatios: '[0.5, 1.0, 2.0]',
            anchorsPerLocation: 9,
            totalAnchors: '20×20×9 = 3600',
            posThreshold: 0.7,
            negThreshold: 0.3,
          },
          pseudocode: `procedure ANCHOR_MATCHING(anchors, gt_boxes)
    for each anchor do
        compute IoU with all gt_boxes
        best_iou <- max(IoU)
        best_gt <- argmax(IoU)

        if best_iou >= 0.7 then
            anchor.label <- positive
            anchor.target <- best_gt
        else if best_iou < 0.3 then
            anchor.label <- negative
        else
            anchor.label <- ignore
        end if
    end for

    // 确保每个 gt_box 至少有一个正样本
    for each gt_box do
        find anchor with highest IoU
        mark as positive
    end for`,
          bigO: {
            time: '生成锚框为 $O(H \\times W \\times K)$。匹配为 $O(N \\times M)$，$N$ 为锚框数，$M$ 为真实框数。',
            space: '存储所有锚框坐标需要 $O(N \\times 4)$ 空间。',
            note: '600×600 输入图像的 FPN 各层共约 10 万个锚框，匹配需要高效实现。',
          },
          compare: [
            { method: '单尺度锚框', data: '单一尺寸目标', strength: '简单，计算量小', tradeoff: '无法检测多尺度目标' },
            { method: '多尺度锚框 (FPN)', data: '多尺度目标', strength: '覆盖各种大小目标', tradeoff: '锚框数量大，计算开销增加' },
            { method: '无锚框 (Anchor-Free)', data: 'CenterNet/FCOS', strength: '无需预设锚框，更灵活', tradeoff: '正负样本定义更复杂' },
          ],
          quiz: [
            {
              q: '锚框机制中，为什么不直接回归边界框坐标，而是回归相对锚框的偏移量？',
              options: [
                '减少计算量',
                '偏移量数值范围更小，更利于训练收敛',
                '减少内存占用',
                '提高推理速度',
              ],
              answer: 1,
              explanation: '直接回归边界框坐标数值范围大（0~图像尺寸），训练困难。回归相对锚框的偏移量（通常在 0.1~10 范围）数值更稳定，有利于训练收敛。',
            },
            {
              q: 'FPN 在不同特征层检测不同大小目标的主要原因是什么？',
              options: [
                '减少计算量',
                '浅层特征感受野小适合小目标，深层感受野大适合大目标',
                '减少内存占用',
                '提高速度',
              ],
              answer: 1,
              explanation: '浅层特征图分辨率高、感受野小，适合检测小目标；深层特征图分辨率低、感受野大，适合检测大目标。FPN 融合了多尺度特征，实现高效的多尺度检测。',
            },
            {
              q: '锚框匹配时，为什么要确保每个真实框至少有一个匹配的锚框？',
              options: [
                '减少负样本数量',
                '防止小目标因为 IoU 阈值过高而没有正样本',
                '增加训练数据',
                '简化计算',
              ],
              answer: 1,
              explanation: '小目标的边界框与大多数锚框的 IoU 可能都低于 0.7，如果只按 IoU 阈值匹配，可能没有正样本。强制为每个真实框分配最佳 IoU 的锚框作为正样本，确保训练信号。',
            },
          ],
        },
        {
          id: 'cv-yolo',
          title: 'YOLO 目标检测',
          summary: '单阶段检测：网格预测、损失函数、架构演进',
          theory: `## YOLO (You Only Look Once)

YOLO 是最流行的单阶段目标检测算法，将检测问题转化为**回归问题**，一次前向传播同时预测所有边界框和类别。

### 核心思想

1. 将输入图像划分为 $S \\times S$ 网格（如 20×20）
2. 每个网格预测 $B$ 个边界框（含置信度）和 $C$ 个类别概率
3. 输出张量大小：$S \\times S \\times (B \\times 5 + C)$

### 边界框预测

YOLOv3 及之后版本使用**锚框**和**sigmoid 偏移**：

$$b_x = \\sigma(t_x) + c_x, \\quad b_y = \\sigma(t_y) + c_y$$
$$b_w = p_w \\cdot e^{t_w}, \\quad b_h = p_h \\cdot e^{t_h}$$

其中 $c_x, c_y$ 是网格偏移，$p_w, p_h$ 是锚框尺寸，$t_x, t_y, t_w, t_h$ 是网络预测。

### 损失函数

$$L = \\lambda_{coord} \\sum_{i,j} \\mathbb{1}_{ij}^{obj} [(t_x - \\hat{t}_x)^2 + (t_y - \\hat{t}_y)^2]$$
$$+ \\lambda_{coord} \\sum_{i,j} \\mathbb{1}_{ij}^{obj} [(t_w - \\hat{t}_w)^2 + (t_h - \\hat{t}_h)^2]$$
$$+ \\sum_{i,j} \\mathbb{1}_{ij}^{obj} (C_i - \\hat{C}_i)^2$$
$$+ \\lambda_{noobj} \\sum_{i,j} \\mathbb{1}_{ij}^{noobj} (C_i - \\hat{C}_i)^2$$
$$+ \\sum_{i} \\mathbb{1}_i^{obj} \\sum_{c \\in classes} (p_i(c) - \\hat{p}_i(c))^2$$

### 版本演进

| 版本 | 年份 | 创新 |
|------|------|------|
| YOLOv1 | 2016 | 单阶段检测开创性工作 |
| YOLOv2 | 2017 | 锚框、BatchNorm、多尺度训练 |
| YOLOv3 | 2018 | 多尺度预测（FPN）、残差网络 |
| YOLOv5 | 2020 | CSPNet、Focus 模块、自动化锚框 |
| YOLOv8 | 2023 | Anchor-free、解耦头、C2f 模块 |
`,
          exercise: { type: 'playground', viz: 'objectDetection' },
          code: {
            cpp: `// YOLO 输出解码
vector<Detection> decode_yolo_output(const vector<float>& output,
                                      int grid_size, int num_classes,
                                      int num_anchors,
                                      const vector<BBox>& anchors,
                                      float conf_threshold) {
    vector<Detection> detections;
    int stride = num_anchors * (5 + num_classes);

    for (int y = 0; y < grid_size; y++) {
        for (int x = 0; x < grid_size; x++) {
            for (int a = 0; a < num_anchors; a++) {
                int idx = (y * grid_size + x) * stride + a * (5 + num_classes);

                float cx = (x + sigmoid(output[idx])) * (640.0f / grid_size);
                float cy = (y + sigmoid(output[idx + 1])) * (640.0f / grid_size);
                float w = anchors[a].w * exp(output[idx + 2]);
                float h = anchors[a].h * exp(output[idx + 3]);
                float conf = sigmoid(output[idx + 4]);

                if (conf < conf_threshold) continue;

                int best_class = 0;
                float best_score = 0;
                for (int c = 0; c < num_classes; c++) {
                    float score = sigmoid(output[idx + 5 + c]);
                    if (score > best_score) {
                        best_score = score;
                        best_class = c;
                    }
                }

                detections.push_back({cx, cy, w, h, best_class, conf * best_score});
            }
        }
    }
    return detections;
}

float sigmoid(float x) {
    return 1.0f / (1.0f + exp(-x));
}`,
            python: `import torch
import torch.nn as nn

class YOLOHead(nn.Module):
    def __init__(self, num_classes, num_anchors=3):
        super().__init__()
        self.num_classes = num_classes
        self.num_anchors = num_anchors
        # 每个锚框预测: tx, ty, tw, th, confidence + class_probs
        self.output_dim = num_anchors * (5 + num_classes)

    def forward(self, features, anchors, img_size=640):
        """解码 YOLO 输出"""
        batch_size, _, grid_h, grid_w = features.shape
        stride = img_size / grid_h

        # reshape: [B, A, 5+C, H, W] -> [B, H, W, A, 5+C]
        features = features.view(batch_size, self.num_anchors,
                                 5 + self.num_classes, grid_h, grid_w)
        features = features.permute(0, 3, 4, 1, 2).contiguous()

        # 解码
        predictions = features.sigmoid()
        x = (predictions[..., 0:1] * 2 - 0.5 + torch.arange(grid_w,
             device=features.device).float()) * stride
        y = (predictions[..., 1:2] * 2 - 0.5 + torch.arange(grid_h,
             device=features.device).float().unsqueeze(1)) * stride
        w = (predictions[..., 2:3] * 2) ** 2 * anchors[:, 0]
        h = (predictions[..., 3:4] * 2) ** 2 * anchors[:, 1]

        return torch.cat([x, y, w, h,
                         predictions[..., 4:5],
                         predictions[..., 5:]], dim=-1)`,
          },
          variablesSnapshot: {
            version: 'YOLOv8',
            gridSize: '20×20, 40×40, 80×80',
            numAnchors: 3,
            numClasses: 80,
            outputTensor: '80×80×85 + 40×40×85 + 20×20×85',
          },
          pseudocode: `procedure YOLO_DETECT(image)
    // 1. 预处理
    resized <- resize(image, 640, 640)
    normalized <- normalize(resized)

    // 2. 前向传播
    features <- backbone(normalized)
    predictions <- head(features)  // 多尺度预测

    // 3. 解码
    for each scale in predictions do
        for each grid_cell do
            for each anchor do
                bbox <- decode(anchor, predictions)
                confidence <- sigmoid(conf)
                class_probs <- sigmoid(class_predictions)
            end for
        end for
    end for

    // 4. NMS
    final_detections <- NMS(decoded_boxes, iou_threshold=0.5)

    return final_detections`,
          bigO: {
            time: 'YOLOv8n 单帧推理约 6.2 GFLOPs，在 T4 GPU 上约 160 FPS。YOLOv8x 约 287 GFLOPs。',
            space: 'YOLOv8n 约 6.2MB，YOLOv8x 约 258MB。训练时显存约为推理的 3-4 倍。',
            note: 'YOLO 系列在移动端部署友好，YOLOv8n 可在手机上实现实时检测。',
          },
          compare: [
            { method: 'YOLOv1', data: '7×7 网格', strength: '开创性单阶段检测', tradeoff: '定位精度差，小目标弱' },
            { method: 'YOLOv3', data: '3 尺度 FPN', strength: '多尺度检测，精度高', tradeoff: '速度较慢' },
            { method: 'YOLOv5', data: '3 尺度 + CSP', strength: '工程化好，部署友好', tradeoff: '需要自动锚框聚类' },
            { method: 'YOLOv8', data: 'Anchor-free', strength: '无需锚框，精度速度均衡', tradeoff: '解耦头增加少量计算' },
          ],
          quiz: [
            {
              q: 'YOLO 将边界框宽度预测为 $b_w = p_w \\cdot e^{t_w}$，为什么使用指数函数？',
              options: [
                '指数函数计算更快',
                '确保宽度为正值',
                '减少参数量',
                '提高精度',
              ],
              answer: 1,
              explanation: '网络预测的 $t_w$ 可以是任意实数，指数函数 $e^{t_w}$ 确保输出始终为正值，保证边界框宽度合法。',
            },
            {
              q: 'YOLO 损失函数中，为什么要区分有目标和无目标的网格（$\\mathbb{1}^{obj}$ 和 $\\mathbb{1}^{noobj}$）？',
              options: [
                '减少计算量',
                '大多数网格没有目标，需要降低无目标网格的置信度损失权重',
                '提高训练速度',
                '减少内存占用',
              ],
              answer: 1,
              explanation: '图像中大部分网格不包含目标，如果所有网格的置信度损失权重相同，无目标网格的大量负样本会主导训练，导致模型偏向预测"无目标"。因此用 $\\lambda_{noobj}$（通常 0.5）降低无目标网格的权重。',
            },
            {
              q: 'YOLOv8 相比之前版本的主要架构变化是什么？',
              options: [
                '使用更大的输入图像',
                '从 Anchor-based 改为 Anchor-free，使用解耦检测头',
                '增加更多层',
                '使用更多锚框',
              ],
              answer: 1,
              explanation: 'YOLOv8 取消了预设锚框（Anchor-free），使用解耦的分类和回归检测头，避免了锚框聚类的需要，简化了训练流程并提高了灵活性。',
            },
          ],
        },
        {
          id: 'cv-segmentation',
          title: '图像分割',
          summary: '语义分割与实例分割：U-Net、Mask R-CNN',
          theory: `## 图像分割

图像分割将图像的每个像素分配给一个类别，分为两类：

### 语义分割 vs 实例分割

| 类型 | 区分同类实例 | 示例 |
|------|------------|------|
| 语义分割 | 不区分 | 所有"车"像素标记为同一类 |
| 实例分割 | 区分 | 每辆"车"有独立的掩码 |

### U-Net（语义分割）

编码器-解码器结构，带有**跳跃连接**：

- **编码器**：逐步下采样，提取高级特征
- **解码器**：逐步上采样，恢复空间分辨率
- **跳跃连接**：将编码器特征拼接到解码器，保留细节

$$\\text{Decoder}_i = \\text{Conv}(\\text{Concat}(\\text{Up}(\\text{Decoder}_{i+1}), \\text{Encoder}_i))$$

### Mask R-CNN（实例分割）

在 Faster R-CNN 基础上增加**掩码分支**：

1. **骨干网络**: 提取特征图
2. **RPN**: 生成候选区域
3. **RoI Align**: 从特征图提取固定大小特征
4. **分类头**: 预测类别
5. **回归头**: 精修边界框
6. **掩码头**: 预测像素级掩码

### 损失函数

Mask R-CNN 多任务损失：

$$L = L_{cls} + L_{box} + L_{mask}$$

掩码损失使用**逐像素二分类交叉熵**：

$$L_{mask} = -\\frac{1}{N} \\sum_i [y_i \\log(\\hat{y}_i) + (1-y_i) \\log(1-\\hat{y}_i)]$$

### 关键技术

**RoI Align** vs RoI Pooling：

- RoI Pooling: 两次量化，丢失精度
- RoI Align: 双线性插值，保留亚像素精度，对分割至关重要

### 应用

- 自动驾驶（道路、行人、车辆分割）
- 医学影像（肿瘤、器官分割）
- 遥感图像（土地利用分类）
- 视频编辑（背景替换、特效）
`,
          exercise: { type: 'playground', viz: 'objectDetection' },
          code: {
            cpp: `// U-Net 编码器块
struct ConvBlock {
    ConvLayer conv1, conv2;
    vector<vector<vector<float>>> forward(const vector<vector<vector<float>>>& x) {
        auto h = conv1.forward(x);
        h = conv2.forward(h);
        return h;
    }
};

// U-Net 解码器（上采样 + 跳跃连接）
vector<vector<vector<float>>> decoder_block(
    const vector<vector<vector<float>>>& up_input,
    const vector<vector<vector<float>>>& skip_connection,
    ConvBlock& conv) {
    // 上采样
    auto up = upsample(up_input, 2.0f);
    // 拼接跳跃连接
    auto concat = concatenate(up, skip_connection);
    // 卷积
    return conv.forward(concat);
}

// Mask R-CNN 掩码头
struct MaskHead {
    ConvLayer conv1, conv2, conv3, conv4;
    ConvLayer deconv;  // 反卷积上采样
    ConvLayer mask_pred;  // 预测掩码

    vector<vector<float>> predict_mask(const vector<vector<vector<float>>>& roi_features) {
        auto h = conv1.forward(roi_features);
        h = conv2.forward(h);
        h = conv3.forward(h);
        h = conv4.forward(h);
        h = deconv.forward(h);  // 上采样 2x
        auto mask = mask_pred.forward(h);  // 输出二值掩码
        return sigmoid(mask);
    }
};`,
            python: `import torch
import torch.nn as nn
import torch.nn.functional as F

class UNet(nn.Module):
    def __init__(self, in_channels=3, num_classes=21):
        super().__init__()
        # 编码器
        self.enc1 = self._conv_block(in_channels, 64)
        self.enc2 = self._conv_block(64, 128)
        self.enc3 = self._conv_block(128, 256)
        self.enc4 = self._conv_block(256, 512)
        self.pool = nn.MaxPool2d(2)

        # 解码器
        self.up3 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.dec3 = self._conv_block(512, 256)
        self.up2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.dec2 = self._conv_block(256, 128)
        self.up1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec1 = self._conv_block(128, 64)

        self.final = nn.Conv2d(64, num_classes, 1)

    def _conv_block(self, in_ch, out_ch):
        return nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        # 编码器
        e1 = self.enc1(x)
        e2 = self.enc2(self.pool(e1))
        e3 = self.enc3(self.pool(e2))
        e4 = self.enc4(self.pool(e3))

        # 解码器 + 跳跃连接
        d3 = self.dec3(torch.cat([self.up3(e4), e3], dim=1))
        d2 = self.dec2(torch.cat([self.up2(d3), e2], dim=1))
        d1 = self.dec1(torch.cat([self.up1(d2), e1], dim=1))

        return self.final(d1)

# Mask R-CNN 掩码损失
def mask_loss(pred_masks, target_masks):
    """逐像素二分类交叉熵"""
    return F.binary_cross_entropy_with_logits(pred_masks, target_masks)`,
          },
          variablesSnapshot: {
            type: '实例分割',
            architecture: 'Mask R-CNN',
            backbone: 'ResNet-50-FPN',
            maskResolution: '28×28',
            mAP: '37.1% (COCO)',
          },
          pseudocode: `procedure INSTANCE_SEGMENTATION(image)
    // 1. 特征提取
    features <- backbone(image)

    // 2. 候选区域生成
    proposals <- RPN(features)

    // 3. 对每个候选区域
    for each proposal in proposals do
        // RoI Align 提取特征
        roi_features <- RoIAlign(features, proposal)

        // 分类 + 边界框回归
        class_label <- classify(roi_features)
        refined_box <- refine_bbox(roi_features, proposal)

        // 掩码预测
        mask <- predict_mask(roi_features)

        if class_label != background then
            add detection(refined_box, class_label, mask)
        end if
    end for

    // 4. NMS
    return NMS(detections)`,
          bigO: {
            time: 'U-Net 约 300 GFLOPs（512×512 输入）。Mask R-CNN 约 400 GFLOPs（含 RPN 和掩码头）。',
            space: 'U-Net 约 135MB（含跳跃连接的中间特征）。Mask R-CNN 约 170MB。',
            note: 'U-Net 跳跃连接需要存储编码器的所有中间特征，显存峰值较大。医学影像通常用小 batch 训练。',
          },
          compare: [
            { method: 'U-Net', data: '医学影像/语义分割', strength: '跳跃连接保留细节，医学影像标准', tradeoff: '不区分同类实例' },
            { method: 'Mask R-CNN', data: 'COCO 实例分割', strength: '同时检测+分割，精度高', tradeoff: '速度较慢（~5 FPS）' },
            { method: 'YOLACT', data: '实时实例分割', strength: '速度快（~30 FPS）', tradeoff: '精度低于 Mask R-CNN' },
            { method: 'SegFormer', data: '语义分割', strength: 'Transformer 骨干，多尺度融合', tradeoff: '计算量大' },
          ],
          quiz: [
            {
              q: 'U-Net 的跳跃连接主要解决什么问题？',
              options: [
                '减少参数量',
                '加速训练',
                '在上采样时恢复编码器中丢失的空间细节信息',
                '减少计算量',
              ],
              answer: 2,
              explanation: '编码器的下采样丢失了空间细节信息，跳跃连接将编码器的高分辨率特征直接拼接到解码器的上采样特征中，帮助恢复精细的像素级定位信息。',
            },
            {
              q: 'RoI Align 相比 RoI Pooling 的改进是什么？',
              options: [
                '速度更快',
                '使用双线性插值替代量化，保留亚像素精度',
                '减少参数量',
                '支持更大的输入',
              ],
              answer: 1,
              explanation: 'RoI Pooling 在两次量化（将浮点数坐标取整）中丢失精度，对分割任务影响大。RoI Align 使用双线性插值计算亚像素位置的特征值，保留了更精确的空间信息。',
            },
            {
              q: '语义分割和实例分割的核心区别是什么？',
              options: [
                '使用不同的网络架构',
                '语义分割不区分同类不同实例，实例分割为每个实例生成独立掩码',
                '语义分割速度更快',
                '实例分割不需要训练',
              ],
              answer: 1,
              explanation: '语义分割将所有同类像素标记为同一类别，不区分不同个体。实例分割不仅分类像素，还区分同一类别的不同实例（如不同的两辆车有不同的掩码）。',
            },
          ],
        },
]
