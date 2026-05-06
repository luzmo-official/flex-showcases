"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Database, Settings, Bug, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useApp } from "./context"
import { Tray } from "./tray"
import { FlexVizPreview } from "./flex-viz-preview"

// ACK web component registrations (side-effect imports)
import "@luzmo/analytics-components-kit/data-field-panel"
import "@luzmo/analytics-components-kit/item-slot-drop"
import "@luzmo/analytics-components-kit/item-option-panel"
import "@luzmo/analytics-components-kit/filters"

// ACK React wrappers
import { LuzmoItemOptionPanel, LuzmoFilters } from "@luzmo/analytics-components-kit/react"

import type { DraftItem, VizItemSlots } from "@/lib/luzmo-types"
import {
  getNextItemPosition,
  normalizeSlotsContents,
  remapSlotsForTableType,
} from "@/lib/luzmo-types"
import { tableBuilder as copy } from "@/lib/guidance-copy"
import { SlotSection } from "./slot-section"
import { clearBuilderState } from "@/lib/builder-persistence"
import { useScrollFixRef } from "@/hooks/use-scroll-fix-ref"

const API_URL = "https://api.luzmo.com"

// Internal slot names — always singular, matching the pivot-table slot config.
// UI labels stay plural ("Rows / Columns / Measures").
const SLOT_ROW = "row"
const SLOT_COLUMN = "column"
const SLOT_MEASURE = "measure"

