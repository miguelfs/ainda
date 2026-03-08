"use client"

import { useEffect, useState } from "react"
import { GoogleSignInButton } from "@/components/google-sign-in-button"

const words = [
  { text: "ainda", delay: 0 },
  { text: "estou", delay: 400 },
  { text: "aqui...", delay: 800 },
]

const ESTUDANDO_DELAY = 1400
const CONTENT_DELAY = 2400

export function LandingHero({ children }: { children: React.ReactNode }) {
  const [visibleWords, setVisibleWords] = useState(0)
  const [showEstudando, setShowEstudando] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    words.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleWords(i + 1), words[i].delay))
    })

    timers.push(setTimeout(() => setShowEstudando(true), ESTUDANDO_DELAY))
    timers.push(setTimeout(() => setShowContent(true), CONTENT_DELAY))

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-6">
      <div
        className="absolute top-4 right-4 transition-all duration-700 ease-out sm:top-6 sm:right-6"
        style={{
          opacity: showContent ? 1 : 0,
        }}
      >
        <GoogleSignInButton callbackURL="/painel" />
      </div>

      <div className="mb-16 text-center">
        <h1 className="text-4xl tracking-tight text-foreground sm:text-5xl md:text-6xl">
          {words.map((word, i) => (
            <span
              key={word.text}
              className="inline-block transition-all duration-700 ease-out"
              style={{
                opacity: i < visibleWords ? 1 : 0,
                transform:
                  i < visibleWords ? "translateY(0)" : "translateY(12px)",
              }}
            >
              {word.text}
              {i < words.length - 1 && "\u00A0"}
            </span>
          ))}
          <br />
          <span
            className="mt-2 inline-block font-serif text-5xl font-bold text-primary italic transition-all duration-700 ease-out sm:text-6xl md:text-7xl"
            style={{
              opacity: showEstudando ? 1 : 0,
              transform: showEstudando ? "scale(1)" : "scale(0.95)",
            }}
          >
            estudando
          </span>
        </h1>
      </div>

      <div
        className="w-full max-w-md transition-all duration-700 ease-out"
        style={{
          opacity: showContent ? 1 : 0,
          transform: showContent ? "translateY(0)" : "translateY(20px)",
        }}
      >
        {children}
      </div>
    </div>
  )
}
