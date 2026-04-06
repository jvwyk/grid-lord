import type { BlackMarketDeal } from '@/types'

export const BLACK_MARKET_DEALS: BlackMarketDeal[] = [
  {
    id: 'bm1',
    buyer: 'Meridian Corp',
    mw: 30,
    price: 89,
    risk: 12,
    desc: 'Off-books corporate data center deal.',
    tag: 'HIGH MARGIN',
  },
  {
    id: 'bm2',
    buyer: 'HashRate Mining',
    mw: 50,
    price: 72,
    risk: 18,
    desc: 'Crypto op. Cash upfront, draws attention.',
    tag: 'VOLATILE',
  },
  {
    id: 'bm3',
    buyer: "St. Mary's Hospital",
    mw: 20,
    price: 65,
    risk: 4,
    desc: 'Grey-area emergency supply bypass.',
    tag: 'LOW RISK',
  },
]
