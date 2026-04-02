import {
  luzmoBarChartSimple,
  luzmoColumnChartSimple,
  luzmoLineChartSimple,
  luzmoAreaChartSimple,
  luzmoDonutChartSimple,
  luzmoRegularTableSimple,
  luzmoScatterPlot,
  luzmoTreemapChartSimple,
  luzmoBubbleChartSimple,
  luzmoFunnelChartSimple,
  luzmoRadarChart,
  luzmoHeatTable,
} from '@luzmo/icons';

/** Luzmo icon tuple: [width, height, pathData, colors?] */
interface LuzmoIconDef { icon: [number, number, string | string[], string[]?] }

// @luzmo/icons exports lack precise TS types — cast to our interface
const ICON_MAP: Record<string, LuzmoIconDef | null> = {
  'bar-chart': luzmoBarChartSimple as unknown as LuzmoIconDef,
  'column-chart': luzmoColumnChartSimple as unknown as LuzmoIconDef,
  'line-chart': luzmoLineChartSimple as unknown as LuzmoIconDef,
  'area-chart': luzmoAreaChartSimple as unknown as LuzmoIconDef,
  'donut-chart': luzmoDonutChartSimple as unknown as LuzmoIconDef,
  'evolution-number': null,
  'regular-table': luzmoRegularTableSimple as unknown as LuzmoIconDef,
  'scatter-plot': luzmoScatterPlot as unknown as LuzmoIconDef,
  'treemap-chart': luzmoTreemapChartSimple as unknown as LuzmoIconDef,
  'bubble-chart': luzmoBubbleChartSimple as unknown as LuzmoIconDef,
  'funnel-chart': luzmoFunnelChartSimple as unknown as LuzmoIconDef,
  'radar-chart': luzmoRadarChart as unknown as LuzmoIconDef,
  'heat-map': luzmoHeatTable as unknown as LuzmoIconDef,
};

interface IconProps {
  type: string;
  size?: number;
  color?: string;
}

export function ChartIcon({ type, size = 16, color }: IconProps) {
  // Custom KPI icon (trend line + arrow)
  if (type === 'evolution-number') {
    const s = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color || 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    return (
      <svg {...s}>
        <path d="M3 17l4-4 4 4 4-8 4 4" />
        <path d="M17 7h4v4" />
      </svg>
    );
  }

  const iconDef = ICON_MAP[type];
  if (!iconDef) {
    // Fallback for unknown chart types
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth={2}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
      </svg>
    );
  }

  const [w, h, rawPaths, rawColors] = iconDef.icon;
  const fillColor = color || 'currentColor';

  // Simple icons: paths is a single string, no colors array
  if (typeof rawPaths === 'string') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${w} ${h}`}>
        <path d={rawPaths} fill={fillColor} />
      </svg>
    );
  }

  // Multi-path icons: paths[] with colors[]
  const paths = rawPaths as string[];
  const colors = (rawColors || []) as string[];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${w} ${h}`}>
      {paths.map((d: string, i: number) => {
        const rawColor = colors[i] || '';
        const opacity = rawColor.includes('line-color') ? 0.4 : 1;
        return (
          <path key={i} d={d} fill={fillColor} opacity={opacity} />
        );
      })}
    </svg>
  );
}

/** Human-readable chart type labels */
export const CHART_TYPE_LABELS: Record<string, string> = {
  'bar-chart': 'Bar',
  'column-chart': 'Column',
  'line-chart': 'Line',
  'area-chart': 'Area',
  'donut-chart': 'Donut',
  'evolution-number': 'KPI',
  'regular-table': 'Table',
  'scatter-plot': 'Scatter',
  'treemap-chart': 'Treemap',
  'bubble-chart': 'Bubble',
  'funnel-chart': 'Funnel',
  'radar-chart': 'Radar',
  'heat-map': 'Heatmap',
};
