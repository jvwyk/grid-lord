import type { BlackMarketDeal, DealTemplate } from '@/types'

const DEAL_POOL: DealTemplate[] = [
  { buyer: 'Meridian Corp', baseMW: 30, basePrice: 89, baseRisk: 12, desc: 'Off-books corporate data center deal.', tag: 'HIGH MARGIN' },
  { buyer: 'HashRate Mining', baseMW: 50, basePrice: 72, baseRisk: 18, desc: 'Crypto op. Cash upfront, draws attention.', tag: 'VOLATILE' },
  { buyer: "St. Mary's Hospital", baseMW: 20, basePrice: 65, baseRisk: 4, desc: 'Grey-area emergency supply bypass.', tag: 'LOW RISK' },
  { buyer: 'TechVault Data', baseMW: 40, basePrice: 82, baseRisk: 14, desc: 'Underground server farm needs off-grid power.', tag: 'PREMIUM' },
  { buyer: 'Greenfield Labs', baseMW: 25, basePrice: 95, baseRisk: 8, desc: 'Research facility. Discreet, well-funded.', tag: 'RESEARCH' },
  { buyer: 'NightOwl Casino', baseMW: 60, basePrice: 68, baseRisk: 22, desc: 'Unlicensed gambling den. Big draw, big heat.', tag: 'HIGH RISK' },
  { buyer: 'DefenseNet', baseMW: 35, basePrice: 100, baseRisk: 6, desc: 'Classified contract. Premium rates, minimal exposure.', tag: 'CLASSIFIED' },
  { buyer: 'Crypto Collective', baseMW: 45, basePrice: 78, baseRisk: 20, desc: 'Decentralized mining pool. Volatile but lucrative.', tag: 'UNDERGROUND' },
  { buyer: 'City Water Works', baseMW: 15, basePrice: 55, baseRisk: 2, desc: 'Municipal overflow. Barely grey-area.', tag: 'MUNICIPAL' },
  { buyer: 'Darknet Relay', baseMW: 70, basePrice: 62, baseRisk: 25, desc: 'Anonymous routing nodes. Maximum heat.', tag: 'DANGEROUS' },
]

/**
 * Generate 2-3 random deals for a given day.
 * Prices and MW vary ±15%. Later days skew toward higher-risk options.
 */
export function generateDeals(day: number): BlackMarketDeal[] {
  const count = Math.random() < 0.5 ? 2 : 3

  // Shuffle pool and pick `count` unique templates
  const shuffled = [...DEAL_POOL].sort(() => Math.random() - 0.5)
  const picked = shuffled.slice(0, count)

  return picked.map((t, i) => {
    const variance = () => 0.85 + Math.random() * 0.3 // ±15%
    const mw = Math.round(t.baseMW * variance())
    const price = Math.round(t.basePrice * variance())
    // Risk slightly increases in later days
    const riskBoost = Math.floor(day / 10)
    const risk = t.baseRisk + riskBoost

    return {
      id: `bm-${day}-${i}`,
      buyer: t.buyer,
      mw,
      price,
      risk,
      desc: t.desc,
      tag: t.tag,
    }
  })
}
