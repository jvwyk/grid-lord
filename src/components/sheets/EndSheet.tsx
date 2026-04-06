import { useEffect, useRef } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useMetaStore } from '@/stores/metaStore'
import { fmt, calcScore } from '@/utils/format'
import { addRunToCareer, clearSave } from '@/hooks/usePersistence'

interface EndSheetProps {
  type: 'over' | 'win'
}

export default function EndSheet({ type }: EndSheetProps) {
  const day = useGameStore((s) => s.day)
  const risk = useGameStore((s) => s.risk)
  const totalProfit = useGameStore((s) => s.totalProfit)
  const streak = useGameStore((s) => s.streak)
  const money = useGameStore((s) => s.money)
  const initRun = useGameStore((s) => s.initRun)
  const setScreen = useMetaStore((s) => s.setScreen)
  const setHasSave = useMetaStore((s) => s.setHasSave)

  const win = type === 'win'
  const score = calcScore(totalProfit, day, risk, streak, win)
  const color = win ? '#00E5A0' : '#FF3B30'

  // Record run to career once when sheet mounts
  const recorded = useRef(false)
  useEffect(() => {
    if (recorded.current) return
    recorded.current = true
    addRunToCareer({
      id: String(Date.now()),
      date: new Date().toISOString(),
      result: win ? 'victory' : 'gameover',
      day,
      money,
      totalProfit,
      risk,
      bestStreak: streak,
      score,
    })
    clearSave()
    setHasSave(false)
  }, [win, day, money, totalProfit, risk, streak, score, setHasSave])

  const handleNewRun = () => {
    initRun()
  }

  const handleTitle = () => {
    initRun()
    setScreen('title')
  }

  return (
    <div className="px-5 py-5 pb-8 text-center">
      <span
        className="inline-block font-mono text-[9px] font-bold px-3 py-1 rounded tracking-[3px] mb-3.5"
        style={{ background: color + '18', color }}
      >
        {win ? 'RUN COMPLETE' : 'GAME OVER'}
      </span>

      <div className="text-[52px] mb-2">{win ? '⚡' : '🏛️'}</div>

      <h2 className="font-mono text-[22px] font-extrabold tracking-[2px] text-white mb-1.5">
        {win ? 'SURVIVED' : 'INVESTIGATION'}
      </h2>

      <p className="text-sm leading-relaxed max-w-[300px] mx-auto mb-4" style={{ color: '#999' }}>
        {win
          ? '30 days. Grid intact. You are the GridLord.'
          : 'Federal regulators launched a probe. Your tenure is over.'}
      </p>

      {/* Score grid */}
      <div className="grid grid-cols-2 gap-2 mx-0 my-4">
        <div
          className="p-3 rounded-lg flex flex-col items-center gap-0.5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="font-mono text-[8px] tracking-[2px]" style={{ color: '#555' }}>DAYS</span>
          <span className="font-mono text-lg font-extrabold text-white">{day}</span>
        </div>
        <div
          className="p-3 rounded-lg flex flex-col items-center gap-0.5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="font-mono text-[8px] tracking-[2px]" style={{ color: '#555' }}>PROFIT</span>
          <span className="font-mono text-lg font-extrabold" style={{ color: '#00E5A0' }}>
            ${fmt(totalProfit)}
          </span>
        </div>
        <div
          className="p-3 rounded-lg flex flex-col items-center gap-0.5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="font-mono text-[8px] tracking-[2px]" style={{ color: '#555' }}>BEST STREAK</span>
          <span className="font-mono text-lg font-extrabold" style={{ color: '#FF6B35' }}>{streak}</span>
        </div>
        <div
          className="p-3 rounded-lg flex flex-col items-center gap-0.5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="font-mono text-[8px] tracking-[2px]" style={{ color: '#555' }}>SCORE</span>
          <span className="font-mono text-2xl font-extrabold" style={{ color: '#FFD60A' }}>
            {fmt(score)}
          </span>
        </div>
      </div>

      <button
        className="w-full py-4 rounded-lg font-mono text-[13px] font-bold tracking-[2px] text-center text-white"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}
        onClick={handleNewRun}
      >
        NEW RUN
      </button>

      <button
        className="w-full py-3.5 rounded-lg font-mono text-xs font-semibold tracking-[2px] text-center mt-2"
        style={{ border: '1px solid rgba(255,255,255,0.06)', color: '#777' }}
        onClick={handleTitle}
      >
        TITLE SCREEN
      </button>
    </div>
  )
}
