const fs = require('fs');
const path = require('path');

const DEFAULT_COUNT = 500;
const DEFAULT_SEED = 424242;
const DEFAULT_PROJECT = 'AERIS';
const DEFAULT_WEEKS = 156;
const DEFAULT_OUT = path.resolve(__dirname, '..', 'data', 'jira_tickets_table.csv');
const DAY_MS = 24 * 60 * 60 * 1000;

const SQUADS = ['Forge', 'Horizon', 'Orbit'];
const PRIORITIES = [
  { name: 'low', weight: 0.45 },
  { name: 'medium', weight: 0.4 },
  { name: 'high', weight: 0.15 },
];

const TICKET_AREAS = [
  'Dashboard filters',
  'Embed auth flow',
  'Webhook processing',
  'Role permissions',
  'CSV export',
  'Alert routing',
  'PR analytics panel',
  'Bug trend chart',
  'Repository insights',
  'Release notes sync',
  'SAML login',
  'API rate limiter',
  'Background worker',
  'Notification center',
  'Search indexing',
  'Audit trail',
  'Billing webhook',
  'Mobile layout',
  'Timezone rendering',
  'Report scheduler',
];

const TICKET_PROBLEMS = [
  'shows stale data',
  'times out after 30 seconds',
  'returns a 500 error',
  'drops user-selected filters',
  'duplicates records',
  'fails silently',
  'loads with incorrect totals',
  'ignores retry backoff',
  'renders blank state unexpectedly',
  'locks up under heavy load',
  'truncates long values',
  'misclassifies priority labels',
  'rejects valid payloads',
  'leaks memory over long sessions',
  'shows inconsistent sorting',
  'emits malformed timestamps',
  'creates duplicate notifications',
  'does not persist settings',
  'resets pagination unexpectedly',
  'reports incorrect line counts',
];

const TICKET_CONTEXTS = [
  'after token refresh',
  'during peak traffic',
  'when switching squads',
  'on first load after deploy',
  'when using Safari',
  'for read-only users',
  'after toggling date level',
  'when exporting to CSV',
  'during concurrent edits',
  'on dashboards with large datasets',
  'when reconnecting after offline mode',
  'for repositories with archived branches',
  'after timezone changes',
  'when API latency spikes',
  'on mobile portrait mode',
  'after enabling feature flags',
];

const TICKET_IMPACT = [
  'affecting customer reporting',
  'blocking release verification',
  'causing inaccurate KPIs',
  'impacting weekly operations review',
  'creating noisy support alerts',
  'slowing engineering triage',
  'breaking audit requirements',
  'impacting executive dashboard confidence',
];

function usageAndExit(message) {
  if (message) {
    console.error(message);
  }
  console.error(
    'Usage: node scripts/generate-jira-tickets-csv.js [--out <path>] [--count <number>] [--seed <number>] [--project <key>] [--weeks <number>]',
  );
  process.exit(1);
}

function parseArgs(argv) {
  const options = {
    out: DEFAULT_OUT,
    count: DEFAULT_COUNT,
    seed: DEFAULT_SEED,
    project: DEFAULT_PROJECT,
    weeks: DEFAULT_WEEKS,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      usageAndExit(`Unexpected argument: ${arg}`);
    }

    if (arg === '--out') {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        usageAndExit('Missing value for --out');
      }
      options.out = path.resolve(process.cwd(), value);
      i += 1;
      continue;
    }

    if (arg === '--count') {
      const value = Number(argv[i + 1]);
      if (!Number.isInteger(value) || value <= 0) {
        usageAndExit('Invalid value for --count. Expected a positive integer.');
      }
      options.count = value;
      i += 1;
      continue;
    }

    if (arg === '--seed') {
      const value = Number(argv[i + 1]);
      if (!Number.isInteger(value)) {
        usageAndExit('Invalid value for --seed. Expected an integer.');
      }
      options.seed = value;
      i += 1;
      continue;
    }

    if (arg === '--project') {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        usageAndExit('Missing value for --project');
      }
      const cleaned = value.trim().toUpperCase();
      if (!/^[A-Z][A-Z0-9]+$/.test(cleaned)) {
        usageAndExit('Invalid value for --project. Use Jira-style key prefix (A-Z, 0-9).');
      }
      options.project = cleaned;
      i += 1;
      continue;
    }

    if (arg === '--weeks') {
      const value = Number(argv[i + 1]);
      if (!Number.isInteger(value) || value <= 0) {
        usageAndExit('Invalid value for --weeks. Expected a positive integer.');
      }
      options.weeks = value;
      i += 1;
      continue;
    }

    usageAndExit(`Unknown option: ${arg}`);
  }

  return options;
}

