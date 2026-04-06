import { useGameStore } from '@/stores/gameStore'
import { POWERUPS } from '@/data/powerups'
import { fmt } from '@/utils/format'

export default function PowerUpSheet() {
  const money = useGameStore((s) => s.money)
  const activePowerups = useGameStore((s) => s.activePowerups)
  const buyPowerup = useGameStore((s) => s.buyPowerup)
  const setSheet = useGameStore((s) => s.setSheet)

  const activeIds = activePowerups.map((a) => a.id)

  return (
    <div className="px-5 py-5 pb-8">
      <div className="flex justify-between items-center mb-3.5">
        <span className="font-mono text-base font-bold tracking-[2px]" style={{ color: '#FFD60A' }}>
          Power-Ups
        </span>
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#555' }}
          onClick={() => setSheet(null)}
        >
          ✕
        </button>
      </div>

      <p className="text-xs leading-relaxed mb-3.5" style={{ color: '#777' }}>
        Tactical advantages. Spend money now to gain an edge. Some are instant, others last multiple turns.
      </p>

      <div className="grid grid-cols-2 gap-2 mb-2">
        {POWERUPS.map((pu) => {
          const owned = activeIds.includes(pu.id)
          const canAfford = money >= pu.cost
          return (
            <button
              key={pu.id}
              className="px-3 py-3.5 rounded-[10px] text-center transition-all duration-150"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${owned ? pu.color + '30' : 'rgba(255,255,255,0.06)'}`,
                opacity: owned ? 0.4 : canAfford ? 1 : 0.5,
              }}
              onClick={() => !owned && canAfford && buyPowerup(pu)}
            >
              <div className="text-[28px] mb-1.5">{pu.icon}</div>
              <div className="font-mono text-[11px] font-bold mb-1" style={{ color: '#E0E0E0' }}>
                {pu.name}
              </div>
              <div className="text-[10px] leading-tight mb-2 min-h-[26px]" style={{ color: '#666' }}>
                {pu.desc}
              </div>
              <div
                className="font-mono text-xs font-extrabold"
                style={{ color: owned ? pu.color : canAfford ? '#00E5A0' : '#FF3B30' }}
              >
                {owned ? 'ACTIVE' : `$${fmt(pu.cost)}`}
              </div>
            </button>
          )
        })}
      </div>

      <button
        className="w-full py-4 rounded-lg font-mono text-[13px] font-bold tracking-[2px] text-center mt-4"
        style={{ background: 'linear-gradient(135deg, #FF6B35, #E05520)', color: '#FFF' }}
        onClick={() => setSheet(null)}
      >
        CLOSE
      </button>
    </div>
  )
}
