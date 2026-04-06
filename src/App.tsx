import { useEffect, useRef } from 'react'
import { useMetaStore } from '@/stores/metaStore'
import { useGameStore } from '@/stores/gameStore'
import { saveGame, hasSavedGame } from '@/hooks/usePersistence'
import TitleScreen from '@/screens/TitleScreen'
import Dashboard from '@/screens/Dashboard'
import ToastStack from '@/components/shared/Toast'

export default function App() {
  const screen = useMetaStore((s) => s.screen)
  const setHasSave = useMetaStore((s) => s.setHasSave)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Detect saved game on mount
  useEffect(() => {
    setHasSave(hasSavedGame())
  }, [setHasSave])

  // Auto-save subscription — debounced 500ms
  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      // Only save when actively in a game
      if (useMetaStore.getState().screen !== 'game') return

      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        saveGame(state)
        useMetaStore.getState().setHasSave(true)
      }, 500)
    })

    return () => {
      unsub()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div className="h-dvh overflow-hidden">
      <ToastStack />
      {screen === 'title' ? <TitleScreen /> : <Dashboard />}
    </div>
  )
}
