"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { QuestionCard, type QuestionData } from "@/components/question-card"
import { Button } from "@/components/ui/button"

type Props = {
  questions: QuestionData[]
}

export function PaidQuestionsFlow({ questions }: Props) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [finished, setFinished] = useState(false)

  if (questions.length === 0) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6">
        <h1 className="text-xl font-semibold">Parabéns!</h1>
        <p className="text-muted-foreground">
          Você já respondeu todas as questões disponíveis.
        </p>
        <Button onClick={() => router.push("/painel")}>Voltar ao painel</Button>
      </div>
    )
  }

  const isLast = currentIndex === questions.length - 1

  function handleNext() {
    if (isLast) {
      setFinished(true)
      return
    }
    setCurrentIndex((i) => i + 1)
  }

  function handleAnswer(questionId: number, selected: string) {
    fetch("/api/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, selected }),
    })
  }

  if (finished) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6">
        <h1 className="text-xl font-semibold">Sessão concluída!</h1>
        <p className="text-muted-foreground">
          Você respondeu {questions.length} questões.
        </p>
        <Button onClick={() => router.push("/painel")}>Voltar ao painel</Button>
      </div>
    )
  }

  return (
    <div className="min-h-svh px-4 py-8 sm:px-6">
      <QuestionCard
        key={questions[currentIndex].id}
        question={questions[currentIndex]}
        current={currentIndex + 1}
        total={questions.length}
        onNext={handleNext}
        onAnswer={handleAnswer}
        isLast={isLast}
        backHref="/painel"
      />
    </div>
  )
}
