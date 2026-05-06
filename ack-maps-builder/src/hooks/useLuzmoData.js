import { useState, useCallback, useMemo } from 'react';

const DEFAULT_DATASET_ID = '20803a2a-145a-40b0-bca3-4735835b5d68';
const DEFAULT_LAT_COLUMN_ID = 'a907788b-2054-42ca-a04f-569f7503228b';
const DEFAULT_LON_COLUMN_ID = 'c385708a-bd7a-4349-87b5-bf62398810d1';

const DEFAULT_MAP_SLOTS = [
  {
    name: 'x-axis',
    content: [{
      set: DEFAULT_DATASET_ID,
      column: DEFAULT_LAT_COLUMN_ID,
      datasetId: DEFAULT_DATASET_ID,
      columnId: DEFAULT_LAT_COLUMN_ID,
    }],
  },
  {
    name: 'y-axis',
    content: [{
      set: DEFAULT_DATASET_ID,
      column: DEFAULT_LON_COLUMN_ID,
      datasetId: DEFAULT_DATASET_ID,
      columnId: DEFAULT_LON_COLUMN_ID,
    }],
  },
];

export function useLuzmoData(auth) {
  const { authKey, authToken, apiHost } = auth;

  const [mapSlots, setMapSlots] = useState(DEFAULT_MAP_SLOTS);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const columnMapping = useMemo(() => {
    const result = { datasetId: DEFAULT_DATASET_ID, latColumnId: null, lonColumnId: null, labelColumnId: null };

    for (const slot of mapSlots) {
      const content = slot.content?.[0];
      if (!content) continue;

      const dsId = content.datasetId || content.set;
      const colId = content.columnId || content.column;
      if (!dsId || !colId) continue;

      if (!result.datasetId) result.datasetId = dsId;

      const slotName = (slot.slot || slot.name || '').toLowerCase();

      if (slotName === 'x-axis') {
        result.latColumnId = colId;
        result.datasetId = dsId;
      } else if (slotName === 'y-axis') {
        result.lonColumnId = colId;
        result.datasetId = dsId;
      } else if (
        slotName.includes('name') ||
        slotName.includes('label') ||
        slotName.includes('tooltip') ||
        slotName.includes('category')
      ) {
        result.labelColumnId = colId;
      }
    }

    return result;
  }, [mapSlots]);

  const { datasetId, latColumnId, lonColumnId, labelColumnId } = columnMapping;
  const canFetch = Boolean(datasetId && latColumnId && lonColumnId);

  const handleMapSlotsChanged = useCallback((slotsContents) => {
    setMapSlots(slotsContents || []);
    setError(null);
  }, []);

  const fetchPoints = useCallback(async () => {
    if (!canFetch) {
      setError('Map Latitude and Longitude columns first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dimensions = [
        { dataset_id: datasetId, column_id: latColumnId },
        { dataset_id: datasetId, column_id: lonColumnId },
      ];
      if (labelColumnId) {
        dimensions.push({ dataset_id: datasetId, column_id: labelColumnId });
      }

      const requestBody = {
        action: 'get',
        version: '0.1.0',
        key: authKey,
        token: authToken,
        find: {
          queries: [
            {
              dimensions,
              options: { rollup_data: false },
              limit: { by: 5000 },
            },
          ],
        },
      };

      const res = await fetch(`${apiHost}/0.1.0/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Luzmo API returned ${res.status}: ${errBody}`);
      }

      const json = await res.json();
      const rows = json.data || [];

      const pts = rows
        .map((row, i) => {
          const lat = Number(row[0]);
          const lon = Number(row[1]);
          const labelIdx = 2;
          return {
            id: i + 1,
            lat,
            lon,
            name: labelColumnId ? String(row[labelIdx] ?? `Point ${i + 1}`) : `Point ${i + 1}`,
          };
        })
        .filter((p) => !isNaN(p.lat) && !isNaN(p.lon));

      setPoints(pts);
    } catch (err) {
      console.warn('fetchPoints error:', err.message);
      setError(err.message);
      setPoints([]);
    } finally {
      setLoading(false);
    }
  }, [canFetch, datasetId, latColumnId, lonColumnId, labelColumnId, apiHost, authKey, authToken]);

  return useMemo(() => ({
    mapSlots,
    handleMapSlotsChanged,
    columnMapping,
    canFetch,
    points,
    fetchPoints,
    loading,
    error,
  }), [mapSlots, handleMapSlotsChanged, columnMapping, canFetch, points, fetchPoints, loading, error]);
}
