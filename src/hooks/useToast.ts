import { useGameStore } from '@/stores/gameStore'

export function useToast() {
  const addToast = useGameStore((s) => s.addToast)
  return addToast
}
