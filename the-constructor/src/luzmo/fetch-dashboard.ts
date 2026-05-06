import { luzmoConfig, LUZMO_API_BASE } from './config';
import type {
  AIChartGenerateResponse,
  AIChartSuggestion,
  DashboardApiResponse,
  DashboardRow,
} from './types';

// ---------------------------------------------------------------------------
// Luzmo Dashboard Fetch
// ---------------------------------------------------------------------------

const LUZMO_SECURABLE_URL = `${LUZMO_API_BASE}/securable`;
const LUZMO_THEME_URL = `${LUZMO_API_BASE}/theme`;
const LUZMO_AICHART_URL = `${LUZMO_API_BASE}/aichart`;

export class DashboardFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DashboardFetchError';
  }
}

/**
 * Fetches a dashboard row from the Luzmo API.
 *
 * @param dashboardId - The ID of the Luzmo dashboard to retrieve.
 * @returns The first DashboardRow from the API response.
 */
export async function fetchDashboardRow(
  dashboardId: string,
): Promise<DashboardRow> {
  if (!dashboardId) {
    throw new DashboardFetchError('Dashboard ID is required');
  }

  const payload = {
    action: 'get',
    key: luzmoConfig.embedKey,
    token: luzmoConfig.embedToken,
    version: '0.1.0',
    find: {
      where: {
        id: dashboardId,
      },
    },
  };

  try {
    const response = await fetch(LUZMO_SECURABLE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new DashboardFetchError(`HTTP error! status: ${response.status}`);
    }

    const data: DashboardApiResponse = await response.json();

    if (!data.rows?.[0]) {
      throw new DashboardFetchError(
        'Invalid dashboard data structure: missing rows[0]',
      );
    }

    return data.rows[0];
  } catch (error) {
    if (error instanceof DashboardFetchError) {
      throw error;
    }
    console.error('Error fetching dashboard row:', error);
    throw new DashboardFetchError('Failed to fetch dashboard row');
  }
}

/**
 * Fetches a full theme object from the Luzmo API by its ID.
 * Returns the theme's config (with `type: "custom"`) that can be passed
 * directly to <luzmo-item-grid>'s `theme` property.
 *
 * @param themeId - The UUID of the Luzmo theme.
 * @returns The theme configuration object, or undefined if not found.
 */
export async function fetchTheme(
  themeId: string,
): Promise<Record<string, unknown> | undefined> {
  if (!themeId) return undefined;

  const payload = {
    action: 'get',
    key: luzmoConfig.embedKey,
    token: luzmoConfig.embedToken,
    version: '0.1.0',
    find: {
      where: {
        id: themeId,
      },
    },
  };

  try {
    const response = await fetch(LUZMO_THEME_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(`[fetch-dashboard] Failed to fetch theme ${themeId}: HTTP ${response.status}`);
      return undefined;
    }

    const data = await response.json();
    const row = data.rows?.[0];
    if (!row?.theme) {
      console.warn(`[fetch-dashboard] Theme ${themeId} not found or has no theme config`);
      return undefined;
    }

    return row.theme as Record<string, unknown>;
  } catch (error) {
    console.warn('[fetch-dashboard] Error fetching theme:', error);
    return undefined;
  }
}

/**
 * Fetches all dashboards accessible to the current embed key/token pair.
 *
 * @returns An array of DashboardRow objects the token can access.
 */
export async function fetchAccessibleDashboards(): Promise<DashboardRow[]> {
  const payload = {
    action: 'get',
    key: luzmoConfig.embedKey,
    token: luzmoConfig.embedToken,
    version: '0.1.0',
    find: {
      where: {
        type: 'dashboard',
        derived: false,
      },
      attributes: ['id', 'name', 'contents', 'created_at', 'updated_at'],
    },
  };

  try {
    const response = await fetch(LUZMO_SECURABLE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new DashboardFetchError(`HTTP error! status: ${response.status}`);
    }

    const data: DashboardApiResponse = await response.json();
    const dashboards = data.rows ?? [];

    if (dashboards.length === 0) {
      console.warn('[fetch-dashboard] No accessible dashboards found for this token');
    }

    return dashboards;
  } catch (error) {
    if (error instanceof DashboardFetchError) {
      throw error;
    }
    console.error('Error fetching accessible dashboards:', error);
    throw new DashboardFetchError('Failed to fetch accessible dashboards');
  }
}

/**
 * Fetch example AI chart questions for a given dataset.
 * Returns up to 4 suggestions, or an empty array on failure.
 */
export async function fetchAIExampleQuestions(
  datasetId: string,
): Promise<AIChartSuggestion[]> {
  const payload = {
    action: 'create',
    version: '0.1.0',
    key: luzmoConfig.embedKey,
    token: luzmoConfig.embedToken,
    properties: {
      type: 'generate-example-questions',
      dataset_id: datasetId,
    },
  };

  try {
    const response = await fetch(LUZMO_AICHART_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(`[fetch-dashboard] AI example questions failed: HTTP ${response.status}`);
      return [];
    }

    const data = await response.json() as Record<string, unknown>;

    // The API may return the suggestions under different keys depending on version
    const raw =
      (data.suggestions as AIChartSuggestion[] | undefined) ??
      (data.questions as AIChartSuggestion[] | undefined) ??
      (Array.isArray(data.rows) ? (data.rows as AIChartSuggestion[]) : []);

    return raw.slice(0, 4);
  } catch (error) {
    console.warn('[fetch-dashboard] Error fetching AI example questions:', error);
    return [];
  }
}

/**
 * Call the Luzmo AI chart generator with a user prompt.
 * Returns the generated chart definition (type, options, slots).
 */
export async function generateAIChart(
  datasetId: string,
  question: string,
): Promise<AIChartGenerateResponse> {
  const payload = {
    action: 'create',
    version: '0.1.0',
    key: luzmoConfig.embedKey,
    token: luzmoConfig.embedToken,
    properties: {
      type: 'generate-chart',
      dataset_id: datasetId,
      question,
    },
  };

  const response = await fetch(LUZMO_AICHART_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail = '';
    try {
      const errBody = await response.json() as Record<string, unknown>;
      detail = (errBody.message as string | undefined) ??
               (errBody.error as string | undefined) ??
               '';
    } catch {
      detail = await response.text().catch(() => '');
    }
    const msg = detail
      ? `AI chart generation failed: ${detail}`
      : `AI chart generation failed (HTTP ${response.status})`;
    throw new DashboardFetchError(msg);
  }

  const data = await response.json() as Record<string, unknown>;

  // The API returns the chart definition under data.generatedChart
  const result = (data.generatedChart ?? data) as AIChartGenerateResponse;

  if (!result.type) {
    throw new DashboardFetchError('AI chart generation returned an unexpected response. Please try again.');
  }

  return result;
}
