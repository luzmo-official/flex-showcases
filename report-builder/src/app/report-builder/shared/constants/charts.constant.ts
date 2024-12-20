// column/bar chart options: cumulative, show data labels, show record IDs, stacked, Y-axis Scale, Y-axis label, Legend position, axis variable (auto, variable, min, max), color palette, colors
// line chart options: cumulative, show data labels, show record IDs, show markers, Y-axis Scale, Y-axis label, Legend position, axis variable (auto, variable, min, max), color palette, colors
// scatter plot: show data labels, show record IDs, X/Y-axis Scale, X/Y-axis label, X/Y axis variable (auto, variable, min, max), color palette, colors
// area chart:
// donut chart:
// pie chart:
// number chart
// regular table
// combination chart
// pivot table
// speedometer

import {
  areaChartSlotsConfig,
  barChartSlotsConfig,
  bubbleChartSlotsConfig,
  columnChartSlotsConfig,
  donutChartSlotsConfig,
  lineChartSlotsConfig,
  treemapChartSlotsConfig
} from '@luzmo/dashboard-contents-types';
import { Chart } from '../models/models';
import { PALETTES } from './color-palettes.constant';

export const COLUMN_TYPE_ICONS: Record<string, string> = {
  numeric: 'adjust',
  datetime: 'calendar_month',
  hierarchy: 'family_history',
  geography: 'public',
  spatial: 'public',
} as const;

