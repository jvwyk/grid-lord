import type { GameState, SavedGame, RunRecord, CareerData } from '@/types'

const SAVE_KEY = 'gridlord-save'
const CAREER_KEY = 'gridlord-career'

// ── Game Save ──

export function saveGame(state: GameState): void {
  const saved: SavedGame = {
    state: {
      day: state.day,
      money: state.money,
      risk: state.risk,
      stored: state.stored,
      regions: state.regions,
      selectedDeal: state.selectedDeal,
      turnData: state.turnData,
      currentEvent: state.currentEvent,
      activePowerups: state.activePowerups,
      activeEffects: state.activeEffects,
      availableDeals: state.availableDeals,
      completedMilestones: state.completedMilestones,
      streak: state.streak,
      totalProfit: state.totalProfit,
    },
    savedAt: Date.now(),
  }
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saved))
  } catch {
    // Storage full or unavailable — silently fail
  }
}

export function loadGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedGame
    if (!parsed.state || typeof parsed.state.day !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    // Silently fail
  }
}

export function hasSavedGame(): boolean {
  return loadGame() !== null
}

// ── Career ──

function emptyCareer(): CareerData {
  return {
    runs: [],
    bestScore: 0,
    bestProfit: 0,
    bestStreak: 0,
    totalRuns: 0,
    victories: 0,
  }
}

export function loadCareer(): CareerData {
  try {
    const raw = localStorage.getItem(CAREER_KEY)
    if (!raw) return emptyCareer()
    const parsed = JSON.parse(raw) as CareerData
    if (!Array.isArray(parsed.runs)) return emptyCareer()
    return parsed
  } catch {
    return emptyCareer()
  }
}

export function saveCareer(career: CareerData): void {
  try {
    localStorage.setItem(CAREER_KEY, JSON.stringify(career))
  } catch {
    // Silently fail
  }
}

export function addRunToCareer(record: RunRecord): void {
  const career = loadCareer()
  career.runs.unshift(record)
  career.totalRuns++
  if (record.result === 'victory') career.victories++
  if (record.score > career.bestScore) career.bestScore = record.score
  if (record.totalProfit > career.bestProfit) career.bestProfit = record.totalProfit
  if (record.bestStreak > career.bestStreak) career.bestStreak = record.bestStreak
  saveCareer(career)
}

export function clearCareer(): void {
  try {
    localStorage.removeItem(CAREER_KEY)
  } catch {
    // Silently fail
  }
}
