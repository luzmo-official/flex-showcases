/**
 * Shared Luzmo Flex chart theme for the World Cup app.
 * Custom dark theme with a color palette matching the app's
 * navy / gold / pitch-green aesthetic.
 *
 * See: https://developer.luzmo.com/guide/guides--creating-a-column-flex-chart#configuring-the-theme
 */

/** Default single-series color (bars, columns, line, scatter) — theme gold to match the app. */
const THEME_MAIN_COLOR = '#D4AF37'

export const LUZMO_THEME_OPTIONS: Record<string, unknown> = {
  theme: {
    itemsBackground: '#0a192f',
    /** Theme main color: used as the default "color" for single-series charts (bar, column, line, scatter). */
    mainColor: THEME_MAIN_COLOR,
    color: THEME_MAIN_COLOR,
    colors: [
      '#D4AF37', // gold  (--gold)
      '#64B5F6', // sky blue
      '#34A058', // pitch green (--pitch-light)
      '#E8C84A', // gold light (--gold-light)
      '#26C6DA', // teal
      '#2D8A4E', // pitch mid (--pitch-green)
      '#AB47BC', // violet
      '#FF7043', // coral
      '#42A5F5', // blue
      '#66BB6A', // lime
      '#EC407A', // pink
      '#FFB74D', // amber
    ],
    font: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 13,
    },
  },
  display: {
    title: false,
  },
}

/**
 * Merge the shared theme into a chart's options, preserving chart-specific overrides.
 * Title display is handled separately (enabled when a title string is set).
 */
export function mergeThemeOptions(
  chartOptions: Record<string, unknown>,
  chartTitle?: string,
): Record<string, unknown> {
  const opts = JSON.parse(JSON.stringify(chartOptions || {}))

  const themeBase = JSON.parse(JSON.stringify(LUZMO_THEME_OPTIONS))

  // Deep merge theme into chart options (chart-specific wins)
  const merged: Record<string, unknown> = { ...themeBase, ...opts }

  // Ensure theme colors are present even if chart has other theme overrides
  if (!opts.theme) {
    merged.theme = themeBase.theme
  } else {
    merged.theme = { ...(themeBase.theme as Record<string, unknown>), ...(opts.theme as Record<string, unknown>) }
  }

  // Handle title
  if (chartTitle?.trim()) {
    merged.display = { ...(merged.display as Record<string, unknown> || {}), title: true }
    merged.title = { ...(merged.title as Record<string, unknown> || {}), en: chartTitle }
  }

  return merged
}
