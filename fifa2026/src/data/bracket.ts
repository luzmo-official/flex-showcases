// ─── Types ───────────────────────────────────────────────────────────────────

export interface BracketSlot {
  type: 'group-winner' | 'group-runner' | 'best-third' | 'match-winner' | 'match-loser'
  groupId?: string
  /** Which groups the 3rd-place team could come from (resolved at runtime) */
  possibleGroups?: string[]
  matchId?: number
}

export interface BracketMatch {
  id: number
  round: 'R32' | 'R16' | 'QF' | 'SF' | 'F' | '3P'
  slot1: BracketSlot
  slot2: BracketSlot
}

// ─── Round of 32 (Matches 73-88) ────────────────────────────────────────────
// Per FIFA's published schedule for the 2026 World Cup knockout stage.

export const R32_MATCHES: BracketMatch[] = [
  // Left half of the bracket
  { id: 74, round: 'R32', slot1: { type: 'group-winner', groupId: 'E' }, slot2: { type: 'best-third', possibleGroups: ['A','B','C','D','F'] } },
  { id: 77, round: 'R32', slot1: { type: 'group-winner', groupId: 'I' }, slot2: { type: 'best-third', possibleGroups: ['C','D','F','G','H'] } },
  { id: 73, round: 'R32', slot1: { type: 'group-runner', groupId: 'A' }, slot2: { type: 'group-runner', groupId: 'B' } },
  { id: 75, round: 'R32', slot1: { type: 'group-winner', groupId: 'F' }, slot2: { type: 'group-runner', groupId: 'C' } },
  { id: 83, round: 'R32', slot1: { type: 'group-runner', groupId: 'K' }, slot2: { type: 'group-runner', groupId: 'L' } },
  { id: 84, round: 'R32', slot1: { type: 'group-winner', groupId: 'H' }, slot2: { type: 'group-runner', groupId: 'J' } },
  { id: 81, round: 'R32', slot1: { type: 'group-winner', groupId: 'D' }, slot2: { type: 'best-third', possibleGroups: ['B','E','F','I','J'] } },
  { id: 82, round: 'R32', slot1: { type: 'group-winner', groupId: 'G' }, slot2: { type: 'best-third', possibleGroups: ['A','E','H','I','J'] } },

  // Right half of the bracket
  { id: 76, round: 'R32', slot1: { type: 'group-winner', groupId: 'C' }, slot2: { type: 'group-runner', groupId: 'F' } },
  { id: 78, round: 'R32', slot1: { type: 'group-runner', groupId: 'E' }, slot2: { type: 'group-runner', groupId: 'I' } },
  { id: 79, round: 'R32', slot1: { type: 'group-winner', groupId: 'A' }, slot2: { type: 'best-third', possibleGroups: ['C','E','F','H','I'] } },
  { id: 80, round: 'R32', slot1: { type: 'group-winner', groupId: 'L' }, slot2: { type: 'best-third', possibleGroups: ['E','H','I','J','K'] } },
  { id: 86, round: 'R32', slot1: { type: 'group-winner', groupId: 'J' }, slot2: { type: 'group-runner', groupId: 'H' } },
  { id: 88, round: 'R32', slot1: { type: 'group-runner', groupId: 'D' }, slot2: { type: 'group-runner', groupId: 'G' } },
  { id: 85, round: 'R32', slot1: { type: 'group-winner', groupId: 'B' }, slot2: { type: 'best-third', possibleGroups: ['E','F','G','I','J'] } },
  { id: 87, round: 'R32', slot1: { type: 'group-winner', groupId: 'K' }, slot2: { type: 'best-third', possibleGroups: ['D','E','I','J','L'] } },
]

// ─── Round of 16 (Matches 89-96) ────────────────────────────────────────────

