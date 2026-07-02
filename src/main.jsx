import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import 'katex/dist/katex.min.css'
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
