import { ref, type Ref, onUnmounted } from 'vue'

export interface ColumnWithDataset {
  id: string
  name: string
  datasetId: string
}

/**
 * Extract columns from a Luzmo draggable-data-fields-panel component.
 * This observes the component's shadow DOM and extracts field information
 * when it loads, avoiding the need for separate API calls.
 */
export function useAllDatasetColumns(
  _apiHost: Ref<string>,
  _authKey: Ref<string>,
  _authToken: Ref<string>,
  _allDatasetIds: Ref<string[]>
) {
  const columnsWithDataset = ref<ColumnWithDataset[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  let panelRef: HTMLElement | null = null
  let observer: MutationObserver | null = null
  let checkInterval: ReturnType<typeof setInterval> | null = null

  /**
   * Extract field data from the Luzmo panel's shadow DOM
   */
  function extractFieldsFromPanel(): ColumnWithDataset[] {
    if (!panelRef) return []

    const fields: ColumnWithDataset[] = []
    const shadowRoot = panelRef.shadowRoot

    if (!shadowRoot) {
      console.log('[useAllDatasetColumns] No shadow root found')
      return []
    }

    // The Luzmo panel renders draggable items with data attributes
    // Look for elements that represent columns/fields
    const draggableItems = shadowRoot.querySelectorAll('[draggable="true"]')
    console.log('[useAllDatasetColumns] Found draggable items:', draggableItems.length)

    draggableItems.forEach((item) => {
      // Try to get column ID and dataset ID from data attributes or element structure
      const columnId = item.getAttribute('data-column-id') || 
                       item.getAttribute('data-id') ||
                       (item as HTMLElement).dataset?.columnId ||
                       (item as HTMLElement).dataset?.id
      const datasetId = item.getAttribute('data-dataset-id') ||
                        item.getAttribute('data-set') ||
                        (item as HTMLElement).dataset?.datasetId ||
                        (item as HTMLElement).dataset?.set
      
      // Get the display name from the text content or a label element
      const nameElement = item.querySelector('.field-name, .column-name, [class*="name"]') || item
      const name = nameElement.textContent?.trim() || columnId || 'Unknown'

      if (columnId) {
        fields.push({
          id: columnId,
          name,
          datasetId: datasetId || ''
        })
      }
    })

    // If no draggable items with IDs, try looking for any field list items
    if (fields.length === 0) {
      const listItems = shadowRoot.querySelectorAll('li, [role="listitem"], .field-item, .column-item')
      console.log('[useAllDatasetColumns] Trying list items:', listItems.length)
      
      listItems.forEach((item, index) => {
        const text = item.textContent?.trim()
        if (text && text.length > 0 && text.length < 100) {
          fields.push({
            id: `field-${index}`,
            name: text,
            datasetId: ''
          })
        }
      })
    }

    return fields
  }

  /**
   * Set up observation of the Luzmo panel
   */
  function observePanel(panel: HTMLElement) {
    panelRef = panel
    loading.value = true
    error.value = null

    // Function to check and extract fields
    const checkFields = () => {
      const fields = extractFieldsFromPanel()
      if (fields.length > 0) {
        columnsWithDataset.value = fields
        loading.value = false
        console.log('[useAllDatasetColumns] Extracted fields:', fields.length)
        
        // Stop checking once we have fields
        if (checkInterval) {
          clearInterval(checkInterval)
          checkInterval = null
        }
      }
    }

    // Set up a MutationObserver on the shadow root if available
    const shadowRoot = panel.shadowRoot
    if (shadowRoot) {
      observer = new MutationObserver(() => {
        checkFields()
      })
      observer.observe(shadowRoot, {
        childList: true,
        subtree: true,
        attributes: true
      })
    }

    // Also poll periodically as a fallback
    checkInterval = setInterval(() => {
      checkFields()
    }, 500)

    // Initial check
    setTimeout(checkFields, 100)

    // Stop loading after timeout if no fields found
    setTimeout(() => {
      if (loading.value && columnsWithDataset.value.length === 0) {
        loading.value = false
        // Not an error - just means we should use the drag panel
        console.log('[useAllDatasetColumns] Timeout waiting for fields, use drag panel instead')
      }
      if (checkInterval) {
        clearInterval(checkInterval)
        checkInterval = null
      }
    }, 5000)
  }

  /**
   * Stop observing
   */
  function stopObserving() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopObserving()
  })

  /**
   * Legacy load function - now a no-op since we observe the panel instead
   */
  function load() {
    // No-op - use observePanel instead
    console.log('[useAllDatasetColumns] load() called - use observePanel(panelRef) instead')
  }

  return { 
    columnsWithDataset, 
    loading, 
    error, 
    load,
    observePanel,
    stopObserving
  }
}
