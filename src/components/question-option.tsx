"use client"

import { cn } from "@/lib/utils"
import { Check, X } from "@phosphor-icons/react"

type Props = {
  letter: string
  text: string
  selected: boolean
  confirmed: boolean
  isCorrect: boolean
  onClick: () => void
}

export function QuestionOption({
  letter,
  text,
  selected,
  confirmed,
  isCorrect,
  onClick,
}: Props) {
  const showResult = confirmed
  const isSelected = selected

  let borderClass = "border-border"
  let bgClass = "bg-card hover:bg-muted/50"

  if (showResult) {
    if (isCorrect) {
      borderClass = "border-correct"
      bgClass = "bg-correct/10"
    } else if (isSelected && !isCorrect) {
      borderClass = "border-incorrect"
      bgClass = "bg-incorrect/10"
    } else {
      bgClass = "bg-card opacity-60"
    }
  } else if (isSelected) {
    borderClass = "border-primary"
    bgClass = "bg-primary/5"
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={confirmed}
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-all",
        borderClass,
        bgClass,
        !confirmed && "cursor-pointer"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
          showResult && isCorrect
            ? "border-correct bg-correct text-white"
            : showResult && isSelected && !isCorrect
              ? "border-incorrect bg-incorrect text-white"
              : isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground"
        )}
      >
        {showResult && isCorrect ? (
          <Check weight="bold" className="size-3.5" />
        ) : showResult && isSelected && !isCorrect ? (
          <X weight="bold" className="size-3.5" />
        ) : (
          letter
        )}
      </span>
      <span
        className={cn(
          "text-sm leading-relaxed",
          showResult && isCorrect && "font-medium text-foreground",
          showResult && isSelected && !isCorrect && "text-foreground/70"
        )}
      >
        ({letter}) {text}
      </span>
    </button>
  )
}
