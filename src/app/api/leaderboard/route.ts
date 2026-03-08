import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") || "always"

  let dateFilter: Date | null = null
  const now = new Date()

  if (period === "day") {
    dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  } else if (period === "week") {
    const d = new Date(now)
    d.setDate(d.getDate() - d.getDay())
    d.setHours(0, 0, 0, 0)
    dateFilter = d
  } else if (period === "month") {
    dateFilter = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const where = dateFilter ? { answeredAt: { gte: dateFilter } } : {}

  const answers = await prisma.userAnswer.findMany({
    where,
    select: {
      userId: true,
      isCorrect: true,
      user: {
        select: { name: true, image: true },
      },
    },
  })

  // Group by user
  const byUser: Record<
    string,
    { name: string; image: string | null; total: number; correct: number }
  > = {}

  for (const a of answers) {
    if (!byUser[a.userId]) {
      byUser[a.userId] = {
        name: a.user.name || "Anônimo",
        image: a.user.image,
        total: 0,
        correct: 0,
      }
    }
    byUser[a.userId].total++
    if (a.isCorrect) byUser[a.userId].correct++
  }

  const entries = Object.entries(byUser).map(([id, data]) => ({
    userId: id,
    ...data,
    accuracy:
      data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
  }))

  const mostSolved = [...entries].sort((a, b) => b.total - a.total).slice(0, 10)

  const highestAccuracy = entries
    .filter((e) => e.total >= 10)
    .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total)
    .slice(0, 10)

  return NextResponse.json({ mostSolved, highestAccuracy })
}
