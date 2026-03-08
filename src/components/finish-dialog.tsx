"use client"

import { useState } from "react"
import { GoogleSignInButton } from "@/components/google-sign-in-button"

type Props = {
  totalQuestions: number
  earlyAccessSpots: number
  onDismiss: () => void
}

export function FinishDialog({
  totalQuestions,
  earlyAccessSpots,
  onDismiss,
}: Props) {
  const [showLogin, setShowLogin] = useState(false)
  const hasFreeSpotsLeft = earlyAccessSpots > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-xl">
        <h2 className="mb-2 text-center text-xl font-semibold text-foreground">
          Esperamos que tenha aproveitado!
        </h2>
        <p className="mb-6 text-center leading-relaxed text-muted-foreground">
          O banco completo tem{" "}
          <span className="font-semibold text-foreground">
            {totalQuestions} questões
          </span>{" "}
          organizadas por capítulo e subtópico, com acompanhamento do seu
          progresso até o dia da prova.
        </p>

        {hasFreeSpotsLeft ? (
          <>
            <p className="mb-4 text-center text-sm font-medium text-foreground">
              Grátis para os primeiros 100 usuários — restam {earlyAccessSpots}{" "}
              vagas
            </p>
            <GoogleSignInButton callbackURL="/painel" className="mb-4 w-full" />
          </>
        ) : !showLogin ? (
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
          </button>
        ) : (
          <GoogleSignInButton callbackURL="/checkout" className="mb-4 w-full" />
        )}

        <button
          onClick={onDismiss}
          className="w-full cursor-pointer py-2 text-center text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}
