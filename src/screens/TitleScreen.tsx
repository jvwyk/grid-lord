import { useGameStore } from '@/stores/gameStore'
import { useMetaStore } from '@/stores/metaStore'

export default function TitleScreen() {
  const initRun = useGameStore((s) => s.initRun)
  const setScreen = useMetaStore((s) => s.setScreen)

  const handleBegin = () => {
    initRun()
    setScreen('game')
  }

  return (
    <div className="w-full min-h-screen flex justify-center" style={{ background: '#050505' }}>
      <div
        className="w-full max-w-[430px] min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-8 py-10"
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
          <button
            className="mt-12 px-12 py-4 rounded-sm"
            style={{ border: '1px solid rgba(255,107,53,0.6)' }}
            onClick={handleBegin}
          >
            <span className="font-mono text-sm font-semibold tracking-[4px]" style={{ color: '#FF6B35' }}>
              BEGIN
            </span>
          </button>
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
    </div>
  )
}
