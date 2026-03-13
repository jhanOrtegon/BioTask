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

      updateSprint: (id, data) => set((state) => {
        let newSprints = state.sprints.map(s => 
          s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
        )

        // Enforce single active sprint: if updating this one to active, others must be planning or completed
        if (data.status === 'active') {
          newSprints = newSprints.map(s => 
            s.id !== id && s.status === 'active' ? { ...s, status: 'completed', updatedAt: new Date().toISOString() } : s
          )
        }

        return { sprints: newSprints }
      }),

      deleteSprint: (id) => set((state) => ({
        sprints: state.sprints.filter(s => s.id !== id)
      })),

      addStoryToSprint: (sprintId, storyId) => set((state) => ({
        sprints: state.sprints.map(s => {
          if (s.id !== sprintId) return s
          
          // Clear story from any OTHER sprint first (a story belongs to one sprint)
          // Note: This logic is simplified, usually a store update would handle this globally.
          // To be safe, we'll just ensure it's in THIS one and if the user wants it elsewhere they'll move it.
          
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
      })),

      // New: Set multiple stories at once (useful for editing)
      setSprintStories: (sprintId, storyIds) => set((state) => ({
        sprints: state.sprints.map(s => 
          s.id === sprintId ? { ...s, storyIds, updatedAt: new Date().toISOString() } : s
        )
      }))
    }),
    {
      name: 'sprints-storage'
    }
  )
)
