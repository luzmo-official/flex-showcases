import type { AggregationFunc } from './types';

/** Luzmo dataset UUID — overridable via VITE_LUZMO_DATASET_ID env var. */
export const DATASET_ID = import.meta.env.VITE_LUZMO_DATASET_ID || '6e309301-f553-4c78-ba34-791aa8211184';

export const COLUMNS = {
  region:             'a7f58399-387d-4e91-9dbf-c80e32cf10a4',
  industry:           '5d8405dd-b84f-4013-8403-bf9b78eaddfa',
  year:               '0cf592aa-6192-4b7a-9d48-378071addfb1',
  companyName:        'abd71b3c-df0a-4710-a41a-7bf5aa69ec72',
  revenue:            'f70da9ad-25b2-48e4-afd5-8bd3f6808374',
  department:         '1498cdd5-6633-44d6-a9c1-938f238e920b',
  reductionEfforts:   '307eaabd-9241-42c5-ae51-402c2c66e7ce',
  adjustedCo2:        '0ccef735-b579-4a77-bab0-1ecf65d85605',
  emissionSource:     '4c7f90eb-1869-4c15-b8f0-ea1d8e7d7eec',
  city:               'a027d0f7-652d-48a2-9ea2-7d6fe3b60c93',
  energySource:       '9c05c254-a6b7-42c5-8b42-249a3e4ab532',
  co2Emissions:       '21374958-ae10-4d1d-81d3-4b49dfd3aacc',
  scopeOfEmissions:   '850b7543-652b-4014-8bf8-066f280d365c',
  sustainabilityRating: 'e1ec273e-6e05-4abe-946b-ed3e84a42fe3',
  latitude:           '9ed7088c-4b51-428c-bfa2-5c358e445891',
  longitude:          '1051aa56-98f7-4d62-b77f-d90d170ec814',
} as const;

/** Build a numeric slot content entry with locale label. */
function num(columnId: string, aggregationFunc: AggregationFunc, label?: string) {
  const l = label || getColumnLabel(columnId);
  return { datasetId: DATASET_ID, columnId, type: 'numeric' as const, aggregationFunc, label: { en: l } };
}
function hier(columnId: string, label?: string) {
  const l = label || getColumnLabel(columnId);
  return { datasetId: DATASET_ID, columnId, type: 'hierarchy' as const, label: { en: l } };
}
function dt(columnId: string, level: number, label?: string) {
  const l = label || getColumnLabel(columnId);
  return { datasetId: DATASET_ID, columnId, type: 'datetime' as const, level, label: { en: l } };
}

/** Reverse lookup: resolve a column UUID to its human-readable label. */
export function getColumnLabel(columnId: string): string {
  const entry = Object.entries(COLUMNS).find(([, id]) => id === columnId);
  if (!entry) return '';
  // Convert camelCase key to readable label
  return entry[0].replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
}

/** Column metadata used for slot picker dropdowns. */
export const AVAILABLE_COLUMNS: { id: string; label: string; colType: 'numeric' | 'hierarchy' | 'datetime' }[] = [
  { id: COLUMNS.city, label: 'City', colType: 'hierarchy' },
  { id: COLUMNS.region, label: 'Country', colType: 'hierarchy' },
  { id: COLUMNS.industry, label: 'Industry', colType: 'hierarchy' },
  { id: COLUMNS.companyName, label: 'Company Name', colType: 'hierarchy' },
  { id: COLUMNS.department, label: 'Department', colType: 'hierarchy' },
  { id: COLUMNS.energySource, label: 'Energy Source', colType: 'hierarchy' },
  { id: COLUMNS.emissionSource, label: 'Emission Source', colType: 'hierarchy' },
  { id: COLUMNS.scopeOfEmissions, label: 'Scope of Emissions', colType: 'hierarchy' },
  { id: COLUMNS.year, label: 'Year', colType: 'datetime' },
  { id: COLUMNS.co2Emissions, label: 'CO2 Emissions', colType: 'numeric' },
  { id: COLUMNS.adjustedCo2, label: 'Adjusted CO2', colType: 'numeric' },
  { id: COLUMNS.revenue, label: 'Revenue', colType: 'numeric' },
  { id: COLUMNS.sustainabilityRating, label: 'Sustainability Rating', colType: 'numeric' },
  { id: COLUMNS.reductionEfforts, label: 'Reduction Efforts', colType: 'numeric' },
  { id: COLUMNS.latitude, label: 'Latitude', colType: 'numeric' },
  { id: COLUMNS.longitude, label: 'Longitude', colType: 'numeric' },
];

