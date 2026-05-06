import { useState, useCallback, useEffect, useRef } from 'react';

import { DATASET_ID, COLUMNS } from '../dataset';

import type { LuzmoFilter } from '../types';

interface Props {
  authKey: string;
  authToken: string;
  onFiltersChanged: (filters: LuzmoFilter[]) => void;
}

interface FilterDimension {
  key: string;
  label: string;
  columnId: string;
  values: string[];
  loading: boolean;
}

const FILTER_DIMENSIONS = [
  { key: 'industry', label: 'Industry', columnId: COLUMNS.industry },
  { key: 'city', label: 'City', columnId: COLUMNS.city },
  { key: 'region', label: 'Country', columnId: COLUMNS.region },
  { key: 'energySource', label: 'Energy Source', columnId: COLUMNS.energySource },
];

export function TeamPicker({ authKey, authToken, onFiltersChanged }: Props) {
  const [dimensions, setDimensions] = useState<FilterDimension[]>(
    FILTER_DIMENSIONS.map(d => ({ ...d, values: [], loading: false }))
  );
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [pendingSelections, setPendingSelections] = useState<Record<string, string>>({});
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const activeCount = Object.values(selections).filter(Boolean).length;

  // Fetch all dimension values in parallel when popup opens
  const fetchAllValues = useCallback(async () => {
    const toFetch = FILTER_DIMENSIONS.filter(dim => {
      const existing = dimensions.find(d => d.key === dim.key);
      return !existing || existing.values.length === 0;
    });
    if (toFetch.length === 0) return;

    setDimensions(prev => prev.map(d =>
      toFetch.some(f => f.key === d.key) ? { ...d, loading: true } : d
    ));

    const apiHost = import.meta.env.VITE_LUZMO_API_HOST || 'https://api.luzmo.com';
    await Promise.all(toFetch.map(async (dim) => {
      try {
        const res = await fetch(`${apiHost}/0.1.0/data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get',
            key: authKey,
            token: authToken,
            version: '0.1.0',
            find: {
              queries: [{
                dimensions: [{ dataset_id: DATASET_ID, column_id: dim.columnId }],
                measures: [],
              }],
            },
          }),
        });
        const data = await res.json() as { rows?: unknown[]; data?: unknown[] };
        const rows = data?.rows ?? (Array.isArray(data?.data) ? data.data : []);
        const values = rows
          .map((r: unknown) => {
            const cell = Array.isArray(r) ? r[0] : r;
            if (cell && typeof cell === 'object' && 'id' in cell) return (cell as { id: string }).id;
            return cell;
          })
          .filter((v): v is string => v != null && v !== '')
          .sort((a, b) => String(a).localeCompare(String(b)));
        setDimensions(prev => prev.map(d =>
          d.key === dim.key ? { ...d, values, loading: false } : d
        ));
      } catch (err) {
        console.error(`Failed to fetch ${dim.label} values:`, err);
        setDimensions(prev => prev.map(d =>
          d.key === dim.key ? { ...d, loading: false } : d
        ));
      }
    }));
  }, [authKey, authToken, dimensions]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setPendingSelections(selections);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, selections]);

  // Preload filter values as soon as auth is available
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (authKey && authToken && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchAllValues();
    }
  }, [authKey, authToken]);

  const handleOpen = () => {
    setPendingSelections({ ...selections });
    setIsOpen(true);
    fetchAllValues();
  };

  const handleApply = () => {
    const newSelections = { ...pendingSelections };
    // Remove empty values
    for (const key of Object.keys(newSelections)) {
      if (!newSelections[key]) delete newSelections[key];
    }
    setSelections(newSelections);
    setIsOpen(false);

    const filters: LuzmoFilter[] = [];
    for (const [key, value] of Object.entries(newSelections)) {
      if (!value) continue;
      const dim = FILTER_DIMENSIONS.find(d => d.key === key);
      if (!dim) continue;
      filters.push({
        condition: 'or',
        origin: 'global',
        datasetId: DATASET_ID,
        filters: [{
          expression: '? = ?',
          parameters: [
            { columnId: dim.columnId, datasetId: DATASET_ID },
            value,
          ],
        }],
      });
    }
    onFiltersChanged(filters);
  };

  const handleClear = () => {
    setPendingSelections({});
    setSelections({});
    setIsOpen(false);
    onFiltersChanged([]);
  };

  const handleClearAll = () => {
    setSelections({});
    setPendingSelections({});
    setIsOpen(false);
    onFiltersChanged([]);
  };

  return (
    <div className="filter-popup-wrap" ref={popupRef}>
      <button
        className={`filter-trigger ${activeCount > 0 ? 'filter-trigger-active' : ''}`}
        onClick={handleOpen}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filters
        {activeCount > 0 && <span className="filter-trigger-badge">{activeCount}</span>}
      </button>

      {activeCount > 0 && !isOpen && (
        <button className="filter-clear-btn" onClick={handleClearAll} title="Clear all filters">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="filter-popup">
          <div className="filter-popup-header">
            <span className="filter-popup-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filter Data
            </span>
            <button className="filter-popup-close" onClick={() => { setIsOpen(false); setPendingSelections(selections); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="filter-popup-body">
            {dimensions.map(dim => (
              <div key={dim.key} className="filter-popup-field">
                <label className="filter-popup-label">{dim.label}</label>
                {dim.loading ? (
                  <div className="filter-popup-loading">Loading...</div>
                ) : (
                  <select
                    className="filter-popup-select"
                    value={pendingSelections[dim.key] || ''}
                    onChange={e => setPendingSelections(prev => ({ ...prev, [dim.key]: e.target.value }))}
                  >
                    <option value="">All</option>
                    {dim.values.map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          <div className="filter-popup-footer">
            <button className="filter-popup-clear" onClick={handleClear}>Clear all</button>
            <button className="filter-popup-apply" onClick={handleApply}>
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
