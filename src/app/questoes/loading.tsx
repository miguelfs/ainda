export default function Loading() {
  return (
    <div className="min-h-svh px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-2xl animate-pulse">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-1.5 flex-1 rounded-full bg-muted" />
        </div>
        <div className="mb-4 h-3 w-48 rounded bg-muted" />
        <div className="mb-4 space-y-2 border-l-2 border-muted pl-4">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>
        <div className="mb-6 space-y-2">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
        </div>
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}
