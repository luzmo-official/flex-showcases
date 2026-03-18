"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import dynamic from "next/dynamic"
import { LayoutGrid } from "lucide-react"
import { useApp } from "./context"
import type { PlacedItem, VizItemSlots, ChartOptions, ItemFilterGroup } from "@/lib/luzmo-types"
import {
  GRID_COLUMNS,
  GRID_ROW_HEIGHT,
  GRID_ITEM_ACTIONS,
  getFlexTheme,
} from "@/lib/luzmo-types"
import type { Theme } from "@/lib/store"

// Dynamic import of LuzmoItemGrid to avoid SSR issues with Lit web components
const LuzmoItemGrid = dynamic(
  () =>
    import("@luzmo/analytics-components-kit/react").then((m) => m.LuzmoItemGrid),
  { ssr: false },
)

export function Canvas() {
  const { state, dispatch } = useApp()

  // Force view mode when modal is open so grid edit handles don't show above it
  const effectiveGridMode = state.isAddItemOpen ? "view" : state.gridMode

  // Inject current Flex theme into every grid item at render time.
  // flexTheme is stable per theme value; themedItems only recomputes when items or theme change.
  const flexTheme = useMemo(() => getFlexTheme(state.theme), [state.theme])
  const themedItems = useMemo(
    () =>
      state.items.map((item) => ({
        ...item,
        options: { ...item.options, theme: flexTheme },
      })),
    [state.items, flexTheme],
  )

  // Ref to the grid element for imperative updates
  const gridRef = useRef<HTMLElement | null>(null)
  const prevThemeRef = useRef<Theme>(state.theme)

  // When ONLY the theme changes (not items), nudge the grid web component
  // by re-setting its items property imperatively. This avoids a full remount.
  useEffect(() => {
    if (prevThemeRef.current === state.theme) return
    prevThemeRef.current = state.theme
    const el = gridRef.current
    if (!el) return
    if (process.env.NODE_ENV === "development") {
      console.log("[Canvas] Theme changed to", state.theme, "— updating grid items in-place")
    }
    ;(el as Record<string, unknown>).items = themedItems
  }, [state.theme, themedItems])

  // ── Debounced grid change handler ────────────────────────
  const gridChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingItemsRef = useRef<PlacedItem[] | null>(null)

  const handleGridChanged = useCallback(
    (event: CustomEvent<{ items: PlacedItem[] }>) => {
      const updatedItems = event.detail?.items ?? []

      pendingItemsRef.current = updatedItems

      if (gridChangeTimeoutRef.current) {
        clearTimeout(gridChangeTimeoutRef.current)
      }

      gridChangeTimeoutRef.current = setTimeout(() => {
        const items = pendingItemsRef.current
        if (!items) return
        dispatch({ type: "UPDATE_ITEM_POSITIONS", payload: items })
        pendingItemsRef.current = null
        gridChangeTimeoutRef.current = null
      }, 300)
    },
    [dispatch],
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (gridChangeTimeoutRef.current) {
        clearTimeout(gridChangeTimeoutRef.current)
      }
    }
  }, [])

  // Dev-only: log grid mount/unmount and render timing
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return
    const t0 = performance.now()
    console.log("[Canvas] LuzmoItemGrid mounted")
    return () => {
      console.log(`[Canvas] LuzmoItemGrid unmounted after ${(performance.now() - t0).toFixed(0)}ms`)
    }
  }, [])

  // ── Grid item action handler ─────────────────────────────
  const handleGridItemAction = useCallback(
    (
      event: CustomEvent<{
        action: string
        actionType: "toggle" | "button"
        active: boolean
        id: string
        items: PlacedItem[]
        type?: string
        slots?: VizItemSlots
        options?: ChartOptions
        filters?: ItemFilterGroup[]
        deletedId?: string
      }>,
    ) => {
      const { action, id, deletedId } = event.detail

      if (action === "item-options" || action === "edit-data") {
        event.preventDefault()
        event.stopPropagation()
        dispatch({ type: "EDIT_ITEM", payload: id })
        return
      }

      if (action === "delete" && deletedId) {
        dispatch({ type: "REMOVE_ITEM", payload: deletedId })
        return
      }

      // After clone, sync the new items array from the grid
      if (action === "clone" && event.detail.items) {
        dispatch({ type: "UPDATE_ITEM_POSITIONS", payload: event.detail.items })
      }
    },
    [dispatch],
  )

  return (
    <main
      className="relative flex-1 overflow-auto"
      style={{
        backgroundColor: "var(--canvas)",
      }}
    >
      {state.items.length === 0 ? (
        <div
          className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--canvas-grid) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
            <LayoutGrid className="size-7" style={{ color: "var(--canvas-foreground)" }} />
          </div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--canvas-foreground)" }}>
            No items yet
          </h2>
          <p className="max-w-xs text-sm" style={{ color: "var(--canvas-foreground)" }}>
            {"Click \"+ Add item\" to start building your dashboard"}
          </p>
        </div>
      ) : (
        <div className="h-full w-full">
          <LuzmoItemGrid
            ref={gridRef}
            appServer={
              process.env.NEXT_PUBLIC_LUZMO_APP_SERVER || "https://app.luzmo.com"
            }
            apiHost="https://api.luzmo.com"
            columns={GRID_COLUMNS}
            rowHeight={GRID_ROW_HEIGHT}
            viewMode={effectiveGridMode === "view"}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            items={themedItems as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            theme={flexTheme as any}
            language="en"
            contentLanguage="en"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            defaultItemActionsMenu={GRID_ITEM_ACTIONS as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onLuzmoItemGridChanged={handleGridChanged as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onLuzmoItemGridItemAction={handleGridItemAction as any}
          />
        </div>
      )}
    </main>
  )
}
