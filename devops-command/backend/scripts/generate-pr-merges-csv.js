const fs = require('fs');
const path = require('path');

const DEFAULT_WEEKS = 156;
const DEFAULT_SEED = 424242;
const DEFAULT_OUT = path.resolve(__dirname, '..', 'data', 'pr_merges_weekly.csv');
const DAY_MS = 24 * 60 * 60 * 1000;

const REPOSITORIES = [
  { name: 'ui-control-center', ownerSquad: 'Forge' },
  { name: 'api-control-center', ownerSquad: 'Horizon' },
  { name: 'workflow-orchestrator', ownerSquad: 'Forge' },
  { name: 'identity-access', ownerSquad: 'Horizon' },
  { name: 'billing-engine', ownerSquad: 'Orbit' },
  { name: 'observability-platform', ownerSquad: 'Orbit' },
];

const SQUADS = [
  {
    name: 'Forge',
    multiplier: 1.05,
    users: [
      { name: 'Ava Martinez', basePrCapacity: 5.4, primaryRepo: 'ui-control-center', secondaryRepo: 'workflow-orchestrator' },
      { name: 'Liam OConnor', basePrCapacity: 5.0, primaryRepo: 'workflow-orchestrator', secondaryRepo: 'ui-control-center' },
      { name: 'Priya Shah', basePrCapacity: 4.6, primaryRepo: 'ui-control-center', secondaryRepo: 'workflow-orchestrator' },
      { name: 'Noah Kim', basePrCapacity: 4.2, primaryRepo: 'workflow-orchestrator', secondaryRepo: 'ui-control-center' },
    ],
  },
  {
    name: 'Horizon',
    multiplier: 0.95,
    users: [
      { name: 'Emma Rossi', basePrCapacity: 5.1, primaryRepo: 'api-control-center', secondaryRepo: 'identity-access' },
      { name: 'Mateo Alvarez', basePrCapacity: 4.7, primaryRepo: 'identity-access', secondaryRepo: 'api-control-center' },
      { name: 'Sofia Nguyen', basePrCapacity: 4.2, primaryRepo: 'api-control-center', secondaryRepo: 'identity-access' },
      { name: 'Ethan Clark', basePrCapacity: 3.9, primaryRepo: 'identity-access', secondaryRepo: 'api-control-center' },
    ],
  },
  {
    name: 'Orbit',
    multiplier: 1.0,
    users: [
      { name: 'Maya Patel', basePrCapacity: 5.2, primaryRepo: 'billing-engine', secondaryRepo: 'observability-platform' },
      { name: 'Lucas Weber', basePrCapacity: 4.8, primaryRepo: 'observability-platform', secondaryRepo: 'billing-engine' },
      { name: 'Zoe Tanaka', basePrCapacity: 4.3, primaryRepo: 'billing-engine', secondaryRepo: 'observability-platform' },
      { name: 'Daniel Brooks', basePrCapacity: 4.0, primaryRepo: 'observability-platform', secondaryRepo: 'billing-engine' },
    ],
  },
];

const SQUAD_ORDER = Object.fromEntries(SQUADS.map((squad, index) => [squad.name, index]));

