import { create } from 'zustand'

interface MetaState {
  screen: 'title' | 'game'
  setScreen: (screen: 'title' | 'game') => void
}

export const useMetaStore = create<MetaState>()((set) => ({
  screen: 'title',
  setScreen: (screen) => set({ screen }),
}))
