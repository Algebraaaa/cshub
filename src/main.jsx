import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
// katex.css 改由 index.css 以 @import layer(base) 引入，保证可被 components 层覆盖
import './index.css'
import App from './App.jsx'
import { initMonitoring } from './lib/monitoring.js'

// 必须在 createRoot 之前挂全局监听,才能兜住 AppProviders / 首屏 lazy chunk 的加载失败
initMonitoring()

const AppProviders = lazy(() => import('./AppProviders.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>
      <AppProviders>
        <App />
      </AppProviders>
    </Suspense>
  </StrictMode>,
)
