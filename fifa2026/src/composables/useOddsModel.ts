import type { Team } from '../data/groups'

/**
 * Derives a strength rating from a team's tournament win probability
 * using the logit (log-odds) transform. This maps [0,1] probabilities
 * onto (-inf, +inf), giving a natural "Elo-like" scale.
 *
 * Teams with very low probabilities get a floor to avoid -Infinity.
 */
export function getTeamStrength(team: Team): number {
  const p = Math.max(team.tournamentWinProb, 0.0001)
  return Math.log(p / (1 - p))
}

/**
 * Head-to-head win probability using the Bradley-Terry model.
 * Given two strength ratings s_A and s_B:
 *   P(A wins) = 1 / (1 + e^(s_B - s_A))
 */
export function getHeadToHeadOdds(
  teamA: Team,
  teamB: Team
): { winA: number; winB: number } {
  const sA = getTeamStrength(teamA)
  const sB = getTeamStrength(teamB)
  const winA = 1 / (1 + Math.exp(sB - sA))
  return { winA, winB: 1 - winA }
}