export function TableBuilder() {
  const { state, dispatch, datasetIds } = useApp()
  const draft = state.modal.draft

  const columnSlotRef = useRef<HTMLElement>(null)
  const rowSlotRef = useRef<HTMLElement>(null)
  const measureSlotRef = useRef<HTMLElement>(null)
  const dataFieldsPanelRef = useScrollFixRef()

  const draftRef = useRef(draft)
  draftRef.current = draft

  const editingItemId = state.modal.editingItemId
  const isEditing = editingItemId !== null

  const [showDebug, setShowDebug] = useState(false)

  // ─── Derive slot counts and pivot mode ─────────────────────
  const slotCounts = useMemo(() => {
    const slots = normalizeSlotsContents(draft.slotsContents)
    const get = (name: string) =>
      slots.find((s) => s.name === name)?.content.length ?? 0
    return {
      column: get(SLOT_COLUMN),
      row: get(SLOT_ROW),
      measure: get(SLOT_MEASURE),
    }
  }, [draft.slotsContents])

  const isPivotMode = slotCounts.row > 0
  const effectiveTableType: "regular-table" | "pivot-table" =
    isPivotMode ? "pivot-table" : "regular-table"

  // Set initial draft type on mount (unless editing)
  useEffect(() => {
    if (!isEditing && draft.type !== "regular-table" && draft.type !== "pivot-table") {
      dispatch({ type: "SET_DRAFT_TYPE", payload: "regular-table" })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-switch table type when row slot changes
  useEffect(() => {
    if (draft.type !== effectiveTableType) {
      dispatch({ type: "SET_DRAFT_TYPE", payload: effectiveTableType })
    }
  }, [effectiveTableType, draft.type, dispatch])

  // Left + right trays start open + pinned
  useEffect(() => {
    dispatch({
      type: "SET_TRAY",
      payload: { tray: "left", state: { pinned: true, collapsed: false } },
    })
    dispatch({
      type: "SET_TRAY",
      payload: { tray: "right", state: { pinned: true, collapsed: false } },
    })
  }, [dispatch])

  // ─── Draft update helpers ───────────────────────────────
  const updateDraftSlots = useCallback(
    (slotsContents: VizItemSlots) => {
      dispatch({ type: "SET_DRAFT_SLOTS", payload: normalizeSlotsContents(slotsContents) })
    },
    [dispatch],
  )

  // ─── Slot refs keyed by singular slot name ────────────────
  const slotRefs: Record<string, React.RefObject<HTMLElement | null>> = {
    [SLOT_COLUMN]: columnSlotRef,
    [SLOT_ROW]: rowSlotRef,
    [SLOT_MEASURE]: measureSlotRef,
  }

  // Sync slotsContents property to all mounted droppable-slots
  useEffect(() => {
    const slots = normalizeSlotsContents(draft.slotsContents)
    for (const ref of Object.values(slotRefs)) {
      if (ref.current) {
        ;(ref.current as Record<string, unknown>).slotsContents = slots
      }
    }
  }, [draft.slotsContents, isPivotMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Wire droppable-slot event listeners (re-run when measure slot appears/disappears)
  useEffect(() => {
    const pairs: [React.RefObject<HTMLElement | null>, string][] = [
      [columnSlotRef, SLOT_COLUMN],
      [rowSlotRef, SLOT_ROW],
      [measureSlotRef, SLOT_MEASURE],
    ]

    const cleanups: (() => void)[] = []

    for (const [ref, slotName] of pairs) {
      const el = ref.current
      if (!el) continue

      const handler = (e: Event) => {
        const detail = (
          e as CustomEvent<{ slotContents: unknown[]; linkedDatasetsIds: string[] }>
        ).detail
        const currentSlots = normalizeSlotsContents(draftRef.current.slotsContents)
        const newContent = Array.isArray(detail?.slotContents)
          ? (detail.slotContents as VizItemSlots[0]["content"])
          : []

        const existingIdx = currentSlots.findIndex((s) => s.name === slotName)
        let updated: VizItemSlots
        if (existingIdx >= 0) {
          updated = currentSlots.map((s, i) =>
            i === existingIdx ? { ...s, content: newContent } : s,
          )
        } else {
          updated = [...currentSlots, { name: slotName, content: newContent }]
        }

        console.log(`[TABLE SLOT] ${slotName} changed:`, newContent)
        updateDraftSlots(updated)
      }

      el.addEventListener("luzmo-slot-contents-changed", handler)
      cleanups.push(() =>
        el.removeEventListener("luzmo-slot-contents-changed", handler),
      )
    }

    return () => cleanups.forEach((fn) => fn())
  }, [updateDraftSlots, isPivotMode])

  // ─── Callbacks for edit-item / edit-filters ──────────────
  // React wrappers handle property setting and event wiring via
  // JSX props — no ref timing issues, no stale listeners.
  const handleOptionsChanged = useCallback(
    (e: CustomEvent) => {
      const newOptions = e.detail?.options ?? {}
      console.log("[TABLE] luzmo-options-changed:", newOptions)
      dispatch({
        type: "SET_DRAFT_OPTIONS",
        payload: {
          ...newOptions,
          display: { ...((newOptions.display as Record<string, unknown>) || {}) },
        } as DraftItem["options"],
      })
    },
    [dispatch],
  )

  const handleFiltersChanged = useCallback(
    (e: CustomEvent) => {
      const newFilters = e.detail?.filters ?? []
      console.log("[TABLE] luzmo-filters-changed:", newFilters)
      dispatch({ type: "SET_DRAFT_FILTERS", payload: newFilters })
    },
    [dispatch],
  )

  // ─── Save handler (remap at boundary) ─────────────────────
  const saveToDashboard = useCallback(() => {
    const remappedSlots = remapSlotsForTableType(draft.slotsContents, effectiveTableType)
    if (isEditing && editingItemId) {
      const existing = state.items.find((i) => i.id === editingItemId)
      dispatch({
        type: "UPDATE_ITEM",
        payload: {
          id: editingItemId,
          type: effectiveTableType,
          slots: remappedSlots,
          options: draft.options,
          filters: draft.filters ?? [],
          position: existing?.position ?? { col: 0, row: 0, sizeX: 24, sizeY: 20 },
        },
      })
    } else {
      const position = getNextItemPosition(state.items)
      dispatch({
        type: "ADD_ITEM",
        payload: {
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          type: effectiveTableType,
          slots: remappedSlots,
          options: draft.options,
          filters: draft.filters ?? [],
          position: { ...position, sizeX: 24, sizeY: 20 },
        },
      })
    }
  }, [dispatch, draft, state.items, isEditing, editingItemId, effectiveTableType])

  const hasContent = normalizeSlotsContents(draft.slotsContents).some((s) => s.content.length > 0)

  const builderUsed = !hasContent
    ? "empty-state"
    : isPivotMode
      ? "pivot-table"
      : "regular-table"

  // ─── Reset handler (debug only) ────────────────────────
  const resetBuilder = useCallback(() => {
    clearBuilderState()
    dispatch({ type: "RESET_BUILDER_DRAFT" })
  }, [dispatch])

  // ─── Debug panel ──────────────────────────────────────
  const renderDebug = () => {
    if (!showDebug) return null

    const remapped = remapSlotsForTableType(draft.slotsContents, effectiveTableType)
    const flexConfig = hasContent
      ? { type: effectiveTableType, slots: remapped, options: draft.options, filters: draft.filters }
      : null

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
            title="Reset builder"
          >
            <RotateCcw className="size-3" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <div className="font-semibold text-muted-foreground">State</div>
            <div>isPivotMode: <span className={isPivotMode ? "text-green-500" : "text-orange-500"}>{String(isPivotMode)}</span></div>
            <div>effectiveType: {effectiveTableType}</div>
            <div>builder: <span className="text-blue-500">{builderUsed}</span></div>
            <div>hasContent: {String(hasContent)}</div>
          </div>
          <div>
            <div className="font-semibold text-muted-foreground">Slot Counts (internal)</div>
            <div>column: {slotCounts.column}</div>
            <div>row: {slotCounts.row}</div>
            <div>measure: {slotCounts.measure}</div>
            <div className="mt-1">isEditing: {String(isEditing)}</div>
          </div>
          <div>
            <div className="font-semibold text-muted-foreground">Datasets</div>
            <div>datasets: {datasetIds.length > 0 ? datasetIds.join(", ") : "NONE"}</div>
          </div>
        </div>
        <details className="mt-1">
          <summary className="cursor-pointer font-semibold text-muted-foreground">
            Remapped Flex Config JSON {!hasContent && "(no data yet)"}
          </summary>
          <pre className="whitespace-pre-wrap break-all mt-1">
            {flexConfig ? JSON.stringify(flexConfig, null, 2) : "null (empty-state shown)"}
          </pre>
        </details>
      </div>
    )
  }

  // ─── Preview area (remap at boundary) ─────────────────────
  const renderPreview = () => {
    if (!hasContent) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <div className="size-12 rounded-lg bg-muted" />
          <p className="text-sm text-muted-foreground">
            Drag data fields into the buckets to build a table
          </p>
        </div>
      )
    }

    const remapped = remapSlotsForTableType(draft.slotsContents, effectiveTableType)

    return (
      <FlexVizPreview
        key={effectiveTableType}
        type={effectiveTableType}
        slots={remapped}
        options={draft.options}
        filters={draft.filters}
        className="m-4 min-h-0 flex-1"
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* ── Left: Data Fields Panel ────────────────────── */}
        <Tray
          side="left"
          title="Data Fields"
          icon={<Database className="size-3.5 text-muted-foreground" />}
        >
          {/* @ts-expect-error -- ACK web component */}
          <luzmo-data-field-panel
            ref={dataFieldsPanelRef}
            dataset-ids={JSON.stringify(datasetIds)}
            api-url={API_URL}
            dataset-picker
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
        </Tray>

        {/* ── Centre: Role Slots (top) + Preview ─────────── */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Top: Role slot buckets */}
          <div className="shrink-0 border-b bg-muted/30 p-3 overflow-auto max-h-48">
            <div className="flex gap-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <SlotSection
                  title={copy.columns.title}
                  description={copy.columns.description}
                >
                  {/* @ts-expect-error -- ACK web component */}
                  <luzmo-item-slot-drop
                    ref={columnSlotRef}
                    item-type="pivot-table"
                    slot-name={SLOT_COLUMN}
                    label="Drop columns here"
                    api-url={API_URL}
                    language="en"
                    size="m"
                  />
                </SlotSection>
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <SlotSection
                  title={copy.rows.title}
                  description={copy.rows.description}
                >
                  {/* @ts-expect-error -- ACK web component */}
                  <luzmo-item-slot-drop
                    ref={rowSlotRef}
                    item-type="pivot-table"
                    slot-name={SLOT_ROW}
                    label="Drop rows here for pivot"
                    api-url={API_URL}
                    language="en"
                    size="m"
                  />
                </SlotSection>
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <SlotSection
                  title={copy.measures.title}
                  description={copy.measures.description}
                >
                  {isPivotMode ? (
                    <>
                      {/* @ts-expect-error -- ACK web component */}
                      <luzmo-item-slot-drop
                        ref={measureSlotRef}
                        item-type="pivot-table"
                        slot-name={SLOT_MEASURE}
                        label="Drop measures here"
                        api-url={API_URL}
                        language="en"
                        size="m"
                      />
                    </>
                  ) : (
                    <div className="flex items-center rounded-md border border-dashed border-muted-foreground/25 bg-muted/20 px-3 py-2.5">
                      <p className="text-xs text-muted-foreground/70">
                        {copy.measuresDisabled}
                      </p>
                    </div>
                  )}
                </SlotSection>
              </div>
            </div>
          </div>

          {/* Table type indicator */}
          <div className="shrink-0 border-b bg-background/50 px-4 py-1.5">
            <span className="text-xs text-muted-foreground">
              Rendering as:{" "}
              <span className="font-medium text-foreground">
                {isPivotMode ? "Pivot Table" : "Regular Table"}
              </span>
              {!isPivotMode && (
                <span className="ml-1 text-muted-foreground">(add Rows to switch to Pivot)</span>
              )}
            </span>
          </div>

          {/* Centre: Preview */}
          {renderPreview()}
        </div>

        {/* ── Right: Inspector tray ──────────────────────── */}
        <Tray
          side="right"
          title="Inspector"
          icon={<Settings className="size-3.5 text-muted-foreground" />}
        >
          <Tabs defaultValue="config" className="flex h-full flex-col">
            <TabsList className="w-full shrink-0">
              <TabsTrigger value="config" className="flex-1 text-xs">
                Config
              </TabsTrigger>
              <TabsTrigger value="filters" className="flex-1 text-xs">
                Filters
              </TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="flex-1 overflow-auto p-2">
              <LuzmoItemOptionPanel
                itemType={effectiveTableType}
                options={draft.options ?? {}}
                slots={normalizeSlotsContents(draft.slotsContents)}
                language="en"
                size="m"
                onLuzmoOptionsChanged={handleOptionsChanged}
              />
            </TabsContent>

            <TabsContent value="filters" className="flex-1 overflow-auto p-2">
              <LuzmoFilters
                datasetIds={datasetIds}
                filters={draft.filters ?? []}
                apiUrl={API_URL}
                language="en"
                size="m"
                onLuzmoFiltersChanged={handleFiltersChanged}
              />
            </TabsContent>
          </Tabs>
        </Tray>
      </div>

      {/* Debug panel */}
      {renderDebug()}

      {/* ── Bottom action bar ──────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t bg-muted/30 px-4 py-2.5">
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-6"
          onClick={() => setShowDebug((d) => !d)}
          title="Toggle debug panel"
        >
          <Bug className="size-3.5" />
        </Button>
        <Button size="sm" onClick={saveToDashboard} disabled={!hasContent}>
          {isEditing ? "Update Item" : "Add to Dashboard"}
        </Button>
      </div>
    </div>
  )
}
