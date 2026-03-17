"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import dynamic from "next/dynamic"
import { useApp } from "./context"
import { ModeToggle } from "./mode-toggle"

const GuidedWizard = dynamic(() => import("./guided-wizard").then((m) => m.GuidedWizard), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading chart creator...</p>
    </div>
  ),
})

const TableBuilder = dynamic(() => import("./table-builder").then((m) => m.TableBuilder), {
  ssr: false,
})

export function AddItemDialog() {
  const { state, dispatch } = useApp()
  const isEditing = state.modal.editingItemId !== null

  return (
    <Dialog
      open={state.isAddItemOpen}
      onOpenChange={(open) =>
        dispatch({ type: "TOGGLE_ADD_ITEM", payload: open })
      }
    >
      <DialogContent
        className="flex h-[88vh] w-[92vw] !max-w-7xl flex-col gap-0 overflow-hidden p-0"
        showCloseButton
      >
        <DialogTitle className="sr-only">
          {isEditing ? "Edit Item" : "Add Item"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {isEditing
            ? "Edit the selected chart or table"
            : "Create a new chart or table for your dashboard"}
        </DialogDescription>

        {/* Sticky modal header */}
        <div className="flex shrink-0 items-center justify-center border-b bg-background px-4 py-3">
          {isEditing ? (
            <span className="text-sm font-medium text-muted-foreground">
              Editing item
            </span>
          ) : (
            <ModeToggle />
          )}
        </div>

        {/* Scrollable modal body */}
        <div className="min-h-0 flex-1 overflow-hidden">
          {state.modal.activeMode === "guided" ? (
            <GuidedWizard key={`${state.modal.resetCount}-${state.modal.editingItemId ?? "new"}`} />
          ) : (
            <TableBuilder key={`${state.modal.resetCount}-${state.modal.editingItemId ?? "new"}`} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
