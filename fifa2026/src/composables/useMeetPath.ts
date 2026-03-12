/**
 * Computes how two teams could meet: same group (group stage) or knockout paths.
 */

import { groups } from '../data/groups'
import { ALL_MATCHES } from '../data/bracket'
import type { BracketMatch, BracketSlot } from '../data/bracket'

/** Structured path for highlighting in the UI (country, position, group). */
export interface StructuredPath {
  teamName: string
  groupId: string
  /** winner | runner | third; null if path is impossible */
  role: 'winner' | 'runner' | 'third' | null
  matchIdsAfterR32: number[]
  roundLabel: string
  impossible: boolean
}

export interface MeetScenario {
  matchId: number
  roundLabel: string
  /** Short summary line */
  description: string
  /** Full step-by-step: how team1 gets there (group position + match chain) */
  team1FullPath: string
  /** Full step-by-step: how team2 gets there */
  team2FullPath: string
  /** Structured for UI highlighting */
  team1PathStructured: StructuredPath
  team2PathStructured: StructuredPath
  /** R32 match that team1 would need to win to reach this match (for link) */
  team1PathMatchId: number
  /** R32 match that team2 would need to win to reach this match */
  team2PathMatchId: number
}

export interface MeetPathResult {
  /** If both teams are in the same group */
  sameGroup: string | null
  /** Group stage explanation when sameGroup is set */
  sameGroupExplanation: string | null
  /** Extra note for same-group: they can meet again in knockout/final if both qualify */
  sameGroupKnockoutNote: string | null
  /** Knockout scenarios (R32, R16, QF, SF, F) where they could meet */
  knockoutScenarios: MeetScenario[]
}

const ROUND_LABELS: Record<string, string> = {
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarterfinal',
  SF: 'Semifinal',
  F: 'Final',
  '3P': 'Third Place',
}

/** Map: team name -> group id */
const teamToGroup = new Map<string, string>()
for (const g of groups) {
  for (const t of g.teams) {
    teamToGroup.set(t.name, g.id)
  }
}

export function getGroupIdForTeam(teamName: string): string | null {
  return teamToGroup.get(teamName) ?? null
}

function slotAllowsGroup(slot: BracketSlot, groupId: string): boolean {
  if (slot.type === 'group-winner' || slot.type === 'group-runner') {
    return slot.groupId === groupId
  }
  if (slot.type === 'best-third' && slot.possibleGroups) {
    return slot.possibleGroups.includes(groupId)
  }
  return false
}

/** R32 match has two slots; can a team from this group appear in this match? */
function groupCanReachR32Match(groupId: string, match: BracketMatch): boolean {
  return (
    slotAllowsGroup(match.slot1, groupId) || slotAllowsGroup(match.slot2, groupId)
  )
}

/** For R16+, the two feeder match ids (whose winners feed this match) */
const feedersMap = new Map<number, [number, number]>()
/** For each match id, the match whose winner goes to it (next step up the bracket) */
const nextMatchMap = new Map<number, number>()
for (const m of ALL_MATCHES) {
  if (m.slot1.type === 'match-winner' && m.slot2.type === 'match-winner' && m.slot1.matchId != null && m.slot2.matchId != null) {
    feedersMap.set(m.id, [m.slot1.matchId, m.slot2.matchId])
    nextMatchMap.set(m.slot1.matchId, m.id)
    nextMatchMap.set(m.slot2.matchId, m.id)
  }
}

/** Can a team from this group reach this match (i.e. be in the bracket path to it)? */
function groupCanReachMatch(groupId: string, matchId: number): boolean {
  const match = ALL_MATCHES.find((m) => m.id === matchId)
  if (!match) return false
  if (match.round === 'R32') {
    return groupCanReachR32Match(groupId, match)
  }
  const feeders = feedersMap.get(matchId)
  if (!feeders) return false
  const [f1, f2] = feeders
  return groupCanReachMatch(groupId, f1) || groupCanReachMatch(groupId, f2)
}

/** Knockout rounds where two teams could meet (excludes 3P for "meeting" as a matchup). */
const KNOCKOUT_ROUNDS = ['R32', 'R16', 'QF', 'SF', 'F'] as const

