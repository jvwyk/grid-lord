import { create } from 'zustand'
import type { GameState, PowerUp, ActivePowerUp, ActiveEffect, Toast, SheetType, SavedGame, GameEvent } from '@/types'
import { REGIONS_INIT } from '@/data/regions'
// BLACK_MARKET_DEALS no longer imported — deals are generated dynamically
import {
  BASE_GENERATION,
  STORAGE_MAX,
  STARTING_MONEY,
  STARTING_RISK,
  STARTING_STORED,
  MAX_DAYS,
  RISK_GAME_OVER,
  SURGE_BONUS_MW,
  LOBBY_RISK_REDUCTION,
  DAILY_COST_BASE,
  DAILY_COST_ESCALATION,
  DEBT_RISK_PENALTY,
} from '@/data/balanceTables'
import { generateDeals } from '@/engines/dealEngine'
import { MILESTONES } from '@/data/milestones'
import { clamp } from '@/utils/format'
import { executeTurn } from '@/engines/turnEngine'
import { recalculatePrices } from '@/engines/economyEngine'
import { rollEvent } from '@/engines/eventEngine'

function freshState(): GameState {
  return {
    day: 1,
    money: STARTING_MONEY,
    risk: STARTING_RISK,
    stored: STARTING_STORED,
    regions: REGIONS_INIT.map((r) => ({ ...r, allocated: 0 })),
    selectedDeal: null,
    expandedRegion: null,
    sheet: null,
    turnData: null,
    currentEvent: null,
    menuOpen: false,
    activePowerups: [],
    activeEffects: [],
    availableDeals: generateDeals(1),
    completedMilestones: [],
    streak: 0,
    totalProfit: 0,
    toasts: [],
  }
}

/** Apply an event's mechanical effects to game state */
function applyEvent(
  state: GameState,
  event: GameEvent
): Partial<GameState> {
  const m = event.mechanical
  const patch: Partial<GameState> = {}
  const newEffects: ActiveEffect[] = []

  // Instant risk add
  if (m.riskAdd != null) {
    patch.risk = clamp((state.risk ?? 0) + m.riskAdd, 0, 100)
  }

  // Drain storage
  if (m.drainStorage) {
    patch.stored = 0
  }

  // Bonus supply → add to storage
  if (m.bonusSupply != null) {
    patch.stored = Math.min((patch.stored ?? state.stored) + m.bonusSupply, STORAGE_MAX)
  }

  // Region-specific demand multiplier (instant, applied to region demand)
  if (m.region && m.demandMult != null) {
    patch.regions = (patch.regions ?? state.regions).map((r) =>
      r.id === m.region
        ? { ...r, demand: Math.round(r.demand * m.demandMult!) }
        : r
    )
  }

  // All-region demand multiplier
  if (m.allDemandMult != null) {
    patch.regions = (patch.regions ?? state.regions).map((r) => ({
      ...r,
      demand: Math.round(r.demand * m.allDemandMult!),
    }))
  }

  // Duration-based effects
  if (m.supplyMult != null) {
    newEffects.push({ kind: 'supplyMult', value: m.supplyMult, turnsLeft: m.duration ?? 1 })
  }
  if (m.riskMult != null) {
    newEffects.push({ kind: 'riskMult', value: m.riskMult, turnsLeft: m.duration ?? 1 })
  }
  if (m.costMult != null) {
    newEffects.push({ kind: 'costMult', value: m.costMult, turnsLeft: 1 })
  }

  // Conditional blackout risk (stored for turn engine to check)
  // blackoutRisk is handled by the existing risk engine when the region blacks out

  if (newEffects.length > 0) {
    patch.activeEffects = [...state.activeEffects, ...newEffects]
  }

  return patch
}

/** Tick active effects, removing expired ones */
function tickEffects(effects: ActiveEffect[]): ActiveEffect[] {
  return effects
    .map((e) => ({ ...e, turnsLeft: e.turnsLeft - 1 }))
    .filter((e) => e.turnsLeft > 0)
}

