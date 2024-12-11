import { LIGHTTHEME } from './theme.constant';
import { DATASETS } from './datasets.constant';

export type ChartListItem = {
  key: string;
  title: string;
  class: string;
  chart: any;
};

export function CreateNumberChart(
  dataset: string,
  measure: string,
  aggregationFunc?: string,
  label?: string
): any {
  const column = (DATASETS[dataset].columns as any)[measure];
  const isFormula = column?.formula;
  const aggregation = aggregationFunc ?? column?.aggregationFunc ?? 'sum';
  const measureLabel = label ? { en: label } : column?.label;
  if (column) {
    const chart = {
      type: 'evolution-number',
      options: {
        numberFontSize: 40,
        display: { title: false },
        interactivity: {
          exportTypes: [],
          availableExportTypes: ['xlsx', 'csv'],
        },
        LIGHTTHEME,
      },
      slots: [
        {
          name: 'measure',
          content: [
            { ...column, label: measureLabel, aggregationFunc: aggregation },
          ],
        },
      ],
    };
    if (isFormula) {
      delete chart.slots[0].content[0].aggregationFunc;
    }
    return chart;
  }
  return {};
}

export function CreateBarChart(
  dataset: string,
  measure: string,
  aggregationFunc?: string,
  label?: string
): any {
  const column = (DATASETS[dataset].columns as any)[measure];
  const yAxisColumn = DATASETS[dataset].columns['name'];
  const aggregation = aggregationFunc ?? column?.aggregationFunc ?? 'sum';
  const measureLabel = label ? { en: label } : column?.label;
  if (column) {
    return {
      type: 'bar-chart',
      options: {
        display: { title: false },
        bars: { label: 'absolute' },
        sort: {
          by: 'measure',
          direction: 'desc',
        },
        interactivity: {
          exportTypes: [],
          availableExportTypes: ['xlsx', 'csv'],
          select: false,
          customEvents: CUSTOMEVENTFORPLAYERDETAIL(dataset)
        },
        LIGHTTHEME,
      },
      filters: [
        {
          condition: 'and',
          filters: [
            GENERICCOUNTRYFILTERPART(dataset),
            {
              expression: '? > ?',
              parameters: [
                {
                  dataset_id: DATASETS[dataset].set,
                  column_id: column.column,
                },
                0,
              ],
            },
          ],
        },
      ],
      slots: [
        {
          name: 'measure',
          content: [
            { ...column, label: measureLabel, aggregationFunc: aggregation },
          ],
        },
        {
          name: 'y-axis',
          content: [{ ...yAxisColumn }],
        },
      ],
      LIGHTTHEME,
    };
  }
  return {};
}

export function CreatePlayersStackedBarChart(
  measures: string[],
  aggregationFunc?: string,
  measureLabels?: string[],
  filterColumnName?: string,
  optionsMerge?: any
): any {
  const columns = measures.map(
    (measure) => (DATASETS['players'].columns as any)[measure]
  );
  const yAxisColumn = DATASETS['players'].columns['name'];
  const filterColumn = filterColumnName
    ? (DATASETS['players'].columns as any)[filterColumnName]
    : null;
  if (measureLabels && measureLabels.length) {
    for (let i = 0; i < measureLabels.length; i++) {
      columns[i].label = { en: measureLabels[i] };
    }
  }
  if (aggregationFunc) {
    for (let i = 0; i < columns.length; i++) {
      columns[i].aggregationFunc = aggregationFunc;
    }
  }
  if (columns) {
    const chart: any = {
      type: 'bar-chart',
      options: {
        display: { title: false },
        legend: { position: 'top' },
        bars: { label: 'absolute' },
        mode: 'stacked',
        interactivity: {
          exportTypes: [],
          availableExportTypes: ['xlsx', 'csv'],
          select: false,
          customEvents: CUSTOMEVENTFORPLAYERDETAIL('players')
        },
        sort: {
          by: 'measure',
          direction: 'desc',
        },
        ...optionsMerge,
        LIGHTTHEME,
      },
      filters: [
        {
          condition: 'and',
          filters: [GENERICCOUNTRYFILTERPART('players')],
        },
      ],
      slots: [
        {
          name: 'measure',
          content: [...columns],
        },
        {
          name: 'y-axis',
          content: [{ ...yAxisColumn }],
        },
      ],
    };
    if (filterColumn) {
      chart.filters[0].filters.push({
        expression: '? > ?',
        parameters: [
          {
            dataset_id: DATASETS['players'].set,
            column_id: filterColumn.column,
          },
          0,
        ],
      });
    }
    return chart;
  }
  return {};
}