export function getMeetPath(team1Name: string, team2Name: string): MeetPathResult {
  const g1 = getGroupIdForTeam(team1Name)
  const g2 = getGroupIdForTeam(team2Name)

  const result: MeetPathResult = {
    sameGroup: null,
    sameGroupExplanation: null,
    sameGroupKnockoutNote: null,
    knockoutScenarios: [],
  }

  if (!g1 || !g2) return result

  if (g1 === g2) {
    const group = groups.find((gr) => gr.id === g1)
    result.sameGroup = g1
    result.sameGroupExplanation = group
      ? `${team1Name} and ${team2Name} are both in ${group.name}. They will play each other during the group stage (exact match day depends on the schedule).`
      : `Both teams are in Group ${g1} and will meet in the group stage.`
    result.sameGroupKnockoutNote =
      'If both teams advance from the group (as winners, runners-up, or best third-place), they can meet again in the knockout stage—including in the Final or the third-place match—depending on their positions and the bracket paths.'
    return result
  }

  for (const round of KNOCKOUT_ROUNDS) {
    const matchesInRound = ALL_MATCHES.filter((m) => m.round === round)
    for (const match of matchesInRound) {
      if (match.round === 'R32') {
        const bothInMatch =
          groupCanReachR32Match(g1, match) && groupCanReachR32Match(g2, match)
        if (bothInMatch) {
          const team1FullPath = buildFullPath(team1Name, g1, match.id, match.id)
          const team2FullPath = buildFullPath(team2Name, g2, match.id, match.id)
          const roundLabel = ROUND_LABELS[match.round] ?? match.round
          result.knockoutScenarios.push({
            matchId: match.id,
            roundLabel,
            description: `${team1Name} and ${team2Name} could meet in Match ${match.id} (${roundLabel}) if both advance to this fixture from their group positions.`,
            team1FullPath,
            team2FullPath,
            team1PathStructured: getStructuredPath(team1Name, g1, match.id, match.id),
            team2PathStructured: getStructuredPath(team2Name, g2, match.id, match.id),
            team1PathMatchId: match.id,
            team2PathMatchId: match.id,
          })
        }
        continue
      }

      const feeders = feedersMap.get(match.id)
      if (!feeders) continue
      const [f1, f2] = feeders

      const t1ReachesF1 = groupCanReachMatch(g1, f1)
      const t1ReachesF2 = groupCanReachMatch(g1, f2)
      const t2ReachesF1 = groupCanReachMatch(g2, f1)
      const t2ReachesF2 = groupCanReachMatch(g2, f2)

      if (t1ReachesF1 && t2ReachesF2) {
        const r32_1 = getR32ForGroupReaching(g1, f1)
        const r32_2 = getR32ForGroupReaching(g2, f2)
        if (r32_1 != null && r32_2 != null) {
          addScenario(match, team1Name, team2Name, g1, g2, r32_1, r32_2, result)
        }
      }
      if (t1ReachesF2 && t2ReachesF1 && f1 !== f2) {
        const r32_1 = getR32ForGroupReaching(g1, f2)
        const r32_2 = getR32ForGroupReaching(g2, f1)
        if (r32_1 != null && r32_2 != null) {
          addScenario(match, team1Name, team2Name, g1, g2, r32_1, r32_2, result)
        }
      }
    }
  }

  // Dedupe by matchId (same match can appear from both orderings)
  const seen = new Set<number>()
  result.knockoutScenarios = result.knockoutScenarios.filter((s) => {
    if (seen.has(s.matchId)) return false
    seen.add(s.matchId)
    return true
  })

  return result
}

function addScenario(
  match: BracketMatch,
  team1Name: string,
  team2Name: string,
  g1: string,
  g2: string,
  r32A: number,
  r32B: number,
  result: MeetPathResult
): void {
  const roundLabel = ROUND_LABELS[match.round] ?? match.round
  const samePath = r32A === r32B
  const description =
    samePath
      ? `They would meet in Match ${match.id} (${roundLabel}) if both advance to this fixture from their group (e.g. via the same R32 path).`
      : `They would meet in Match ${match.id} (${roundLabel}) if one team wins through Match ${r32A} and the other through Match ${r32B}.`
  const team1FullPath = buildFullPath(team1Name, g1, r32A, match.id)
  const team2FullPath = buildFullPath(team2Name, g2, r32B, match.id)
  result.knockoutScenarios.push({
    matchId: match.id,
    roundLabel,
    description,
    team1FullPath,
    team2FullPath,
    team1PathStructured: getStructuredPath(team1Name, g1, r32A, match.id),
    team2PathStructured: getStructuredPath(team2Name, g2, r32B, match.id),
    team1PathMatchId: r32A,
    team2PathMatchId: r32B,
  })
}

