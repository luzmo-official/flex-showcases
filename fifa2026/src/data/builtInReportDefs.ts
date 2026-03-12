/**
 * Built-in report and chart definitions for the World Cup report builder.
 * Uses column names and dataset key; resolved to IDs at runtime via useSeedBuiltInReports.
 * Each dashboard contains 10–20 charts, stored in the same way as user-created reports.
 */

export const BUILTIN_DATASET_KEY = 'groupsOdds' as const

export interface BuiltInSlotContent {
  columnName: string
  type: string
  format?: string
  aggregationFunc?: string
}

export interface BuiltInChartDef {
  key: string
  chartType: string
  name: string
  slots: Array<{ name: string; content: BuiltInSlotContent[] }>
  chartOptions?: Record<string, unknown>
  chartFilters?: unknown[]
}

export interface BuiltInReportDef {
  key: string
  name: string
  /** Chart keys and grid position (12-column grid). */
  items: Array<{ chartKey: string; x: number; y: number; w: number; h: number }>
}

// ─── Chart definitions (name-based) ───────────────────────────────────────────

export const BUILTIN_CHART_DEFS: BuiltInChartDef[] = [
  {
    key: 'tournament-win-hbar',
    chartType: 'bar-chart',
    name: 'Tournament win probability',
    slots: [
      { name: 'y-axis', content: [{ columnName: 'team', type: 'hierarchy' }] },
      {
        name: 'measure',
        content: [
          {
            columnName: 'tournament_win_prob',
            type: 'numeric',
            format: '.0%',
            aggregationFunc: 'sum',
          },
        ],
      },
    ],
    chartOptions: {
      legend: { position: 'none' },
      bars: { roundedCorners: 4 },
      limit: 10,
    },
    chartFilters: [
      {
        condition: 'and',
        filters: [
          {
            expression: '? > ?',
            parameters: ['tournament_win_prob', 0.01],
          },
        ],
      },
    ],
  },
  {
    key: 'group-win-by-confederation-donut',
    chartType: 'donut-chart',
    name: 'Group win probability by confederation',
    slots: [
      {
        name: 'category',
        content: [{ columnName: 'confederation', type: 'hierarchy' }],
      },
      {
        name: 'measure',
        content: [
          {
            columnName: 'group_win_prob',
            type: 'numeric',
            format: '.0%',
            aggregationFunc: 'sum',
          },
        ],
      },
    ],
    chartOptions: { legend: { position: 'right' } },
  },
  {
    key: 'tournament-win-by-confederation-bar',
    chartType: 'bar-chart',
    name: 'Tournament win probability by confederation',
    slots: [
      {
        name: 'y-axis',
        content: [{ columnName: 'confederation', type: 'hierarchy' }],
      },
      {
        name: 'measure',
        content: [
          {
            columnName: 'tournament_win_prob',
            type: 'numeric',
            format: '.0%',
            aggregationFunc: 'sum',
          },
        ],
      },
    ],
    chartOptions: { legend: { position: 'none' } },
  },
  {
    key: 'tournament-win-pie',
    chartType: 'donut-chart',
    name: 'Tournament win share (top teams)',
    slots: [
      { name: 'category', content: [{ columnName: 'team', type: 'hierarchy' }] },
      {
        name: 'measure',
        content: [
          {
            columnName: 'tournament_win_prob',
            type: 'numeric',
            format: '.0%',
            aggregationFunc: 'sum',
          },
        ],
      },
    ],
    chartOptions: { legend: { position: 'right' } },
    chartFilters: [
      {
        condition: 'and',
        filters: [
          { expression: '? > ?', parameters: ['tournament_win_prob', 0.01] },
        ],
      },
    ],
  },
  {
    key: 'tournament-win-treemap',
    chartType: 'treemap-chart',
    name: 'Tournament win probability (treemap)',
    slots: [
      { name: 'category', content: [{ columnName: 'team', type: 'hierarchy' }] },
      {
        name: 'measure',
        content: [
          {
            columnName: 'tournament_win_prob',
            type: 'numeric',
            format: '.0%',
            aggregationFunc: 'sum',
          },
        ],
      },
    ],
    chartFilters: [
      {
        condition: 'and',
        filters: [
          { expression: '? > ?', parameters: ['tournament_win_prob', 0.005] },
        ],
      },
    ],
  },
  {
    key: 'advance-vs-groupwin-scatter',
    chartType: 'scatter-plot',
    name: 'Advance vs group win by group',
    slots: [
      {
        name: 'x-axis',
        content: [
          {
            columnName: 'group_advance_prob',
            type: 'numeric',
            format: '.0%',
            aggregationFunc: 'sum',
          },
        ],
      },
      {
        name: 'y-axis',
        content: [
          {
            columnName: 'group_win_prob',
            type: 'numeric',
            format: '.0%',
            aggregationFunc: 'sum',
          },
        ],
      },
      {
        name: 'name',
        content: [{ columnName: 'team', type: 'hierarchy' }],
      },
      {
        name: 'color',
        content: [{ columnName: 'group', type: 'hierarchy' }],
      },
    ],
    chartOptions: {
      legend: { position: 'right' },
      display: { tooltip: { enabled: true } },
      tooltip: { font: { size: 14 }, padding: 10 },
    },
  },
]

