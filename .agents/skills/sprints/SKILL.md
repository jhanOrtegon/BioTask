---
name: sprints
description: Guide for the Sprints module — sprint lifecycle, story linking, status transitions, and confirmation flows.
---

# Sprints Module

## Overview
Sprints represent time-boxed iteration cycles. Each sprint has a start/end date, a goal, and a list of linked story IDs. Only one sprint can be `active` at a time. Status transitions are managed with confirmation dialogs.

## Key Files
- **Feature store**: `src/features/sprints/store.ts` — actions: `addSprint`, `updateSprint`, `setSprintStories`.
- **Feature types**: `src/features/sprints/types.ts` — `Sprint`, `SprintStatus`.
- **Page**: `src/pages/sprints/SprintsPage.tsx` (route: `/sprints`)
- **Hook**: `src/pages/sprints/hooks/useSprintsLogic.ts` — exports `SprintFormValues`
- **Dialogs**: `src/pages/sprints/components/SprintsDialogs.tsx`
- **Card**: `src/pages/sprints/components/SprintCard.tsx`

## Sprint Interface
```ts
interface Sprint {
  id: string
  name: string            // e.g. "Sprint 42"
  goal?: string
  startDate: string       // ISO string
  endDate: string         // ISO string
  status: SprintStatus    // 'planned' | 'active' | 'completed'
  storyIds: string[]      // IDs of linked stories
  createdAt: string
  updatedAt: string
}
```

## Zod Schema (SprintFormValues)
```ts
const sprintSchema = z.object({
  name: z.string().min(3),
  goal: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
  message: "La fecha de inicio debe ser anterior a la de fin",
  path: ["endDate"],
})
export type SprintFormValues = z.infer<typeof sprintSchema>
```

## Status Transition Rules
| From | To | Behavior |
|------|----|----------|
| `planned` | `active` | If another sprint is already active → show `showLaunchConfirm` dialog |
| `active` | `completed` | Check all tasks in sprint stories are completed; toast error if not |
| Any | Any | Always call `updateSprint(id, { status: newStatus })` |

## Form & Dialog Pattern
The `SprintsDialogs` component receives `form: UseFormReturn<SprintFormValues>` (properly typed — never `any`). The form is backed by `useForm<SprintFormValues>` in `useSprintsLogic`:
- `openCreate()`: resets form to defaults, clears `selectedStoryIds`.
- `openEdit(sprint)`: resets form with sprint data, sets `selectedStoryIds` from `sprint.storyIds`.

## Story Linking
Stories are linked to a sprint by selecting them in the dialog. After save, call `setSprintStories(sprintId, selectedIds)`. Stories without an explicit sprint are part of the backlog.

## Audit Trail
Sprint edits trigger a `CommentDialog` (`showEditAudit` state). On confirm, `onConfirmAudit(comment)` calls `executeSave(comment)`, which passes the comment to `updateSprint`.

## Sprint Cards
Each `SprintCard` shows: name, date range, story count, status badge, and action buttons (Edit / Change Status). Use color-coded status badges: `planned` = amber, `active` = emerald, `completed` = slate.
