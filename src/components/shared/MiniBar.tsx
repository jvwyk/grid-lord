interface MiniBarProps {
  value: number
  max?: number
  color?: string
}

export default function MiniBar({ value, max = 100, color }: MiniBarProps) {
  const pct = max > 0 ? (value / max) * 100 : 0
  const barColor =
    color ?? (value > 70 ? '#00E5A0' : value > 40 ? '#FFD60A' : '#FF3B30')

  return (
    <div className="w-full h-[3px] rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div
        className="h-full rounded-sm transition-all duration-300"
        style={{ width: `${pct}%`, background: barColor }}
      />
    </div>
  )
}
