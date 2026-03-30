"use client"

import type { DraftItem } from "./luzmo-types"
import type { Mode } from "./store"

const STORAGE_KEY = "bb9001-builder-state"
const ITEMS_KEY = "bb9001-dashboard-items"
const MAX_AGE_MS = 4 * 60 * 60 * 1000 // 4 hours

// ─── Builder draft persistence ────────────────────────────

export interface PersistedBuilderState {
  draft: DraftItem
  guidedDraft?: DraftItem | null
  tableDraft?: DraftItem | null
  activeMode: Mode
  guidedStep?: number
  savedAt: number
}

export function saveBuilderState(state: PersistedBuilderState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage full or unavailable — ignore
  }
}

export function loadBuilderState(): PersistedBuilderState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedBuilderState
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      clearBuilderState()
      return null
    }
    // Minimal validation
    if (!parsed.draft || typeof parsed.draft.type !== "string") {
      clearBuilderState()
      return null
    }
    return parsed
  } catch {
    clearBuilderState()
    return null
  }
}

export function clearBuilderState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

// ─── Dashboard items persistence ──────────────────────────

export function saveDashboardItems(items: unknown[]): void {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

export function loadDashboardItems(): unknown[] | null {
  try {
    const raw = localStorage.getItem(ITEMS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function clearDashboardItems(): void {
  try {
    localStorage.removeItem(ITEMS_KEY)
  } catch {
    // ignore
  }
}