/** Get combined multiplier for a given effect kind */
export function getEffectMult(effects: ActiveEffect[], kind: ActiveEffect['kind']): number {
  return effects
    .filter((e) => e.kind === kind)
    .reduce((acc, e) => acc * e.value, 1)
}

interface GameActions {
  // Game lifecycle
  initRun: () => void
  reset: () => void
  loadSavedGame: (saved: SavedGame) => void

  // UI state
  setSheet: (sheet: SheetType) => void
  setExpandedRegion: (id: string | null) => void
  setMenuOpen: (open: boolean) => void

  // Game actions
  updateAllocation: (regionId: string, value: number) => void
  storeEnergy: (amount: number) => void
  selectDeal: (id: string | null) => void
  buyPowerup: (pu: PowerUp) => void
  endTurn: () => void
  nextDay: () => void

  // Toast
  addToast: (msg: string, color?: string) => void
  removeToast: (id: number) => void
}

// Selectors (computed values)
export function getGeneration(state: GameState): number {
  const surgeBonus = state.activePowerups.some((p) => p.effect === 'surge')
    ? SURGE_BONUS_MW
    : 0
  const supplyMult = getEffectMult(state.activeEffects, 'supplyMult')
  return Math.round((BASE_GENERATION + surgeBonus) * supplyMult)
}

export function getTotalAllocated(state: GameState): number {
  return state.regions.reduce((sum, r) => sum + r.allocated, 0)
}

export function getDealMW(state: GameState): number {
  const deal = getSelectedDealData(state)
  return deal ? deal.mw : 0
}

export function getRemaining(state: GameState): number {
  return getGeneration(state) + state.stored - getTotalAllocated(state) - getDealMW(state)
}

export function getShieldActive(state: GameState): boolean {
  return state.activePowerups.some((p) => p.effect === 'shield')
}

export function getPriceLock(state: GameState): boolean {
  return state.activePowerups.some((p) => p.effect === 'pricelock')
}

export function getSelectedDealData(state: GameState) {
  if (!state.selectedDeal) return null
  return state.availableDeals.find((d) => d.id === state.selectedDeal) ?? null
}

