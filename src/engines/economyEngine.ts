import type { Region } from '@/types'
import {
  DEMAND_FLUCTUATION_MIN,
  DEMAND_FLUCTUATION_MAX,
  PRICE_FLUCTUATION_MIN,
  PRICE_FLUCTUATION_MAX,
  STABILITY_GAIN,
  STABILITY_LOSS,
  STABILITY_SUPPLY_THRESHOLD,
  DEMAND_GROWTH_PER_DAY,
  STABILITY_LOW_VOLATILITY_THRESHOLD,
} from '@/data/balanceTables'
import { clamp } from '@/utils/format'

/**
 * Recalculate region prices, demand, and stability for the next day.
 * Called during nextDay transition.
 */
export function recalculatePrices(
  regions: Region[],
  priceLock: boolean,
  _day: number = 1
): Region[] {
  return regions.map((r) => {
    // Demand volatility doubles when stability is low
    const volatilityMult = r.stability < STABILITY_LOW_VOLATILITY_THRESHOLD ? 2.0 : 1.0
    const demandRange = (DEMAND_FLUCTUATION_MAX - DEMAND_FLUCTUATION_MIN) * volatilityMult
    const demandCenter = (DEMAND_FLUCTUATION_MAX + DEMAND_FLUCTUATION_MIN) / 2
    const randomFactor = demandCenter - demandRange / 2 + Math.random() * demandRange

    // Incremental demand growth each day (+flat MW per region)
    const newDemand = Math.max(20, Math.round(r.demand * randomFactor + DEMAND_GROWTH_PER_DAY))

    // Stability affects prices: low stability → lower prices (customers leaving)
    const stabilityPriceMult = 0.7 + (r.stability / 100) * 0.6
    const priceRange = PRICE_FLUCTUATION_MAX - PRICE_FLUCTUATION_MIN
    const randomPriceFactor = PRICE_FLUCTUATION_MIN + Math.random() * priceRange
    const newPrice = priceLock
      ? r.price
      : Math.max(10, Math.round(r.price * randomPriceFactor * stabilityPriceMult))

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
