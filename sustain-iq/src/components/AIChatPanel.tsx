import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { LuzmoVizItemComponent } from '@luzmo/react-embed';
import { LuzmoPromptBox, type LuzmoPromptBoxElement } from '@luzmo/lucero/react';

import { ChartEditor } from './ChartEditor';
import { ChartIcon, CHART_TYPE_LABELS } from './icons';
import { DATASET_ID } from '../dataset';

import type { AggregationFunc, Slot, WidgetConfig } from '../types';

interface GeneratedChart {
  id: string;
  question: string;
  type: string;
  slots: Slot[];
  title: string;
  slotSummary: string;
  options: Record<string, unknown>;
  loading: boolean;
  error?: string;
  errorType?: 'no_data' | 'generic';
  isSuggestion?: boolean;
  added?: boolean;
}

interface Props {
  authKey: string;
  authToken: string;
  onAddToDashboard: (widget: Omit<WidgetConfig, 'id'>) => void;
  onClose: () => void;
}

const SWITCHABLE_TYPES = [
  'bar-chart', 'column-chart', 'line-chart', 'area-chart', 'donut-chart',
];

const SUGGESTIONS = [
  'Show total CO2 emissions by city',
  'Revenue breakdown by industry',
  'Emissions trend over time',
  'Which city pollutes the most?',
  'CO2 by energy source',
  'Compare emissions across countries',
];

const AVAILABLE_DATA_DESC = 'This dataset contains: CO2 Emissions, Revenue, Sustainability Rating, Reduction Efforts, and Adjusted CO2 — broken down by City, Country, Industry, Company, Department, Energy Source, Emission Source, Scope of Emissions, and Year.';

function isDirectMatch(question: string, aiTitle: string): boolean {
  const q = question.toLowerCase();
  const t = aiTitle.toLowerCase();
  const METRIC_TERMS = ['co2', 'carbon', 'emission', 'emissions', 'revenue', 'sustainability',
    'rating', 'reduction', 'adjusted', 'pollution', 'pollut', 'energy', 'scope'];
  const questionMetrics = METRIC_TERMS.filter(term => q.includes(term));
  const titleMetrics = METRIC_TERMS.filter(term => t.includes(term));
  const sharedMetrics = questionMetrics.filter(m => titleMetrics.includes(m));
  if (sharedMetrics.length > 0) return true;
  if (questionMetrics.length >= 2) return true;
  if (questionMetrics.length === 0) return false;
  const DIMENSION_ONLY = ['city', 'cities', 'region', 'regions', 'company', 'companies',
    'industry', 'industries', 'sector', 'sectors', 'department', 'year', 'time', 'country', 'countries'];
  const skipWords = new Set([...DIMENSION_ONLY, 'the', 'and', 'for', 'per', 'with', 'from', 'that', 'this', 'what', 'which', 'show', 'total', 'most', 'least', 'best', 'worst']);
  const qWords = q.split(/\s+/).filter(w => w.length > 3 && !skipWords.has(w));
  const tWords = t.split(/\s+/).filter(w => w.length > 3 && !skipWords.has(w));
  const overlap = qWords.filter(w => tWords.some(tw => tw.includes(w) || w.includes(tw)));
  return overlap.length >= 2;
}

/** Normalize a label value to a locale object ({ en: "..." }). */
function normalizeLabel(label: unknown): Record<string, string> | undefined {
  if (!label) return undefined;
  if (typeof label === 'string') return { en: label };
  if (typeof label === 'object') return label as Record<string, string>;
  return undefined;
}

/** Normalize AI-generated slot structure to our standard Slot[] format. */
function normalizeSlots(slots: Record<string, unknown>[]): Slot[] {
  return slots.map((slot) => {
    const s = slot as { name: string; content?: Record<string, unknown>[] };
    return {
      name: s.name,
      content: (s.content || []).map((c) => {
        const label = normalizeLabel(c.label);
        return {
          columnId: (c.column ?? c.columnId ?? '') as string,
          datasetId: (c.set ?? c.datasetId ?? '') as string,
          type: c.type as 'numeric' | 'hierarchy' | 'datetime',
          ...(c.aggregationFunc ? { aggregationFunc: c.aggregationFunc as AggregationFunc } : {}),
          ...(c.format ? { format: c.format as string } : {}),
          ...(c.level != null ? { level: c.level as number } : {}),
          ...(label ? { label } : {}),
        };
      }),
    };
  });
}

