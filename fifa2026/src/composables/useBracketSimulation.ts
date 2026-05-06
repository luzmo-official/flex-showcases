import { computed, type Ref } from 'vue'
import { groups, type Team } from '../data/groups'
import {
  ALL_MATCHES,
  resolveThirdPlaceAssignment,
  type BracketMatch,
  type ThirdPlaceAssignment,
} from '../data/bracket'
import { getHeadToHeadOdds } from './useOddsModel'

/**
 * Bracket simulation: resolves which teams fill each knockout slot and their win probabilities.
 *
 * How it works:
 * 1. Resolve group outcomes (winner, runner-up, 3rd, 4th) from odds or custom rankings.
 * 2. Determine which 8 third-place teams qualify and assign them to R32 slots via THIRD_PLACE_COMBINATIONS.
 * 3. Walk the bracket from R32 → Final, filling slots with resolved teams and computing head-to-head odds.
 */

// ─── Resolved types ─────────────────────────────────────────────────────────

export interface ResolvedMatch {
  id: number
  round: BracketMatch['round']
  team1: Team | null
  team2: Team | null
  winProb1: number
  winProb2: number
  projectedWinner: Team | null
}

export interface GroupOutcome {
  groupId: string
  winner: Team
  runnerUp: Team
  third: Team
  fourth: Team
}

/**
 * Custom group rankings: maps groupId → ordered array of team names
 * (index 0 = 1st place, index 3 = 4th place).
 */
export type CustomGroupRankings = Record<string, string[]>

/**
 * Ordered list of group IDs whose 3rd-place team qualifies.
 * First 8 entries qualify; the rest are eliminated.
 */
export type CustomThirdPlaceOrder = string[]

export interface BracketCustomisation {
  groupRankings?: CustomGroupRankings
  thirdPlaceOrder?: CustomThirdPlaceOrder
}

// ─── Group resolution ───────────────────────────────────────────────────────

function resolveGroups(customRankings?: CustomGroupRankings): GroupOutcome[] {
  return groups.map(g => {
    const ranking = customRankings?.[g.id]
      if (ranking?.length === 4) {
      const teamMap = new Map(g.teams.map(t => [t.name, t]))
      const ordered = ranking
          .map((name) => teamMap.get(name))
          .filter((t): t is Team => t != null)
      if (ordered.length === 4) {
        const [winner, runnerUp, third, fourth] = ordered
        if (winner && runnerUp && third && fourth) {
          return {
            groupId: g.id,
            winner,
            runnerUp,
            third,
            fourth,
          }
        }
      }
    }

    const sorted = [...g.teams].sort((a, b) => {
      if (b.groupWinProb !== a.groupWinProb) return b.groupWinProb - a.groupWinProb
      if (b.groupAdvanceProb !== a.groupAdvanceProb) return b.groupAdvanceProb - a.groupAdvanceProb
      return a.fifaRanking - b.fifaRanking
    })
    return {
      groupId: g.id,
      winner: sorted[0]!,
      runnerUp: sorted[1]!,
      third: sorted[2]!,
      fourth: sorted[3]!,
    }
  })
}

/** Get the default (probability-based) group outcomes */
export function getDefaultGroupRankings(): CustomGroupRankings {
  const rankings: CustomGroupRankings = {}
  for (const g of groups) {
    const sorted = [...g.teams].sort((a, b) => {
      if (b.groupWinProb !== a.groupWinProb) return b.groupWinProb - a.groupWinProb
      if (b.groupAdvanceProb !== a.groupAdvanceProb) return b.groupAdvanceProb - a.groupAdvanceProb
      return a.fifaRanking - b.fifaRanking
    })
    rankings[g.id] = sorted.map(t => t.name)
  }
  return rankings
}

/** Get the default third-place qualifying order (by groupAdvanceProb of 3rd-place team) */
export function getDefaultThirdPlaceOrder(outcomes?: GroupOutcome[]): CustomThirdPlaceOrder {
  const oc = outcomes ?? resolveGroups()
  const thirds = oc.map(o => ({
    groupId: o.groupId,
    score: o.third.groupAdvanceProb,
  }))
  thirds.sort((a, b) => b.score - a.score)
  return thirds.map(t => t.groupId)
}

// ─── Third-place qualification ──────────────────────────────────────────────

function qualifyThirdPlaceTeams(
  outcomes: GroupOutcome[],
  customOrder?: CustomThirdPlaceOrder,
): { qualifyingGroups: string[]; thirdPlaceTeams: Map<string, Team> } {
  let orderedGroupIds: string[]

  if (customOrder && customOrder.length === 12) {
    orderedGroupIds = customOrder
  } else {
    const thirds = outcomes.map(o => ({
      groupId: o.groupId,
      score: o.third.groupAdvanceProb,
    }))
    thirds.sort((a, b) => b.score - a.score)
    orderedGroupIds = thirds.map(t => t.groupId)
  }

  const top8 = orderedGroupIds.slice(0, 8)
  const thirdPlaceTeams = new Map<string, Team>()
  for (const gId of top8) {
    const o = outcomes.find(x => x.groupId === gId)
    if (o) thirdPlaceTeams.set(gId, o.third)
  }

  return { qualifyingGroups: top8, thirdPlaceTeams }
}

