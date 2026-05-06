const fs = require('fs');
const path = require('path');

const DEFAULT_WEEKS = 156;
const DEFAULT_SEED = 424242;
const DEFAULT_OUT = path.resolve(__dirname, '..', 'data', 'bug_tickets_weekly.csv');
const DAY_MS = 24 * 60 * 60 * 1000;

const SQUADS = [
  { name: 'Forge', intake: 1.1, throughput: 0.97, volatility: 1.15 },
  { name: 'Horizon', intake: 0.92, throughput: 1.06, volatility: 0.9 },
  { name: 'Orbit', intake: 1.0, throughput: 1.0, volatility: 1.0 },
];

const PRIORITIES = [
  { name: 'low', baseCreated: 6, baseResolutionDays: 25 },
  { name: 'medium', baseCreated: 8, baseResolutionDays: 16 },
  { name: 'high', baseCreated: 5, baseResolutionDays: 9 },
];

function usageAndExit(message) {
  if (message) {
    console.error(message);
  }
  console.error(
    'Usage: node scripts/generate-bug-tickets-csv.js [--out <path>] [--weeks <number>] [--seed <number>] [--end-week <YYYY-MM-DD>]',
  );
  process.exit(1);
}

function parseArgs(argv) {
  const options = {
    out: DEFAULT_OUT,
    weeks: DEFAULT_WEEKS,
    seed: DEFAULT_SEED,
    endWeek: null,
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

    if (arg === '--weeks') {
      const value = Number(argv[i + 1]);
      if (!Number.isInteger(value) || value <= 0) {
        usageAndExit('Invalid value for --weeks. Expected a positive integer.');
      }
      options.weeks = value;
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

    if (arg === '--end-week') {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        usageAndExit('Missing value for --end-week');
      }
      options.endWeek = parseDateOnlyUtc(value);
      if (!options.endWeek) {
        usageAndExit('Invalid value for --end-week. Expected YYYY-MM-DD.');
      }
      if (options.endWeek.getUTCDay() !== 1) {
        usageAndExit('Invalid value for --end-week. Date must be a Monday.');
      }
      i += 1;
      continue;
    }

    usageAndExit(`Unknown option: ${arg}`);
  }

  return options;
}

function parseDateOnlyUtc(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, monthIndex, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== monthIndex
    || date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function getMondayStartUtc(date) {
  const utcDate = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  ));
  const dayOfWeek = utcDate.getUTCDay(); // 0=Sun, 1=Mon, ...
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  return new Date(utcDate.getTime() - daysSinceMonday * DAY_MS);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
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

function randomBetween(rng, min, max) {
  return min + (max - min) * rng();
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function formatIsoUtc(date) {
  return date.toISOString();
}

function escapeCsvValue(value) {
  const stringValue = String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function toCsv(rows, headers) {
  const lines = [];
  lines.push(headers.join(','));
  for (const row of rows) {
    const values = headers.map((header) => escapeCsvValue(row[header]));
    lines.push(values.join(','));
  }
  return `${lines.join('\n')}\n`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function buildRows({ weeks, seed, endWeek }) {
  const rng = createLcg(seed);
  const now = new Date();
  const currentWeekStart = getMondayStartUtc(now);
  const endWeekStart = endWeek || addDays(currentWeekStart, -7);
  const startWeekStart = addDays(endWeekStart, -7 * (weeks - 1));

  if (endWeekStart.getTime() >= currentWeekStart.getTime()) {
    usageAndExit('--end-week must be before the current week start (last completed week or earlier).');
  }

  const stateByBucket = new Map();
  const rows = [];

  for (let weekIndex = 0; weekIndex < weeks; weekIndex += 1) {
    const weekStart = addDays(startWeekStart, weekIndex * 7);
    const weekStartIso = formatIsoUtc(weekStart);

    for (let squadIndex = 0; squadIndex < SQUADS.length; squadIndex += 1) {
      const squad = SQUADS[squadIndex];
      for (let priorityIndex = 0; priorityIndex < PRIORITIES.length; priorityIndex += 1) {
        const priority = PRIORITIES[priorityIndex];
        const bucketKey = `${squad.name}__${priority.name}`;
        const existing = stateByBucket.get(bucketKey);
        const openPrev = existing
          ? existing
          : Math.round(priority.baseCreated * (1.4 + squadIndex * 0.3 + priorityIndex * 0.2));

        const seasonality =
          1
          + 0.16 * Math.sin((2 * Math.PI * weekIndex) / 26)
          + 0.09 * Math.cos((2 * Math.PI * weekIndex) / 52);
        const trend = 0.94 + 0.12 * (weekIndex / Math.max(1, weeks - 1));
        let incidentBoost = 1;
        if ((weekIndex + squadIndex * 3 + priorityIndex * 5) % 29 === 0) {
          if (priority.name === 'high') {
            incidentBoost = 1.28;
          } else if (priority.name === 'medium') {
            incidentBoost = 1.14;
          } else {
            incidentBoost = 1.07;
          }
        }

        const createdRaw =
          priority.baseCreated
          * squad.intake
          * seasonality
          * trend
          * incidentBoost
          + randomBetween(rng, -1.1, 1.1) * squad.volatility;
        const createdBugs = Math.max(0, Math.round(createdRaw));

        const backlogPressure = Math.min(1.6, openPrev / Math.max(1, priority.baseCreated * 7));
        const resolvedRaw =
          createdBugs * (0.82 + 0.07 * backlogPressure)
          + priority.baseCreated * squad.throughput * 0.14
          + randomBetween(rng, -0.9, 0.9) * squad.volatility;
        const resolvedBugs = clamp(
          Math.round(resolvedRaw),
          0,
          openPrev + createdBugs,
        );

        const openBugs = openPrev + createdBugs - resolvedBugs;
        const weeklyDeltaBugs = createdBugs - resolvedBugs;

        const avgResolutionTime = round2(Math.max(
          1,
          priority.baseResolutionDays * (1 + 0.42 * backlogPressure)
          + randomBetween(rng, -1.2, 1.2),
        ));

        rows.push({
          week_start: weekStartIso,
          squad: squad.name,
          priority: priority.name,
          created_bugs: createdBugs,
          resolved_bugs: resolvedBugs,
          open_bugs: openBugs,
          weekly_delta_bugs: weeklyDeltaBugs,
          avg_resolution_time: avgResolutionTime.toFixed(2),
        });

        stateByBucket.set(bucketKey, openBugs);
      }
    }
  }

  return {
    rows,
    startWeekStart,
    endWeekStart,
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const headers = [
    'week_start',
    'squad',
    'priority',
    'created_bugs',
    'resolved_bugs',
    'open_bugs',
    'weekly_delta_bugs',
    'avg_resolution_time',
  ];

  const { rows, startWeekStart, endWeekStart } = buildRows({
    weeks: options.weeks,
    seed: options.seed,
    endWeek: options.endWeek,
  });

  const outputDir = path.dirname(options.out);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(options.out, toCsv(rows, headers), 'utf8');

  console.log('Generated bug tickets CSV');
  console.log(`  path: ${path.resolve(options.out)}`);
  console.log(`  rows: ${rows.length}`);
  console.log(`  weeks: ${startWeekStart.toISOString()} -> ${endWeekStart.toISOString()}`);
  console.log(`  seed: ${options.seed}`);
}

main();
