import { describe, it, expect } from 'vitest'
import { getTeamStrength, getHeadToHeadOdds } from './useOddsModel'
import type { Team } from '@/types'

const mockTeam = (overrides: Partial<Team> = {}): Team =>
  ({
    name: 'Team',
    flagCode: 'xx',
    confederation: 'UEFA',
    fifaRanking: 1,
    groupAdvanceProb: 0.5,
    groupWinProb: 0.5,
    tournamentWinProb: 0.5,
    ...overrides,
  }) as Team

describe('useOddsModel', () => {
  describe('getTeamStrength', () => {
    it('maps high probability to positive strength', () => {
      const t = mockTeam({ tournamentWinProb: 0.9 })
      expect(getTeamStrength(t)).toBeGreaterThan(0)
    })

    it('maps low probability to negative strength', () => {
      const t = mockTeam({ tournamentWinProb: 0.1 })
      expect(getTeamStrength(t)).toBeLessThan(0)
    })

    it('maps 0.5 probability to zero strength', () => {
      const t = mockTeam({ tournamentWinProb: 0.5 })
      expect(getTeamStrength(t)).toBeCloseTo(0, 5)
    })

    it('floors very low probability to avoid -Infinity', () => {
      const t = mockTeam({ tournamentWinProb: 0 })
      expect(Number.isFinite(getTeamStrength(t))).toBe(true)
    })
  })

  describe('getHeadToHeadOdds', () => {
    it('returns probabilities that sum to 1', () => {
      const a = mockTeam({ tournamentWinProb: 0.6 })
      const b = mockTeam({ tournamentWinProb: 0.4 })
      const { winA, winB } = getHeadToHeadOdds(a, b)
      expect(winA + winB).toBeCloseTo(1, 10)
    })

    it('favors stronger team (higher tournament win prob)', () => {
      const strong = mockTeam({ tournamentWinProb: 0.8 })
      const weak = mockTeam({ tournamentWinProb: 0.2 })
      const { winA, winB } = getHeadToHeadOdds(strong, weak)
      expect(winA).toBeGreaterThan(winB)
    })

    it('gives equal odds when strengths are equal', () => {
      const a = mockTeam({ tournamentWinProb: 0.5 })
      const b = mockTeam({ tournamentWinProb: 0.5 })
      const { winA, winB } = getHeadToHeadOdds(a, b)
      expect(winA).toBeCloseTo(0.5, 10)
      expect(winB).toBeCloseTo(0.5, 10)
    })
  })
})
