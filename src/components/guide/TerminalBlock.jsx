import { useState } from 'react'

/**
 * 仿终端命令展示块
 * props:
 *   commands: [{ cmd, comment, output }]
 *   title: string (e.g. "bash", "Terminal")
 *   language: 'bash' | 'git'
 */
export default function TerminalBlock({ commands, title = 'Terminal', showTitle = true }) {
  const [copied, setCopied] = useState(false)

  const allText = commands.map(c => c.cmd).join('\n')

  function copyAll() {
    navigator.clipboard.writeText(allText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      overflow: 'hidden',
      margin: '16px 0',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      {/* Title bar */}
      {showTitle && (
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '10px 16px',
          background: '#161b22',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          gap: 8,
        }}>
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
              <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <span style={{
            flex: 1, textAlign: 'center',
            fontSize: 11, color: 'rgba(255,255,255,0.35)',
            fontFamily: 'var(--font-mono)', fontWeight: 500,
          }}>
            {title}
          </span>
          <button onClick={copyAll} style={{
            fontSize: 11, padding: '3px 10px',
            color: copied ? '#28c840' : 'rgba(255,255,255,0.4)',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 5,
            fontFamily: 'var(--font-mono)',
            transition: 'all 0.18s',
          }}>
            {copied ? '✓ 已复制' : '复制全部'}
          </button>
        </div>
      )}

      {/* Commands */}
      <div style={{ padding: '16px', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        {commands.map((item, i) => (
          <div key={i} style={{ marginBottom: i < commands.length - 1 ? 12 : 0 }}>
            {/* Comment */}
            {item.comment && (
              <div style={{ color: '#6e7681', fontSize: 12, marginBottom: 4 }}>
                {item.comment}
              </div>
            )}
            {/* Command line */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ color: '#7c3aed', flexShrink: 0, userSelect: 'none', marginTop: 1 }}>$</span>
              <span style={{ color: '#e6edf3', lineHeight: 1.6 }}>
                {highlightGit(item.cmd)}
              </span>
            </div>
            {/* Output */}
            {item.output && (
              <div style={{
                marginTop: 6, paddingLeft: 16,
                borderLeft: '2px solid rgba(255,255,255,0.08)',
                color: '#848d97',
                fontSize: 12,
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}>
                {item.output}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Simple bash/git syntax highlighter (returns JSX spans)
function highlightGit(cmd) {
  const GIT_CMDS = ['git', 'cd', 'mkdir', 'ls', 'cp', 'mv', 'rm', 'echo', 'cat', 'touch', 'code', 'npm', 'npx', 'node', 'ssh-keygen', 'ssh', 'curl']
  const GIT_SUB = ['init', 'clone', 'add', 'commit', 'push', 'pull', 'fetch', 'merge', 'branch', 'checkout', 'switch', 'status', 'log', 'diff', 'remote', 'config', 'stash', 'rebase', 'reset', 'tag']
  const parts = cmd.split(' ')
  return parts.map((part, i) => {
    let color = '#e6edf3'
    if (i === 0 && GIT_CMDS.includes(part)) color = '#79c0ff'
    else if (i === 1 && GIT_SUB.includes(part)) color = '#7ee787'
    else if (part.startsWith('-')) color = '#ffa657'
    else if (part.startsWith('"') || part.startsWith("'")) color = '#a5d6ff'
    return (
      <span key={i} style={{ color }}>
        {part}{i < parts.length - 1 ? ' ' : ''}
      </span>
    )
  })
}
