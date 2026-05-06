import { describe, it, expect } from 'vitest'
import { getMeetPath, getGroupIdForTeam } from './useMeetPath'

describe('useMeetPath', () => {
  describe('getGroupIdForTeam', () => {
    it('returns group id for a known team', () => {
      expect(getGroupIdForTeam('Brazil')).toBe('C')
      expect(getGroupIdForTeam('Mexico')).toBe('A')
    })

    it('returns null for unknown team', () => {
      expect(getGroupIdForTeam('Unknown Team')).toBeNull()
    })
  })

  describe('getMeetPath', () => {
    it('returns sameGroup when both teams are in the same group', () => {
      const result = getMeetPath('Mexico', 'South Korea')
      expect(result.sameGroup).toBe('A')
      expect(result.sameGroupExplanation).toBeTruthy()
      expect(result.sameGroupKnockoutNote).toBeTruthy()
    })

    it('returns no sameGroup when teams are in different groups', () => {
      const result = getMeetPath('Brazil', 'Argentina')
      expect(result.sameGroup).toBeNull()
      expect(result.sameGroupExplanation).toBeNull()
    })

    it('returns knockout scenarios for different-group teams', () => {
      const result = getMeetPath('Brazil', 'Argentina')
      expect(Array.isArray(result.knockoutScenarios)).toBe(true)
      result.knockoutScenarios.forEach((s) => {
        expect(s.matchId).toBeGreaterThan(0)
        expect(s.roundLabel).toBeTruthy()
        expect(s.team1FullPath).toBeTruthy()
        expect(s.team2FullPath).toBeTruthy()
        expect(s.team1PathStructured).toBeDefined()
        expect(s.team2PathStructured).toBeDefined()
      })
    })

    it('returns empty result when team name is unknown', () => {
      const result = getMeetPath('Unknown', 'Brazil')
      expect(result.sameGroup).toBeNull()
      expect(result.knockoutScenarios).toEqual([])
    })
  })
})
