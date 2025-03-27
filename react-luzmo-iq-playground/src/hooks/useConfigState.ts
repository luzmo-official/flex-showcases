import { useState, useCallback } from "react";
import { Config } from "../types/config";

const defaultAppServer = "https://app.luzmo.com/";
const defaultApiHost = "https://api.luzmo.com/";

/**
 * Custom hook to manage configuration state and URL parameters for this example app.
 * This is not a requirement for Luzmo IQ, but handles
 * configuration and state management for the app.
 *
 * Manages:
 * - Configuration state (app server, API host, auth credentials)
 * - URL parameter synchronization
 * - Chat visibility state
 */
export function useConfigState() {
  // Get initial values from URL parameters
  const params = new URLSearchParams(window.location.search);

  const [config, setConfig] = useState<Config>({
    appServer: params.get("appServer") || defaultAppServer,
    apiHost: params.get("apiHost") || defaultApiHost,
    authKey: params.get("authKey") || "",
    authToken: params.get("authToken") || "",
  });
  const [showChat, setShowChat] = useState(false);

  const handleConfigSubmit = (newConfig: Config) => {
    setConfig(newConfig);
    // Update URL parameters
    const newParams = new URLSearchParams();
    Object.entries(newConfig).forEach(([key, value]) => {
      newParams.set(key, value);
    });
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${newParams.toString()}`
    );
  };

  const resetConfig = useCallback(() => {
    // Clear URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete("authKey");
    url.searchParams.delete("authToken");
    url.searchParams.delete("appServer");
    url.searchParams.delete("apiHost");
    window.history.replaceState({}, "", url);

    // Reset state
    setConfig({
      authKey: "",
      authToken: "",
      appServer: defaultAppServer,
      apiHost: defaultApiHost,
    });
    setShowChat(false);
  }, [defaultAppServer, defaultApiHost]);

  return {
    config,
    showChat,
    setShowChat,
    handleConfigSubmit,
    defaultAppServer,
    defaultApiHost,
    resetConfig,
  };
}
