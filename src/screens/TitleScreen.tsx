import { useGameStore } from '@/stores/gameStore'
import { useMetaStore } from '@/stores/metaStore'
import { loadGame } from '@/hooks/usePersistence'
import { fmt } from '@/utils/format'
import Sheet from '@/components/shared/Sheet'
import CareerSheet from '@/components/sheets/CareerSheet'

export default function TitleScreen() {
  const initRun = useGameStore((s) => s.initRun)
  const loadSavedGame = useGameStore((s) => s.loadSavedGame)
  const setScreen = useMetaStore((s) => s.setScreen)
  const hasSave = useMetaStore((s) => s.hasSave)
  const careerOpen = useMetaStore((s) => s.careerOpen)
  const setCareerOpen = useMetaStore((s) => s.setCareerOpen)

  const handleBegin = () => {
    initRun()
    setScreen('game')
  }

  const handleContinue = () => {
    const saved = loadGame()
    if (saved) {
      loadSavedGame(saved)
      setScreen('game')
    }
  }

  const savedPreview = hasSave ? loadGame() : null

  return (
    <div className="w-full h-dvh flex justify-center" style={{ background: '#050505' }}>
      <div
        className="w-full max-w-[430px] h-dvh flex flex-col items-center justify-center relative overflow-hidden px-8 py-10"
        style={{ background: '#0A0A0A' }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glow */}
        <div
          className="absolute w-[300px] h-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)',
            top: '20%',
            left: '50%',
            animation: 'glow-pulse 3s ease-in-out infinite',
          }}
        />

        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none z-[3]"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          }}
        />

        {/* Content */}
        <div className="relative z-[2] flex flex-col items-center text-white stagger-in">
          <div className="text-[64px] mb-2">⚡</div>
          <h1
            className="text-5xl font-mono font-bold tracking-[12px]"
            style={{ textShadow: '0 0 40px rgba(255,107,53,0.4)' }}
          >
            GRIDLORD
          </h1>
          <p className="text-sm italic tracking-[2px] mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Power is finite. Control is not.
          </p>

          <div className="flex flex-col items-center gap-3 mt-12 w-full max-w-[260px]">
            {/* Continue button — only if save exists */}
            {hasSave && savedPreview && (
              <button
                className="w-full px-6 py-4 rounded-sm"
                style={{
                  border: '1px solid rgba(0,229,160,0.5)',
                  background: 'rgba(0,229,160,0.04)',
                }}
                onClick={handleContinue}
              >
                <span className="block font-mono text-sm font-semibold tracking-[4px]" style={{ color: '#00E5A0' }}>
                  CONTINUE
                </span>
                <span className="block font-mono text-[10px] mt-1" style={{ color: 'rgba(0,229,160,0.5)' }}>
                  Day {savedPreview.state.day} · ${fmt(savedPreview.state.money)}
                </span>
              </button>
            )}

            {/* Begin button */}
            <button
              className="w-full px-6 py-4 rounded-sm"
              style={{ border: '1px solid rgba(255,107,53,0.6)' }}
              onClick={handleBegin}
            >
              <span className="font-mono text-sm font-semibold tracking-[4px]" style={{ color: '#FF6B35' }}>
                BEGIN
              </span>
            </button>

            {/* Career button */}
            <button
              className="w-full px-6 py-3 rounded-sm"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={() => setCareerOpen(true)}
            >
              <span className="font-mono text-xs font-semibold tracking-[4px]" style={{ color: '#555' }}>
                CAREER
              </span>
            </button>
          </div>

          <p className="mt-6 text-[11px] tracking-[1px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Web-first · Mobile-optimised · Strategy
          </p>
        </div>

        {/* Version */}
        <div
          className="absolute bottom-5 font-mono text-[10px] tracking-[1px]"
          style={{ color: 'rgba(255,255,255,0.1)' }}
        >
          v0.1.0 — PRODUCTION
        </div>
      </div>

      {/* Career Sheet */}
      <Sheet open={careerOpen} onClose={() => setCareerOpen(false)}>
        <CareerSheet />
      </Sheet>
    </div>
  )
}
