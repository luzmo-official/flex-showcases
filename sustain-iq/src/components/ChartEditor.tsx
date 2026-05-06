import { useState, useCallback, useRef } from 'react';
import { LuzmoItemSlotPickerPanel, LuzmoItemOptionPanel } from '@luzmo/analytics-components-kit/react';

import { ChartIcon } from './icons';
import { DATASET_ID, AVAILABLE_COLUMNS, SLOT_ACCEPTS, getColumnLabel } from '../dataset';

import type { AggregationFunc, Slot, WidgetConfig } from '../types';

const CHART_TYPES: { value: string; label: string }[] = [
  { value: 'bar-chart', label: 'Bar' },
  { value: 'column-chart', label: 'Column' },
  { value: 'line-chart', label: 'Line' },
  { value: 'area-chart', label: 'Area' },
  { value: 'donut-chart', label: 'Donut' },
  { value: 'evolution-number', label: 'KPI' },
  { value: 'regular-table', label: 'Table' },
  { value: 'scatter-plot', label: 'Scatter' },
  { value: 'treemap-chart', label: 'Treemap' },
  { value: 'heat-map', label: 'Heatmap' },
  { value: 'bubble-chart', label: 'Bubble' },
  { value: 'funnel-chart', label: 'Funnel' },
  { value: 'radar-chart', label: 'Radar' },
];

interface Props {
  widget: WidgetConfig;
  authKey: string;
  authToken: string;
  onSave: (widget: WidgetConfig) => void;
  onCancel: () => void;
}

/** Convert app slot format to ACK's VizItemSlots format. */
function toAckSlots(slots?: WidgetConfig['slots']): Slot[] {
  if (!slots) return [];
  return slots.map(s => ({
    name: s.name,
    content: s.content.map(c => ({
      columnId: c.columnId,
      datasetId: c.datasetId,
      type: c.type,
      ...(c.aggregationFunc ? { aggregationFunc: c.aggregationFunc } : {}),
      ...(c.level !== undefined ? { level: c.level } : {}),
    })),
  }));
}

/** Convert ACK's slotsContents back to our Slot[] format. */
function fromAckSlots(ackSlots: Slot[]): WidgetConfig['slots'] {
  if (!ackSlots) return [];
  return ackSlots
    .filter(s => s.content && s.content.length > 0)
    .map(s => ({
      name: s.name,
      content: s.content.map(c => ({
        datasetId: c.datasetId || DATASET_ID,
        columnId: c.columnId,
        type: c.type || 'hierarchy',
        ...(c.aggregationFunc ? { aggregationFunc: c.aggregationFunc } : {}),
        ...(c.level !== undefined ? { level: c.level } : {}),
      })),
    }));
}

/* ──────────────────────────────────────────────────────────
   Interactivity helpers
   ────────────────────────────────────────────────────────── */

interface PickerConfig {
  slot: string;
  slotType: string; // 'numeric' | 'categorical' | 'mixed' (NOT column data type)
  values: {
    datasetId: string;
    columnId: string;
    type: string;
    aggregationFunc?: AggregationFunc;
    selected?: boolean;
  }[];
}

/**
 * Map a slot name to the SlotConfig['type'] Luzmo expects:
 * 'numeric' | 'categorical' | 'mixed'
 * This is NOT the column data type — it describes what kind of data the slot accepts.
 */
function resolveSlotConfigType(slotName: string): string {
  const SLOT_CONFIG_TYPE: Record<string, string> = {
    'measure': 'numeric',
    'size': 'numeric',
    'y-axis': 'categorical',
    'x-axis': 'categorical',
    'category': 'categorical',
    'legend': 'categorical',
    'evolution': 'categorical',
    'color': 'mixed',
    'columns': 'mixed',
  };
  return SLOT_CONFIG_TYPE[slotName] ?? 'mixed';
}

