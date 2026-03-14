import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Story, TrackedTask, AuditEntry, SectionData } from './types'
import type { TaskType } from '../templates/types'

interface StoriesState {
  stories: Story[]

  // ── Story CRUD ──
  addStory: (data: { code: string; title: string; module: string; description?: string; epicId?: string }) => Story
  updateStory: (id: string, data: Partial<Pick<Story, 'code' | 'title' | 'module' | 'description' | 'epicId'>>, comment: string) => void
  archiveStory: (id: string, comment: string) => void
  restoreStory: (id: string, comment: string) => void
  reorderStory: (storyId: string, newPosition: number) => void

  // ── Task CRUD ──
  addTaskToStory: (storyId: string, task: {
    templateId?: string
    title: string
    type: TaskType
    featureName?: string
    screenPath?: string
    data: SectionData
    jiraContent?: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    dueDate?: string
    checklists?: { id: string, title: string, completed: boolean }[]
    estimatedHours?: number
  }) => void
  updateTask: (storyId: string, taskId: string, data: Partial<Pick<TrackedTask, 'title' | 'type' | 'featureName' | 'screenPath' | 'data' | 'jiraContent' | 'status' | 'estimatedHours' | 'sprintId' | 'priority' | 'dueDate' | 'checklists' | 'position'>>, comment: string) => void
  reorderTask: (storyId: string, taskId: string, newPosition: number) => void
  moveTaskToStory: (sourceStoryId: string, destinationStoryId: string, taskId: string, newPosition: number) => void
  archiveTask: (storyId: string, taskId: string, comment?: string) => void

  // ── Time Tracking ──
  startTaskTimer: (storyId: string, taskId: string) => void
  pauseTaskTimer: (storyId: string, taskId: string) => void
  stopTaskTimer: (storyId: string, taskId: string) => void
  resetTaskTimer: (storyId: string, taskId: string) => void

  // ── Maintenance ──
  syncTasksIds: () => void

  // ── Helpers ──
  getStoryById: (id: string) => Story | undefined
  setStories: (stories: Story[]) => void
}

function createAuditEntry(
  action: AuditEntry['action'],
  targetType: AuditEntry['targetType'],
  targetId: string,
  targetTitle: string,
  comment?: string
): AuditEntry {
  return {
    id: crypto.randomUUID(),
    action,
    targetType,
    targetId,
    targetTitle,
    comment: comment || '',
    timestamp: new Date().toISOString(),
  }
}

