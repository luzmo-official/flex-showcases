"use client"

import { useCallback, useState } from "react"
import { cn } from "@/lib/utils"
import { switchItem } from "@luzmo/analytics-components-kit/utils"
import type { IconDefinition } from "@luzmo/icons"
import {
  luzmoBarChart,
  luzmoColumnChart,
  luzmoLineChart,
  luzmoAreaChart,
  luzmoDonutChart,
  luzmoScatterPlot,
  luzmoBubbleChart,
  luzmoFunnelChart,
  luzmoRadarChart,
  luzmoTreemapChart,
  luzmoSunburstChart,
  luzmoCirclePackChart,
  luzmoHeatMap,
  luzmoCombinationChart,
  luzmoEvolutionNumber,
} from "@luzmo/icons"
import {
  CHART_TYPES,
  normalizeSlotsContents,
  type DraftItem,
  type VizItemSlots,
} from "@/lib/luzmo-types"

const ICON_MAP: Record<string, IconDefinition> = {
  "bar-chart": luzmoBarChart,
  "column-chart": luzmoColumnChart,
  "line-chart": luzmoLineChart,
  "area-chart": luzmoAreaChart,
  "donut-chart": luzmoDonutChart,
  "scatter-plot": luzmoScatterPlot,
  "bubble-chart": luzmoBubbleChart,
  "funnel-chart": luzmoFunnelChart,
  "radar-chart": luzmoRadarChart,
  "treemap-chart": luzmoTreemapChart,
  "sunburst-chart": luzmoSunburstChart,
  "circle-pack-chart": luzmoCirclePackChart,
  "heat-map": luzmoHeatMap,
  "combination-chart": luzmoCombinationChart,
  "evolution-number": luzmoEvolutionNumber,
}

function LuzmoIcon({
  definition,
  size = 18,
  className,
}: {
  definition: IconDefinition
  size?: number
  className?: string
}) {
  const [width, height, ...paths] = definition.icon
  const pathData = Array.isArray(paths[0]) ? (paths[0] as string[]) : [paths[0] as string]

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width={size}
      height={size}
      fill="currentColor"
      className={className}
    >
      {pathData.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

interface ChartTypeSelectorProps {
  currentType: string
  slotsContents: VizItemSlots
  options: Record<string, unknown>
  onDraftChange: (draft: Partial<DraftItem>) => void
  className?: string
}

export function ChartTypeSelector({
  currentType,
  slotsContents,
  options,
  onDraftChange,
  className,
}: ChartTypeSelectorProps) {
  const [switching, setSwitching] = useState(false)

  const handleChartTypeChange = useCallback(
    async (newType: string) => {
      if (newType === currentType || switching) return

      setSwitching(true)
      console.log("[SWITCH] Starting:", currentType, "→", newType)

      try {
        // switchItem is async in our ACK version (returns Promise)
        const switched = await switchItem({
          oldItemType: currentType,
          newItemType: newType,
          slots: normalizeSlotsContents(slotsContents),
          options: options ?? {},
        })

        console.log("[SWITCH] Result:", switched.type, "slots:", switched.slots)

        const newOptions = (switched.options ?? {}) as Record<string, unknown>

        onDraftChange({
          type: switched.type,
          slotsContents: normalizeSlotsContents(switched.slots as VizItemSlots),
          options: {
            ...newOptions,
            display: {
              ...((newOptions.display as Record<string, unknown>) || {}),
            },
          },
        })
      } catch (err) {
        console.error("[SWITCH] Error:", err)
        // Fallback: change type, keep current slots normalized
        onDraftChange({
          type: newType,
          slotsContents: normalizeSlotsContents(slotsContents),
        })
      } finally {
        setSwitching(false)
      }
    },
    [currentType, slotsContents, options, onDraftChange, switching],
  )

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {CHART_TYPES.map((ct) => {
        const icon = ICON_MAP[ct.type]
        const isActive = currentType === ct.type

        return (
          <button
            key={ct.type}
            onClick={() => handleChartTypeChange(ct.type)}
            disabled={switching}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground hover:bg-accent",
              switching && !isActive && "opacity-50 cursor-wait",
            )}
          >
            {icon ? (
              <LuzmoIcon definition={icon} size={16} className="shrink-0" />
            ) : (
              <span className="size-4 shrink-0 rounded bg-muted" />
            )}
            <span>{ct.label}</span>
          </button>
        )
      })}
    </div>
  )
}
