import { useMetaStore } from '@/stores/metaStore'
import TitleScreen from '@/screens/TitleScreen'
import Dashboard from '@/screens/Dashboard'
import ToastStack from '@/components/shared/Toast'

export default function App() {
  const screen = useMetaStore((s) => s.screen)

  return (
    <div className="h-dvh overflow-hidden">
      <ToastStack />
      {screen === 'title' ? <TitleScreen /> : <Dashboard />}
    </div>
  )
}
