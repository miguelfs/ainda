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

/** Answer current question by selecting alt A and clicking Confirmar */
function answerCurrent(id: number) {
  fireEvent.click(screen.getByText(`(A) A-alt-${id}`))
  fireEvent.click(screen.getByText("Confirmar"))
}

/** Answer and advance to next question */
function answerAndAdvance(id: number) {
  answerCurrent(id)
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
      />,
    )

    const progress = screen.getByText(/Questão.*de/)
    expect(progress.textContent).toMatch(/1.*6/)
  })

  describe("when earlyAccessSpots = 0 (no free spots)", () => {
    it("shows upsell dialog after answering the 5th question", () => {
      render(
        <FreeQuestionsFlow
          questions={questions}
          totalApproved={501}
          earlyAccessSpots={0}
        />,
      )

      for (let i = 1; i <= 4; i++) answerAndAdvance(i)

      answerCurrent(5)

      expect(
        screen.getByText("Você completou a amostra grátis!"),
      ).toBeInTheDocument()
    })

    it("shows 6th question after dismissing upsell", () => {
      render(
        <FreeQuestionsFlow
          questions={questions}
          totalApproved={501}
          earlyAccessSpots={0}
        />,
      )

      for (let i = 1; i <= 4; i++) answerAndAdvance(i)
      answerCurrent(5)

      fireEvent.click(
        screen.getByText("Não, obrigado — ver minha última questão"),
      )

      expect(screen.getByText("Question 6?")).toBeInTheDocument()
    })

    it("shows Finalizar button after answering the 6th question", () => {
      render(
        <FreeQuestionsFlow
          questions={questions}
          totalApproved={501}
          earlyAccessSpots={0}
        />,
      )

      for (let i = 1; i <= 4; i++) answerAndAdvance(i)
      answerCurrent(5)
      fireEvent.click(
        screen.getByText("Não, obrigado — ver minha última questão"),
      )

      // Answer question 6
      answerCurrent(6)

      expect(screen.getByText("Finalizar")).toBeInTheDocument()
    })

    it("shows finish dialog with purchase option when clicking Finalizar", () => {
      render(
        <FreeQuestionsFlow
          questions={questions}
          totalApproved={501}
          earlyAccessSpots={0}
        />,
      )

      for (let i = 1; i <= 4; i++) answerAndAdvance(i)
      answerCurrent(5)
      fireEvent.click(
        screen.getByText("Não, obrigado — ver minha última questão"),
      )
      answerCurrent(6)
      fireEvent.click(screen.getByText("Finalizar"))

      expect(
        screen.getByText("Esperamos que tenha aproveitado!"),
      ).toBeInTheDocument()
      expect(screen.getByText(/R\$ 24,90/)).toBeInTheDocument()
    })

    it("shows finished screen after dismissing finish dialog", () => {
      render(
        <FreeQuestionsFlow
          questions={questions}
          totalApproved={501}
          earlyAccessSpots={0}
        />,
      )

      for (let i = 1; i <= 4; i++) answerAndAdvance(i)
      answerCurrent(5)
      fireEvent.click(
        screen.getByText("Não, obrigado — ver minha última questão"),
      )
      answerCurrent(6)
      fireEvent.click(screen.getByText("Finalizar"))
      fireEvent.click(screen.getByText("Fechar"))

      expect(screen.getByText("Amostra concluída!")).toBeInTheDocument()
    })
  })

  describe("when earlyAccessSpots > 0 (free spots available)", () => {
    it("does NOT show early access dialog at the start", () => {
      render(
        <FreeQuestionsFlow
          questions={questions}
          totalApproved={501}
          earlyAccessSpots={50}
        />,
      )

      expect(
        screen.queryByText("Grátis para os primeiros 100 usuários!"),
      ).not.toBeInTheDocument()
    })

    it("shows early access dialog after answering the 5th question", () => {
      render(
        <FreeQuestionsFlow
          questions={questions}
          totalApproved={501}
          earlyAccessSpots={50}
        />,
      )

      for (let i = 1; i <= 4; i++) answerAndAdvance(i)
      answerCurrent(5)

      expect(
        screen.getByText("Grátis para os primeiros 100 usuários!"),
      ).toBeInTheDocument()
      expect(screen.getByText(/50 vagas/)).toBeInTheDocument()
    })

    it("shows 6th question after dismissing early access dialog", () => {
      render(
        <FreeQuestionsFlow
          questions={questions}
          totalApproved={501}
          earlyAccessSpots={50}
        />,
      )

      for (let i = 1; i <= 4; i++) answerAndAdvance(i)
      answerCurrent(5)
      fireEvent.click(
        screen.getByText("Agora não — continuar amostra"),
      )

      expect(screen.getByText("Question 6?")).toBeInTheDocument()
    })

    it("shows Finalizar button after answering the 6th question", () => {
      render(
        <FreeQuestionsFlow
          questions={questions}
          totalApproved={501}
          earlyAccessSpots={50}
        />,
      )

      for (let i = 1; i <= 4; i++) answerAndAdvance(i)
      answerCurrent(5)
      fireEvent.click(
        screen.getByText("Agora não — continuar amostra"),
      )

      answerCurrent(6)

      expect(screen.getByText("Finalizar")).toBeInTheDocument()
    })

    it("shows finish dialog with FREE option (no purchase) when clicking Finalizar", () => {
      render(
        <FreeQuestionsFlow
          questions={questions}
          totalApproved={501}
          earlyAccessSpots={50}
        />,
      )

      for (let i = 1; i <= 4; i++) answerAndAdvance(i)
      answerCurrent(5)
      fireEvent.click(
        screen.getByText("Agora não — continuar amostra"),
      )
      answerCurrent(6)
      fireEvent.click(screen.getByText("Finalizar"))

      expect(
        screen.getByText("Esperamos que tenha aproveitado!"),
      ).toBeInTheDocument()
      expect(screen.getByText(/50 vagas/)).toBeInTheDocument()
      // Should NOT show purchase option
      expect(screen.queryByText(/R\$ 24,90/)).not.toBeInTheDocument()
    })

    it("shows finished screen with free option after dismissing finish dialog", () => {
      render(
        <FreeQuestionsFlow
          questions={questions}
          totalApproved={501}
          earlyAccessSpots={50}
        />,
      )

      for (let i = 1; i <= 4; i++) answerAndAdvance(i)
      answerCurrent(5)
      fireEvent.click(
        screen.getByText("Agora não — continuar amostra"),
      )
      answerCurrent(6)
      fireEvent.click(screen.getByText("Finalizar"))
      fireEvent.click(screen.getByText("Fechar"))

      expect(screen.getByText("Amostra concluída!")).toBeInTheDocument()
      // Finished screen should also show free option, not purchase
      expect(screen.getByText(/50 vagas/)).toBeInTheDocument()
      expect(screen.queryByText(/R\$ 24,90/)).not.toBeInTheDocument()
    })
  })
})
