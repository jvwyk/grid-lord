import type { Region, BlackMarketDeal } from '@/types'
import {
  BLACKOUT_THRESHOLD,
  BLACKOUT_PENALTY_HOSPITAL,
  BLACKOUT_PENALTY_RESIDENTIAL,
  BLACKOUT_PENALTY_OTHER,
  RISK_DECAY_PER_TURN,
  SHIELD_RISK_MULTIPLIER,
  STABILITY_UNREST_THRESHOLD,
  STABILITY_UNREST_RISK,
} from '@/data/balanceTables'

/**
 * Calculate the risk delta for the current turn.
 * Pure function — no side effects.
 */
export function calculateRiskDelta(
  regions: Region[],
  deal: BlackMarketDeal | null,
  shieldActive: boolean
): number {
  const blackouts = regions.filter(
    (r) => r.demand > 0 && r.allocated < r.demand * BLACKOUT_THRESHOLD
  )

  const blackoutPenalty = blackouts.reduce((sum, r) => {
    if (r.priority === 'hospital') return sum + BLACKOUT_PENALTY_HOSPITAL
    if (r.priority === 'residential') return sum + BLACKOUT_PENALTY_RESIDENTIAL
    return sum + BLACKOUT_PENALTY_OTHER
  }, 0)

  const dealRisk = deal ? deal.risk : 0

  // Unrest penalty: regions with very low stability add risk
  const unrestPenalty = regions.filter(
    (r) => r.stability < STABILITY_UNREST_THRESHOLD
  ).length * STABILITY_UNREST_RISK

  let delta = blackoutPenalty + dealRisk + unrestPenalty - RISK_DECAY_PER_TURN

  if (shieldActive) {
    delta = Math.round(delta * SHIELD_RISK_MULTIPLIER)
  }

  return delta
}
