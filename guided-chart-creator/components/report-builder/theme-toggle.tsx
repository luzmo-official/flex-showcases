"use client"

import { useRef, useCallback } from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useApp } from "./context"

export function ThemeToggle() {
  const { state, dispatch } = useApp()
  const clickCount = useRef(0)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClick = useCallback(() => {
    clickCount.current += 1

    if (clickTimer.current) clearTimeout(clickTimer.current)

    if (clickCount.current >= 3) {
      clickCount.current = 0
      dispatch({ type: "SET_THEME", payload: "win95" })
      return
    }

    clickTimer.current = setTimeout(() => {
      if (clickCount.current > 0) {
        const next = state.theme === "dark" ? "light" : "dark"
        dispatch({ type: "SET_THEME", payload: next })
      }
      clickCount.current = 0
    }, 350)
  }, [state.theme, dispatch])

  const icon =
    state.theme === "win95" ? (
      <Monitor className="size-4" />
    ) : state.theme === "dark" ? (
      <Moon className="size-4" />
    ) : (
      <Sun className="size-4" />
    )

  const label =
    state.theme === "win95"
      ? "Windows 95"
      : state.theme === "dark"
        ? "Dark mode"
        : "Light mode"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          aria-label={`Current theme: ${label}. Click to toggle.`}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
