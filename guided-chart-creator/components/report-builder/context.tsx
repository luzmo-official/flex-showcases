"use client"

import React, { createContext, useContext, useReducer, useEffect, useRef } from "react"
import {
  type AppState,
  type Theme,
  type Mode,
  type GridMode,
  type TrayState,
  initialState,
  initialModalState,
} from "@/lib/store"
import type {
  DraftItem,
  VizItemSlots,
  ChartOptions,
  ItemFilterGroup,
  PlacedItem,
} from "@/lib/luzmo-types"
import { getDefaultDraftItem, getDefaultTableDraft } from "@/lib/luzmo-types"
import { useLuzmoDatasets } from "@/hooks/use-luzmo-datasets"
import {
  saveBuilderState,
  loadBuilderState,
  clearBuilderState,
  saveDashboardItems,
  loadDashboardItems,
} from "@/lib/builder-persistence"

// ─── Actions ──────────────────────────────────────────────
type Action =
  | { type: "SET_THEME"; payload: Theme }
  | { type: "SET_GRID_MODE"; payload: GridMode }
  | { type: "TOGGLE_ADD_ITEM"; payload: boolean }
  | { type: "SET_MODE"; payload: Mode }
  // DraftItem actions
  | { type: "SET_DRAFT"; payload: DraftItem }
  | { type: "SET_DRAFT_TYPE"; payload: string }
  | { type: "SET_DRAFT_SLOTS"; payload: VizItemSlots }
  | { type: "SET_DRAFT_OPTIONS"; payload: ChartOptions }
  | { type: "SET_DRAFT_FILTERS"; payload: ItemFilterGroup[] }
  // Tray actions
  | { type: "SET_TRAY"; payload: { tray: "left" | "right" | "top"; state: Partial<TrayState> } }
  // Dashboard item actions
  | { type: "ADD_ITEM"; payload: PlacedItem }
  | { type: "UPDATE_ITEM"; payload: PlacedItem }
  | { type: "UPDATE_ITEM_POSITIONS"; payload: PlacedItem[] }
  | { type: "REMOVE_ITEM"; payload: string }
  // Edit mode: open modal pre-filled with an existing item
  | { type: "EDIT_ITEM"; payload: string }
  | { type: "RESET_MODAL" }
  | { type: "RESET_BUILDER_DRAFT" }
  // Hydrate persisted items on load
  | { type: "HYDRATE_ITEMS"; payload: PlacedItem[] }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.payload }
    case "SET_GRID_MODE":
      return { ...state, gridMode: action.payload }
    case "TOGGLE_ADD_ITEM": {
      if (action.payload) {
        clearBuilderState()
        return {
          ...state,
          isAddItemOpen: true,
          modal: {
            ...state.modal,
            editingItemId: null,
            activeMode: "guided",
            draft: getDefaultDraftItem(),
            guidedDraft: null,
            tableDraft: null,
            resetCount: state.modal.resetCount + 1,
          },
        }
      }
      return {
        ...state,
        isAddItemOpen: false,
        modal: { ...state.modal, editingItemId: null },
      }
    }
    case "SET_MODE": {
      const newMode = action.payload
      if (newMode === state.modal.activeMode) return state
      const leavingGuided = state.modal.activeMode === "guided"
      const newGuidedDraft = leavingGuided ? state.modal.draft : state.modal.guidedDraft
      const newTableDraft = leavingGuided ? state.modal.tableDraft : state.modal.draft
      const restoredDraft = newMode === "guided"
        ? (newGuidedDraft ?? getDefaultDraftItem())
        : (newTableDraft ?? getDefaultTableDraft())
      return {
        ...state,
        modal: {
          ...state.modal,
          activeMode: newMode,
          draft: restoredDraft,
          guidedDraft: newGuidedDraft,
          tableDraft: newTableDraft,
        },
      }
    }
    case "SET_DRAFT":
      return {
        ...state,
        modal: { ...state.modal, draft: action.payload },
      }
    case "SET_DRAFT_TYPE":
      return {
        ...state,
        modal: {
          ...state.modal,
          draft: { ...state.modal.draft, type: action.payload },
        },
      }
    case "SET_DRAFT_SLOTS":
      return {
        ...state,
        modal: {
          ...state.modal,
          draft: { ...state.modal.draft, slotsContents: action.payload },
        },
      }
    case "SET_DRAFT_OPTIONS":
      return {
        ...state,
        modal: {
          ...state.modal,
          draft: { ...state.modal.draft, options: action.payload },
        },
      }
    case "SET_DRAFT_FILTERS":
      return {
        ...state,
        modal: {
          ...state.modal,
          draft: { ...state.modal.draft, filters: action.payload },
        },
      }
    case "SET_TRAY": {
      const { tray, state: trayState } = action.payload
      return {
        ...state,
        modal: {
          ...state.modal,
          tray: {
            ...state.modal.tray,
            [tray]: { ...state.modal.tray[tray], ...trayState },
          },
        },
      }
    }
    case "ADD_ITEM": {
      clearBuilderState()
      return {
        ...state,
        items: [...state.items, action.payload],
        isAddItemOpen: false,
        modal: { ...initialModalState, draft: getDefaultDraftItem(), guidedDraft: null, tableDraft: null },
      }
    }
    case "UPDATE_ITEM": {
      clearBuilderState()
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? action.payload : i,
        ),
        isAddItemOpen: false,
        modal: { ...initialModalState, draft: getDefaultDraftItem(), guidedDraft: null, tableDraft: null },
      }
    }
    case "UPDATE_ITEM_POSITIONS":
      return {
        ...state,
        items: action.payload.map((incoming) => {
          const existing = state.items.find((i) => i.id === incoming.id)
          if (existing) {
            return { ...existing, position: incoming.position }
          }
          return incoming
        }),
      }
    case "REMOVE_ITEM": {
      const wasEditing = state.modal.editingItemId === action.payload
      if (wasEditing) {
        clearBuilderState()
      }
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
        ...(wasEditing && {
          isAddItemOpen: false,
          modal: { ...initialModalState, draft: getDefaultDraftItem(), guidedDraft: null, tableDraft: null },
        }),
      }
    }
    case "EDIT_ITEM": {
      const item = state.items.find((i) => i.id === action.payload)
      if (!item) return state
      const isTable = item.type === "regular-table" || item.type === "pivot-table"
      return {
        ...state,
        isAddItemOpen: true,
        modal: {
          ...state.modal,
          editingItemId: action.payload,
          activeMode: isTable ? "table" : "guided",
          guidedDraft: null,
          tableDraft: null,
          resetCount: state.modal.resetCount + 1,
          draft: {
            type: item.type,
            slotsContents: item.slots,
            options: item.options,
            filters: item.filters,
          },
        },
      }
    }
    case "RESET_MODAL":
      clearBuilderState()
      return {
        ...state,
        modal: {
          ...initialModalState,
          draft: getDefaultDraftItem(),
          guidedDraft: null,
          tableDraft: null,
          resetCount: state.modal.resetCount + 1,
        },
      }
    case "RESET_BUILDER_DRAFT":
      clearBuilderState()
      return {
        ...state,
        modal: {
          ...state.modal,
          draft: getDefaultDraftItem(),
          guidedDraft: null,
          tableDraft: null,
          editingItemId: null,
          resetCount: state.modal.resetCount + 1,
        },
      }
    case "HYDRATE_ITEMS":
      return { ...state, items: action.payload }
    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────
interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
  datasetIds: string[]
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { datasetIds } = useLuzmoDatasets()

  // Theme persistence
  useEffect(() => {
    const saved = localStorage.getItem("rb-theme") as Theme | null
    if (saved && ["light", "dark", "win95"].includes(saved)) {
      dispatch({ type: "SET_THEME", payload: saved })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("rb-theme", state.theme)
    const root = document.documentElement
    root.classList.remove("dark", "win95")
    if (state.theme === "dark") root.classList.add("dark")
    if (state.theme === "win95") root.classList.add("win95")
  }, [state.theme])

  // Hydrate dashboard items from localStorage
  const hydratedRef = useRef(false)
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    const saved = loadDashboardItems()
    if (saved && saved.length > 0) {
      dispatch({ type: "HYDRATE_ITEMS", payload: saved as PlacedItem[] })
    }
  }, [])

  // Persist dashboard items whenever they change
  useEffect(() => {
    if (hydratedRef.current && state.items.length >= 0) {
      saveDashboardItems(state.items)
    }
  }, [state.items])

  // Persist builder draft whenever it changes (only when modal is open)
  useEffect(() => {
    if (state.isAddItemOpen && !state.modal.editingItemId) {
      saveBuilderState({
        draft: state.modal.draft,
        guidedDraft: state.modal.guidedDraft,
        tableDraft: state.modal.tableDraft,
        activeMode: state.modal.activeMode,
        savedAt: Date.now(),
      })
    }
  }, [state.modal.draft, state.modal.guidedDraft, state.modal.tableDraft, state.modal.activeMode, state.isAddItemOpen, state.modal.editingItemId])

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        datasetIds,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be inside AppProvider")
  return ctx
}
