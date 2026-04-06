import { create } from 'zustand'
import type { GameState, PowerUp, ActivePowerUp, Toast, SheetType, SavedGame } from '@/types'
import { REGIONS_INIT } from '@/data/regions'
import { BLACK_MARKET_DEALS } from '@/data/blackMarket'
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
} from '@/data/balanceTables'
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
    streak: 0,
    totalProfit: 0,
    toasts: [],
  }
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
  return BASE_GENERATION + surgeBonus
}

export function getTotalAllocated(state: GameState): number {
  return state.regions.reduce((sum, r) => sum + r.allocated, 0)
}

export function getRemaining(state: GameState): number {
  return getGeneration(state) + state.stored - getTotalAllocated(state)
}

export function getShieldActive(state: GameState): boolean {
  return state.activePowerups.some((p) => p.effect === 'shield')
}

export function getPriceLock(state: GameState): boolean {
  return state.activePowerups.some((p) => p.effect === 'pricelock')
}

export function getSelectedDealData(state: GameState) {
  if (!state.selectedDeal) return null
  return BLACK_MARKET_DEALS.find((d) => d.id === state.selectedDeal) ?? null
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
      const otherAlloc = state.regions
        .filter((r) => r.id !== regionId)
        .reduce((sum, r) => sum + r.allocated, 0)
      const maxForThis = generation + state.stored - otherAlloc

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

      const { turnResult, updatedPowerups } = executeTurn({
        regions: state.regions,
        selectedDeal: deal,
        activePowerups: state.activePowerups,
        streak: state.streak,
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
      }
    }),

  nextDay: () =>
    set((state) => {
      const priceLock = getPriceLock(state)
      const newRegions = recalculatePrices(state.regions, priceLock)

      const base: Partial<GameState> = {
        day: state.day + 1,
        regions: newRegions,
        selectedDeal: null,
        sheet: null,
        turnData: null,
        currentEvent: null,
      }

      // Check game over
      if (state.risk >= RISK_GAME_OVER) {
        return { ...base, sheet: 'gameover' as const }
      }

      // Check victory
      if (state.day >= MAX_DAYS) {
        return { ...base, sheet: 'victory' as const }
      }

      // Roll for event
      const event = rollEvent()
      if (event) {
        return {
          ...base,
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
