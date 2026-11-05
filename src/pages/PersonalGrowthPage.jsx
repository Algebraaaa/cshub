import { Link } from 'react-router-dom'

const MUSIC_ITEMS = [
  { icon: '🎸', title: '吉他 (Guitar)', desc: '入门相对容易，无论是民谣弹唱还是指弹，都能随时随地带来快乐。每天练习半小时，三个月就能弹奏喜欢的流行歌曲。', to: '/guitar', tip: '进入入门课程' },
  { icon: '🎹', title: '钢琴 (Piano)', desc: '乐器之王，能够直观地建立乐理知识体系。系统学习从认识琴键到完整演奏第一首曲目的全部基础。', to: '/piano', tip: '进入入门课程' },
  { icon: '🎻', title: '小提琴 (Violin)', desc: '音色优美深邃，极具艺术表现力。虽然入门需要一定的耐心打磨音准，但当你拉出第一首完整旋律时，那种成就感将无与伦比。', to: '/violin', tip: '进入入门课程' },
]

const GAME_ITEMS = [
  { icon: '🤠', title: '《荒野大镖客：救赎 2》', desc: '沉浸式的西部世界体验，一段可以亲身经历的人生，让你理解真正的兄弟情义与时代落幕的苍凉。', link: 'https://www.rockstargames.com/reddeadredemption2/' },
  { icon: '⚡', title: '《赛博朋克 2077》', desc: '在夜之城体验高科技与低生活的碰撞，感受未来世界的繁华与迷茫。', link: 'https://www.cyberpunk.net/' },
  { icon: '🐒', title: '《黑神话：悟空》', desc: '属于中国人的 3A 巨制。重走西游路，在极致美学与畅快战斗中感受传统文化的现代演绎。', link: 'https://www.heishenhua.com/' },
]

const MORE_ITEMS = [
  { icon: '🏋️', title: '坚持一项运动', desc: '强健的体魄是支撑你进行所有探索的基础，运动分泌的内啡肽也是最好的抗压药。' },
  { icon: '📖', title: '保持高质量阅读', desc: '在书中与伟大的灵魂对话，建立自己独立思考的体系，不盲从，不迷失。' },
  { icon: '📷', title: '记录生活', desc: '拍的不好没有关系，没有记录下来才是最可惜的，因为很多事情过后，已经不能凭空想象起来' },
]

const TALENT_ITEMS = [
  { icon: '🧭', title: '找到天然兴奋点', desc: '回顾那些不需要别人催促、你也愿意反复研究的事情。天赋常常不是“轻松赢”，而是“愿意持续投入”。' },
  { icon: '🧩', title: '识别高反馈场景', desc: '观察别人经常向你请教什么、你在哪类任务里学得比同龄人快。外部反馈能帮你校准自我感受。' },
  { icon: '📝', title: '做三十天小实验', desc: '不要只靠性格测试下结论。选一个方向做低成本作品、分享或服务，用真实结果判断它是否值得长期投入。' },
]

const SURVIVAL_ITEMS = [
  { number: '01', title: '租房先保底线', desc: '优先看通勤、合同、押金、室友和安全。预算尽量控制在税后收入的三分之一以内，第一次租房不要为了“看起来体面”透支现金流。' },
  { number: '02', title: '建立三个月缓冲金', desc: '毕业初期不确定性高，先把房租、吃饭、交通、通讯等基础支出算清楚，再逐步攒出 3-6 个月生活费。' },
  { number: '03', title: '学会处理生活事务', desc: '保留合同、发票和聊天记录；学会报修、搬家、体检、社保、公积金和基础法律常识。这些能力会直接降低生活摩擦。' },
]

