import { useGameStore } from '@/stores/gameStore'

export default function ToastStack() {
  const toasts = useGameStore((s) => s.toasts)

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-200 flex flex-col gap-1.5 max-w-[400px] w-[90%]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-in px-3.5 py-2.5 rounded-lg font-mono text-xs font-semibold"
          style={{
            background: 'rgba(17,17,17,0.95)',
            borderLeft: `3px solid ${t.color}`,
            color: '#E0E0E0',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          {t.msg}
        </div>
      ))}
    </div>
  )
}
