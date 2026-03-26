import { useEffect, useRef } from 'react';
import '@luzmo/analytics-components-kit/data-field-panel';
import '@luzmo/analytics-components-kit/item-slot-drop-panel';

const DRILL_THRU_MAP_SLOTS = [
  {
    name: 'y-axis',
    label: 'Latitude',
    type: 'numeric',
    acceptableDataFieldTypes: ['numeric'],
    options: { isAggregationDisabled: true },
  },
  {
    name: 'x-axis',
    label: 'Longitude',
    type: 'numeric',
    acceptableDataFieldTypes: ['numeric'],
    options: { isAggregationDisabled: true },
  },
  {
    name: 'name',
    label: 'Label',
    type: 'categorical',
    acceptableDataFieldTypes: ['hierarchy'],
    options: { isBinningDisabled: true },
  },
];

const GUIDE_STEPS = [
  'Drag dataset columns to the chart slots: Latitude, Longitude, and optionally Label.',
  'The Drill Through Map renders automatically with your data.',
  'Interact with the map to explore and filter geographically.',
  'Press "+ Add Item" to add additional Luzmo charts.',
  'Charts auto-filter based on map interactions.',
];

export default function LeftPanel({ luzmoData, auth }) {
  const { mapSlots, handleMapSlotsChanged } = luzmoData;

  const { authKey, authToken, apiHost, appServer } = auth;
  const fieldsRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    const el = fieldsRef.current;
    if (!el) return;

    const sync = () => {
      el.language = 'en';
      el.contentLanguage = 'en';
      el.size = 's';
      el.datasetPicker = true;
      el.grows = true;
      el.apiUrl = apiHost;
      el.authKey = authKey;
      el.authToken = authToken;
    };

    if (el.updateComplete) {
      el.updateComplete.then(sync);
    } else {
      sync();
    }
  }, [apiHost, authKey, authToken]);

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const sync = () => {
      el.itemType = 'drill-thru-map';
      el.slotsConfiguration = DRILL_THRU_MAP_SLOTS;
      el.slotsContents = mapSlots;
      el.language = 'en';
      el.contentLanguage = 'en';
      el.size = 's';
      el.apiUrl = apiHost;
      el.appServer = appServer;
      el.authKey = authKey;
      el.authToken = authToken;
    };

    if (el.updateComplete) {
      el.updateComplete.then(sync);
    } else {
      sync();
    }
  }, [mapSlots, apiHost, appServer, authKey, authToken]);

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const handleSlotsChanged = (e) => {
      const slotsContents = e.detail?.slotsContents;
      if (slotsContents) {
        handleMapSlotsChanged(slotsContents);
      }
    };

    el.addEventListener('luzmo-slots-contents-changed', handleSlotsChanged);
    return () => {
      el.removeEventListener('luzmo-slots-contents-changed', handleSlotsChanged);
    };
  }, [handleMapSlotsChanged]);

  return (
    <div className="flex-col">
      <luzmo-accordion allow-multiple size="s" density="spacious">
        <luzmo-accordion-item label="Quick Guide">
          <div className="panel-section" style={{ padding: '8px 4px' }}>
            {GUIDE_STEPS.map((step, i) => (
              <div className="guide-step" key={i}>
                <span className="guide-step-num">{i + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </luzmo-accordion-item>

        <luzmo-accordion-item label="Map Data Source" open>
          <div className="panel-section" style={{ padding: '8px 4px' }}>
            <div className="text-sm text-muted" style={{ marginBottom: 8 }}>
              Drag columns from the dataset to configure the <strong>Drill Through Map</strong>.
            </div>
            <div style={{ display: 'flex', gap: 10, height: 380, minHeight: 280 }}>
              <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div className="text-xs text-muted" style={{ marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
                  Dataset
                </div>
                <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                  <luzmo-data-field-panel ref={fieldsRef} />
                </div>
              </div>
              <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div className="text-xs text-muted" style={{ marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
                  Chart Slots
                </div>
                <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                  <luzmo-item-slot-drop-panel ref={dropRef} />
                </div>
              </div>
            </div>
          </div>
        </luzmo-accordion-item>
      </luzmo-accordion>
    </div>
  );
}
