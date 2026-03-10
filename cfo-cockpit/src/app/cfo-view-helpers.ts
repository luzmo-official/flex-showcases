import {
  CFO_COLUMNS,
  CURRENCY_OPTIONS,
  DATASET_ID,
  DEFAULT_FILTER_STATE,
  LEGAL_ENTITY_OPTIONS,
  PERIOD_OPTIONS,
  REGION_OPTIONS,
  BUSINESS_UNIT_OPTIONS,
  SCENARIO_KPI,
  type GlobalFilterState,
  type ScenarioId,
  type SelectOption
} from './cfo-config';
import type {
  FilterCondition,
  NarrativeState,
  VizItemFilterGroup
} from './cfo-types';

// Pure view/state helpers used by the component.
// No DOM access here: easier to reason about and test in isolation.
export function normalizeOptionValue<T extends string>(
  options: ReadonlyArray<SelectOption<T>>,
  value: unknown,
  fallback: T
): T {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim();
  if (!normalized) {
    return fallback;
  }

  const exactMatch = options.find((option) => option.value === normalized || option.label === normalized);
  if (exactMatch) {
    return exactMatch.value;
  }

  const lowercase = normalized.toLowerCase();
  const caseInsensitive = options.find(
    (option) => option.value.toLowerCase() === lowercase || option.label.toLowerCase() === lowercase
  );

  return caseInsensitive?.value ?? fallback;
}

export function normalizeScenarioValue(value: unknown, scenarioOptions: ReadonlyArray<ScenarioId>): ScenarioId {
  if (typeof value !== 'string') {
    return DEFAULT_FILTER_STATE.scenario;
  }

  const normalized = value.trim();
  if (!normalized) {
    return DEFAULT_FILTER_STATE.scenario;
  }

  const exactMatch = scenarioOptions.find((scenario) => scenario === normalized);
  if (exactMatch) {
    return exactMatch;
  }

  const lowercase = normalized.toLowerCase();
  const caseInsensitive = scenarioOptions.find((scenario) => scenario.toLowerCase() === lowercase);

  return caseInsensitive ?? DEFAULT_FILTER_STATE.scenario;
}

export function normalizeGlobalFilters(
  value: unknown,
  scenarioOptions: ReadonlyArray<ScenarioId>
): GlobalFilterState {
  const candidate =
    value && typeof value === 'object' ? (value as Partial<Record<keyof GlobalFilterState, unknown>>) : {};

  return {
    period: normalizeOptionValue(PERIOD_OPTIONS, candidate.period, DEFAULT_FILTER_STATE.period),
    region: normalizeOptionValue(REGION_OPTIONS, candidate.region, DEFAULT_FILTER_STATE.region),
    businessUnit: normalizeOptionValue(BUSINESS_UNIT_OPTIONS, candidate.businessUnit, DEFAULT_FILTER_STATE.businessUnit),
    legalEntity: normalizeOptionValue(LEGAL_ENTITY_OPTIONS, candidate.legalEntity, DEFAULT_FILTER_STATE.legalEntity),
    currency: normalizeOptionValue(CURRENCY_OPTIONS, candidate.currency, DEFAULT_FILTER_STATE.currency),
    scenario: normalizeScenarioValue(candidate.scenario, scenarioOptions)
  };
}

export function buildGlobalVizFilters(globalFilters: GlobalFilterState): VizItemFilterGroup[] {
  const filters: FilterCondition[] = [];

  const addEquality = (columnId: string, value: string): void => {
    filters.push({
      expression: '? = ?',
      parameters: [{ datasetId: DATASET_ID, columnId }, value]
    });
  };

  addEquality(CFO_COLUMNS.scenario, globalFilters.scenario);

  if (globalFilters.period !== 'all') {
    const year = globalFilters.period.replace('fy', '');
    // fiscal_year is stored as a UTC datetime in the dataset
    addEquality(CFO_COLUMNS.fiscalYear, `${year}-01-01T00:00:00.000Z`);
  }

  if (globalFilters.region !== 'all') {
    addEquality(CFO_COLUMNS.region, globalFilters.region);
  }

  if (globalFilters.businessUnit !== 'all') {
    addEquality(CFO_COLUMNS.businessUnit, globalFilters.businessUnit);
  }

  if (globalFilters.legalEntity !== 'all') {
    addEquality(CFO_COLUMNS.legalEntity, globalFilters.legalEntity);
  }

  if (globalFilters.currency !== 'all') {
    addEquality(CFO_COLUMNS.reportingCurrency, globalFilters.currency);
  }

  if (filters.length === 0) {
    return [];
  }

  return [
    {
      condition: 'and',
      filters,
      subGroups: []
    }
  ];
}

export function buildNarrative(globalFilters: GlobalFilterState): NarrativeState {
  const scenario = globalFilters.scenario;
  const kpi = SCENARIO_KPI[scenario];

  const activeScopes = [
    globalFilters.period === 'all' ? null : globalFilters.period.toUpperCase(),
    globalFilters.region === 'all' ? null : globalFilters.region,
    globalFilters.businessUnit === 'all' ? null : globalFilters.businessUnit,
    globalFilters.legalEntity === 'all' ? null : globalFilters.legalEntity,
    globalFilters.currency === 'all' ? 'All currencies' : globalFilters.currency
  ].filter((scope): scope is string => Boolean(scope));

  const scopeText = activeScopes.length > 0 ? activeScopes.join(' | ') : 'Global scope';

  const tone =
    scenario === 'Stretch'
      ? 'upside trajectory is visible on revenue and cash conversion.'
      : scenario === 'Stress'
        ? 'risk concentration is visible on leverage and margin compression.'
        : 'baseline performance remains stable with controlled leverage.';

  const action =
    scenario === 'Stretch'
      ? 'Board ask: rebalance growth investment toward high-margin product families while preserving conversion.'
      : scenario === 'Stress'
        ? 'Board ask: launch a 90-day working-capital release plan and cap discretionary spend.'
        : 'Board ask: protect EBITDA discipline and keep capex intensity within target corridor.';

  return {
    headline: `${scenario} scenario cockpit`,
    summary: `${scopeText}. Revenue run-rate ${kpi.revenueBn.toFixed(1)}B, EBITDA margin ${kpi.ebitdaMarginPct.toFixed(2)}%, FCF margin ${kpi.fcfMarginPct.toFixed(2)}%; ${tone}`,
    action
  };
}

export function buildVersionLabel(savedAt: string, scenario: ScenarioId): string {
  const date = new Date(savedAt);
  const datePart = date.toLocaleDateString('en-CA');
  const timePart = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return `${scenario} · ${datePart} ${timePart}`;
}
