import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { AppConfig } from './types.js';
import { emailAddress } from './email-text.js';
import { normalizeUsersConfig } from './users.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseBoolean(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const value = raw.trim().toLowerCase();
  if (value === '1' || value === 'true' || value === 'yes') return true;
  if (value === '0' || value === 'false' || value === 'no') return false;
  throw new Error(`${name} must be true or false`);
}

function parsePort(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return port;
}

function loadUsersConfig() {
  const filePath = resolve(PROJECT_ROOT, 'users.json');
  try {
    const raw = readFileSync(filePath, 'utf-8');
    return normalizeUsersConfig(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(
        `users.json not found at ${filePath}. Copy users.json.example and add the sender addresses that may use the bot.`
      );
    }
    throw error;
  }
}

function parseUseEmbedAuth(): boolean {
  const raw = process.env.AIPROMPT_USE_EMBED_AUTH;
  if (raw === undefined || raw.trim() === '') return true;
  return raw !== '0' && raw.toLowerCase() !== 'false';
}

export function loadConfig(): AppConfig {
  const datasetIds = requireEnv('DATASET_IDS')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (datasetIds.length === 0) {
    throw new Error('DATASET_IDS must contain at least one dataset ID');
  }

  const users = loadUsersConfig();
  if (Object.keys(users).length === 0) {
    throw new Error('users.json must contain at least one sender');
  }

  const imapUser = emailAddress(requireEnv('IMAP_USER'));
  const smtpFrom = process.env.SMTP_FROM?.trim() || imapUser;

  return {
    imapHost: requireEnv('IMAP_HOST'),
    imapPort: parsePort('IMAP_PORT', 993),
    imapSecure: parseBoolean('IMAP_SECURE', true),
    imapUser,
    imapPassword: requireEnv('IMAP_PASSWORD'),
    imapMailbox: process.env.IMAP_MAILBOX?.trim() || 'INBOX',
    smtpHost: requireEnv('SMTP_HOST'),
    smtpPort: parsePort('SMTP_PORT', 587),
    smtpSecure: parseBoolean('SMTP_SECURE', false),
    smtpUser: process.env.SMTP_USER?.trim() || imapUser,
    smtpPassword: process.env.SMTP_PASSWORD?.trim() || requireEnv('IMAP_PASSWORD'),
    smtpFrom,
    smtpFromAddress: emailAddress(smtpFrom),
    datasetIds,
    luzmoHost: process.env.LUZMO_HOST?.trim() || 'https://api.luzmo.com',
    users,
    useEmbedAuth: parseUseEmbedAuth(),
  };
}
