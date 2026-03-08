"use client"

import { useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

function CheckoutForm() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const showSuccess = Boolean(sessionId)

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/checkout", { method: "POST" })
    const data = await res.json()
    return data.clientSecret
  }, [])

  if (showSuccess) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 text-5xl">🎉</div>
          <h1 className="mb-2 text-2xl font-semibold">
            Parabéns! Pagamento confirmado.
          </h1>
          <p className="mb-8 leading-relaxed text-muted-foreground">
            Você agora tem acesso completo a todas as questões, com
            acompanhamento de progresso por capítulo e subtópico até o dia da
            prova.
          </p>
          <Button asChild size="lg" className="w-full">
            <Link href="/painel">Ir para o painel</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-center text-xl font-semibold">
        Finalizar compra
      </h1>
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutForm />
    </Suspense>
  )
}
