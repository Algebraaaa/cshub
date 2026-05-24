import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-32 text-center px-4">
      <div className="text-8xl font-black text-fg-faint select-none">404</div>
      <div>
        <p className="text-fg font-semibold text-2xl mb-2">找不到该页面</p>
        <p className="text-fg-muted text-sm">你访问的路径不存在，可能已被移动或删除。</p>
      </div>
      <div className="flex gap-3 mt-2">
        <Link to="/" className="btn-primary">返回首页</Link>
        <Link to="/learn" className="btn-ghost">算法库</Link>
      </div>
    </div>
  )
}
