---
name: epics
description: Guide for working with the Epics & Roadmap module, including state management, progress tracking, and UI patterns.
---

# Epics & Roadmap Module

## Overview
The Epics module provides a macro-level roadmap of the project, grouping related stories under a single theme or business objective (an "Epic"). Each Epic has a color, a code (e.g., `EPA-01`), a progress indicator, and a list of linked stories.

## Key Files
- **Feature store**: `src/features/epics/store.ts` — Zustand store. Actions: `addEpic`, `updateEpic`, `deleteEpic`.
- **Feature types**: `src/features/epics/types.ts` — `Epic` interface.
- **Page**: `src/pages/epics/EpicsPage.tsx`
- **Hook**: `src/pages/epics/hooks/useEpicsLogic.ts`
- **Components**: `src/pages/epics/components/EpicCard.tsx`, `EpicsDialogs.tsx`, `EpicsHeader.tsx`

## Epic Interface
```ts
interface Epic {
  id: string
  code: string          // e.g. "EPA-01"
  name: string
  description?: string
  color: string         // Hex color for visual distinction
  progress: number      // 0-100, computed from story/task completion
  status: 'active' | 'completed' | 'archived'
  createdAt: string
  updatedAt: string
}
```

## Progress Calculation
Progress is computed dynamically from related stories/tasks rather than stored directly. When displaying an Epic's progress, iterate `useStoriesStore().stories` and filter by `story.epicId === epic.id`, then compute the percentage of completed tasks.

## UI Patterns
- Each `EpicCard` shows: color dot, code badge, name, description, progress bar, and action buttons.
- The "Análisis Proactivo" section in the header shows a smart insight (e.g., bottleneck detection).
- Use `Badge` with the epic's `color` for inline epic references in other modules (like `StoriesTable`).
- Premium design: use `from-primary/5 via-primary/[0.02] to-transparent` gradients for card headers.

## Adding/Editing an Epic
1. Open dialog via `EpicsHeader` button.
2. Use `react-hook-form` + Zod for validation (name required, at least 3 chars).
3. Color picker uses a predefined palette; store as a hex string.
4. On save, call `addEpic(data)` or `updateEpic(id, data)` from the store.
5. Before deleting: check if any stories still reference the epic's ID; warn the user.

## Common Patterns
- **Inline epic reference** (e.g., in a story): show a colored dot + epic code.
- **Filtering by epic**: use `epicFilter` state; `'all'` means show everything.
- **Navigation**: `EpicsPage` is at route `/epics`.
