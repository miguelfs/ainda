import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { questionId, selected } = body as {
    questionId: number
    selected: "A" | "B" | "C" | "D"
  }

  if (!questionId || !selected) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  })

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 })
  }

  const isCorrect = question.correctAnswer === selected

  const answer = await prisma.userAnswer.upsert({
    where: {
      userId_questionId: {
        userId: session.user.id,
        questionId,
      },
    },
    update: { selected, isCorrect },
    create: {
      userId: session.user.id,
      questionId,
      selected,
      isCorrect,
    },
  })

  return NextResponse.json({ isCorrect, answerId: answer.id })
}
