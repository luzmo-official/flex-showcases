import { randomBytes } from 'crypto';

const TTL_MS = 60 * 60 * 1000;

interface StoredChart {
  png: Buffer;
  expiresAt: number;
}

const charts = new Map<string, StoredChart>();

function evictExpired(): void {
  const now = Date.now();
  for (const [id, entry] of charts) {
    if (entry.expiresAt <= now) charts.delete(id);
  }
}

/** Stores a chart PNG and returns an unguessable id for GET /charts/:id. */
export function storeChart(png: Buffer): string {
  evictExpired();
  const id = randomBytes(16).toString('hex');
  charts.set(id, { png, expiresAt: Date.now() + TTL_MS });
  return id;
}

export function getChartPng(id: string): Buffer | null {
  if (!/^[a-f0-9]{32}$/.test(id)) return null;
  const entry = charts.get(id);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    charts.delete(id);
    return null;
  }
  return entry.png;
}

export function chartPublicUrl(publicBaseUrl: string, id: string): string {
  return `${publicBaseUrl.replace(/\/$/, '')}/charts/${id}`;
}