// ─── Built-in Group Analytics (tagged as group templates, shown on each group page) ───

export const BUILTIN_GROUP_CHART_DEFS: BuiltInChartDef[] = [
  {
    key: 'group-advance-bar',
    chartType: 'bar-chart',
    name: 'Group advancement probability',
    slots: [
      { name: 'y-axis', content: [{ columnName: 'team', type: 'hierarchy' }] },
      {
        name: 'measure',
        content: [
          {
            columnName: 'group_advance_prob',
            type: 'numeric',
            format: '.0%',
            aggregationFunc: 'sum',
          },
        ],
      },
    ],
    chartOptions: {
      legend: { position: 'none' },
      bars: { roundedCorners: 4 },
      limit: 10,
    },
  },
  {
    key: 'group-tournament-win-bar',
    chartType: 'bar-chart',
    name: 'Tournament win probability',
    slots: [
      { name: 'y-axis', content: [{ columnName: 'team', type: 'hierarchy' }] },
      {
        name: 'measure',
        content: [
          {
            columnName: 'tournament_win_prob',
            type: 'numeric',
            format: '.0%',
            aggregationFunc: 'sum',
          },
        ],
      },
    ],
    chartOptions: {
      legend: { position: 'none' },
      bars: { roundedCorners: 4 },
      limit: 10,
    },
  },
  {
    key: 'group-advance-vs-win-scatter',
    chartType: 'scatter-plot',
    name: 'Advance vs group win',
    slots: [
      {
        name: 'x-axis',
        content: [
          {
            columnName: 'group_advance_prob',
            type: 'numeric',
            format: '.0%',
            aggregationFunc: 'sum',
          },
        ],
      },
      {
        name: 'y-axis',
        content: [
          {
            columnName: 'group_win_prob',
            type: 'numeric',
            format: '.0%',
            aggregationFunc: 'sum',
          },
        ],
      },
      {
        name: 'name',
        content: [{ columnName: 'team', type: 'hierarchy' }],
      },
      {
        name: 'color',
        content: [{ columnName: 'group', type: 'hierarchy' }],
      },
    ],
    chartOptions: {
      legend: { position: 'right' },
      display: { tooltip: { enabled: true } },
      tooltip: { font: { size: 14 }, padding: 10 },
    },
  },
]

// ─── Built-in Match Analytics (tagged as match templates, shown on each match page) ───

export const BUILTIN_MATCH_CHART_DEFS: BuiltInChartDef[] = [
  {
    key: 'match-tournament-win-bar',
    chartType: 'bar-chart',
    name: 'Tournament win probability',
    slots: [
      { name: 'y-axis', content: [{ columnName: 'team', type: 'hierarchy' }] },
      {
        name: 'measure',
        content: [
          {
            columnName: 'tournament_win_prob',
            type: 'numeric',
            format: '.0%',
            aggregationFunc: 'sum',
          },
        ],
      },
    ],
    chartOptions: {
      legend: { position: 'none' },
      bars: { roundedCorners: 4 },
      limit: 10,
    },
  },
  {
    key: 'match-group-advance-bar',
    chartType: 'bar-chart',
    name: 'Group advancement probability',
    slots: [
      { name: 'y-axis', content: [{ columnName: 'team', type: 'hierarchy' }] },
      {
        name: 'measure',
        content: [
          {
            columnName: 'group_advance_prob',
            type: 'numeric',
            format: '.0%',
            aggregationFunc: 'sum',
          },
        ],
      },
    ],
    chartOptions: {
      legend: { position: 'none' },
      bars: { roundedCorners: 4 },
      limit: 10,
    },
  },
  {
    key: 'match-group-win-bar',
    chartType: 'bar-chart',
    name: 'Group win probability',
    slots: [
      { name: 'y-axis', content: [{ columnName: 'team', type: 'hierarchy' }] },
      {
        name: 'measure',
        content: [
          {
            columnName: 'group_win_prob',
            type: 'numeric',
            format: '.0%',
            aggregationFunc: 'sum',
          },
        ],
      },
    ],
    chartOptions: {
      legend: { position: 'none' },
      bars: { roundedCorners: 4 },
      limit: 10,
    },
  },
]

// ─── Report definition: World Cup 2026 at a glance (varied layout) ───

export const BUILTIN_REPORT_DEFS: BuiltInReportDef[] = [
  {
    key: 'world-cup-at-a-glance',
    name: 'World Cup 2026 at a glance',
    items: [
      { chartKey: 'tournament-win-treemap', x: 0, y: 0, w: 6, h: 3 },
      { chartKey: 'group-win-by-confederation-donut', x: 6, y: 0, w: 6, h: 3 },
      { chartKey: 'tournament-win-hbar', x: 0, y: 3, w: 12, h: 4 },
      { chartKey: 'advance-vs-groupwin-scatter', x: 0, y: 7, w: 12, h: 4 },
      { chartKey: 'tournament-win-by-confederation-bar', x: 0, y: 11, w: 6, h: 3 },
      { chartKey: 'tournament-win-pie', x: 6, y: 11, w: 6, h: 3 },
    ],
  },
]