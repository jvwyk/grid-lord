interface BadgeProps {
  label: string
  color: string
}

export default function Badge({ label, color }: BadgeProps) {
  return (
    <span
      className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded tracking-[1.5px]"
      style={{ background: color + '18', color }}
    >
      {label}
    </span>
  )
}