export const useStoriesStore = create<StoriesState>()(
  persist(
    (set, get) => ({
      stories: [],

      addStory: (data) => {
        const now = new Date().toISOString()
        const newStory: Story = {
          id: crypto.randomUUID(),
          ...data,
          status: 'active',
          tasks: [],
          auditLog: [
            createAuditEntry('created', 'story', '', data.title, 'Historia creada')
          ],
          createdAt: now,
          updatedAt: now,
          position: get().stories.length > 0 ? Math.max(...get().stories.map(s => s.position || 0)) + 1000 : 1000,
        }
        // Set the auditLog targetId to match the story id
        newStory.auditLog[0].targetId = newStory.id

        set((state) => ({
          stories: [...state.stories, newStory]
        }))
        return newStory
      },

      updateStory: (id, data, comment) => set((state) => ({
        stories: state.stories.map(s => {
          if (s.id !== id) return s
          const updated = { ...s, ...data, updatedAt: new Date().toISOString() }
          updated.auditLog = [
            ...s.auditLog,
            createAuditEntry('updated', 'story', id, updated.title, comment)
          ]
          return updated
        })
      })),

      archiveStory: (id, comment) => set((state) => ({
        stories: state.stories.map(s => {
          if (s.id !== id) return s
          return {
            ...s,
            status: 'archived' as const,
            updatedAt: new Date().toISOString(),
            auditLog: [
              ...s.auditLog,
              createAuditEntry('archived', 'story', id, s.title, comment)
            ]
          }
        })
      })),

      restoreStory: (id, comment) => set((state) => ({
        stories: state.stories.map(s => {
          if (s.id !== id) return s
          return {
            ...s,
            status: 'active' as const,
            updatedAt: new Date().toISOString(),
            auditLog: [
              ...s.auditLog,
              createAuditEntry('restored', 'story', id, s.title, comment)
            ]
          }
        })
      })),

      reorderStory: (storyId, newPosition) => set((state) => ({
        stories: state.stories.map(s => {
          if (s.id !== storyId) return s
          return {
            ...s,
            position: newPosition,
            updatedAt: new Date().toISOString()
          }
        })
      })),

      addTaskToStory: (storyId, taskData) => set((state) => {
        return {
          stories: state.stories.map(s => {
            if (s.id !== storyId) return s
            const now = new Date().toISOString()
            const newTask: TrackedTask = {
              ...taskData,
              id: crypto.randomUUID(),
              storyId,
              status: 'pending',
              priority: taskData.priority,
              dueDate: taskData.dueDate,
              checklists: taskData.checklists || [],
              timeSpent: 0,
              timeLogs: [],
              position: s.tasks.length > 0 ? Math.max(...s.tasks.map(t => t.position || 0)) + 1000 : 1000,
              createdAt: now,
              updatedAt: now,
            }
            return {
              ...s,
              updatedAt: now,
              tasks: [...s.tasks, newTask],
              auditLog: [
                ...s.auditLog,
                createAuditEntry('created', 'task', newTask.id, newTask.title, 'Tarea creada')
              ]
            }
          })
        }
      }),

      updateTask: (storyId, taskId, data, comment) => set((state) => ({
        stories: state.stories.map(s => {
          if (s.id !== storyId) return s
          const now = new Date().toISOString()
          const tasks = s.tasks.map(t => {
            if (t.id !== taskId) return t
            return { ...t, ...data, updatedAt: now }
          })
          const task = tasks.find(t => t.id === taskId)
          return {
            ...s,
            tasks,
            updatedAt: now,
            auditLog: [
              ...s.auditLog,
              createAuditEntry('updated', 'task', taskId, task?.title || '', comment)
            ]
          }
        })
      })),

      reorderTask: (storyId, taskId, newPosition) => set((state) => ({
        stories: state.stories.map(s => {
          if (s.id !== storyId) return s
          const now = new Date().toISOString()
          return {
            ...s,
            updatedAt: now,
            tasks: s.tasks.map(t =>
              t.id === taskId ? { ...t, position: newPosition, updatedAt: now } : t
            )
          }
        })
      })),

      moveTaskToStory: (sourceStoryId, destStoryId, taskId, newPosition) => set((state) => {
        const sourceStory = state.stories.find(s => s.id === sourceStoryId)
        const destStory = state.stories.find(s => s.id === destStoryId)
        const task = sourceStory?.tasks.find(t => t.id === taskId)

        if (!sourceStory || !destStory || !task) return state

        const now = new Date().toISOString()
        const updatedTask = { ...task, position: newPosition, updatedAt: now }

        return {
          stories: state.stories.map(s => {
            if (s.id === sourceStoryId) {
              return {
                ...s,
                tasks: s.tasks.filter(t => t.id !== taskId),
                updatedAt: now,
                auditLog: [
                  ...s.auditLog,
                  createAuditEntry('updated', 'task', taskId, task.title, `Tarea movida fuera de la historia`)
                ]
              }
            }
            if (s.id === destStoryId) {
              return {
                ...s,
                tasks: [...s.tasks, updatedTask],
                updatedAt: now,
                auditLog: [
                  ...s.auditLog,
                  createAuditEntry('updated', 'task', taskId, task.title, `Tarea movida a esta historia`)
                ]
              }
            }
            return s
          })
        }
      }),

      archiveTask: (storyId, taskId, comment) => set((state) => ({
        stories: state.stories.map(s => {
          if (s.id !== storyId) return s
          const now = new Date().toISOString()
          const task = s.tasks.find(t => t.id === taskId)
          return {
            ...s,
            updatedAt: now,
            tasks: s.tasks.map(t =>
              t.id === taskId ? { ...t, status: 'archived' as const, updatedAt: now } : t
            ),
            auditLog: [
              ...s.auditLog,
              createAuditEntry('archived', 'task', taskId, task?.title || '', comment)
            ]
          }
        })
      })),

      startTaskTimer: (storyId, taskId) => set((state) => ({
        stories: state.stories.map(s => {
          if (s.id !== storyId) return s
          const now = new Date().toISOString()
          const tasks = s.tasks.map(t => {
            if (t.id !== taskId) return t
            
            // Si ya hay un timer activo, no hacer nada
            const logs = t.timeLogs || []
            const hasActiveLog = logs.some(l => !l.endedAt)
            if (hasActiveLog) return t

            return {
              ...t,
              status: 'in_progress' as const,
              timeLogs: [...logs, { startedAt: now }],
              updatedAt: now
            }
          })
          return { ...s, tasks, updatedAt: now }
        })
      })),

      pauseTaskTimer: (storyId, taskId) => set((state) => ({
        stories: state.stories.map(s => {
          if (s.id !== storyId) return s
          const now = new Date().toISOString()
          const tasks = s.tasks.map(t => {
            if (t.id !== taskId) return t
            
            const logs = [...(t.timeLogs || [])]
            const activeLogIndex = logs.findIndex(l => !l.endedAt)
            if (activeLogIndex === -1) return t

            const startedAt = new Date(logs[activeLogIndex].startedAt).getTime()
            const endedAt = new Date(now).getTime()
            const elapsedSeconds = Math.floor((endedAt - startedAt) / 1000)

            logs[activeLogIndex].endedAt = now

            return {
              ...t,
              timeSpent: (t.timeSpent || 0) + elapsedSeconds,
              timeLogs: logs,
              updatedAt: now
            }
          })
          return { ...s, tasks, updatedAt: now }
        })
      })),

      stopTaskTimer: (storyId, taskId) => set((state) => {
        // Ejecutamos logicamente un pauseTaskTimer pero también cambiando el status a completed.
        return {
          stories: state.stories.map(s => {
            if (s.id !== storyId) return s
            const now = new Date().toISOString()
            
            const tasks = s.tasks.map(t => {
              if (t.id !== taskId) return t
              
              const logs = [...(t.timeLogs || [])]
              const activeLogIndex = logs.findIndex(l => !l.endedAt)
              
              let additionalTime = 0
              if (activeLogIndex !== -1) {
                const startedAt = new Date(logs[activeLogIndex].startedAt).getTime()
                const endedAt = new Date(now).getTime()
                additionalTime = Math.floor((endedAt - startedAt) / 1000)
                logs[activeLogIndex].endedAt = now
              }

              return {
                ...t,
                status: 'completed' as const,
                timeSpent: (t.timeSpent || 0) + additionalTime,
                timeLogs: logs,
                updatedAt: now
              }
            })

            const updatedTask = tasks.find(t => t.id === taskId)
            return {
              ...s,
              tasks,
              updatedAt: now,
              auditLog: [
                ...s.auditLog,
                createAuditEntry('updated', 'task', taskId, updatedTask?.title || '', 'Tarea marcada como finalizada')
              ]
            }
          })
        }
      }),

      resetTaskTimer: (storyId: string, taskId: string) => set((state) => ({
        stories: state.stories.map(s => {
          if (s.id !== storyId) return s
          const now = new Date().toISOString()
          const tasks = s.tasks.map(t => {
            if (t.id !== taskId) return t
            return {
              ...t,
              timeSpent: 0,
              timeLogs: [],
              updatedAt: now
            }
          })
          const task = tasks.find(t => t.id === taskId)
          return {
            ...s,
            tasks,
            updatedAt: now,
            auditLog: [
              ...s.auditLog,
              createAuditEntry('updated', 'task', taskId, task?.title || '', 'Contador de tiempo reiniciado')
            ]
          }
        })
      })),

      syncTasksIds: () => set((state) => {
        let fixCount = 0
        const updatedStories = state.stories.map((story, storyIndex) => {
          let storyChanged = false
          const currentStory = { ...story }

          // Ensure story position is set
          if (typeof story.position !== 'number') {
            currentStory.position = (storyIndex + 1) * 1000
            storyChanged = true
          }

          const updatedTasks = story.tasks.map((task, index) => {
            const updatedTask = { ...task }
            let taskChanged = false

            // Check for missing or stringified "undefined" IDs
            if (!task.id || task.id === 'undefined') {
              fixCount++
              updatedTask.id = crypto.randomUUID()
              taskChanged = true
            }

            // Ensure storyId is correctly set
            if (task.storyId !== currentStory.id) {
              updatedTask.storyId = currentStory.id
              taskChanged = true
            }

            // Ensure position is set
            if (typeof updatedTask.position !== 'number') {
              updatedTask.position = (index + 1) * 1000
              taskChanged = true
            }

            if (taskChanged) {
              storyChanged = true
              return updatedTask
            }
            return task
          })

          if (storyChanged) {
            return { ...currentStory, tasks: updatedTasks, updatedAt: new Date().toISOString() }
          }
          return story
        })

        if (fixCount > 0) {
          console.log(`Synced ${String(fixCount)} tasks without IDs.`)
        }

        return { stories: updatedStories }
      }),

      getStoryById: (id) => get().stories.find(s => s.id === id),
      setStories: (stories) => set({ stories }),
    }),
    {
      name: 'stories-storage',
    }
  )
)
