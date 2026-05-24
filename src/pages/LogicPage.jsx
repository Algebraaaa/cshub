import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// ─────────────────────────────────────────────────────────────
// 逻辑学 · 独立思考，明辨是非
//   - 全屏翻页（fullPage 风格），与首页一致：滚轮 / 触控板 / 方向键 / 页码点
//   - 第 1 屏：Hero（独立思考 · 明辨是非）
//   - 第 2 屏：Landing（Start Here + 原则 + 模块入口）
//   - 内容详情区（SHOW_LOGIC_CONTENT）保留为可选展开，目前关闭
// ─────────────────────────────────────────────────────────────

const TOC = [
  { id: 'why',       label: '为什么学逻辑' },
  { id: 'basics',    label: '命题与论证' },
  { id: 'deductive', label: '演绎推理' },
  { id: 'inductive', label: '归纳与溯因' },
  { id: 'fallacies', label: '常见谬误清单' },
  { id: 'critical',  label: '批判性思维框架' },
]

const SHOW_LOGIC_CONTENT = false
const MODULE_ENTRIES = [
  {
    to: '/ai',
    label: 'AI 编程指南',
    title: '把 AI 当成可靠的工作流工具',
    desc: '学习如何让 Claude Code、Codex、Cursor 这类工具真正参与读代码、改代码、跑测试和复盘。',
  },
  {
    to: '/github',
    label: 'GitHub 入门',
    title: '把项目放到可协作的地方',
    desc: '从账号、仓库、提交记录到 Issue 和 Pull Request，建立最基本的工程协作能力。',
  },
]

const PAGES = 2
const ANIM_MS = 800
const LOCK_MS = ANIM_MS + 220
const WHEEL_THRESHOLD = 28
const GESTURE_GAP_MS = 220

export default function LogicPage() {
  if (SHOW_LOGIC_CONTENT) return <LogicLongFormPage />
  return <LogicSnapPage />
}

function LogicSnapPage() {
  const [page, setPage] = useState(0)
  const containerRef = useRef(null)
  const lockRef = useRef(false)
  const accumRef = useRef(0)
  const lastWheelRef = useRef(0)
  const pageRef = useRef(0)
  const touchStartRef = useRef(0)
  useEffect(() => { pageRef.current = page }, [page])

  const goTo = useCallback((next) => {
    if (lockRef.current) return
    const target = Math.max(0, Math.min(PAGES - 1, next))
    setPage(prev => {
      if (prev === target) return prev
      lockRef.current = true
      setTimeout(() => { lockRef.current = false }, LOCK_MS)
      return target
    })
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onWheel = (e) => {
      e.preventDefault()
      const now = Date.now()
      if (now - lastWheelRef.current > GESTURE_GAP_MS) accumRef.current = 0
      lastWheelRef.current = now

      if (lockRef.current) return
      accumRef.current += e.deltaY
      if (Math.abs(accumRef.current) < WHEEL_THRESHOLD) return

      const dir = accumRef.current > 0 ? 1 : -1
      accumRef.current = 0
      goTo(pageRef.current + dir)
    }

    const onKey = (e) => {
      const k = e.key
      if (k === 'ArrowDown' || k === 'PageDown' || k === ' ') {
        e.preventDefault()
        goTo(pageRef.current + 1)
      } else if (k === 'ArrowUp' || k === 'PageUp') {
        e.preventDefault()
        goTo(pageRef.current - 1)
      } else if (k === 'Home') {
        e.preventDefault()
        goTo(0)
      } else if (k === 'End') {
        e.preventDefault()
        goTo(PAGES - 1)
      }
    }

    const onTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientY
    }

    const onTouchEnd = (e) => {
      if (lockRef.current) return
      const deltaY = touchStartRef.current - e.changedTouches[0].clientY
      if (Math.abs(deltaY) < 40) return
      goTo(pageRef.current + (deltaY > 0 ? 1 : -1))
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKey)
    }
  }, [goTo])

  return (
    <div ref={containerRef} className="logic-poster-page logic-snap-pager">
      <Backdrop />
      <div
        className="logic-snap-track"
        style={{
          transform: `translate3d(0, -${page * 100}vh, 0)`,
          transition: `transform ${ANIM_MS}ms cubic-bezier(0.86, 0, 0.07, 1)`,
        }}
      >
        <div className="logic-snap-page">
          <Hero onScrollDown={() => goTo(1)} />
        </div>
        <div className="logic-snap-page">
          <LogicLandingContent />
        </div>
      </div>
      <LogicPageDots count={PAGES} active={page} onSelect={goTo} />
    </div>
  )
}

