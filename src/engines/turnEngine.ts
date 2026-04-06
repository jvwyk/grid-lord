import type { Region, BlackMarketDeal, ActivePowerUp, TurnResult, RegionOutcome } from '@/types'
import { COST_PER_MW } from '@/data/balanceTables'
import { calculateRiskDelta } from './riskEngine'
import { checkStreak } from './streakEngine'
import { tickPowerups } from './powerupEngine'

export interface TurnEngineInput {
  regions: Region[]
  selectedDeal: BlackMarketDeal | null
  activePowerups: ActivePowerUp[]
  streak: number
  costMult?: number
  riskMult?: number
}

export interface TurnEngineOutput {
  turnResult: TurnResult
  updatedPowerups: ActivePowerUp[]
}

/**
 * Execute the full end-of-turn calculation.
 * Pure function — takes state in, returns results out.
 */
export function executeTurn(input: TurnEngineInput): TurnEngineOutput {
  const { regions, selectedDeal, activePowerups, streak, costMult = 1, riskMult = 1 } = input

  const shieldActive = activePowerups.some((p) => p.effect === 'shield')

  // Revenue from grid supply
  const revenue = regions.reduce(
    (sum, r) => sum + Math.min(r.allocated, r.demand) * r.price,
    0
  )

  // Black market income
  const bmIncome = selectedDeal ? selectedDeal.mw * selectedDeal.price : 0

  // Supply costs (costMult from event effects like Federal Subsidy)
  const totalAllocated = regions.reduce((sum, r) => sum + r.allocated, 0)
  const costs = Math.round(totalAllocated * COST_PER_MW * costMult)

  // Risk (riskMult from event effects like Government Audit)
  let riskDelta = calculateRiskDelta(regions, selectedDeal, shieldActive)
  if (riskMult !== 1) {
    riskDelta = Math.round(riskDelta * riskMult)
  }

  // Streak
  const { streak: newStreak, bonus: streakBonus } = checkStreak(regions, streak)

  // Net profit
  const net = revenue + bmIncome - costs + streakBonus

  // Region outcomes
  const regionOutcomes: RegionOutcome[] = regions.map((r) => {
    const pct = r.demand > 0 ? r.allocated / r.demand : 0
    const outcome: RegionOutcome['outcome'] =
      pct >= 0.85 ? 'Supplied' : pct >= 0.5 ? 'Partial' : 'BLACKOUT'
    return {
      id: r.id,
      name: r.name,
      icon: r.icon,
      priority: r.priority,
      allocated: r.allocated,
      demand: r.demand,
      pct,
      outcome,
    }
  })

  // Tick power-ups
  const updatedPowerups = tickPowerups(activePowerups)

  return {
    turnResult: {
      revenue,
      bmIncome,
      costs,
      net,
      riskDelta,
      regionOutcomes,
      streakBonus,
      newStreak,
    },
    updatedPowerups,
  }
}
