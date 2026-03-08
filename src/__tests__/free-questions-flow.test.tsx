import { describe, it, expect, vi, beforeEach } from "vitest"
import { cleanup, render, screen, fireEvent } from "@testing-library/react"
import { FreeQuestionsFlow } from "@/app/questoes/flow"
import type { QuestionData } from "@/components/question-card"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function makeQuestion(id: number): QuestionData {
  return {
    id,
    stemQuote: `Quote ${id}`,
    stemQuotePage: "(p. 42)",
    stemContext: `Context ${id}`,
    stemQuestion: `Question ${id}?`,
    altA: `A-alt-${id}`,
    altB: `B-alt-${id}`,
    altC: `C-alt-${id}`,
    altD: `D-alt-${id}`,
    correctAnswer: "A",
    chapterTitle: "Test",
    chapterNumber: 1,
  }
}

const questions = Array.from({ length: 12 }, (_, i) => makeQuestion(i + 1))

function answerAndAdvance(id: number) {
  fireEvent.click(screen.getByText(`(A) A-alt-${id}`))
  fireEvent.click(screen.getByText("Confirmar"))
  const next = screen.queryByText("Próxima")
  if (next) fireEvent.click(next)
}

beforeEach(() => {
  cleanup()
})

describe("FreeQuestionsFlow", () => {
  it("shows total of 6 questions in progress", () => {
    render(
      <FreeQuestionsFlow
        questions={questions}
        totalApproved={501}
        earlyAccessSpots={0}
      />
    )

    const progress = screen.getByText(/Questão.*de/)
    expect(progress.textContent).toMatch(/1.*6/)
  })

  it("shows upsell dialog after answering the 5th question", () => {
    render(
      <FreeQuestionsFlow
        questions={questions}
        totalApproved={501}
        earlyAccessSpots={0}
      />
    )

    // Answer and advance questions 1-4
    for (let i = 1; i <= 4; i++) {
      answerAndAdvance(i)
    }

    // Answer question 5 (don't click Proxima — upsell should appear)
    fireEvent.click(screen.getByText("(A) A-alt-5"))
    fireEvent.click(screen.getByText("Confirmar"))

    expect(
      screen.getByText("Você completou a amostra grátis!")
    ).toBeInTheDocument()
  })

  it("shows 6th question after dismissing upsell", () => {
    render(
      <FreeQuestionsFlow
        questions={questions}
        totalApproved={501}
        earlyAccessSpots={0}
      />
    )

    for (let i = 1; i <= 4; i++) {
      answerAndAdvance(i)
    }

    fireEvent.click(screen.getByText("(A) A-alt-5"))
    fireEvent.click(screen.getByText("Confirmar"))

    // Dismiss upsell
    fireEvent.click(
      screen.getByText("Não, obrigado — ver minha última questão")
    )

    expect(screen.getByText("Question 6?")).toBeInTheDocument()
  })
})
