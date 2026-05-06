/**
 * Shared types for the World Cup 2026 Analytics Explorer.
 * Re-exports from data layer for consistent imports (e.g. `import type { Team } from '@/types'`).
 */

export type { Team, Group } from '../data/groups'
export type {
  BracketSlot,
  BracketMatch,
  ThirdPlaceAssignment,
} from '../data/bracket'
