// ---------------------------------------------------------------------------
// Luzmo Configuration
// ---------------------------------------------------------------------------
// Reads Luzmo embed credentials and collection ID from Vite environment variables.
// Embed key-token pairs are scoped and safe to use from the browser.

export const luzmoConfig = {
  embedKey: import.meta.env.VITE_LUZMO_EMBED_KEY as string,
  embedToken: import.meta.env.VITE_LUZMO_EMBED_TOKEN as string,
  collectionId: import.meta.env.VITE_COLLECTION_ID as string,
};

/** Luzmo host URLs shared by all SDK components and API calls. */
export const luzmoHosts = {
  appServer: 'https://app.luzmo.com',
  apiHost: 'https://api.luzmo.com',
} as const;

/** Base URL for Luzmo REST API endpoints. */
export const LUZMO_API_BASE = 'https://api.luzmo.com/0.1.0';
