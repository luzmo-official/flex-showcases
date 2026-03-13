import { ref, type Ref } from 'vue'

export interface LuzmoColumn {
  id: string
  name?: Record<string, string>
  source_name?: string
}

const columnCache = new Map<string, { columns: LuzmoColumn[]; timestamp: number }>()
const CACHE_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Fetches columns for a Luzmo dataset via the embed token.
 * Returns a map of column source_name (or first name) -> column id for easy lookup.
 */
export async function fetchDatasetColumns(
  apiHost: string,
  authKey: string,
  authToken: string,
  datasetId: string
): Promise<LuzmoColumn[]> {
  const cacheKey = `${datasetId}`
  const cached = columnCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_MS) {
    return cached.columns
  }

  // Direct fetch to Luzmo API - version goes in body, not URL
  const url = `${apiHost.replace(/\/$/, '')}/api/column`
  const body = {
    action: 'search',
    version: '0.1.0',
    key: authKey,
    token: authToken,
    find: {
      attributes: ['id', 'name', 'source_name'],
      include: [
        {
          model: 'Securable',
          where: { id: datasetId },
          jointype: 'inner',
        },
      ],
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`Luzmo columns fetch failed: ${res.status}`)
  }

  const data = await res.json()
  // Luzmo Search Column API returns { count, rows } (see developer.luzmo.com/api/searchColumn)
  const raw =
    Array.isArray(data)
      ? data
      : data?.rows ?? data?.data ?? data?.results ?? data?.result ?? data?.columns ?? []
  const columns: LuzmoColumn[] = Array.isArray(raw) ? raw : []
  columnCache.set(cacheKey, { columns, timestamp: Date.now() })
  return columns
}

/**
 * Composable: fetch columns for a dataset and expose a map of name -> columnId.
 */
export function useLuzmoColumns(
  apiHost: Ref<string>,
  authKey: Ref<string>,
  authToken: Ref<string>,
  datasetId: Ref<string>
) {
  const columns: Ref<LuzmoColumn[]> = ref([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /** Map from source_name or name.en to column id */
  const columnIdByName = ref<Record<string, string>>({})

  async function load() {
    if (!apiHost.value || !authKey.value || !authToken.value || !datasetId.value) {
      return
    }
    loading.value = true
    error.value = null
    try {
      const list = await fetchDatasetColumns(
        apiHost.value,
        authKey.value,
        authToken.value,
        datasetId.value
      )
      columns.value = list
      const map: Record<string, string> = {}
      for (const col of list) {
        const nameKey = col.name ? Object.keys(col.name)[0] : undefined
        const name = col.source_name ?? col.name?.en ?? (nameKey && col.name ? col.name[nameKey] : undefined) ?? col.id
        map[name] = col.id
        map[col.id] = col.id
      }
      columnIdByName.value = map
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
      columns.value = []
      columnIdByName.value = {}
    } finally {
      loading.value = false
    }
  }

  return { columns, columnIdByName, loading, error, load }
}
