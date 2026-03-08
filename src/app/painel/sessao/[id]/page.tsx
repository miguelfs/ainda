import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { PaidQuestionsFlow } from "./flow"

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) redirect("/login")

  const { id } = await params
  const userId = session.user.id

  let questions

  if (id === "aleatoria") {
    // Random batch: fetch more than needed, then pick 10 randomly via SQL
    questions = await prisma.$queryRawUnsafe<
      Awaited<ReturnType<typeof prisma.question.findMany>>
    >(
      `SELECT q.* FROM questions q
       LEFT JOIN user_answers ua ON ua.question_id = q.id AND ua.user_id = $1
       WHERE q.status = 'approved' AND ua.id IS NULL
       ORDER BY random()
       LIMIT 10`,
      userId
    )

    // Re-fetch with includes since raw query doesn't support them
    const ids = questions.map((q) => q.id)
    questions = await prisma.question.findMany({
      where: { id: { in: ids } },
      include: {
        chapterSubtopic: {
          include: {
            chapter: true,
            subtopic: true,
          },
        },
      },
    })
  } else if (id.startsWith("capitulo-")) {
    const chapterNumber = parseInt(id.replace("capitulo-", ""), 10)

    questions = await prisma.question.findMany({
      where: {
        status: "approved",
        chapterSubtopic: { chapter: { number: chapterNumber } },
        userAnswers: { none: { userId } },
      },
      include: {
        chapterSubtopic: {
          include: {
            chapter: true,
            subtopic: true,
          },
        },
      },
      orderBy: [
        { chapterSubtopic: { subtopicId: "asc" } },
        { questionNumber: "asc" },
      ],
    })
  } else if (id.startsWith("subtopico-")) {
    const subtopicCode = id.replace("subtopico-", "")

    questions = await prisma.question.findMany({
      where: {
        status: "approved",
        chapterSubtopic: { subtopic: { code: subtopicCode } },
        userAnswers: { none: { userId } },
      },
      include: {
        chapterSubtopic: {
          include: {
            chapter: true,
            subtopic: true,
          },
        },
      },
      orderBy: [
        { chapterSubtopic: { chapterId: "asc" } },
        { questionNumber: "asc" },
      ],
    })
  } else {
    redirect("/painel")
  }

  const mapped = questions.map((q) => ({
    id: q.id,
    stemQuote: q.stemQuote,
    stemQuotePage: q.stemQuotePage,
    stemContext: q.stemContext,
    stemQuestion: q.stemQuestion,
    altA: q.altA,
    altB: q.altB,
    altC: q.altC,
    altD: q.altD,
    correctAnswer: q.correctAnswer as "A" | "B" | "C" | "D",
    explanation: q.explanation,
    chapterTitle: q.chapterSubtopic.chapter.title,
    chapterNumber: q.chapterSubtopic.chapter.number,
    subtopicName: q.chapterSubtopic.subtopic.name,
  }))

  return <PaidQuestionsFlow questions={mapped} />
}
