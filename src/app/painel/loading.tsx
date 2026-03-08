export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-4 py-8 sm:px-6">
      {/* Progress card skeleton */}
      <div className="mb-10 rounded-xl border border-border bg-card p-6">
        <div className="mb-4 h-5 w-32 rounded bg-muted" />
        <div className="mb-2 flex items-end gap-2">
          <div className="h-8 w-16 rounded bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
        <div className="mb-4 h-2 rounded-full bg-muted" />
        <div className="flex gap-4">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-4 w-40 rounded bg-muted" />
        </div>
        <div className="mt-4 h-9 w-56 rounded-lg bg-muted" />
      </div>

      {/* Chapters skeleton */}
      <div className="mb-10">
        <div className="mb-4 h-5 w-28 rounded bg-muted" />
        <div className="flex flex-col gap-1">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <div className="h-3 w-6 rounded bg-muted" />
              <div className="h-4 flex-1 rounded bg-muted" />
              <div className="h-1.5 w-20 rounded-full bg-muted" />
              <div className="h-3 w-10 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
