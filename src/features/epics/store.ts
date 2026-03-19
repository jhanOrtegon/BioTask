import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EpicsState, Epic } from './types'

export const useEpicsStore = create<EpicsState>()(
  persist(
    (set, get) => ({
      epics: [],

      setEpics: (epics: Epic[]) => {
        set({ epics })
      },

      addEpic: (epicData: Omit<Epic, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => {
        const newEpic: Epic = {
          ...epicData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progress: 0,
        }
        set((state) => ({ 
          epics: [...state.epics, newEpic] 
        }))
      },

      updateEpic: (id: string, updates: Partial<Omit<Epic, 'id' | 'createdAt'>>) => {
        set((state) => ({
          epics: state.epics.map((e) => 
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        }))
      },

      removeEpic: (id: string) => {
        set((state) => ({ 
          epics: state.epics.filter((e) => e.id !== id) 
        }))
      },

      getEpicById: (id: string) => {
        return get().epics.find((e) => e.id === id)
      },
    }),
    {
      name: 'biotask-epics-storage',
    }
  )
)
