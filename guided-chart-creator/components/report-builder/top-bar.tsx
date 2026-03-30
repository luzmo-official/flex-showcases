"use client"

import { Plus, LayoutDashboard, Eye, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import { useApp } from "./context"
import type { GridMode } from "@/lib/store"

export function TopBar() {
  const { state, dispatch } = useApp()
  const hasItems = state.items.length > 0

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 text-card-foreground">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="size-5 text-primary" />
        <h1 className="text-base font-semibold tracking-tight">Report Builder</h1>
      </div>
      <div className="flex items-center gap-2">
        {/* View / Edit toggle -- only visible when the dashboard has items */}
        {hasItems && (
          <div className="inline-flex h-8 items-center rounded-lg bg-muted p-0.5">
            {(["view", "edit"] as GridMode[]).map((mode) => {
              const isActive = state.gridMode === mode
              return (
                <button
                  key={mode}
                  onClick={() => dispatch({ type: "SET_GRID_MODE", payload: mode })}
                  aria-pressed={isActive}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {mode === "view" ? (
                    <Eye className="size-3.5" />
                  ) : (
                    <Pencil className="size-3.5" />
                  )}
                  <span className="capitalize">{mode}</span>
                </button>
              )
            })}
          </div>
        )}
        <ThemeToggle />
        <Button
          size="sm"
          onClick={() => dispatch({ type: "TOGGLE_ADD_ITEM", payload: true })}
        >
          <Plus className="size-4" />
          Add item
        </Button>
      </div>
    </header>
  )
}