/** Build measure-dimension picker config from UI state */
function buildPickerConfig(
  pickerState: Record<string, string[]>, // slotName → selected columnIds
  slots: Slot[],
): PickerConfig[] {
  const configs: PickerConfig[] = [];
  for (const [slotName, columnIds] of Object.entries(pickerState)) {
    if (columnIds.length < 2) continue; // need at least 2 columns for a picker
    const slot = slots.find(s => s.name === slotName);
    if (!slot || !slot.content[0]) continue;
    const colType = slot.content[0].type; // column data type: 'numeric' | 'hierarchy' | 'datetime'
    const slotType = resolveSlotConfigType(slotName); // slot config type: 'numeric' | 'categorical' | 'mixed'
    // Current column should be selected
    const currentColId = slot.content[0].columnId;
    // Build values — include both modern + deprecated field names for Luzmo internal matching,
    // plus label so the picker dropdown shows readable column names
    const baseContent = slot.content[0];
    const values = columnIds.map(colId => ({
      datasetId: DATASET_ID,
      set: DATASET_ID,           // deprecated but used internally by Luzmo for matching
      columnId: colId,
      column: colId,             // deprecated but used internally by Luzmo for matching
      type: colType,
      label: { en: getColumnLabel(colId) },
      ...(baseContent.aggregationFunc ? { aggregationFunc: baseContent.aggregationFunc } : {}),
      ...(colId === currentColId ? { selected: true } : {}),
    }));
    configs.push({
      slot: slotName,
      slotType,
      values,
    });
  }
  return configs;
}

/** Parse existing picker config back to UI state */
function parsePickerConfig(options: Record<string, unknown>): Record<string, string[]> {
  const state: Record<string, string[]> = {};
  const interactivity = options?.interactivity as { measureDimensionPicker?: PickerConfig[] } | undefined;
  const pickers = interactivity?.measureDimensionPicker;
  if (!pickers) return state;
  for (const p of pickers) {
    state[p.slot] = p.values.map(v => v.columnId);
  }
  return state;
}

/* ──────────────────────────────────────────────────────────
   InteractivityPanel component
   ────────────────────────────────────────────────────────── */