const REQUIRED_SLOTS: Record<string, string[]> = {
  'bar-chart':        ['measure', 'y-axis'],
  'column-chart':     ['measure', 'x-axis'],
  'line-chart':       ['measure', 'x-axis'],
  'area-chart':       ['measure', 'x-axis'],
  'donut-chart':      ['measure', 'category'],
  'evolution-number': ['measure'],
  'regular-table':    ['columns'],
  'pivot-table':      ['row'],
};

const AXIS_SLOTS = ['x-axis', 'y-axis', 'category', 'row', 'rows', 'columns'];

/** Remap slots when switching chart type so required slots are populated. */
function remapSlotsForType(slots: Slot[], _fromType: string, toType: string): Slot[] {
  const required = REQUIRED_SLOTS[toType] ?? [];
  let result = [...slots];
  for (const needed of required) {
    const hasIt = result.some(s => s.name === needed && s.content?.length > 0);
    if (hasIt) continue;
    if (needed === 'measure') {
      const colSlot = result.find(s =>
        s.name === 'columns' && s.content?.some(c => c.type === 'numeric')
      );
      if (colSlot) {
        const numericContent = colSlot.content.filter(c => c.type === 'numeric');
        result = [...result.filter(s => s.name !== 'columns'), { name: 'measure', content: numericContent }];
        continue;
      }
    }
    if (AXIS_SLOTS.includes(needed)) {
      const source = result.find(s =>
        AXIS_SLOTS.includes(s.name) && s.name !== needed && s.content?.length > 0
      );
      if (source) {
        result = result.map(s => s === source ? { ...s, name: needed } : s);
      }
    }
  }
  return result;
}

function hasRequiredSlots(type: string, slots: Slot[]): boolean {
  const required = REQUIRED_SLOTS[type];
  if (!required) return true;
  if (!slots || slots.length === 0) return false;
  return required.every(req =>
    slots.some(s => s.name === req && s.content && s.content.length > 0)
  );
}

function buildMatchReason(_question: string, title: string): string {
  const t = title.toLowerCase();
  const metricPatterns: [RegExp, string][] = [
    [/co2|carbon|emission/i, 'CO2 emissions'],
    [/revenue/i, 'revenue'],
    [/sustainab/i, 'sustainability rating'],
    [/reduction/i, 'reduction efforts'],
    [/adjusted/i, 'adjusted CO2'],
  ];
  const usedMetric = metricPatterns.find(([re]) => re.test(t))?.[1] || 'the closest available metric';
  const dimPatterns: [RegExp, string][] = [
    [/city|cities/i, 'city'],
    [/region|country/i, 'region'],
    [/industry|sector/i, 'industry'],
    [/company/i, 'company'],
    [/year|time/i, 'year'],
  ];
  const usedDim = dimPatterns.find(([re]) => re.test(t))?.[1];
  const dimPart = usedDim ? ` by ${usedDim}` : '';
  return `Your question was interpreted using ${usedMetric}${dimPart} data — the closest match available.`;
}

function buildSlotSummary(slots: Slot[]): string {
  const parts: string[] = [];
  for (const slot of slots) {
    for (const c of slot.content || []) {
      const label = (c.label?.en ?? c.columnId) || '?';
      const agg = c.aggregationFunc ? ` (${c.aggregationFunc})` : '';
      parts.push(`${label}${agg}`);
    }
  }
  return parts.join(' × ');
}

/** Build a one-line summary of the last successful chart for follow-up context */
function buildConversationContext(charts: GeneratedChart[]): string {
  const successful = charts.filter(c => !c.loading && !c.error && c.type);
  if (successful.length === 0) return '';
  const last = successful[successful.length - 1];
  const typeName = CHART_TYPE_LABELS[last.type] || last.type;
  const parts = [
    `Previously: a ${typeName}`,
    last.title ? `titled "${last.title}"` : '',
    last.slotSummary ? `showing ${last.slotSummary}` : '',
  ].filter(Boolean);
  return parts.join(' ') + '.';
}

/** Known metric groups in the dataset — each array element is one "topic" */
const METRIC_GROUPS: RegExp[][] = [
  [/co2/i, /carbon/i, /emission/i, /emissions/i, /pollut/i],
  [/revenue/i],
  [/sustainab/i, /rating/i],
  [/reduction/i, /effort/i],
  [/adjusted/i],
  [/energy/i],
  [/scope/i],
];

/** Return indices of metric groups mentioned in text */
function detectMetrics(text: string): Set<number> {
  const hits = new Set<number>();
  for (let i = 0; i < METRIC_GROUPS.length; i++) {
    if (METRIC_GROUPS[i].some(re => re.test(text))) hits.add(i);
  }
  return hits;
}

