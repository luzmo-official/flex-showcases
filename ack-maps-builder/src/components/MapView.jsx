import { useEffect, useRef } from 'react';

export default function MapView({ auth, mapSlots, onFiltersChanged }) {
  const vizRef = useRef(null);

  useEffect(() => {
    const el = vizRef.current;
    if (!el) return;

    el.type = 'drill-thru-map';
    el.slots = mapSlots;
    el.canFilter = 'all';
    el.authKey = auth.authKey;
    el.authToken = auth.authToken;
    el.appServer = auth.appServer;
    el.apiHost = auth.apiHost;
    el.options = {
      display: { title: true },
      title: { en: 'Drill Through Map' },
    };
  }, [auth, mapSlots]);

  // Listen for DOM events dispatched by the viz item (if the embed relays them)
  useEffect(() => {
    const el = vizRef.current;
    if (!el) return;

    const handleChangedFilters = (e) => {
      const filters = e?.detail?.data?.filters
        ?? e?.detail?.filters
        ?? e?.detail?.changed
        ?? [];
      onFiltersChanged?.(filters);
    };

    const handleCustomEvent = () => {
      try {
        const filters = el.getFilters?.() ?? [];
        onFiltersChanged?.(filters);
      } catch { /* not ready */ }
    };

    el.addEventListener('changedFilters', handleChangedFilters);
    el.addEventListener('customEvent', handleCustomEvent);
    return () => {
      el.removeEventListener('changedFilters', handleChangedFilters);
      el.removeEventListener('customEvent', handleCustomEvent);
    };
  }, [onFiltersChanged]);

  // Intercept postMessage from the Luzmo iframe — the custom chart sends
  // { type: 'setFilter', filters } and { type: 'customEvent', data } via
  // window.parent.postMessage. The embed infrastructure's __luzmoMessageHandler
  // ignores these for standalone viz items, so we catch them ourselves.
  useEffect(() => {
    const handler = (event) => {
      const msg = event.data;
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'setFilter') {
        onFiltersChanged?.(msg.filters ?? []);
      } else if (msg.type === 'changedFilters') {
        onFiltersChanged?.(msg.filters ?? msg.changed ?? []);
      } else if (msg.type === 'customEvent' && msg.data?.eventType === 'selectionCleared') {
        onFiltersChanged?.([]);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onFiltersChanged]);

  return (
    <div className="map-wrapper">
      <luzmo-embed-viz-item
        ref={vizRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
