import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/ielts', label: '首页', end: true },
  { to: '/ielts/reading', label: '阅读复盘' },
  { to: '/ielts/listening', label: '听力复盘' },
  { to: '/ielts/mistakes', label: '错题库' },
  { to: '/ielts/sets', label: '整套报告' },
  { to: '/ielts/writing', label: '写作训练' },
  { to: '/ielts/speaking', label: '口语训练' },
  { to: '/ielts/vocab', label: '词块库' },
  { to: '/ielts/settings', label: '设置' },
]

export default function IeltsNav() {
  return (
    <nav className="sticky top-0 z-20 -mx-2 mb-5 overflow-x-auto border-b border-border-soft bg-bg/85 px-2 py-2 backdrop-blur">
      <div className="flex min-w-max gap-1">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                isActive
                  ? 'bg-accent-soft text-accent border border-accent-border'
                  : 'text-fg-muted hover:bg-surface border border-transparent'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