/** Heuristic: is this question a follow-up to the previous chart? */
function isFollowUp(question: string, hasHistory: boolean, prevContext: string): boolean {
  if (!hasHistory) return false;
  const q = question.toLowerCase().trim();
  const words = q.split(/\s+/);

  // If the question introduces a NEW metric not in the previous chart, treat as standalone
  const qMetrics = detectMetrics(q);
  const prevMetrics = detectMetrics(prevContext);
  if (qMetrics.size > 0 && prevMetrics.size > 0) {
    const overlap = [...qMetrics].filter(m => prevMetrics.has(m));
    if (overlap.length === 0) return false; // different topic entirely
  }

  // Short questions are follow-ups only if they contain chart-relevant terms
  const CHART_TERMS = /\b(city|cities|region|regions|company|companies|industry|industries|department|year|time|country|countries|bar|column|line|area|donut|pie|table|chart|by|per|divide|split|group|break|filter|sort|change|switch|show|hide|add|remove|as|trend|compare|top|bottom|highest|lowest)\b/i;
  if (words.length <= 4 && CHART_TERMS.test(q)) return true;
  // Starts with modification language
  if (/^(now|also|but|and|instead|divide|split|group|break|filter|sort|change|switch|make|add|remove|show|hide|try|use)/i.test(q)) return true;
  // Contains relative references
  if (/\b(same|previous|that one|the same|it as|this as)\b/i.test(q)) return true;
  return false;
}

