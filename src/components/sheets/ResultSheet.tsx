import { useGameStore } from '@/stores/gameStore'
import { fmt, riskColor } from '@/utils/format'

export default function ResultSheet() {
  const day = useGameStore((s) => s.day)
  const risk = useGameStore((s) => s.risk)
  const turnData = useGameStore((s) => s.turnData)
  const nextDay = useGameStore((s) => s.nextDay)

  if (!turnData) return null

  const rows = [
    { l: 'Grid Revenue', v: `+$${fmt(turnData.revenue)}`, c: '#00E5A0' },
    { l: 'Black Market', v: turnData.bmIncome > 0 ? `+$${fmt(turnData.bmIncome)}` : '—', c: turnData.bmIncome > 0 ? '#FF6B35' : '#333' },
    { l: 'Supply Costs', v: `-$${fmt(turnData.costs)}`, c: '#FF3B30' },
  ]

  return (
    <div className="px-5 py-5 pb-8">
      {/* Hero */}
      <div className="text-center pb-3.5 mb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span className="block font-mono text-[10px] tracking-[4px] mb-1" style={{ color: '#FF6B35' }}>
          DAY {day} COMPLETE
        </span>
        <span
          className="block font-mono text-4xl font-extrabold"
          style={{ color: turnData.net >= 0 ? '#00E5A0' : '#FF3B30' }}
        >
          {turnData.net >= 0 ? '+' : ''}${fmt(turnData.net)}
        </span>
        {turnData.streakBonus > 0 && (
          <span className="block font-mono text-[11px] mt-1.5" style={{ color: '#FF6B35' }}>
            🔥 Streak bonus +${fmt(turnData.streakBonus)} (×{turnData.newStreak})
          </span>
        )}
      </div>

      {/* Financial breakdown */}
      <div
        className="p-3 rounded-lg mb-2"
        style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        {rows.map((r, i) => (
          <div key={i} className="flex justify-between py-1">
            <span className="text-[13px]" style={{ color: '#999' }}>{r.l}</span>
            <span className="font-mono text-[13px] font-semibold" style={{ color: r.c }}>{r.v}</span>
          </div>
        ))}
      </div>

      {/* Grid status */}
      <div
        className="p-3 rounded-lg mb-2"
        style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        <span className="block font-mono text-[9px] tracking-[2px] mb-2" style={{ color: '#444' }}>
          GRID STATUS
        </span>
        {turnData.regionOutcomes.map((r) => (
          <div key={r.id} className="flex justify-between py-1">
            <span className="text-[13px]" style={{ color: '#999' }}>
              {r.icon} {r.name}
            </span>
            <span
              className="font-mono text-[13px] font-semibold"
              style={{
                color: r.outcome === 'Supplied' ? '#00E5A0' : r.outcome === 'Partial' ? '#FFD60A' : '#FF3B30',
              }}
            >
              {r.outcome === 'Supplied' ? '✓' : r.outcome === 'Partial' ? '~' : '✗'} {r.outcome}
            </span>
          </div>
        ))}
      </div>

      {/* Risk */}
      <div
        className="p-3 rounded-lg mb-2"
        style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        <span className="block font-mono text-[9px] tracking-[2px] mb-2" style={{ color: '#444' }}>
          RISK
        </span>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-[5px] rounded-sm relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-sm"
              style={{ width: `${risk}%`, background: `linear-gradient(90deg, #1a1a1a, ${riskColor(risk)})` }}
            />
          </div>
          <span className="font-mono text-[13px] font-bold" style={{ color: riskColor(risk) }}>
            {risk}%
          </span>
        </div>
        <span
          className="block font-mono text-[11px] mt-1"
          style={{ color: turnData.riskDelta > 0 ? '#FF6B35' : '#00E5A0' }}
        >
          {turnData.riskDelta > 0 ? '▲' : '▼'} {Math.abs(turnData.riskDelta)}%
        </span>
      </div>

      <button
        className="w-full py-4 rounded-lg font-mono text-[13px] font-bold tracking-[2px] text-center mt-4 text-white"
        style={{ background: 'linear-gradient(135deg, #FF6B35, #E05520)' }}
        onClick={nextDay}
      >
        NEXT DAY →
      </button>
    </div>
  )
}
