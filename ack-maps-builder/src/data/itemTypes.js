export const itemTypeCategories = [
  {
    label: 'Maps',
    types: [
      { type: 'choropleth-map', label: 'Choropleth', icon: '🗺️' },
      { type: 'marker-map', label: 'Marker Map', icon: '📍' },
      { type: 'hexbin-map', label: 'Hexbin Map', icon: '⬡' },
      { type: 'symbol-map', label: 'Symbol Map', icon: '🔵' },
      { type: 'route-map', label: 'Route Map', icon: '🛤️' },
      { type: 'spike-map', label: 'Spike Map', icon: '📊' },
    ],
  },
  {
    label: 'Charts',
    types: [
      { type: 'bar-chart', label: 'Bar Chart', icon: '📊' },
      { type: 'column-chart', label: 'Column Chart', icon: '📶' },
      { type: 'line-chart', label: 'Line Chart', icon: '📈' },
      { type: 'area-chart', label: 'Area Chart', icon: '📉' },
      { type: 'donut-chart', label: 'Donut Chart', icon: '🍩' },
      { type: 'scatter-plot', label: 'Scatter Plot', icon: '⚬' },
      { type: 'bubble-chart', label: 'Bubble Chart', icon: '🫧' },
      { type: 'combination-chart', label: 'Combo Chart', icon: '📊' },
      { type: 'funnel-chart', label: 'Funnel', icon: '🔻' },
      { type: 'radar-chart', label: 'Radar', icon: '🕸️' },
      { type: 'treemap-chart', label: 'Treemap', icon: '🟩' },
      { type: 'sunburst-chart', label: 'Sunburst', icon: '☀️' },
      { type: 'sankey-diagram', label: 'Sankey', icon: '🔀' },
    ],
  },
  {
    label: 'Tables',
    types: [
      { type: 'regular-table', label: 'Table', icon: '📋' },
      { type: 'pivot-table', label: 'Pivot Table', icon: '🔄' },
    ],
  },
  {
    label: 'Numbers',
    types: [
      { type: 'evolution-number', label: 'Evolution Number', icon: '🔢' },
      { type: 'conditional-number', label: 'Conditional Number', icon: '#️⃣' },
    ],
  },
  {
    label: 'Filters',
    types: [
      { type: 'dropdown-filter', label: 'Dropdown Filter', icon: '▼' },
      { type: 'date-filter', label: 'Date Filter', icon: '📅' },
      { type: 'slicer-filter', label: 'Slicer Filter', icon: '🔘' },
      { type: 'slider-filter', label: 'Slider Filter', icon: '⊶' },
      { type: 'search-filter', label: 'Search Filter', icon: '🔍' },
    ],
  },
];
