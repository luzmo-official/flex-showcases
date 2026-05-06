/**
 * Provides Luzmo dataset column IDs from environment variables only.
 * Use this instead of calling the Luzmo API from the browser (which triggers CORS).
 * Column IDs can be obtained once via the Luzmo Node SDK and set in .env.
 *
 * Required for: built-in report seeding, PitchView fallback charts.
 * Optional env vars (no API call if missing):
 *   VITE_LUZMO_COLUMN_TEAM
 *   VITE_LUZMO_COLUMN_GROUP
 *   VITE_LUZMO_COLUMN_TOURNAMENT_WIN_PROB
 *   VITE_LUZMO_COLUMN_GROUP_ADVANCE_PROB
 *   VITE_LUZMO_COLUMN_GROUP_WIN_PROB
 *   VITE_LUZMO_COLUMN_CONFEDERATION
 */

const ENV_KEYS = [
  ['team', 'VITE_LUZMO_COLUMN_TEAM'],
  ['group', 'VITE_LUZMO_COLUMN_GROUP'],
  ['tournament_win_prob', 'VITE_LUZMO_COLUMN_TOURNAMENT_WIN_PROB'],
  ['group_advance_prob', 'VITE_LUZMO_COLUMN_GROUP_ADVANCE_PROB'],
  ['group_win_prob', 'VITE_LUZMO_COLUMN_GROUP_WIN_PROB'],
  ['confederation', 'VITE_LUZMO_COLUMN_CONFEDERATION'],
] as const

/**
 * Builds a map of column name -> column ID from env vars.
 * Also adds 'tournament win prob' and 'group advance prob' (spaces) for compatibility.
 * Returns empty object if no column env vars are set (so no API is called).
 */
export function getColumnIdByNameFromEnv(): Record<string, string> {
  const env = import.meta.env as Record<string, string | undefined>
  const map: Record<string, string> = {}
  for (const [name, key] of ENV_KEYS) {
    const id = env[key]
    if (id && typeof id === 'string') {
      map[name] = id
      if (name === 'tournament_win_prob') map['tournament win prob'] = id
      if (name === 'group_advance_prob') map['group advance prob'] = id
    }
  }
  return map
}

/**
 * True if we have at least the minimal column set to build charts (team + one measure).
 */
export function hasMinimalColumnIdsFromEnv(): boolean {
  const map = getColumnIdByNameFromEnv()
  const team = map['team']
  const measure =
    map['tournament_win_prob'] ?? map['tournament win prob'] ?? map['group_advance_prob']
  return Boolean(team && measure)
}

/** Names required for built-in report seeding (all must be set to avoid partial charts). */
const BUILTIN_REQUIRED_COLUMNS = [
  'team',
  'group',
  'tournament_win_prob',
  'group_advance_prob',
  'group_win_prob',
  'confederation',
] as const

/**
 * True only when all column IDs required for built-in reports are set in env.
 * Use this before seeding so we never create partially configured charts.
 */
export function hasAllBuiltInColumnIdsFromEnv(): boolean {
  const map = getColumnIdByNameFromEnv()
  return BUILTIN_REQUIRED_COLUMNS.every((name) => Boolean(map[name]))
}