function createLcg(seed) {
  let state = (seed >>> 0);
  if (state === 0) {
    state = 1;
  }
  return function next() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function getMondayStartUtc(date) {
  const utcDate = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  ));
  const dayOfWeek = utcDate.getUTCDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  return new Date(utcDate.getTime() - daysSinceMonday * DAY_MS);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

function randomBetween(rng, min, max) {
  return min + (max - min) * rng();
}

function randomIntBetween(rng, min, max) {
  return Math.floor(randomBetween(rng, min, max + 1));
}

function weightedPick(rng, entries) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = rng() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.value;
    }
  }
  return entries[entries.length - 1].value;
}

function pickOne(rng, values) {
  const index = Math.floor(rng() * values.length);
  return values[index];
}

function escapeCsvValue(value) {
  const stringValue = String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function toCsv(rows, headers) {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsvValue(row[header])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function buildTicketTitle(rng) {
  const area = pickOne(rng, TICKET_AREAS);
  const problem = pickOne(rng, TICKET_PROBLEMS);
  const context = pickOne(rng, TICKET_CONTEXTS);
  const impact = pickOne(rng, TICKET_IMPACT);
  return `${area} ${problem} ${context}, ${impact}`;
}

function buildRows({ count, seed, project, weeks }) {
  const rng = createLcg(seed);
  const now = new Date();
  const currentWeekStart = getMondayStartUtc(now);
  const endWeekStart = addDays(currentWeekStart, -7);
  const startWeekStart = addDays(endWeekStart, -7 * (weeks - 1));
  const endDateExclusive = addDays(endWeekStart, 7);
  const totalWindowMs = endDateExclusive.getTime() - startWeekStart.getTime();

  const keyBase = randomIntBetween(rng, 4200, 6800);
  const rows = [];

  for (let index = 0; index < count; index += 1) {
    const squad = pickOne(rng, SQUADS);
    const priority = weightedPick(rng, PRIORITIES.map((entry) => ({ value: entry.name, weight: entry.weight })));
    const offsetMs = Math.floor(rng() * totalWindowMs);
    const creationDate = new Date(startWeekStart.getTime() + offsetMs);
    const keyNumber = keyBase + index;
    const jiraKey = `${project}-${keyNumber}`;

    rows.push({
      jira_key: jiraKey,
      priority,
      squad,
      ticket_name: buildTicketTitle(rng),
      creation_date: creationDate.toISOString(),
    });
  }

  rows.sort((a, b) => a.creation_date.localeCompare(b.creation_date) || a.jira_key.localeCompare(b.jira_key));

  return {
    rows,
    startWeekStart,
    endWeekStart,
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const headers = ['jira_key', 'priority', 'squad', 'ticket_name', 'creation_date'];

  const { rows, startWeekStart, endWeekStart } = buildRows({
    count: options.count,
    seed: options.seed,
    project: options.project,
    weeks: options.weeks,
  });

  const outputDir = path.dirname(options.out);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(options.out, toCsv(rows, headers), 'utf8');

  console.log('Generated Jira tickets CSV');
  console.log(`  path: ${path.resolve(options.out)}`);
  console.log(`  rows: ${rows.length}`);
  console.log(`  project: ${options.project}`);
  console.log(`  window: ${startWeekStart.toISOString()} -> ${endWeekStart.toISOString()}`);
  console.log(`  seed: ${options.seed}`);
}

main();
