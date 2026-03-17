"use client"

import { type ReactNode, useCallback } from "react"
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  ChevronUp,
  ChevronDown,
  Pin,
  PinOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { useApp } from "./context"

interface TrayProps {
  side: "left" | "right" | "top"
  title: string
  icon: ReactNode
  children: ReactNode
  className?: string
}

/* ── Shared icon helpers ─────────────────────────────────── */
function CollapseIcon({ side }: { side: "left" | "right" | "top" }) {
  if (side === "left") return <PanelLeftClose className="size-3.5" />
  if (side === "right") return <PanelRightClose className="size-3.5" />
  return <ChevronUp className="size-3.5" />
}

function ExpandIcon({ side }: { side: "left" | "right" | "top" }) {
  if (side === "left") return <PanelLeftOpen className="size-3.5" />
  if (side === "right") return <PanelRightOpen className="size-3.5" />
  return <ChevronDown className="size-3.5" />
}

export function Tray({ side, title, icon, children, className }: TrayProps) {
  const { state, dispatch } = useApp()
  const tray = state.modal.tray[side]

  const togglePin = useCallback(() => {
    dispatch({
      type: "SET_TRAY",
      payload: { tray: side, state: { pinned: !tray.pinned } },
    })
  }, [dispatch, side, tray.pinned])

  const toggleCollapse = useCallback(() => {
    dispatch({
      type: "SET_TRAY",
      payload: { tray: side, state: { collapsed: !tray.collapsed } },
    })
  }, [dispatch, side, tray.collapsed])

  const isPinned = tray.pinned
  const isCollapsed = tray.collapsed

  /* ────────────────────────────────────────────────────────
   * CONTROL CLUSTER -- always the same 2 buttons, always
   * positioned on the inner-top edge of the tray:
   *   Left tray  -> controls at top-right (justify-end)
   *   Right tray -> controls at top-left  (justify-start)
   *   Top tray   -> controls at top-right (justify-end)
   * ──────────────────────────────────────────────────────── */
  const controlCluster = (
    <div
      className={cn(
        "flex items-center gap-0.5",
        side === "right" ? "mr-auto" : "ml-auto",
      )}
    >
      {/* Pin toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-6"
            onClick={togglePin}
            aria-label={isPinned ? "Unpin (overlay)" : "Pin (dock)"}
          >
            {isPinned ? (
              <Pin className="size-3" />
            ) : (
              <PinOff className="size-3" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isPinned ? "Unpin (overlay)" : "Pin (dock)"}
        </TooltipContent>
      </Tooltip>

      {/* Collapse toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-6"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? (
              <ExpandIcon side={side} />
            ) : (
              <CollapseIcon side={side} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isCollapsed ? "Expand" : "Collapse"}
        </TooltipContent>
      </Tooltip>
    </div>
  )

  /* ── COLLAPSED RAIL ─────────────────────────────────────
   * Always renders a thin rail at the edge with a single
   * vertically-centred expand button, regardless of pin state.
   * When pinned: rail is in flow (shrink-0).
   * When unpinned: rail is absolute at the edge.
   * ────────────────────────────────────────────────────── */
  if (isCollapsed) {
    const rail = (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center bg-tray text-tray-foreground transition-all duration-200",
          side === "top" ? "h-9 w-full border-b" : "h-full w-10",
          side === "left" && "border-r",
          side === "right" && "border-l",
          className,
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleCollapse}
              aria-label={`Expand ${title}`}
            >
              <ExpandIcon side={side} />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side={
              side === "top"
                ? "bottom"
                : side === "left"
                  ? "right"
                  : "left"
            }
          >
            {title}
          </TooltipContent>
        </Tooltip>
      </div>
    )

    return rail
  }

  /* ── EXPANDED TRAY ──────────────────────────────────────
   * The header always shows: icon + title on one side,
   * the control cluster on the inner edge.
   * ────────────────────────────────────────────────────── */
  const trayContent = (
    <div
      className={cn(
        "flex flex-col bg-tray text-tray-foreground transition-all duration-200",
        // Sizing
        side === "top" && "w-full border-b",
        side !== "top" && "h-full w-72",
        side === "left" && "border-r",
        side === "right" && "border-l",
        // Pinned = in flow, unpinned = overlay
        isPinned ? "shrink-0" : "shadow-xl",
        className,
      )}
    >
      {/* Tray header -- controls always in the same spot */}
      <div
        data-tray-header
        className={cn(
          "flex h-9 shrink-0 items-center gap-1.5 border-b px-2",
          side === "right" ? "flex-row-reverse" : "flex-row",
        )}
      >
        {/* Title group */}
        <div
          className={cn(
            "flex items-center gap-1.5",
            side === "right" ? "ml-auto" : "",
          )}
        >
          {icon}
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
        </div>

        {/* Controls -- positioned at inner edge via the cluster's own ml-auto / mr-auto */}
        {controlCluster}
      </div>

      {/* Tray body */}
      <div className="flex min-h-0 flex-1 flex-col p-2">{children}</div>
    </div>
  )

  /* Pinned: render in flow */
  if (isPinned) return trayContent

  /* Unpinned: render as absolute overlay */
  return (
    <div
      className={cn(
        "absolute z-30",
        side === "left" && "left-0 top-0 bottom-0",
        side === "right" && "right-0 top-0 bottom-0",
        side === "top" && "top-0 left-0 right-0",
      )}
    >
      {trayContent}
    </div>
  )
}


