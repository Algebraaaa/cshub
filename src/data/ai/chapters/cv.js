// AI 专业课 · 计算机视觉（cv）章节课节数据
// 从 curriculum.js 原样拆出（2026-06）。补全/注入逻辑（AI_COMPLETION_DEFAULTS、
// LATE_COURSE_CODE、completeAILessonMetadata）仍在 ../curriculum.js，
// 模块加载时会原位向这些 lesson 对象补字段。
export const CV_LESSONS = [
        {
          id: 'cv-image-classification',
          title: '图像分类',
          summary: '经典网络架构：LeNet、ResNet、VGG',
          theory: `## 图像分类

使用 CNN 对图像进行类别预测。

### 经典架构

| 网络 | 年份 | 创新 |
|------|------|------|
| LeNet | 1998 | 卷积+池化 |
| AlexNet | 2012 | ReLU、Dropout |
| VGG | 2014 | 小卷积核堆叠 |
| ResNet | 2015 | 残差连接 |
`,
          exercise: { type: 'playground', viz: 'imageClassification' },
        },
        {
          id: 'cv-object-detection',
          title: '目标检测',
          summary: 'YOLO、R-CNN、锚框机制',
          theory: `## 目标检测

在图像中定位并分类多个目标。

### 方法分类

- **两阶段**: R-CNN → Fast R-CNN → Faster R-CNN
- **单阶段**: YOLO、SSD
`,
          exercise: { type: 'playground', viz: 'objectDetection' },
        },
]
