"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { QuestionCard, type QuestionData } from "@/components/question-card"
import { UpsellDialog } from "@/components/upsell-dialog"
import { EarlyAccessDialog } from "@/components/early-access-dialog"
import { FinishDialog } from "@/components/finish-dialog"
import { GoogleSignInButton } from "@/components/google-sign-in-button"
import { Button } from "@/components/ui/button"

const EARLY_ACCESS_AFTER = 5
const FREE_TOTAL = 6

type Props = {
  questions: QuestionData[]
  totalApproved: number
  earlyAccessSpots: number
}

export function FreeQuestionsFlow({
  questions,
  totalApproved,
  earlyAccessSpots,
}: Props) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showEarlyAccess, setShowEarlyAccess] = useState(false)
  const [earlyAccessDismissed, setEarlyAccessDismissed] = useState(false)
  const [showUpsell, setShowUpsell] = useState(false)
  const [upsellDismissed, setUpsellDismissed] = useState(false)
  const [showFinishDialog, setShowFinishDialog] = useState(false)
  const [finished, setFinished] = useState(false)
  const [results, setResults] = useState<boolean[]>([])

  const total = Math.min(questions.length, FREE_TOTAL)
  const isLast = currentIndex === total - 1
  const shouldShowDialogAfterConfirm = currentIndex === EARLY_ACCESS_AFTER - 1

  function handleNext() {
    if (isLast) {
      setFinished(true)
      return
    }
    setCurrentIndex((i) => i + 1)
  }

  function handleAnswer(_questionId: number, selected: string) {
    const isCorrect = selected === questions[currentIndex].correctAnswer
    setResults((prev) => [...prev, isCorrect])

    if (shouldShowDialogAfterConfirm) {
      if (earlyAccessSpots > 0 && !earlyAccessDismissed) {
        setShowEarlyAccess(true)
      } else if (!upsellDismissed) {
        setShowUpsell(true)
      }
    }
  }

  function handleEarlyAccessDismiss() {
    setShowEarlyAccess(false)
    setEarlyAccessDismissed(true)
    setCurrentIndex(EARLY_ACCESS_AFTER)
  }

  function handleUpsellDismiss() {
    setShowUpsell(false)
    setUpsellDismissed(true)
    setCurrentIndex(EARLY_ACCESS_AFTER)
  }

  function handleFinish() {
    setShowFinishDialog(true)
  }

  function handleFinishDialogDismiss() {
    setShowFinishDialog(false)
    setFinished(true)
  }

  function handleReferralSuccess() {
    router.push("/painel")
  }

  // --- Finished screen state ---
  const [referralCode, setReferralCode] = useState("")
  const [referralError, setReferralError] = useState("")
  const [referralLoading, setReferralLoading] = useState(false)
  const [showReferralFinished, setShowReferralFinished] = useState(false)
  const [showLoginFinished, setShowLoginFinished] = useState(false)
  const finishedTapCount = useRef(0)
  const finishedTapTimer = useRef<ReturnType<typeof setTimeout>>(null)

  function handleFinishedTitleClick() {
    finishedTapCount.current++
    if (finishedTapTimer.current) clearTimeout(finishedTapTimer.current)
    finishedTapTimer.current = setTimeout(() => {
      finishedTapCount.current = 0
    }, 2000)
    if (finishedTapCount.current >= 7) {
      setShowReferralFinished(true)
      finishedTapCount.current = 0
    }
  }

  async function handleRedeemFinished() {
    if (!referralCode.trim()) return
    setReferralError("")
    setReferralLoading(true)
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: referralCode.trim() }),
      })
      if (res.ok) {
        router.push("/painel")
        return
      }
      const data = await res.json()
      setReferralError(data.error || "Erro ao validar código")
    } catch {
      setReferralError("Erro de conexão")
    } finally {
      setReferralLoading(false)
    }
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-svh items-center justify-center px-6">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-semibold">Em breve!</h1>
          <p className="text-muted-foreground">
            As questões estão sendo preparadas. Volte em breve.
          </p>
        </div>
      </div>
    )
  }

  if (finished) {
    const correct = results.filter(Boolean).length
    const incorrect = results.length - correct
    const pct = Math.round((correct / results.length) * 100)

    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1
            className="mb-2 cursor-default text-2xl font-semibold select-none"
            onClick={handleFinishedTitleClick}
          >
            Amostra concluída!
          </h1>

          <div className="my-8 flex items-center justify-center gap-8">
            <div>
              <span className="text-4xl font-bold text-correct">{correct}</span>
              <p className="mt-1 text-sm text-muted-foreground">acertos</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div>
              <span className="text-4xl font-bold text-incorrect">
                {incorrect}
              </span>
              <p className="mt-1 text-sm text-muted-foreground">erros</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div>
              <span className="text-4xl font-bold">{pct}%</span>
              <p className="mt-1 text-sm text-muted-foreground">
                aproveitamento
              </p>
            </div>
          </div>

          <p className="mb-2 leading-relaxed text-muted-foreground">
            Você completou {results.length} questões da amostra grátis.
          </p>
          <p className="mb-8 leading-relaxed text-muted-foreground">
            O banco completo tem{" "}
            <span className="font-semibold text-foreground">
              {totalApproved} questões
            </span>{" "}
            organizadas por capítulo, subtópico e com acompanhamento completo do
            seu progresso até o dia da prova.
          </p>

          <div className="flex flex-col gap-3">
            {earlyAccessSpots > 0 ? (
              <>
                <p className="text-sm font-medium text-foreground">
                  Grátis para os primeiros 100 usuários — restam{" "}
                  {earlyAccessSpots} vagas
                </p>
                <GoogleSignInButton callbackURL="/painel" className="w-full" />
              </>
            ) : !showLoginFinished ? (
              <Button
                size="lg"
                className="w-full"
                onClick={() => setShowLoginFinished(true)}
              >
                <span className="text-primary-foreground/70 line-through">
                  R$ 49,00
                </span>
                <span className="ml-2 font-bold">R$ 24,90 — 50% OFF</span>
              </Button>
            ) : (
              <GoogleSignInButton callbackURL="/checkout" className="w-full" />
            )}
            <Button variant="ghost" size="lg" className="w-full" asChild>
              <Link href="/questoes">Refazer amostra</Link>
            </Button>
          </div>

          {showReferralFinished && (
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Código especial de acesso"
                className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
                onKeyDown={(e) => e.key === "Enter" && handleRedeemFinished()}
              />
              <button
                onClick={handleRedeemFinished}
                disabled={referralLoading || !referralCode.trim()}
                className="h-9 cursor-pointer rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {referralLoading ? "..." : "Validar"}
              </button>
            </div>
          )}
          {referralError && (
            <p className="mt-2 text-center text-sm text-destructive">
              {referralError}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh px-4 py-8 sm:px-6">
      <QuestionCard
        key={questions[currentIndex].id}
        question={questions[currentIndex]}
        current={currentIndex + 1}
        total={total}
        onNext={handleNext}
        onAnswer={handleAnswer}
        isLast={isLast}
        onFinish={isLast ? handleFinish : undefined}
        backHref="/"
      />

      {showEarlyAccess && (
        <EarlyAccessDialog
          spotsLeft={earlyAccessSpots}
          totalQuestions={totalApproved}
          onDismiss={handleEarlyAccessDismiss}
        />
      )}

      {showUpsell && (
        <UpsellDialog
          totalQuestions={totalApproved}
          onDismiss={handleUpsellDismiss}
          onReferralSuccess={handleReferralSuccess}
        />
      )}

      {showFinishDialog && (
        <FinishDialog
          totalQuestions={totalApproved}
          earlyAccessSpots={earlyAccessSpots}
          onDismiss={handleFinishDialogDismiss}
        />
      )}
    </div>
  )
}
