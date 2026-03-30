"use client"

import React, { useRef } from "react"
import { LuzmoVizItemComponent } from "@luzmo/react-embed"
import { useApp } from "./context"
import type { VizItemSlots, ChartOptions, ItemFilterGroup } from "@/lib/luzmo-types"
import { normalizeSlotsContents, getFlexTheme } from "@/lib/luzmo-types"
import { cn } from "@/lib/utils"

// ─── Error boundary to catch render failures from the embed ──
class VizErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (msg: string) => void },
  { hasError: boolean; errorMsg: string | null }
> {
  constructor(props: { children: React.ReactNode; onError?: (msg: string) => void }) {
    super(props)
    this.state = { hasError: false, errorMsg: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[VizErrorBoundary]", error, info)
    this.props.onError?.(error.message)
  }

  // Reset the boundary when children change (new config)
  componentDidUpdate(prevProps: { children: React.ReactNode }) {
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false, errorMsg: null })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="text-sm text-destructive">
            Chart render error: {this.state.errorMsg}
          </p>
          <p className="text-xs text-muted-foreground">
            Try changing chart type or data fields
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Stored shape for last valid config ──────────────────────
interface ValidConfig {
  type: string
  slots: VizItemSlots
  options: ChartOptions
  filters: ItemFilterGroup[]
}

interface FlexVizPreviewProps {
  type: string
  slots: VizItemSlots
  options?: ChartOptions
  filters?: ItemFilterGroup[]
  className?: string
}

export function FlexVizPreview({
  type,
  slots,
  options = {},
  filters = [],
  className,
}: FlexVizPreviewProps) {
  const { state } = useApp()
  const appTheme = state.theme
  const flexTheme = getFlexTheme(appTheme)

  // Track last known-good config so we can fall back on invalid transitions
  const lastValidRef = useRef<ValidConfig | null>(null)

  // Normalize and filter: only include slots that have actual content
  const safeSlots = normalizeSlotsContents(slots)
  const activeSlots = safeSlots.filter((s) => s.content.length > 0)
  const hasContent = activeSlots.length > 0

  if (process.env.NODE_ENV === "development" && (!type || !slots)) {
    console.warn("[FlexVizPreview] Received undefined type or slots", { type, slots })
  }

  // Update last valid config when current config is good
  if (hasContent && type) {
    lastValidRef.current = { type, slots: activeSlots, options, filters }
  }

  // Determine what to render: current config or last-valid fallback
  const isCurrentValid = hasContent && !!type
  const renderConfig: ValidConfig | null = isCurrentValid
    ? { type, slots: activeSlots, options, filters }
    : lastValidRef.current

  const showFallbackWarning = !isCurrentValid && renderConfig !== null

  if (!renderConfig || !renderConfig.type || !Array.isArray(renderConfig.slots)) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border bg-card",
          className,
        )}
      >
        <div className="size-12 rounded-lg bg-muted" />
        <p className="text-sm text-muted-foreground">
          Configure data fields to preview your chart
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-card",
        className,
      )}
    >
      {showFallbackWarning && (
        <div className="absolute inset-x-0 top-0 z-10 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-400">
          Current config invalid — showing last working preview
        </div>
      )}
      <VizErrorBoundary>
        <LuzmoVizItemComponent
          key={appTheme}
          appServer={
            process.env.NEXT_PUBLIC_LUZMO_APP_SERVER || "https://app.luzmo.com"
          }
          apiHost={
            process.env.NEXT_PUBLIC_LUZMO_API_HOST || "https://api.luzmo.com"
          }
          type={renderConfig.type}
          slots={renderConfig.slots}
          options={{ ...renderConfig.options, theme: flexTheme }}
          filters={renderConfig.filters}
          language="en"
        />
      </VizErrorBoundary>
    </div>
  )
}