export function CreatePlayersDonutChart(
  measure: string,
  aggregationFunc?: string,
  label?: string,
  optionsMerge?: any
): any {
  const column = (DATASETS['players'].columns as any)[measure];
  const categoryColumn = DATASETS['players'].columns['name'];
  const aggregation = aggregationFunc ?? column?.aggregationFunc ?? 'sum';
  const measureLabel = label ? { en: label } : column?.label;
  if (column) {
    return {
      type: 'donut-chart',
      options: {
        display: {
          title: false,
          legend: false,
          categoryLabels: true,
          values: 'percentage',
        },
        slices: { width: 0.6 },
        interactivity: {
          exportTypes: [],
          availableExportTypes: ['xlsx', 'csv'],
          select: false,
          customEvents: CUSTOMEVENTFORPLAYERDETAIL('players')
        },
        LIGHTTHEME,
        ...(optionsMerge ?? {}),
      },
      filters: [
        {
          condition: 'and',
          filters: [
            GENERICCOUNTRYFILTERPART('players'),
            {
              expression: '? > ?',
              parameters: [
                {
                  dataset_id: DATASETS['players'].set,
                  column_id: column.column,
                },
                0,
              ],
            },
          ],
        },
      ],
      slots: [
        {
          name: 'measure',
          content: [
            { ...column, label: measureLabel, aggregationFunc: aggregation },
          ],
        },
        {
          name: 'category',
          content: [{ ...categoryColumn }],
        },
      ],
    };
  }
  return {};
}

export function CreatePlayersTreemapChart(
  measure: string,
  aggregationFunc?: string,
  label?: string,
  optionsMerge?: any
): any {
  const column = (DATASETS['players'].columns as any)[measure];
  const categoryColumn = DATASETS['players'].columns['name'];
  const aggregation = aggregationFunc ?? column?.aggregationFunc ?? 'sum';
  const measureLabel = label ? { en: label } : column?.label;
  if (column) {
    return {
      type: 'treemap-chart',
      options: {
        display: { title: false, labels: true, values: 'absolute' },
        interactivity: {
          exportTypes: [],
          availableExportTypes: ['xlsx', 'csv'],
          select: false,
          customEvents: CUSTOMEVENTFORPLAYERDETAIL('players')
        },
        LIGHTTHEME,
        ...(optionsMerge ?? {}),
      },
      filters: [
        {
          condition: 'and',
          filters: [
            GENERICCOUNTRYFILTERPART('players'),
            {
              expression: '? > ?',
              parameters: [
                {
                  dataset_id: DATASETS['players'].set,
                  column_id: column.column,
                },
                0,
              ],
            },
          ],
        },
      ],
      slots: [
        {
          name: 'measure',
          content: [
            { ...column, label: measureLabel, aggregationFunc: aggregation },
          ],
        },
        {
          name: 'category',
          content: [{ ...categoryColumn }],
        },
      ],
    };
  }
  return {};
}

export function CreatePlayersBubbleChart(
  measure: string,
  aggregationFunc?: string,
  label?: string,
  optionsMerge?: any
): any {
  const column = (DATASETS['players'].columns as any)[measure];
  const categoryColumn = DATASETS['players'].columns['name'];
  const aggregation = aggregationFunc ?? column?.aggregationFunc ?? 'sum';
  const measureLabel = label ? { en: label } : column?.label;
  if (column) {
    return {
      type: 'bubble-chart',
      options: {
        display: {
          title: false,
          bubbleValues: 'absolute',
        },
        interactivity: {
          exportTypes: [],
          availableExportTypes: ['xlsx', 'csv'],
          select: false,
          customEvents: CUSTOMEVENTFORPLAYERDETAIL('players')
        },
        LIGHTTHEME,
        ...(optionsMerge ?? {}),
      },
      filters: [
        {
          condition: 'and',
          filters: [
            GENERICCOUNTRYFILTERPART('players'),
            {
              expression: '? > ?',
              parameters: [
                {
                  dataset_id: DATASETS['players'].set,
                  column_id: column.column,
                },
                0,
              ],
            },
          ],
        },
      ],
      slots: [
        {
          name: 'measure',
          content: [
            { ...column, label: measureLabel, aggregationFunc: aggregation },
          ],
        },
        {
          name: 'category',
          content: [{ ...categoryColumn }],
        },
      ],
    };
  }
  return {};
}

