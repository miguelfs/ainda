import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { code } = await req.json()
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 })
  }

  const referral = await prisma.referralCode.findUnique({
    where: { code: code.trim().toUpperCase() },
  })

  if (!referral) {
    return NextResponse.json(
      { error: "Código não encontrado" },
      { status: 404 }
    )
  }

  if (referral.expiresAt < new Date()) {
    return NextResponse.json({ error: "Código expirado" }, { status: 410 })
  }

  if (referral.usedCount >= referral.maxUses) {
    return NextResponse.json(
      { error: "Código atingiu o limite de usos" },
      { status: 410 }
    )
  }

  const existing = await prisma.referralUsage.findUnique({
    where: {
      referralCodeId_userId: {
        referralCodeId: referral.id,
        userId: session.user.id,
      },
    },
  })

  if (existing) {
    return NextResponse.json(
      { error: "Você já usou este código" },
      { status: 409 }
    )
  }

  await prisma.$transaction([
    prisma.referralUsage.create({
      data: {
        referralCodeId: referral.id,
        userId: session.user.id,
      },
    }),
    prisma.referralCode.update({
      where: { id: referral.id },
      data: { usedCount: { increment: 1 } },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { isPaid: true, paidAt: new Date() },
    }),
  ])

  return NextResponse.json({ ok: true })
}
