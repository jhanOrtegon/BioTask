---
name: tasks
description: Guide for the Tasks module — task lifecycle, time tracking, status transitions, and the dynamic editor integration.
---

# Tasks Module

## Overview
Tasks (`TrackedTask`) are the atomic unit of work. They live inside Stories and are the primary tracked item for developer activity, time investment, and progress. Time tracking is built-in through `timeLogs`.

## Key Files
- **Stored inside**: `src/features/stories/store.ts` — tasks are nested under `Story.tasks[]`.
- **Types**: `src/features/stories/types.ts` — `TrackedTask`, `TimeLog`, `ChecklistItem`.
- **All-tasks page**: `src/pages/tasks/TasksPage.tsx` (route: `/tasks`) — cross-story view.
- **Page hook**: `src/pages/tasks/hooks/useTasksLogic.ts`
- **Table**: `src/pages/tasks/components/TasksTable.tsx`
- **Story-detail table**: `src/pages/story-detail/components/TaskTable.tsx` — with DnD + timers.
- **LiveTimer component**: `src/features/tasks/components/LiveTimer.tsx`

## TrackedTask Interface
```ts
interface TrackedTask {
  id: string
  code?: string             // e.g. "BE-001"
  techPrefix?: 'BE-' | 'FE-' | 'LEAD-' | 'QA-' | 'DS-' | 'UT-' | 'API-' | 'SEC-'
  storyId: string
  title: string
  type: TaskType            // from templates
  status: 'pending' | 'in_progress' | 'completed' | 'archived' | 'blocked'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  timeSpent?: number        // total seconds
  estimatedHours?: number
  timeLogs?: TimeLog[]      // [{startedAt, endedAt?, memberId?}]
  assignedTo?: string       // TeamMember ID
  checklists?: ChecklistItem[]
  position: number          // for DnD ordering within story
  createdAt: string
  updatedAt: string
}
```

## Status Transitions
Valid transitions:
- `pending` → `in_progress` → `completed`
- Any → `archived` (requires confirmation + comment)
- `archived` → cannot be restored to active; create a new task instead.

When transitioning to `completed`, the timer is automatically stopped: `stopTaskTimer(storyId, taskId)`.
When transitioning to `archived`, show the archive confirmation dialog.

## Time Tracking
Time is tracked via `timeLogs`:
- **Start**: `startTaskTimer(storyId, taskId)` — pushes a new log with `startedAt = now()`, no `endedAt`.
- **Pause**: `pauseTaskTimer(storyId, taskId)` — sets `endedAt` on the active log.
- **Stop**: `stopTaskTimer(storyId, taskId)` — sets `endedAt` and also marks status as `completed`.
- **Reset**: Zero out `timeLogs` and `timeSpent` (requires confirmation).

A timer is "running" when `timeLogs.some(l => !l.endedAt)` is true.

`LiveTimer` automatically re-renders every second when the timer is running.

## Task Alerts
`getTaskAlertStatus(task)` from `src/shared/utils/task-utils.ts` returns alert objects:
- `{ type: 'error' | 'warning' | 'info', message: string }`
- Shows indicators for overdue tasks, exceeded estimates, and blocked status.

## Dynamic Editor
- Opened via "Edit" button in `TaskTable` or `TasksTable`.
- Uses `DynamicTaskEditor` component from `src/features/tasks/components/dynamic-editor/`.
- Powered by a JSON template system; the task's `data` field holds structured `SectionData`.
- In `readOnly` mode, shows `TaskVisualDetail` — all inputs are disabled.

## Task Table Layout
- `TasksTable` and `TaskTable` use `flex-1 overflow-hidden flex flex-col`.
- Header: `sticky top-0 z-10 bg-card backdrop-blur-md border-b border-border`.
- Body: `flex-1 overflow-auto custom-scrollbar`.
- In `story-detail`: `TaskTable` also supports DnD via `@hello-pangea/dnd`.
