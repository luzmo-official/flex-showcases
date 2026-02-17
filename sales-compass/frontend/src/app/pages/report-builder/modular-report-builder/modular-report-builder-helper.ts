import {
  barChartSlotsConfig,
  bubbleChartSlotsConfig,
  columnChartSlotsConfig,
  donutChartSlotsConfig,
  evolutionNumberSlotsConfig,
  funnelChartSlotsConfig,
  lineChartSlotsConfig,
  regularTableSlotsConfig,
  treemapChartSlotsConfig
} from '@luzmo/analytics-components-kit/item-slots-configs';
import { ColumnChartLabel, VizItemType } from '@luzmo/dashboard-contents-types';
import {
  type IconDefinition,
  luzmoBarChartSimple,
  luzmoBubbleChartSimple,
  luzmoColumnChartSimple,
  luzmoDonutChartSimple,
  luzmoDotExpanded,
  luzmoEvolutionNumberSimple,
  luzmoFunnelChartSimple,
  luzmoLineChartSimple,
  luzmoRegularTableSimple,
  luzmoTreemapChartSimple
} from '@luzmo/icons';

import { LuzmoChartConfig, LuzmoFlexChart, PartialRecord } from '../../../types';

export type LuzmoGridItem = LuzmoFlexChart & {
  id?: string;
  position: { sizeX: number; sizeY: number; row: number; col: number };
};

export const luzmoCharts: LuzmoChartConfig[] = [
  {
    type: 'funnel-chart',
    slotsConfig: funnelChartSlotsConfig,
    slotContents: funnelChartSlotsConfig.map((slot) => ({
      name: slot.name,
      content: []
    })),
    defaultOptions: {
      display: {
        values: true
      },
      interactivity: {
        exportTypes: []
      }
    }
  },
  {
    type: 'bar-chart',
    slotsConfig: barChartSlotsConfig,
    slotContents: barChartSlotsConfig.map((slot) => ({
      name: slot.name,
      content: []
    })),
    defaultOptions: {
      mode: 'stacked',
      bars: {
        label: 'absolute'
      },
      legend: {
        position: 'right'
      },
      interactivity: {
        exportTypes: []
      }
    }
  },
  {
    type: 'line-chart',
    slotsConfig: lineChartSlotsConfig,
    slotContents: lineChartSlotsConfig.map((slot) => ({
      name: slot.name,
      content: []
    })),
    defaultOptions: {
      interpolation: 'monotone',
      lines: {
        strokeWidth: 1,
        gradient: true
      },
      markers: {
        enabled: true,
        size: 2
      },
      legend: {
        position: 'right'
      },
      interactivity: {
        exportTypes: []
      }
    }
  },
  {
    type: 'column-chart',
    slotsConfig: columnChartSlotsConfig,
    slotContents: columnChartSlotsConfig.map((slot) => ({
      name: slot.name,
      content: []
    })),
    defaultOptions: {
      mode: 'stacked',
      bars: {
        label: 'absolute' as ColumnChartLabel
      },
      legend: {
        position: 'right'
      },
      interactivity: {
        exportTypes: []
      }
    }
  },
  {
    type: 'donut-chart',
    slotsConfig: donutChartSlotsConfig,
    slotContents: donutChartSlotsConfig.map((slot) => ({
      name: slot.name,
      content: []
    })),
    defaultOptions: {
      display: {
        values: 'absolute',
        legend: false,
        categoryLabels: true
      },
      mode: 'donut',
      slices: {
        half: false,
        width: 0.5,
        maxNumber: 14,
        minPercentage: 3
      },
      legend: {
        position: 'right'
      },
      interactivity: {
        exportTypes: []
      }
    }
  },
  {
    type: 'treemap-chart',
    slotsConfig: treemapChartSlotsConfig,
    slotContents: treemapChartSlotsConfig.map((slot) => ({
      name: slot.name,
      content: []
    })),
    defaultOptions: {
      display: {
        labels: true,
        values: 'absolute'
      },
      interactivity: {
        exportTypes: []
      }
    }
  },
  {
    type: 'bubble-chart',
    slotsConfig: bubbleChartSlotsConfig,
    slotContents: bubbleChartSlotsConfig.map((slot) => ({
      name: slot.name,
      content: []
    })),
    defaultOptions: {
      display: {
        bubbleLabels: true,
        bubbleValues: 'absolute'
      },
      interactivity: {
        exportTypes: []
      }
    }
  },
  {
    type: 'regular-table',
    slotsConfig: regularTableSlotsConfig,
    slotContents: regularTableSlotsConfig.map((slot) => ({
      name: slot.name,
      content: []
    })),
    defaultOptions: {
      tableBorders: {
        type: 'rows',
        width: 1,
        color: 'rgba(237,237,237,0.2)'
      },
      headers: {},
      alternateRowColor: false,
      rowHeight: 36,
      infiniteScrolling: true,
      interactivity: {
        exportTypes: []
      }
    }
  },
  {
    type: 'evolution-number',
    slotsConfig: evolutionNumberSlotsConfig,
    slotContents: evolutionNumberSlotsConfig.map((slot) => ({
      name: slot.name,
      content: []
    })),
    defaultOptions: {
      showTitle: true,
      showSubtitle: false,
      titlePosition: 'bottom',
      horizontalAlignment: 'center',
      verticalAlignment: 'middle',
      evolutionGraphDisplay: 'none',
      interactivity: {
        exportTypes: []
      }
    }
  }
];

export function isLuzmoChartType(type: VizItemType): type is LuzmoChartConfig['type'] {
  return luzmoCharts.some((chart) => chart.type === type);
}

export const getLuzmoChartConfig = (type: VizItemType) => luzmoCharts.find((chart) => chart.type === type);

export const getChartIcon = (type: VizItemType): IconDefinition | null => {
  const iconMap: PartialRecord<VizItemType, IconDefinition> = {
    'funnel-chart': luzmoFunnelChartSimple,
    'bar-chart': luzmoBarChartSimple,
    'line-chart': luzmoLineChartSimple,
    'column-chart': luzmoColumnChartSimple,
    'donut-chart': luzmoDonutChartSimple,
    'treemap-chart': luzmoTreemapChartSimple,
    'bubble-chart': luzmoBubbleChartSimple,
    'regular-table': luzmoRegularTableSimple,
    'evolution-number': luzmoEvolutionNumberSimple,
    'sales-network-chart': luzmoDotExpanded
  } as PartialRecord<VizItemType, IconDefinition>;

  return iconMap[type] || null;
};

export const getChartLabel = (type: VizItemType): string => {
  const labelMap: PartialRecord<VizItemType, string> = {
    'bar-chart': 'report-builder.bar',
    'line-chart': 'report-builder.line',
    'donut-chart': 'report-builder.pie',
    'funnel-chart': 'report-builder.funnel',
    'regular-table': 'report-builder.table',
    'evolution-number': 'report-builder.kpi',
    'treemap-chart': 'report-builder.treemap',
    'bubble-chart': 'report-builder.bubble',
    'column-chart': 'report-builder.column',
    'sales-network-chart': 'report-builder.sales-network'
  } as PartialRecord<VizItemType, string>;

  return labelMap[type] || type;
};

export const getEmptyDashboardConfig = () =>
  structuredClone({
    name: '',
    items: []
  });
