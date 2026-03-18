"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"

interface InspectorTabsProps {
  tabs: string[]
  defaultTab?: string
}

export function InspectorTabs({ tabs, defaultTab }: InspectorTabsProps) {
  return (
    <Tabs defaultValue={defaultTab || tabs[0]} className="flex h-full flex-col">
      <TabsList className="w-full shrink-0">
        {tabs.map((t) => (
          <TabsTrigger key={t} value={t} className="flex-1 text-xs">
            {t}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((t) => (
        <TabsContent key={t} value={t} className="flex-1 overflow-auto p-2">
          {t === "Config" || t === "Table Settings" ? (
            <ConfigStub />
          ) : t === "Filters" ? (
            <FiltersStub />
          ) : t === "Chart Type" ? (
            <ChartTypeStub />
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              {t} panel
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}

function ConfigStub() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show legend</Label>
        <Switch defaultChecked />
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <Label className="text-xs">Show labels</Label>
        <Switch />
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <Label className="text-xs">Stacked</Label>
        <Switch />
      </div>
      <Separator />
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Title</Label>
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Color scheme</Label>
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    </div>
  )
}

function FiltersStub() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Add filters to narrow down the data shown in your visualization.
      </p>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
      <button className="text-xs font-medium text-primary hover:underline">
        + Add filter
      </button>
    </div>
  )
}

function ChartTypeStub() {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        Select a different chart type for your visualization.
      </p>
      {["Bar", "Line", "Area", "Pie"].map((t) => (
        <Skeleton key={t} className="h-8 w-full rounded-md" />
      ))}
    </div>
  )
}