export default function PersonalGrowthPage() {

  return (
    <div className="gp-page">
      {/* ── 全屏背景 ── */}
      <div className="gp-bg" aria-hidden="true">
        <div className="gp-blob gp-blob-tl" />
        <div className="gp-blob gp-blob-tr" />
        <div className="gp-blob gp-blob-bl" />

        {/* 流动的音乐五线谱 (Wavy Curved SVG staff) */}
        {/* 流动的音乐五线谱 (Wavy Curved SVG staff) */}
        <svg className="gp-wavy-staffs" viewBox="0 0 1440 800" preserveAspectRatio="none" aria-hidden="true" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1
        }}>
          <defs>
            <path id="staff2-p1" d="M -100,550 C 350,650 650,350 1050,600 C 1250,700 1450,500 1600,550" />
            <path id="staff2-p2" d="M -100,558 C 350,658 650,358 1050,608 C 1250,708 1450,508 1600,558" />
            <path id="staff2-p3" d="M -100,566 C 350,666 650,366 1050,616 C 1250,716 1450,516 1600,566" />
            <path id="staff2-p4" d="M -100,574 C 350,674 650,374 1050,624 C 1250,724 1450,524 1600,574" />
            <path id="staff2-p5" d="M -100,582 C 350,682 650,382 1050,632 C 1250,732 1450,532 1600,582" />
          </defs>

          {/* Draw Staff 2 */}
          <g className="gp-staff-group">
            <use href="#staff2-p1" className="gp-wavy-path" />
            <use href="#staff2-p2" className="gp-wavy-path" />
            <use href="#staff2-p3" className="gp-wavy-path" />
            <use href="#staff2-p4" className="gp-wavy-path" />
            <use href="#staff2-p5" className="gp-wavy-path" />
          </g>

          {/* Treble Clef sitting at the left entrance of the staff */}
          <text x="50" y="595" className="gp-svg-clef">𝄞</text>

          {/* Floating Notes along Staff 2 */}
          <text fontStyle="normal" className="gp-svg-note">
            ♩
            <animateMotion path="M -100,566 C 350,666 650,366 1050,616 C 1250,716 1450,516 1600,566" dur="20s" repeatCount="indefinite" begin="0s" rotate="auto" />
          </text>
          <text fontStyle="normal" className="gp-svg-note">
            ♫
            <animateMotion path="M -100,566 C 350,666 650,366 1050,616 C 1250,716 1450,516 1600,566" dur="20s" repeatCount="indefinite" begin="5s" rotate="auto" />
          </text>
          <text fontStyle="normal" className="gp-svg-note">
            ♪
            <animateMotion path="M -100,566 C 350,666 650,366 1050,616 C 1250,716 1450,516 1600,566" dur="20s" repeatCount="indefinite" begin="10s" rotate="auto" />
          </text>
          <text fontStyle="normal" className="gp-svg-note">
            ♬
            <animateMotion path="M -100,566 C 350,666 650,366 1050,616 C 1250,716 1450,516 1600,566" dur="20s" repeatCount="indefinite" begin="15s" rotate="auto" />
          </text>
        </svg>
      </div>

      {/* ── Hero ── */}
      <header className="gp-hero">
        {/* 手绘装饰 */}
        <span className="gp-deco gp-deco-star1">✦</span>
        <span className="gp-deco gp-deco-star2">✦</span>
        <span className="gp-deco gp-deco-star3">✧</span>
        <span className="gp-deco gp-deco-heart1">♥</span>
        <span className="gp-deco gp-deco-heart2">♡</span>
        <span className="gp-deco gp-deco-crown">♛</span>

        {/* 左侧气泡 */}
        <div className="gp-bubble gp-bubble-left">
          <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 10 Q10 2 18 2 L102 2 Q110 2 110 10 L110 56 Q110 64 102 64 L40 64 L20 78 L26 64 L18 64 Q10 64 10 56 Z" stroke="#e8a4a4" strokeWidth="2" fill="rgba(255,255,255,0.7)" strokeDasharray="4 2"/>
          </svg>
          <div className="gp-bubble-text">Be your<br/>own light ♥</div>
        </div>

        {/* 右侧便利贴 */}
        <div className="gp-sticky">
          <p>独处，</p>
          <p>是为了更好地</p>
          <p>遇见自己 ♡</p>
        </div>

        <div className="gp-hero-inner">
          <h1 className="gp-title">
            <span className="gp-title-highlight">内心充盈者，</span>
            独行也如众
          </h1>
          {/* 手绘下划线（自己画出来） */}
          <div className="gp-underline-wrap" aria-hidden="true">
            <svg viewBox="0 0 600 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="gp-underline-svg">
              <path d="M10 12 Q150 4 300 12 Q450 20 590 12" pathLength="100" stroke="#f5a5a5" strokeWidth="6" strokeLinecap="round" className="gp-underline-path"/>
            </svg>
            <svg viewBox="0 0 300 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="gp-underline-svg2">
              <path d="M10 10 Q75 16 150 8 Q225 2 290 12" pathLength="100" stroke="#ffc7a0" strokeWidth="5" strokeLinecap="round" className="gp-underline-path gp-underline-path-2"/>
            </svg>
            <span className="gp-heart-deco">♥</span>
          </div>

          {/* 副标语 */}
          <p className="gp-lead">
            音乐 · 游戏 · 天赋 · 独立 · 记录<br/>
            <span>给生活找几个能让灵魂呼吸的出口。</span>
          </p>

          {/* 章节快捷锚点 */}
          <nav className="gp-chapters" aria-label="章节快捷导航">
            <a href="#chapter-music" className="gp-chapter gp-chapter-red">
              <span className="gp-chapter-num">01</span>
              <span className="gp-chapter-label">乐器</span>
            </a>
            <a href="#chapter-games" className="gp-chapter gp-chapter-teal">
              <span className="gp-chapter-num">02</span>
              <span className="gp-chapter-label">游戏</span>
            </a>
            <a href="#chapter-talent" className="gp-chapter gp-chapter-gold">
              <span className="gp-chapter-num">03</span>
              <span className="gp-chapter-label">天赋</span>
            </a>
            <a href="#chapter-survival" className="gp-chapter gp-chapter-blue">
              <span className="gp-chapter-num">04</span>
              <span className="gp-chapter-label">独立</span>
            </a>
            <a href="#chapter-more" className="gp-chapter gp-chapter-purple">
              <span className="gp-chapter-num">05</span>
              <span className="gp-chapter-label">更多</span>
            </a>
          </nav>

        </div>

        {/* 滚动提示（独立于 .gp-hero-inner，绝对定位贴底，与 Logic/Finance 一致） */}
        <a href="#chapter-music" className="gp-scroll-hint" aria-label="Scroll">
          <span>Scroll</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </a>
      </header>

      {/* ── 内容区 ── */}
      <main className="gp-main">

        {/* 00 IELTS */}
        <section className="gp-section" id="chapter-ielts">
          <div className="gp-section-header">
            <span className="gp-tag">01 / IELTS</span>
            <div>
              <h2 className="gp-section-title">雅思复盘与刻意练习</h2>
              <p className="gp-section-desc">做完真题之后才是提分的开始：确定性判对错、逐题讲解为什么错、按错因积累弱点画像，写作口语拆成小步反复练。</p>
            </div>
          </div>
          <div className="gp-cards">
            <Link
              className="gp-card gp-card-clickable"
              to="/ielts"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="gp-card-icon">🎓</div>
              <h3 className="gp-card-title">
                雅思复盘系统
                <span className="gp-card-click-tip">进入系统</span>
              </h3>
              <p className="gp-card-desc">阅读/听力复盘、错题库与弱点画像、写作与口语分步训练、词块库。模型用你自己的 API key，没有 key 也能用判题和模拟反馈。</p>
            </Link>
          </div>
        </section>

        {/* 01 Music */}
        <section className="gp-section" id="chapter-music">
          <div className="gp-section-header">
            <span className="gp-tag">02 / MUSIC</span>
            <div>
              <h2 className="gp-section-title">学一门乐器：情绪的出口</h2>
              <p className="gp-section-desc">学习一门乐器不需要成为大师，重要的是在指尖流淌出旋律的那一刻，你能感受到与自己的深度对话。</p>
            </div>
          </div>
          <div className="gp-cards">
            {MUSIC_ITEMS.map(item => (
              <Link
                className="gp-card gp-card-clickable"
                key={item.title}
                to={item.to}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="gp-card-icon">{item.icon}</div>
                <h3 className="gp-card-title">
                  {item.title}
                  <span className="gp-card-click-tip">{item.tip}</span>
                </h3>
                <p className="gp-card-desc">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 02 Games */}
        <section className="gp-section" id="chapter-games">
          <div className="gp-section-header">
            <span className="gp-tag gp-tag-teal">03 / GAMES</span>
            <div>
              <h2 className="gp-section-title">玩几个 3A 大作：体验第九艺术</h2>
              <p className="gp-section-desc">优秀的 3A 大作是结合了视觉艺术、音乐、叙事和交互设计的综合艺术品，能带给你长久的回味和震撼。</p>
            </div>
          </div>
          <div className="gp-cards">
            {GAME_ITEMS.map(item => (
              <a
                className="gp-card gp-card-clickable"
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                key={item.title}
              >
                <div className="gp-card-icon">{item.icon}</div>
                <h3 className="gp-card-title">{item.title}</h3>
                <p className="gp-card-desc">{item.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* 03 Talent */}
        <section className="gp-section" id="chapter-talent">
          <div className="gp-section-header">
            <span className="gp-tag gp-tag-gold">03 / TALENT</span>
            <div>
              <h2 className="gp-section-title">发现自我天赋：把热爱变成方向</h2>
              <p className="gp-section-desc">天赋不是一句“我适合什么”的标签，而是一组需要被观察、验证和迭代的线索。先找到能让你长期投入的事情，再把它训练成能力。</p>
            </div>
          </div>
          <div className="gp-cards">
            {TALENT_ITEMS.map(item => (
              <div className="gp-card" key={item.title}>
                <div className="gp-card-icon">{item.icon}</div>
                <h3 className="gp-card-title">{item.title}</h3>
                <p className="gp-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 04 Survival */}
        <section className="gp-section" id="chapter-survival">
          <div className="gp-section-header">
            <span className="gp-tag gp-tag-blue">04 / SURVIVAL</span>
            <div>
              <h2 className="gp-section-title">毕业大学生如何生存：先把生活跑通</h2>
              <p className="gp-section-desc">刚毕业最重要的不是一步到位，而是让现金流、住所、健康和工作节奏稳定下来。先减少失误成本，再慢慢追求更好的选择。</p>
            </div>
          </div>
          <div className="gp-cards">
            {SURVIVAL_ITEMS.map(item => (
              <div className="gp-card" key={item.title}>
                <div className="gp-card-num">{item.number}</div>
                <h3 className="gp-card-title">{item.title}</h3>
                <p className="gp-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 05 More */}
        <section className="gp-section" id="chapter-more">
          <div className="gp-section-header">
            <span className="gp-tag gp-tag-purple">05 / MORE</span>
            <div>
              <h2 className="gp-section-title">更多成长方向</h2>
              <p className="gp-section-desc">内心的充盈不仅来源于工作上的成就，更源于对生活广度的探索。无论独处还是群居，都能找到生命的丰富多彩。</p>
            </div>
          </div>
          <div className="gp-cards">
            {MORE_ITEMS.map(item => (
              <div className="gp-card" key={item.title}>
                <div className="gp-card-icon">{item.icon}</div>
                <h3 className="gp-card-title">{item.title}</h3>
                <p className="gp-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="gp-cta">
          <div className="gp-cta-emoji">🌱</div>
          <p className="gp-cta-quote">
            种一棵树最好的时间是十年前，其次是现在
          </p>
        </div>

      </main>
    </div>
  )
}
