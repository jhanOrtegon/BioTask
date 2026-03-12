import type { TaskType, ServiceDetail } from '../templates/types'

// ── Datos estructurados de una tarea ──
export interface SectionData {
  objective: string
  services: ServiceDetail[]
  requirements: string[]
  validations: string[]
}

// ── Registro de Tiempo ──
export type TimeLog = {
  startedAt: string
  endedAt?: string
}

// ── Checklist Item ──
export interface ChecklistItem {
  id: string
  title: string
  completed: boolean
}

// ── Tarea rastreada dentro de una historia ──
export interface TrackedTask {
  id: string
  code?: string
  storyId: string
  templateId?: string
  title: string
  type: TaskType
  featureName?: string
  screenPath?: string
  data: SectionData
  jiraContent?: string
  status: 'pending' | 'in_progress' | 'completed' | 'archived'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  checklists?: ChecklistItem[]
  timeSpent?: number // In seconds
  estimatedHours?: number
  sprintId?: string
  timeLogs?: TimeLog[]
  createdAt: string
  updatedAt: string
}

// ── Entrada de auditoría ──
export interface AuditEntry {
  id: string
  action: 'created' | 'updated' | 'archived' | 'restored'
  targetType: 'story' | 'task'
  targetId: string
  targetTitle: string
  comment: string
  timestamp: string
}

// ── Historia (User Story de Jira) ──
export interface Story {
  id: string
  code: string            // Código Jira: "PROJ-1234"
  title: string
  module: string
  description?: string
  status: 'active' | 'archived'
  tasks: TrackedTask[]
  auditLog: AuditEntry[]
  createdAt: string
  updatedAt: string
}
