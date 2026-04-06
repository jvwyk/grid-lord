import { useGameStore, getDealMW, getRemaining } from '@/stores/gameStore'
import { RISK_GAME_OVER } from '@/data/balanceTables'

export default function BottomDock() {
  const day = useGameStore((s) => s.day)
  const risk = useGameStore((s) => s.risk)
  const streak = useGameStore((s) => s.streak)
  const endTurn = useGameStore((s) => s.endTurn)
  const setSheet = useGameStore((s) => s.setSheet)

  const state = useGameStore.getState()
  const remaining = getRemaining(state)
  const dealMW = getDealMW(state)
  const isGameOver = risk >= RISK_GAME_OVER

  const remainColor = remaining < 0 ? '#FF3B30' : remaining < 50 ? '#FFD60A' : '#00E5A0'

  return (
    <div
      className="shrink-0 px-3.5 pt-2 pb-3.5"
      style={{ background: '#0D0D0D', paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom))' }}
    >
      <div className="text-center font-mono text-[11px] mb-2 py-1">
        <span style={{ color: remainColor }}>{remaining} MW remaining</span>
        {dealMW > 0 && (
          <span className="ml-1.5" style={{ color: '#FF6B35' }}>
            ({dealMW} deal)
          </span>
        )}
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
