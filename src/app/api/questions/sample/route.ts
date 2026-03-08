import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const questions = await prisma.question.findMany({
    where: { status: "approved" },
    orderBy: { id: "asc" },
    take: 12,
    include: {
      chapterSubtopic: {
        include: {
          chapter: { select: { number: true, title: true } },
          subtopic: { select: { name: true } },
        },
      },
    },
  })

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
    correctAnswer: q.correctAnswer,
    chapterNumber: q.chapterSubtopic.chapter.number,
    chapterTitle: q.chapterSubtopic.chapter.title,
    subtopicName: q.chapterSubtopic.subtopic.name,
  }))

  return NextResponse.json(mapped)
}
