import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/stores/gameStore'
import { fmt, clamp, allocColor, allocLabel, prioColor } from '@/utils/format'
import MiniBar from '@/components/shared/MiniBar'

export default function RegionCard({ regionId }: { regionId: string }) {
  const region = useGameStore((s) => s.regions.find((r) => r.id === regionId)!)
  const expandedRegion = useGameStore((s) => s.expandedRegion)
  const setExpandedRegion = useGameStore((s) => s.setExpandedRegion)
  const updateAllocation = useGameStore((s) => s.updateAllocation)

  const expanded = expandedRegion === regionId
  const pct = region.demand > 0 ? region.allocated / region.demand : 0
  const col = prioColor[region.priority]
  const ac = allocColor(pct)

  return (
    <div
      className="rounded-[10px] overflow-hidden transition-colors duration-200"
      style={{
        background: 'rgba(255,255,255,0.018)',
        border: `1px solid ${expanded ? col + '40' : 'rgba(255,255,255,0.05)'}`,
      }}
    >
      {/* Header row */}
      <button
        className="flex items-center gap-2.5 px-3.5 py-3 w-full text-left"
        onClick={() => setExpandedRegion(expanded ? null : regionId)}
      >
        <div
          className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-lg shrink-0"
          style={{ background: col + '12' }}
        >
          {region.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold font-mono">{region.name}</div>
          <div className="text-[11px] capitalize mt-px" style={{ color: '#555' }}>
            {region.priority} · {region.demand} MW · ${region.price}/MW
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {region.allocated > 0 ? (
            <div className="text-right">
              <div className="font-mono text-lg font-extrabold" style={{ color: ac }}>
                {region.allocated}
                <span className="text-[10px]" style={{ color: '#555' }}> MW</span>
              </div>
              <div className="font-mono text-[9px]" style={{ color: ac, opacity: 0.7 }}>
                {allocLabel(pct)}
              </div>
            </div>
          ) : (
            <span className="font-mono text-[10px]" style={{ color: '#333' }}>tap</span>
          )}
          <span
            className="text-sm transition-transform duration-200"
            style={{ color: '#444', transform: expanded ? 'rotate(180deg)' : '' }}
          >
            ▾
          </span>
        </div>
      </button>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="px-3.5 pb-3.5 overflow-hidden"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Trait */}
            <p className="py-2 text-[11px] italic leading-relaxed" style={{ color: '#666' }}>
              {region.trait}
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-2 pb-3">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[8px] tracking-[1.5px]" style={{ color: '#444' }}>Demand</span>
                <span className="font-mono text-[13px] font-bold" style={{ color: '#CCC' }}>{region.demand} MW</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[8px] tracking-[1.5px]" style={{ color: '#444' }}>Price</span>
                <span className="font-mono text-[13px] font-bold" style={{ color: '#FFD60A' }}>${region.price}/MW</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[8px] tracking-[1.5px]" style={{ color: '#444' }}>Stability</span>
                <div className="mt-1">
                  <MiniBar value={region.stability} />
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[8px] tracking-[1.5px]" style={{ color: '#444' }}>Revenue</span>
                <span className="font-mono text-[13px] font-bold" style={{ color: '#00E5A0' }}>
                  ${fmt(Math.min(region.allocated, region.demand) * region.price)}
                </span>
              </div>
            </div>

            {/* Allocation */}
            <div className="pb-2.5">
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="font-mono text-[9px] tracking-[2px]" style={{ color: '#555' }}>
                  ALLOCATE POWER
                </span>
                <span className="font-mono text-lg font-extrabold" style={{ color: ac }}>
                  {region.allocated}{' '}
                  <span className="text-[11px] opacity-40">/ {region.demand}</span>
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={region.demand + 30}
                step={5}
                value={region.allocated}
                onChange={(e) => updateAllocation(regionId, parseInt(e.target.value))}
                className="alloc-slider"
                style={{
                  '--fill-pct': `${(region.allocated / (region.demand + 30)) * 100}%`,
                  '--fill-color': ac,
                } as React.CSSProperties}
              />

              <div className="flex items-center gap-2.5">
                <div
                  className="flex-1 h-[3px] rounded-sm relative overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="h-full rounded-sm transition-all duration-200"
                    style={{ width: `${clamp(pct * 100, 0, 105)}%`, background: ac }}
                  />
                  <div
                    className="absolute -top-1 w-0.5 h-[11px] rounded-sm"
                    style={{
                      left: `${(region.demand / (region.demand + 30)) * 100}%`,
                      background: 'rgba(255,255,255,0.2)',
                    }}
                  />
                </div>
                <span className="font-mono text-[10px] font-semibold min-w-[60px]" style={{ color: ac }}>
                  {allocLabel(pct)}
                </span>
              </div>

              {pct > 0 && pct < 0.5 && (
                <div
                  className="text-[11px] mt-1.5 px-2.5 py-1.5 rounded"
                  style={{
                    color: '#FF6B35',
                    background: 'rgba(255,107,53,0.05)',
                    border: '1px solid rgba(255,107,53,0.08)',
                  }}
                >
                  ⚠ Blackout risk — unrest and price spikes likely
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex gap-1.5 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <button
                className="flex-1 py-2 rounded-[5px] font-mono text-[10px] font-semibold"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  color: '#777',
                }}
                onClick={() => updateAllocation(regionId, region.demand)}
              >
                Match demand
              </button>
              <button
                className="flex-1 py-2 rounded-[5px] font-mono text-[10px] font-semibold"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  color: '#777',
                }}
                onClick={() => updateAllocation(regionId, 0)}
              >
                Cut power
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
