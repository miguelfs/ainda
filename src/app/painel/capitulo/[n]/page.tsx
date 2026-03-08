import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, X, Minus } from "@phosphor-icons/react/dist/ssr"

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ n: string }>
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) redirect("/login")

  const { n } = await params
  const chapterNumber = parseInt(n, 10)
  const userId = session.user.id

  const chapter = await prisma.chapter.findUnique({
    where: { number: chapterNumber },
  })

  if (!chapter) notFound()

  const questions = await prisma.question.findMany({
    where: {
      status: "approved",
      chapterSubtopic: { chapterId: chapter.id },
    },
    include: {
      chapterSubtopic: {
        include: { subtopic: true },
      },
      userAnswers: {
        where: { userId },
      },
    },
    orderBy: [
      { chapterSubtopic: { subtopicId: "asc" } },
      { questionNumber: "asc" },
    ],
  })

  // Group by subtopic
  const grouped: Record<
    string,
    { code: string; name: string; questions: typeof questions }
  > = {}

  for (const q of questions) {
    const code = q.chapterSubtopic.subtopic.code
    if (!grouped[code]) {
      grouped[code] = {
        code,
        name: q.chapterSubtopic.subtopic.name,
        questions: [],
      }
    }
    grouped[code].questions.push(q)
  }

  const total = questions.length
  const answered = questions.filter((q) => q.userAnswers.length > 0).length
  const pending = total - answered

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/painel"
        className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Voltar ao painel
      </Link>

      <h1 className="mb-1 text-2xl font-semibold">
        Capítulo {chapter.number} — {chapter.title}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {answered} de {total} questões respondidas · {pending} pendentes
      </p>

      {pending > 0 && (
        <div className="mb-8">
          <Button asChild>
            <Link href={`/painel/sessao/capitulo-${chapter.number}`}>
              Fazer {pending} pendentes deste capítulo
            </Link>
          </Button>
        </div>
      )}

      {Object.values(grouped).map((group) => (
        <div key={group.code} className="mb-8">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            <span className="text-primary">{group.code}</span> {group.name}
          </h2>
          <div className="flex flex-col gap-2">
            {group.questions.map((q) => {
              const answer = q.userAnswers[0]
              return (
                <div
                  key={q.id}
                  className="flex items-start gap-3 rounded-lg border border-border px-4 py-3"
                >
                  <div className="mt-0.5">
                    {!answer && (
                      <Minus className="size-4 text-muted-foreground" />
                    )}
                    {answer?.isCorrect && (
                      <Check className="size-4 text-correct" weight="bold" />
                    )}
                    {answer && !answer.isCorrect && (
                      <X className="size-4 text-incorrect" weight="bold" />
                    )}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed">
                    {q.stemQuestion}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
