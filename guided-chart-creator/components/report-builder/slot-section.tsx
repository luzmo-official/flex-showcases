import type { ReactNode } from "react"

interface SlotSectionProps {
  title: string
  description?: string
  children: ReactNode
}

export function SlotSection({ title, description, children }: SlotSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
