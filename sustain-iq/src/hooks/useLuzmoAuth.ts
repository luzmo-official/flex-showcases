import { useState, useEffect } from 'react';

interface AuthState {
  key: string | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

/** Reads Luzmo embed credentials from environment variables. */
export function useLuzmoAuth() {
  const [auth, setAuth] = useState<AuthState>({
    key: null,
    token: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const key = import.meta.env.VITE_LUZMO_EMBED_KEY || '';
    const token = import.meta.env.VITE_LUZMO_EMBED_TOKEN || '';

    if (key && token) {
      setAuth({ key, token, loading: false, error: null });
    } else {
      setAuth({
        key: null,
        token: null,
        loading: false,
        error: 'Missing VITE_LUZMO_EMBED_KEY or VITE_LUZMO_EMBED_TOKEN in environment variables.',
      });
    }
  }, []);

  const refresh = () => {
    /* No-op for static tokens — included for API compatibility */
  };

  return { ...auth, refresh };
}
