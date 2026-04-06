import { useGameStore } from '@/stores/gameStore'
import { BASE_GENERATION, SURGE_BONUS_MW, RISK_GAME_OVER } from '@/data/balanceTables'

export default function BottomDock() {
  const day = useGameStore((s) => s.day)
  const risk = useGameStore((s) => s.risk)
  const streak = useGameStore((s) => s.streak)
  const stored = useGameStore((s) => s.stored)
  const regions = useGameStore((s) => s.regions)
  const activePowerups = useGameStore((s) => s.activePowerups)
  const endTurn = useGameStore((s) => s.endTurn)
  const setSheet = useGameStore((s) => s.setSheet)

  const generation = BASE_GENERATION + (activePowerups.some((p) => p.effect === 'surge') ? SURGE_BONUS_MW : 0)
  const totalAllocated = regions.reduce((sum, r) => sum + r.allocated, 0)
  const remaining = generation + stored - totalAllocated
  const isGameOver = risk >= RISK_GAME_OVER

  const remainColor = remaining < 0 ? '#FF3B30' : remaining < 50 ? '#FFD60A' : '#00E5A0'

  return (
    <div
      className="sticky bottom-0 pt-2 z-10"
      style={{ background: 'linear-gradient(transparent, #0D0D0D 15%)' }}
    >
      <div className="text-center font-mono text-[11px] mb-2 py-1">
        <span style={{ color: remainColor }}>{remaining} MW remaining</span>
        {streak >= 3 && (
          <span className="ml-2" style={{ color: '#FF6B35' }}>
            🔥 streak ×{streak}
          </span>
        )}
      </div>

      <button
        className="w-full py-4.5 rounded-[10px] font-mono text-[13px] font-bold tracking-[3px] text-center text-white"
        style={{
          background: isGameOver
            ? 'linear-gradient(135deg, #FF3B30, #CC2200)'
            : 'linear-gradient(135deg, #FF6B35, #E05520)',
          boxShadow: '0 4px 20px rgba(255,107,53,0.2)',
        }}
        onClick={isGameOver ? () => setSheet('gameover') : endTurn}
      >
        {isGameOver ? '⚠️ INVESTIGATION IMMINENT' : `END DAY ${day}  →`}
      </button>
    </div>
  )
}
