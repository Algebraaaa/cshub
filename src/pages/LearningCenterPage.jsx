import { Link } from 'react-router-dom'

const SPOTLIGHT = {
  to: '/roadmap',
  title: 'AI 时代路线',
  desc: '围绕 AI 工具、项目产出和求职表达重新规划 CS 学习路线图。',
  color: '#13a38b',
  bg: '#e6f7f4',
  tag: 'ROADMAP',
}

const CONTENT_CARDS = [
  { to: '/projects',  title: '实战项目库',   desc: '项目选题、技术栈、README、部署与简历写法的完整参考。', color: '#e06b2d', bg: '#fef0e7', tag: 'PROJECT' },
  { to: '/interview', title: '面试与求职',   desc: '简历、八股、项目深挖、模拟面试与算法表达。',          color: '#c0395a', bg: '#fce8ed', tag: 'CAREER'  },
  { to: '/github',    title: 'GitHub 使用',  desc: 'Git 工作流、PR 规范与开源协作指南。',               color: '#6e40c9', bg: '#f0ebfa', tag: 'GIT'    },
  { to: '/toolbox',   title: '开发者工具箱', desc: 'JSON / Base64 / 时间戳等常用工具集中入口。',         color: '#0d8a7a', bg: '#e6f7f4', tag: 'TOOLS'  },
  { to: '/setup',     title: '环境配置',     desc: '终端 / VS Code / Node / WSL / AI 编程配置。',       color: '#2f6fed', bg: '#e8f1fd', tag: 'SETUP'  },
  { to: '/ai',        title: 'AI 工具指南',  desc: 'Cursor、Claude、Copilot 等工具的使用与工作流整合。', color: '#7c3aed', bg: '#f0ebfa', tag: 'AI'     },
]

export default function LearningCenterPage() {
  return (
    <div className="lc-page">
      <div className="lc-layout">
        <CoverPanel />
        <div className="lc-right">
          <SpotlightCard />
          <div className="lc-grid">
            {CONTENT_CARDS.map(item => <ContentCard key={item.to} item={item} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

function CoverPanel() {
  return (
    <Link to="/path" className="lc-cover">
      <div className="lc-cover-inner">
        <div className="lc-cover-badges">
          <span className="lc-issue-pill">ISSUE 01</span>
          <span className="lc-cover-crumb">
            <GridIcon />
            学习路线总览
          </span>
        </div>
        <h2 className="lc-cover-title">学习路线</h2>
        <div className="lc-cover-line" />
        <p className="lc-cover-desc">
          把算法串成可执行路线，按阶段推进，告别零散刷题。<br />
          从基础排序到图论、动态规划，每条路径都有可视化验证。
        </p>
        <span className="lc-cover-btn">
          查看完整路线图
          <ArrowIcon />
        </span>
      </div>
      <div className="lc-illus-wrap" aria-hidden="true">
        <CoverIllustration />
      </div>
    </Link>
  )
}

function SpotlightCard() {
  return (
    <Link to={SPOTLIGHT.to} className="lc-spotlight">
      <div className="lc-icon-sq" style={{ background: SPOTLIGHT.bg, color: SPOTLIGHT.color }}>
        <MapIcon />
      </div>
      <div className="lc-spotlight-body">
        <span className="lc-tag" style={{ color: SPOTLIGHT.color }}>{SPOTLIGHT.tag}</span>
        <h3 className="lc-spotlight-title">{SPOTLIGHT.title}</h3>
        <p className="lc-spotlight-desc">{SPOTLIGHT.desc}</p>
      </div>
      <span className="lc-spotlight-cta">
        进入路线图 <ArrowIcon />
      </span>
    </Link>
  )
}

function ContentCard({ item }) {
  return (
    <Link to={item.to} className="lc-card">
      <div className="lc-icon-sq" style={{ background: item.bg, color: item.color }}>
        <CardIcon tag={item.tag} />
      </div>
      <span className="lc-tag" style={{ color: item.color }}>{item.tag}</span>
      <h3 className="lc-card-title">{item.title}</h3>
      <p className="lc-card-desc">{item.desc}</p>
      <span className="lc-card-arrow">→</span>
    </Link>
  )
}

/* ── Icons ─────────────────────────────────────────────────── */
function GridIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}

function MapIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  )
}

function CardIcon({ tag }) {
  if (tag === 'PROJECT') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  )
  if (tag === 'CAREER') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
  if (tag === 'GIT') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
  if (tag === 'TOOLS') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
      <line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  )
  if (tag === 'SETUP') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
  if (tag === 'AI') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.88 5.76a2 2 0 0 0 1.26 1.26L21 12l-5.76 1.88a2 2 0 0 0-1.26 1.26L12 21l-1.88-5.76a2 2 0 0 0-1.26-1.26L3 12l5.76-1.88a2 2 0 0 0 1.26-1.26L12 3z"/>
    </svg>
  )
  return null
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>
    </svg>
  )
}

