import { create } from 'zustand'

interface MetaState {
  screen: 'title' | 'game'
  hasSave: boolean
  careerOpen: boolean
  setScreen: (screen: 'title' | 'game') => void
  setHasSave: (has: boolean) => void
  setCareerOpen: (open: boolean) => void
}

export const useMetaStore = create<MetaState>()((set) => ({
  screen: 'title',
  hasSave: false,
  careerOpen: false,
  setScreen: (screen) => set({ screen }),
  setHasSave: (has) => set({ hasSave: has }),
  setCareerOpen: (open) => set({ careerOpen: open }),
}))
