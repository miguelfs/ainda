"use client"

import { useState, useRef } from "react"
import { GoogleSignInButton } from "@/components/google-sign-in-button"

type Props = {
  totalQuestions: number
  onDismiss: () => void
  onReferralSuccess?: () => void
}

export function UpsellDialog({
  totalQuestions,
  onDismiss,
  onReferralSuccess,
}: Props) {
  const [showLogin, setShowLogin] = useState(false)
  const [showReferral, setShowReferral] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const tapCount = useRef(0)
  const tapTimer = useRef<ReturnType<typeof setTimeout>>(null)

  function handleTitleClick() {
    tapCount.current++
    if (tapTimer.current) clearTimeout(tapTimer.current)
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0
    }, 2000)

    if (tapCount.current >= 7) {
      setShowReferral(true)
      tapCount.current = 0
    }
  }

  async function handleRedeem() {
    if (!code.trim()) return
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      })
      if (res.ok) {
        onReferralSuccess?.()
        return
      }
      const data = await res.json()
      setError(data.error || "Erro ao validar código")
    } catch {
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-xl">
        <h2
          className="mb-2 cursor-default text-center text-xl font-semibold text-foreground select-none"
          onClick={handleTitleClick}
        >
          Você completou a amostra grátis!
        </h2>
        <p className="mb-6 text-center leading-relaxed text-muted-foreground">
          O banco completo tem{" "}
          <span className="font-semibold text-foreground">
            {totalQuestions} questões
          </span>{" "}
          organizadas por capítulo e subtópico, com acompanhamento do seu
          progresso até o dia da prova.
        </p>

        {!showLogin ? (
          <button
            onClick={() => setShowLogin(true)}
            className="mb-4 w-full cursor-pointer rounded-lg bg-primary px-6 py-4 text-center transition-colors hover:bg-primary/90"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-primary-foreground/70 line-through">
                R$ 49,00
              </span>
              <span className="text-2xl font-bold text-primary-foreground">
                R$ 24,90
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-primary-foreground">
              Acesso completo — 50% OFF
            </p>
            <p className="text-xs text-primary-foreground/70">
              Até 31 de março
            </p>
          </button>
        ) : (
          <GoogleSignInButton callbackURL="/checkout" className="mb-4 w-full" />
        )}

        <button
          onClick={onDismiss}
          className="w-full cursor-pointer py-2 text-center text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Não, obrigado — ver minha última questão
        </button>

        {showReferral && (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Código especial de acesso"
              className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
              onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
            />
            <button
              onClick={handleRedeem}
              disabled={loading || !code.trim()}
              className="h-9 cursor-pointer rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "..." : "Validar"}
            </button>
          </div>
        )}
        {error && (
          <p className="mt-2 text-center text-sm text-destructive">{error}</p>
        )}
      </div>
    </div>
  )
}
