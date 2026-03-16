import { useMemo } from 'react';

export function useLuzmoAuth() {
  return useMemo(() => ({
    authKey: import.meta.env.VITE_LUZMO_AUTH_KEY || '',
    authToken: import.meta.env.VITE_LUZMO_AUTH_TOKEN || '',
    apiHost: import.meta.env.VITE_LUZMO_API_URL || 'https://api.luzmo.com',
    appServer: import.meta.env.VITE_LUZMO_APP_SERVER || 'https://app.luzmo.com',
  }), []);
}
