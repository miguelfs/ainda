import { prisma } from "@/lib/prisma"
import { FreeQuestionsFlow } from "./flow"

export const dynamic = "force-dynamic"

export default async function QuestoesPage() {
  const questions = await prisma.question.findMany({
    where: { status: "approved" },
    orderBy: { id: "asc" },
    take: 12,
    include: {
      chapterSubtopic: {
        include: {
          chapter: true,
          subtopic: true,
        },
      },
    },
  })

  const totalApproved = await prisma.question.count({
    where: { status: "approved" },
  })

  const paidUserCount = await prisma.user.count({
    where: { isPaid: true },
  })

  const earlyAccessSpots = Math.max(0, 100 - paidUserCount)

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
  }))

  return (
    <FreeQuestionsFlow
      questions={mapped}
      totalApproved={totalApproved}
      earlyAccessSpots={earlyAccessSpots}
    />
  )
}
