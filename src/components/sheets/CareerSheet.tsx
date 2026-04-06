import { useState } from 'react'
import { useMetaStore } from '@/stores/metaStore'
import { loadCareer, clearCareer } from '@/hooks/usePersistence'
import { fmt } from '@/utils/format'

const resultColor: Record<string, string> = {
  victory: '#00E5A0',
  gameover: '#FF3B30',
  abandoned: '#555',
}

const resultLabel: Record<string, string> = {
  victory: 'SURVIVED',
  gameover: 'GAME OVER',
  abandoned: 'ABANDONED',
}

export default function CareerSheet() {
  const setCareerOpen = useMetaStore((s) => s.setCareerOpen)
  const [career, setCareer] = useState(() => loadCareer())
  const [confirmClear, setConfirmClear] = useState(false)

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    clearCareer()
    setCareer(loadCareer())
    setConfirmClear(false)
  }

  return (
    <div className="px-5 py-5 pb-8">
      <div className="flex justify-between items-center mb-4">
        <span className="font-mono text-base font-bold tracking-[2px]" style={{ color: '#FFD60A' }}>
          Career
        </span>
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#555' }}
          onClick={() => setCareerOpen(false)}
        >
          ✕
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div
          className="p-3 rounded-lg flex flex-col items-center gap-0.5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="font-mono text-[8px] tracking-[2px]" style={{ color: '#555' }}>TOTAL RUNS</span>
          <span className="font-mono text-lg font-extrabold text-white">{career.totalRuns}</span>
        </div>
        <div
          className="p-3 rounded-lg flex flex-col items-center gap-0.5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="font-mono text-[8px] tracking-[2px]" style={{ color: '#555' }}>VICTORIES</span>
          <span className="font-mono text-lg font-extrabold" style={{ color: '#00E5A0' }}>
            {career.victories}
          </span>
        </div>
        <div
          className="p-3 rounded-lg flex flex-col items-center gap-0.5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="font-mono text-[8px] tracking-[2px]" style={{ color: '#555' }}>BEST SCORE</span>
          <span className="font-mono text-lg font-extrabold" style={{ color: '#FFD60A' }}>
            {fmt(career.bestScore)}
          </span>
        </div>
        <div
          className="p-3 rounded-lg flex flex-col items-center gap-0.5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="font-mono text-[8px] tracking-[2px]" style={{ color: '#555' }}>BEST STREAK</span>
          <span className="font-mono text-lg font-extrabold" style={{ color: '#FF6B35' }}>
            {career.bestStreak}
          </span>
        </div>
      </div>

      {/* Run history */}
      <div className="mb-4">
        <span className="block font-mono text-[9px] tracking-[2px] mb-2" style={{ color: '#444' }}>
          RUN HISTORY
        </span>

        {career.runs.length === 0 ? (
          <div
            className="p-4 rounded-lg text-center text-xs"
            style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.04)', color: '#444' }}
          >
            No runs yet. Start your first game!
          </div>
        ) : (
          <div
            className="flex flex-col gap-1.5 max-h-[40vh] overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
          >
            {career.runs.map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded tracking-[1px]"
                      style={{ background: resultColor[run.result] + '18', color: resultColor[run.result] }}
                    >
                      {resultLabel[run.result]}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: '#444' }}>
                      Day {run.day}
                    </span>
                  </div>
                  <span className="font-mono text-[10px]" style={{ color: '#555' }}>
                    {new Date(run.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-sm font-bold" style={{ color: '#FFD60A' }}>
                    {fmt(run.score)}
                  </div>
                  <div className="font-mono text-[10px]" style={{ color: '#00E5A0' }}>
                    ${fmt(run.totalProfit)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {career.runs.length > 0 && (
        <button
          className="w-full py-3 rounded-lg font-mono text-[11px] font-semibold tracking-[2px] text-center mb-2"
          style={{
            border: `1px solid ${confirmClear ? 'rgba(255,59,48,0.3)' : 'rgba(255,255,255,0.06)'}`,
            background: confirmClear ? 'rgba(255,59,48,0.06)' : 'transparent',
            color: confirmClear ? '#FF3B30' : '#555',
          }}
          onClick={handleClear}
        >
          {confirmClear ? 'TAP AGAIN TO CONFIRM' : 'CLEAR HISTORY'}
        </button>
      )}

      <button
        className="w-full py-4 rounded-lg font-mono text-[13px] font-bold tracking-[2px] text-center text-white"
        style={{ background: 'linear-gradient(135deg, #FF6B35, #E05520)' }}
        onClick={() => setCareerOpen(false)}
      >
        CLOSE
      </button>
    </div>
  )
}
