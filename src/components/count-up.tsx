"use client"

import SlotCounter from "react-slot-counter"

export function CountUp({
  target,
  className,
}: {
  target: number
  duration?: number
  className?: string
}) {
  return (
    <div className={className}>
      <SlotCounter
        value={target}
        duration={1.5}
        animateOnVisible
        startValue={0}
        sequentialAnimationMode
        useMonospaceWidth
      />
    </div>
  )
}
