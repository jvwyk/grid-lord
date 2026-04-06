import { useGameStore } from '@/stores/gameStore'
import { fmt } from '@/utils/format'

export default function StatusBar() {
  const day = useGameStore((s) => s.day)
  const money = useGameStore((s) => s.money)
  const streak = useGameStore((s) => s.streak)
  const setMenuOpen = useGameStore((s) => s.setMenuOpen)

  return (
    <div className="flex justify-between items-center mb-2.5">
      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#555' }}
          onClick={() => setMenuOpen(true)}
        >
          ⋮
        </button>
        <div
          className="inline-flex items-baseline gap-0.5 px-3 py-1.5 rounded"
          style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.12)' }}
        >
          <span className="font-mono text-[13px] font-bold tracking-[2px]" style={{ color: '#FF6B35' }}>
            DAY {day}
          </span>
          <span className="font-mono text-[11px]" style={{ color: 'rgba(255,107,53,0.35)' }}>
            /30
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {streak >= 3 && (
          <span
            className="font-mono text-[11px] font-bold px-2 py-0.5 rounded"
            style={{ color: '#FF6B35', background: 'rgba(255,107,53,0.08)' }}
          >
            🔥 {streak}
          </span>
        )}
        <span className="font-mono text-[22px] font-bold" style={{ color: '#00E5A0' }}>
          ${fmt(money)}
        </span>
      </div>
    </div>
  )
}