function CoverIllustration() {
  return (
    <svg viewBox="0 0 440 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="lc-illus">
      <defs>
        <filter id="lc-shA" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#2f6fed" floodOpacity="0.22"/>
        </filter>
        <filter id="lc-shB" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#13a38b" floodOpacity="0.22"/>
        </filter>
      </defs>

      {/* Background blobs */}
      <ellipse cx="340" cy="195" rx="105" ry="78" fill="white" opacity="0.45"/>
      <ellipse cx="118" cy="232" rx="135" ry="56" fill="white" opacity="0.35"/>
      <circle cx="52" cy="158" r="44" fill="white" opacity="0.28"/>
      <circle cx="402" cy="78" r="32" fill="white" opacity="0.22"/>

      {/* Road shadow */}
      <path d="M 8 256 Q 68 236 118 206 Q 174 172 224 150 Q 278 128 326 98 Q 366 72 432 48"
        stroke="#b4d0ee" strokeWidth="30" strokeLinecap="round"/>

      {/* Main road */}
      <path d="M 8 249 Q 68 229 118 199 Q 174 165 224 143 Q 278 121 326 91 Q 366 65 432 41"
        stroke="white" strokeWidth="24" strokeLinecap="round" opacity="0.95"/>

      {/* Road centre dashes */}
      <path d="M 8 249 Q 68 229 118 199 Q 174 165 224 143 Q 278 121 326 91 Q 366 65 432 41"
        stroke="#b4d0ee" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="14 18" opacity="0.75"/>

      {/* Milestone dots */}
      <circle cx="118" cy="199" r="9" fill="#2f6fed" opacity="0.85"/>
      <circle cx="224" cy="143" r="9" fill="#2f6fed" opacity="0.85"/>
      <circle cx="326" cy="91"  r="9" fill="#2f6fed" opacity="0.85"/>

      {/* Flag 1 */}
      <line x1="118" y1="199" x2="118" y2="163" stroke="#6daaee" strokeWidth="2.5"/>
      <polygon points="118,163 135,169 118,175" fill="#90bfee"/>

      {/* Flag 2 */}
      <line x1="224" y1="143" x2="224" y2="107" stroke="#6daaee" strokeWidth="2.5"/>
      <polygon points="224,107 241,113 224,119" fill="#90bfee"/>

      {/* Flag 3 */}
      <line x1="326" y1="91" x2="326" y2="55" stroke="#5a9fe0" strokeWidth="2.5"/>
      <polygon points="326,55 343,61 326,67" fill="#5ea8dc"/>

      {/* Code card */}
      <rect x="20" y="104" width="78" height="68" rx="14" fill="#2f6fed" filter="url(#lc-shA)"/>
      <text x="59" y="144" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" fontFamily="monospace">&lt;/&gt;</text>

      {/* Chart card */}
      <rect x="172" y="50" width="78" height="68" rx="14" fill="#13a38b" filter="url(#lc-shB)"/>
      <rect x="185" y="95" width="9"  height="13" rx="2" fill="white" opacity="0.9"/>
      <rect x="198" y="83" width="9"  height="25" rx="2" fill="white" opacity="0.9"/>
      <rect x="211" y="73" width="9"  height="35" rx="2" fill="white" opacity="0.9"/>
      <rect x="224" y="79" width="9"  height="29" rx="2" fill="white" opacity="0.9"/>

      {/* Corner dots */}
      <circle cx="392" cy="188" r="5"   fill="#c4dcf4" opacity="0.7"/>
      <circle cx="408" cy="204" r="3.5" fill="#c4dcf4" opacity="0.5"/>
      <circle cx="376" cy="202" r="4"   fill="#c4dcf4" opacity="0.6"/>
    </svg>
  )
}