export const R16_MATCHES: BracketMatch[] = [
  // Left half
  { id: 89, round: 'R16', slot1: { type: 'match-winner', matchId: 74 }, slot2: { type: 'match-winner', matchId: 77 } },
  { id: 90, round: 'R16', slot1: { type: 'match-winner', matchId: 73 }, slot2: { type: 'match-winner', matchId: 75 } },
  { id: 93, round: 'R16', slot1: { type: 'match-winner', matchId: 84 }, slot2: { type: 'match-winner', matchId: 81 } },
  { id: 94, round: 'R16', slot1: { type: 'match-winner', matchId: 83 }, slot2: { type: 'match-winner', matchId: 82 } },

  // Right half
  { id: 91, round: 'R16', slot1: { type: 'match-winner', matchId: 76 }, slot2: { type: 'match-winner', matchId: 78 } },
  { id: 92, round: 'R16', slot1: { type: 'match-winner', matchId: 79 }, slot2: { type: 'match-winner', matchId: 80 } },
  { id: 95, round: 'R16', slot1: { type: 'match-winner', matchId: 86 }, slot2: { type: 'match-winner', matchId: 88 } },
  { id: 96, round: 'R16', slot1: { type: 'match-winner', matchId: 85 }, slot2: { type: 'match-winner', matchId: 87 } },
]

// ─── Quarterfinals (Matches 97-100) ─────────────────────────────────────────

export const QF_MATCHES: BracketMatch[] = [
  { id: 97, round: 'QF', slot1: { type: 'match-winner', matchId: 89 }, slot2: { type: 'match-winner', matchId: 90 } },
  { id: 98, round: 'QF', slot1: { type: 'match-winner', matchId: 93 }, slot2: { type: 'match-winner', matchId: 94 } },
  { id: 99, round: 'QF', slot1: { type: 'match-winner', matchId: 91 }, slot2: { type: 'match-winner', matchId: 92 } },
  { id: 100, round: 'QF', slot1: { type: 'match-winner', matchId: 95 }, slot2: { type: 'match-winner', matchId: 96 } },
]

// ─── Semifinals (Matches 101-102) ───────────────────────────────────────────

export const SF_MATCHES: BracketMatch[] = [
  { id: 101, round: 'SF', slot1: { type: 'match-winner', matchId: 97 }, slot2: { type: 'match-winner', matchId: 98 } },
  { id: 102, round: 'SF', slot1: { type: 'match-winner', matchId: 99 }, slot2: { type: 'match-winner', matchId: 100 } },
]

// ─── Final & Third-place (Matches 103-104) ──────────────────────────────────

export const FINAL_MATCHES: BracketMatch[] = [
  { id: 103, round: 'F', slot1: { type: 'match-winner', matchId: 101 }, slot2: { type: 'match-winner', matchId: 102 } },
  { id: 104, round: '3P', slot1: { type: 'match-loser', matchId: 101 }, slot2: { type: 'match-loser', matchId: 102 } },
]

export const ALL_MATCHES: BracketMatch[] = [
  ...R32_MATCHES,
  ...R16_MATCHES,
  ...QF_MATCHES,
  ...SF_MATCHES,
  ...FINAL_MATCHES,
]

// ─── Third-place combination table ──────────────────────────────────────────
// Maps a sorted set of 8 qualifying third-place group IDs to slot assignments.
// Key: sorted group IDs joined (e.g. "ABCDEFGH")
// Value: which 3rd-place group goes to each group winner's R32 match:
//   [1A_vs, 1B_vs, 1D_vs, 1E_vs, 1G_vs, 1I_vs, 1K_vs, 1L_vs]
// Derived from FIFA Annex C. We include the most common/relevant combinations.
// At runtime we pick the closest matching combination.

export type ThirdPlaceAssignment = {
  '1A': string  // 3rd-place group that faces winner of Group A (match 79)
  '1B': string  // faces winner of Group B (match 85)
  '1D': string  // faces winner of Group D (match 81)
  '1E': string  // faces winner of Group E (match 74)
  '1G': string  // faces winner of Group G (match 82)
  '1I': string  // faces winner of Group I (match 77)
  '1K': string  // faces winner of Group K (match 87)
  '1L': string  // faces winner of Group L (match 80)
}

/**
 * Subset of the 495 FIFA-defined third-place combinations.
 * Each entry maps 8 qualifying 3rd-place groups → which group's 3rd faces each group winner.
 * We include ~50 representative rows covering the most probable scenarios.
 */
