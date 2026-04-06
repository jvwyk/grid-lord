import type { Region } from '@/types'
import {
  DEMAND_FLUCTUATION_MIN,
  DEMAND_FLUCTUATION_MAX,
  PRICE_FLUCTUATION_MIN,
  PRICE_FLUCTUATION_MAX,
  STABILITY_GAIN,
  STABILITY_LOSS,
  STABILITY_SUPPLY_THRESHOLD,
} from '@/data/balanceTables'
import { clamp } from '@/utils/format'

/**
 * Recalculate region prices, demand, and stability for the next day.
 * Called during nextDay transition.
 */
export function recalculatePrices(
  regions: Region[],
  priceLock: boolean
): Region[] {
  return regions.map((r) => {
    const demandRange = DEMAND_FLUCTUATION_MAX - DEMAND_FLUCTUATION_MIN
    const newDemand = Math.round(
      r.demand * (DEMAND_FLUCTUATION_MIN + Math.random() * demandRange)
    )

    const priceRange = PRICE_FLUCTUATION_MAX - PRICE_FLUCTUATION_MIN
    const newPrice = priceLock
      ? r.price
      : Math.round(r.price * (PRICE_FLUCTUATION_MIN + Math.random() * priceRange))

    const supplyRatio = r.demand > 0 ? r.allocated / r.demand : 0
    const stabilityDelta =
      supplyRatio >= STABILITY_SUPPLY_THRESHOLD ? STABILITY_GAIN : STABILITY_LOSS
    const newStability = clamp(r.stability + stabilityDelta, 0, 100)

    return {
      ...r,
      demand: newDemand,
      price: newPrice,
      stability: newStability,
      allocated: 0,
    }
  })
}
