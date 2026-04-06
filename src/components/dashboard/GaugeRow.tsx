import { useGameStore, getGeneration, getDealMW } from '@/stores/gameStore'
import { STORAGE_MAX } from '@/data/balanceTables'
import { clamp } from '@/utils/format'

export default function GaugeRow() {
  const activePowerups = useGameStore((s) => s.activePowerups)
  const stored = useGameStore((s) => s.stored)
  const regions = useGameStore((s) => s.regions)
  const activeEffects = useGameStore((s) => s.activeEffects)
  const sheet = useGameStore((s) => s.sheet)
  const setSheet = useGameStore((s) => s.setSheet)

  const surgeActive = activePowerups.some((p) => p.effect === 'surge')
  const supplyReduced = activeEffects.some((e) => e.kind === 'supplyMult' && e.value < 1)
  const generation = getGeneration(useGameStore.getState())
  const dealMW = getDealMW(useGameStore.getState())
  const totalAllocated = regions.reduce((sum, r) => sum + r.allocated, 0)
  const allocPct = clamp((totalAllocated / generation) * 100, 0, 100)
  const dealPct = clamp((dealMW / generation) * 100, 0, 100)

  return (
    <div className="flex gap-2 mb-3">
      {/* Generation card */}
      <div
        className="flex-1 px-3 py-2.5 rounded-lg"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        <span className="block font-mono text-[8px] tracking-[2px] mb-1" style={{ color: '#555' }}>
          GENERATION{surgeActive ? ' ⚡' : ''}{supplyReduced ? ' ⚠️' : ''}
        </span>
        <span className="font-mono text-base font-bold" style={{ color: supplyReduced ? '#FFD60A' : surgeActive ? '#00E5A0' : '#FFF' }}>
          {generation}
          <span className="text-[11px] font-medium" style={{ color: '#555' }}> MW</span>
        </span>
        <div className="h-[3px] rounded-sm mt-1.5 overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-sm transition-all duration-300 absolute left-0 top-0"
            style={{
              width: `${allocPct}%`,
              background: totalAllocated > generation ? '#FF3B30' : '#00E5A0',
            }}
          />
          {dealMW > 0 && (
            <div
              className="h-full rounded-sm absolute top-0"
              style={{
                left: `${allocPct}%`,
                width: `${dealPct}%`,
                background: '#FF6B35',
                opacity: 0.7,
              }}
            />
          )}
        </div>
        <span className="block font-mono text-[9px] mt-0.5" style={{ color: '#444' }}>
          {totalAllocated} allocated{dealMW > 0 ? ` · ${dealMW} deal` : ''}
        </span>
      </div>

      {/* Storage card */}
      <button
        className="flex-1 px-3 py-2.5 rounded-lg text-left block"
        style={{ background: 'rgba(138,142,255,0.04)', border: '1px solid rgba(138,142,255,0.1)' }}
        onClick={() => setSheet(sheet === 'storage' ? null : 'storage')}
      >
        <span className="block font-mono text-[8px] tracking-[2px] mb-1" style={{ color: '#555' }}>
          STORAGE
        </span>
        <div className="flex items-center gap-2.5 mt-0.5">
          {/* Battery icon */}
          <div
            className="w-[18px] h-7 rounded-sm relative overflow-hidden"
            style={{ border: '2px solid rgba(138,142,255,0.3)' }}
          >
            <div
              className="absolute bottom-0 left-0 right-0 rounded-b-[1px] transition-all duration-300"
              style={{
                height: `${(stored / STORAGE_MAX) * 100}%`,
                background: 'linear-gradient(to top, #8E8AFF, #B0ADFF)',
              }}
            />
          </div>
          <div>
            <span className="font-mono text-base font-bold text-white">
              {stored}
              <span className="text-[11px] font-medium" style={{ color: '#555' }}>/{STORAGE_MAX}</span>
            </span>
            <span className="block font-mono text-[9px]" style={{ color: '#444' }}>
              Tap to manage
            </span>
          </div>
        </div>
      </button>
    </div>
  )
}
