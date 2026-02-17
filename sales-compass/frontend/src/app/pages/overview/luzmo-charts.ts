import { VizItemOptions } from '@luzmo/dashboard-contents-types';

import {
  DATASET_ID,
  COLUMN_ID_DEAL_STAGE,
  COLUMN_ID_CLOSE_DATE,
  COLUMN_ID_EXPECTED_CLOSE_DATE,
  COLUMN_ID_DEAL_AMOUNT,
  COLUMN_ID_EXPECTED_DEAL_AMOUNT
} from '../../constants/luzmo-constants';
import { LuzmoFlexChart } from '../../types';

export const createRevenueEvolutionChart = (
  luzmoFlexOptions: Pick<VizItemOptions, 'theme' | 'locale' | 'loader'>,
  currencySymbol: '€' | '$'
): LuzmoFlexChart => ({
  type: 'column-chart',
  options: {
    mode: 'grouped',
    categories: {
      colored: true
    },
    grid: {
      x: {
        enabled: false
      },
      y: {
        enabled: true
      }
    },
    axislabels: {
      x: {
        enabled: false,
        position: 'center'
      },
      y: {
        enabled: false,
        position: 'middle'
      }
    },
    axis: {
      x: {
        ticksMode: 'ticks'
      },
      y: {
        ticksMode: 'ticks',
        scale: 'linear'
      }
    },
    bars: {
      label: 'absolute'
    },
    display: {
      title: true,
      legend: true,
      modeOption: false
    },
    title: {
      en: 'New revenue per quarter',
      fr: 'Nouvelles ventes par trimestre',
      de: 'Neuer Umsatz pro Quartal',
      es: 'Nuevos ingresos por trimestre',
      nl: 'Nieuwe omzet per kwartaal'
    },
    legend: {
      position: 'topRight'
    },
    interactivity: {
      availableExportTypes: [],
      customEvents: undefined,
      customTooltip: undefined,
      exportTypes: [],
      select: false
    },
    limit: {
      number: 500
    },
    sort: {
      by: 'category',
      direction: 'asc'
    },
    ...luzmoFlexOptions
  },
  slots: [
    {
      name: 'measure',
      content: [
        {
          columnId: COLUMN_ID_DEAL_AMOUNT,
          datasetId: DATASET_ID,
          label: {
            en: 'Closed new revenue',
            fr: 'Nouvelles ventes réalisées',
            de: 'Abgeschlossener neuer Umsatz',
            es: 'Nuevos ingresos cerrados',
            nl: 'Afgesloten nieuwe omzet'
          },
          type: 'numeric',
          subtype: 'currency',
          format: ',.3as',
          currency: currencySymbol
        }
      ]
    },
    {
      name: 'x-axis',
      content: [
        {
          columnId: COLUMN_ID_CLOSE_DATE,
          datasetId: DATASET_ID,
          label: {
            en: 'Close date (Qtr)',
            fr: 'Date de clôture (Trimestre)',
            de: 'Abschlussdatum (Quartal)',
            es: 'Fecha de cierre (Trim.)',
            nl: 'Sluitingsdatum (Kwartaal)'
          },
          type: 'datetime',
          subtype: null,
          format: '%amd~%Y',
          lowestLevel: 5,
          level: 2
        }
      ]
    },
    {
      name: 'legend',
      content: []
    }
  ],
  filters: [
    {
      condition: 'and',
      filters: [
        {
          expression: '? in ?',
          parameters: [
            {
              column_id: COLUMN_ID_DEAL_STAGE,
              dataset_id: DATASET_ID,
              level: 1
            },
            ['Closed Won']
          ]
        },
        // Show last available 6 quarters
        {
          expression: 'last_available',
          parameters: [
            {
              column_id: COLUMN_ID_CLOSE_DATE,
              dataset_id: DATASET_ID
            },
            {
              unit: 2,
              quantity: 5
            }
          ]
        },
        {
          expression: '? <= ?',
          parameters: [
            {
              column_id: COLUMN_ID_CLOSE_DATE,
              dataset_id: DATASET_ID
            },
            new Date().toISOString()
          ]
        }
      ]
    }
  ]
});