export function CreateFunnelProbabilityChart(
  label?: string,
  optionsMerge?: any
): any {
  const measureLabel = label
    ? { en: label }
    : DATASETS['tournamentProbabilitiesPerTeam'].columns['probability'].label;
  return {
    type: 'funnel-chart',
    options: {
      display: {
        title: false,
        legend: false,
        categoryLabels: true,
        values: true,
      },
      mode: 'dynamicWidth',
      funnel: {
        rectangle: false,
        absValue: true,
        perc: 'hide',
      },
      interactivity: {
        select: false,
        exportTypes: [],
        availableExportTypes: ['xlsx', 'csv'],
      },
      LIGHTTHEME,
      ...(optionsMerge ?? {}),
    },
    filters: [
      {
        condition: 'and',
        filters: [
          GENERICCOUNTRYFILTERPART('tournamentProbabilitiesPerTeam'),
          {
            expression: '? = ?',
            parameters: [
              {
                dataset_id: DATASETS['tournamentProbabilitiesPerTeam'].set,
                column_id:
                  DATASETS['tournamentProbabilitiesPerTeam'].columns[
                    'currentPrediction'
                  ].column,
              },
              'TRUE',
            ],
          },
          {
            expression: '? != ?',
            parameters: [
              {
                dataset_id: DATASETS['tournamentProbabilitiesPerTeam'].set,
                column_id:
                  DATASETS['tournamentProbabilitiesPerTeam'].columns['phase']
                    .column,
              },
              'Group winner',
            ],
          },
        ],
      },
    ],
    slots: [
      {
        name: 'measure',
        content: [
          {
            ...DATASETS['tournamentProbabilitiesPerTeam'].columns[
              'probability'
            ],
            label: measureLabel,
            aggregationFunc: 'average',
          },
        ],
      },
      {
        name: 'category',
        content: [
          { ...DATASETS['tournamentProbabilitiesPerTeam'].columns['phase'] },
        ],
      },
    ],
  };
}

export function CreateProbabilityHeatTable(
  label?: string,
  optionsMerge?: any
): any {
  const measureLabel = label
    ? { en: label }
    : DATASETS['tournamentProbabilitiesPerTeam'].columns['probability'].label;
  return {
    type: 'heat-table',
    options: {
      display: {
        title: false,
      },
      axis: {
        x: {
          ticksMode: 'hide',
        },
        y: {
          ticksMode: 'hide',
        },
      },
      classification: 'quantile',
      colorsClass: 'YlGnBu',
      colorsType: 'sequential',
      numberClasses: 9,
      heattable: {
        opacity: 1,
        rounding: 4,
        spacing: 2,
      },
      values: {
        display: true,
      },
      interactivity: {
        select: false,
        exportTypes: [],
        availableExportTypes: ['xlsx', 'csv', 'png'],
        customEvents: {
          events: [
            {
              name: 'country',
              label: {
                en: 'Select country',
              },
            },
          ],
          extraData: [],
        },
      },
    },
    filters: [
      {
        condition: 'and',
        filters: [
          {
            expression: '? = ?',
            parameters: [
              {
                dataset_id: DATASETS['tournamentProbabilitiesPerTeam'].set,
                column_id:
                  DATASETS['tournamentProbabilitiesPerTeam'].columns[
                    'currentPrediction'
                  ].column,
              },
              'TRUE',
            ],
          },
        ],
      },
    ],
    slots: [
      {
        name: 'measure',
        content: [
          {
            ...DATASETS['tournamentProbabilitiesPerTeam'].columns[
              'probability'
            ],
            label: measureLabel,
            aggregationFunc: 'average',
          },
        ],
      },
      {
        name: 'y-axis',
        content: [
          {
            ...DATASETS['tournamentProbabilitiesPerTeam'].columns[
              'countryCode'
            ],
          },
        ],
      },
      {
        name: 'x-axis',
        content: [
          {
            ...DATASETS['tournamentProbabilitiesPerTeam'].columns['phase'],
          },
        ],
      },
    ],
  };
}