// ─── Team lookup helpers ────────────────────────────────────────────────────

function getTeamForSlot(
  slot: BracketMatch['slot1'],
  outcomes: GroupOutcome[],
  assignment: ThirdPlaceAssignment,
  resolvedMatches: Map<number, ResolvedMatch>,
  thirdPlaceTeams: Map<string, Team>,
): Team | null {
  switch (slot.type) {
    case 'group-winner': {
      const o = outcomes.find(x => x.groupId === slot.groupId)
      return o?.winner ?? null
    }
    case 'group-runner': {
      const o = outcomes.find(x => x.groupId === slot.groupId)
      return o?.runnerUp ?? null
    }
    case 'best-third': {
      const matchSlotKey = findGroupWinnerKey(slot)
      if (matchSlotKey) {
        const assignedGroup = assignment[matchSlotKey as keyof ThirdPlaceAssignment]
        if (assignedGroup) {
          return thirdPlaceTeams.get(assignedGroup) ?? null
        }
      }
      return null
    }
    case 'match-winner': {
      const prev = resolvedMatches.get(slot.matchId!)
      return prev?.projectedWinner ?? null
    }
    case 'match-loser': {
      const prev = resolvedMatches.get(slot.matchId!)
      if (!prev?.team1 || !prev?.team2 || !prev.projectedWinner) return null
      return prev.projectedWinner === prev.team1 ? prev.team2 : prev.team1
    }
  }
}

function findGroupWinnerKey(
  slot: BracketMatch['slot1'],
): string | null {
  if (slot.type !== 'best-third' || !slot.possibleGroups) return null

  const patterns: Record<string, string> = {
    'A,B,C,D,F': '1E',
    'C,D,F,G,H': '1I',
    'B,E,F,I,J': '1D',
    'A,E,H,I,J': '1G',
    'C,E,F,H,I': '1A',
    'E,H,I,J,K': '1L',
    'E,F,G,I,J': '1B',
    'D,E,I,J,L': '1K',
  }

  const key = [...slot.possibleGroups].sort().join(',')
  return patterns[key] ?? null
}

// ─── Full bracket simulation ────────────────────────────────────────────────

export function simulateBracket(custom?: BracketCustomisation): {
  matches: ResolvedMatch[]
  outcomes: GroupOutcome[]
} {
  const outcomes = resolveGroups(custom?.groupRankings)
  const { qualifyingGroups, thirdPlaceTeams } = qualifyThirdPlaceTeams(outcomes, custom?.thirdPlaceOrder)
  const assignment = resolveThirdPlaceAssignment(qualifyingGroups)

  const resolvedMatches = new Map<number, ResolvedMatch>()

  const roundOrder: BracketMatch['round'][] = ['R32', 'R16', 'QF', 'SF', 'F', '3P']

  for (const round of roundOrder) {
    const matchesInRound = ALL_MATCHES.filter(m => m.round === round)

    for (const match of matchesInRound) {
      const team1 = getTeamForSlot(match.slot1, outcomes, assignment, resolvedMatches, thirdPlaceTeams)
      const team2 = getTeamForSlot(match.slot2, outcomes, assignment, resolvedMatches, thirdPlaceTeams)

      let winProb1 = 0.5
      let winProb2 = 0.5
      let projectedWinner: Team | null = null

      if (team1 && team2) {
        const odds = getHeadToHeadOdds(team1, team2)
        winProb1 = odds.winA
        winProb2 = odds.winB
        projectedWinner = winProb1 >= winProb2 ? team1 : team2
      } else if (team1) {
        winProb1 = 1
        winProb2 = 0
        projectedWinner = team1
      } else if (team2) {
        winProb1 = 0
        winProb2 = 1
        projectedWinner = team2
      }

      const resolved: ResolvedMatch = {
        id: match.id,
        round: match.round,
        team1,
        team2,
        winProb1,
        winProb2,
        projectedWinner,
      }
      resolvedMatches.set(match.id, resolved)
    }
  }

  return {
    matches: Array.from(resolvedMatches.values()),
    outcomes,
  }
}

// ─── Composable ─────────────────────────────────────────────────────────────

export function useBracketSimulation(custom?: Ref<BracketCustomisation | undefined>) {
  const simulation = computed(() => simulateBracket(custom?.value))

  const resolvedMatches = computed(() => simulation.value.matches)
  const groupOutcomes = computed(() => simulation.value.outcomes)

  const matchById = computed(() => {
    const map = new Map<number, ResolvedMatch>()
    for (const m of resolvedMatches.value) {
      map.set(m.id, m)
    }
    return map
  })

  function getMatch(id: number): ResolvedMatch | undefined {
    return matchById.value.get(id)
  }

  return {
    resolvedMatches,
    groupOutcomes,
    getMatch,
  }
}