function LogicLongFormPage() {
  return (
    <div className="logic-poster-page logic-poster-page-longform relative pb-24">
      <Backdrop />
      <Hero />
      <LogicLandingContent />
      <TocBar />
      <main className="relative z-10 mx-auto max-w-4xl px-4 pt-10 sm:px-6">
        <WhySection />
        <BasicsSection />
        <DeductiveSection />
        <InductiveSection />
        <FallaciesSection />
        <CriticalThinkingSection />
        <ClosingSection />
      </main>
    </div>
  )
}

function LogicPageDots({ count, active, onSelect }) {
  return (
    <div
      aria-label="页面导航"
      style={{
        position: 'fixed',
        right: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 40,
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === active
        return (
          <button
            key={i}
            type="button"
            aria-label={`跳到第 ${i + 1} 屏`}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => onSelect(i)}
            style={{
              width: isActive ? 12 : 10,
              height: isActive ? 12 : 10,
              padding: 0,
              borderRadius: 999,
              border: '1.5px solid rgba(184, 154, 84, 0.55)',
              background: isActive ? 'var(--logic-gold, #b89a54)' : 'transparent',
              borderColor: isActive ? 'transparent' : 'rgba(242, 238, 226, 0.32)',
              boxShadow: isActive ? '0 6px 18px rgba(184, 154, 84, 0.45)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          />
        )
      })}
    </div>
  )
}