export function CreateEAProfileRadarChart(position: string): any {
  return {
    type: 'radar-chart',
    options: {
      display: {
        title: false,
        legend: false,
        points: true
      },
      fillOpacity: 0.15,
      pointSize: 3,
      manualAxes: true,
      manualAxesRange: [
        0,
        100
      ],
      interactivity: {
        exportTypes: [],
        availableExportTypes: ['xlsx', 'csv'],
        select: false
      },
      LIGHTTHEME
    },
    filters: [
      {
        condition: 'and',
        filters: [
          {
            expression: '? = ?',
            parameters: [
              {
                dataset_id: DATASETS['eaProfilesTransposed'].set,
                column_id: DATASETS['eaProfilesTransposed'].columns['id'].column,
              },
              0,
            ],
          },
          {
            expression: '? in ?',
            parameters: [
              {
                dataset_id: DATASETS['eaProfilesTransposed'].set,
                column_id: DATASETS['eaProfilesTransposed'].columns['statName'].column,
              },
              position === 'GOALKEEPER'
                ? ['eaGkDiving', 'eaGkHandling', 'eaGkPositioning', 'eaGkReflexes', 'eaGkKicking', 'eaPhysicality']
                : ['eaDefending', 'eaPhysicality', 'eaShooting', 'eaPassing', 'eaDribbling', 'eaPace'],
            ],
          },
        ],
      },
    ],
    slots: [
      {
        name: 'measure',
        content: [
          { 
            ...DATASETS['eaProfilesTransposed'].columns['value'],
            label: { en: 'Value' },
            aggregationFunc: 'average'
          },
        ],
      },
      {
        name: 'category',
        content: [{ ...DATASETS['eaProfilesTransposed'].columns['statName'] }],
      },
    ],
  };
}

export function CUSTOMEVENTFORPLAYERDETAIL(dataset: string) {
  let detailId = 'id';
  if (dataset === 'players') {
    detailId = 'playerId';
  } else if (dataset === 'teams') {
    detailId = 'countryCode';
  }
  return {
    events: [
      {
        name: ['players', 'marketValue', 'eaProfiles', 'squad'].includes(dataset) ? 'playersDetail' : dataset + 'Detail',
        label: {
          en: 'Detail',
        },
      },
    ],
    extraData: [
      {
        label: 'id',
        datasetId: DATASETS[dataset].set,
        columnId: DATASETS[dataset].columns[detailId].column,
        formulaId: null,
        aggregation: 'min',
        weightedDatasetId: null,
        weightedColumnId: null,
      },
    ],
  };
} 

export function GENERICCOUNTRYFILTERPART(dataset: string) {
  return {
    expression: '? in ?',
    parameters: [
      {
        dataset_id: DATASETS[dataset].set,
        column_id: DATASETS[dataset].columns['countryCode'].column,
        level: 1,
      },
      ['BEL'],
    ],
  };
}

export function GENERICTEAMCOUNTRYFILTER() {
  return [
    {
      condition: 'or',
      filters: [
        {
          expression: '? in ?',
          parameters: [
            {
              dataset_id: DATASETS['teams'].set,
              column_id: DATASETS['teams'].columns['countryCode'].column,
              level: 1,
            },
            ['BEL'],
          ],
        },
      ],
    },
  ];
}

export function GENERICPLAYERFILTER(dataset: string = 'players') {
  let idColumn = 'playerId';
  if (['marketValue', 'eaProfiles'].includes(dataset)) {
    idColumn = 'id';
  }
  return [
    {
      condition: 'and',
      filters: [
        {
          expression: '? = ?',
          parameters: [
            {
              dataset_id: DATASETS[dataset].set,
              column_id: DATASETS[dataset].columns[idColumn].column
            },
            0,
          ],
        },
      ],
    },
  ];
}

export const CHARTS: { [nameChart: string]: any } = {
  offenseOnOffTarget: () => {
    return {
      type: 'bar-chart',
      options: {
        display: { title: false },
        mode: '100',
        bars: {
          label: 'percentageCategory',
        },
        legend: {
          position: 'top',
        },
        LIGHTTHEME,
      },
      filters: [
        {
          condition: 'and',
          filters: [
            GENERICCOUNTRYFILTERPART('players'),
            {
              expression: '? in ?',
              parameters: [
                {
                  dataset_id: DATASETS['players'].set,
                  column_id: DATASETS['players'].columns['position'].column,
                  level: 1,
                },
                ['FORWARD', 'MIDFIELDER'],
              ],
            },
            {
              expression: '? > ?',
              parameters: [
                {
                  dataset_id: DATASETS['players'].set,
                  column_id:
                    DATASETS['players'].columns['attemptsTarget'].column,
                },
                0,
              ],
            },
          ],
        },
      ],
      slots: [
        {
          name: 'measure',
          content: [
            {
              ...DATASETS['players'].columns['attemptsOnTarget'],
            },
            {
              ...DATASETS['players'].columns['attemptsOffTarget'],
            },
            {
              ...DATASETS['players'].columns['attemptsBlocked'],
            },
          ],
        },
        {
          name: 'y-axis',
          content: [
            {
              ...DATASETS['players'].columns['name'],
            },
          ],
        },
      ],
    };
  }
};