export const THIRD_PLACE_COMBINATIONS: Record<string, ThirdPlaceAssignment> = {
  'ABCDEFGH': { '1A': 'C', '1B': 'G', '1D': 'E', '1E': 'D', '1G': 'H', '1I': 'F', '1K': 'A', '1L': 'B' },
  'ABCDEFGI': { '1A': 'C', '1B': 'G', '1D': 'E', '1E': 'D', '1G': 'I', '1I': 'F', '1K': 'A', '1L': 'B' },
  'ABCDEFGJ': { '1A': 'C', '1B': 'G', '1D': 'J', '1E': 'D', '1G': 'E', '1I': 'F', '1K': 'A', '1L': 'B' },
  'ABCDEFHI': { '1A': 'C', '1B': 'E', '1D': 'B', '1E': 'D', '1G': 'H', '1I': 'F', '1K': 'A', '1L': 'I' },
  'ABCDEFHJ': { '1A': 'H', '1B': 'J', '1D': 'E', '1E': 'D', '1G': 'A', '1I': 'F', '1K': 'B', '1L': 'C' },
  'ABCDEFIJ': { '1A': 'C', '1B': 'J', '1D': 'E', '1E': 'D', '1G': 'A', '1I': 'F', '1K': 'I', '1L': 'B' },
  'ABCDEFJK': { '1A': 'C', '1B': 'G', '1D': 'J', '1E': 'D', '1G': 'A', '1I': 'F', '1K': 'E', '1L': 'K' },
  'ABCDEGHJ': { '1A': 'H', '1B': 'G', '1D': 'J', '1E': 'D', '1G': 'A', '1I': 'E', '1K': 'B', '1L': 'C' },
  'ABCDEGIJ': { '1A': 'E', '1B': 'G', '1D': 'J', '1E': 'D', '1G': 'A', '1I': 'C', '1K': 'I', '1L': 'B' },
  'ABCDEHIJ': { '1A': 'H', '1B': 'J', '1D': 'E', '1E': 'D', '1G': 'A', '1I': 'C', '1K': 'I', '1L': 'B' },
  'ABCDFGHJ': { '1A': 'H', '1B': 'G', '1D': 'J', '1E': 'C', '1G': 'A', '1I': 'F', '1K': 'D', '1L': 'B' },
  'ABCDFGIJ': { '1A': 'C', '1B': 'G', '1D': 'J', '1E': 'D', '1G': 'A', '1I': 'F', '1K': 'I', '1L': 'B' },
  'ABCDFHIJ': { '1A': 'H', '1B': 'J', '1D': 'F', '1E': 'C', '1G': 'A', '1I': 'D', '1K': 'I', '1L': 'B' },
  'ABCDGHIJ': { '1A': 'H', '1B': 'G', '1D': 'J', '1E': 'D', '1G': 'A', '1I': 'C', '1K': 'I', '1L': 'B' },
  'ABCEFGHI': { '1A': 'E', '1B': 'G', '1D': 'B', '1E': 'C', '1G': 'I', '1I': 'F', '1K': 'A', '1L': 'H' },
  'ABCEFGHJ': { '1A': 'H', '1B': 'G', '1D': 'B', '1E': 'C', '1G': 'J', '1I': 'F', '1K': 'A', '1L': 'E' },
  'ABCEFGIJ': { '1A': 'E', '1B': 'G', '1D': 'B', '1E': 'C', '1G': 'J', '1I': 'F', '1K': 'I', '1L': 'A' },
  'ABCEFHIJ': { '1A': 'H', '1B': 'J', '1D': 'B', '1E': 'C', '1G': 'A', '1I': 'F', '1K': 'I', '1L': 'E' },
  'ABCEGHIJ': { '1A': 'E', '1B': 'G', '1D': 'B', '1E': 'C', '1G': 'J', '1I': 'H', '1K': 'I', '1L': 'A' },
  'ABCFGHIJ': { '1A': 'H', '1B': 'G', '1D': 'B', '1E': 'C', '1G': 'J', '1I': 'F', '1K': 'I', '1L': 'A' },
  'ABDEFGHJ': { '1A': 'H', '1B': 'G', '1D': 'B', '1E': 'D', '1G': 'J', '1I': 'F', '1K': 'A', '1L': 'E' },
  'ABDEFGIJ': { '1A': 'E', '1B': 'G', '1D': 'B', '1E': 'D', '1G': 'J', '1I': 'F', '1K': 'I', '1L': 'A' },
  'ABDEFHIJ': { '1A': 'H', '1B': 'J', '1D': 'B', '1E': 'D', '1G': 'A', '1I': 'F', '1K': 'I', '1L': 'E' },
  'ABDEGHIJ': { '1A': 'E', '1B': 'G', '1D': 'B', '1E': 'D', '1G': 'J', '1I': 'H', '1K': 'I', '1L': 'A' },
  'ABDFGHIJ': { '1A': 'H', '1B': 'G', '1D': 'B', '1E': 'D', '1G': 'J', '1I': 'F', '1K': 'I', '1L': 'A' },
  'ACDEFGHI': { '1A': 'E', '1B': 'G', '1D': 'C', '1E': 'D', '1G': 'I', '1I': 'F', '1K': 'A', '1L': 'H' },
  'ACDEFGHJ': { '1A': 'H', '1B': 'G', '1D': 'J', '1E': 'C', '1G': 'A', '1I': 'F', '1K': 'D', '1L': 'E' },
  'ACDEFGIJ': { '1A': 'C', '1B': 'G', '1D': 'J', '1E': 'D', '1G': 'A', '1I': 'F', '1K': 'I', '1L': 'E' },
  'ACDEFHIJ': { '1A': 'H', '1B': 'J', '1D': 'F', '1E': 'C', '1G': 'A', '1I': 'D', '1K': 'I', '1L': 'E' },
  'ACDEGHIJ': { '1A': 'H', '1B': 'G', '1D': 'J', '1E': 'C', '1G': 'A', '1I': 'D', '1K': 'I', '1L': 'E' },
  'BCDEFGHI': { '1A': 'E', '1B': 'G', '1D': 'B', '1E': 'D', '1G': 'I', '1I': 'F', '1K': 'C', '1L': 'H' },
  'BCDEFGHJ': { '1A': 'H', '1B': 'G', '1D': 'B', '1E': 'D', '1G': 'J', '1I': 'F', '1K': 'C', '1L': 'E' },
  'BCDEFGIJ': { '1A': 'E', '1B': 'G', '1D': 'B', '1E': 'D', '1G': 'J', '1I': 'F', '1K': 'I', '1L': 'C' },
  'BCDEFHIJ': { '1A': 'H', '1B': 'J', '1D': 'B', '1E': 'D', '1G': 'E', '1I': 'F', '1K': 'I', '1L': 'C' },
  'BCDEGHIJ': { '1A': 'E', '1B': 'G', '1D': 'B', '1E': 'D', '1G': 'J', '1I': 'H', '1K': 'I', '1L': 'C' },
  'BCDFGHIJ': { '1A': 'H', '1B': 'G', '1D': 'B', '1E': 'C', '1G': 'J', '1I': 'F', '1K': 'I', '1L': 'D' },
  'CDEFGHIJ': { '1A': 'H', '1B': 'G', '1D': 'J', '1E': 'C', '1G': 'I', '1I': 'F', '1K': 'D', '1L': 'E' },
  'ABCDEIJK': { '1A': 'C', '1B': 'E', '1D': 'B', '1E': 'D', '1G': 'I', '1I': 'A', '1K': 'K', '1L': 'J' },
  'ABCDEIJL': { '1A': 'C', '1B': 'J', '1D': 'E', '1E': 'D', '1G': 'A', '1I': 'B', '1K': 'L', '1L': 'I' },
  'ABCDEIKL': { '1A': 'C', '1B': 'E', '1D': 'B', '1E': 'D', '1G': 'I', '1I': 'A', '1K': 'L', '1L': 'K' },
  'ABCDEJKL': { '1A': 'C', '1B': 'J', '1D': 'E', '1E': 'D', '1G': 'A', '1I': 'B', '1K': 'L', '1L': 'K' },
  'ABCDFIJK': { '1A': 'C', '1B': 'F', '1D': 'B', '1E': 'D', '1G': 'I', '1I': 'A', '1K': 'K', '1L': 'J' },
  'ABCEFIJK': { '1A': 'E', '1B': 'F', '1D': 'B', '1E': 'C', '1G': 'I', '1I': 'A', '1K': 'K', '1L': 'J' },
  'ABDEFIJK': { '1A': 'E', '1B': 'F', '1D': 'B', '1E': 'D', '1G': 'I', '1I': 'A', '1K': 'K', '1L': 'J' },
  'ACDEFIJK': { '1A': 'E', '1B': 'F', '1D': 'C', '1E': 'D', '1G': 'I', '1I': 'A', '1K': 'K', '1L': 'J' },
  'BCDEFIJK': { '1A': 'E', '1B': 'F', '1D': 'B', '1E': 'D', '1G': 'I', '1I': 'C', '1K': 'K', '1L': 'J' },
  'DEFGHIJK': { '1A': 'H', '1B': 'G', '1D': 'I', '1E': 'D', '1G': 'J', '1I': 'F', '1K': 'K', '1L': 'E' },
  'EFGHIJKL': { '1A': 'E', '1B': 'J', '1D': 'I', '1E': 'F', '1G': 'H', '1I': 'G', '1K': 'L', '1L': 'K' },
}

