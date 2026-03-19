import type { TrackedTask } from '@/features/stories/types'

export interface StoryAuditEntry {
 date: string
 action: string
 user: string
 comment?: string
}

export interface StoryDetailState {
 showTimeline: boolean
 archiveDialog: { taskId: string; title: string } | null
 resetTimerDialog: { taskId: string; title: string } | null
 viewTask: TrackedTask | null
 editStoryDialog: boolean
 showUpdateConfirm: boolean
 showErrorDialog: { title: string; desc: string } | null
 showExportDialog: boolean
 showBulkDialog: boolean
 bulkText: string
 isCopied: boolean
 currentPage: number
}