export const AGGREGATIONS = ['sum', 'average', 'count', 'distinctcount', 'min', 'max', 'median'];

/** Which column types each slot name accepts. */
export const SLOT_ACCEPTS: Record<string, ('numeric' | 'hierarchy' | 'datetime')[]> = {
  'measure':   ['numeric'],
  'y-axis':    ['hierarchy', 'datetime'],
  'x-axis':    ['hierarchy', 'datetime'],
  'category':  ['hierarchy'],
  'legend':    ['hierarchy', 'datetime'],
  'evolution': ['datetime'],
  'columns':   ['numeric', 'hierarchy', 'datetime'],
  'size':      ['numeric'],
  'color':     ['hierarchy', 'numeric'],
};

export const DATETIME_LEVELS = [
  { value: 1, label: 'Year' },
  { value: 2, label: 'Quarter' },
  { value: 3, label: 'Month' },
  { value: 4, label: 'Week' },
  { value: 5, label: 'Day' },
];

/** Slot names per chart type, derived from Luzmo JSON schemas. */
export const CHART_SLOT_NAMES: Record<string, string[]> = {
  'bar-chart':        ['measure', 'y-axis', 'legend'],
  'column-chart':     ['measure', 'x-axis', 'legend'],
  'line-chart':       ['measure', 'x-axis', 'legend'],
  'area-chart':       ['measure', 'x-axis', 'legend'],
  'donut-chart':      ['measure', 'category'],
  'evolution-number': ['measure', 'evolution'],
  'regular-table':    ['columns'],
  'scatter-plot':     ['x-axis', 'y-axis', 'size', 'color'],
  'treemap-chart':    ['measure', 'category', 'color'],
  'bubble-chart':     ['measure', 'category', 'color'],
  'funnel-chart':     ['measure', 'category'],
  'radar-chart':      ['measure', 'category', 'legend'],
  'heat-map':         ['measure', 'x-axis', 'y-axis'],
};

