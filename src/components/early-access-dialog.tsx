"use client"

import { GoogleSignInButton } from "@/components/google-sign-in-button"

type Props = {
  spotsLeft: number
  totalQuestions: number
  onDismiss: () => void
}

export function EarlyAccessDialog({
  spotsLeft,
  totalQuestions,
  onDismiss,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-xl">
        <h2 className="mb-2 text-center text-xl font-semibold text-foreground">
          Grátis para os primeiros 100 usuários!
        </h2>
        <p className="mb-2 text-center leading-relaxed text-muted-foreground">
          O acesso completo ao banco de{" "}
          <span className="font-semibold text-foreground">
            {totalQuestions} questões
          </span>{" "}
          está liberado gratuitamente para os primeiros 100 usuários.
        </p>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Restam{" "}
          <span className="font-semibold text-foreground">
            {spotsLeft} vagas
          </span>
          . Crie sua conta agora e garanta seu acesso.
        </p>

        <GoogleSignInButton callbackURL="/painel" className="mb-4 w-full" />

        <button
          onClick={onDismiss}
          className="w-full cursor-pointer py-2 text-center text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Agora não — continuar amostra
        </button>
      </div>
    </div>
  )
}
