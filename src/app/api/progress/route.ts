import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const totalApproved = await prisma.question.count({
    where: { status: "approved" },
  })

  const answeredCount = await prisma.userAnswer.count({
    where: { userId: session.user.id },
  })

  const correctCount = await prisma.userAnswer.count({
    where: { userId: session.user.id, isCorrect: true },
  })

  const examDate = new Date("2026-06-01")
  const today = new Date()
  const daysRemaining = Math.max(
    1,
    Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  )
  const remaining = totalApproved - answeredCount
  const perDay = Math.round((remaining / daysRemaining) * 10) / 10

  return NextResponse.json({
    total: totalApproved,
    answered: answeredCount,
    correct: correctCount,
    remaining,
    percentage:
      totalApproved > 0 ? Math.round((answeredCount / totalApproved) * 100) : 0,
    daysRemaining,
    perDay,
  })
}
