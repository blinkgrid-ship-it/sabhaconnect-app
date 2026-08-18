/** Suspense fallback for a lazy-loaded route — keeps first paint to shell + this, never a blank screen. */
export function ScreenSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse" aria-hidden="true" aria-busy="true">
      <div className="h-7 w-40 rounded bg-mist" />
      <div className="mt-2 h-4 w-24 rounded bg-mist" />
      <div className="card mt-6 space-y-3 p-6">
        <div className="h-4 w-full rounded bg-mist" />
        <div className="h-4 w-5/6 rounded bg-mist" />
        <div className="h-4 w-2/3 rounded bg-mist" />
      </div>
      <div className="card mt-4 space-y-3 p-6">
        <div className="h-4 w-full rounded bg-mist" />
        <div className="h-4 w-4/5 rounded bg-mist" />
      </div>
    </div>
  )
}
