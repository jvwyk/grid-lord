import type { Region } from '@/types'
import {
  STREAK_SUPPLY_THRESHOLD,
  STREAK_MIN_FOR_BONUS,
  STREAK_BONUS_BASE,
} from '@/data/balanceTables'

export interface StreakResult {
  streak: number
  bonus: number
}

/**
 * Check if the supply streak continues and calculate the bonus.
 */
export function checkStreak(
  regions: Region[],
  currentStreak: number
): StreakResult {
  const allSupplied = regions.every(
    (r) => r.demand === 0 || r.allocated >= r.demand * STREAK_SUPPLY_THRESHOLD
  )

  const newStreak = allSupplied ? currentStreak + 1 : 0

  const bonus =
    newStreak >= STREAK_MIN_FOR_BONUS
      ? Math.floor(newStreak * STREAK_BONUS_BASE)
      : 0

  return { streak: newStreak, bonus }
}
