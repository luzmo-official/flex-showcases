import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { AppConfig, MicrosoftAppType } from './types.js';
import { normalizeUsersConfig } from './users.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function loadUsersConfig() {
  const filePath = resolve(PROJECT_ROOT, 'users.json');
  try {
    const raw = readFileSync(filePath, 'utf-8');
    return normalizeUsersConfig(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(
        `users.json not found at ${filePath}. Copy users.json.example and add your users.`
      );
    }
    throw error;
  }
}

function parseUseEmbedAuth(): boolean {
  const raw = process.env.AIPROMPT_USE_EMBED_AUTH;
  if (raw === undefined || raw === '') return true;
  return raw !== '0' && raw.toLowerCase() !== 'false';
}

function parseAppType(tenantId: string | undefined): MicrosoftAppType {
  const raw = process.env.MicrosoftAppType?.trim();
  const appType = raw || (tenantId ? 'SingleTenant' : 'MultiTenant');
  if (appType !== 'SingleTenant' && appType !== 'MultiTenant') {
    throw new Error('MicrosoftAppType must be SingleTenant or MultiTenant');
  }
  if (appType === 'SingleTenant' && !tenantId) {
    throw new Error('MicrosoftAppTenantId is required when MicrosoftAppType is SingleTenant');
  }
  return appType;
}

function parsePublicBaseUrl(): string | undefined {
  const raw = process.env.PUBLIC_BASE_URL?.trim();
  if (!raw) return undefined;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('PUBLIC_BASE_URL must be an absolute URL');
  }
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) {
    throw new Error('PUBLIC_BASE_URL must be https (http is allowed only for localhost)');
  }
  return raw.replace(/\/$/, '');
}

export function loadConfig(): AppConfig {
  const datasetIdsRaw = requireEnv('DATASET_IDS');
  const datasetIds = datasetIdsRaw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (datasetIds.length === 0) {
    throw new Error('DATASET_IDS must contain at least one dataset ID');
  }

  const users = loadUsersConfig();
  if (Object.keys(users).length === 0) {
    throw new Error('users.json must contain at least one user entry');
  }

  const tenantId = process.env.MicrosoftAppTenantId?.trim() || undefined;
  const port = Number(process.env.PORT || 3978);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer');
  }

  return {
    microsoftAppId: requireEnv('MicrosoftAppId'),
    microsoftAppPassword: requireEnv('MicrosoftAppPassword'),
    microsoftAppType: parseAppType(tenantId),
    microsoftAppTenantId: tenantId,
    port,
    publicBaseUrl: parsePublicBaseUrl(),
    datasetIds,
    luzmoHost: process.env.LUZMO_HOST || 'https://api.luzmo.com',
    users,
    useEmbedAuth: parseUseEmbedAuth(),
  };
}