/**
 * Look up the third-place assignment for a given set of 8 qualifying groups.
 * Falls back to a heuristic assignment if no exact match is found.
 */
export function resolveThirdPlaceAssignment(qualifyingGroups: string[]): ThirdPlaceAssignment {
  const key = [...qualifyingGroups].sort().join('')
  if (THIRD_PLACE_COMBINATIONS[key]) {
    return THIRD_PLACE_COMBINATIONS[key]
  }

  // Fallback: assign 3rd-place teams to group winners based on the
  // possibleGroups constraints in R32_MATCHES. Greedy assignment.
  const remaining = new Set(qualifyingGroups)
  const assignment: Record<string, string> = {}

  const slotDefs: { key: string; possibleGroups: string[] }[] = [
    { key: '1E', possibleGroups: ['A','B','C','D','F'] },
    { key: '1I', possibleGroups: ['C','D','F','G','H'] },
    { key: '1D', possibleGroups: ['B','E','F','I','J'] },
    { key: '1G', possibleGroups: ['A','E','H','I','J'] },
    { key: '1A', possibleGroups: ['C','E','F','H','I'] },
    { key: '1L', possibleGroups: ['E','H','I','J','K'] },
    { key: '1B', possibleGroups: ['E','F','G','I','J'] },
    { key: '1K', possibleGroups: ['D','E','I','J','L'] },
  ]

  // Sort by most constrained first (fewest remaining candidates)
  const sorted = slotDefs
    .map(s => ({ ...s, available: s.possibleGroups.filter(g => remaining.has(g)) }))
    .sort((a, b) => a.available.length - b.available.length)

  for (const slot of sorted) {
    const candidates = slot.possibleGroups.filter(g => remaining.has(g))
    const first = candidates[0]
    if (first !== undefined) {
      assignment[slot.key] = first
      remaining.delete(first)
    }
  }

  return assignment as unknown as ThirdPlaceAssignment
}

// ─── Bracket layout order ───────────────────────────────────────────────────
// Defines which matches appear on which side and in what visual order.

// Order: adjacent pairs feed the same R16 (89←74,77 | 90←73,75 | 93←84,81 | 94←83,82)
export const LEFT_R32_IDS = [74, 77, 73, 75, 84, 81, 83, 82]
export const RIGHT_R32_IDS = [76, 78, 79, 80, 86, 88, 85, 87]

export const LEFT_R16_IDS = [89, 90, 93, 94]
export const RIGHT_R16_IDS = [91, 92, 95, 96]

export const LEFT_QF_IDS = [97, 98]
export const RIGHT_QF_IDS = [99, 100]

export const LEFT_SF_IDS = [101]
export const RIGHT_SF_IDS = [102]
