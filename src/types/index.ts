// ── Priority types ──
export type Priority = 'hospital' | 'residential' | 'industrial' | 'commercial'
export type Severity = 'critical' | 'danger' | 'warning' | 'good'
export type PowerUpEffect = 'surge' | 'shield' | 'intel' | 'lobby' | 'pricelock' | 'reserve'
export type SheetType = 'storage' | 'blackmarket' | 'powerups' | 'result' | 'event' | 'gameover' | 'victory' | null

// ── Region ──
export interface Region {
  id: string
  name: string
  demand: number
  price: number
  priority: Priority
  stability: number
  icon: string
  popK: number
  trait: string
  allocated: number
}

// ── Events ──
export interface EventMechanical {
  region?: string
  demandMult?: number
  supplyMult?: number
  duration?: number
  riskMult?: number
  drainStorage?: boolean
  costMult?: number
  allDemandMult?: number
  bonusSupply?: number
  riskAdd?: number
  blackoutRisk?: number
}

export interface GameEvent {
  id: string
  title: string
  desc: string
  icon: string
  severity: Severity
  effect: string
  mechanical: EventMechanical
}

// ── Black Market ──
export interface BlackMarketDeal {
  id: string
  buyer: string
  mw: number
  price: number
  risk: number
  desc: string
  tag: string
}

// ── Power-Ups ──
export interface PowerUp {
  id: string
  name: string
  desc: string
  icon: string
  cost: number
  duration: number
  effect: PowerUpEffect
  color: string
}

export interface ActivePowerUp extends PowerUp {
  turnsLeft: number
}

// ── Turn results ──
export interface RegionOutcome {
  id: string
  name: string
  icon: string
  priority: Priority
  allocated: number
  demand: number
  pct: number
  outcome: 'Supplied' | 'Partial' | 'BLACKOUT'
}

export interface TurnResult {
  revenue: number
  bmIncome: number
  costs: number
  net: number
  riskDelta: number
  regionOutcomes: RegionOutcome[]
  streakBonus: number
  newStreak: number
}

// ── Active Effects (from events) ──
export type EffectKind = 'supplyMult' | 'riskMult' | 'costMult'

export interface ActiveEffect {
  kind: EffectKind
  value: number
  turnsLeft: number
}

// ── Toast ──
export interface Toast {
  id: number
  msg: string
  color: string
}

// ── Game State ──
export interface GameState {
  day: number
  money: number
  risk: number
  stored: number
  regions: Region[]
  selectedDeal: string | null
  expandedRegion: string | null
  sheet: SheetType
  turnData: TurnResult | null
  currentEvent: GameEvent | null
  menuOpen: boolean
  activePowerups: ActivePowerUp[]
  activeEffects: ActiveEffect[]
  availableDeals: BlackMarketDeal[]
  completedMilestones: string[]
  streak: number
  totalProfit: number
  toasts: Toast[]
}

// ── Persistence ──
export interface SavedGame {
  state: Omit<GameState, 'toasts' | 'sheet' | 'expandedRegion' | 'menuOpen'>
  savedAt: number
}

// ── Deal Templates ──
export interface DealTemplate {
  buyer: string
  baseMW: number
  basePrice: number
  baseRisk: number
  desc: string
  tag: string
}

export interface RunRecord {
  id: string
  date: string
  result: 'victory' | 'gameover' | 'abandoned'
  day: number
  money: number
  totalProfit: number
  risk: number
  bestStreak: number
  score: number
}

export interface CareerData {
  runs: RunRecord[]
  bestScore: number
  bestProfit: number
  bestStreak: number
  totalRuns: number
  victories: number
}
