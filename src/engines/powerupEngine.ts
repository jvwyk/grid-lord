import type { ActivePowerUp } from '@/types'

/**
 * Tick all active power-ups down by 1 turn and remove expired ones.
 */
export function tickPowerups(active: ActivePowerUp[]): ActivePowerUp[] {
  return active
    .map((p) => ({ ...p, turnsLeft: p.turnsLeft - 1 }))
    .filter((p) => p.turnsLeft > 0)
}