export const CHECKBOX = (label: string, boolean: boolean, transformFn?: Function) => {
  return {
    type: 'checkbox',
    label,
    default: boolean,
    transformFn: transformFn ?? ((value: any) => value),
  };
};
export const COLORPALETTES = () => {
  return {
    type: 'colorPalette',
    values: PALETTES,
    default: 'default',
    transformFn: (value: any) => {
      const palette = PALETTES.find(p => p.key === value);
      return {
        theme: {
          mainColor: palette ? palette.colors[0] : PALETTES[0].colors[0],
          colors: palette ? palette.colors : PALETTES[0].colors
        }
      };
    },
  };
}
export const MANUALAXISRANGE = (label?: string, transformFn?: Function) => {
  return {
    type: 'variableAxisInput',
    label: label ?? 'Axis range',
    default: [],
    transformFn: transformFn ?? ((value: any) => {
      return {
        manualAxesRange: value
      };
    }),
  };
}
export const AXISSCALE = (label?: string, axisPath?: string) => {
  return {
    type: 'dropdown',
    label: label ?? 'Axis scale type',
    values: {
      linear: 'Linear',
      logarithmic_2: 'Logarithmic (2)',
      logarithmic_10: 'Logarithmic (10)'
    },
    default: 'linear',
    transformFn: ((value: any) => {
      const scale: any = {};
      let depth = scale;
      if (axisPath) {
        for (const path of axisPath.split('.')) {
          depth[path] = {};
          depth = depth[path];
        }
      }
      else {
        scale['x'] = {};
        depth = scale['x'];
      }
      if (value === 'linear') {
        depth.scale = 'linear';
      } else if (value === 'logarithmic_2') {
        depth.scale = 'logarithmic';
        depth.scaleLogBase = 2;
      } else if (value === 'logarithmic_10') {
        depth.scale = 'logarithmic';
        depth.scaleLogBase = 10;
      }
      return scale;
    }),
  };
};
export const LEGENDPOSITION = () => {
  return {
    type: 'dropdown',
    label: 'Legend Position',
    values: {
      top: 'Top',
      topRight: 'Top right',
      right: 'Right',
      bottomRight: 'Bottom right',
      bottom: 'Bottom',
      bottomLeft: 'Bottom left',
      left: 'Left',
      topLeft: 'Top left',
    },
    default: 'topRight',
    transformFn: (value: any) => ({ legend: { position: value } }),
  };
};
export const BARCOLUMNCHARTMODE = () => {
  return {
    type: 'dropdown',
    label: 'Mode',
    values: {
      grouped: 'Grouped',
      stacked: 'Stacked',
      '100': '100% Stacked',
    },
    default: 'grouped',
    transformFn: (value: any) => ({ mode: value }),
  };
};
export const CHARTS = (): Chart[] => {
  return [
    {
      type: 'column-chart',
      name: 'Column Chart',
      icon: 'bar_chart',
      settings: {
        stacked: BARCOLUMNCHARTMODE(),
        labels: {
          type: 'dropdown',
          label: 'Display values',
          values: {
            none: 'No values',
            absolute: 'Absolute',
            percentage: 'Percentage',
            percentageCategory: 'Percentage of Category',
            percentageLegend: 'Percentage of Legend',
            percentageMax: 'Percentage of Maximum'
          },
          default: 'none',
          transformFn: (value: any) => ({ bars: { label: value } }),
        },
        yAxisScale: AXISSCALE('Measure scale', 'axis.y'),
        yAxisLabel: {
          type: 'input',
        },
        showLegend: CHECKBOX('Show Legend', true, (value: any) => ({ display: { legend: value } })),
        legendPosition: LEGENDPOSITION(),
        variableAxis: MANUALAXISRANGE(),
        colorPalette: COLORPALETTES(),
        colors: [],
      },
      slots: columnChartSlotsConfig
    },
    {
      type: 'bar-chart',
      name: 'Bar Chart',
      icon: 'bar_chart',
      settings: {
        stacked: BARCOLUMNCHARTMODE(),
        labels: {
          type: 'dropdown',
          label: 'Display values',
          values: {
            none: 'No values',
            absolute: 'Absolute',
            percentage: 'Percentage',
            percentageCategory: 'Percentage of Category',
            percentageLegend: 'Percentage of Legend',
            percentageMax: 'Percentage of Maximum'
          },
          default: 'none',
          transformFn: (value: any) => ({ bars: { label: value } }),
        },
        xAxisScale: AXISSCALE('Measure scale', 'axis.x'),
        variableAxis: MANUALAXISRANGE(),
        yAxisLabel: {
          type: 'input',
        },
        showLegend: CHECKBOX('Show Legend', true, (value: any) => ({ display: { legend: value } })),
        legendPosition: LEGENDPOSITION(),
        colorPalette: COLORPALETTES(),
        colors: [],
      },
      slots: barChartSlotsConfig
    },
    {
      type: 'line-chart',
      name: 'Line Chart',
      icon: 'show_chart',
      settings: {
        yAxisScale: AXISSCALE('Measure scale', 'axis.y'),
        yAxisLabel: {
          type: 'input',
        },
        variableAxis: MANUALAXISRANGE(),
        showLegend: CHECKBOX('Show Legend', true, (value: any) => ({ display: { legend: value } })),
        legendPosition: LEGENDPOSITION(),
        colorPalette: COLORPALETTES()
      },
      slots: lineChartSlotsConfig
    },
    // {
    //   type: 'scatter-plot',
    //   name: 'Scatter Plot',
    //   icon: 'scatter_plot',
    //   settings: {},
    // },
    {
      type: 'area-chart',
      name: 'Area Chart',
      icon: 'area_chart',
      settings: {
        yAxisScale: AXISSCALE('Measure scale', 'axis.y'),
        yAxisLabel: {
          type: 'input',
        },
        variableAxis: MANUALAXISRANGE(),
        showLegend: CHECKBOX('Show Legend', true, (value: any) => ({ display: { legend: value } })),
        legendPosition: LEGENDPOSITION(),
        colorPalette: COLORPALETTES()
      },
      slots: areaChartSlotsConfig
    },
    {
      type: 'donut-chart',
      name: 'Donut Chart',
      icon: 'donut_small',
      fixedOptions: {
        mode: 'donut'
      },
      settings: {
        showLegend: CHECKBOX('Show Legend', true, (value: any) => ({ display: { legend: value } })),
        legendPosition: LEGENDPOSITION(),
        colorPalette: COLORPALETTES()
      },
      slots: donutChartSlotsConfig
    },
    {
      type: 'donut-chart',
      name: 'Pie Chart',
      icon: 'pie_chart',
      fixedOptions: {
        mode: 'pie'
      },
      settings: {
        yAxisScale: AXISSCALE('Measure scale', 'axis.y'),
        yAxisLabel: {
          type: 'input',
        },
        showLegend: CHECKBOX('Show Legend', true, (value: any) => ({ display: { legend: value } })),
        legendPosition: LEGENDPOSITION(),
        variableAxis: MANUALAXISRANGE(),
        colorPalette: COLORPALETTES()
      },
      slots: donutChartSlotsConfig
    },
    {
      type: 'bubble-chart',
      name: 'Bubble Chart',
      icon: 'bubble_chart',
      settings: {
        labels: {
          type: 'dropdown',
          label: 'Display values',
          values: {
            none: 'No values',
            absolute: 'Absolute',
            percentage: 'Percentage',
            percentageCategory: 'Percentage of Category',
            percentageLegend: 'Percentage of Legend',
            percentageMax: 'Percentage of Maximum',
          },
          default: 'none',
          transformFn: (value: any) => ({ bars: { label: value } }),
        },
        showLegend: CHECKBOX('Show Legend', true, (value: any) => ({ display: { legend: value } })),
        legendPosition: LEGENDPOSITION(),
        colorPalette: COLORPALETTES(),
        colors: [],
      },
      slots: bubbleChartSlotsConfig
    },
    {
      type: 'treemap-chart',
      name: 'Tree Map',
      icon: 'auto_awesome_mosaic',
      settings: {
        labels: {
          type: 'dropdown',
          label: 'Display values',
          values: {
            none: 'No values',
            absolute: 'Absolute',
            percentage: 'Percentage',
            percentageCategory: 'Percentage of Category',
            percentageLegend: 'Percentage of Legend',
            percentageMax: 'Percentage of Maximum',
          },
          default: 'none',
          transformFn: (value: any) => ({ bars: { label: value } }),
        },
        showLegend: CHECKBOX('Show Legend', true, (value: any) => ({ display: { legend: value } })),
        legendPosition: LEGENDPOSITION(),
        colorPalette: COLORPALETTES(),
        colors: [],
      },
      slots: treemapChartSlotsConfig
    },
    // {
    //   type: 'evolution-number',
    //   name: 'Number Chart',
    //   icon: 'looks_one',
    //   settings: {},
    // },
    // {
    //   type: 'regular-table',
    //   name: 'Regular Table',
    //   icon: 'table',
    //   settings: {},
    // },
    // {
    //   type: 'combination-chart',
    //   name: 'Combination Chart',
    //   icon: 'monitoring',
    //   settings: {},
    // },
    // {
    //   type: 'pivot-table',
    //   name: 'Pivot Table',
    //   icon: 'pivot_table_chart',
    //   settings: {},
    // },
    // {
    //   type: 'speedometer-chart',
    //   name: 'Speedometer',
    //   icon: 'speed',
    //   settings: {},
    // },
  ].map(chart => ({
    ...chart,
    slots: chart.slots.map(slot => ({ ...slot, content: [] }))
  } as Chart));
}