function usageAndExit(message) {
  if (message) {
    console.error(message);
  }
  console.error(
    'Usage: node scripts/generate-pr-merges-csv.js [--out <path>] [--weeks <number>] [--seed <number>] [--end-week <YYYY-MM-DD>]',
  );
  process.exit(1);
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

function randomIntBetween(rng, min, max) {
  return Math.floor(randomBetween(rng, min, max + 1));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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
    lines.push(headers.map((header) => escapeCsvValue(row[header])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function weightedPick(rng, weightedItems) {
  const totalWeight = weightedItems.reduce((sum, item) => sum + item.weight, 0);
  const roll = rng() * totalWeight;
  let running = 0;
  for (const item of weightedItems) {
    running += item.weight;
    if (roll <= running) {
      return item.value;
    }
  }
  return weightedItems[weightedItems.length - 1].value;
}

function sampleLinesChanged(rng) {
  const classRoll = rng();
  if (classRoll < 0.58) {
    return randomIntBetween(rng, 20, 120);
  }
  if (classRoll < 0.92) {
    return randomIntBetween(rng, 121, 380);
  }
  return randomIntBetween(rng, 381, 900);
}

function buildUsers() {
  const users = [];
  let userIndex = 0;
  for (const squad of SQUADS) {
    for (const user of squad.users) {
      users.push({
        globalIndex: userIndex,
        squad: squad.name,
        squadMultiplier: squad.multiplier,
        name: user.name,
        basePrCapacity: user.basePrCapacity,
        primaryRepo: user.primaryRepo,
        secondaryRepo: user.secondaryRepo,
      });
      userIndex += 1;
    }
  }
  return users;
}

function buildWeightedReposForUser(user) {
  return REPOSITORIES.map((repo) => {
    let weight = 1;
    if (repo.name === user.primaryRepo) {
      weight = 10;
    } else if (repo.name === user.secondaryRepo) {
      weight = 6;
    } else if (repo.ownerSquad === user.squad) {
      weight = 2;
    }
    return { value: repo.name, weight };
  });
}

function sortRows(rows) {
  return rows.sort((a, b) => {
    if (a.week_start !== b.week_start) {
      return a.week_start.localeCompare(b.week_start);
    }
    if (a.squad !== b.squad) {
      return SQUAD_ORDER[a.squad] - SQUAD_ORDER[b.squad];
    }
    if (a.user !== b.user) {
      return a.user.localeCompare(b.user);
    }
    return a.repository.localeCompare(b.repository);
  });
}

function buildRows({ weeks, seed, endWeek }) {
  const rng = createLcg(seed);
  const users = buildUsers();
  const weightedReposByUser = new Map(
    users.map((user) => [user.name, buildWeightedReposForUser(user)]),
  );

  const now = new Date();
  const currentWeekStart = getMondayStartUtc(now);
  const endWeekStart = endWeek || addDays(currentWeekStart, -7);
  const startWeekStart = addDays(endWeekStart, -7 * (weeks - 1));

  if (endWeekStart.getTime() >= currentWeekStart.getTime()) {
    usageAndExit('--end-week must be before the current week start (last completed week or earlier).');
  }

  const rowMap = new Map();

  for (let weekIndex = 0; weekIndex < weeks; weekIndex += 1) {
    const weekStart = addDays(startWeekStart, weekIndex * 7);
    const weekStartIso = weekStart.toISOString();

    for (const user of users) {
      let value = user.basePrCapacity * user.squadMultiplier;
      value *= 1 + 0.12 * Math.sin((2 * Math.PI * weekIndex) / 26) + 0.06 * Math.cos((2 * Math.PI * weekIndex) / 52);
      value *= 0.96 + 0.08 * (weekIndex / Math.max(1, weeks - 1));

      if ((weekIndex + user.globalIndex * 5) % 19 === 0) {
        value *= 0.45;
      }
      if (weekIndex % 13 === 0) {
        value *= 1.15;
      }

      value += randomBetween(rng, -0.9, 0.9);
      const prsTotal = clamp(Math.round(value), 0, 12);
      if (prsTotal <= 0) {
        continue;
      }

      const weightedRepos = weightedReposByUser.get(user.name);
      for (let prIndex = 0; prIndex < prsTotal; prIndex += 1) {
        const repository = weightedPick(rng, weightedRepos);
        const linesChanged = sampleLinesChanged(rng);
        const additionsRatio = randomBetween(rng, 0.52, 0.72);
        const additions = Math.round(linesChanged * additionsRatio);
        const deletions = linesChanged - additions;

        const key = [
          weekStartIso,
          user.squad,
          user.name,
          repository,
        ].join('__');

        const existing = rowMap.get(key);
        if (existing) {
          existing.prs_merged += 1;
          existing.additions += additions;
          existing.deletions += deletions;
          existing.lines_changed += linesChanged;
        } else {
          rowMap.set(key, {
            week_start: weekStartIso,
            squad: user.squad,
            user: user.name,
            repository,
            prs_merged: 1,
            additions,
            deletions,
            lines_changed: linesChanged,
          });
        }
      }
    }
  }

  return {
    rows: sortRows([...rowMap.values()]),
    startWeekStart,
    endWeekStart,
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const headers = [
    'week_start',
    'squad',
    'user',
    'repository',
    'prs_merged',
    'additions',
    'deletions',
    'lines_changed',
  ];

  const { rows, startWeekStart, endWeekStart } = buildRows({
    weeks: options.weeks,
    seed: options.seed,
    endWeek: options.endWeek,
  });

  const outputDir = path.dirname(options.out);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(options.out, toCsv(rows, headers), 'utf8');

  console.log('Generated PR merges CSV');
  console.log(`  path: ${path.resolve(options.out)}`);
  console.log(`  rows: ${rows.length}`);
  console.log(`  weeks: ${startWeekStart.toISOString()} -> ${endWeekStart.toISOString()}`);
  console.log(`  seed: ${options.seed}`);
}

main();
