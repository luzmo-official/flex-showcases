/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LUZMO_EMBED_KEY: string
  readonly VITE_LUZMO_EMBED_TOKEN: string
  readonly VITE_LUZMO_APP_SERVER: string
  readonly VITE_LUZMO_API_HOST: string
  readonly VITE_LUZMO_DATASET_GROUPS_ODDS: string
  readonly VITE_LUZMO_DATASET_TEAM_PROFILES: string
  readonly VITE_LUZMO_DATASET_HISTORICAL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
