export interface Team {
  name: string
  /** ISO 3166-1 alpha-2 code for flag-icons (lowercase) */
  flagCode: string
  confederation: string
  fifaRanking: number
  /** Probability (0-1) of advancing from the group */
  groupAdvanceProb: number
  /** Probability (0-1) of winning the group */
  groupWinProb: number
  /** Probability (0-1) of winning the tournament */
  tournamentWinProb: number
}

export interface Group {
  id: string
  name: string
  teams: Team[]
}

/**
 * All 12 groups for FIFA World Cup 2026.
 * Probabilities sourced from prediction markets (Oddpool, Feb 2026).
 * Some playoff spots are TBD — marked with placeholder data.
 */
export const groups: Group[] = [
  {
    id: 'A',
    name: 'Group A',
    teams: [
      { name: 'Mexico', flagCode: 'mx', confederation: 'CONCACAF', fifaRanking: 14, groupAdvanceProb: 0.50, groupWinProb: 0.28, tournamentWinProb: 0.01 },
      { name: 'South Africa', flagCode: 'za', confederation: 'CAF', fifaRanking: 59, groupAdvanceProb: 0.10, groupWinProb: 0.05, tournamentWinProb: 0.001 },
      { name: 'South Korea', flagCode: 'kr', confederation: 'AFC', fifaRanking: 23, groupAdvanceProb: 0.35, groupWinProb: 0.18, tournamentWinProb: 0.005 },
      { name: 'Euro Playoff D', flagCode: 'eu', confederation: 'UEFA', fifaRanking: 40, groupAdvanceProb: 0.25, groupWinProb: 0.12, tournamentWinProb: 0.003 },
    ],
  },
  {
    id: 'B',
    name: 'Group B',
    teams: [
      { name: 'Canada', flagCode: 'ca', confederation: 'CONCACAF', fifaRanking: 41, groupAdvanceProb: 0.30, groupWinProb: 0.14, tournamentWinProb: 0.005 },
      { name: 'Euro Playoff A', flagCode: 'eu', confederation: 'UEFA', fifaRanking: 35, groupAdvanceProb: 0.20, groupWinProb: 0.10, tournamentWinProb: 0.003 },
      { name: 'Qatar', flagCode: 'qa', confederation: 'AFC', fifaRanking: 45, groupAdvanceProb: 0.15, groupWinProb: 0.07, tournamentWinProb: 0.001 },
      { name: 'Switzerland', flagCode: 'ch', confederation: 'UEFA', fifaRanking: 18, groupAdvanceProb: 0.55, groupWinProb: 0.30, tournamentWinProb: 0.01 },
    ],
  },
  {
    id: 'C',
    name: 'Group C',
    teams: [
      { name: 'Brazil', flagCode: 'br', confederation: 'CONMEBOL', fifaRanking: 5, groupAdvanceProb: 0.80, groupWinProb: 0.55, tournamentWinProb: 0.10 },
      { name: 'Morocco', flagCode: 'ma', confederation: 'CAF', fifaRanking: 13, groupAdvanceProb: 0.45, groupWinProb: 0.22, tournamentWinProb: 0.02 },
      { name: 'Haiti', flagCode: 'ht', confederation: 'CONCACAF', fifaRanking: 88, groupAdvanceProb: 0.05, groupWinProb: 0.02, tournamentWinProb: 0.0001 },
      { name: 'Scotland', flagCode: 'gb-sct', confederation: 'UEFA', fifaRanking: 52, groupAdvanceProb: 0.20, groupWinProb: 0.08, tournamentWinProb: 0.002 },
    ],
  },
  {
    id: 'D',
    name: 'Group D',
    teams: [
      { name: 'USA', flagCode: 'us', confederation: 'CONCACAF', fifaRanking: 11, groupAdvanceProb: 0.60, groupWinProb: 0.35, tournamentWinProb: 0.04 },
      { name: 'Paraguay', flagCode: 'py', confederation: 'CONMEBOL', fifaRanking: 50, groupAdvanceProb: 0.18, groupWinProb: 0.08, tournamentWinProb: 0.002 },
      { name: 'Australia', flagCode: 'au', confederation: 'AFC', fifaRanking: 24, groupAdvanceProb: 0.30, groupWinProb: 0.14, tournamentWinProb: 0.005 },
      { name: 'Euro Playoff C', flagCode: 'eu', confederation: 'UEFA', fifaRanking: 38, groupAdvanceProb: 0.22, groupWinProb: 0.10, tournamentWinProb: 0.003 },
    ],
  },
  {
    id: 'E',
    name: 'Group E',
    teams: [
      { name: 'Germany', flagCode: 'de', confederation: 'UEFA', fifaRanking: 8, groupAdvanceProb: 0.75, groupWinProb: 0.48, tournamentWinProb: 0.07 },
      { name: 'Curaçao', flagCode: 'cw', confederation: 'CONCACAF', fifaRanking: 85, groupAdvanceProb: 0.05, groupWinProb: 0.02, tournamentWinProb: 0.0001 },
      { name: 'Ivory Coast', flagCode: 'ci', confederation: 'CAF', fifaRanking: 38, groupAdvanceProb: 0.30, groupWinProb: 0.14, tournamentWinProb: 0.005 },
      { name: 'Ecuador', flagCode: 'ec', confederation: 'CONMEBOL', fifaRanking: 29, groupAdvanceProb: 0.35, groupWinProb: 0.16, tournamentWinProb: 0.008 },
    ],
  },
  {
    id: 'F',
    name: 'Group F',
    teams: [
      { name: 'Netherlands', flagCode: 'nl', confederation: 'UEFA', fifaRanking: 7, groupAdvanceProb: 0.72, groupWinProb: 0.45, tournamentWinProb: 0.06 },
      { name: 'Japan', flagCode: 'jp', confederation: 'AFC', fifaRanking: 15, groupAdvanceProb: 0.50, groupWinProb: 0.25, tournamentWinProb: 0.02 },
      { name: 'Euro Playoff B', flagCode: 'eu', confederation: 'UEFA', fifaRanking: 36, groupAdvanceProb: 0.18, groupWinProb: 0.08, tournamentWinProb: 0.003 },
      { name: 'Tunisia', flagCode: 'tn', confederation: 'CAF', fifaRanking: 39, groupAdvanceProb: 0.15, groupWinProb: 0.06, tournamentWinProb: 0.002 },
    ],
  },
  {
    id: 'G',
    name: 'Group G',
    teams: [
      { name: 'Belgium', flagCode: 'be', confederation: 'UEFA', fifaRanking: 6, groupAdvanceProb: 0.76, groupWinProb: 0.50, tournamentWinProb: 0.05 },
      { name: 'Egypt', flagCode: 'eg', confederation: 'CAF', fifaRanking: 33, groupAdvanceProb: 0.28, groupWinProb: 0.12, tournamentWinProb: 0.005 },
      { name: 'Iran', flagCode: 'ir', confederation: 'AFC', fifaRanking: 21, groupAdvanceProb: 0.35, groupWinProb: 0.16, tournamentWinProb: 0.005 },
      { name: 'New Zealand', flagCode: 'nz', confederation: 'OFC', fifaRanking: 93, groupAdvanceProb: 0.06, groupWinProb: 0.02, tournamentWinProb: 0.0002 },
    ],
  },
  {
    id: 'H',
    name: 'Group H',
    teams: [
      { name: 'Spain', flagCode: 'es', confederation: 'UEFA', fifaRanking: 1, groupAdvanceProb: 0.84, groupWinProb: 0.60, tournamentWinProb: 0.17 },
      { name: 'Cape Verde', flagCode: 'cv', confederation: 'CAF', fifaRanking: 62, groupAdvanceProb: 0.06, groupWinProb: 0.02, tournamentWinProb: 0.0003 },
      { name: 'Saudi Arabia', flagCode: 'sa', confederation: 'AFC', fifaRanking: 55, groupAdvanceProb: 0.12, groupWinProb: 0.05, tournamentWinProb: 0.001 },
      { name: 'Uruguay', flagCode: 'uy', confederation: 'CONMEBOL', fifaRanking: 10, groupAdvanceProb: 0.55, groupWinProb: 0.28, tournamentWinProb: 0.03 },
    ],
  },
  {
    id: 'I',
    name: 'Group I',
    teams: [
      { name: 'France', flagCode: 'fr', confederation: 'UEFA', fifaRanking: 2, groupAdvanceProb: 0.82, groupWinProb: 0.58, tournamentWinProb: 0.13 },
      { name: 'Senegal', flagCode: 'sn', confederation: 'CAF', fifaRanking: 20, groupAdvanceProb: 0.38, groupWinProb: 0.18, tournamentWinProb: 0.008 },
      { name: 'FIFA Playoff 2', flagCode: 'un', confederation: 'TBD', fifaRanking: 70, groupAdvanceProb: 0.08, groupWinProb: 0.03, tournamentWinProb: 0.0005 },
      { name: 'Norway', flagCode: 'no', confederation: 'UEFA', fifaRanking: 44, groupAdvanceProb: 0.25, groupWinProb: 0.10, tournamentWinProb: 0.005 },
    ],
  },
  {
    id: 'J',
    name: 'Group J',
    teams: [
      { name: 'Argentina', flagCode: 'ar', confederation: 'CONMEBOL', fifaRanking: 3, groupAdvanceProb: 0.79, groupWinProb: 0.55, tournamentWinProb: 0.11 },
      { name: 'Algeria', flagCode: 'dz', confederation: 'CAF', fifaRanking: 37, groupAdvanceProb: 0.22, groupWinProb: 0.09, tournamentWinProb: 0.003 },
      { name: 'Austria', flagCode: 'at', confederation: 'UEFA', fifaRanking: 25, groupAdvanceProb: 0.35, groupWinProb: 0.15, tournamentWinProb: 0.008 },
      { name: 'Jordan', flagCode: 'jo', confederation: 'AFC', fifaRanking: 68, groupAdvanceProb: 0.08, groupWinProb: 0.03, tournamentWinProb: 0.0005 },
    ],
  },
  {
    id: 'K',
    name: 'Group K',
    teams: [
      { name: 'Portugal', flagCode: 'pt', confederation: 'UEFA', fifaRanking: 4, groupAdvanceProb: 0.70, groupWinProb: 0.42, tournamentWinProb: 0.08 },
      { name: 'FIFA Playoff 1', flagCode: 'un', confederation: 'TBD', fifaRanking: 65, groupAdvanceProb: 0.08, groupWinProb: 0.03, tournamentWinProb: 0.0005 },
      { name: 'Uzbekistan', flagCode: 'uz', confederation: 'AFC', fifaRanking: 56, groupAdvanceProb: 0.15, groupWinProb: 0.06, tournamentWinProb: 0.002 },
      { name: 'Colombia', flagCode: 'co', confederation: 'CONMEBOL', fifaRanking: 9, groupAdvanceProb: 0.55, groupWinProb: 0.28, tournamentWinProb: 0.03 },
    ],
  },
  {
    id: 'L',
    name: 'Group L',
    teams: [
      { name: 'England', flagCode: 'gb-eng', confederation: 'UEFA', fifaRanking: 4, groupAdvanceProb: 0.74, groupWinProb: 0.48, tournamentWinProb: 0.14 },
      { name: 'Croatia', flagCode: 'hr', confederation: 'UEFA', fifaRanking: 12, groupAdvanceProb: 0.50, groupWinProb: 0.25, tournamentWinProb: 0.02 },
      { name: 'Ghana', flagCode: 'gh', confederation: 'CAF', fifaRanking: 64, groupAdvanceProb: 0.10, groupWinProb: 0.04, tournamentWinProb: 0.001 },
      { name: 'Panama', flagCode: 'pa', confederation: 'CONCACAF', fifaRanking: 46, groupAdvanceProb: 0.15, groupWinProb: 0.06, tournamentWinProb: 0.002 },
    ],
  },
]

/** Get a specific group by its letter ID */
export function getGroup(groupId: string): Group | undefined {
  return groups.find((g) => g.id === groupId.toUpperCase())
}

/** Get the top tournament favorite from each group */
export function getGroupFavorites(): { group: Group; favorite: Team }[] {
  return groups
    .map((group) => {
      const favorite = [...group.teams].sort(
        (a, b) => b.tournamentWinProb - a.tournamentWinProb
      )[0]
      return { group, favorite }
    })
    .filter((x): x is { group: Group; favorite: Team } => x.favorite != null)
}
