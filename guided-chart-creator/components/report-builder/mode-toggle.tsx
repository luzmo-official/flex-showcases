"use client"

import { cn } from "@/lib/utils"
import { useApp } from "./context"
import type { Mode } from "@/lib/store"

const modes: { value: Mode; label: string }[] = [
  { value: "guided", label: "Guided Chart Creator" },
  { value: "table", label: "Tabular Report Builder" },
]

export function ModeToggle() {
  const { state, dispatch } = useApp()

  return (
    <div className="inline-flex h-9 items-center rounded-lg bg-muted p-1">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => dispatch({ type: "SET_MODE", payload: m.value })}
          className={cn(
            "relative rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            state.modal.activeMode === m.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
