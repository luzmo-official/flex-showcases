"use client"

import { useMemo } from "react"

/**
 * Reads Luzmo dataset IDs from the NEXT_PUBLIC_LUZMO_DATASET_IDS env var.
 */
export function useLuzmoDatasets() {
  return useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_LUZMO_DATASET_IDS ?? ""

    const datasetIds = raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)

    return {
      datasetIds,
      error:
        datasetIds.length === 0
          ? "No NEXT_PUBLIC_LUZMO_DATASET_IDS configured"
          : null,
    }
  }, [])
}