export const createActualRevenueChart = (
  luzmoFlexOptions: Pick<VizItemOptions, 'theme' | 'locale' | 'loader'>,
  currencySymbol: '€' | '$'
): LuzmoFlexChart => ({
  type: 'evolution-number',
  slots: [
    {
      name: 'measure',
      content: [
        {
          columnId: COLUMN_ID_DEAL_AMOUNT,
          datasetId: DATASET_ID,
          label: {
            en: 'Closed new revenue in this quarter',
            fr: 'Nouvelles ventes réalisées dans ce trimestre',
            de: 'Abgeschlossener neuer Umsatz in diesem Quartal',
            es: 'Nuevos ingresos cerrados en este trimestre',
            nl: 'Afgesloten nieuwe omzet dit kwartaal'
          },
          type: 'numeric',
          subtype: 'currency',
          format: ',.3as',
          currency: currencySymbol
        }
      ]
    },
    {
      name: 'evolution',
      content: []
    }
  ],
  options: {
    showTitle: true,
    showSubtitle: false,
    subtitle: {},
    showImage: false,
    imageMode: 'icon',
    imageSize: 40,
    imageAsBackground: false,
    imageRounded: false,
    imageColor: '#5A5A5A',
    imageBackgroundOpacity: 50,
    titlePosition: 'bottom',
    subtitlePosition: 'bottom',
    imagePosition: 'left',
    horizontalAlignment: 'left',
    verticalAlignment: 'top',
    evolutionGraphDisplay: 'none',
    evolutionGraphType: 'area',
    evolutionGraphOpacity: 35,
    evolutionGraphInterpolation: 'linear',
    evolutionColor: 'normal',
    link: {
      tooltip: {}
    },
    interactivity: {
      availableExportTypes: [],
      customEvents: undefined,
      exportTypes: []
    },
    display: {
      title: false
    },
    missingValue: {
      type: 'no'
    },
    title: {
      en: 'Closed new revenue in current quarter',
      fr: 'Nouvelles ventes réalisées dans le trimestre en cours',
      de: 'Abgeschlossener neuer Umsatz im aktuellen Quartal',
      es: 'Nuevos ingresos cerrados en el trimestre actual',
      nl: 'Afgesloten nieuwe omzet in huidig kwartaal'
    },
    titleFontSize: 14,
    numberFontSize: 64,
    ...luzmoFlexOptions
  },
  filters: [
    {
      condition: 'and',
      filters: [
        {
          expression: '? in ?',
          parameters: [
            {
              column_id: COLUMN_ID_DEAL_STAGE,
              dataset_id: DATASET_ID,
              level: 1
            },
            ['Closed Won']
          ]
        },
        {
          expression: 'to_date',
          parameters: [
            {
              column_id: COLUMN_ID_CLOSE_DATE,
              dataset_id: DATASET_ID
            },
            {
              unit: 2,
              quantity: 0
            }
          ]
        }
      ]
    }
  ]
});

export const createExpectedRevenueChart = (
  luzmoFlexOptions: Pick<VizItemOptions, 'theme' | 'locale' | 'loader'>,
  currencySymbol: '€' | '$'
): LuzmoFlexChart => ({
  type: 'evolution-number',
  options: {
    showTitle: true,
    showSubtitle: false,
    subtitle: {},
    showImage: false,
    imageMode: 'icon',
    imageSize: 40,
    imageAsBackground: false,
    imageRounded: false,
    imageColor: '#5A5A5A',
    imageBackgroundOpacity: 50,
    titlePosition: 'bottom',
    subtitlePosition: 'bottom',
    imagePosition: 'left',
    horizontalAlignment: 'left',
    verticalAlignment: 'top',
    evolutionGraphDisplay: 'none',
    evolutionGraphType: 'area',
    evolutionGraphOpacity: 35,
    evolutionGraphInterpolation: 'linear',
    evolutionColor: 'normal',
    link: {
      tooltip: {}
    },
    interactivity: {
      availableExportTypes: [],
      customEvents: undefined,
      exportTypes: []
    },
    display: {
      title: false
    },
    missingValue: {
      type: 'no'
    },
    title: {
      en: 'Expected new revenue in this quarter',
      fr: 'Nouvelles ventes attendues dans ce trimestre',
      de: 'Erwarteter neuer Umsatz in diesem Quartal',
      es: 'Ingresos nuevos esperados este trimestre',
      nl: 'Verwachte nieuwe omzet dit kwartaal'
    },
    titleFontSize: 14,
    numberFontSize: 64,
    ...luzmoFlexOptions
  },
  slots: [
    {
      name: 'measure',
      content: [
        {
          columnId: COLUMN_ID_EXPECTED_DEAL_AMOUNT,
          datasetId: DATASET_ID,
          label: {
            en: 'Expected new revenue in this quarter',
            fr: 'Nouvelles ventes attendues dans ce trimestre',
            de: 'Erwarteter neuer Umsatz in diesem Quartal',
            es: 'Ingresos nuevos esperados este trimestre',
            nl: 'Verwachte nieuwe omzet dit kwartaal'
          },
          type: 'numeric',
          subtype: 'currency',
          format: ',.3as',
          currency: currencySymbol
        }
      ]
    },
    {
      name: 'evolution',
      content: []
    }
  ],
  filters: [
    {
      condition: 'and',
      filters: [
        {
          expression: 'last_now',
          parameters: [
            {
              column_id: COLUMN_ID_EXPECTED_CLOSE_DATE,
              dataset_id: DATASET_ID
            },
            {
              unit: 2,
              quantity: 0
            }
          ]
        }
      ]
    }
  ]
});
