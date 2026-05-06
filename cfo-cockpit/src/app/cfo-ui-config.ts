import type { ScenarioId } from './cfo-config';
import type { ReportLibraryModule } from './cfo-types';

// Static UI/domain content for the cockpit shell.
// Keeping these definitions out of the component makes orchestration code easier to scan.
export const SCENARIO_OPTIONS: ScenarioId[] = ['Base', 'Stretch', 'Stress'];

export const SCENARIO_DESCRIPTIONS: Record<ScenarioId, string> = {
  Base: 'Current operating plan and target budget.',
  Stretch: 'Growth-focused case with stronger commercial execution.',
  Stress: 'Downside resilience case with tighter cash controls.'
};

export const STARTER_REPORT_MODULE_IDS = new Set([
  'kpi-revenue',
  'kpi-ebitda-margin',
  'kpi-fcf-margin',
  'kpi-leverage',
  'revenue-trend',
  'profitability-by-bu',
  'working-capital-by-region',
  'capital-structure'
]);

export const REPORT_LIBRARY: ReportLibraryModule[] = [
  {
    id: 'kpi-revenue',
    title: 'Revenue KPI',
    description: 'Headline revenue level used in board summaries.',
    type: 'conditional-number'
  },
  {
    id: 'kpi-ebitda-margin',
    title: 'EBITDA Margin KPI',
    description: 'Profitability checkpoint for operating discipline.',
    type: 'conditional-number'
  },
  {
    id: 'kpi-fcf-margin',
    title: 'FCF Margin KPI',
    description: 'Cash conversion signal for financing confidence.',
    type: 'conditional-number'
  },
  {
    id: 'kpi-leverage',
    title: 'Leverage KPI',
    description: 'Net debt to EBITDA risk indicator.',
    type: 'conditional-number'
  },
  {
    id: 'revenue-trend',
    title: 'Revenue Trajectory',
    description: 'Trend view by period and scenario.',
    type: 'line-chart'
  },
  {
    id: 'profitability-by-bu',
    title: 'Profitability by BU',
    description: 'Compare EBITDA and FCF by business unit.',
    type: 'bar-chart'
  },
  {
    id: 'working-capital-by-region',
    title: 'Working Capital by Region',
    description: 'Regional working-capital intensity snapshot.',
    type: 'column-chart'
  },
  {
    id: 'capital-structure',
    title: 'Net Debt Structure',
    description: 'Debt mix by legal entity.',
    type: 'donut-chart'
  },
  {
    id: 'kpi-capex-intensity',
    title: 'Capex Intensity KPI',
    description: 'Investment discipline indicator for board discussions.',
    type: 'conditional-number'
  },
  {
    id: 'kpi-working-capital-ratio',
    title: 'Working Capital Ratio KPI',
    description: 'Efficiency of working capital tied to revenue.',
    type: 'conditional-number'
  },
  {
    id: 'ebitda-trend',
    title: 'EBITDA Trajectory',
    description: 'Operating profit trend by period and scenario.',
    type: 'line-chart'
  },
  {
    id: 'revenue-by-product-family',
    title: 'Revenue by Product Family',
    description: 'Revenue concentration by product family.',
    type: 'column-chart'
  },
  {
    id: 'free-cash-flow-by-region',
    title: 'Free Cash Flow by Region',
    description: 'Regional cash generation comparison.',
    type: 'bar-chart'
  },
  {
    id: 'debt-vs-ebitda-by-entity',
    title: 'Net Debt vs EBITDA by Entity',
    description: 'Balance-sheet risk versus profitability by entity.',
    type: 'bar-chart'
  }
];

export const ADVANCED_GRID_ACTIONS_MENU: Array<{ type: 'group'; actions: string[] }> = [
  { type: 'group', actions: ['edit-data', 'item-options'] },
  { type: 'group', actions: ['delete'] }
];

export const GUIDED_GRID_ACTIONS_MENU: Array<{ type: 'group'; actions: string[] }> = [
  { type: 'group', actions: ['delete'] }
];
