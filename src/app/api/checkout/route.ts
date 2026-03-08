import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"

export async function POST() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const headersList = await headers()
  const origin = headersList.get("origin") || "http://localhost:3000"

  const checkoutSession = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    mode: "payment",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    customer_email: session.user.email,
    metadata: {
      userId: session.user.id,
    },
    return_url: `${origin}/checkout?session_id={CHECKOUT_SESSION_ID}`,
  })

  return NextResponse.json({ clientSecret: checkoutSession.client_secret })
}
