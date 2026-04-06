import { useGameStore } from '@/stores/gameStore'
import { useMetaStore } from '@/stores/metaStore'
import { fmt, calcScore } from '@/utils/format'
import { addRunToCareer, clearSave } from '@/hooks/usePersistence'

export default function MenuSheet() {
  const day = useGameStore((s) => s.day)
  const money = useGameStore((s) => s.money)
  const risk = useGameStore((s) => s.risk)
  const totalProfit = useGameStore((s) => s.totalProfit)
  const streak = useGameStore((s) => s.streak)
  const setMenuOpen = useGameStore((s) => s.setMenuOpen)
  const initRun = useGameStore((s) => s.initRun)
  const setScreen = useMetaStore((s) => s.setScreen)
  const setHasSave = useMetaStore((s) => s.setHasSave)

  const abandonRun = () => {
    addRunToCareer({
      id: String(Date.now()),
      date: new Date().toISOString(),
      result: 'abandoned',
      day,
      money,
      totalProfit,
      risk,
      bestStreak: streak,
      score: calcScore(totalProfit, day, risk, streak, false),
    })
    clearSave()
    setHasSave(false)
  }

  const handleNewRun = () => {
    abandonRun()
    initRun()
    setMenuOpen(false)
  }

  const handleTitle = () => {
    abandonRun()
    initRun()
    setMenuOpen(false)
    setScreen('title')
  }

  return (
    <div className="px-5 py-5 pb-8">
      <div className="text-center pb-4 mb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="block font-mono text-lg font-extrabold tracking-[3px] text-white">
          ⚡ GRIDLORD
        </span>
        <span className="block font-mono text-[11px] mt-1" style={{ color: '#555' }}>
          Day {day}/30 · ${fmt(money)}
        </span>
      </div>

      <button
        className="w-full flex items-center gap-3.5 px-3.5 py-3.5 rounded-[10px] mb-1.5 text-left"
        style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
        onClick={() => setMenuOpen(false)}
      >
        <span className="text-lg w-7 text-center shrink-0" style={{ color: '#FF6B35' }}>▶</span>
        <div>
          <span className="block font-mono text-sm font-bold" style={{ color: '#E0E0E0' }}>Resume</span>
          <span className="block text-xs mt-px" style={{ color: '#555' }}>Continue current run</span>
        </div>
      </button>

      <button
        className="w-full flex items-center gap-3.5 px-3.5 py-3.5 rounded-[10px] mb-1.5 text-left"
        style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
        onClick={handleNewRun}
      >
        <span className="text-lg w-7 text-center shrink-0" style={{ color: '#FF6B35' }}>↻</span>
        <div>
          <span className="block font-mono text-sm font-bold" style={{ color: '#E0E0E0' }}>New Run</span>
          <span className="block text-xs mt-px" style={{ color: '#555' }}>Abandon and start fresh</span>
        </div>
      </button>

      <button
        className="w-full flex items-center gap-3.5 px-3.5 py-3.5 rounded-[10px] mb-1.5 text-left"
        style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,59,48,0.1)' }}
        onClick={handleTitle}
      >
        <span className="text-lg w-7 text-center shrink-0" style={{ color: '#FF3B30' }}>✕</span>
        <div>
          <span className="block font-mono text-sm font-bold" style={{ color: '#FF3B30' }}>End Run</span>
          <span className="block text-xs mt-px" style={{ color: '#555' }}>Abandon and return to title</span>
        </div>
      </button>

      <div className="text-center mt-2.5 font-mono text-[10px]" style={{ color: '#333' }}>
        Progress saved automatically
      </div>
    </div>
  )
}
