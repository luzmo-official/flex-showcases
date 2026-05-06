import type { GridItemData, SlotContentSubtype } from './cfo-types';

export const APP_SERVER = 'https://app.luzmo.com/';
export const API_HOST = 'https://api.luzmo.com';
export const DATASET_ID = 'a0182925-bb11-416a-afe3-34de88c99eb3';

export const CFO_COLUMNS = {
  periodStart: 'f305a03e-f2df-41fd-b762-d00e3ed3ada1',
  fiscalYear: 'c2b4776e-3732-43a4-8949-5d5c91ca255f',
  scenario: '36546fe1-92bc-4822-becc-750e5ba05b07',
  region: '23d3dd50-62f9-40f6-9900-f2102d3a31a8',
  legalEntity: '47e43405-c081-48da-b9db-4f2ccd398ef5',
  reportingCurrency: '9559e032-dd70-4e35-8121-460e692e3818',
  businessUnit: '747f562c-439c-4e08-b8d7-1af96baca2df',
  productFamily: '34eebe36-3e0e-412c-9c39-999db6420b16',
  revenue: '11604119-8df9-4f00-a401-5e85a9ada2a5',
  ebitda: '82f34618-3d75-4f8d-a383-259fc24ff0b6',
  freeCashFlow: '79cc119c-0694-4624-be24-a63ae3c4f0e9',
  workingCapital: '95ca0913-d529-43a5-830c-993a55039c5f',
  netDebt: '84e319c4-0cbe-43c2-953c-fecf8a71f6c0'
} as const;

export const CFO_FORMULAS = {
  totalRevenue: '9785a520-0150-4486-861e-c29e710db741',
  totalEbitda: '90e00c2c-4f22-47a9-853a-f45c9c34c190',
  ebitdaMarginPct: '536620a1-067b-48a2-a050-eea82cde6b21',
  fcfMarginPct: 'afb420e2-3a05-4060-8316-b61e797c5f9b',
  netDebtToEbitda: '9db0d0c1-75b7-456d-ad07-f75e5cf42670',
  capexIntensityPct: '7038b759-70ef-4138-91a9-358ab06e9879',
  workingCapitalToRevenuePct: '402c2f2b-becf-4d03-950d-90d7b0f31609'
} as const;

type AggregationFunction = 'average' | 'count' | 'cumulativesum' | 'distinctcount' | 'max' | 'median' | 'min' | 'sum';
type DatetimeDisplayMode =
  | 'day_in_month'
  | 'day_in_year'
  | 'default'
  | 'hour_in_day'
  | 'minute_in_hour'
  | 'month_name'
  | 'month_number'
  | 'quarter_number'
  | 'second_in_minute'
  | 'week_number'
  | 'weekday_name'
  | 'weekday_number';

interface SlotExtras {
  aggregationFunc?: AggregationFunction;
  datetimeDisplayMode?: DatetimeDisplayMode;
  level?: number | null;
  lowestLevel?: number | null;
  format?: string;
  subtype?: SlotContentSubtype;
}

const baseSlot = (label: string, type: 'numeric' | 'hierarchy' | 'datetime', extras: SlotExtras) => ({
  set: DATASET_ID,
  datasetId: DATASET_ID,
  label: { en: label },
  type,
  subtype: extras.subtype ?? null,
  level: extras.level ?? null,
  lowestLevel: extras.lowestLevel ?? null,
  ...(extras.format && { format: extras.format }),
  ...(extras.aggregationFunc && { aggregationFunc: extras.aggregationFunc }),
  ...(extras.datetimeDisplayMode && { datetimeDisplayMode: extras.datetimeDisplayMode })
});

const columnSlot = (columnId: string, label: string, type: 'numeric' | 'hierarchy' | 'datetime', extras: SlotExtras = {}) => ({
  ...baseSlot(label, type, extras),
  column: columnId,
  columnId
});

const formulaSlot = (formulaId: string, label: string, type: 'numeric' = 'numeric', extras: SlotExtras = {}) => ({
  ...baseSlot(label, type, extras),
  formula: formulaId,
  formulaId
});

export type ScenarioId = 'Base' | 'Stretch' | 'Stress';

export interface ScenarioKpi {
  revenueBn: number;
  ebitdaMarginPct: number;
  fcfMarginPct: number;
  netDebtToEbitda: number;
}

