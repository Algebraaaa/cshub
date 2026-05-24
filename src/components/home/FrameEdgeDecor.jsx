// ─────────────────────────────────────────────────────────────
// FrameEdgeDecor · 首页第 1 屏（Hero）两侧的浮动品牌胶囊
//
// 由 AppLayout 抽出，作为 Hero 一体的装饰。放在 HomePage 第 1 屏的
// snap-page 容器内，翻页时跟随主屏一起滑出。
//
// 视觉保留四元素（渐变 / 玻璃 / sparkline / label·value·mark）：
//   - 用 viewport-percentage 定位，随窗口高度自适应
//   - 左右两侧 zigzag 错位（左 22/50/78 vs 右 32/60/86）形成 V 形
//   - 6 张卡 delay 错开，呼吸节奏不同
//   - ≤ 1100px 视口由 CSS（.frame-edge-decor display:none）自动隐藏
// ─────────────────────────────────────────────────────────────

export default function FrameEdgeDecor() {
  const leftItems = [
    { topPct: 22, label: 'ALGO',     value: '92+',     subtitle: '算法分类',  icon: 'cube',  color: '#a855f7' },
    { topPct: 50, label: 'ROADMAP',  value: '学习路径', subtitle: null,        icon: 'flag',  color: '#38bdf8' },
    { topPct: 78, label: 'PROJECTS', value: '实践项目', subtitle: null,        icon: 'box',   color: '#14b8a6' },
  ]
  const rightItems = [
    { topPct: 32, label: 'INTERVIEW', value: 'offer',  subtitle: '面试指南',   icon: 'user',   color: '#f59e0b' },
    { topPct: 60, label: 'TOOLBOX',   value: 'JSON',   subtitle: '开发工具箱', icon: 'wrench', color: '#60a5fa' },
    { topPct: 86, label: 'AI',        value: 'pilot',  subtitle: 'AI 助手',    icon: 'ai',     color: '#f472b6' },
  ]

  return (
    <div className="frame-edge-decor" aria-hidden="true" style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 2,
      overflow: 'hidden',
    }}>
      <EdgeRail side="left" items={leftItems} />
      <EdgeRail side="right" items={rightItems} />
    </div>
  )
}

function EdgeRail({ side, items }) {
  const isLeft = side === 'left'

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      [isLeft ? 'left' : 'right']: 0,
      width: 260,
      overflow: 'hidden',
    }}>
      <svg viewBox="0 0 248 780" preserveAspectRatio="none" style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.22,
        transform: isLeft ? 'none' : 'scaleX(-1)',
        maskImage: isLeft ? 'linear-gradient(to right, black 42%, transparent 100%)' : 'linear-gradient(to left, black 42%, transparent 100%)',
        WebkitMaskImage: isLeft ? 'linear-gradient(to right, black 42%, transparent 100%)' : 'linear-gradient(to left, black 42%, transparent 100%)',
      }} fill="none">
        <defs>
          <linearGradient id={`edgeRailPath-${side}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.20" />
            <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <path d="M22 86 C90 134 72 218 140 266 S128 422 198 494 S152 630 218 712" stroke={`url(#edgeRailPath-${side})`} strokeWidth="1.2" strokeDasharray="8 14" />
        <path d="M14 240 H86 L138 188 M40 406 H130 L182 354 M26 602 H106 L166 648" stroke={`url(#edgeRailPath-${side})`} strokeWidth="1" />
      </svg>
      {items.map((item, index) => (
        <EdgeBadge key={`${side}-${item.label}`} {...item} index={index} isLeft={isLeft} />
      ))}
    </div>
  )
}