/** R32 match at the start of the path that this group takes to reach the given match. */
function getR32ForGroupReaching(groupId: string, matchId: number): number | null {
  const match = ALL_MATCHES.find((m) => m.id === matchId)
  if (!match) return null
  if (match.round === 'R32') {
    return groupCanReachR32Match(groupId, match) ? matchId : null
  }
  const feeders = feedersMap.get(matchId)
  if (!feeders) return null
  const [f1, f2] = feeders
  return getR32ForGroupReaching(groupId, f1) ?? getR32ForGroupReaching(groupId, f2)
}

/** Chain of match IDs from r32MatchId up to and including targetMatchId. */
function getMatchChain(r32MatchId: number, targetMatchId: number): number[] {
  const chain: number[] = [r32MatchId]
  let current = r32MatchId
  while (current !== targetMatchId) {
    const next = nextMatchMap.get(current)
    if (next == null) return chain
    chain.push(next)
    current = next
  }
  return chain
}

/** How does a team from this group get into this R32 match? */
function getGroupRoleForR32Match(groupId: string, r32Match: BracketMatch): 'winner' | 'runner' | 'third' | null {
  if (slotAllowsGroup(r32Match.slot1, groupId)) {
    if (r32Match.slot1.type === 'group-winner') return 'winner'
    if (r32Match.slot1.type === 'group-runner') return 'runner'
    if (r32Match.slot1.type === 'best-third') return 'third'
  }
  if (slotAllowsGroup(r32Match.slot2, groupId)) {
    if (r32Match.slot2.type === 'group-winner') return 'winner'
    if (r32Match.slot2.type === 'group-runner') return 'runner'
    if (r32Match.slot2.type === 'best-third') return 'third'
  }
  return null
}

function formatGroupRole(role: 'winner' | 'runner' | 'third', groupId: string): string {
  const groupLabel = `Group ${groupId}`
  switch (role) {
    case 'winner':
      return `win ${groupLabel}`
    case 'runner':
      return `finish second in ${groupLabel}`
    case 'third':
      return `finish third in ${groupLabel} and qualify as one of the best third-place teams`
    default:
      return groupLabel
  }
}

function getRoundLabelForMatch(matchId: number): string {
  const m = ALL_MATCHES.find((x) => x.id === matchId)
  return m ? (ROUND_LABELS[m.round] ?? m.round) : 'match'
}

function getStructuredPath(
  teamName: string,
  groupId: string,
  r32MatchId: number,
  targetMatchId: number
): StructuredPath {
  const r32Match = ALL_MATCHES.find((m) => m.id === r32MatchId)
  const roundLabel = getRoundLabelForMatch(targetMatchId)
  if (!r32Match || r32Match.round !== 'R32') {
    return { teamName, groupId, role: null, matchIdsAfterR32: [], roundLabel, impossible: true }
  }
  const role = getGroupRoleForR32Match(groupId, r32Match)
  if (!role) {
    return { teamName, groupId, role: null, matchIdsAfterR32: [], roundLabel, impossible: true }
  }
  const chain = getMatchChain(r32MatchId, targetMatchId)
  const matchIdsAfterR32 = chain.slice(1)
  return { teamName, groupId, role, matchIdsAfterR32, roundLabel, impossible: false }
}

function buildFullPath(
  teamName: string,
  groupId: string,
  r32MatchId: number,
  targetMatchId: number
): string {
  const r32Match = ALL_MATCHES.find((m) => m.id === r32MatchId)
  if (!r32Match || r32Match.round !== 'R32') {
    return `It is not possible for ${teamName} to reach this match from Group ${groupId} given the bracket structure.`
  }
  const role = getGroupRoleForR32Match(groupId, r32Match)
  if (!role) {
    return `It is not possible for ${teamName} to reach this match from Group ${groupId} given the bracket structure.`
  }
  const chain = getMatchChain(r32MatchId, targetMatchId)
  const afterR32 = chain.slice(1)
  const matchList = afterR32.map((id) => `M${id}`).join(', then ')
  const roleText = formatGroupRole(role, groupId)
  if (matchList) {
    const matchWord = afterR32.length === 1 ? 'Match' : 'Matches'
    return `${teamName} would need to ${roleText}, then win ${matchWord} ${matchList} to reach the ${getRoundLabelForMatch(targetMatchId)}.`
  }
  return `${teamName} would need to ${roleText} to reach this match.`
}