export const SCENARIO_KPI: Record<ScenarioId, ScenarioKpi> = {
  Base: {
    revenueBn: 209.2,
    ebitdaMarginPct: 21.36,
    fcfMarginPct: 10.55,
    netDebtToEbitda: 2.85
  },
  Stretch: {
    revenueBn: 225.8,
    ebitdaMarginPct: 23.86,
    fcfMarginPct: 11.73,
    netDebtToEbitda: 2.17
  },
  Stress: {
    revenueBn: 186.2,
    ebitdaMarginPct: 16.38,
    fcfMarginPct: 8.39,
    netDebtToEbitda: 5.21
  }
};

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

export type PeriodFilter = 'all' | 'fy2023' | 'fy2024' | 'fy2025' | 'fy2026';
export type RegionFilter = 'all' | 'North America' | 'Europe' | 'APAC';
export type BusinessUnitFilter = 'all' | 'Industrial Solutions' | 'Services and Support' | 'Consumer Products';
export type LegalEntityFilter = 'all' | 'US Holding' | 'EU Holding' | 'UK Holding' | 'APAC Holding';
export type CurrencyFilter = 'all' | 'USD' | 'EUR' | 'GBP';

export interface GlobalFilterState {
  period: PeriodFilter;
  region: RegionFilter;
  businessUnit: BusinessUnitFilter;
  legalEntity: LegalEntityFilter;
  currency: CurrencyFilter;
  scenario: ScenarioId;
}

export const DEFAULT_FILTER_STATE: GlobalFilterState = {
  period: 'fy2026',
  region: 'all',
  businessUnit: 'all',
  legalEntity: 'all',
  currency: 'USD',
  scenario: 'Base'
};

export const PERIOD_OPTIONS: SelectOption<PeriodFilter>[] = [
  { value: 'all', label: 'All fiscal years' },
  { value: 'fy2023', label: 'FY 2023' },
  { value: 'fy2024', label: 'FY 2024' },
  { value: 'fy2025', label: 'FY 2025' },
  { value: 'fy2026', label: 'FY 2026' }
];

export const REGION_OPTIONS: SelectOption<RegionFilter>[] = [
  { value: 'all', label: 'All regions' },
  { value: 'North America', label: 'North America' },
  { value: 'Europe', label: 'Europe' },
  { value: 'APAC', label: 'APAC' }
];

export const BUSINESS_UNIT_OPTIONS: SelectOption<BusinessUnitFilter>[] = [
  { value: 'all', label: 'All business units' },
  { value: 'Industrial Solutions', label: 'Industrial Solutions' },
  { value: 'Services and Support', label: 'Services and Support' },
  { value: 'Consumer Products', label: 'Consumer Products' }
];

export const LEGAL_ENTITY_OPTIONS: SelectOption<LegalEntityFilter>[] = [
  { value: 'all', label: 'All legal entities' },
  { value: 'US Holding', label: 'US Holding' },
  { value: 'EU Holding', label: 'EU Holding' },
  { value: 'UK Holding', label: 'UK Holding' },
  { value: 'APAC Holding', label: 'APAC Holding' }
];

