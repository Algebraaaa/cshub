// AI 专业课 · 大语言模型（llm）章节课节数据
// 从 curriculum.js 原样拆出（2026-06）。补全/注入逻辑（AI_COMPLETION_DEFAULTS、
// LATE_COURSE_CODE、completeAILessonMetadata）仍在 ../curriculum.js，
// 模块加载时会原位向这些 lesson 对象补字段。
export const LLM_LESSONS = [
        {
          id: 'llm-tokenization',
          title: 'Tokenization 分词',
          summary: 'BPE、WordPiece、SentencePiece、词表构建',
          theory: `## Tokenization（分词）

将文本切分为模型可以处理的 token 序列，是 LLM 的第一步。

### 主流分词方法

| 方法 | 代表模型 | 核心思想 |
|------|---------|---------|
| BPE (Byte Pair Encoding) | GPT 系列 | 合并高频字节对 |
| WordPiece | BERT | 合并最大互信息对 |
| SentencePiece | T5, LLaMA | 语言无关，直接处理原始文本 |
| Unigram | T5 | 从大词表逐步删除低概率 token |

### BPE 算法

1. 初始化：将文本拆分为单个字符
2. 统计所有相邻字符对的频率
3. 合并频率最高的字符对
4. 重复步骤 2-3 直到达到目标词表大小

### 示例

$$\\text{"low", "lower", "newest"} \\rightarrow \\text{"l", "o", "w", "e", "r", "n", "s", "t"}$$

合并 "e"+"s" → "es"，再合并 "es"+"t" → "est"，依此类推。

### 词表大小

- GPT-2: 50,257 tokens
- LLaMA: 32,000 tokens
- GPT-4: ~100,000 tokens (估计)
`,
          exercise: { type: 'playground', viz: 'pretraining' },
          code: {
            python: `from collections import Counter

def train_bpe(text, vocab_size):
    """训练 BPE 分词器"""
    # 初始化：每个字符作为一个 token
    vocab = Counter()
    for word in text.split():
        word = ' '.join(list(word)) + ' </w>'
        vocab[word] += 1

    merges = []
    num_merges = vocab_size - len(set(' '.join(vocab.keys()).split()))

    for _ in range(num_merges):
        # 统计相邻对频率
        pairs = Counter()
        for word, freq in vocab.items():
            symbols = word.split()
            for i in range(len(symbols) - 1):
                pairs[(symbols[i], symbols[i+1])] += freq

        if not pairs:
            break

        # 找最高频对
        best_pair = max(pairs, key=pairs.get)
        merges.append(best_pair)

        # 合并
        new_vocab = {}
        bigram = ' '.join(best_pair)
        replacement = ''.join(best_pair)
        for word, freq in vocab.items():
            new_word = word.replace(bigram, replacement)
            new_vocab[new_word] = freq
        vocab = new_vocab

    return merges

def tokenize_bpe(text, merges):
    """使用训练好的 BPE 分词"""
    words = text.split()
    tokens = []
    for word in words:
        word = ' '.join(list(word)) + ' </w>'
        for pair in merges:
            bigram = ' '.join(pair)
            replacement = ''.join(pair)
            word = word.replace(bigram, replacement)
        tokens.extend(word.split())
    return tokens`,
            cpp: `// BPE 分词（简化版）
vector<string> train_bpe(const vector<string>& corpus, int target_vocab_size) {
    // 初始化为字符级
    map<string, int> vocab;
    for (const auto& word : corpus) {
        string chars;
        for (char c : word) chars += string(1, c) + " ";
        chars += "</w>";
        vocab[chars]++;
    }

    vector<pair<string, string>> merges;
    while (vocab.size() < target_vocab_size) {
        // 找最高频相邻对
        map<pair<string, string>, int> pair_freq;
        for (const auto& [word, freq] : vocab) {
            auto tokens = split(word, ' ');
            for (size_t i = 0; i < tokens.size() - 1; i++) {
                pair_freq[{tokens[i], tokens[i+1]}] += freq;
            }
        }
        if (pair_freq.empty()) break;

        auto best = max_element(pair_freq.begin(), pair_freq.end(),
            [](const auto& a, const auto& b) { return a.second < b.second; });
        merges.push_back(best->first);

        // 合并
        map<string, int> new_vocab;
        string bigram = best->first.first + " " + best->first.second;
        string merged = best->first.first + best->first.second;
        for (const auto& [word, freq] : vocab) {
            string new_word = replace_all(word, bigram, merged);
            new_vocab[new_word] += freq;
        }
        vocab = new_vocab;
    }
    return merges;
}`,
          },
          variablesSnapshot: {
            method: 'BPE',
            vocabSize: 50257,
            merges: '50,000',
            avgTokenLength: '~4 chars',
          },
          pseudocode: `procedure TRAIN_BPE(text, vocab_size)
    vocab <- character-level tokens
    while |vocab| < vocab_size do
        pairs <- count all adjacent token pairs
        best <- highest frequency pair
        merge best pair in all words
        record merge
    end while
    return merges

procedure TOKENIZE_BPE(text, merges)
    tokens <- split text into characters
    for each merge in merges do
        replace all occurrences of merge pair with merged token
    end for
    return tokens`,
          bigO: {
            time: '训练 BPE 需要 O(V × N)，V 是合并次数，N 是语料库大小。分词需要 O(M × V)，M 是文本长度。',
            space: '词表需要 O(V) 存储空间。',
            note: '实际 BPE 实现使用优先队列和索引来加速训练过程。',
          },
          compare: [
            { method: 'BPE', data: '字节对合并', strength: '平衡词表大小和表达能力', tradeoff: '需要训练合并规则' },
            { method: 'WordPiece', data: '最大互信息', strength: '更好的子词选择', tradeoff: '实现更复杂' },
            { method: 'SentencePiece', data: '语言无关', strength: '无需预分词', tradeoff: '可能产生非直觉 token' },
          ],
          quiz: [
            {
              q: 'BPE（Byte Pair Encoding）分词器的核心思想是什么？',
              options: [
                '将文本按空格分割',
                '通过迭代合并频率最高的相邻字符对，自动学习子词单元',
                '使用固定词表进行分词',
                '基于词典的最大匹配',
              ],
              answer: 1,
              explanation: 'BPE 从字符级开始，逐步合并频率最高的相邻字符对，直到达到目标词表大小。这样可以自动发现常见的子词单元。',
            },
          ],
        },
        {
          id: 'llm-pretraining',
          title: '预训练与微调',
          summary: '语言模型预训练、SFT、RLHF',
          theory: `## 大模型训练流程

### 三阶段训练

$$\\text{预训练} \\rightarrow \\text{监督微调 (SFT)} \\rightarrow \\text{RLHF}$$

### 1. 预训练 (Pre-training)

在海量文本上学习语言知识，目标是下一个 token 预测：

$$L = -\\sum_{t=1}^{T} \\log P(x_t | x_{<t})$$

$$P(x_t | x_{<t}) = \\text{softmax}(W h_t + b)$$

### 2. 监督微调 (SFT)

用指令-回答数据微调，教会模型遵循指令：

$$L_{SFT} = -\\sum_{(x,y) \\in D_{SFT}} \\log P(y | x)$$

### 3. RLHF (Reinforcement Learning from Human Feedback)

- **奖励模型训练**: 标注员对模型输出排序，训练奖励模型 $r_\\phi(x, y)$
- **PPO 优化**: 用奖励模型作为信号优化策略

$$L_{RLHF} = L_{CLIP} - \\beta \\cdot \\mathbb{E}[\\log \\pi_\\theta(y|x) - \\log \\pi_{ref}(y|x)]$$

其中 $\\beta$ 是 KL 惩罚系数，防止策略偏离参考策略太远。

### 训练成本

| 模型 | 参数量 | 训练数据 | 估算成本 |
|------|--------|---------|---------|
| GPT-3 | 175B | 500B tokens | ~$4.6M |
| LLaMA-2 70B | 70B | 2T tokens | ~$2-5M |
| GPT-4 | ~1T (估计) | ~13T tokens | ~$100M+ |
`,
          exercise: { type: 'playground', viz: 'pretraining' },
          code: {
            python: `import torch
import torch.nn as nn
import torch.nn.functional as F

class CausalLMLoss(nn.Module):
    """因果语言模型损失（下一个 token 预测）"""
    def __init__(self, vocab_size):
        super().__init__()
        self.vocab_size = vocab_size

    def forward(self, logits, targets):
        # logits: [batch, seq_len, vocab_size]
        # targets: [batch, seq_len]
        shift_logits = logits[:, :-1, :].contiguous()
        shift_labels = targets[:, 1:].contiguous()
        loss = F.cross_entropy(
            shift_logits.view(-1, self.vocab_size),
            shift_labels.view(-1),
            ignore_index=-100
        )
        return loss

class SFTCollator:
    """SFT 数据整理器"""
    def __init__(self, tokenizer, max_length=512):
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __call__(self, examples):
        inputs = []
        labels = []
        for ex in examples:
            # 构建输入：<instruction> + <response>
            prompt = f"### Instruction:\\n{ex['instruction']}\\n\\n### Response:\\n"
            full_text = prompt + ex['response']
            tokenized = self.tokenizer(
                full_text, truncation=True,
                max_length=self.max_length, padding='max_length'
            )
            input_ids = tokenized['input_ids']
            # 只对 response 部分计算损失
            prompt_ids = self.tokenizer(prompt, truncation=True, max_length=self.max_length)['input_ids']
            label = [-100] * len(prompt_ids) + input_ids[len(prompt_ids):]
            inputs.append(input_ids)
            labels.append(label)
        return {
            'input_ids': torch.LongTensor(inputs),
            'labels': torch.LongTensor(labels),
        }`,
            cpp: `// 语言模型损失（伪代码）
double causal_lm_loss(const Tensor& logits, const Tensor& targets) {
    // shift: 预测 t+1 位置的 token
    auto shift_logits = logits.slice(1, 0, -1);
    auto shift_labels = targets.slice(1, 1);
    return cross_entropy(shift_logits, shift_labels);
}

// RLHF PPO 更新（伪代码）
void rlhf_update(Policy& policy, const RewardModel& reward_model,
                 const vector<Transition>& batch, double beta) {
    for (const auto& t : batch) {
        double reward = reward_model.score(t.state, t.action);
        // KL 惩罚
        double kl = log(policy(t.state, t.action) / policy.ref(t.state, t.action));
        double adjusted_reward = reward - beta * kl;
        // PPO 更新
        ppo_step(policy, t, adjusted_reward);
    }
}`,
          },
          variablesSnapshot: {
            phase: 'pre-training',
            objective: 'next token prediction',
            tokens: '~1T',
            batchSize: 2048,
            learningRate: 3e-4,
          },
          pseudocode: `procedure PRETRAIN(model, data, epochs)
    for each batch in data do
        inputs, targets <- batch
        logits <- model(inputs)
        loss <- cross_entropy(logits[:, :-1], targets[:, 1:])
        update model by gradient descent
    end for
end procedure

procedure SFT(model, sft_data)
    for each (instruction, response) in sft_data do
        prompt <- format(instruction)
        logits <- model(prompt)
        loss <- cross_entropy(logits, response) with ignore_index
        update model
    end for
end procedure`,
          bigO: {
            time: '训练时间 O(T × d²)，T 是 token 数，d 是模型维度。GPT-3 训练约 3.14 × 10²³ FLOPs。',
            space: '模型参数 O(d)。训练时需要存储优化器状态（Adam 需要 2 倍参数量）和梯度。',
            note: '混合精度训练（FP16/BF16）可减少约 50% 的显存占用。',
          },
          compare: [
            { method: '预训练', data: '海量无标注文本', strength: '学习通用语言能力', tradeoff: '不遵循指令' },
            { method: 'SFT', data: '指令-回答对', strength: '学会遵循指令', tradeoff: '需要高质量标注数据' },
            { method: 'RLHF', data: '人类偏好反馈', strength: '对齐人类价值观', tradeoff: '训练复杂，成本高' },
          ],
          quiz: [
            {
              q: '在语言模型预训练中，目标函数通常是什么形式？',
              options: [
                '分类损失',
                '下一个 token 预测的交叉熵损失（自回归语言建模）',
                '回归损失',
                '对比损失',
              ],
              answer: 1,
              explanation: 'GPT 类模型使用自回归语言建模目标，即给定前面的 token 序列，预测下一个 token 的概率分布，使用交叉熵损失。',
            },
          ],
        },
        {
          id: 'llm-mlm',
          title: '掩码语言模型 (MLM)',
          summary: 'BERT 预训练目标、15% 掩码策略',
          theory: `## 掩码语言模型 (Masked Language Modeling)

BERT 类模型的预训练目标：随机掩码部分 token，让模型根据上下文预测被掩码的 token。

### 掩码策略

$$\\tilde{x}_i = \\begin{cases} [\\text{MASK}] & \\text{80\\% 概率} \\\\ x_{\\text{random}} & \\text{10\\% 概率} \\\\ x_i & \\text{10\\% 概率} \\end{cases}$$

### 损失函数

$$L_{MLM} = -\\sum_{i \\in \\mathcal{M}} \\log P(x_i | \\tilde{x})$$

其中 $\\mathcal{M}$ 是被掩码的位置集合。

### 为什么需要随机替换？

如果所有掩码位置都用 [MASK]，模型会学到 [MASK] 的特殊表示，但下游任务（如分类）中不会出现 [MASK] token。加入随机替换和保持原样可以让模型更鲁棒。

### 与因果语言模型的区别

| 特性 | MLM (BERT) | CLM (GPT) |
|------|-----------|-----------|
| 注意力 | 双向 | 单向（因果） |
| 目标 | 预测掩码 token | 预测下一个 token |
| 适用 | 理解任务 | 生成任务 |
| 训练效率 | 每步 15% token 有损失 | 每步所有 token 有损失 |
`,
          exercise: { type: 'playground', viz: 'pretraining' },
          code: {
            python: `class MLMCollator:
    """MLM 数据整理器"""
    def __init__(self, tokenizer, mlm_probability=0.15):
        self.tokenizer = tokenizer
        self.mlm_probability = mlm_probability

    def __call__(self, examples):
        batch = self.tokenizer.pad(examples, return_tensors='pt')
        input_ids = batch['input_ids'].clone()
        labels = input_ids.clone()

        # 创建掩码概率矩阵
        probability_matrix = torch.full(labels.shape, self.mlm_probability)

        # 特殊 token 不掩码
        special_tokens_mask = [
            self.tokenizer.get_special_tokens_mask(val, already_has_special_tokens=True)
            for val in labels.tolist()
        ]
        probability_matrix[torch.tensor(special_tokens_mask, dtype=torch.bool)] = 0

        # 采样掩码位置
        masked_indices = torch.bernoulli(probability_matrix).bool()
        labels[~masked_indices] = -100  # 只计算掩码位置的损失

        # 80% 替换为 [MASK]
        indices_replaced = torch.bernoulli(torch.full(labels.shape, 0.8)).bool() & masked_indices
        input_ids[indices_replaced] = self.tokenizer.convert_tokens_to_ids(self.tokenizer.mask_token)

        # 10% 替换为随机 token
        indices_random = torch.bernoulli(torch.full(labels.shape, 0.5)).bool() & masked_indices & ~indices_replaced
        random_words = torch.randint(len(self.tokenizer), labels.shape, dtype=torch.long)
        input_ids[indices_random] = random_words[indices_random]

        # 10% 保持原样（masked_indices 中剩下的 10%）

        return {'input_ids': input_ids, 'labels': labels}

class MLMLoss(nn.Module):
    def __init__(self, vocab_size):
        super().__init__()
        self.vocab_size = vocab_size

    def forward(self, logits, labels):
        # 只计算掩码位置的损失
        mask = labels != -100
        loss = F.cross_entropy(
            logits[mask].view(-1, self.vocab_size),
            labels[mask].view(-1),
        )
        return loss`,
            cpp: `// MLM 掩码（伪代码）
Tensor apply_mlm_mask(const Tensor& input_ids, double mask_prob, int mask_token_id, int vocab_size) {
    Tensor masked = input_ids.clone();
    Tensor labels = input_ids.clone();

    // 随机选择掩码位置
    Tensor mask = bernoulli(shape(input_ids), mask_prob);

    // 80% -> [MASK]
    Tensor replace_mask = bernoulli(shape(input_ids), 0.8);
    masked = where(mask & replace_mask, mask_token_id, masked);

    // 10% -> 随机 token
    Tensor replace_random = bernoulli(shape(input_ids), 0.5) & mask & ~replace_mask;
    Tensor random_tokens = randint(shape(input_ids), 0, vocab_size);
    masked = where(replace_random, random_tokens, masked);

    // 10% 保持原样

    // 非掩码位置的 label 设为 -100
    labels = where(mask, labels, -100);
    return {masked, labels};
}`,
          },
          variablesSnapshot: {
            objective: 'MLM',
            maskProbability: 0.15,
            maskToken: '[MASK]',
            maskStrategy: '80/10/10',
            model: 'BERT-base',
          },
          pseudocode: `procedure MLM_PRETRAIN(model, data, mask_prob)
    for each batch in data do
        input_ids, labels <- batch
        masked_input <- apply_mlm_mask(input_ids, mask_prob)
        logits <- model(masked_input)
        loss <- cross_entropy(logits, labels) with ignore_index=-100
        update model
    end for
end procedure

procedure APPLY_MLM_MASK(tokens, mask_prob)
    for each token do
        if random() < mask_prob then
            r <- random()
            if r < 0.8 then token <- [MASK]
            else if r < 0.9 then token <- random_token()
            else keep original
        end if
    end for
    return masked_tokens`,
          bigO: {
            time: 'MLM 每步 O(T × d²)，但只有 15% 的 token 有损失梯度。实际计算量比 CLM 略少。',
            space: '与 CLM 相同，需要 O(T × d) 存储输入和梯度。',
            note: 'BERT 预训练需要大量计算（BERT-base 需要约 1e21 FLOPs）。',
          },
          compare: [
            { method: 'MLM (BERT)', data: '15% 掩码 token', strength: '双向上下文，理解能力强', tradeoff: '不能直接生成，需要额外解码器' },
            { method: 'CLM (GPT)', data: '下一个 token 预测', strength: '天然适合生成', tradeoff: '只有单向上下文' },
            { method: 'Prefix LM (T5)', data: '前缀部分双向', strength: '理解+生成兼顾', tradeoff: '需要 encoder-decoder 架构' },
          ],
          quiz: [
            {
              q: 'BERT 预训练中，为什么 10% 的掩码位置保持原始 token 不变？',
              options: [
                '为了减少训练数据量',
                '防止模型过度依赖 [MASK] token 的特殊表示，因为下游任务中不会出现 [MASK]',
                '为了加速训练',
                '为了增加模型容量',
              ],
              answer: 1,
              explanation: '如果所有掩码位置都用 [MASK]，模型会学到 [MASK] 的特殊表示，但下游任务（如分类）中不会出现 [MASK] token。加入随机替换和保持原样可以让模型更鲁棒。',
            },
          ],
        },
        {
          id: 'llm-clm',
          title: '因果语言模型 (CLM)',
          summary: 'GPT 预训练目标、自回归生成、Teacher Forcing',
          theory: `## 因果语言模型 (Causal Language Modeling)

GPT 类模型的预训练目标：给定前面的 token，预测下一个 token。

### 自回归分解

$$P(x_1, x_2, \\ldots, x_T) = \\prod_{t=1}^{T} P(x_t | x_1, \\ldots, x_{t-1})$$

### Teacher Forcing

训练时使用真实 token 作为输入，而不是模型自己的预测：

$$L = -\\sum_{t=1}^{T} \\log P(x_t | x_1, \\ldots, x_{t-1}; \\theta)$$

### 因果注意力掩码

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T + M}{\\sqrt{d_k}}\\right) V$$

其中 $M$ 是上三角掩码矩阵：

$$M_{ij} = \\begin{cases} 0 & i \\geq j \\\\ -\\infty & i < j \\end{cases}$$

这确保位置 $i$ 只能关注位置 $\\leq i$ 的 token。

### 生成策略

| 策略 | 公式 | 特点 |
|------|------|------|
| Greedy | $x_t = \\arg\\max P(x_t | x_{<t})$ | 确定性，可能重复 |
| Sampling | $x_t \\sim P(x_t | x_{<t})$ | 多样性高 |
| Top-k | 从 top-k token 中采样 | 平衡质量和多样性 |
| Nucleus (Top-p) | 从累积概率 ≥ p 的最小集合中采样 | 自适应，质量更好 |
`,
          exercise: { type: 'playground', viz: 'pretraining' },
          code: {
            python: `def generate_greedy(model, tokenizer, prompt, max_length=100):
    """贪心解码生成"""
    input_ids = tokenizer.encode(prompt, return_tensors='pt')
    for _ in range(max_length):
        with torch.no_grad():
            logits = model(input_ids)
        next_token = logits[:, -1, :].argmax(dim=-1, keepdim=True)
        input_ids = torch.cat([input_ids, next_token], dim=-1)
    return tokenizer.decode(input_ids[0])

def generate_nucleus_sampling(model, tokenizer, prompt, max_length=100,
                              temperature=1.0, top_p=0.9):
    """Nucleus (Top-p) 采样"""
    input_ids = tokenizer.encode(prompt, return_tensors='pt')
    for _ in range(max_length):
        with torch.no_grad():
            logits = model(input_ids)[:, -1, :] / temperature

        # Softmax
        probs = torch.softmax(logits, dim=-1)

        # 按概率降序排列
        sorted_probs, sorted_indices = torch.sort(probs, descending=True)
        cumulative_probs = torch.cumsum(sorted_probs, dim=-1)

        # 移除累积概率超过 top_p 的 token
        sorted_indices_to_remove = cumulative_probs - sorted_probs >= top_p
        sorted_probs[sorted_indices_to_remove] = 0

        # 重新归一化
        sorted_probs /= sorted_probs.sum()

        # 采样
        next_token = sorted_indices[torch.multinomial(sorted_probs, 1)]
        input_ids = torch.cat([input_ids, next_token.unsqueeze(0)], dim=-1)

    return tokenizer.decode(input_ids[0])`,
            cpp: `// 因果注意力掩码（伪代码）
Tensor create_causal_mask(int seq_len) {
    Tensor mask = Tensor::zeros(seq_len, seq_len);
    for (int i = 0; i < seq_len; i++)
        for (int j = i + 1; j < seq_len; j++)
            mask(i, j) = -1e18;  // -inf
    return mask;
}

// Teacher Forcing 训练（伪代码）
double clm_train_step(Model& model, const Tensor& input_ids, const Tensor& targets) {
    Tensor logits = model.forward(input_ids);
    // shift: 预测 t+1
    auto shift_logits = logits.slice(1, 0, -1);
    auto shift_labels = targets.slice(1, 1);
    double loss = cross_entropy(shift_logits.reshape(-1, vocab_size),
                                 shift_labels.reshape(-1));
    model.backward(loss);
    model.update();
    return loss;
}`,
          },
          variablesSnapshot: {
            objective: 'CLM',
            model: 'GPT-2',
            layers: 12,
            heads: 12,
            dModel: 768,
            parameters: '124M',
          },
          pseudocode: `procedure CLM_TRAIN(model, data)
    for each batch in data do
        logits <- model(input_ids) with causal_mask
        loss <- cross_entropy(logits[:, :-1], targets[:, 1:])
        update model
    end for
end procedure

procedure NUCLEUS_SAMPLING(logits, temperature, top_p)
    logits <- logits / temperature
    probs <- softmax(logits)
    sorted_probs, sorted_indices <- sort_descending(probs)
    cumulative_probs <- cumsum(sorted_probs)
    remove where cumulative_probs - sorted_probs >= top_p
    re-normalize
    return sample from filtered distribution
end procedure`,
          bigO: {
            time: '自回归推理需要 T 步前向传播，每步 O(d²)。总时间 O(T × d²)。',
            space: '训练时需要 O(T × d) 存储 KV 缓存用于加速推理。',
            note: 'KV 缓存可以将推理时间从 O(T² × d²) 降到 O(T × d²)，但需要额外内存。',
          },
          compare: [
            { method: 'Greedy', data: 'argmax', strength: '确定性，质量稳定', tradeoff: '容易重复，缺乏多样性' },
            { method: 'Temperature Sampling', data: 'softmax/T', strength: '可控多样性', tradeoff: '需要调整温度' },
            { method: 'Nucleus (Top-p)', data: '动态截断', strength: '自适应，质量最佳', tradeoff: '计算稍复杂' },
          ],
          quiz: [
            {
              q: '在自回归语言模型中，因果注意力掩码（causal mask）的作用是什么？',
              options: [
                '加速计算',
                '确保位置 i 的 token 只能关注位置 ≤ i 的 token，防止看到未来信息',
                '减少参数量',
                '增加模型容量',
              ],
              answer: 1,
              explanation: '因果掩码是一个上三角矩阵，将未来位置的注意力分数设为 -inf，确保 softmax 后这些位置的权重为 0。这是自回归模型的核心约束。',
            },
          ],
        },
        {
          id: 'llm-sft',
          title: '监督微调 (SFT)',
          summary: '指令数据、损失掩码、超参数',
          theory: `## 监督微调 (Supervised Fine-Tuning)

用指令-回答数据微调预训练模型，教会模型遵循人类指令。

### 数据格式

指令微调样本由 prompt 段（指令模板 + 用户指令）和 response 段（期望回答）拼接而成：

    ### Instruction
    {instruction}

    ### Response
    {response}    ← 只有这一段参与损失计算

### 损失掩码

只对 response 部分计算损失，prompt 部分设为 -100（忽略）：

$$L = -\\sum_{t \\in \\text{response}} \\log P(y_t | y_{<t}, x; \\theta)$$

### 训练策略

| 策略 | 描述 | 适用场景 |
|------|------|---------|
| 全参数微调 | 更新所有参数 | 数据充足，计算资源多 |
| LoRA | 只训练低秩矩阵 | 资源有限，快速迭代 |
| 冻结部分层 | 只训练后几层 | 数据少，防止灾难性遗忘 |

### LoRA (Low-Rank Adaptation)

$$W' = W + AB$$

其中 $W \\in \\mathbb{R}^{d \\times d}$，$A \\in \\mathbb{R}^{d \\times r}$，$B \\in \\mathbb{R}^{r \\times d}$，$r \\ll d$。

参数量从 $d^2$ 降到 $2dr$，减少约 1000 倍。

### 关键超参数

- 学习率：通常 $10^{-5}$ 到 $10^{-4}$（比预训练小 10-100 倍）
- Batch size：16-128
- Epoch：1-3（防止过拟合）
- 权重衰减：0.01
`,
          exercise: { type: 'playground', viz: 'pretraining' },
          code: {
            python: `import torch
import torch.nn as nn

class LoRALayer(nn.Module):
    """LoRA 适配器层"""
    def __init__(self, original_layer, rank=8, alpha=16):
        super().__init__()
        self.original_layer = original_layer
        self.rank = rank
        self.alpha = alpha
        self.scaling = alpha / rank

        d_in = original_layer.in_features
        d_out = original_layer.out_features

        self.lora_A = nn.Parameter(torch.randn(d_in, rank) * 0.01)
        self.lora_B = nn.Parameter(torch.zeros(rank, d_out))

        # 冻结原始参数
        self.original_layer.weight.requires_grad = False
        if self.original_layer.bias is not None:
            self.original_layer.bias.requires_grad = False

    def forward(self, x):
        original_out = self.original_layer(x)
        lora_out = (x @ self.lora_A @ self.lora_B) * self.scaling
        return original_out + lora_out

def apply_lora_to_model(model, target_modules=['q_proj', 'v_proj'], rank=8):
    """给模型应用 LoRA"""
    for name, module in model.named_modules():
        if any(target in name for target in target_modules):
            # 替换为 LoRA 层
            parent_name = '.'.join(name.split('.')[:-1])
            child_name = name.split('.')[-1]
            parent = model.get_submodule(parent_name)
            setattr(parent, child_name, LoRALayer(module, rank=rank))
    return model

# 冻结/解冻
def freeze_model(model):
    for param in model.parameters():
        param.requires_grad = False

def unfreeze_head(model, num_layers=2):
    """只解冻最后几层"""
    layers = list(model.children())
    for layer in layers[-num_layers:]:
        for param in layer.parameters():
            param.requires_grad = True`,
            cpp: `// LoRA 层（伪代码）
class LoRALayer {
    Linear original;
    Matrix A, B;  // 低秩矩阵
    double scaling;

    Tensor forward(const Tensor& x) {
        return original.forward(x) + (x * A * B) * scaling;
    }
};

// 冻结原始参数
void freeze_original(LoRALayer& layer) {
    layer.original.weight.set_requires_grad(false);
    layer.original.bias.set_requires_grad(false);
}`,
          },
          variablesSnapshot: {
            method: 'SFT + LoRA',
            learningRate: 2e-5,
            batchSize: 32,
            epochs: 3,
            loraRank: 8,
            loraAlpha: 16,
            trainableParams: '0.1%',
          },
          pseudocode: `procedure SFT(model, data, config)
    for each (prompt, response) in data do
        input <- format(prompt, response)
        labels <- create_labels(input, response_start)
        logits <- model(input)
        loss <- cross_entropy(logits, labels) with ignore_index
        update model
    end for
end procedure

procedure LORA_FORWARD(x, W, A, B, alpha, rank)
    return W*x + (A*B*x) * (alpha/rank)
end procedure

procedure APPLY_LORA(model, target_modules, rank)
    for each module in model do
        if module.name in target_modules then
            replace with LoRALayer(module, rank)
        end if
    end for
end procedure`,
          bigO: {
            time: 'LoRA 训练时间 O(T × d × r)，r 是 LoRA 秩（通常 8-64）。比全参数微调快约 10-100 倍。',
            space: 'LoRA 只需要存储 O(d × r) 的参数，比全参数微调少约 1000 倍。',
            note: 'QLoRA 使用 4-bit 量化基础模型，进一步减少显存占用约 4 倍。',
          },
          compare: [
            { method: '全参数微调', data: '所有参数', strength: '性能最好', tradeoff: '需要大量显存和数据' },
            { method: 'LoRA', data: '低秩矩阵', strength: '显存少，训练快', tradeoff: '可能不如全参数' },
            { method: 'Prefix Tuning', data: '前缀向量', strength: '更轻量', tradeoff: '表达能力有限' },
          ],
          quiz: [
            {
              q: 'LoRA（Low-Rank Adaptation）的核心思想是什么？',
              options: [
                '减少模型层数',
                '用低秩矩阵 A 和 B 的乘积来近似权重更新，只训练 A 和 B 而冻结原始权重',
                '减少训练数据量',
                '加速推理速度',
              ],
              answer: 1,
              explanation: 'LoRA 将权重更新分解为 W\' = W + AB，其中 A 和 B 是低秩矩阵。只训练 A 和 B，原始权重 W 保持冻结。这大大减少了训练参数量和显存占用。',
            },
          ],
        },
        {
          id: 'llm-rlhf',
          title: 'RLHF 与 PPO',
          summary: '奖励模型训练、PPO 对齐、DPO 替代',
          theory: `## RLHF (Reinforcement Learning from Human Feedback)

通过人类偏好反馈对齐模型行为，是 LLM 对齐的主流方法。

### 三阶段流程

$$\\text{SFT Model} \\rightarrow \\text{Reward Model} \\rightarrow \\text{PPO Training}$$

### 1. 奖励模型训练

标注员对模型输出进行排序，训练奖励模型：

$$L_{RM} = -\\mathbb{E}_{(x, y_w, y_l)} \\left[ \\log \\sigma(r_\\phi(x, y_w) - r_\\phi(x, y_l)) \\right]$$

其中 $y_w$ 是偏好的输出，$y_l$ 是不偏好的输出。

### 2. PPO 优化

$$L_{PPO} = L_{CLIP} - \\beta \\cdot D_{KL}(\\pi_\\theta || \\pi_{ref})$$

$$L_{CLIP} = \\mathbb{E} \\left[ \\min\\left( r_t \\hat{A}_t, \\text{clip}(r_t, 1-\\epsilon, 1+\\epsilon) \\hat{A}_t \\right) \\right]$$

其中 $r_t = \\pi_\\theta(y_t|x) / \\pi_{ref}(y_t|x)$。

### DPO (Direct Preference Optimization)

绕过奖励模型，直接从偏好数据优化策略：

$$L_{DPO} = -\\mathbb{E} \\left[ \\log \\sigma\\left( \\beta \\log \\frac{\\pi_\\theta(y_w|x)}{\\pi_{ref}(y_w|x)} - \\beta \\log \\frac{\\pi_\\theta(y_l|x)}{\\pi_{ref}(y_l|x)} \\right) \\right]$$

### 对比

| 方法 | 需要奖励模型 | 训练复杂度 | 性能 |
|------|------------|-----------|------|
| PPO | 是 | 高（3 个模型） | 强 |
| DPO | 否 | 低（1 个模型） | 接近 PPO |
| ORPO | 否 | 中 | 最新 SOTA |
`,
          exercise: { type: 'playground', viz: 'pretraining' },
          code: {
            python: `import torch
import torch.nn as nn
import torch.nn.functional as F

class RewardModel(nn.Module):
    """奖励模型"""
    def __init__(self, base_model):
        super().__init__()
        self.backbone = base_model
        self.reward_head = nn.Linear(base_model.config.hidden_size, 1)

    def forward(self, input_ids, attention_mask=None):
        outputs = self.backbone(input_ids, attention_mask=attention_mask)
        # 取最后一个 token 的隐藏状态
        last_hidden = outputs.last_hidden_state[:, -1, :]
        reward = self.reward_head(last_hidden)
        return reward.squeeze(-1)

class DPO(nn.Module):
    """Direct Preference Optimization"""
    def __init__(self, policy, reference, beta=0.1):
        super().__init__()
        self.policy = policy
        self.reference = reference
        self.beta = beta
        # 冻结 reference
        for param in self.reference.parameters():
            param.requires_grad = False

    def forward(self, input_ids_w, input_ids_l, attention_mask_w=None, attention_mask_l=None):
        # 计算 policy 和 reference 的 log 概率
        logp_w = self._get_logp(self.policy, input_ids_w, attention_mask_w)
        logp_l = self._get_logp(self.policy, input_ids_l, attention_mask_l)
        ref_logp_w = self._get_logp(self.reference, input_ids_w, attention_mask_w)
        ref_logp_l = self._get_logp(self.reference, input_ids_l, attention_mask_l)

        # DPO 损失
        ratio_w = logp_w - ref_logp_w
        ratio_l = logp_l - ref_logp_l
        loss = -F.logsigmoid(self.beta * (ratio_w - ratio_l))
        return loss.mean()

    def _get_logp(self, model, input_ids, attention_mask):
        outputs = model(input_ids, attention_mask=attention_mask)
        logits = outputs.logits
        # 计算每个 token 的 log 概率
        log_probs = F.log_softmax(logits[:, :-1, :], dim=-1)
        target = input_ids[:, 1:]
        token_logp = log_probs.gather(-1, target.unsqueeze(-1)).squeeze(-1)
        # 只计算 response 部分（简化：计算所有 token）
        return token_logp.sum(dim=-1)`,
            cpp: `// 奖励模型训练损失（Bradley-Terry 模型）
double reward_model_loss(const Tensor& rewards_w, const Tensor& rewards_l) {
    // rewards_w: 偏好输出的奖励
    // rewards_l: 不偏好输出的奖励
    Tensor diff = rewards_w - rewards_l;
    return -log_sigmoid(diff).mean();
}

// DPO 损失
double dpo_loss(const Tensor& logp_w, const Tensor& logp_l,
                const Tensor& ref_logp_w, const Tensor& ref_logp_l, double beta) {
    Tensor ratio_w = logp_w - ref_logp_w;
    Tensor ratio_l = logp_l - ref_logp_l;
    return -log_sigmoid(beta * (ratio_w - ratio_l)).mean();
}`,
          },
          variablesSnapshot: {
            method: 'DPO',
            beta: 0.1,
            batchSize: 32,
            learningRate: 5e-5,
            referenceModel: 'frozen SFT',
          },
          pseudocode: `procedure REWARD_MODEL_TRAIN(reward_model, data)
    for each (prompt, chosen, rejected) in data do
        r_w <- reward_model(chosen)
        r_l <- reward_model(rejected)
        loss <- -log(sigmoid(r_w - r_l))
        update reward_model
    end for
end procedure

procedure DPO_TRAIN(policy, reference, data, beta)
    for each (prompt, y_w, y_l) in data do
        logp_w <- log_policy(y_w | prompt, policy)
        logp_l <- log_policy(y_l | prompt, policy)
        ref_logp_w <- log_policy(y_w | prompt, reference)
        ref_logp_l <- log_policy(y_l | prompt, reference)
        loss <- -log_sigmoid(beta * ((logp_w - ref_logp_w) - (logp_l - ref_logp_l)))
        update policy
    end for
end procedure`,
          bigO: {
            time: 'PPO 训练需要同时运行 3 个模型（policy、reference、reward），每步 O(3 × T × d²)。DPO 只需要 2 个模型，O(2 × T × d²)。',
            space: 'PPO 需要存储 3 个模型的参数和梯度。DPO 只需要 2 个模型（reference 可冻结）。',
            note: 'DPO 比 PPO 更稳定、更简单，是近期 LLM 对齐的首选方法。',
          },
          compare: [
            { method: 'PPO', data: '奖励模型 + 策略优化', strength: '理论保证，效果强', tradeoff: '训练不稳定，需要调参' },
            { method: 'DPO', data: '直接偏好优化', strength: '简单稳定，无需奖励模型', tradeoff: '可能不如 PPO 灵活' },
            { method: 'ORPO', data: 'SFT + 偏好联合优化', strength: '一步完成 SFT 和对齐', tradeoff: '较新，验证较少' },
          ],
          quiz: [
            {
              q: 'DPO（Direct Preference Optimization）相比 PPO 的主要优势是什么？',
              options: [
                '训练速度更快',
                '不需要显式训练奖励模型，直接从偏好数据优化策略，训练更简单稳定',
                '需要更少的训练数据',
                '模型参数量更少',
              ],
              answer: 1,
              explanation: 'DPO 通过数学推导将奖励模型和策略优化合并为一个损失函数，直接从偏好数据优化策略。这避免了 PPO 中训练奖励模型的复杂性和不稳定性。',
            },
          ],
        },
        {
          id: 'llm-rag',
          title: 'RAG 检索增强生成',
          summary: '向量数据库、语义检索、上下文注入',
          theory: `## RAG (Retrieval-Augmented Generation)

将外部知识库与 LLM 结合，减少幻觉，提供准确、最新的信息。

### 流程

$$\\text{用户查询} \\rightarrow \\text{检索} \\rightarrow \\text{增强} \\rightarrow \\text{生成}$$

### 1. 文档处理

$$\\text{文档} \\rightarrow \\text{分块} \\rightarrow \\text{Embedding} \\rightarrow \\text{向量数据库}$$

### 2. 检索

$$\\text{查询} \\rightarrow \\text{Embedding} \\rightarrow \\text{相似度搜索} \\rightarrow \\text{Top-K 文档}$$

$$\\text{similarity}(q, d) = \\cos(q, d) = \\frac{q \\cdot d}{\\|q\\| \\|d\\|}$$

### 3. 生成

$$\\text{Prompt} = \\underbrace{\\text{System: }\\{\\text{检索到的文档}\\}}_{\\text{上下文}} + \\underbrace{\\text{User: }\\{\\text{查询}\\}}_{\\text{问题}}$$

### 分块策略

| 策略 | 描述 | 适用场景 |
|------|------|---------|
| 固定大小 | 按字符/token 数分块 | 简单通用 |
| 语义分块 | 按语义边界分块 | 需要完整语义 |
| 递归分块 | 多级分块（段落→句子） | 平衡粒度和上下文 |
| 结构化分块 | 按文档结构（标题、列表） | 结构化文档 |

### 向量数据库

| 数据库 | 特点 |
|--------|------|
| Pinecone | 全托管，易用 |
| Weaviate | 开源，支持混合搜索 |
| Milvus | 开源，高性能 |
| Chroma | 轻量级，适合原型 |
`,
          exercise: { type: 'playground', viz: 'rag' },
          code: {
            python: `import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class SimpleRAG:
    def __init__(self, chunk_size=500, chunk_overlap=50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.vectorizer = TfidfVectorizer()
        self.chunks = []
        self.chunk_embeddings = None

    def chunk_document(self, document):
        """文档分块"""
        chunks = []
        start = 0
        while start < len(document):
            end = min(start + self.chunk_size, len(document))
            chunks.append(document[start:end])
            start += self.chunk_size - self.chunk_overlap
        return chunks

    def index_documents(self, documents):
        """索引文档"""
        # 分块
        for doc in documents:
            self.chunks.extend(self.chunk_document(doc))
        # 计算 embedding
        self.chunk_embeddings = self.vectorizer.fit_transform(self.chunks)

    def retrieve(self, query, top_k=3):
        """检索相关文档"""
        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.chunk_embeddings).flatten()
        top_indices = similarities.argsort()[-top_k:][::-1]
        return [(self.chunks[i], similarities[i]) for i in top_indices]

    def generate_prompt(self, query, retrieved_chunks):
        """生成增强 prompt"""
        context = "\\n\\n".join([f"[文档片段 {i+1}]\\n{chunk}"
                              for i, (chunk, _) in enumerate(retrieved_chunks)])
        prompt = f"""请根据以下参考文档回答问题。如果文档中没有相关信息，请说不知道。

参考文档：
{context}

问题：{query}

回答："""
        return prompt

    def query(self, question, top_k=3):
        """完整 RAG 流程"""
        retrieved = self.retrieve(question, top_k)
        prompt = self.generate_prompt(question, retrieved)
        # 这里调用 LLM 生成回答
        # answer = llm.generate(prompt)
        return prompt, retrieved`,
            cpp: `// 简单的 RAG 流程（伪代码）
class SimpleRAG {
    vector<string> chunks;
    Matrix chunk_embeddings;
    EmbeddingModel embedder;

    void index(const vector<string>& documents) {
        // 分块
        for (const auto& doc : documents)
            for (const auto& chunk : split_document(doc, chunk_size, overlap))
                chunks.push_back(chunk);
        // 计算 embedding
        chunk_embeddings = embedder.encode(chunks);
    }

    vector<pair<string, double>> retrieve(const string& query, int k) {
        Vector query_vec = embedder.encode(query);
        vector<pair<int, double>> scores;
        for (int i = 0; i < chunks.size(); i++) {
            double sim = cosine_similarity(query_vec, chunk_embeddings.row(i));
            scores.push_back({i, sim});
        }
        partial_sort(scores.begin(), scores.begin() + k, scores.end(),
            [](auto& a, auto& b) { return a.second > b.second; });
        // 返回 top-k
        vector<pair<string, double>> results;
        for (int i = 0; i < k; i++)
            results.push_back({chunks[scores[i].first], scores[i].second});
        return results;
    }
};`,
          },
          variablesSnapshot: {
            chunkSize: 500,
            chunkOverlap: 50,
            topK: 3,
            embedding: 'text-embedding-ada-002',
            vectorDB: 'Pinecone',
          },
          pseudocode: `procedure RAG_INDEX(documents)
    chunks <- split_documents(documents, chunk_size, overlap)
    embeddings <- embed(chunks)
    store(embeddings, chunks) in vector_db
end procedure

procedure RAG_QUERY(query, top_k)
    query_vec <- embed(query)
    results <- vector_db.search(query_vec, top_k)
    context <- concatenate(results.chunks)
    prompt <- build_prompt(context, query)
    answer <- llm.generate(prompt)
    return answer
end procedure

procedure BUILD_PROMPT(context, query)
    return "System: Use the following context to answer.\\n\\n"
         + context + "\\n\\nUser: " + query
end procedure`,
          bigO: {
            time: '检索 O(d + log N) 使用近似最近邻（ANN），d 是向量维度，N 是文档数。生成 O(T × d²)。',
            space: '向量数据库存储 O(N × d)。索引额外 O(N × d)。',
            note: 'HNSW（Hierarchical Navigable Small World）是最常用的 ANN 算法，查询时间 O(log N)。',
          },
          compare: [
            { method: '基础 RAG', data: '单次检索', strength: '简单有效', tradeoff: '可能检索不到相关文档' },
            { method: '高级 RAG', data: '查询重写 + 重排序', strength: '检索质量更高', tradeoff: '延迟增加' },
            { method: '模块化 RAG', data: '多步检索 + 融合', strength: '处理复杂查询', tradeoff: '实现复杂' },
          ],
          quiz: [
            {
              q: 'RAG 中使用余弦相似度进行向量检索的主要原因是什么？',
              options: [
                '计算速度最快',
                '余弦相似度衡量向量方向的相似性，不受向量长度影响，适合比较语义相似度',
                '需要的存储空间最小',
                '实现最简单',
              ],
              answer: 1,
              explanation: 'Embedding 向量的方向编码了语义信息，而长度通常不那么重要。余弦相似度只关注方向，适合衡量语义相似度。',
            },
          ],
        },
        {
          id: 'llm-tool-calling',
          title: '工具调用与 Function Calling',
          summary: 'Schema 定义、规划、执行循环、ReAct',
          theory: `## 工具调用 (Tool/Function Calling)

让 LLM 能够调用外部工具（API、数据库、代码执行等）来扩展能力。

### 核心流程

$$\\text{用户问题} \\rightarrow \\text{LLM 选择工具} \\rightarrow \\text{执行工具} \\rightarrow \\text{LLM 生成回答}$$

### Schema 定义

[json]
{
  "name": "get_weather",
  "description": "获取指定城市的天气",
  "parameters": {
    "type": "object",
    "properties": {
      "city": {"type": "string", "description": "城市名称"}
    },
    "required": ["city"]
  }
}
[/json]

### ReAct (Reasoning + Acting)

$$\\text{Thought} \\rightarrow \\text{Action} \\rightarrow \\text{Observation} \\rightarrow \\cdots \\rightarrow \\text{Answer}$$

### 多工具协作

$$\\text{Planner} \\rightarrow \\text{Executor} \\rightarrow \\text{Reviewer}$$

- **Planner**: 分解任务，选择工具
- **Executor**: 执行工具调用
- **Reviewer**: 检查结果，决定下一步

### 常见工具类型

| 类型 | 示例 |
|------|------|
| 数据查询 | SQL 数据库、搜索引擎 |
| 代码执行 | Python、Shell |
| API 调用 | 天气、地图、支付 |
| 文件操作 | 读写文件、格式转换 |
`,
          exercise: { type: 'playground', viz: 'agent' },
          code: {
            python: `import json
import re

class ToolCaller:
    """工具调用管理器"""
    def __init__(self, tools):
        self.tools = {t['name']: t for t in tools}
        self.tool_schemas = [{'type': 'function', 'function': t} for t in tools]

    def parse_tool_call(self, llm_output):
        """解析 LLM 输出的工具调用"""
        # 尝试解析 JSON
        try:
            # 查找 JSON 块
            match = re.search(r'\\{.*\\}', llm_output, re.DOTALL)
            if match:
                call = json.loads(match.group())
                if 'name' in call and 'parameters' in call:
                    return call
        except json.JSONDecodeError:
            pass
        return None

    def execute_tool(self, tool_name, parameters):
        """执行工具调用"""
        if tool_name not in self.tools:
            return f"Error: Tool '{tool_name}' not found"
        tool = self.tools[tool_name]
        # 验证参数
        required = tool['parameters'].get('required', [])
        for param in required:
            if param not in parameters:
                return f"Error: Missing required parameter '{param}'"
        # 执行（这里是模拟）
        return f"Result from {tool_name}: {parameters}"

# ReAct 循环
def react_loop(llm, tool_caller, question, max_steps=5):
    context = f"Question: {question}\\n\\n"
    for step in range(max_steps):
        # LLM 生成思考和行动
        prompt = context + "\\nThought:"
        response = llm.generate(prompt)
        context += f"Thought: {response}\\n"

        # 解析行动
        action_match = re.search(r'Action:\\s*(.+?)\\nAction Input:\\s*(.+?)(?:\\n|$)', response, re.DOTALL)
        if action_match:
            tool_name = action_match.group(1).strip()
            tool_input = json.loads(action_match.group(2).strip())
            # 执行工具
            observation = tool_caller.execute_tool(tool_name, tool_input)
            context += f"Observation: {observation}\\n\\n"
        else:
            # 没有行动，检查是否有最终答案
            answer_match = re.search(r'Answer:\\s*(.+)', response, re.DOTALL)
            if answer_match:
                return answer_match.group(1).strip()
            context += f"{response}\\n\\n"
    return "Max steps reached"`,
            cpp: `// 工具调用（伪代码）
struct Tool {
    string name;
    string description;
    json schema;
    function<json(const json&)> handler;
};

class ToolCaller {
    map<string, Tool> tools;

    json call(const string& name, const json& params) {
        if (!tools.count(name))
            throw runtime_error("Tool not found: " + name);
        return tools[name].handler(params);
    }

    string build_system_prompt() const {
        string prompt = "You have access to the following tools:\\n\\n";
        for (const auto& [name, tool] : tools) {
            prompt += "- " + name + ": " + tool.description + "\\n";
        }
        prompt += "\\nTo use a tool, respond with JSON: {"name": "tool_name", "parameters": {...}}";
        return prompt;
    }
};`,
          },
          variablesSnapshot: {
            tools: 5,
            maxSteps: 5,
            framework: 'ReAct',
            model: 'GPT-4',
          },
          pseudocode: `procedure TOOL_CALLING_LOOP(llm, tools, query)
    context <- build_system_prompt(tools) + query
    for step = 1 to max_steps do
        response <- llm.generate(context)
        if response has tool_call then
            result <- execute_tool(response.tool)
            context <- context + response + result
        else
            return response  // 最终答案
        end if
    end for
    return "Max steps reached"
end procedure

procedure REACT(llm, tools, question)
    context <- "Question: " + question
    repeat
        thought <- llm.think(context)
        if thought has answer then return thought.answer
        action <- parse_action(thought)
        observation <- execute(action)
        context <- context + thought + observation
    until done
end procedure`,
          bigO: {
            time: '每步 O(T × d²) 的 LLM 推理 + O(工具执行时间)。总时间 O(S × T × d²)，S 是步数。',
            space: '需要存储工具定义和上下文历史。上下文长度随步数线性增长。',
            note: '工具调用的延迟瓶颈通常在工具执行而非 LLM 推理。',
          },
          compare: [
            { method: '单次工具调用', data: '一个工具', strength: '简单快速', tradeoff: '只能解决简单问题' },
            { method: 'ReAct', data: '多步推理+行动', strength: '处理复杂问题', tradeoff: '步数多，延迟高' },
            { method: 'Plan-and-Execute', data: '先规划后执行', strength: '结构清晰', tradeoff: '规划可能不准确' },
          ],
          quiz: [
            {
              q: 'ReAct（Reasoning + Acting）框架的核心思想是什么？',
              options: [
                '只使用推理，不使用工具',
                '交替进行推理（Thought）和行动（Action），让模型在每一步都先思考再行动',
                '只使用行动，不进行推理',
                '一次性生成所有计划',
              ],
              answer: 1,
              explanation: 'ReAct 让 LLM 在每个步骤交替生成思考（Thought）和行动（Action），通过观察（Observation）获取反馈，形成推理-行动的循环。',
            },
          ],
        },
        {
          id: 'llm-chain-of-thought',
          title: '思维链 (CoT)',
          summary: 'Prompting 技术、自一致性、Tree-of-Thought',
          theory: `## 思维链 (Chain-of-Thought)

通过引导模型逐步推理，提升复杂推理任务的性能。

### 标准 CoT

$$\\text{Prompt: } \\underbrace{\\text{问题} + \\text{逐步推理示例}}_{\\text{Few-shot CoT}} \\rightarrow \\text{回答}$$

### Zero-shot CoT

$$\\text{Prompt: } \\{\\text{问题}\\} + \\text{ "Let's think step by step."}$$

### 自一致性 (Self-Consistency)

多次采样不同的推理路径，取最终答案的多数投票：

$$\\text{Answer} = \\text{majority\\_vote}(\\{\\text{answer}_i\\}_{i=1}^K)$$

### Tree-of-Thought (ToT)

$$\\text{问题} \\rightarrow \\underbrace{\\text{生成多个推理分支}}_{\\text{BFS/DFS}} \\rightarrow \\underbrace{\\text{评估每个分支}}_{\\text{LLM 自评/投票}} \\rightarrow \\text{选择最优路径}$$

### 其他变体

| 方法 | 描述 |
|------|------|
| Least-to-Most | 分解子问题，逐个解决 |
| Self-Ask | 模型自问自答 |
| Reflexion | 失败后反思，重新尝试 |
| Step-Back | 先抽象问题，再具体解决 |

### 性能对比

| 方法 | GSM8K 准确率 |
|------|-------------|
| Standard | 18.3% |
| CoT (Few-shot) | 56.5% |
| Self-Consistency | 74.4% |
| CoT + GPT-4 | 92.0% |
`,
          exercise: { type: 'playground', viz: 'agent' },
          code: {
            python: `def chain_of_thought_prompt(question, examples=None):
    """生成 CoT prompt"""
    if examples:
        prompt = ""
        for ex in examples:
            prompt += f"Q: {ex['question']}\\nA: Let's think step by step. {ex['reasoning']}\\n\\n"
        prompt += f"Q: {question}\\nA: Let's think step by step."
    else:
        prompt = f"Q: {question}\\nA: Let's think step by step."
    return prompt

def self_consistency(llm, question, k=5, temperature=0.7):
    """自一致性：多次采样，多数投票"""
    answers = []
    prompt = chain_of_thought_prompt(question)
    for _ in range(k):
        response = llm.generate(prompt, temperature=temperature)
        # 提取最终答案
        answer = extract_final_answer(response)
        if answer:
            answers.append(answer)
    # 多数投票
    from collections import Counter
    if not answers:
        return None
    return Counter(answers).most_common(1)[0][0]

def tree_of_thought(llm, question, depth=3, breadth=3):
    """Tree-of-Thought：BFS 搜索"""
    # 生成初始候选
    prompt = f"Generate {breadth} different approaches to solve: {question}\\n\\nFor each approach, provide a brief outline."
    candidates = llm.generate(prompt)
    current_nodes = parse_candidates(candidates, breadth)

    for d in range(depth):
        next_nodes = []
        for node in current_nodes:
            # 生成后续步骤
            prompt = f"Continue this reasoning:\\n{node}\\n\\nGenerate {breadth} next steps:"
            next_steps = llm.generate(prompt)
            steps = parse_candidates(next_steps, breadth)
            # 评估每个步骤
            for step in steps:
                full_reasoning = node + "\\n" + step
                score = evaluate_reasoning(ll<[audio_never_used_51bce0c785ca2f68081bfa7d91973934]>, question, full_reasoning)
                next_nodes.append((full_reasoning, score))
        # 选择 top-breadth 节点
        next_nodes.sort(key=lambda x: x[1], reverse=True)
        current_nodes = [n for n, _ in next_nodes[:breadth]]

    # 最终答案
    return llm.generate(f"Based on this reasoning:\\n{current_nodes[0]}\\n\\nProvide the final answer to: {question}")

def evaluate_reasoning(llm, question, reasoning):
    """LLM 自评推理质量"""
    prompt = f"""Rate this reasoning on a scale of 1-10 for correctness and relevance to the question.

Question: {question}

Reasoning:
{reasoning}

Rating (1-10):"""
    score_text = llm.generate(prompt)
    try:
        return float(score_text.strip())
    except ValueError:
        return 5.0`,
            cpp: `// Self-consistency（伪代码）
string self_consistency(LLM& llm, const string& question, int k) {
    map<string, int> votes;
    for (int i = 0; i < k; i++) {
        string response = llm.generate(question + "\\nLet's think step by step.", 0.7);
        string answer = extract_answer(response);
        votes[answer]++;
    }
    // 找出票数最多的答案
    return max_element(votes.begin(), votes.end(),
        [](auto& a, auto& b) { return a.second < b.second; })->first;
}

// Tree-of-Thought BFS（伪代码）
string tree_of_thought(LLM& llm, const string& question, int depth, int breadth) {
    vector<string> current = generate_initial_candidates(llm, question, breadth);
    for (int d = 0; d < depth; d++) {
        vector<pair<string, double>> scored;
        for (const auto& node : current) {
            auto next_steps = generate_next_steps(llm, node, breadth);
            for (const auto& step : next_steps) {
                double score = evaluate(llm, question, node + "\\n" + step);
                scored.push_back({node + "\\n" + step, score});
            }
        }
        sort(scored.begin(), scored.end(), [](auto& a, auto& b) { return a.second > b.second; });
        current.clear();
        for (int i = 0; i < min(breadth, (int)scored.size()); i++)
            current.push_back(scored[i].first);
    }
    return generate_final_answer(llm, current[0], question);
}`,
          },
          variablesSnapshot: {
            method: 'CoT',
            type: 'few-shot',
            examples: 3,
            model: 'GPT-4',
            accuracyGSM8K: '92%',
          },
          pseudocode: `procedure COT_PROMPT(question, examples)
    prompt <- ""
    for each example in examples do
        prompt <- prompt + "Q: " + example.q + "\\nA: " + example.a + "\\n\\n"
    end for
    prompt <- prompt + "Q: " + question + "\\nA: Let's think step by step."
    return prompt
end procedure

procedure SELF_CONSISTENCY(llm, question, k)
    answers <- empty list
    for i = 1 to k do
        response <- llm.generate(COT_PROMPT(question), temperature=0.7)
        answers.append(extract_answer(response))
    end for
    return majority_vote(answers)
end procedure

procedure TREE_OF_THOUGHT(llm, question, depth, breadth)
    nodes <- generate_candidates(question, breadth)
    for d = 1 to depth do
        candidates <- empty
        for each node in nodes do
            steps <- generate_next_steps(node, breadth)
            for each step in steps do
                candidates.append({node + step, evaluate(step)})
            end for
        end for
        nodes <- top_k(candidates, breadth)
    end for
    return generate_final_answer(nodes[0])
end procedure`,
          bigO: {
            time: 'CoT 是 O(T × d²)。Self-consistency 是 O(K × T × d²)，K 是采样次数。ToT 是 O(D × B × T × d²)，D 是深度，B 是广度。',
            space: 'ToT 需要存储 B 个候选节点，每个 O(T) token。',
            note: 'CoT 对小模型（< 10B）效果有限，对大模型（> 50B）效果显著。',
          },
          compare: [
            { method: 'Standard', data: '直接回答', strength: '快速', tradeoff: '推理能力弱' },
            { method: 'CoT', data: '逐步推理', strength: '显著提升推理', tradeoff: '需要更长输出' },
            { method: 'Self-Consistency', data: '多次采样投票', strength: '进一步提升', tradeoff: '计算成本增加 K 倍' },
            { method: 'ToT', data: '树形搜索', strength: '处理复杂问题', tradeoff: '计算成本高' },
          ],
          quiz: [
            {
              q: '自一致性（Self-Consistency）方法如何提升 CoT 的效果？',
              options: [
                '使用更大的模型',
                '多次采样不同的推理路径，然后对最终答案进行多数投票，减少单次推理的随机性',
                '增加训练数据量',
                '减少推理步骤',
              ],
              answer: 1,
              explanation: '单次 CoT 推理可能因为随机性而产生错误。自一致性通过多次采样不同的推理路径，对最终答案进行多数投票，能够有效减少随机性带来的错误。',
            },
          ],
        },
        {
          id: 'llm-agent',
          title: 'AI Agent',
          summary: '工具调用、规划、记忆、多智能体协作',
          theory: `## AI Agent

让 LLM 具备自主行动能力，能够感知环境、规划任务、使用工具。

### 核心组件

$$\\text{Agent} = \\underbrace{\\text{LLM}}_{\\text{大脑}} + \\underbrace{\\text{Tools}}_{\\text{工具}} + \\underbrace{\\text{Memory}}_{\\text{记忆}} + \\underbrace{\\text{Planning}}_{\\text{规划}}$$

### 1. 规划 (Planning)

$$\\text{Goal} \\rightarrow \\text{Task Decomposition} \\rightarrow \\text{Sub-tasks} \\rightarrow \\text{Execution Plan}$$

### 2. 记忆 (Memory)

| 类型 | 描述 | 实现 |
|------|------|------|
| 短期记忆 | 上下文窗口内的对话历史 | LLM 上下文 |
| 长期记忆 | 跨会话的知识和经验 | 向量数据库 |
| 工作记忆 | 当前任务的中间结果 | 变量存储 |

### 3. 工具使用 (Tool Use)

$$\\text{Observation} \\rightarrow \\text{Thought} \\rightarrow \\text{Action} \\rightarrow \\text{Observation} \\rightarrow \\cdots$$

### 多智能体系统

$$\\underbrace{\\text{Planner Agent}}_{\\text{分解任务}} \\rightarrow \\underbrace{\\text{Executor Agent}}_{\\text{执行子任务}} \\rightarrow \\underbrace{\\text{Critic Agent}}_{\\text{检查质量}} \\rightarrow \\underbrace{\\text{Integrator Agent}}_{\\text{整合结果}}$$

### 应用场景

- **代码助手**: 编写、调试、优化代码
- **数据分析**: 查询数据库、生成报告
- **客户服务**: 回答问题、处理请求
- **研究助手**: 搜索文献、总结发现
`,
          exercise: { type: 'playground', viz: 'agent' },
          code: {
            python: `from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseAgent(ABC):
    """Agent 基类"""
    def __init__(self, llm, tools=None, memory=None):
        self.llm = llm
        self.tools = tools or []
        self.memory = memory or ShortTermMemory()

    @abstractmethod
    def run(self, task: str) -> str:
        pass

class ShortTermMemory:
    """短期记忆：对话历史"""
    def __init__(self, max_tokens=4000):
        self.history = []
        self.max_tokens = max_tokens

    def add(self, role: str, content: str):
        self.history.append({'role': role, 'content': content})

    def get_context(self) -> str:
        return '\\n'.join([f"{h['role']}: {h['content']}" for h in self.history])

    def clear(self):
        self.history = []

class LongTermMemory:
    """长期记忆：向量数据库"""
    def __init__(self, embedder, vector_db):
        self.embedder = embedder
        self.vector_db = vector_db

    def store(self, key: str, value: str):
        embedding = self.embedder.encode(value)
        self.vector_db.upsert(ids=[key], embeddings=[embedding], documents=[value])

    def retrieve(self, query: str, top_k=3) -> List[str]:
        query_embedding = self.embedder.encode(query)
        results = self.vector_db.search(query_embedding, top_k=top_k)
        return [r['document'] for r in results]

class ReActAgent(BaseAgent):
    """ReAct Agent"""
    def run(self, task: str, max_steps=10) -> str:
        self.memory.add('user', task)
        context = self.memory.get_context()

        for step in range(max_steps):
            # 生成下一步
            prompt = self._build_prompt(context)
            response = self.llm.generate(prompt)

            # 检查是否有最终答案
            if 'Final Answer:' in response:
                answer = response.split('Final Answer:')[-1].strip()
                self.memory.add('assistant', answer)
                return answer

            # 解析工具调用
            action = self._parse_action(response)
            if action:
                result = self._execute_tool(action)
                context += f"\\n{response}\\nObservation: {result}"
                self.memory.add('system', f"Observation: {result}")
            else:
                context += f"\\n{response}"

        return "Max steps reached without answer"

    def _build_prompt(self, context: str) -> str:
        tool_descriptions = '\\n'.join([
            f"- {t['name']}: {t['description']}" for t in self.tools
        ])
        return f"""You are an AI assistant with access to these tools:
{tool_descriptions}

Use the following format:
Thought: think about what to do
Action: {{{{"tool": "tool_name", "args": {{...}}}}}}
Observation: tool result
... (repeat Thought/Action/Observation as needed)
Final Answer: the answer to the original question

Previous context:
{context}

Begin!"""

    def _parse_action(self, response: str) -> Dict:
        import json
        try:
            match = re.search(r'Action:\\s*(\\{.*?\\})', response, re.DOTALL)
            if match:
                return json.loads(match.group(1))
        except:
            pass
        return None

    def _execute_tool(self, action: Dict) -> str:
        tool_name = action.get('tool')
        tool = next((t for t in self.tools if t['name'] == tool_name), None)
        if not tool:
            return f"Error: Tool '{tool_name}' not found"
        try:
            return str(tool['handler'](**action.get('args', {})))
        except Exception as e:
            return f"Error: {str(e)}"`,
            cpp: `// Agent 框架（伪代码）
class Agent {
    LLM llm;
    vector<Tool> tools;
    Memory memory;

    string run(const string& goal) {
        memory.add("user", goal);
        for (int step = 0; step < max_steps; step++) {
            string context = memory.get_context();
            string response = llm.generate(build_prompt(context));
            if (has_final_answer(response))
                return extract_final_answer(response);
            auto action = parse_action(response);
            string observation = execute_tool(action);
            memory.add("system", observation);
        }
        return "Max steps reached";
    }
};

// 多智能体系统
class MultiAgentSystem {
    Agent planner, executor, critic, integrator;

    string solve(const string& task) {
        auto sub_tasks = planner.decompose(task);
        vector<string> results;
        for (const auto& sub_task : sub_tasks) {
            string result = executor.run(sub_task);
            string feedback = critic.evaluate(result);
            if (!feedback.empty()) {
                result = executor.run(sub_task + "\\nFeedback: " + feedback);
            }
            results.push_back(result);
        }
        return integrator.integrate(results);
    }
};`,
          },
          variablesSnapshot: {
            architecture: 'ReAct',
            tools: 5,
            maxSteps: 10,
            memory: 'short + long term',
            model: 'GPT-4',
          },
          pseudocode: `procedure AGENT_RUN(agent, task)
    memory.add("user", task)
    for step = 1 to max_steps do
        response <- llm.generate(memory.get_context())
        if has_final_answer(response) then
            return extract_final_answer(response)
        end if
        action <- parse_action(response)
        observation <- execute_tool(action)
        memory.add("system", observation)
    end for
    return "Max steps reached"
end procedure

procedure MULTI_AGENT_SOLVE(system, task)
    sub_tasks <- planner.decompose(task)
    results <- empty list
    for each sub_task in sub_tasks do
        result <- executor.run(sub_task)
        feedback <- critic.evaluate(result)
        if feedback then
            result <- executor.run(sub_task + feedback)
        end if
        results.append(result)
    end for
    return integrator.integrate(results)
end procedure`,
          bigO: {
            time: 'Agent 总时间 O(S × T × d² + S × 工具时间)，S 是步数。多智能体系统 O(A × S × T × d²)，A 是智能体数量。',
            space: '短期记忆 O(T × S)。长期记忆 O(N × d)。',
            note: 'Agent 的效率高度依赖于规划能力和工具选择的准确性。',
          },
          compare: [
            { method: '单 Agent (ReAct)', data: '一个 LLM + 工具', strength: '简单直接', tradeoff: '复杂任务可能失败' },
            { method: '多 Agent 协作', data: '多个专门 Agent', strength: '处理复杂任务', tradeoff: '通信开销大' },
            { method: 'AutoGPT', data: '自主规划 + 执行', strength: '高度自主', tradeoff: '容易陷入循环' },
          ],
          quiz: [
            {
              q: 'AI Agent 的短期记忆和长期记忆分别负责什么？',
              options: [
                '短期：存储模型参数；长期：存储训练数据',
                '短期：存储当前会话的对话历史（LLM 上下文）；长期：存储跨会话的知识和经验（向量数据库）',
                '短期：存储工具定义；长期：存储任务结果',
                '短期：存储代码；长期：存储文档',
              ],
              answer: 1,
              explanation: '短期记忆是 Agent 当前会话的上下文，存储在 LLM 的上下文窗口中。长期记忆通过向量数据库存储，跨会话保留知识和经验。',
            },
          ],
        },
]
