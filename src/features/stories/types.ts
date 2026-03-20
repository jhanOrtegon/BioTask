import type { TaskType, ServiceDetail } from '../templates/types'

// -- Structured task data --
export interface SectionData {
 objective: string
 services: ServiceDetail[]
 requirements: string[]
 validations: string[]
}

// -- Time Tracking --
export type TimeLog = {
 startedAt: string
 endedAt?: string
 memberId?: string
}

// -- Checklist Item --
export interface ChecklistItem {
 id: string
 title: string
 completed: boolean
}

// -- Tracked task within a story --
export interface TrackedTask {
  id: string;
  code?: string;
  techPrefix?:
    | "BE-"
    | "FE-"
    | "LEAD-"
    | "QA-"
    | "DS-"
    | "UT-"
    | "API-"
    | "SEC-";
  storyId: string;
  templateId?: string;
  title: string;
  type: TaskType;
  featureName?: string;
  screenPath?: string;
  data: SectionData;
  jiraContent?: string;
  status:
    | "pending"
    | "in_progress"
    | "qa"
    | "completed"
    | "archived"
    | "blocked";
  priority?: "low" | "medium" | "high" | "urgent";
  isBlocked?: boolean;
  blockReason?: string;
  dueDate?: string;
  checklists?: ChecklistItem[];
  timeSpent?: number; // In seconds
  estimatedHours?: number;
  sprintId?: string;
  assignedTo?: string; // TeamMember ID
  timeLogs?: TimeLog[];
  position: number; // For manual reordering
  createdAt: string;
  updatedAt: string;
}

// -- Audit Entry --
export interface AuditEntry {
 id: string
 action: 'created' | 'updated' | 'archived' | 'restored'
 targetType: 'story' | 'task'
 targetId: string
 targetTitle: string
 comment: string
 timestamp: string
 performedBy?: string // TeamMember ID
}

// -- Story (Jira User Story) --
export interface Story {
 id: string
 code: string // Jira Code: "PROJ-1234"
 title: string
 module: string
 description?: string
 status: 'active' | 'archived'
 isBlocked?: boolean
 epicId?: string
 tasks: TrackedTask[]
 auditLog: AuditEntry[]
 createdAt: string
 updatedAt: string
 position: number
}
