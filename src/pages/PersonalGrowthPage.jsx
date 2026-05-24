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
        <span className="gp-deco gp-deco-curl">↩</span>

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
          <div className="gp-kicker">PERSONAL GROWTH / EXPLORATION</div>
          <h1 className="gp-title">
            <span className="gp-title-highlight">内心充盈者，</span>
            独行也如众
          </h1>
          {/* 手绘下划线 */}
          <div className="gp-underline-wrap" aria-hidden="true">
            <svg viewBox="0 0 600 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="gp-underline-svg">
              <path d="M10 12 Q150 4 300 12 Q450 20 590 12" stroke="#f5a5a5" strokeWidth="6" strokeLinecap="round"/>
            </svg>
            <svg viewBox="0 0 300 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="gp-underline-svg2">
              <path d="M10 10 Q75 16 150 8 Q225 2 290 12" stroke="#ffc7a0" strokeWidth="5" strokeLinecap="round"/>
            </svg>
            <span className="gp-heart-deco">♥</span>
          </div>
        </div>
      </header>

      {/* ── 内容区 ── */}
      <main className="gp-main">

        {/* 01 Music */}
        <section className="gp-section">
          <div className="gp-section-header">
            <span className="gp-tag">01 / MUSIC</span>
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
        <section className="gp-section">
          <div className="gp-section-header">
            <span className="gp-tag gp-tag-teal">02 / GAMES</span>
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

        {/* 03 More */}
        <section className="gp-section">
          <div className="gp-section-header">
            <span className="gp-tag gp-tag-purple">03 / MORE</span>
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
