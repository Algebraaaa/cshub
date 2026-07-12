import { useIsPhone } from '../../hooks/useMediaQuery'
import { hoverHandlers, hoverHandlersIf } from '../../utils/hoverStyle'

export function Toolbar({ children }) {
  const isPhone = useIsPhone()
  return (
    <div
      className="playground-toolbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: isPhone ? 4 : 6,
        marginBottom: 12,
        flexWrap: 'wrap',
        padding: isPhone ? '6px 8px' : '8px 10px',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shine)',
        borderRadius: 'var(--r-md)',
      }}>
      {children}
    </div>
  )
}

export function ToolbarBtn({ children, onClick, active }) {
  const isPhone = useIsPhone()
  return (
    <button
      onClick={onClick}
      style={{
        // 手机端拉高至 36 满足触摸目标 (>=32)，桌面保持 28
        minHeight: isPhone ? 36 : undefined,
        padding: isPhone ? '7px 14px' : '5px 13px',
        borderRadius: 'var(--r-sm)',
        fontSize: 12.5,
        fontWeight: 600,
        background: active ? 'var(--accent-soft)' : 'var(--glass-bg-mid)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: `1px solid ${active ? 'var(--accent-border)' : 'var(--glass-border)'}`,
        boxShadow: active ? 'var(--glass-shine), 0 0 12px var(--accent-soft)' : 'var(--glass-shine)',
        color: active ? 'var(--accent-light)' : 'var(--text-secondary)',
        transition: 'all 0.15s',
        letterSpacing: '-0.01em',
        WebkitTapHighlightColor: 'transparent',
      }}
      {...hoverHandlersIf(active, {
        background: 'var(--glass-bg-strong)',
        color: 'var(--text-primary)',
      }, {
        background: 'var(--glass-bg-mid)',
        color: 'var(--text-secondary)',
      })}
    >
      {children}
    </button>
  )
}

export function TextInput({ value, onChange, placeholder, onSubmit, submitLabel = '应用', width = 220 }) {
  const isPhone = useIsPhone()
  return (
    <div style={{
      display: 'flex',
      gap: 6,
      // 手机端整组占满工具栏剩余宽度，避免 220px 固定宽度溢出
      flex: isPhone ? '1 1 100%' : '0 1 auto',
      minWidth: 0,
    }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={e => { if (e.key === 'Enter') onSubmit() }}
        style={{
          // 桌面保持原 width；手机端用 flex 撑满，但永远不超过容器
          width: isPhone ? '100%' : width,
          flex: isPhone ? 1 : undefined,
          minWidth: 0,
          padding: isPhone ? '7px 11px' : '5px 10px',
          borderRadius: 'var(--r-sm)',
          border: '1px solid var(--glass-border)',
          background: 'var(--glass-bg-mid)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          color: 'var(--text-primary)',
          fontSize: 12.5,
          fontFamily: 'var(--font-mono)',
        }}
      />
      <button
        onClick={onSubmit}
        style={{
          minHeight: isPhone ? 36 : undefined,
          padding: isPhone ? '7px 14px' : '5px 13px',
          borderRadius: 'var(--r-sm)',
          fontSize: 12.5, fontWeight: 600,
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent-border)',
          boxShadow: '0 0 12px var(--accent-soft)',
          color: 'var(--accent-light)',
          transition: 'all 0.15s',
          flexShrink: 0,
          whiteSpace: 'nowrap',
          WebkitTapHighlightColor: 'transparent',
        }}
        {...hoverHandlers(
          { background: 'var(--accent-dim)', color: 'white' },
          { background: 'var(--accent-soft)', color: 'var(--accent-light)' },
        )}
      >
        {submitLabel}
      </button>
    </div>
  )
}

export function Legend({ items }) {
  // 无障碍：item 可带 symbol（非颜色通道）。红绿色盲无法区分红/绿状态时，
  // 符号(◇比较 / ⇄交换 / ✓完成 等)提供冗余线索。不传 symbol 则退回纯色点，
  // 完全向后兼容。
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', padding: '8px 14px' }}>
      {items.map(({ color, label, symbol }) => (
        <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-secondary)' }}>
          {symbol ? (
            <span aria-hidden style={{
              width: 13, textAlign: 'center', flexShrink: 0,
              fontSize: 12, fontWeight: 800, lineHeight: 1,
              color, textShadow: `0 0 6px ${color}`,
            }}>{symbol}</span>
          ) : (
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0, boxShadow: `0 0 6px ${color}` }} />
          )}
          {label}
        </span>
      ))}
    </div>
  )
}
