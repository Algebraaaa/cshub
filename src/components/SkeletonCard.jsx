// Skeleton loading placeholder — uses Tailwind animate-pulse

function SkeletonBlock({ className = '' }) {
  return <div className={`bg-surface-mid rounded animate-pulse ${className}`} />
}

/** Full algorithm page skeleton */
export function AlgorithmPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 py-6 px-2">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-8 w-64" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-5 w-16 rounded-full" />
          <SkeletonBlock className="h-5 w-20 rounded-full" />
          <SkeletonBlock className="h-5 w-16 rounded-full" />
        </div>
      </div>

      {/* Complexity cards */}
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="glass-card p-4 flex flex-col gap-2">
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-6 w-20" />
          </div>
        ))}
      </div>

      {/* Visualization area */}
      <div className="glass-card p-0 overflow-hidden">
        <SkeletonBlock className="h-64 w-full rounded-none" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <SkeletonBlock key={i} className="h-8 w-16 rounded-full" />
        ))}
      </div>

      {/* Content lines */}
      <div className="flex flex-col gap-3">
        {[100, 90, 95, 75, 88, 60].map((w, i) => (
          <SkeletonBlock key={i} className="h-3" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  )
}

/** Generic card skeleton for lists */
export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="glass-card-sm p-4 flex flex-col gap-3">
      <SkeletonBlock className="h-5 w-40" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock key={i} className="h-3" style={{ width: `${85 - i * 10}%` }} />
      ))}
    </div>
  )
}

export default AlgorithmPageSkeleton