export const useGameStore = create<GameState & GameActions>()((set, get) => ({
  ...freshState(),

  initRun: () => set(freshState()),

  reset: () => set(freshState()),

  loadSavedGame: (saved) =>
    set({
      ...freshState(),
      ...saved.state,
      // Ensure transient UI state is clean
      toasts: [],
      sheet: null,
      expandedRegion: null,
      menuOpen: false,
    }),

  setSheet: (sheet) => set({ sheet }),

  setExpandedRegion: (id) => set({ expandedRegion: id }),

  setMenuOpen: (open) => set({ menuOpen: open }),

  updateAllocation: (regionId, value) =>
    set((state) => {
      const generation = getGeneration(state)
      const dealMW = getDealMW(state)
      const otherAlloc = state.regions
        .filter((r) => r.id !== regionId)
        .reduce((sum, r) => sum + r.allocated, 0)
      const maxForThis = generation + state.stored - otherAlloc - dealMW

      return {
        regions: state.regions.map((r) =>
          r.id === regionId
            ? {
                ...r,
                allocated: clamp(value, 0, Math.min(r.demand + 30, maxForThis)),
              }
            : r
        ),
      }
    }),

  storeEnergy: (amount) =>
    set((state) => {
      const generation = getGeneration(state)
      const totalAlloc = getTotalAllocated(state)
      const avail = generation + state.stored - totalAlloc
      const actual = clamp(
        amount,
        -state.stored,
        Math.min(STORAGE_MAX - state.stored, avail)
      )
      return { stored: state.stored + actual }
    }),

  selectDeal: (id) =>
    set((state) => ({
      selectedDeal: state.selectedDeal === id ? null : id,
    })),

  buyPowerup: (pu) => {
    const state = get()
    if (state.money < pu.cost) {
      get().addToast('Not enough funds', '#FF3B30')
      return
    }

    set((prev) => {
      const next: Partial<GameState> = { money: prev.money - pu.cost }

      if (pu.effect === 'lobby') {
        next.risk = clamp(prev.risk - LOBBY_RISK_REDUCTION, 0, 100)
        setTimeout(() => get().addToast('Risk reduced by 15%', '#8E8AFF'), 0)
      } else if (pu.effect === 'reserve') {
        next.stored = STORAGE_MAX
        setTimeout(() => get().addToast('Storage filled to max', '#B0ADFF'), 0)
      } else {
        const activePU: ActivePowerUp = { ...pu, turnsLeft: pu.duration }
        next.activePowerups = [...prev.activePowerups, activePU]
        setTimeout(() => get().addToast(`${pu.name} activated!`, pu.color), 0)
      }

      return next
    })
  },

  endTurn: () =>
    set((state) => {
      const deal = getSelectedDealData(state)
      const costMult = getEffectMult(state.activeEffects, 'costMult')
      const riskMult = getEffectMult(state.activeEffects, 'riskMult')

      const { turnResult, updatedPowerups } = executeTurn({
        regions: state.regions,
        selectedDeal: deal,
        activePowerups: state.activePowerups,
        streak: state.streak,
        costMult,
        riskMult,
      })

      return {
        turnData: turnResult,
        money: state.money + turnResult.net,
        risk: clamp(state.risk + turnResult.riskDelta, 0, 100),
        totalProfit: state.totalProfit + turnResult.net,
        streak: turnResult.newStreak,
        expandedRegion: null,
        sheet: 'result' as const,
        activePowerups: updatedPowerups,
        activeEffects: tickEffects(state.activeEffects),
      }
    }),

  nextDay: () =>
    set((state) => {
      const nextDayNum = state.day + 1
      const priceLock = getPriceLock(state)
      const newRegions = recalculatePrices(state.regions, priceLock, nextDayNum)

      // Operating costs
      const opCost = DAILY_COST_BASE + (state.day - 1) * DAILY_COST_ESCALATION
      let newMoney = state.money - opCost
      let newRisk = state.risk

      // Debt penalty
      if (newMoney < 0) {
        newRisk = clamp(newRisk + DEBT_RISK_PENALTY, 0, 100)
      }

      // Milestone check (check at current day before advancing)
      const milestoneHits: string[] = []
      for (const ms of MILESTONES) {
        if (ms.day === state.day && !state.completedMilestones.includes(ms.id)) {
          if (ms.check(state)) {
            milestoneHits.push(ms.id)
            if (ms.reward.money) newMoney += ms.reward.money
            if (ms.reward.risk) newRisk = clamp(newRisk + ms.reward.risk, 0, 100)
            setTimeout(() => get().addToast(`🏆 ${ms.label} — ${ms.reward.desc}`, '#FFD60A'), 100)
          } else {
            setTimeout(() => get().addToast(`✗ Missed: ${ms.label}`, '#555'), 100)
          }
        }
      }

      const base: Partial<GameState> = {
        day: nextDayNum,
        money: newMoney,
        risk: newRisk,
        regions: newRegions,
        selectedDeal: null,
        sheet: null,
        turnData: null,
        currentEvent: null,
        availableDeals: generateDeals(nextDayNum),
        completedMilestones: [...state.completedMilestones, ...milestoneHits],
      }

      // Check game over
      if (newRisk >= RISK_GAME_OVER) {
        return { ...base, sheet: 'gameover' as const }
      }

      // Check victory
      if (state.day >= MAX_DAYS) {
        return { ...base, sheet: 'victory' as const }
      }

      // Roll for event
      const event = rollEvent()
      if (event) {
        const eventPatch = applyEvent({ ...state, ...base } as GameState, event)
        return {
          ...base,
          ...eventPatch,
          currentEvent: event,
          sheet: 'event' as const,
        }
      }

      return base
    }),

  addToast: (msg, color = '#FFF') => {
    const id = Date.now()
    set((state) => ({
      toasts: [...state.toasts, { id, msg, color } as Toast],
    }))
    setTimeout(() => get().removeToast(id), 2800)
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
