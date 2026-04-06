// ── Core constants ──
export const BASE_GENERATION = 280
export const STORAGE_MAX = 80
export const COST_PER_MW = 12
export const MAX_DAYS = 30

// ── Starting state ──
export const STARTING_MONEY = 12_400
export const STARTING_RISK = 34
export const STARTING_STORED = 40

// ── Risk thresholds ──
export const RISK_GAME_OVER = 95
export const RISK_LOW = 30
export const RISK_MEDIUM = 55
export const RISK_HIGH = 75

// ── Risk modifiers ──
export const RISK_DECAY_PER_TURN = 3
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

// ── Events ──
export const EVENT_CHANCE = 0.45

// ── Surge power-up ──
export const SURGE_BONUS_MW = 50
