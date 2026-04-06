import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/stores/gameStore'
import { BASE_GENERATION, SURGE_BONUS_MW, STORAGE_MAX } from '@/data/balanceTables'

export default function StoragePanel() {
  const sheet = useGameStore((s) => s.sheet)
  const stored = useGameStore((s) => s.stored)
  const regions = useGameStore((s) => s.regions)
  const activePowerups = useGameStore((s) => s.activePowerups)
  const storeEnergy = useGameStore((s) => s.storeEnergy)
  const setSheet = useGameStore((s) => s.setSheet)

  const generation = BASE_GENERATION + (activePowerups.some((p) => p.effect === 'surge') ? SURGE_BONUS_MW : 0)
  const totalAllocated = regions.reduce((sum, r) => sum + r.allocated, 0)
  const remaining = generation + stored - totalAllocated
  const open = sheet === 'storage'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="px-3.5 py-3.5 rounded-lg mb-3 overflow-hidden"
          style={{ background: 'rgba(138,142,255,0.04)', border: '1px solid rgba(138,142,255,0.1)' }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-mono text-[13px] font-bold" style={{ color: '#8E8AFF' }}>
              Energy Storage
            </span>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#555' }}
              onClick={() => setSheet(null)}
            >
              ✕
            </button>
          </div>

          <p className="text-xs leading-relaxed mb-3" style={{ color: '#666' }}>
            Store surplus for future turns or release to meet demand.
          </p>

          <div className="flex gap-2 mb-3">
            <button
              className="flex-1 py-2.5 rounded-md font-mono text-[11px] font-semibold"
              style={{
                background: 'rgba(138,142,255,0.1)',
                border: '1px solid rgba(138,142,255,0.2)',
                color: '#8E8AFF',
                opacity: stored >= STORAGE_MAX || remaining <= 0 ? 0.3 : 1,
              }}
              disabled={stored >= STORAGE_MAX || remaining <= 0}
              onClick={() => storeEnergy(10)}
            >
              ↓ Store +10
            </button>
            <button
              className="flex-1 py-2.5 rounded-md font-mono text-[11px] font-semibold"
              style={{
                background: 'rgba(0,229,160,0.06)',
                border: '1px solid rgba(0,229,160,0.15)',
                color: '#00E5A0',
                opacity: stored <= 0 ? 0.3 : 1,
              }}
              disabled={stored <= 0}
              onClick={() => storeEnergy(-10)}
            >
              ↑ Release 10
            </button>
          </div>

          <div className="h-[5px] rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="h-full rounded-sm transition-all duration-300"
              style={{
                width: `${(stored / STORAGE_MAX) * 100}%`,
                background: 'linear-gradient(90deg, #8E8AFF, #B0ADFF)',
              }}
            />
          </div>
          <div className="flex justify-between font-mono text-[9px] mt-0.5" style={{ color: '#444' }}>
            <span>0</span>
            <span>{STORAGE_MAX} MW</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
