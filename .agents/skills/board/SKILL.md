---
name: board
description: Guide for the Kanban Board module — column layout, drag-and-drop task movement, and sprint filtering.
---

# Board (Kanban) Module

## Overview
The Board provides a Kanban view of tasks, grouped by status columns: `Por Hacer` (pending), `En Progreso` (in_progress), `Completadas` (completed). Users can drag tasks between columns to change their status.

## Key Files
- **Page**: `src/pages/board/BoardPage.tsx` (route: `/board`)
- **Hook**: `src/pages/board/hooks/useBoardLogic.ts`
- **Components**: `src/pages/board/components/BoardColumn.tsx`, `BoardCard.tsx`, `BoardHeader.tsx`

## DnD Architecture
Uses `@hello-pangea/dnd`:
- Each column is a `<Droppable droppableId={status}>`.
- Each card is a `<Draggable draggableId={task.id} index={index}>`.
- On `onDragEnd(result)`:
  - If `result.destination` is null → return (dropped outside).
  - If source column !== destination column → call `updateTask(storyId, taskId, { status: newStatus })`.
  - Never update state directly on DnD — always go through the store.

## Filtering
Board reads from `useStoriesStore().stories` and flattens all tasks across all stories.
- Filter by sprint: `sprintId` filter (optional) — only show tasks linked to a sprint's stories.
- Always exclude `archived` tasks from the board view.
- Group by `status` after filtering.

## BoardCard
Each card shows: task code badge, title, assignee avatar, type badge, time spent (via `LiveTimer`), and alert indicators.
- Clicking a card navigates to the story detail: `void navigate('/stories/${task.storyId}')`.
- Cards support right-click or action menu for quick status change.

## Column Layout
- Three columns: `pending`, `in_progress`, `completed`.
- Each column has a fixed header with status label + task count badge.
- Column body scrolls independently (`overflow-y-auto`).
- Empty state shows a subtle dashed border with a helpful message.

## Performance Consideration
`useBoardLogic` uses `useMemo` to group tasks by status. Avoid re-deriving data in render; rely on the computed `columns` object:
```ts
const columns = useMemo(() => ({
  pending: tasks.filter(t => t.status === 'pending'),
  in_progress: tasks.filter(t => t.status === 'in_progress'),
  completed: tasks.filter(t => t.status === 'completed'),
}), [tasks])
```

## Navigation Handlers
All navigation in `BoardPage.tsx` must use `void navigate(...)` to satisfy the `@typescript-eslint/no-misused-promises` rule:
```tsx
onClick={() => { void navigate(`/stories/${task.storyId}`) }}
```
