"use client"

import dynamic from "next/dynamic"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "./context"
import type { PlacedItem } from "@/lib/luzmo-types"

const FlexVizPreview = dynamic(
  () => import("./flex-viz-preview").then((m) => m.FlexVizPreview),
  { ssr: false },
)

export function ItemCard({ item }: { item: PlacedItem }) {
  const { dispatch } = useApp()

  return (
    <div className="group relative flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium capitalize">{item.type.replace(/-/g, " ")}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item.id })}
          aria-label={`Remove ${item.type}`}
        >
          <X className="size-3.5" />
        </Button>
      </div>
      <FlexVizPreview
        type={item.type}
        slots={item.slots}
        options={item.options}
        filters={item.filters}
        className="h-40"
      />
    </div>
  )
}
