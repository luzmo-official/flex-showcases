"use client"

import type { DraftItem, PlacedItem } from "./luzmo-types"
import { getDefaultDraftItem, getDefaultTableDraft } from "./luzmo-types"

// ─── Types ────────────────────────────────────────────────
export type Theme = "light" | "dark" | "win95"
export type Mode = "guided" | "table"
export type GridMode = "view" | "edit"

export interface TrayState {
  pinned: boolean
  collapsed: boolean
}

export interface ModalState {
  activeMode: Mode
  draft: DraftItem
  guidedDraft: DraftItem | null
  tableDraft: DraftItem | null
  editingItemId: string | null
  resetCount: number
  tray: {
    left: TrayState
    right: TrayState
    top: TrayState
  }
}

export interface AppState {
  theme: Theme
  gridMode: GridMode
  items: PlacedItem[]
  isAddItemOpen: boolean
  modal: ModalState
}

// ─── Initial state ────────────────────────────────────────
export const initialModalState: ModalState = {
  activeMode: "guided",
  draft: getDefaultDraftItem(),
  guidedDraft: null,
  tableDraft: null,
  editingItemId: null,
  resetCount: 0,
  tray: {
    left: { pinned: false, collapsed: false },
    right: { pinned: false, collapsed: false },
    top: { pinned: false, collapsed: false },
  },
}

export const initialState: AppState = {
  theme: "light",
  gridMode: "view",
  items: [],
  isAddItemOpen: false,
  modal: { ...initialModalState },
}
