"use client"

/**
 * Role buckets placeholder. Full implementation in Phase 4 (Table Builder).
 */
export function RoleBuckets() {
  return (
    <div className="flex gap-3">
      <div className="flex-1 rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
        Columns
      </div>
      <div className="flex-1 rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
        Measures
      </div>
      <div className="flex-1 rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
        Rows
      </div>
    </div>
  )
}
