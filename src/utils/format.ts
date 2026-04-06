import type { Priority, Severity } from '@/types'
import {
  RISK_LOW,
  RISK_MEDIUM,
  RISK_HIGH,
} from '@/data/balanceTables'

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

export function fmt(n: number): string {
  return n.toLocaleString('en-US')
}

export function riskColor(v: number): string {
  if (v < RISK_LOW) return '#00E5A0'
  if (v < RISK_MEDIUM) return '#FFD60A'
  if (v < RISK_HIGH) return '#FF6B35'
  return '#FF3B30'
}

export function riskLabel(v: number): string {
  if (v < RISK_LOW) return 'LOW'
  if (v < RISK_MEDIUM) return 'MEDIUM'
  if (v < RISK_HIGH) return 'HIGH'
  return 'CRITICAL'
}

export function allocColor(pct: number): string {
  if (pct === 0) return '#333'
  if (pct < 0.5) return '#FF3B30'
  if (pct < 0.85) return '#FFD60A'
  if (pct <= 1.05) return '#00E5A0'
  return '#8E8AFF'
}

export function allocLabel(pct: number): string {
  if (pct === 0) return 'Unpowered'
  if (pct < 0.5) return 'Critical'
  if (pct < 0.85) return 'Low'
  if (pct <= 1.05) return 'Balanced'
  return 'Excess'
}

export function sevColor(s: Severity): string {
  if (s === 'critical') return '#FF3B30'
  if (s === 'danger') return '#FF6B35'
  if (s === 'warning') return '#FFD60A'
  return '#00E5A0'
}

export const prioColor: Record<Priority, string> = {
  hospital: '#FF3B30',
  residential: '#00E5A0',
  industrial: '#FFD60A',
  commercial: '#8E8AFF',
}
