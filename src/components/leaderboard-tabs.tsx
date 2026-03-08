"use client"

import { useState, useEffect } from "react"

type LeaderEntry = {
  userId: string
  name: string
  image: string | null
  total: number
  correct: number
  accuracy: number
}

type Period = "day" | "week" | "month" | "always"

const PERIOD_LABELS: Record<Period, string> = {
  day: "Hoje",
  week: "Semana",
  month: "Mês",
  always: "Sempre",
}

export function LeaderboardTabs({ currentUserId }: { currentUserId: string }) {
  const [period, setPeriod] = useState<Period>("always")
  const [data, setData] = useState<{
    mostSolved: LeaderEntry[]
    highestAccuracy: LeaderEntry[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/leaderboard?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setData(d)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [period])

  return (
    <div>
      {/* Period tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-muted p-1">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              period === p
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="size-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Most solved */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Mais questões resolvidas
            </h3>
            {data?.mostSolved.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum dado ainda
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {data?.mostSolved.map((entry, i) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                      entry.userId === currentUserId ? "bg-primary/10" : ""
                    }`}
                  >
                    <span className="w-5 text-right text-xs font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                    {entry.image ? (
                      <img
                        src={entry.image}
                        alt=""
                        className="size-6 rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        {entry.name[0]}
                      </div>
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {entry.name}
                    </span>
                    <span className="text-sm font-semibold">{entry.total}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Highest accuracy */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Maior taxa de acerto
            </h3>
            {data?.highestAccuracy.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Mínimo 10 questões
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {data?.highestAccuracy.map((entry, i) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                      entry.userId === currentUserId ? "bg-primary/10" : ""
                    }`}
                  >
                    <span className="w-5 text-right text-xs font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                    {entry.image ? (
                      <img
                        src={entry.image}
                        alt=""
                        className="size-6 rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        {entry.name[0]}
                      </div>
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {entry.name}
                    </span>
                    <span className="text-sm font-semibold">
                      {entry.accuracy}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
