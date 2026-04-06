import type { GameState } from '@/types'

export interface Milestone {
  id: string
  day: number
  label: string
  check: (state: GameState) => boolean
  reward: { money?: number; risk?: number; desc: string }
}

export const MILESTONES: Milestone[] = [
  {
    id: 'm1',
    day: 5,
    label: 'Day 5 with $15K+',
    check: (s) => s.money >= 15000,
    reward: { money: 3000, desc: '+$3,000 bonus' },
  },
  {
    id: 'm2',
    day: 10,
    label: 'Day 10 with risk < 50%',
    check: (s) => s.risk < 50,
    reward: { risk: -10, desc: '-10% risk' },
  },
  {
    id: 'm3',
    day: 15,
    label: 'Day 15 with 5+ streak',
    check: (s) => s.streak >= 5,
    reward: { money: 5000, desc: '+$5,000 bonus' },
  },
  {
    id: 'm4',
    day: 20,
    label: 'Day 20 with $40K+',
    check: (s) => s.money >= 40000,
    reward: { money: 8000, desc: '+$8,000 bonus' },
  },
  {
    id: 'm5',
    day: 25,
    label: 'Day 25 all regions stable',
    check: (s) => s.regions.every((r) => r.stability >= 60),
    reward: { risk: -15, desc: '-15% risk' },
  },
]
