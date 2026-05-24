// ─────────────────────────────────────────────────────────────
// HomePage Hero · 动感弹出版
//
// 结构（从上到下）：
//   1. 「欢迎来到」—— 4 字逐字弹入（向上弹 + 超调回落）
//   2. 「CS Hub」—— 整体从小爆发到大（弹簧感 scale 动画 + 模糊消散）
//   3. 副标题淡入
//   4. 底部呼吸式 ↓ 指示
// ─────────────────────────────────────────────────────────────

// 苹果风格：逐字对焦，每字间隔 120ms，留出呼吸感
const WELCOME_CHARS = ['欢', '迎', '来', '到']

export default function HeroSection({ onScrollDown }) {
  return (
    <section className="hero-section relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <HeroParticleField />

      <div className="relative z-10 flex max-w-[860px] flex-col items-center text-center">
        <h1 className="hero-title font-black leading-[0.94] tracking-[-0.045em] text-[68px] sm:text-[92px] md:text-[120px] lg:text-[136px]">

          {/* 「欢迎来到」：逐字对焦入场，节奏舒展
               delay格式："进场delay, 漂浮delay"
               漂浮delay = 进场delay + 0.9s(进场时长)，每字错开 → 波浪感 */}
          <span className="block text-fg" style={{ letterSpacing: '-0.02em' }}>
            {WELCOME_CHARS.map((char, i) => {
              const enterDelay = (i * 0.12).toFixed(2)
              const floatDelay = (i * 0.12 + 0.9).toFixed(2)
              return (
                <span
                  key={char}
                  className="hero-char-pop"
                  style={{ animationDelay: `${enterDelay}s, ${floatDelay}s` }}
                  aria-hidden="true"
                >
                  {char}
                </span>
              )
            })}
            <span className="sr-only">欢迎来到</span>
          </span>

          {/* 「CS Hub」：主角登台，延迟 0.62s 入场，1.72s 开始漂浮 */}
          <span
            className="hero-cshub-pop block bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#f59e0b] bg-clip-text text-transparent"
            style={{ animationDelay: '0.62s, 1.72s' }}
          >
            CS&nbsp;Hub
          </span>
        </h1>

        {/* 副标题：1.1s 入场，2.0s 开始漂浮 */}
        <p
          className="hero-subtitle-fade mt-7 text-[15.5px] font-semibold leading-[1.95] text-fg-muted sm:text-[16.5px]"
          style={{ animationDelay: '1.1s, 2.0s' }}
        >
          算法学习 · 项目实践 · 面试准备 · 个人成长
          <br />
          <span className="text-fg-faint">一站式提升你的计算机科学能力</span>
        </p>
      </div>

      <ScrollChevron onClick={onScrollDown} />
    </section>
  )
}

const PARTICLES = [
  { x: '31%', y: '25%', size: 5, color: '#a855f7', delay: '-0.6s', duration: '8.5s' },
  { x: '69%', y: '27%', size: 4, color: '#38bdf8', delay: '-2.4s', duration: '9.4s' },
  { x: '24%', y: '46%', size: 3, color: '#ec4899', delay: '-4.2s', duration: '7.8s' },
  { x: '76%', y: '48%', size: 5, color: '#f59e0b', delay: '-1.7s', duration: '8.8s' },
  { x: '36%', y: '69%', size: 4, color: '#14b8a6', delay: '-3.1s', duration: '9.8s' },
  { x: '64%', y: '70%', size: 3, color: '#8b5cf6', delay: '-5.1s', duration: '8.1s' },
  { x: '44%', y: '18%', size: 3, color: '#60a5fa', delay: '-1.2s', duration: '10s' },
  { x: '56%', y: '82%', size: 4, color: '#f472b6', delay: '-6s', duration: '9.2s' },
]

const TOKENS = [
  { x: '27%', y: '34%', text: 'O(n)', color: '#8b5cf6', delay: '-1.2s' },
  { x: '72%', y: '37%', text: 'DFS', color: '#0ea5e9', delay: '-3.4s' },
  { x: '30%', y: '63%', text: '{}', color: '#14b8a6', delay: '-5.2s' },
  { x: '68%', y: '62%', text: 'dp[i]', color: '#f59e0b', delay: '-2.5s' },
]

function HeroParticleField() {
  return (
    <div className="hero-particle-field" aria-hidden="true">
      <svg className="hero-particle-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M28 34 C42 22 56 24 72 37" />
        <path d="M24 46 C36 60 50 66 68 62" />
        <path d="M44 18 C50 36 53 55 56 82" />
        <path d="M31 25 C39 43 47 58 64 70" />
      </svg>

      {PARTICLES.map((particle, index) => (
        <span
          key={`particle-${index}`}
          className="hero-particle"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            background: particle.color,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}

      {TOKENS.map((token) => (
        <span
          key={token.text}
          className="hero-token"
          style={{
            left: token.x,
            top: token.y,
            color: token.color,
            borderColor: `${token.color}42`,
            animationDelay: token.delay,
          }}
        >
          {token.text}
        </span>
      ))}
    </div>
  )
}

function ScrollChevron({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="向下翻页"
      className="absolute bottom-7 left-1/2 -translate-x-1/2 grid h-10 w-10 place-items-center rounded-full border border-glass-border bg-surface text-fg-muted backdrop-blur-xl transition-colors hover:text-fg"
      style={{ animation: 'hero-chevron-bounce 1.8s ease-in-out infinite' }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  )
}