/** Pre-built widget templates using Luzmo Flex SDK slot format. */
export const WIDGET_TEMPLATES = [
  {
    key: 'co2-by-city',
    label: 'CO2 by City',
    type: 'bar-chart',
    slots: [
      { name: 'measure', content: [num(COLUMNS.co2Emissions, 'sum')] },
      { name: 'y-axis', content: [hier(COLUMNS.city)] },
    ],
    options: {
      display: { title: false },
      interactivity: {
        measureDimensionPicker: [
          {
            slot: 'y-axis',
            slotType: 'categorical',
            values: [
              { datasetId: DATASET_ID, set: DATASET_ID, columnId: COLUMNS.city, column: COLUMNS.city, type: 'hierarchy', label: { en: 'City' }, selected: true },
              { datasetId: DATASET_ID, set: DATASET_ID, columnId: COLUMNS.region, column: COLUMNS.region, type: 'hierarchy', label: { en: 'Country' } },
            ],
          },
          {
            slot: 'measure',
            slotType: 'numeric',
            values: [
              { datasetId: DATASET_ID, set: DATASET_ID, columnId: COLUMNS.co2Emissions, column: COLUMNS.co2Emissions, type: 'numeric', aggregationFunc: 'sum', label: { en: 'CO2 Emissions' }, selected: true },
              { datasetId: DATASET_ID, set: DATASET_ID, columnId: COLUMNS.adjustedCo2, column: COLUMNS.adjustedCo2, type: 'numeric', aggregationFunc: 'sum', label: { en: 'Adjusted CO2' } },
            ],
          },
        ],
      },
    },
    layout: { w: 6, h: 6 },
  },
  {
    key: 'emissions-over-time',
    label: 'Emissions Over Time',
    type: 'line-chart',
    slots: [
      { name: 'measure', content: [num(COLUMNS.co2Emissions, 'sum')] },
      { name: 'x-axis', content: [dt(COLUMNS.year, 1)] },
    ],
    options: { display: { title: false } },
    layout: { w: 6, h: 6 },
  },
  {
    key: 'by-energy-source',
    label: 'By Energy Source',
    type: 'donut-chart',
    slots: [
      { name: 'measure', content: [num(COLUMNS.co2Emissions, 'sum')] },
      { name: 'category', content: [hier(COLUMNS.energySource)] },
    ],
    options: { display: { title: false } },
    layout: { w: 4, h: 6 },
  },
  {
    key: 'total-co2',
    label: 'Total CO2 Emissions',
    type: 'evolution-number',
    slots: [
      { name: 'measure', content: [num(COLUMNS.co2Emissions, 'sum')] },
      { name: 'evolution', content: [dt(COLUMNS.year, 1)] },
    ],
    options: { display: { title: false } },
    layout: { w: 3, h: 4 },
  },
  {
    key: 'total-revenue',
    label: 'Total Revenue',
    type: 'evolution-number',
    slots: [
      { name: 'measure', content: [num(COLUMNS.revenue, 'sum')] },
      { name: 'evolution', content: [dt(COLUMNS.year, 1)] },
    ],
    options: { display: { title: false } },
    layout: { w: 3, h: 4 },
  },
  {
    key: 'revenue-by-industry',
    label: 'Revenue by Industry',
    type: 'column-chart',
    slots: [
      { name: 'measure', content: [num(COLUMNS.revenue, 'sum')] },
      { name: 'x-axis', content: [hier(COLUMNS.industry)] },
    ],
    options: { display: { title: false } },
    layout: { w: 6, h: 6 },
  },
  {
    key: 'co2-by-region',
    label: 'CO2 by Country',
    type: 'bar-chart',
    slots: [
      { name: 'measure', content: [num(COLUMNS.co2Emissions, 'sum')] },
      { name: 'y-axis', content: [hier(COLUMNS.region)] },
    ],
    options: { display: { title: false } },
    layout: { w: 6, h: 6 },
  },
  {
    key: 'by-emission-source',
    label: 'By Emission Source',
    type: 'donut-chart',
    slots: [
      { name: 'measure', content: [num(COLUMNS.co2Emissions, 'sum')] },
      { name: 'category', content: [hier(COLUMNS.emissionSource)] },
    ],
    options: { display: { title: false } },
    layout: { w: 4, h: 6 },
  },
  {
    key: 'company-table',
    label: 'Company Details',
    type: 'regular-table',
    slots: [
      {
        name: 'columns',
        content: [
          hier(COLUMNS.companyName),
          hier(COLUMNS.city),
          hier(COLUMNS.industry),
          num(COLUMNS.co2Emissions, 'sum'),
          num(COLUMNS.revenue, 'sum'),
        ],
      },
    ],
    options: { display: { title: false } },
    layout: { w: 8, h: 6 },
  },
  {
    key: 'sustainability-rating',
    label: 'Avg Sustainability Rating',
    type: 'evolution-number',
    slots: [
      { name: 'measure', content: [num(COLUMNS.sustainabilityRating, 'average')] },
      { name: 'evolution', content: [dt(COLUMNS.year, 1)] },
    ],
    options: { display: { title: false } },
    layout: { w: 3, h: 4 },
  },
  {
    key: 'co2-by-scope',
    label: 'CO2 by Scope',
    type: 'column-chart',
    slots: [
      { name: 'measure', content: [num(COLUMNS.co2Emissions, 'sum')] },
      { name: 'x-axis', content: [hier(COLUMNS.scopeOfEmissions)] },
    ],
    options: { display: { title: false } },
    layout: { w: 4, h: 6 },
  },
  {
    key: 'emissions-area',
    label: 'Emissions Trend (Area)',
    type: 'area-chart',
    slots: [
      { name: 'measure', content: [num(COLUMNS.adjustedCo2, 'sum')] },
      { name: 'x-axis', content: [dt(COLUMNS.year, 1)] },
    ],
    options: { display: { title: false } },
    layout: { w: 6, h: 6 },
  },
] as const;
