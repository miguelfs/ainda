import Link from "next/link"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
import { LandingHero } from "@/components/landing-hero"
import { CountUp } from "@/components/count-up"
import { Button } from "@/components/ui/button"

export default async function LandingPage() {
  const approvedCount = await prisma.question.count({
    where: { status: "approved" },
  })

  const count = approvedCount > 0 ? approvedCount : 501
  const label = approvedCount > 0 ? "questões" : "questões em produção"

  return (
    <LandingHero>
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="text-muted-foreground">
          Prepare-se para o Exame de Qualificação da UERJ:
        </p>

        <div className="flex flex-col items-center gap-1">
          <CountUp
            target={count}
            className="text-6xl font-bold tracking-tighter text-foreground sm:text-7xl"
          />
          <p className="text-lg text-muted-foreground">{label}</p>
          <p className="text-sm text-muted-foreground/70">
            seguindo a bibliografia de apoio
          </p>
        </div>

        <Button asChild size="lg" className="mt-4 px-8 text-base">
          <Link href="/questoes">Começar</Link>
        </Button>

        <p className="mt-8 text-xs text-muted-foreground/50">
          Exame de Qualificação UERJ — 1 de junho de 2026
        </p>
      </div>
    </LandingHero>
  )
}
