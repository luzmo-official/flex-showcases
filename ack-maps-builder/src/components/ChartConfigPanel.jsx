import { useEffect, useRef, useMemo } from 'react';
import '@luzmo/analytics-components-kit/item-slot-picker-panel';
import '@luzmo/analytics-components-kit/item-slot-drop-panel';
import '@luzmo/analytics-components-kit/item-option-panel';
import '@luzmo/analytics-components-kit/filters';

export default function ChartConfigPanel({ item, auth, geoContext, onSlotsChange, onOptionsChange, onFiltersChange }) {
  const pickerRef = useRef(null);
  const editRef = useRef(null);
  const filtersRef = useRef(null);

  const { authKey, authToken, apiHost } = auth;
  const geoDatasetId = geoContext?.datasetId;

  // Collect all dataset IDs used by the current item + the map dataset
  const datasetIds = useMemo(() => {
    const ids = new Set();
    if (geoDatasetId) ids.add(geoDatasetId);
    if (item?.slots) {
      for (const slot of item.slots) {
        for (const content of slot.content || []) {
          const dsId = content.datasetId || content.set;
          if (dsId) ids.add(dsId);
        }
      }
    }
    return [...ids];
  }, [item?.slots, geoDatasetId]);

  // Sync picker panel properties via JS
  useEffect(() => {
    const el = pickerRef.current;
    if (!el || !item) return;
    el.itemType = item.type;
    el.slotsContents = item.slots || [];
    el.language = 'en';
    el.contentLanguage = 'en';
    el.size = 's';
    el.datasetPicker = true;
    el.grows = true;
    el.apiUrl = apiHost;
    el.authKey = authKey;
    el.authToken = authToken;
  }, [item?.slots, item?.type, apiHost, authKey, authToken]);

  // Sync item-option-panel properties via JS
  useEffect(() => {
    const el = editRef.current;
    if (!el || !item) return;
    el.itemType = item.type;
    el.options = item.options || {};
    el.slots = item.slots || [];
    el.language = 'en';
    el.size = 's';
    el.apiUrl = apiHost;
    el.authKey = authKey;
    el.authToken = authToken;
  }, [item?.options, item?.slots, item?.type, apiHost, authKey, authToken]);

  // Sync filter properties via JS
  useEffect(() => {
    const el = filtersRef.current;
    if (!el || !item) return;
    el.filters = item.filters || [];
    el.datasetIds = datasetIds;
    el.language = 'en';
    el.size = 's';
    el.apiUrl = apiHost;
    el.authKey = authKey;
    el.authToken = authToken;
  }, [item?.filters, item?.type, datasetIds, apiHost, authKey, authToken]);

  // Event listeners
  useEffect(() => {
    const picker = pickerRef.current;
    const edit = editRef.current;
    const filters = filtersRef.current;

    const handleSlotsChanged = (e) => {
      const slotsContents = e.detail?.slotsContents;
      if (slotsContents && item) {
        onSlotsChange(item.id, slotsContents);
      }
    };

    const handleOptionsChanged = (e) => {
      const options = e.detail?.options;
      if (options && item) {
        onOptionsChange(item.id, options);
      }
    };

    const handleFiltersChanged = (e) => {
      const filterGroups = e.detail?.filters;
      if (filterGroups && item) {
        onFiltersChange(item.id, filterGroups);
      }
    };

    picker?.addEventListener('luzmo-slots-contents-changed', handleSlotsChanged);
    edit?.addEventListener('luzmo-options-changed', handleOptionsChanged);
    filters?.addEventListener('luzmo-filters-changed', handleFiltersChanged);

    return () => {
      picker?.removeEventListener('luzmo-slots-contents-changed', handleSlotsChanged);
      edit?.removeEventListener('luzmo-options-changed', handleOptionsChanged);
      filters?.removeEventListener('luzmo-filters-changed', handleFiltersChanged);
    };
  }, [item?.id, onSlotsChange, onOptionsChange, onFiltersChange]);

  if (!item) {
    return (
      <div className="panel-section" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, opacity: 0.3 }}>&#9881;</span>
          <span className="text-sm text-muted">
            Select a dashboard item to configure.
          </span>
        </div>
      </div>
    );
  }

  const hasGeoFilter = Boolean(geoContext?.selectionBounds);

  return (
    <div className="flex-col" style={{ gap: 0 }}>
      <div className="panel-section">
        <div className="panel-heading">Active Item</div>
        <span className="cat-badge" style={{ marginTop: 2 }}>{item.type}</span>
      </div>

      {hasGeoFilter && (
        <div className="panel-section" style={{ padding: '6px 12px' }}>
          <div className="geo-filter-badge">
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--app-success, #22c55e)',
              boxShadow: '0 0 6px var(--app-success, #22c55e)',
            }} />
            <span className="text-xs text-mono">Geo-filter applied from map</span>
          </div>
        </div>
      )}

      <luzmo-accordion allow-multiple size="s" density="spacious">
        <luzmo-accordion-item label="Chart configuration" open>
          <div style={{ padding: '8px 4px' }}>
            <luzmo-item-slot-picker-panel ref={pickerRef} />
          </div>
        </luzmo-accordion-item>

        <luzmo-accordion-item label="Options">
          <div style={{ padding: '8px 4px' }}>
            <luzmo-item-option-panel ref={editRef} />
          </div>
        </luzmo-accordion-item>

        <luzmo-accordion-item label="Filters">
          <div style={{ padding: '8px 4px' }}>
            <luzmo-filters ref={filtersRef} />
          </div>
        </luzmo-accordion-item>
      </luzmo-accordion>
    </div>
  );
}
