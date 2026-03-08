import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SignOutButton } from "@/components/sign-out-button"
import { LeaderboardTabs } from "@/components/leaderboard-tabs"
import { Fire } from "@phosphor-icons/react/dist/ssr"

export default async function PainelPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect("/login")

  const userId = session.user.id
  const user = session.user

  const totalApproved = await prisma.question.count({
    where: { status: "approved" },
  })

  const userAnswers = await prisma.userAnswer.findMany({
    where: { userId },
    select: { isCorrect: true, answeredAt: true },
  })

  const answeredCount = userAnswers.length
  const correctCount = userAnswers.filter((a) => a.isCorrect).length
  const accuracyPct =
    answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0
  const remaining = totalApproved - answeredCount
  const percentage =
    totalApproved > 0 ? Math.round((answeredCount / totalApproved) * 100) : 0

  // Streak calculation (consecutive days, resets at midnight)
  const answerDates = [
    ...new Set(userAnswers.map((a) => a.answeredAt.toISOString().slice(0, 10))),
  ].sort((a, b) => b.localeCompare(a)) // newest first

  let streak = 0
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const yesterdayStr = new Date(now.getTime() - 86400000)
    .toISOString()
    .slice(0, 10)

  if (answerDates[0] === todayStr || answerDates[0] === yesterdayStr) {
    streak = 1
    for (let i = 1; i < answerDates.length; i++) {
      const prev = new Date(answerDates[i - 1])
      const curr = new Date(answerDates[i])
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000)
      if (diffDays === 1) {
        streak++
      } else {
        break
      }
    }
  }

  const examDate = new Date("2026-06-01")
  const today = new Date()
  const daysRemaining = Math.max(
    1,
    Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  )
  const perDay = Math.round((remaining / daysRemaining) * 10) / 10

  // Chapters with progress
  const chapters = await prisma.chapter.findMany({
    orderBy: { number: "asc" },
    include: {
      chapterSubtopics: {
        include: {
          questions: {
            where: { status: "approved" },
            include: {
              userAnswers: { where: { userId } },
            },
          },
        },
      },
    },
  })

  const chapterProgress = chapters.map((ch) => {
    const totalQ = ch.chapterSubtopics.flatMap((cs) => cs.questions).length
    const answeredQ = ch.chapterSubtopics
      .flatMap((cs) => cs.questions)
      .filter((q) => q.userAnswers.length > 0).length
    return {
      number: ch.number,
      title: ch.title,
      part: ch.part,
      total: totalQ,
      answered: answeredQ,
      percentage: totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0,
    }
  })

  // Subtopics with progress
  const subtopics = await prisma.subtopic.findMany({
    orderBy: { code: "asc" },
    include: {
      chapterSubtopics: {
        include: {
          questions: {
            where: { status: "approved" },
            include: {
              userAnswers: { where: { userId } },
            },
          },
        },
      },
    },
  })

  const subtopicProgress = subtopics.map((st) => {
    const totalQ = st.chapterSubtopics.flatMap((cs) => cs.questions).length
    const answeredQ = st.chapterSubtopics
      .flatMap((cs) => cs.questions)
      .filter((q) => q.userAnswers.length > 0).length
    return {
      code: st.code,
      name: st.name,
      total: totalQ,
      answered: answeredQ,
      percentage: totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0,
    }
  })

  const parts = [1, 2, 3] as const

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Profile header */}
      <div className="mb-8 flex items-center gap-4">
        {user.image ? (
          <img
            src={user.image}
            alt=""
            className="size-12 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            {user.name?.[0] ?? "?"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{user.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <span className="text-2xl font-bold">{answeredCount}</span>
          <p className="mt-1 text-xs text-muted-foreground">respondidas</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <span className="text-2xl font-bold">{remaining}</span>
          <p className="mt-1 text-xs text-muted-foreground">inéditas</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <span className="text-2xl font-bold">{accuracyPct}%</span>
          <p className="mt-1 text-xs text-muted-foreground">acerto</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <Fire className="size-5 text-primary" weight="fill" />
            <span className="text-2xl font-bold">{streak}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {streak === 1 ? "dia seguido" : "dias seguidos"}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-10 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Seu progresso</h2>

        <div className="mb-2 flex items-end gap-2">
          <span className="text-3xl font-bold">{answeredCount}</span>
          <span className="mb-1 text-muted-foreground">de {totalApproved}</span>
          <span className="mb-1 ml-auto text-sm text-muted-foreground">
            {percentage}%
          </span>
        </div>

        <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span>Faltam {remaining} questões</span>
          <span>~{perDay} questões/dia até 1 de junho</span>
          <span>{daysRemaining} dias restantes</span>
        </div>

        <div className="mt-4">
          <Button asChild>
            <Link href="/painel/sessao/aleatoria">
              Batelada aleatória (10 questões)
            </Link>
          </Button>
        </div>
      </div>

      {/* Leaderboards */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Ranking</h2>
        <LeaderboardTabs currentUserId={userId} />
      </div>

      {/* Chapters by part */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Por capítulo</h2>
        {parts.map((part) => (
          <div key={part} className="mb-6">
            <h3 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Parte {part}
            </h3>
            <div className="flex flex-col gap-1">
              {chapterProgress
                .filter((ch) => ch.part === part)
                .map((ch) => (
                  <Link
                    key={ch.number}
                    href={`/painel/capitulo/${ch.number}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted"
                  >
                    <span className="w-6 text-right text-xs text-muted-foreground">
                      {ch.number}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {ch.title}
                    </span>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${ch.percentage}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-xs text-muted-foreground">
                      {ch.answered}/{ch.total}
                    </span>
                    {ch.percentage === 100 && (
                      <span className="text-xs text-correct">✓</span>
                    )}
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Subtopics */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Por subtópico</h2>
        <div className="flex flex-col gap-1">
          {subtopicProgress.map((st) => (
            <Link
              key={st.code}
              href={`/painel/sessao/subtopico-${st.code}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted"
            >
              <span className="w-6 text-xs font-medium text-primary">
                {st.code}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{st.name}</span>
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${st.percentage}%` }}
                />
              </div>
              <span className="w-16 text-right text-xs text-muted-foreground">
                {st.answered}/{st.total}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
