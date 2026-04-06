import { useGameStore } from '@/stores/gameStore'
import { riskColor, riskLabel } from '@/utils/format'

export default function RiskRow() {
  const risk = useGameStore((s) => s.risk)
  const color = riskColor(risk)
  const label = riskLabel(risk)

  return (
    <div
      className="flex items-center gap-2 mb-2.5 px-3 py-2 rounded-md"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
    >
      <span className="font-mono text-[9px] tracking-[2px] min-w-8" style={{ color: '#555' }}>
        HEAT
      </span>

      {/* Risk track */}
      <div
        className="flex-1 h-[5px] rounded-sm relative overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-sm relative transition-all duration-500"
          style={{
            width: `${risk}%`,
            background: `linear-gradient(90deg, #1a1a1a, ${color})`,
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Glint */}
          <div
            className="absolute top-0 w-[30%] h-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
              animation: 'glint 3s ease-in-out infinite',
            }}
          />
        </div>

        {/* Tick marks */}
        {[30, 55, 75].map((t) => (
          <div
            key={t}
            className="absolute -top-0.5 w-px h-[9px]"
            style={{ left: `${t}%`, background: 'rgba(255,255,255,0.1)' }}
          />
        ))}
      </div>

      <span className="font-mono text-xs font-bold min-w-8 text-right" style={{ color }}>
        {risk}%
      </span>

      <span
        className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded tracking-[1.5px]"
        style={{ background: color + '18', color }}
      >
        {label}
      </span>
    </div>
  )
}
