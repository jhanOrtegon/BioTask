import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Story, TrackedTask, AuditEntry, SectionData } from './types'
import type { TaskType } from '../templates/types'

interface StoriesState {
  stories: Story[]

  // ── Story CRUD ──
  addStory: (data: { code: string; title: string; module: string; description?: string }) => Story
  updateStory: (id: string, data: Partial<Pick<Story, 'code' | 'title' | 'module' | 'description'>>, comment: string) => void
  archiveStory: (id: string, comment: string) => void
  restoreStory: (id: string, comment: string) => void

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
  updateTask: (storyId: string, taskId: string, data: Partial<Pick<TrackedTask, 'title' | 'type' | 'featureName' | 'screenPath' | 'data' | 'jiraContent' | 'status' | 'estimatedHours' | 'sprintId' | 'priority' | 'dueDate' | 'checklists'>>, comment: string) => void
  archiveTask: (storyId: string, taskId: string, comment: string) => void

  // ── Time Tracking ──
  startTaskTimer: (storyId: string, taskId: string) => void
  pauseTaskTimer: (storyId: string, taskId: string) => void
  stopTaskTimer: (storyId: string, taskId: string) => void
  resetTaskTimer: (storyId: string, taskId: string) => void

  // ── Maintenance ──
  syncTasksIds: () => void

  // ── Helpers ──
  getStoryById: (id: string) => Story | undefined
}

function createAuditEntry(
  action: AuditEntry['action'],
  targetType: AuditEntry['targetType'],
  targetId: string,
  targetTitle: string,
  comment: string
): AuditEntry {
  return {
    id: crypto.randomUUID(),
    action,
    targetType,
    targetId,
    targetTitle,
    comment,
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
        const updatedStories = state.stories.map(story => {
          let storyChanged = false
          const updatedTasks = story.tasks.map(task => {
            // Check for missing or stringified "undefined" IDs
            if (!task.id || task.id === 'undefined') {
              fixCount++
              storyChanged = true
              return { ...task, id: crypto.randomUUID(), storyId: story.id }
            }
            // Ensure storyId is correctly set
            if (task.storyId !== story.id) {
              storyChanged = true
              return { ...task, storyId: story.id }
            }
            return task
          })

          if (storyChanged) {
            return { ...story, tasks: updatedTasks, updatedAt: new Date().toISOString() }
          }
          return story
        })

        if (fixCount > 0) {
          console.log(`Synced ${fixCount} tasks without IDs.`)
        }

        return { stories: updatedStories }
      }),

      getStoryById: (id) => get().stories.find(s => s.id === id),
    }),
    {
      name: 'stories-storage',
    }
  )
)