function EdgeBadge({ topPct, label, value, subtitle, icon, color, index, isLeft }) {
  const rotations = isLeft ? [-2.5, 2.0, -1.6] : [2.4, -1.8, 1.6]
  const rotation = rotations[index % rotations.length]
  const anchor = isLeft ? 'left' : 'right'

  return (
    <div style={{
      position: 'absolute',
      top: `${topPct}%`,
      [anchor]: 8,
      width: 252,
      transform: `translateY(-50%) rotate(${rotation}deg)`,
    }}>
      <div
        className="edge-badge-float"
        style={{
          animationDelay: `${index * -1.6}s`,
          animationDuration: `${7.4 + index * 0.7}s`,
        }}
      >
        <div style={{
          position: 'relative',
          minHeight: 132,
          padding: '18px 20px 16px',
          borderRadius: 24,
          background: [
            `linear-gradient(140deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.075) 48%, rgba(255,255,255,0.03) 100%)`,
            `linear-gradient(140deg, ${color}18 0%, transparent 72%)`,
          ].join(', '),
          border: `1px solid ${color}24`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
          backdropFilter: 'blur(18px) saturate(150%)',
          WebkitBackdropFilter: 'blur(18px) saturate(150%)',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 10,
            position: 'relative',
            marginBottom: 14,
          }}>
            <div style={{
              fontSize: 10.5,
              fontWeight: 900,
              letterSpacing: '0.18em',
              fontFamily: 'var(--font-mono)',
              color,
              paddingTop: 8,
            }}>{label}</div>
            <IconTile icon={icon} color={color} />
          </div>

          <div style={{
            position: 'relative',
            fontSize: value.length > 4 ? 24 : 30,
            lineHeight: 1.05,
            fontWeight: 900,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            textShadow: `0 0 22px ${color}22`,
          }}>{value}</div>

          {subtitle && (
            <div style={{
              position: 'relative',
              marginTop: 4,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}>{subtitle}</div>
          )}

          <svg
            viewBox="0 0 220 36"
            preserveAspectRatio="none"
            aria-hidden
            style={{
              position: 'absolute',
              left: 14,
              right: 14,
              bottom: 10,
              width: 'calc(100% - 28px)',
              height: 32,
              opacity: 0.35,
              transform: isLeft ? 'none' : 'scaleX(-1)',
            }}
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 28 C28 8 60 30 92 14 S160 22 216 8" />
            <circle cx="92" cy="14" r="2.6" fill={color} />
          </svg>

          <div
            className="edge-badge-sheen"
            style={{
              background: `linear-gradient(115deg, transparent 20%, ${color}26 46%, rgba(255,255,255,0.36) 50%, transparent 74%)`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

function IconTile({ icon, color }) {
  return (
    <span style={{
      position: 'relative',
      flexShrink: 0,
      width: 46,
      height: 46,
      borderRadius: 14,
      background: `linear-gradient(135deg, ${color}38, ${color}14)`,
      border: `1px solid ${color}48`,
      boxShadow: `0 8px 18px ${color}26, inset 0 1px 0 rgba(255,255,255,0.3)`,
      display: 'grid',
      placeItems: 'center',
      color,
    }}>
      <IconGlyph name={icon} color={color} />
    </span>
  )
}

function IconGlyph({ name, color }) {
  const common = { width: 22, height: 22, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'cube':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 2.5 L21 7.5 V16.5 L12 21.5 L3 16.5 V7.5 Z" />
          <path d="M12 2.5 L12 12 L21 7.5" />
          <path d="M3 7.5 L12 12" />
        </svg>
      )
    case 'flag':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <line x1="6" y1="3" x2="6" y2="21" />
          <path d="M6 4 H17 L14 8 L17 12 H6" fill={`${color}55`} />
        </svg>
      )
    case 'box':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M3 7 L12 3 L21 7 L21 17 L12 21 L3 17 Z" />
          <line x1="3" y1="7" x2="12" y2="11" />
          <line x1="21" y1="7" x2="12" y2="11" />
          <line x1="12" y1="11" x2="12" y2="21" />
        </svg>
      )
    case 'user':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <circle cx="12" cy="9" r="3.5" />
          <path d="M5 20 C5 15.5 8.5 13 12 13 S19 15.5 19 20" />
        </svg>
      )
    case 'wrench':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M14.7 6.3a4 4 0 1 0-5.4 5.4l-6 6 2.3 2.3 6-6a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.3-2.3 2.3-2.3z" />
        </svg>
      )
    case 'ai':
      return (
        <span style={{
          fontSize: 11.5,
          fontWeight: 900,
          letterSpacing: '0.04em',
          fontFamily: 'var(--font-mono)',
          color: '#fff',
          background: `linear-gradient(135deg, ${color}, ${color}cc)`,
          padding: '4px 8px',
          borderRadius: 8,
          boxShadow: `0 6px 14px ${color}55`,
        }}>AI</span>
      )
    default:
      return null
  }
}
