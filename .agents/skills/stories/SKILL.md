---
name: stories
description: Guide for the Stories (User Stories) module — CRUD, filtering, drag-and-drop reordering, and audit logging.
---

# Stories (User Stories) Module

## Overview
Stories represent Jira-style User Stories (`PROJ-1234`). Each story contains an ordered list of `TrackedTask`s, belongs to an optional Epic, and maintains a full audit log of all changes.

## Key Files
- **Feature store**: `src/features/stories/store.ts` — actions: `addStory`, `updateStory`, `archiveStory`, `restoreStory`, `addTask`, `updateTask`, `archiveTask`, `startTaskTimer`, `pauseTaskTimer`, `stopTaskTimer`.
- **Feature types**: `src/features/stories/types.ts` — `Story`, `TrackedTask`, `AuditEntry`, `TimeLog`, `ChecklistItem`.
- **Page**: `src/pages/stories/StoriesPage.tsx` (route: `/stories`)
- **Hook**: `src/pages/stories/hooks/useStoriesLogic.ts`
- **Table**: `src/pages/stories/components/StoriesTable.tsx`
- **Dialogs**: `src/pages/stories/components/StoriesDialogs.tsx`
- **Detail page**: `src/pages/story-detail/StoryDetailPage.tsx` (route: `/stories/:id`)

## Story Interface
```ts
interface Story {
  id: string
  code: string          // "PROJ-1234"
  title: string
  module: string        // Business module name
  description?: string
  status: 'active' | 'archived'
  epicId?: string
  tasks: TrackedTask[]  // Ordered list (use `position` field)
  auditLog: AuditEntry[]
  createdAt: string
  updatedAt: string
  position: number      // For manual reordering
}
```

## Drag & Drop
- Uses `@hello-pangea/dnd` (`DragDropContext`, `Droppable`, `Draggable`).
- `StoriesTable` handles row-level DnD; drag is **disabled** when a filter or search is active.
- On `onDragEnd`, call `reorderStories(result)` from `useStoriesLogic`.

## Filtering & Pagination
- Filter by search (title/code), epicId, and archived status.
- Pagination: `ITEMS_PER_PAGE = 10`. Reset `currentPage` to 1 when any filter changes.
- `isDragDisabled` = `epicFilter !== 'all' || search !== ''`.

## Audit Log
Every mutation to a story or task goes through the audit system. The store wraps mutations with an `AuditEntry`:
```ts
interface AuditEntry {
  action: 'created' | 'updated' | 'archived' | 'restored'
  targetType: 'story' | 'task'
  comment: string     // Required for updates — shown via CommentDialog
  timestamp: string
}
```
When editing a story, always show `CommentDialog` before saving to capture the reason.

## CRUD Patterns
- **Create**: Open dialog with `setIsCreateOpen(true)`. Form uses `react-hook-form` + Zod.
- **Edit**: Use `setEditStoryId(story.id)` + populate `editForm`. Show `CommentDialog` before calling `handleSaveEdit`.
- **Archive/Restore**: Confirmation dialog required; never hard-delete.
- **View Detail**: Navigate to `/stories/:id` via `useNavigate`.

## Table Layout (Fixed Header/Footer)
- `StoriesTable` uses `flex-1 overflow-hidden flex flex-col`.
- `TableHeader` has `sticky top-0 z-10` so it stays visible while body scrolls.
- Pagination footer is `shrink-0` outside the scroll area in `StoriesPage`.
