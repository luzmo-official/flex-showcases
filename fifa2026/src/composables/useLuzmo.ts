import { ref, computed } from 'vue'

/**
 * Composable for managing Luzmo embedding credentials and dataset configuration.
 *
 * Required env variables (in .env file):
 *   VITE_LUZMO_EMBED_KEY - Luzmo embedding API key (see https://developer.luzmo.com/guide/dashboard-embedding--generating-an-authorization-token)
 *   VITE_LUZMO_EMBED_TOKEN - Luzmo embedding token; must have "use" rights over the datasets used below
 *   VITE_LUZMO_APP_SERVER - Luzmo app server URL (default: https://app.luzmo.com)
 *   VITE_LUZMO_API_HOST - Luzmo API host URL (default: https://api.luzmo.com)
 *   VITE_LUZMO_DATASET_GROUPS_ODDS - Dataset ID for WC2026 groups & odds
 *   VITE_LUZMO_DATASET_TEAM_PROFILES - Dataset ID for team profiles
 *   VITE_LUZMO_DATASET_HISTORICAL - Dataset ID for historical WC data
 */
export function useLuzmo() {
  const apiKey = ref(import.meta.env.VITE_LUZMO_EMBED_KEY || '')
  const apiToken = ref(import.meta.env.VITE_LUZMO_EMBED_TOKEN || '')
  const appServer = ref(
    import.meta.env.VITE_LUZMO_APP_SERVER || 'https://app.luzmo.com'
  )
  const apiHost = ref(
    import.meta.env.VITE_LUZMO_API_HOST || 'https://api.luzmo.com'
  )

  // Dataset IDs
  const datasetGroupsOdds = ref(import.meta.env.VITE_LUZMO_DATASET_GROUPS_ODDS || '')
  const datasetTeamProfiles = ref(import.meta.env.VITE_LUZMO_DATASET_TEAM_PROFILES || '')
  const datasetHistorical = ref(import.meta.env.VITE_LUZMO_DATASET_HISTORICAL || '')

  /** All dataset IDs as an array (for components that accept datasetIds) */
  const allDatasetIds = computed(() =>
    [datasetGroupsOdds.value, datasetTeamProfiles.value, datasetHistorical.value].filter(Boolean)
  )

  const isConfigured = Boolean(apiKey.value && apiToken.value)

  return {
    apiKey,
    apiToken,
    appServer,
    apiHost,
    datasetGroupsOdds,
    datasetTeamProfiles,
    datasetHistorical,
    allDatasetIds,
    isConfigured,
  }
}
