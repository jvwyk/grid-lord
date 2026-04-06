import { useGameStore } from '@/stores/gameStore'
import { sevColor } from '@/utils/format'

export default function EventSheet() {
  const event = useGameStore((s) => s.currentEvent)
  const setSheet = useGameStore((s) => s.setSheet)

  if (!event) return null

  const color = sevColor(event.severity)

  return (
    <div className="px-5 py-5 pb-8 text-center">
      <span
        className="inline-block font-mono text-[9px] font-bold px-3 py-1 rounded tracking-[3px] mb-3.5"
        style={{ background: color + '18', color }}
      >
        {event.severity.toUpperCase()}
      </span>

      <div className="text-[52px] mb-2">{event.icon}</div>

      <h2 className="font-mono text-[22px] font-extrabold tracking-[2px] text-white mb-1.5">
        {event.title}
      </h2>

      <p className="text-sm leading-relaxed max-w-[300px] mx-auto mb-4.5" style={{ color: '#999' }}>
        {event.desc}
      </p>

      <span
        className="inline-block font-mono text-xs font-semibold px-4 py-2 rounded-md mb-2"
        style={{ border: `1px solid ${color}30`, background: color + '08', color }}
      >
        {event.effect}
      </span>

      <button
        className="w-full py-4 rounded-lg font-mono text-[13px] font-bold tracking-[2px] text-center mt-4 text-white"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}BB)` }}
        onClick={() => setSheet(null)}
      >
        ACKNOWLEDGE
      </button>
    </div>
  )
}
