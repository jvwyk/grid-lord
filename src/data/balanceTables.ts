// ── Core constants ──
export const BASE_GENERATION = 280
export const STORAGE_MAX = 80
export const COST_PER_MW = 14                     // was 12 — tighter margins
export const MAX_DAYS = 30

// ── Starting state ──
export const STARTING_MONEY = 8_000               // was 12,400 — tighter start
export const STARTING_RISK = 20                    // was 34 — more headroom but costs grow
export const STARTING_STORED = 40

// ── Risk thresholds ──
export const RISK_GAME_OVER = 95
export const RISK_LOW = 30
export const RISK_MEDIUM = 55
export const RISK_HIGH = 75

// ── Risk modifiers ──
export const RISK_DECAY_PER_TURN = 2              // was 3 — slower recovery
export const SHIELD_RISK_MULTIPLIER = 0.5
export const LOBBY_RISK_REDUCTION = 15

// ── Blackout penalties ──
export const BLACKOUT_THRESHOLD = 0.5
export const BLACKOUT_PENALTY_HOSPITAL = 15
export const BLACKOUT_PENALTY_RESIDENTIAL = 8
export const BLACKOUT_PENALTY_OTHER = 4

// ── Streak system ──
export const STREAK_SUPPLY_THRESHOLD = 0.85
export const STREAK_MIN_FOR_BONUS = 3
export const STREAK_BONUS_BASE = 200
export const STREAK_BONUS_ELEVATED = 350
export const STREAK_ELEVATED_THRESHOLD = 5

// ── Economy ──
export const DEMAND_FLUCTUATION_MIN = 0.93
export const DEMAND_FLUCTUATION_MAX = 1.07
export const PRICE_FLUCTUATION_MIN = 0.92
export const PRICE_FLUCTUATION_MAX = 1.08
export const STABILITY_GAIN = 3
export const STABILITY_LOSS = -4
export const STABILITY_SUPPLY_THRESHOLD = 0.7

// ── Demand escalation ──
export const DEMAND_GROWTH_PER_DAY = 3            // +3 MW per region per day (×4 regions = +12 MW/day total)

// ── Stability consequences ──
export const STABILITY_UNREST_THRESHOLD = 30      // below this: +risk per turn
export const STABILITY_UNREST_RISK = 2            // per unstable region per turn
export const STABILITY_LOW_VOLATILITY_THRESHOLD = 40  // below this: demand swings double

// ── Operating costs ──
export const DAILY_COST_BASE = 2000               // $2,000 base daily overhead
export const DAILY_COST_ESCALATION = 200           // +$200 per day
export const DEBT_RISK_PENALTY = 5                 // +5% risk when in debt

// ── Events ──
export const EVENT_CHANCE = 0.45

// ── Surge power-up ──
export const SURGE_BONUS_MW = 50
