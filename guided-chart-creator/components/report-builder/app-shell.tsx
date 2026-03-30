"use client"

import { AppProvider } from "./context"
import { TopBar } from "./top-bar"
import { Canvas } from "./canvas"
import { AddItemDialog } from "./add-item-dialog"

export function AppShell() {
  return (
    <AppProvider>
      <div className="flex h-screen flex-col bg-background">
        <TopBar />
        <Canvas />
        <AddItemDialog />
      </div>
    </AppProvider>
  )
}
