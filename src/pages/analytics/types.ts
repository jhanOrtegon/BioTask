export interface DevPerformance {
 id: string
 name: string
 specialty: string
 avatar?: string
 totalHours: number
 todayHours: number
 completedTasks: number
 blockedTasks: number
 activeTasks: number
 efficiency: number
 insight: string
 status: 'success' | 'warning' | 'danger' | 'neutral'
}
