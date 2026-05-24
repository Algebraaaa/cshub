export function escapeHtml(value) {
  return String(value).replace(/[&<>]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
  }[char]))
}

export function isSafeHttpUrl(url) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function renderLimitedMarkdown(src) {
  let html = escapeHtml(src)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.9em;">$1</code>')
  html = html.replace(/\[(.+?)\]\(([^)\s]+)\)/g, (match, text, url) => {
    if (!isSafeHttpUrl(url)) return text
    return `<a href="${url}" target="_blank" rel="noreferrer" style="color: var(--accent-light); text-decoration: underline;">${text}</a>`
  })
  html = html.replace(/(^- .+(?:\n- .+)*)/gm, (block) => {
    const items = block.split('\n').map(l => l.replace(/^- /, '')).map(i => `<li>${i}</li>`).join('')
    return `<ul style="padding-left: 20px; margin: 8px 0;">${items}</ul>`
  })
  html = html.replace(/\n\n/g, '</p><p>')
  return `<p>${html}</p>`
}
