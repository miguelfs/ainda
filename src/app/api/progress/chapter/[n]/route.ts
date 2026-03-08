import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ n: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { n } = await params
  const chapterNumber = parseInt(n, 10)

  const chapter = await prisma.chapter.findUnique({
    where: { number: chapterNumber },
  })

  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
  }

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
        where: { userId: session.user.id },
      },
    },
    orderBy: [
      { chapterSubtopic: { subtopicId: "asc" } },
      { questionNumber: "asc" },
    ],
  })

  const mapped = questions.map((q) => ({
    id: q.id,
    stemQuestion: q.stemQuestion,
    subtopicCode: q.chapterSubtopic.subtopic.code,
    subtopicName: q.chapterSubtopic.subtopic.name,
    answered: q.userAnswers.length > 0,
    isCorrect: q.userAnswers[0]?.isCorrect ?? null,
  }))

  return NextResponse.json({
    chapter: { number: chapter.number, title: chapter.title },
    questions: mapped,
  })
}
