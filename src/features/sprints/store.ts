import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SprintsState, Sprint } from './types'

export const useSprintsStore = create<SprintsState>()(
  persist(
    (set) => ({
      sprints: [],

      addSprint: (data) => {
        const now = new Date().toISOString()
        const newSprint: Sprint = {
          id: crypto.randomUUID(),
          ...data,
          status: 'planning',
          storyIds: [],
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          sprints: [...state.sprints, newSprint]
        }))
        return newSprint
      },

      updateSprint: (id, data) => set((state) => ({
        sprints: state.sprints.map(s => 
          s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
        )
      })),

      deleteSprint: (id) => set((state) => ({
        sprints: state.sprints.filter(s => s.id !== id)
      })),

      addStoryToSprint: (sprintId, storyId) => set((state) => ({
        sprints: state.sprints.map(s => {
          if (s.id !== sprintId) return s
          // Evitar duplicados
          if (s.storyIds.includes(storyId)) return s
          return {
            ...s,
            storyIds: [...s.storyIds, storyId],
            updatedAt: new Date().toISOString()
          }
        })
      })),

      removeStoryFromSprint: (sprintId, storyId) => set((state) => ({
        sprints: state.sprints.map(s => {
          if (s.id !== sprintId) return s
          return {
            ...s,
            storyIds: s.storyIds.filter(id => id !== storyId),
            updatedAt: new Date().toISOString()
          }
        })
      }))
    }),
    {
      name: 'sprints-storage'
    }
  )
)
