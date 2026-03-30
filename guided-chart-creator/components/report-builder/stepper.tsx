"use client"

import { cn } from "@/lib/utils"
import { Check, ChevronRight } from "lucide-react"

const STEPS = [
  { num: 1, label: "Data" },
  { num: 2, label: "Chart Type" },
  { num: 3, label: "Review" },
  { num: 4, label: "Refine" },
]

interface StepperProps {
  currentStep: number
  onStepClick?: (step: number) => void
}

export function Stepper({ currentStep, onStepClick }: StepperProps) {
  return (
    <nav className="flex items-center gap-1" aria-label="Wizard progress">
      {STEPS.map((s, i) => {
        const isActive = s.num === currentStep
        const isDone = s.num < currentStep

        return (
          <div key={s.num} className="flex items-center gap-1">
            <button
              onClick={() => onStepClick?.(s.num)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all cursor-pointer",
                isActive &&
                  "bg-primary text-primary-foreground shadow-sm",
                isDone &&
                  "bg-primary/10 text-primary hover:bg-primary/20",
                !isActive &&
                  !isDone &&
                  "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-xs font-bold",
                  isActive && "bg-primary-foreground/20",
                  isDone && "bg-primary/20",
                )}
              >
                {isDone ? <Check className="size-3" /> : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight className="size-3.5 text-muted-foreground/50" />
            )}
          </div>
        )
      })}
    </nav>
  )
}
