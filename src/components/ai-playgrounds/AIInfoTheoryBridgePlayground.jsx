import { useEffect, useState } from 'react'
import AlgorithmPlaygroundFor from '../learning/AlgorithmPlaygroundFor'
import { loadAlgorithmDetail } from '../../data/algorithmDetails'

export default function AIInfoTheoryBridgePlayground({ lesson }) {
  const slug = lesson?.algorithmSlug || lesson?.id
  const [algo, setAlgo] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setAlgo(null)
    setError(null)
    loadAlgorithmDetail(slug)
      .then(detail => {
        if (!cancelled) setAlgo(detail)
      })
      .catch(err => {
        if (!cancelled) setError(err)
      })
    return () => { cancelled = true }
  }, [slug])

  if (error) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
        信息论可视化加载失败：{error.message || String(error)}
      </div>
    )
  }

  if (!algo) {
    return <div className="h-64 rounded-xl border border-border-soft bg-surface animate-pulse" aria-busy="true" />
  }

  return <AlgorithmPlaygroundFor algo={algo} />
}