function LogicLandingContent() {
  return (
    <main className="logic-landing-content relative z-10 mx-auto max-w-5xl px-6 pb-20">
      <section className="logic-content-section">
        <div className="logic-section-kicker">Start Here</div>
        <h2>先建立判断力，再使用工具。</h2>
        <p>
          逻辑学不是背概念，而是训练你在信息、代码、工具和协作中保持清醒：
          先看前提，再看证据，最后看推理是否成立。
        </p>
      </section>

      <section className="logic-principle-grid" aria-label="学习原则">
        <TextPanel title="独立思考" body="遇到结论先暂停，不急着认同，也不急着反驳。先问：它依赖哪些前提？" />
        <TextPanel title="明辨是非" body="把情绪、立场和事实分开。能被验证的归事实，不能验证的先保留判断。" />
        <TextPanel title="工具入口" body="AI 和 GitHub 都是放大器。判断力越清楚，工具越能帮你做成事。" />
      </section>

      <section className="logic-module-section" aria-label="模块入口">
        <div className="logic-section-kicker">Modules</div>
        <div className="logic-module-grid">
          {MODULE_ENTRIES.map(entry => (
            <Link key={entry.to} to={entry.to} className="logic-module-card">
              <span>{entry.label}</span>
              <h3>{entry.title}</h3>
              <p>{entry.desc}</p>
              <strong>进入模块</strong>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

function TextPanel({ title, body }) {
  return (
    <article className="logic-text-panel">
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  )
}

/* ─── Hero · 暗色点阵标题 ─── */
const HERO_LINES = [
  ['独', '立', '思', '考'],
  ['明', '辨', '是', '非'],
]

function Hero({ onScrollDown }) {
  return (
    <section className="logic-poster-hero relative z-10">
      <div className="logic-hero-corner logic-hero-corner-tl" aria-hidden />
      <div className="logic-hero-corner logic-hero-corner-br" aria-hidden />

      <div className="logic-title-stage">
        <div className="logic-title-lockup">
          <h1 className="logic-hero-title" aria-label="独立思考，明辨是非">
            {HERO_LINES.map((line, lineIndex) => (
              <span key={lineIndex} className="logic-title-line">
                {line.map((char, charIndex) => {
                  const index = lineIndex * line.length + charIndex
                  return (
                    <span
                      key={`${char}-${index}`}
                      className="logic-title-char"
                      style={{ animationDelay: `${(index * 0.1).toFixed(2)}s, ${(index * 0.1 + 1.1).toFixed(2)}s` }}
                      aria-hidden="true"
                    >
                      {char}
                    </span>
                  )
                })}
              </span>
            ))}
          </h1>

          <div className="logic-hero-caption">
            <div className="logic-caption-rule" aria-hidden />
            <p className="logic-caption-en">Independent thinking, discern right from wrong.</p>
          </div>
        </div>
      </div>

      {onScrollDown && (
        <button
          type="button"
          onClick={onScrollDown}
          aria-label="向下翻页"
          className="logic-hero-chevron"
        >
          <span className="logic-hero-chevron-label">Scroll</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    </section>
  )
}

function Backdrop() {
  return (
    <div aria-hidden className="logic-poster-backdrop" />
  )
}

/* ─── 目录 sticky bar ─── */
function TocBar() {
  const [activeId, setActiveId] = useState(TOC[0].id)

  useEffect(() => {
    const onHashChange = () => {
      const next = window.location.hash.replace('#', '')
      if (next) setActiveId(next)
    }
    onHashChange()
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <nav className="sticky top-14 z-20 mx-auto -mt-2 max-w-4xl px-4 sm:px-6">
      <div className="logic-ticket-nav flex items-center gap-1 overflow-x-auto px-2 py-1.5">
        {TOC.map((t, i) => (
          <a key={t.id} href={`#${t.id}`}
            onClick={() => setActiveId(t.id)}
            className={['logic-ticket-btn shrink-0', activeId === t.id ? 'logic-ticket-btn-active' : ''].join(' ')}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            {t.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

/* ─── 章节通用容器 ─── */
function Chapter({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="logic-chapter mt-14 scroll-mt-32">
      <div className="logic-chapter-eyebrow mb-2">
        {eyebrow}
      </div>
      <h2 className="mb-6 text-3xl font-black tracking-normal sm:text-4xl">{title}</h2>
      <div className="space-y-5 text-[15px] leading-relaxed">{children}</div>
    </section>
  )
}

function Callout({ kind = 'info', title, children }) {
  const color = {
    info:    { bg: '#f4e7c5', border: '#10233f', fg: '#10233f', stripe: '#d6a74d' },
    success: { bg: '#f4e7c5', border: '#10233f', fg: '#10233f', stripe: '#2f7f70' },
    warning: { bg: '#f4e7c5', border: '#10233f', fg: '#10233f', stripe: '#d6a74d' },
    danger:  { bg: '#f4e7c5', border: '#10233f', fg: '#10233f', stripe: '#b74235' },
  }[kind]
  return (
    <div className="logic-callout my-4 border px-4 py-3 text-sm"
      style={{ background: color.bg, borderColor: color.border, color: color.fg, '--logic-stripe': color.stripe }}>
      {title && <div className="mb-1 text-[11px] font-black uppercase tracking-normal">{title}</div>}
      <div className="leading-relaxed">{children}</div>
    </div>
  )
}

function Code({ children }) {
  return (
    <code className="logic-inline-code px-1.5 py-px font-mono text-[13px]">
      {children}
    </code>
  )
}

function Example({ children }) {
  return (
    <div className="logic-example my-3 px-4 py-2.5 text-sm leading-relaxed">
      {children}
    </div>
  )
}

/* ─── 1. 为什么 ─── */
function WhySection() {
  return (
    <Chapter id="why" eyebrow="01 · Why" title="为什么学逻辑学？">
      <p>
        信息爆炸的时代，每天会有 100 个声音告诉你「该怎么想」——广告、新闻、KOL、家族群、营销号。
        如果你不会自己<strong className="text-fg">拆解论证、识别谬误</strong>，
        你的脑子就是别人的跑马场。
      </p>
      <p>
        逻辑学不是「聪明人的智力游戏」，而是<strong className="text-fg">普通人不被骗的护身符</strong>。
        学过基础逻辑后你会发现：
      </p>
      <ul className="list-disc space-y-1 pl-6 text-fg">
        <li>朋友圈那些刷屏的「专家说」论点，一半经不起 30 秒检验</li>
        <li>吵架时对方耍的花招，多半能用一个谬误名词点破</li>
        <li>看一份合同 / 论文 / 政策，能快速找到没说出口的前提</li>
      </ul>
      <Callout kind="success" title="本指南的目标">
        让你在 30 分钟内拿到一套<strong>实用的思维工具</strong>，下次刷到诡辩内容时能本能反应：「这有问题，问题在 ____。」
      </Callout>
    </Chapter>
  )
}

/* ─── 2. 命题与论证 ─── */
function BasicsSection() {
  return (
    <Chapter id="basics" eyebrow="02 · Basics" title="命题与论证 · 基本构件">
      <p>
        逻辑学的基本单位是<strong className="text-fg">命题（Proposition）</strong>——一句有真假值的陈述。
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="glass-card-sm">
          <div className="section-eyebrow mb-1">是命题</div>
          <ul className="list-disc space-y-0.5 pl-5 text-[13.5px] text-fg">
            <li>北京是中国首都（真）</li>
            <li>2 + 2 = 5（假）</li>
            <li>明天会下雨（真假待定）</li>
          </ul>
        </div>
        <div className="glass-card-sm">
          <div className="section-eyebrow mb-1">不是命题</div>
          <ul className="list-disc space-y-0.5 pl-5 text-[13.5px] text-fg">
            <li>「你好啊！」（感叹）</li>
            <li>「几点了？」（疑问）</li>
            <li>「把门关上」（祈使）</li>
          </ul>
        </div>
      </div>

      <p className="pt-2">
        多个命题按特定关系组合就成了<strong className="text-fg">论证（Argument）</strong>——
        用 <Code>前提（Premise）</Code> 支持 <Code>结论（Conclusion）</Code>。
      </p>
      <Example>
        <strong>前提 1：</strong>所有人都会死<br />
        <strong>前提 2：</strong>苏格拉底是人<br />
        <strong>结论：</strong>苏格拉底会死
      </Example>

      <Callout kind="warning" title="评价论证只看两件事">
        <ol className="list-decimal space-y-1 pl-5">
          <li><strong>前提真不真</strong>（事实层面）</li>
          <li><strong>从前提到结论的推导有没有效</strong>（形式层面）</li>
        </ol>
        二者只要有一个不行，论证就站不住。<strong>很多人吵架时永远在攻击第 1 个，忽略了第 2 个。</strong>
      </Callout>
    </Chapter>
  )
}

/* ─── 3. 演绎 ─── */
function DeductiveSection() {
  return (
    <Chapter id="deductive" eyebrow="03 · Deductive" title="演绎推理 · 从一般到个别">
      <p>
        <strong className="text-fg">演绎（Deduction）</strong>是「前提为真 → 结论必然为真」的推理。
        最经典的形式是<strong className="text-fg">三段论</strong>，由古希腊亚里士多德整理。
      </p>

      <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <RuleCard name="肯定前件 (MP)" rule="如果 P 则 Q；P；∴ Q" example="如果下雨地会湿；下雨了；∴ 地湿" valid />
        <RuleCard name="否定后件 (MT)" rule="如果 P 则 Q；非 Q；∴ 非 P" example="如果下雨地会湿；地没湿；∴ 没下雨" valid />
        <RuleCard name="假言三段论" rule="P→Q；Q→R；∴ P→R" example="努力→技能；技能→工资；∴ 努力→工资" valid />
      </div>

      <Callout kind="danger" title="两个看起来对、其实错的形式（必背！）">
        <div className="space-y-2">
          <div>
            <strong>肯定后件谬误：</strong> <Code>P→Q；Q；∴ P</Code>
            <div className="mt-1 text-[13.5px] text-fg-muted">
              「如果他出轨他会说谎 → 他确实在说谎 → 所以他出轨了？」
              ❌ 错。说谎可能有别的原因。
            </div>
          </div>
          <div>
            <strong>否定前件谬误：</strong> <Code>P→Q；非 P；∴ 非 Q</Code>
            <div className="mt-1 text-[13.5px] text-fg-muted">
              「如果努力就会成功 → 他没努力 → 所以他不会成功？」
              ❌ 错。可能凭运气、天赋成功。
            </div>
          </div>
        </div>
      </Callout>

      <p>
        演绎推理的特点是<strong className="text-fg">结论不增加新信息</strong>——它早就藏在前提里，
        我们只是把它揭示出来。数学证明是纯演绎的典型。
      </p>
    </Chapter>
  )
}

function RuleCard({ name, rule, example, valid }) {
  return (
    <div className={[
      'rounded-xl border p-3.5 text-[13px]',
      valid ? 'border-success/40 bg-success/5' : 'border-danger/40 bg-danger/5',
    ].join(' ')}>
      <div className={`mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.06em] ${valid ? 'text-success' : 'text-danger'}`}>
        {name}
      </div>
      <div className="mb-2 font-mono text-[12px] text-fg-muted">{rule}</div>
      <div className="text-fg">{example}</div>
    </div>
  )
}

/* ─── 4. 归纳 ─── */
function InductiveSection() {
  return (
    <Chapter id="inductive" eyebrow="04 · Inductive" title="归纳与溯因 · 从个别到一般">
      <p>
        现实生活很少有演绎那种「前提百分百保证结论」的奢侈。日常推理大多是<strong className="text-fg">归纳</strong>和<strong className="text-fg">溯因</strong>——
        前提只是<strong className="text-fg">提高</strong>结论为真的可能性。
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="glass-card-sm">
          <div className="text-sm font-bold text-fg">归纳（Induction）</div>
          <div className="mt-1 text-[12.5px] text-fg-muted">观察 N 次 → 推全部</div>
          <Example>
            观察 1000 只乌鸦都是黑的<br />
            ∴ <strong>所有</strong>乌鸦都是黑的
          </Example>
          <div className="text-[12px] text-fg-faint">
            ⚠️ 即便观察 100 万次，下一次也可能反例（黑天鹅）
          </div>
        </div>
        <div className="glass-card-sm">
          <div className="text-sm font-bold text-fg">溯因（Abduction）</div>
          <div className="mt-1 text-[12.5px] text-fg-muted">现象 → 最佳解释</div>
          <Example>
            草地是湿的<br />
            ∴ 可能下过雨（最简单解释）
          </Example>
          <div className="text-[12px] text-fg-faint">
            ⚠️ 「最佳」依赖你知道多少候选；福尔摩斯式推理本质就是溯因
          </div>
        </div>
      </div>

      <Callout kind="info" title="演绎 vs 归纳速记">
        <table className="mt-1 w-full text-[13px]">
          <thead className="text-fg-faint">
            <tr><th className="py-1 text-left font-bold">维度</th><th className="py-1 text-left font-bold">演绎</th><th className="py-1 text-left font-bold">归纳</th></tr>
          </thead>
          <tbody className="text-fg">
            <tr><td className="py-1">方向</td><td>一般 → 个别</td><td>个别 → 一般</td></tr>
            <tr><td className="py-1">前提保证</td><td>必然（100%）</td><td>概率（&lt; 100%）</td></tr>
            <tr><td className="py-1">新信息</td><td>无</td><td>有（也因此可能错）</td></tr>
            <tr><td className="py-1">典型场景</td><td>数学证明</td><td>科学假说、机器学习</td></tr>
          </tbody>
        </table>
      </Callout>
    </Chapter>
  )
}

/* ─── 5. 谬误清单 ─── */
const FALLACIES = [
  {
    name: '人身攻击', en: 'Ad Hominem', danger: 5,
    desc: '攻击对方个人特征而非论点本身',
    ex: '甲：「这条政策有 X 漏洞。」 乙：「你都没读过研究生你懂个屁」',
    fix: '把人和论点分开：论点对不对，与谁说出来无关。',
  },
  {
    name: '稻草人', en: 'Straw Man', danger: 5,
    desc: '扭曲对方观点成更弱版本然后攻击',
    ex: '甲：「应当减少肉类消费」 乙：「所以你想让全人类都饿死？」',
    fix: '复述对方原话 + 反问「你确实是这个意思吗？」',
  },
  {
    name: '滑坡谬误', en: 'Slippery Slope', danger: 4,
    desc: '不论证中间环节，直接从 A 推到极端结果',
    ex: '允许同性结婚 → 接着就有人娶自己宠物了',
    fix: '问：「中间每一步是必然吗？概率多大？」',
  },
  {
    name: '诉诸权威', en: 'Appeal to Authority', danger: 4,
    desc: '搬出权威人物却不验证其论据本身',
    ex: '爱因斯坦说过 X，所以 X 是对的',
    fix: '权威也会错；要求看论据，不是头衔。爱因斯坦反对量子力学的部分就是错的。',
  },
  {
    name: '虚假二分', en: 'False Dichotomy', danger: 4,
    desc: '把多种可能性硬塞成「只有 A 或 B」',
    ex: '「不爱国就是反贼」「不支持就是反对」',
    fix: '主动列出第三、第四种选项',
  },
  {
    name: '诉诸情感', en: 'Appeal to Emotion', danger: 4,
    desc: '用恐惧 / 同情 / 愤怒代替理性论证',
    ex: '「你怎么能反对这个？想想那些可怜的孩子！」',
    fix: '把情感和事实剥开问：「即便可怜，结论一定成立吗？」',
  },
  {
    name: '循环论证', en: 'Circular Reasoning', danger: 3,
    desc: '结论已经偷偷藏在前提里',
    ex: '上帝存在因为圣经说的，圣经是真的因为是上帝写的',
    fix: '检查每个前提是否独立于结论可证实',
  },
  {
    name: '幸存者偏差', en: 'Survivorship Bias', danger: 5,
    desc: '只看成功样本，忽略沉默的失败样本',
    ex: '辍学创业的扎克伯格成了首富 → 辍学创业是好路子',
    fix: '问：「同样辍学但没成的有多少人？分母在哪？」',
  },
  {
    name: '相关 vs 因果', en: 'Correlation ≠ Causation', danger: 5,
    desc: '把同时出现误判为有因果',
    ex: '冰淇淋销量和溺水率正相关 → 吃冰淇淋导致溺水？（实际共同因：夏天）',
    fix: '找潜在的「共同原因」+ 时间先后 + 是否可控实验',
  },
  {
    name: '诉诸传统', en: 'Appeal to Tradition', danger: 3,
    desc: '「自古如此」就一定对',
    ex: '「我们家族一直这么做」「老祖宗的智慧不能变」',
    fix: '问：「这传统在当时合理的理由还存在吗？」',
  },
  {
    name: '移动球门', en: 'Moving the Goalposts', danger: 4,
    desc: '论据被驳倒后立刻换一个新标准',
    ex: '「你拿不到第一」→ 拿到第一 →「但还不是世界冠军」→ 拿到 →「但还没破纪录」',
    fix: '一开始就问：「需要什么证据你才认为论点成立？」并记录下来',
  },
  {
    name: '不当类比', en: 'False Analogy', danger: 3,
    desc: '两个事物只有表面相似就推内在相似',
    ex: '国家像家庭，需要严父式领导',
    fix: '逐条列出二者相似点和差异点，看差异是否关键',
  },
]

function FallaciesSection() {
  const [filter, setFilter] = useState('all')
  const items = filter === 'all' ? FALLACIES : FALLACIES.filter(f => f.danger >= 4)
  return (
    <Chapter id="fallacies" eyebrow="05 · Fallacies" title="常见逻辑谬误 · 实战字典">
      <p>
        谬误识别是逻辑学最实用的部分。下面 12 个高频谬误，每一个都给你「**长什么样**」和「**怎么破**」。
        看完一遍，刷朋友圈时会发现自己开了透视眼。
      </p>

      <div className="my-5 flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')}
          className={['logic-filter-btn', filter === 'all' ? 'logic-filter-btn-active' : ''].join(' ')}>
          全部 {FALLACIES.length}
        </button>
        <button onClick={() => setFilter('top')}
          className={['logic-filter-btn', filter === 'top' ? 'logic-filter-btn-active' : ''].join(' ')}>
          危险度 ≥ 4
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map(f => <FallacyCard key={f.en} f={f} />)}
      </div>
    </Chapter>
  )
}

function FallacyCard({ f }) {
  return (
    <article className="logic-risk-card">
      <div className="mb-3 flex items-start gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-black tracking-normal">{f.name}</h3>
          <span className="font-mono text-[10px] font-bold uppercase tracking-normal">{f.en}</span>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1" aria-label={`危险度 ${f.danger}`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={i < f.danger ? 'logic-risk-bar logic-risk-bar-on' : 'logic-risk-bar'}
            />
          ))}
        </div>
      </div>
      <div className="text-[13.5px] font-semibold leading-relaxed">{f.desc}</div>
      <div className="logic-risk-note logic-risk-note-danger mt-3 px-3 py-2 text-[13px]">
        <strong>例：</strong> {f.ex}
      </div>
      <div className="logic-risk-note logic-risk-note-fix mt-2 px-3 py-2 text-[13px]">
        <strong>破：</strong> {f.fix}
      </div>
    </article>
  )
}

/* ─── 6. 批判性思维 ─── */
function CriticalThinkingSection() {
  const checklist = [
    { q: '关键概念定义清楚了吗？', why: '「自由」「人民」「绝大多数」——含混词常常是争论的源头' },
    { q: '有哪些没说出口的前提？', why: '广告 / 政策 / 论文里没明说的假设往往最值得拷问' },
    { q: '证据本身可靠吗？', why: '样本量、来源、可重复性、利益相关' },
    { q: '反例存在吗？', why: '主动找一个反对意见，看你的论点能不能撑住' },
    { q: '是相关还是因果？', why: '尤其是「研究表明 X 越多则 Y 越好」类标题' },
    { q: '推理形式合法吗？', why: '回头看「肯定后件 / 否定前件」两个常见错误' },
    { q: '换一个角度怎样？', why: '换利益方、换时间尺度、换地理范围，结论是否还成立' },
  ]
  return (
    <Chapter id="critical" eyebrow="06 · Critical Thinking" title="批判性思维 · 7 问清单">
      <p>
        把逻辑学知识变成本能的最快办法：每次接触一个论点（新闻 / 朋友圈 / 论文 / 老板说的话），
        都过一遍下面 7 问。开始会慢，一周后会快得让你自己惊讶。
      </p>
      <ol className="mt-4 space-y-3">
        {checklist.map((c, i) => (
          <li key={i} className="logic-log-item flex gap-3">
            <div className="logic-log-index flex h-7 w-7 shrink-0 items-center justify-center text-[12px] font-black">
              {i + 1}
            </div>
            <div>
              <div className="text-[14.5px] font-black">{c.q}</div>
              <div className="mt-0.5 text-[12.5px]">{c.why}</div>
            </div>
          </li>
        ))}
      </ol>

      <Callout kind="success" title="实操建议">
        把上面 7 问做成手机便签或锁屏。<strong>头一个月强制每天用一次</strong>——
        挑一篇你正在看的内容（不限领域），逐问回答。这是把知识变成肌肉记忆唯一可靠的方法。
      </Callout>
    </Chapter>
  )
}

function ClosingSection() {
  return (
    <section className="logic-mission-complete mt-20 p-8 text-center">
      <div className="logic-poster-label mx-auto mb-3 w-fit">MISSION COMPLETE</div>
      <div className="mb-3 text-2xl font-black leading-tight tracking-normal sm:text-3xl">
        独立思考的人，永远不会被随便骗到
      </div>
      <p className="mx-auto max-w-xl text-sm font-semibold leading-7">
        逻辑学不会让你变成最聪明的人，但能让你不被聪明人耍。
        这是普通人对抗信息洪流最便宜的工具，也是最强大的工具。
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/" className="logic-poster-link">返回首页</Link>
        <Link to="/profile" className="logic-poster-link logic-poster-link-primary">查看学习进度</Link>
      </div>
    </section>
  )
}
