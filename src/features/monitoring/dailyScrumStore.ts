import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PlannedTaskAssignment {
  taskId: string
  title: string
  storyCode?: string
  plannedHours: number
  status: 'pending' | 'in_progress' | 'qa' | 'completed' | 'blocked' | 'archived'
}

export interface DailyUpdateReason {
  at: string
  reason: string
}

export interface DailyDevReport {
  id: string
  dateKey: string // yyyy-MM-dd
  memberId: string
  teamId?: string
  todayResponsibilities: string
  blockers: string
  helpNeeded: string
  scrumNotes: string
  plannedAssignments: PlannedTaskAssignment[]
  expectedHours: number
  updateReasons: DailyUpdateReason[]
  updatedAt: string
}

interface DailyScrumState {
  reports: DailyDevReport[]
  upsertReport: (input: Omit<DailyDevReport, 'id' | 'updatedAt' | 'updateReasons'>, reason?: string) => void
  clearDayReports: (dateKey: string) => void
  setReports: (reports: DailyDevReport[]) => void
}

export const useDailyScrumStore = create<DailyScrumState>()(
  persist(
    (set) => ({
      reports: [],

      upsertReport: (input, reason) =>
        set((state) => {
          const existing = state.reports.find(
            (r) => r.dateKey === input.dateKey && r.memberId === input.memberId,
          )

          if (existing) {
            return {
              reports: state.reports.map((r) =>
                r.id === existing.id
                  ? {
                      ...r,
                      ...input,
                      updateReasons: reason
                        ? [...r.updateReasons, { at: new Date().toISOString(), reason }]
                        : r.updateReasons,
                      updatedAt: new Date().toISOString(),
                    }
                  : r,
              ),
            }
          }

          return {
            reports: [
              ...state.reports,
              {
                id: crypto.randomUUID(),
                ...input,
                updateReasons: reason
                  ? [{ at: new Date().toISOString(), reason }]
                  : [],
                updatedAt: new Date().toISOString(),
              },
            ],
          }
        }),

      clearDayReports: (dateKey) =>
        set((state) => ({
          reports: state.reports.filter((r) => r.dateKey !== dateKey),
        })),

      setReports: (reports) => set({ reports }),
    }),
    {
      name: 'daily-scrum-storage',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as { reports?: Array<Partial<DailyDevReport>> } | undefined
        return {
          reports: (state?.reports || []).map((report) => ({
            id: report.id || crypto.randomUUID(),
            dateKey: report.dateKey || new Date().toISOString().slice(0, 10),
            memberId: report.memberId || '',
            teamId: report.teamId,
            todayResponsibilities: report.todayResponsibilities || '',
            blockers: report.blockers || '',
            helpNeeded: report.helpNeeded || '',
            scrumNotes: report.scrumNotes || '',
            plannedAssignments: report.plannedAssignments || [],
            expectedHours: report.expectedHours || 7,
            updateReasons: report.updateReasons || [],
            updatedAt: report.updatedAt || new Date().toISOString(),
          })),
        }
      },
    },
  ),
)
