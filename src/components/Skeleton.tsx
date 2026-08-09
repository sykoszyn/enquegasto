export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gradient-to-r from-bg-raised via-bg-border to-bg-raised bg-[length:200%_100%] ${className}`}
      style={{ animation: 'shimmer 1.6s ease-in-out infinite' }}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <SkeletonBlock className="h-40 w-full rounded-3xl" />
      <div className="mt-4 grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <SkeletonBlock className="h-72 w-full" />
          <SkeletonBlock className="h-56 w-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function CardsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <SkeletonBlock className="h-8 w-40" />
      <SkeletonBlock className="mt-5 h-24 w-full rounded-2xl" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        <SkeletonBlock className="h-64 w-full" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
