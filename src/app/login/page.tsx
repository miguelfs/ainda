"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { signIn } from "@/lib/auth-client"
import { Suspense } from "react"

function LoginRedirect() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/painel"

  useEffect(() => {
    signIn.social({
      provider: "google",
      callbackURL: redirect,
    })
  }, [redirect])

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="size-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginRedirect />
    </Suspense>
  )
}
