"use client"

import { useMemo } from "react"

/**
 * Optional picker allow-list from NEXT_PUBLIC_LUZMO_DATASET_IDS.
 * Does not drive luzmo-filters — filters use datasets from chart slots.
 */
export function useLuzmoDatasets() {
  return useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_LUZMO_DATASET_IDS ?? ""

    const allowedDatasetIds = raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)

    return {
      allowedDatasetIds,
      error:
        allowedDatasetIds.length === 0
          ? "No NEXT_PUBLIC_LUZMO_DATASET_IDS configured"
          : null,
    }
  }, [])
}
