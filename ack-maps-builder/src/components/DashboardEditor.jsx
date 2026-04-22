import { useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import '@luzmo/analytics-components-kit/item-grid';

function buildGeoFilterGroups(selectionBounds, datasetId, latColumnId, lonColumnId) {
  if (!selectionBounds || !datasetId || !latColumnId || !lonColumnId) return [];

  const { minLat, maxLat, minLon, maxLon } = selectionBounds;

  return [
    {
      condition: 'and',
      filters: [
        { expression: '? >= ?', parameters: [{ columnId: latColumnId, datasetId }, minLat] },
        { expression: '? <= ?', parameters: [{ columnId: latColumnId, datasetId }, maxLat] },
        { expression: '? >= ?', parameters: [{ columnId: lonColumnId, datasetId }, minLon] },
        { expression: '? <= ?', parameters: [{ columnId: lonColumnId, datasetId }, maxLon] },
      ],
      subGroups: [],
    },
  ];
}

export default function DashboardEditor({ dashboard, auth, geoContext, mapFilters = [], onAddItem }) {
  const gridRef = useRef(null);
  const { theme } = useTheme();
  const { items, setSelectedItemId, removeItem, cloneItem, syncPositions } = dashboard;
  const { authKey, authToken, apiHost, appServer } = auth;
  const { selectionBounds, datasetId, latColumnId, lonColumnId } = geoContext || {};

  const gridTheme = useMemo(
    () => ({ id: theme === 'dark' ? 'default_dark' : 'default' }),
    [theme]
  );

  const geoFilterGroups = useMemo(
    () => buildGeoFilterGroups(selectionBounds, datasetId, latColumnId, lonColumnId),
    [selectionBounds, datasetId, latColumnId, lonColumnId]
  );

  // Wrap raw filter expressions from the map into a FilterGroup if needed
  const mapFilterGroups = useMemo(() => {
    if (!mapFilters || mapFilters.length === 0) return [];
    // If the map already sent FilterGroup objects (with a condition/filters shape), use as-is
    const first = mapFilters[0];
    if (first.condition && first.filters) return mapFilters;
    // Otherwise wrap bare filter expressions into a single AND group
    return [{ condition: 'and', filters: mapFilters, subGroups: [] }];
  }, [mapFilters]);

  // Merge all filter sources into each item before handing to the grid.
  const allFilterGroups = useMemo(
    () => [...geoFilterGroups, ...mapFilterGroups],
    [geoFilterGroups, mapFilterGroups]
  );

  const mergedItems = useMemo(() => {
    if (allFilterGroups.length === 0) return items;
    return items.map((item) => ({
      ...item,
      filters: [...(item.filters || []), ...allFilterGroups],
    }));
  }, [items, allFilterGroups]);

  // Sync ALL properties to the grid via JavaScript
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    el.items = mergedItems;
    el.theme = gridTheme;
    el.appServer = appServer;
    el.apiHost = apiHost;
    el.authKey = authKey;
    el.authToken = authToken;
    el.language = 'en';
    el.contentLanguage = 'en';
    el.columns = 48;
    el.rowHeight = 16;
  }, [mergedItems, gridTheme, appServer, apiHost, authKey, authToken]);

  // Grid event listeners
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const handleChanged = (e) => {
      const gridItems = e.detail?.items;
      if (gridItems) syncPositions(gridItems);
    };

    const handleAction = (e) => {
      console.log('[DashboardEditor] grid action event detail:', JSON.stringify(e.detail, (k, v) => v instanceof HTMLElement ? '<HTMLElement>' : v));
      const { action, id, deletedId } = e.detail || {};
      console.log('[DashboardEditor] action=%s id=%s deletedId=%s', action, id, deletedId);
      if (action === 'edit-data' || action === 'item-options') {
        setSelectedItemId(id);
      } else if (action === 'delete') {
        removeItem(deletedId || id);
      } else if (action === 'clone') {
        cloneItem(id);
      }
    };

    el.addEventListener('luzmo-item-grid-changed', handleChanged);
    el.addEventListener('luzmo-item-grid-item-action', handleAction);

    return () => {
      el.removeEventListener('luzmo-item-grid-changed', handleChanged);
      el.removeEventListener('luzmo-item-grid-item-action', handleAction);
    };
  }, [syncPositions, setSelectedItemId, removeItem, cloneItem]);

  const hasGeoFilter = allFilterGroups.length > 0;

  return (
    <div className="dashboard-wrapper">
      {items.length === 0 && (
        <div className="dashboard-empty" onClick={onAddItem} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onAddItem?.(); }}>
          <div className="dashboard-empty-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--app-accent)' }}>
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div className="dashboard-empty-title">No items yet</div>
          <div className="dashboard-empty-hint">
            Click here or press <kbd>+ Add Item</kbd> to add Luzmo charts.
          </div>
        </div>
      )}

      {hasGeoFilter && items.length > 0 && (
        <div className="geo-filter-badge">
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--app-success, #22c55e)',
            boxShadow: '0 0 6px var(--app-success, #22c55e)',
          }} />
          <span className="text-xs text-mono">Geo-filter active</span>
        </div>
      )}

      <luzmo-item-grid
        ref={gridRef}
        style={items.length === 0 ? { display: 'none' } : undefined}
      />
    </div>
  );
}
