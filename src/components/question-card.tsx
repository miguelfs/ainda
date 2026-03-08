"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { QuestionOption } from "@/components/question-option"
import { ArrowLeft } from "@phosphor-icons/react"

export type QuestionData = {
  id: number
  stemQuote: string
  stemQuotePage: string | null
  stemContext: string
  stemQuestion: string
  altA: string
  altB: string
  altC: string
  altD: string
  correctAnswer: "A" | "B" | "C" | "D"
  explanation?: string | null
  chapterTitle: string
  chapterNumber: number
  subtopicName?: string
}

type Props = {
  question: QuestionData
  current: number
  total: number
  onNext: () => void
  onAnswer?: (questionId: number, selected: string) => void
  isLast?: boolean
  onFinish?: () => void
  backHref?: string
}

const ALT_KEYS = ["A", "B", "C", "D"] as const

export function QuestionCard({
  question,
  current,
  total,
  onNext,
  onAnswer,
  isLast,
  onFinish,
  backHref,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const alternatives = {
    A: question.altA,
    B: question.altB,
    C: question.altC,
    D: question.altD,
  }

  function handleConfirm() {
    if (!selected) return
    setConfirmed(true)
    onAnswer?.(question.id, selected)
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress */}
      <div className="mb-6 flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Link>
        )}
        <span className="text-sm text-muted-foreground">
          Questão {current} de {total}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Chapter header */}
      <p className="mb-4 text-xs tracking-wide text-muted-foreground/70 uppercase">
        Capítulo {question.chapterNumber} — {question.chapterTitle}
        {question.subtopicName && ` · ${question.subtopicName}`}
      </p>

      {/* Quote */}
      <blockquote className="mb-4 border-l-2 border-primary/30 pl-4 font-serif text-lg leading-relaxed text-foreground/90 italic">
        {question.stemQuote}
        {question.stemQuotePage && (
          <span className="ml-1 text-muted-foreground not-italic">
            {question.stemQuotePage}
          </span>
        )}
      </blockquote>

      {/* Citation label */}
      <p className="mb-4 text-xs text-muted-foreground/60 italic">
        — PAIVA, Marcelo Rubens.{" "}
        <span className="italic">Ainda Estou Aqui</span>. Rio de Janeiro:
        Objetiva, 2015
        {question.stemQuotePage && `, ${question.stemQuotePage}`}.
      </p>

      {/* Context */}
      <p className="mb-3 leading-relaxed text-foreground/80">
        {question.stemContext}
      </p>

      {/* Question */}
      <p className="mb-6 font-medium text-foreground">
        {question.stemQuestion}
      </p>

      {/* Alternatives */}
      <div className="flex flex-col gap-2">
        {ALT_KEYS.map((key) => (
          <QuestionOption
            key={key}
            letter={key}
            text={alternatives[key]}
            selected={selected === key}
            confirmed={confirmed}
            isCorrect={key === question.correctAnswer}
            onClick={() => !confirmed && setSelected(key)}
          />
        ))}
      </div>

      {/* Explanation */}
      {confirmed && question.explanation && (
        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
          <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Explicação
          </p>
          <p className="text-sm leading-relaxed text-foreground/80">
            {question.explanation}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex justify-center">
        {!confirmed && selected && (
          <Button onClick={handleConfirm} size="lg" className="px-8">
            Confirmar
          </Button>
        )}
        {confirmed && !isLast && (
          <Button onClick={onNext} size="lg" className="px-8">
            Próxima
          </Button>
        )}
        {confirmed && isLast && onFinish && (
          <Button onClick={onFinish} size="lg" className="px-8">
            Finalizar
          </Button>
        )}
      </div>
    </div>
  )
}
