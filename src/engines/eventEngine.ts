import type { GameEvent } from '@/types'
import { EVENTS_POOL } from '@/data/events'
import { EVENT_CHANCE } from '@/data/balanceTables'
import { pick } from '@/utils/random'

/**
 * Roll for a random event. Returns null if no event triggers.
 */
export function rollEvent(chance: number = EVENT_CHANCE): GameEvent | null {
  if (Math.random() >= chance) return null
  return pick(EVENTS_POOL)
}
