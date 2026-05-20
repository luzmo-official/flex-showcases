"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowRight, ArrowDown, Database, Settings, Bug, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useApp } from "./context"
import { Tray } from "./tray"
import { FlexVizPreview } from "./flex-viz-preview"
import { ChartTypeSelector } from "./chart-type-selector"
import { Stepper } from "./stepper"

import {
  LuzmoDataFieldPanel,
  LuzmoItemSlotDrop,
  LuzmoItemSlotDropPanel,
  LuzmoItemOptionPanel,
  LuzmoFilters,
} from "@luzmo/analytics-components-kit/react"

import type { DraftItem, VizItemSlots } from "@/lib/luzmo-types"
import {
  getNextItemPosition,
  normalizeSlotsContents,
  inferChartType,
  getDatasetIdsFromSlots,
} from "@/lib/luzmo-types"
import { guidedWizard as copy } from "@/lib/guidance-copy"
import { SlotSection } from "./slot-section"
import { useScrollFixRef } from "@/hooks/use-scroll-fix-ref"
import {
  loadBuilderState,
  saveBuilderState,
  clearBuilderState,
} from "@/lib/builder-persistence"
// ─── Constants ─────────────────────────────────────────────
const API_URL = "https://api.luzmo.com"

export function GuidedWizard() {
  const { state, dispatch, allowedDatasetIds } = useApp()
  const draft = state.modal.draft
  const filterDatasetIds = useMemo(
    () => getDatasetIdsFromSlots(draft.slotsContents),
    [draft.slotsContents],
  )

  const isEditMode = state.modal.editingItemId !== null
  const [step, setStep] = useState(() => {
    if (isEditMode) return 4
    const saved = loadBuilderState()
    return saved?.guidedStep ?? 1
  })

  const [showDebug, setShowDebug] = useState(false)

  const dataFieldsPanelRef = useScrollFixRef()

  // Ref to hold current draft — avoids stale closures in event handlers
  const draftRef = useRef(draft)
  draftRef.current = draft

  // ── Per-type slot cache ───────────────────────────────────
  // When switching chart types, we save slot contents keyed by type.
  // Switching back restores the exact prior state.
  const slotsCacheRef = useRef<Record<string, VizItemSlots>>({})

  // ─── Persist step + draft to localStorage ─────────────────
  useEffect(() => {
    if (!isEditMode) {
      saveBuilderState({
        draft: draftRef.current,
        activeMode: state.modal.activeMode,
        guidedStep: step,
        savedAt: Date.now(),
      })
    }
  }, [step, draft, isEditMode, state.modal.activeMode])

  // ─── Left tray starts open + pinned ─────────────────────
  useEffect(() => {
    dispatch({
      type: "SET_TRAY",
      payload: { tray: "left", state: { pinned: true, collapsed: false } },
    })
  }, [dispatch])

  // Steps 2 & 4: right tray starts open + pinned
  const prevStepRef = useRef(step)
  useEffect(() => {
    if (prevStepRef.current !== step) {
      prevStepRef.current = step
      if (step === 2 || step === 4) {
        dispatch({
          type: "SET_TRAY",
          payload: { tray: "right", state: { pinned: true, collapsed: false } },
        })
      }
    }
  }, [step, dispatch])

  // ─── Draft update helpers ───────────────────────────────
  const updateDraftSlots = useCallback(
    (slotsContents: VizItemSlots) => {
      const normalized = normalizeSlotsContents(slotsContents)
      dispatch({ type: "SET_DRAFT_SLOTS", payload: normalized })
      // Also update the per-type cache for current chart type
      slotsCacheRef.current[draftRef.current.type] = normalized
    },
    [dispatch],
  )

  const handleDraftChange = useCallback(
    (partial: Partial<DraftItem>) => {
      const current = draftRef.current

      // If chart type is changing, manage the per-type slot cache
      if (partial.type && partial.type !== current.type) {
        // Save current slots under current type before switching
        slotsCacheRef.current[current.type] = normalizeSlotsContents(
          current.slotsContents,
        )

        console.log(
          `[CACHE] Saved slots for ${current.type}:`,
          slotsCacheRef.current[current.type],
        )

        // Check if we have cached slots for the new type
        const cached = slotsCacheRef.current[partial.type]
        if (cached && cached.some((s) => s.content.length > 0)) {
          console.log(`[CACHE] Restoring slots for ${partial.type}:`, cached)
          partial = { ...partial, slotsContents: cached }
        } else {
          // No cache — use whatever switchItem produced (already normalized
          // by chart-type-selector), or fall back to empty
          console.log(
            `[CACHE] No cache for ${partial.type}, using switchItem result`,
          )
          partial = {
            ...partial,
            slotsContents: normalizeSlotsContents(partial.slotsContents),
          }
        }
      }

      // Always normalize slotsContents before dispatching
      if (partial.slotsContents) {
        partial = {
          ...partial,
          slotsContents: normalizeSlotsContents(partial.slotsContents),
        }
      }

      dispatch({
        type: "SET_DRAFT",
        payload: { ...current, ...partial },
      })
    },
    [dispatch],
  )

  // ─── Step 1: Slot configurations ────────────────────────
  // Explicit configs that override the auto-loaded item-type defaults.
  const step1SlotConfigs: Record<string, Record<string, unknown>> = {
    measure: {
      name: "measure",
      label: "Measure",
      type: "numeric",
      canAcceptMultipleDataFields: true,
      canAcceptFormula: true,
    },
    "y-axis": {
      name: "y-axis",
      label: "Category",
      type: "categorical",
      canAcceptMultipleDataFields: true,
    },
  }

  const normalizedSlots = useMemo(
    () => normalizeSlotsContents(draft.slotsContents),
    [draft.slotsContents],
  )

  const handleSlotContentsChanged = useCallback(
    (slotName: string, e: CustomEvent<{ slotContents: unknown[] }>) => {
      const newContent = Array.isArray(e.detail?.slotContents)
        ? (e.detail.slotContents as VizItemSlots[0]["content"])
        : []

      const currentSlots = normalizeSlotsContents(draft.slotsContents)
      const existingIdx = currentSlots.findIndex((s) => s.name === slotName)
      let updated: VizItemSlots
      if (existingIdx >= 0) {
        updated = currentSlots.map((s, i) =>
          i === existingIdx ? { ...s, content: newContent } : s,
        )
      } else {
        updated = [...currentSlots, { name: slotName, content: newContent }]
      }

      console.log(`[SLOT] ${slotName} changed:`, newContent)
      updateDraftSlots(updated)
    },
    [draft.slotsContents, updateDraftSlots],
  )

  const handleDropPanelSlotsChanged = useCallback(
    (e: CustomEvent<{ slotsContents: VizItemSlots }>) => {
      const newSlots = normalizeSlotsContents(e.detail?.slotsContents)
      console.log("[ACK] luzmo-slots-contents-changed:", newSlots)
      updateDraftSlots(newSlots)
    },
    [updateDraftSlots],
  )

  // ─── Callbacks for edit-item / edit-filters ──────────────
  const handleOptionsChanged = useCallback(
    (e: CustomEvent) => {
      const newOptions = e.detail?.options ?? {}
      console.log("[ACK] luzmo-options-changed:", newOptions)
      dispatch({
        type: "SET_DRAFT_OPTIONS",
        payload: {
          ...newOptions,
          title: draftRef.current.options.title,
          display: {
            ...((newOptions.display as Record<string, unknown>) || {}),
            title: draftRef.current.options.display?.title,
          },
        } as DraftItem["options"],
      })
    },
    [dispatch],
  )

  const handleFiltersChanged = useCallback(
    (e: CustomEvent) => {
      const newFilters = e.detail?.filters ?? []
      console.log("[ACK] luzmo-filters-changed:", newFilters)
      dispatch({
        type: "SET_DRAFT_FILTERS",
        payload: newFilters,
      })
    },
    [dispatch],
  )

  // ─── "Add / Update to Dashboard" handler ────────────────
  const editingItemId = state.modal.editingItemId
  const isEditing = editingItemId !== null

  const saveToDashboard = useCallback(() => {
    const d = draftRef.current
    if (isEditing && editingItemId) {
      const existing = state.items.find((i) => i.id === editingItemId)
      dispatch({
        type: "UPDATE_ITEM",
        payload: {
          id: editingItemId,
          type: d.type,
          slots: normalizeSlotsContents(d.slotsContents),
          options: d.options,
          filters: d.filters ?? [],
          position: existing?.position ?? {
            col: 0,
            row: 0,
            sizeX: 12,
            sizeY: 16,
          },
        },
      })
    } else {
      const position = getNextItemPosition(state.items)
      dispatch({
        type: "ADD_ITEM",
        payload: {
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          type: d.type,
          slots: normalizeSlotsContents(d.slotsContents),
          options: d.options,
          filters: d.filters ?? [],
          position,
        },
      })
    }
  }, [dispatch, state.items, isEditing, editingItemId])

  const hasContent = normalizeSlotsContents(draft.slotsContents).some(
    (s) => s.content.length > 0,
  )

  const handleNext = useCallback(() => {
    const inferred = inferChartType(draft.slotsContents, draft.type)
    if (inferred !== draft.type) {
      handleDraftChange({ type: inferred, slotsContents: draft.slotsContents })
    }
    setStep(2)
  }, [draft.slotsContents, draft.type, handleDraftChange])

  // ─── Reset builder handler (debug only) ────────────────
  const resetBuilder = useCallback(() => {
    clearBuilderState()
    slotsCacheRef.current = {}
    dispatch({ type: "RESET_BUILDER_DRAFT" })
    setStep(1)
  }, [dispatch])

  // ─── Shared: data-field-panel ────────────────────────────
  const renderDataFieldsPanel = () => (
    <LuzmoDataFieldPanel
      ref={dataFieldsPanelRef}
      datasetIds={allowedDatasetIds}
      apiUrl={API_URL}
      datasetPicker
      search="auto"
      language="en"
      size="m"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: "1 1 0%",
        minHeight: 0,
        width: "100%",
      }}
    />
  )

  // ─── Shared: drop panel (Steps 2, 4) ───────────────────
  const renderDropPanel = () => (
    <div className="shrink-0 border-b bg-muted/30 p-2 overflow-auto max-h-48">
      <LuzmoItemSlotDropPanel
        itemType={draft.type}
        slotsContents={normalizedSlots}
        grows
        apiUrl={API_URL}
        language="en"
        contentLanguage="en"
        size="m"
        onLuzmoSlotsContentsChanged={handleDropPanelSlotsChanged}
      />
    </div>
  )

  // ─── Enhanced debug panel ──────────────────────────────
  const renderDebug = () => {
    if (!showDebug) return null

    const normalizedSlots = normalizeSlotsContents(draft.slotsContents)
    const flexConfig = {
      type: draft.type,
      slots: normalizedSlots,
      options: draft.options,
      filters: draft.filters ?? [],
    }

    const slotSummary = normalizedSlots.map((s) => ({
      slot: s.name,
      fields: s.content.length,
      ids: s.content
        .map((c) => c.columnId || c.formulaId || "?")
        .join(", "),
    }))

    const cacheKeys = Object.keys(slotsCacheRef.current)
    const cacheSummary = cacheKeys.map((k) => {
      const slots = slotsCacheRef.current[k]
      const total = slots.reduce((n, s) => n + s.content.length, 0)
      return `${k}: ${total} field(s)`
    })

    return (
      <div className="shrink-0 border-t bg-muted/50 p-2 max-h-60 overflow-auto font-mono text-[10px] leading-tight">
        <div className="flex items-center justify-between mb-1">
          <span className="font-sans text-xs font-semibold text-muted-foreground">
            Debug Panel
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-5"
            onClick={resetBuilder}
            title="Reset builder (clear persisted state)"
          >
            <RotateCcw className="size-3" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <div className="font-semibold text-muted-foreground">State</div>
            <div>step: {step}</div>
            <div>itemType: <span className="text-blue-500">{draft.type}</span></div>
            <div>hasContent: {String(hasContent)}</div>
            <div>isEditing: {String(isEditing)}</div>
            <div className="mt-1">
              allowed (env):{" "}
              {allowedDatasetIds.length > 0
                ? allowedDatasetIds.join(", ")
                : "NONE"}
            </div>
            <div>
              chart (slots):{" "}
              {filterDatasetIds.length > 0
                ? filterDatasetIds.join(", ")
                : "NONE"}
            </div>
          </div>
          <div>
            <div className="font-semibold text-muted-foreground">
              Slot Assignments
            </div>
            {slotSummary.length === 0 ? (
              <div className="text-muted-foreground">(empty)</div>
            ) : (
              slotSummary.map((s) => (
                <div key={s.slot}>
                  <span className="text-blue-500">{s.slot}</span>: {s.fields}{" "}
                  [{s.ids}]
                </div>
              ))
            )}
          </div>
          <div>
            <div className="font-semibold text-muted-foreground">
              Per-Type Cache
            </div>
            {cacheSummary.length === 0 ? (
              <div className="text-muted-foreground">(empty)</div>
            ) : (
              cacheSummary.map((s) => <div key={s}>{s}</div>)
            )}
          </div>
        </div>
        <details className="mt-1">
          <summary className="cursor-pointer font-semibold text-muted-foreground">
            Flex Config JSON
          </summary>
          <pre className="whitespace-pre-wrap break-all mt-1">
            {JSON.stringify(flexConfig, null, 2)}
          </pre>
        </details>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex min-h-0 flex-1 overflow-hidden">

        {/* ── Step 1: Data (initial field drops) ─────────── */}
        {step === 1 && (
          <>
            <Tray
              side="left"
              title="Data Fields"
              icon={<Database className="size-3.5 text-muted-foreground" />}
            >
              {renderDataFieldsPanel()}
            </Tray>

            <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-auto p-6">
              {!hasContent && (
                <div className="flex items-center gap-2 rounded-md border border-dashed border-muted-foreground/25 bg-muted/20 px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {copy.step1.emptyState}
                  </span>
                </div>
              )}

              <SlotSection
                title={copy.step1.dimension.title}
                description={copy.step1.dimension.description}
              >
                <LuzmoItemSlotDrop
                  itemType={draft.type}
                  slotName="y-axis"
                  slotsContents={normalizedSlots}
                  slotConfiguration={step1SlotConfigs["y-axis"]}
                  label="Drop a dimension here"
                  apiUrl={API_URL}
                  language="en"
                  size="m"
                  onLuzmoSlotContentsChanged={(e) =>
                    handleSlotContentsChanged("y-axis", e)
                  }
                />
              </SlotSection>

              <SlotSection
                title={copy.step1.measure.title}
                description={copy.step1.measure.description}
              >
                <LuzmoItemSlotDrop
                  itemType={draft.type}
                  slotName="measure"
                  slotsContents={normalizedSlots}
                  slotConfiguration={step1SlotConfigs.measure}
                  label="Drop a measure here"
                  apiUrl={API_URL}
                  language="en"
                  size="m"
                  onLuzmoSlotContentsChanged={(e) =>
                    handleSlotContentsChanged("measure", e)
                  }
                />
              </SlotSection>

            </div>
          </>
        )}

        {/* ── Step 2: Chart Type + Preview ────────────────── */}
        {step === 2 && (
          <>
            <Tray
              side="left"
              title="Data Fields"
              icon={<Database className="size-3.5 text-muted-foreground" />}
            >
              {renderDataFieldsPanel()}
            </Tray>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              {renderDropPanel()}

              <FlexVizPreview
                type={draft.type}
                slots={draft.slotsContents}
                options={draft.options}
                filters={draft.filters}
                className="m-4 min-h-0 flex-1"
              />
            </div>

            <Tray
              side="right"
              title="Chart Type"
              icon={<Settings className="size-3.5 text-muted-foreground" />}
            >
              <div className="min-h-0 flex-1 overflow-y-auto">
                <ChartTypeSelector
                  currentType={draft.type}
                  slotsContents={draft.slotsContents}
                  options={draft.options}
                  onDraftChange={handleDraftChange}
                />
              </div>
            </Tray>
          </>
        )}

        {/* ── Step 3: Review ──────────────────────────────── */}
        {step === 3 && (
          <>
            <FlexVizPreview
              type={draft.type}
              slots={draft.slotsContents}
              options={draft.options}
              filters={draft.filters}
              className="min-w-0 flex-1 m-4"
            />

            <div className="flex w-56 shrink-0 flex-col gap-3 border-l p-4">
              <Button className="justify-between" onClick={() => setStep(4)}>
                Refine Settings
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="secondary"
                className="justify-between"
                onClick={saveToDashboard}
                disabled={!hasContent}
              >
                <span className="text-left">
                  <span className="block text-sm font-medium">
                    {isEditing ? "Update Item" : "Add to Dashboard"}
                  </span>
                  {!isEditing && (
                    <span className="block text-xs text-muted-foreground">
                      You can edit later
                    </span>
                  )}
                </span>
                <ArrowDown className="size-4" />
              </Button>
            </div>
          </>
        )}

        {/* ── Step 4: Refine ──────────────────────────────── */}
        {step === 4 && (
          <>
            <Tray
              side="left"
              title="Data Fields"
              icon={<Database className="size-3.5 text-muted-foreground" />}
            >
              {renderDataFieldsPanel()}
            </Tray>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              {renderDropPanel()}

              <FlexVizPreview
                type={draft.type}
                slots={draft.slotsContents}
                options={draft.options}
                filters={draft.filters}
                className="m-4 min-h-0 flex-1"
              />
            </div>

            <Tray
              side="right"
              title="Inspector"
              icon={<Settings className="size-3.5 text-muted-foreground" />}
            >
              <Tabs defaultValue="chart-type" className="flex h-full flex-col">
                <TabsList className="w-full shrink-0">
                  <TabsTrigger value="chart-type" className="flex-1 text-xs">
                    Chart Type
                  </TabsTrigger>
                  <TabsTrigger value="config" className="flex-1 text-xs">
                    Config
                  </TabsTrigger>
                  <TabsTrigger value="filters" className="flex-1 text-xs">
                    Filters
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="chart-type"
                  className="flex-1 overflow-auto p-2"
                >
                  <ChartTypeSelector
                    currentType={draft.type}
                    slotsContents={draft.slotsContents}
                    options={draft.options}
                    onDraftChange={handleDraftChange}
                  />
                </TabsContent>

                <TabsContent
                  value="config"
                  className="flex-1 overflow-auto p-2"
                >
                  <LuzmoItemOptionPanel
                    itemType={draft.type}
                    options={draft.options}
                    slots={normalizedSlots}
                    language="en"
                    size="m"
                    onLuzmoOptionsChanged={handleOptionsChanged}
                  />
                </TabsContent>

                <TabsContent
                  value="filters"
                  className="flex-1 overflow-auto p-2"
                >
                  <LuzmoFilters
                    datasetIds={filterDatasetIds}
                    filters={draft.filters ?? []}
                    apiUrl={API_URL}
                    language="en"
                    size="m"
                    onLuzmoFiltersChanged={handleFiltersChanged}
                  />
                </TabsContent>
              </Tabs>
            </Tray>
          </>
        )}
      </div>

      {/* Debug panel (collapsible) */}
      {renderDebug()}

      {/* ── Bottom stepper bar ───────────────────────────── */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Stepper currentStep={step} onStepClick={(s) => setStep(s)} />
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-6"
            onClick={() => setShowDebug((d) => !d)}
            title="Toggle debug panel"
          >
            <Bug className="size-3.5" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {step > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(step - 1)}
            >
              Prev
            </Button>
          )}
          {step === 1 && (
            <Button size="sm" onClick={handleNext}>
              Next
            </Button>
          )}
          {step > 1 && step < 4 && (
            <Button size="sm" onClick={() => setStep(step + 1)}>
              Next
            </Button>
          )}
          {step === 4 && (
            <Button
              size="sm"
              onClick={saveToDashboard}
              disabled={!hasContent}
            >
              {isEditing ? "Update Item" : "Add to Dashboard"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