export function AIChatPanel({ authKey, authToken, onAddToDashboard, onClose }: Props) {
  const [, setQuestion] = useState('');
  const [charts, setCharts] = useState<GeneratedChart[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingChart, setEditingChart] = useState<GeneratedChart | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<LuzmoPromptBoxElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 120);
  };

  const generateChart = useCallback(async (q: string) => {
    if (!q.trim() || isGenerating) return;

    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 9);

    // Build enriched question for follow-ups
    const context = buildConversationContext(charts);
    const followUp = isFollowUp(q.trim(), context.length > 0, context);
    const enrichedQuestion = followUp ? `${context} Now: ${q.trim()}` : q.trim();

    const newChart: GeneratedChart = {
      id, question: q.trim(), type: '', slots: [], title: '', slotSummary: '',
      options: {}, loading: true,
    };

    setCharts(prev => [...prev, newChart]);
    setQuestion('');
    setIsGenerating(true);
    setShowSuggestions(false);
    scrollToBottom();

    try {
      const apiHost = import.meta.env.VITE_LUZMO_API_HOST || 'https://api.luzmo.com';
      const datasetId = (import.meta.env.VITE_LUZMO_DATASET_ID || DATASET_ID);
      const fetchChart = async () => {
        const res = await fetch(`${apiHost}/0.1.0/aichart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            key: authKey,
            token: authToken,
            version: '0.1.0',
            properties: {
              type: 'generate-chart',
              dataset_id: datasetId,
              question: enrichedQuestion,
              model_preference: 'performance',
            },
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const msg = body.error || body.message || `HTTP ${res.status}`;
          if (res.status === 429) throw Object.assign(new Error('Rate limit reached — please wait a moment and try again.'), { errorType: 'generic' as const });
          if (res.status === 422 || msg.includes('could not find') || msg.includes('rephrase')) {
            throw Object.assign(
              new Error(`Your question doesn't match the available data.\n\n${AVAILABLE_DATA_DESC}`),
              { errorType: 'no_data' as const }
            );
          }
          throw Object.assign(new Error(msg), { errorType: 'generic' as const });
        }

        return res.json();
      };

      let data: Record<string, unknown>;
      try {
        data = await fetchChart();
      } catch (firstErr: unknown) {
        if ((firstErr as { errorType?: string }).errorType === 'no_data') throw firstErr;
        data = await fetchChart();
      }

      const generated = (data.generatedChart ?? data) as Record<string, unknown>;

      if (!generated.type || !generated.slots) {
        throw Object.assign(
          new Error(`The AI couldn't generate a chart for that question.\n\n${AVAILABLE_DATA_DESC}`),
          { errorType: 'no_data' as const }
        );
      }

      let normalizedSlots = normalizeSlots(generated.slots as Record<string, unknown>[]);
      const chartType = generated.type as string;
      const genOptions = (generated.options ?? {}) as Record<string, unknown>;
      const genTitle = (genOptions.title as Record<string, string> | undefined)?.en;
      const funcResp = (data.functionResponse as Record<string, string> | undefined);
      const title = genTitle || funcResp?.title || '';
      const slotSummary = buildSlotSummary(normalizedSlots);
      const isSuggestion = !isDirectMatch(q.trim(), title);

      if (!hasRequiredSlots(chartType, normalizedSlots)) {
        normalizedSlots = remapSlotsForType(normalizedSlots, chartType, chartType);
      }

      setCharts(prev => prev.map(c =>
        c.id === id ? {
          ...c, type: chartType, slots: normalizedSlots,
          title, slotSummary, options: genOptions,
          loading: false, isSuggestion,
        } : c
      ));
    } catch (err: unknown) {
      const rawType = (err as { errorType?: string }).errorType;
      const errorType: GeneratedChart['errorType'] = rawType === 'no_data' ? 'no_data' : 'generic';
      setCharts(prev => prev.map(c =>
        c.id === id ? {
          ...c, loading: false,
          error: err instanceof Error ? err.message : 'Failed to generate',
          errorType,
        } : c
      ));
    } finally {
      setIsGenerating(false);
      scrollToBottom();
    }
  }, [isGenerating]);

  const handleRetry = (chart: GeneratedChart) => {
    setCharts(prev => prev.filter(c => c.id !== chart.id));
    generateChart(chart.question);
  };

  const handleSwitchType = (chartId: string, newType: string) => {
    setCharts(prev => prev.map(c => {
      if (c.id !== chartId) return c;
      const remappedSlots = remapSlotsForType(c.slots, c.type, newType);
      return { ...c, type: newType, slots: remappedSlots, added: false };
    }));
  };

  const handlePromptSubmit = (e: CustomEvent) => {
    const value = e.detail?.value?.trim();
    if (value) {
      generateChart(value);
      // Clear the prompt box input
      if (promptRef.current?.clear) {
        promptRef.current.clear();
      } else if (promptRef.current) {
        promptRef.current.value = '';
      }
    }
  };

  const handleEditChart = (chart: GeneratedChart) => {
    setEditingChart(chart);
  };

  const handleEditSave = (updated: WidgetConfig) => {
    if (!editingChart) return;
    // Update the chart in the list with edited values
    setCharts(prev => prev.map(c =>
      c.id === editingChart.id ? {
        ...c,
        type: updated.type,
        title: updated.title,
        slots: (updated.slots ?? []) as Slot[],
        options: updated.options ?? {},
        added: false,
      } : c
    ));
    setEditingChart(null);
  };

  const handleAddToDashboard = (chart: GeneratedChart) => {
    onAddToDashboard({
      title: chart.title || chart.question,
      type: chart.type,
      slots: chart.slots,
      options: { display: { title: false } },
    });
    setCharts(prev => prev.map(c =>
      c.id === chart.id ? { ...c, added: true } : c
    ));
    setShowSuggestions(true);
  };

  const handleRemoveChart = (id: string) => {
    setCharts(prev => {
      const next = prev.filter(c => c.id !== id);
      if (next.length === 0) setShowSuggestions(false);
      return next;
    });
  };

  const handleClearAll = () => {
    setCharts([]);
    setShowSuggestions(false);
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
            <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z" />
          </svg>
          <span>AI Chart Builder</span>
        </div>
        <div className="ai-panel-header-actions">
          {charts.length > 0 && (
            <button className="ai-clear-btn" onClick={handleClearAll} title="Clear all">
              Clear
            </button>
          )}
          <button className="ai-panel-close" onClick={onClose} title="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="ai-panel-body" ref={scrollRef}>
        {charts.length === 0 && (
          <div className="ai-welcome">
            <svg className="ai-welcome-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
            <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z" />
            </svg>
            <h3>Ask me anything about your data</h3>
            <p>Type a question in plain language and I'll create a chart for you.</p>
            <div className="ai-suggestions">
              {SUGGESTIONS.map(text => (
                <button
                  key={text}
                  className="ai-suggestion"
                  onClick={() => generateChart(text)}
                  disabled={isGenerating}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <span>{text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {charts.map(chart => (
          <div key={chart.id} className="ai-chart-message">
            <div className="ai-question">
              <span>{chart.question}</span>
            </div>

            {!chart.loading && !chart.error && chart.isSuggestion && chart.title && (
              <div className="ai-interpretation">
                <span className="ai-interpretation-badge">Best match</span>
                {buildMatchReason(chart.question, chart.title)}
              </div>
            )}

            {chart.loading && (
              <div className="ai-loading">
                <div className="ai-loading-bar" />
                <div className="ai-loading-text">
                  <svg className="ai-loading-sparkle" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
                  </svg>
                  Analyzing your data...
                </div>
              </div>
            )}

            {chart.error && (
              <div className={`ai-error ${chart.errorType === 'no_data' ? 'ai-error-nodata' : ''}`}>
                <div className="ai-error-content">
                  <svg className="ai-error-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {chart.errorType === 'no_data' ? (
                      <><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></>
                    ) : (
                      <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" /></>
                    )}
                  </svg>
                  <div>
                    <strong>{chart.errorType === 'no_data' ? 'Data not available' : 'Could not generate chart'}</strong>
                    {chart.error.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>
                <div className="ai-error-actions">
                  <button className="ai-retry-btn" onClick={() => handleRetry(chart)}>
                    Retry
                  </button>
                  <button className="ai-btn-dismiss" onClick={() => handleRemoveChart(chart.id)}>
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {!chart.loading && !chart.error && chart.type && (
              <div className={`ai-chart-result ${chart.added ? 'ai-chart-added' : ''} ${chart.isSuggestion ? 'ai-chart-suggestion' : ''}`}>

                <div className="ai-chart-meta">
                  <span className="ai-chart-type-badge">
                    <ChartIcon type={chart.type} size={13} /> {CHART_TYPE_LABELS[chart.type] ?? chart.type}
                  </span>
                  {chart.title && <span className="ai-chart-title">{chart.title}</span>}
                </div>

                <div className="ai-chart-preview">
                  {hasRequiredSlots(chart.type, chart.slots) ? (
                    <LuzmoVizItemComponent
                      appServer="https://app.luzmo.com"
                      apiHost="https://api.luzmo.com"
                      authKey={authKey}
                      authToken={authToken}
                      type={chart.type}
                      slots={chart.slots}
                      options={{ display: { title: false }, theme: { colors: ['#14b8a6', '#10b981', '#0891b2', '#2563eb', '#6366f1', '#059669', '#0e7490', '#1d4ed8', '#4f46e5', '#0d9488'], mainColor: '#14b8a6' } }}
                    />
                  ) : (
                    <div className="ai-chart-preview-missing">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        <path d="M12 9v4M12 17h.01" />
                      </svg>
                      <span>This chart type requires different data slots. Try another view.</span>
                    </div>
                  )}
                </div>

                <div className="ai-chart-type-switch">
                  <span className="ai-switch-label">View as:</span>
                  <div className="ai-switch-options">
                    {SWITCHABLE_TYPES.map(t => (
                      <button
                        key={t}
                        className={`ai-switch-btn ${chart.type === t ? 'ai-switch-active' : ''}`}
                        onClick={() => handleSwitchType(chart.id, t)}
                        title={CHART_TYPE_LABELS[t]}
                      >
                        <ChartIcon type={t} size={14} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ai-chart-actions">
                  {chart.added ? (
                    <div className="ai-added-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Added to dashboard
                    </div>
                  ) : (
                    <>
                      <button className="ai-btn-add" onClick={() => handleAddToDashboard(chart)}>
                        Add to Dashboard
                      </button>
                      <button className="ai-btn-edit" onClick={() => handleEditChart(chart)} title="Edit chart before adding">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                    </>
                  )}
                  <button className="ai-btn-dismiss" onClick={() => handleRemoveChart(chart.id)}>
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {showSuggestions && !isGenerating && (() => {
          const remaining = SUGGESTIONS.filter(s => !charts.some(c => c.question === s)).slice(0, 3);
          return remaining.length > 0 ? (
            <div className="ai-suggestions-compact">
              <span className="ai-suggestions-compact-label">Try another, or type your own below</span>
              <div className="ai-suggestions-compact-list">
                {remaining.map(text => (
                  <button
                    key={text}
                    className="ai-suggestion-chip"
                    onClick={() => generateChart(text)}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          ) : null;
        })()}
      </div>

      <div className="ai-panel-input">
        <LuzmoPromptBox
          ref={promptRef}
          placeholder={charts.length === 0 ? 'Ask a question about your data...' : 'Ask another question...'}
          rows={1}
          grows={true}
          maxRows={4}
          pending={isGenerating}
          onLuzmoSubmit={handlePromptSubmit}
        />
      </div>

      {/* Chart Editor modal for editing AI-generated charts */}
      {editingChart && createPortal(
        <div className="chart-editor-overlay" onClick={() => setEditingChart(null)}>
          <div className="chart-editor-modal" onClick={e => e.stopPropagation()}>
            <ChartEditor
              widget={{
                id: editingChart.id,
                title: editingChart.title || editingChart.question,
                type: editingChart.type,
                slots: editingChart.slots,
                options: editingChart.options,
              }}
              authKey={authKey}
              authToken={authToken}
              onSave={handleEditSave}
              onCancel={() => setEditingChart(null)}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