export const CURRENCY_OPTIONS: SelectOption<CurrencyFilter>[] = [
  { value: 'all', label: 'All reporting currencies' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' }
];

export const SUPPORTED_VIZ_TYPES = ['line-chart', 'bar-chart', 'column-chart', 'donut-chart', 'conditional-number'] as const;

export interface VizTypeOption {
  value: (typeof SUPPORTED_VIZ_TYPES)[number];
  label: string;
}

export const VIZ_TYPE_OPTIONS: VizTypeOption[] = [
  { value: 'line-chart', label: '↗ Trend line' },
  { value: 'bar-chart', label: '▮ Horizontal bars' },
  { value: 'column-chart', label: '▇ Vertical columns' },
  { value: 'donut-chart', label: '◔ Donut breakdown' },
  { value: 'conditional-number', label: '◎ KPI number' }
];

export const CFO_GRID_THEME = {
  type: 'custom' as const,
  background: 'transparent',
  itemsBackground: '#ffffff',
  boxShadow: {
    size: 'none',
    color: 'rgba(0,0,0,0)'
  },
  title: {
    align: 'left' as const,
    bold: false,
    italic: false,
    underline: false,
    border: false
  },
  font: {
    fontFamily: 'DM Sans, sans-serif',
    'font-style': 'normal',
    'font-weight': 500,
    fontSize: 13
  },
  colors: [
    '#0f766e',
    '#0d9488',
    '#3b82f6',
    '#6366f1',
    '#f59e0b',
    '#ef4444',
    '#14b8a6',
    '#8b5cf6',
    '#64748b',
    '#06b6d4',
    '#d946ef',
    '#94a3b8'
  ],
  borders: {
    'border-color': '#e5e7eb',
    'border-style': 'solid',
    'border-radius': '12px',
    'border-top-width': '1px',
    'border-left-width': '1px',
    'border-right-width': '1px',
    'border-bottom-width': '1px'
  },
  margins: [10, 10],
  mainColor: '#0f766e',
  axis: {
    'axis-color': 'rgba(107,114,128,0.2)'
  },
  legend: {
    type: 'circle' as const
  },
  tooltip: {
    background: '#111827'
  },
  itemSpecific: {
    rounding: 8,
    padding: 4
  }
};

export const CFO_GRID_THEME_DARK = {
  type: 'custom' as const,
  background: 'transparent',
  itemsBackground: '#1a1d23',
  boxShadow: {
    size: 'none',
    color: 'rgba(0,0,0,0)'
  },
  title: {
    align: 'left' as const,
    bold: false,
    italic: false,
    underline: false,
    border: false
  },
  font: {
    fontFamily: 'DM Sans, sans-serif',
    'font-style': 'normal',
    'font-weight': 500,
    fontSize: 13
  },
  colors: [
    '#5eead4',
    '#2dd4bf',
    '#93c5fd',
    '#a5b4fc',
    '#fcd34d',
    '#fca5a5',
    '#99f6e4',
    '#c4b5fd',
    '#94a3b8',
    '#67e8f9',
    '#f0abfc',
    '#cbd5e1'
  ],
  borders: {
    'border-color': '#2d3139',
    'border-style': 'solid',
    'border-radius': '12px',
    'border-top-width': '1px',
    'border-left-width': '1px',
    'border-right-width': '1px',
    'border-bottom-width': '1px'
  },
  margins: [10, 10],
  mainColor: '#5eead4',
  axis: {
    'axis-color': 'rgba(156,163,175,0.25)'
  },
  legend: {
    type: 'circle' as const
  },
  tooltip: {
    background: '#f3f4f6'
  },
  itemSpecific: {
    rounding: 8,
    padding: 4
  }
};

export function createInitialItems(): GridItemData[] {
  const cfoCardTheme = {
    ...CFO_GRID_THEME,
    mainColor: '#0f766e'
  };
  const minSizes = {
    chart: { minSizeX: 14, minSizeY: 12 },
    kpi: { minSizeX: 8, minSizeY: 6 }
  };

  const items: GridItemData[] = [
    {
      id: 'kpi-revenue',
      type: 'conditional-number',
      position: { col: 0, row: 0, sizeX: 12, sizeY: 8 },
      slots: [
        { name: 'measure', content: [formulaSlot(CFO_FORMULAS.totalRevenue, 'Total Revenue', 'numeric', { format: '$,.3s' })] },
        { name: 'target', content: [] }
      ],
      options: {
        title: 'Total Revenue',
        color: '#0f766e',
        theme: cfoCardTheme,
        display: { label: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      }
    },
    {
      id: 'kpi-ebitda-margin',
      type: 'conditional-number',
      position: { col: 12, row: 0, sizeX: 12, sizeY: 8 },
      slots: [
        {
          name: 'measure',
          content: [formulaSlot(CFO_FORMULAS.ebitdaMarginPct, 'EBITDA Margin (%)', 'numeric', { format: '.1%' })]
        },
        { name: 'target', content: [] }
      ],
      options: {
        title: 'EBITDA Margin',
        color: '#3b82f6',
        theme: cfoCardTheme,
        display: { label: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      }
    },
    {
      id: 'kpi-fcf-margin',
      type: 'conditional-number',
      position: { col: 24, row: 0, sizeX: 12, sizeY: 8 },
      slots: [
        { name: 'measure', content: [formulaSlot(CFO_FORMULAS.fcfMarginPct, 'FCF Margin (%)', 'numeric', { format: '.1%' })] },
        { name: 'target', content: [] }
      ],
      options: {
        title: 'FCF Margin',
        color: '#f59e0b',
        theme: cfoCardTheme,
        display: { label: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      }
    },
    {
      id: 'kpi-leverage',
      type: 'conditional-number',
      position: { col: 36, row: 0, sizeX: 12, sizeY: 8 },
      slots: [
        {
          name: 'measure',
          content: [formulaSlot(CFO_FORMULAS.netDebtToEbitda, 'Net Debt / EBITDA', 'numeric', { format: '.2f' })]
        },
        { name: 'target', content: [] }
      ],
      options: {
        title: 'Net Debt / EBITDA',
        color: '#6366f1',
        theme: cfoCardTheme,
        display: { label: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      }
    },
    {
      id: 'revenue-trend',
      type: 'line-chart',
      position: { col: 0, row: 8, sizeX: 24, sizeY: 21 },
      slots: [
        {
          name: 'x-axis',
          content: [
            columnSlot(CFO_COLUMNS.periodStart, 'Period', 'datetime', {
              lowestLevel: 9,
              datetimeDisplayMode: 'month_name'
            })
          ]
        },
        {
          name: 'measure',
          content: [{ ...formulaSlot(CFO_FORMULAS.totalRevenue, 'Revenue', 'numeric', { format: '$,.3s' }), color: '#0f766e' }]
        },
        {
          name: 'legend',
          content: [columnSlot(CFO_COLUMNS.scenario, 'Scenario', 'hierarchy')]
        }
      ],
      options: {
        title: { en: 'Revenue Trajectory' },
        theme: cfoCardTheme,
        display: { title: true, legend: true }
      }
    },
    {
      id: 'profitability-by-bu',
      type: 'bar-chart',
      position: { col: 24, row: 8, sizeX: 24, sizeY: 21 },
      slots: [
        {
          name: 'y-axis',
          content: [columnSlot(CFO_COLUMNS.businessUnit, 'Business Unit', 'hierarchy')]
        },
        {
          name: 'measure',
          content: [
            { ...columnSlot(CFO_COLUMNS.ebitda, 'EBITDA', 'numeric', { format: '$,.3s', aggregationFunc: 'sum' }), color: '#0f766e' },
            {
              ...columnSlot(CFO_COLUMNS.freeCashFlow, 'Free Cash Flow', 'numeric', { format: '$,.3s', aggregationFunc: 'sum' }),
              color: '#f59e0b'
            }
          ]
        }
      ],
      options: {
        title: { en: 'Profitability by Business Unit' },
        theme: cfoCardTheme,
        display: { title: true, legend: true },
        bars: { label: 'absolute' }
      }
    },
    {
      id: 'working-capital-by-region',
      type: 'column-chart',
      position: { col: 0, row: 29, sizeX: 24, sizeY: 21 },
      slots: [
        {
          name: 'x-axis',
          content: [columnSlot(CFO_COLUMNS.region, 'Region', 'hierarchy')]
        },
        {
          name: 'measure',
          content: [
            {
              ...columnSlot(CFO_COLUMNS.workingCapital, 'Working Capital', 'numeric', {
                format: '$,.3s',
                aggregationFunc: 'sum'
              }),
              color: '#3b82f6'
            }
          ]
        }
      ],
      options: {
        title: { en: 'Working Capital by Region' },
        theme: cfoCardTheme,
        display: { title: true, legend: false },
        bars: { label: 'absolute' }
      }
    },
    {
      id: 'capital-structure',
      type: 'donut-chart',
      position: { col: 24, row: 29, sizeX: 24, sizeY: 21 },
      slots: [
        {
          name: 'category',
          content: [columnSlot(CFO_COLUMNS.legalEntity, 'Legal Entity', 'hierarchy')]
        },
        {
          name: 'measure',
          content: [
            columnSlot(CFO_COLUMNS.netDebt, 'Net Debt', 'numeric', {
              format: '$,.3s',
              aggregationFunc: 'sum'
            })
          ]
        }
      ],
      options: {
        title: { en: 'Net Debt Structure' },
        theme: cfoCardTheme,
        legend: { position: 'bottom' },
        display: { title: true, legend: true, values: 'absolute' }
      }
    },
    {
      id: 'kpi-capex-intensity',
      type: 'conditional-number',
      position: { col: 0, row: 50, sizeX: 12, sizeY: 8 },
      slots: [
        {
          name: 'measure',
          content: [formulaSlot(CFO_FORMULAS.capexIntensityPct, 'Capex Intensity (%)', 'numeric', { format: '.1%' })]
        },
        { name: 'target', content: [] }
      ],
      options: {
        title: 'Capex Intensity',
        color: '#3b82f6',
        theme: cfoCardTheme,
        display: { label: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      }
    },
    {
      id: 'kpi-working-capital-ratio',
      type: 'conditional-number',
      position: { col: 12, row: 50, sizeX: 12, sizeY: 8 },
      slots: [
        {
          name: 'measure',
          content: [
            formulaSlot(CFO_FORMULAS.workingCapitalToRevenuePct, 'Working Capital / Revenue (%)', 'numeric', { format: '.1%' })
          ]
        },
        { name: 'target', content: [] }
      ],
      options: {
        title: 'Working Capital Ratio',
        color: '#0d9488',
        theme: cfoCardTheme,
        display: { label: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      }
    },
    {
      id: 'ebitda-trend',
      type: 'line-chart',
      position: { col: 24, row: 50, sizeX: 24, sizeY: 21 },
      slots: [
        {
          name: 'x-axis',
          content: [
            columnSlot(CFO_COLUMNS.periodStart, 'Period', 'datetime', {
              lowestLevel: 9,
              datetimeDisplayMode: 'month_name'
            })
          ]
        },
        {
          name: 'measure',
          content: [{ ...formulaSlot(CFO_FORMULAS.totalEbitda, 'EBITDA', 'numeric', { format: '$,.3s' }), color: '#3b82f6' }]
        },
        {
          name: 'legend',
          content: [columnSlot(CFO_COLUMNS.scenario, 'Scenario', 'hierarchy')]
        }
      ],
      options: {
        title: { en: 'EBITDA Trajectory' },
        theme: cfoCardTheme,
        display: { title: true, legend: true }
      }
    },
    {
      id: 'revenue-by-product-family',
      type: 'column-chart',
      position: { col: 0, row: 58, sizeX: 24, sizeY: 21 },
      slots: [
        {
          name: 'x-axis',
          content: [columnSlot(CFO_COLUMNS.productFamily, 'Product Family', 'hierarchy')]
        },
        {
          name: 'measure',
          content: [
            {
              ...columnSlot(CFO_COLUMNS.revenue, 'Revenue', 'numeric', {
                format: '$,.3s',
                aggregationFunc: 'sum'
              }),
              color: '#0f766e'
            }
          ]
        }
      ],
      options: {
        title: { en: 'Revenue by Product Family' },
        theme: cfoCardTheme,
        display: { title: true, legend: false },
        bars: { label: 'absolute' }
      }
    },
    {
      id: 'free-cash-flow-by-region',
      type: 'bar-chart',
      position: { col: 24, row: 71, sizeX: 24, sizeY: 21 },
      slots: [
        {
          name: 'y-axis',
          content: [columnSlot(CFO_COLUMNS.region, 'Region', 'hierarchy')]
        },
        {
          name: 'measure',
          content: [
            {
              ...columnSlot(CFO_COLUMNS.freeCashFlow, 'Free Cash Flow', 'numeric', {
                format: '$,.3s',
                aggregationFunc: 'sum'
              }),
              color: '#14b8a6'
            }
          ]
        }
      ],
      options: {
        title: { en: 'Free Cash Flow by Region' },
        theme: cfoCardTheme,
        display: { title: true, legend: false },
        bars: { label: 'absolute' }
      }
    },
    {
      id: 'debt-vs-ebitda-by-entity',
      type: 'bar-chart',
      position: { col: 0, row: 79, sizeX: 24, sizeY: 21 },
      slots: [
        {
          name: 'y-axis',
          content: [columnSlot(CFO_COLUMNS.legalEntity, 'Legal Entity', 'hierarchy')]
        },
        {
          name: 'measure',
          content: [
            {
              ...columnSlot(CFO_COLUMNS.netDebt, 'Net Debt', 'numeric', {
                format: '$,.3s',
                aggregationFunc: 'sum'
              }),
              color: '#6366f1'
            },
            {
              ...columnSlot(CFO_COLUMNS.ebitda, 'EBITDA', 'numeric', {
                format: '$,.3s',
                aggregationFunc: 'sum'
              }),
              color: '#f59e0b'
            }
          ]
        }
      ],
      options: {
        title: { en: 'Net Debt vs EBITDA by Entity' },
        theme: cfoCardTheme,
        display: { title: true, legend: true },
        bars: { label: 'absolute' }
      }
    }
  ];

  return items.map((item) => {
    if (!item.position) {
      return item;
    }

    const minSize = item.type === 'conditional-number' ? minSizes.kpi : minSizes.chart;

    return {
      ...item,
      position: {
        ...item.position,
        minSizeX: item.position.minSizeX ?? minSize.minSizeX,
        minSizeY: item.position.minSizeY ?? minSize.minSizeY
      }
    };
  });
}