function InteractivityPanel({
  slots,
  options,
  onOptionsChange,
  canFilter,
  onCanFilterChange,
  showPicker = true,
}: {
  slots: Slot[];
  options: Record<string, unknown>;
  onOptionsChange: (opts: Record<string, unknown>) => void;
  canFilter: boolean;
  onCanFilterChange: (enabled: boolean) => void;
  showPicker?: boolean;
}) {
  const [pickerState, setPickerState] = useState<Record<string, string[]>>(() => parsePickerConfig(options));

  // Sync interactivity options whenever state changes
  const updateOptions = (newPicker: Record<string, string[]>) => {
    const pickerConfig = buildPickerConfig(newPicker, slots);
    const newOpts = { ...options };
    if (pickerConfig.length > 0) {
      newOpts.interactivity = { measureDimensionPicker: pickerConfig };
    } else {
      delete newOpts.interactivity;
    }
    onOptionsChange(newOpts);
  };

  // Get compatible columns for a slot
  const getCompatibleColumns = (slotName: string) => {
    const accepted = SLOT_ACCEPTS[slotName];
    if (!accepted) return [];
    return AVAILABLE_COLUMNS.filter(c => accepted.includes(c.colType));
  };

  // All populated slots (for picker)
  const populatedSlots = slots.filter(s => s.content?.length > 0);

  const togglePickerColumn = (slotName: string, columnId: string) => {
    const current = pickerState[slotName] || [];
    // Ensure the slot's current column is always included
    const slot = slots.find(s => s.name === slotName);
    const currentColId = slot?.content?.[0]?.columnId;

    let updated: string[];
    if (current.includes(columnId)) {
      // Don't allow removing the current column
      if (columnId === currentColId) return;
      updated = current.filter(id => id !== columnId);
    } else {
      updated = [...current, columnId];
    }

    const newState = { ...pickerState, [slotName]: updated };
    setPickerState(newState);
    updateOptions(newState);
  };

  const enablePicker = (slotName: string) => {
    const slot = slots.find(s => s.name === slotName);
    if (!slot?.content?.[0]) return;
    const currentColId = slot.content[0].columnId;
    // Start with only the current column selected — user opts in to others
    const newState = { ...pickerState, [slotName]: [currentColId] };
    setPickerState(newState);
  };

  const disablePicker = (slotName: string) => {
    const newState = { ...pickerState };
    delete newState[slotName];
    setPickerState(newState);
    updateOptions(newState);
  };

  const slotLabel = (name: string) => {
    const labels: Record<string, string> = {
      'measure': 'Measure', 'x-axis': 'Category', 'y-axis': 'Category',
      'category': 'Category', 'legend': 'Legend', 'evolution': 'Evolution',
      'columns': 'Columns', 'size': 'Size', 'color': 'Color',
    };
    return labels[name] || name;
  };

  return (
    <div className="interactivity-panel">
      {/* Cross-Filtering */}
      <div className="intx-section">
        <div className="intx-section-header">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span>Cross-Filtering</span>
        </div>
        <p className="intx-desc">When enabled, clicking data points in this chart filters all other charts on the dashboard.</p>
        <div className="intx-slot-block">
          <div className="intx-slot-row">
            <span className="intx-slot-label">Enable cross-filtering</span>
            <button
              className={`intx-toggle ${canFilter ? 'active' : ''}`}
              onClick={() => onCanFilterChange(!canFilter)}
            >
              <span className="intx-toggle-knob" />
            </button>
          </div>
        </div>
      </div>

      {showPicker && <>
      {/* Measure / Dimension Picker */}
      <div className="intx-section">
        <div className="intx-section-header">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
          </svg>
          <span>Measure &amp; Dimension Picker</span>
        </div>
        <p className="intx-desc">Let users swap columns on the chart via a dropdown.</p>

        {populatedSlots.length === 0 ? (
          <p className="intx-empty">Add data to slots first in the Data tab.</p>
        ) : (
          populatedSlots.map(slot => {
            const isEnabled = !!pickerState[slot.name];
            const compatible = getCompatibleColumns(slot.name);
            const currentColId = slot.content[0]?.columnId;
            return (
              <div key={slot.name} className="intx-slot-block">
                <div className="intx-slot-row">
                  <span className="intx-slot-label">{slotLabel(slot.name)}</span>
                  <span className="intx-slot-current">{getColumnLabel(currentColId)}</span>
                  <button
                    className={`intx-toggle ${isEnabled ? 'active' : ''}`}
                    onClick={() => isEnabled ? disablePicker(slot.name) : enablePicker(slot.name)}
                  >
                    <span className="intx-toggle-knob" />
                  </button>
                </div>
                {isEnabled && (
                  <div className="intx-columns">
                    {compatible.map(col => {
                      const checked = (pickerState[slot.name] || []).includes(col.id);
                      const isCurrent = col.id === currentColId;
                      return (
                        <label key={col.id} className={`intx-col-check ${isCurrent ? 'current' : ''}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={isCurrent}
                            onChange={() => togglePickerColumn(slot.name, col.id)}
                          />
                          <span>{col.label}{isCurrent ? ' (current)' : ''}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      </>}

    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   ChartEditor component
   ────────────────────────────────────────────────────────── */

export function ChartEditor({ widget, authKey, authToken, onSave, onCancel }: Props) {
  const [activeTab, setActiveTab] = useState<'data' | 'options' | 'interactivity'>('data');
  const [title, setTitle] = useState(widget.title);
  const [chartType, setChartType] = useState(widget.type);
  const [slotsContents, setSlotsContents] = useState<Slot[]>(() => toAckSlots(widget.slots));
  const [options, setOptions] = useState<Record<string, unknown>>(widget.options ?? {});
  const [canFilter, setCanFilter] = useState(widget.canFilter !== false);

  // Track whether user has made changes
  const hasSlots = slotsContents.some(s => s.content && s.content.length > 0);

  // Prevent infinite update loops with a flag
  const isUpdatingRef = useRef(false);

  const handleSlotsChanged = useCallback((e: CustomEvent) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    const newSlots = e.detail?.slotsContents ?? [];
    setSlotsContents(newSlots);
    requestAnimationFrame(() => { isUpdatingRef.current = false; });
  }, []);

  const handleOptionsChanged = useCallback((e: CustomEvent) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    const newOptions = e.detail?.options ?? {};
    setOptions(newOptions);
    requestAnimationFrame(() => { isUpdatingRef.current = false; });
  }, []);

  const handleTypeChange = (newType: string) => {
    setChartType(newType);

    // Remap dimension slots to the new chart type's expected slot name
    const DIMENSION_SLOTS = ['y-axis', 'x-axis', 'category'];
    const CHART_DIM_SLOT: Record<string, string> = {
      'bar-chart': 'y-axis', 'column-chart': 'x-axis', 'line-chart': 'x-axis',
      'area-chart': 'x-axis', 'donut-chart': 'category', 'funnel-chart': 'category',
      'treemap-chart': 'category', 'radar-chart': 'category', 'heat-map': 'x-axis',
      'bubble-chart': 'x-axis', 'scatter-plot': 'x-axis',
    };
    const targetDimSlot = CHART_DIM_SLOT[newType];
    const remapped = slotsContents.map(s => {
      if (s.name === 'measure') return s;
      if (s.name === 'legend') return s;
      if (DIMENSION_SLOTS.includes(s.name) && targetDimSlot) {
        return { ...s, name: targetDimSlot };
      }
      return s;
    });
    setSlotsContents(remapped);

    // Clear interactivity options (slot-specific configs)
    const newOpts = { ...options };
    delete newOpts.interactivity;
    setOptions(newOpts);
  };

  const handleSave = () => {
    onSave({
      ...widget,
      title,
      type: chartType,
      slots: fromAckSlots(slotsContents),
      options,
      canFilter,
    });
  };

  // Cross-filtering is available for all chart types.
  // Measure/dimension picker for these:
  const PICKER_TYPES = ['bar-chart', 'column-chart', 'donut-chart', 'funnel-chart'];
  const showInteractivity = true;
  const showPicker = PICKER_TYPES.includes(chartType);

  // If chart type changes away from supported, reset to data tab
  const effectiveTab = (!showInteractivity && activeTab === 'interactivity') ? 'data' : activeTab;

  // Build Slot[] from current ACK slots for the interactivity panel
  const currentSlots: Slot[] = fromAckSlots(slotsContents) || [];

  return (
    <div className="chart-editor">
      {/* Header */}
      <div className="chart-editor-header">
        <div className="chart-editor-header-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Widget
        </div>
        <button className="chart-editor-close" onClick={onCancel} title="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Title input */}
      <div className="chart-editor-title">
        <label className="chart-editor-field-label">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Chart title..."
          className="cfg-input"
        />
      </div>

      {/* Chart type picker */}
      <div className="chart-editor-section-label">Chart Type</div>
      <div className="chart-editor-types">
        {CHART_TYPES.map(ct => (
          <button
            key={ct.value}
            className={`chart-editor-type-btn ${chartType === ct.value ? 'active' : ''}`}
            onClick={() => handleTypeChange(ct.value)}
            title={ct.label}
          >
            <ChartIcon type={ct.value} size={16} />
            <span>{ct.label}</span>
          </button>
        ))}
      </div>

      {/* Tabs: Data | Options | Interactivity */}
      <div className="chart-editor-tabs">
        <button
          className={`chart-editor-tab ${effectiveTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
          Data
        </button>
        <button
          className={`chart-editor-tab ${effectiveTab === 'options' ? 'active' : ''}`}
          onClick={() => setActiveTab('options')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
          Options
        </button>
        {showInteractivity && (
          <button
            className={`chart-editor-tab ${effectiveTab === 'interactivity' ? 'active' : ''}`}
            onClick={() => setActiveTab('interactivity')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
            </svg>
            Interactivity
          </button>
        )}
      </div>

      {/* Tab content */}
      <div className="chart-editor-content">
        {effectiveTab === 'data' ? (
          <div className="chart-editor-data">
            <LuzmoItemSlotPickerPanel
              itemType={chartType}
              slotsContents={slotsContents}
              datasetIds={[DATASET_ID]}
              datasetPicker={false}
              language="en"
              contentLanguage="en"
              size="m"
              grows={true}
              apiUrl="https://api.luzmo.com"
              authKey={authKey}
              authToken={authToken}
              onLuzmoSlotsContentsChanged={handleSlotsChanged}
            />
          </div>
        ) : effectiveTab === 'options' ? (
          <div className="chart-editor-options">
            <LuzmoItemOptionPanel
              itemType={chartType}
              options={options}
              slots={slotsContents}
              size="m"
              apiUrl="https://api.luzmo.com"
              authKey={authKey}
              authToken={authToken}
              onLuzmoOptionsChanged={handleOptionsChanged}
            />
          </div>
        ) : (
          <div className="chart-editor-interactivity">
            <InteractivityPanel
              slots={currentSlots}
              options={options}
              onOptionsChange={setOptions}
              canFilter={canFilter}
              onCanFilterChange={setCanFilter}
              showPicker={showPicker}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="chart-editor-actions">
        <button className="cfg-btn-back" onClick={onCancel}>Cancel</button>
        <button
          className={`cfg-btn-create ${hasSlots ? '' : 'cfg-btn-disabled'}`}
          onClick={handleSave}
          disabled={!hasSlots}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
