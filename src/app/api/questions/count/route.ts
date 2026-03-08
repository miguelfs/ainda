import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const count = await prisma.question.count({
    where: { status: "approved" },
  })
  return NextResponse.json({ count })
}
