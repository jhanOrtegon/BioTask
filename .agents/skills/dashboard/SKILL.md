---
name: dashboard
description: Guide for the Dashboard — sprint pulse, charts, filters (general vs individual), and KPI derivation.
---

# Dashboard Module

## Overview
The Dashboard (`/`) is the main landing page and shows a real-time summary of the active sprint, team load, and individual contribution. It supports two views: **General** (team-wide) and **Individual** (personal metrics).

## Key Files
- **Page**: `src/pages/dashboard/DashboardPage.tsx`
- **Hook**: `src/pages/dashboard/hooks/useDashboardLogic.ts`
- **Components**:
  - `SprintStatusCard.tsx` — active sprint progress overview.
  - `SprintPulseWidget.tsx` — time-series chart of sprint activity.
  - `DistributionChart.tsx` — pie chart of task type distribution.
  - `LoadAnalysisChart.tsx` — team load analysis bar chart.
  - `PerformanceTimeline.tsx` — area chart per dev.

## View Modes
- **General**: Shows team aggregates — total tasks, completion rate, team load chart, type distribution.
- **Individual**: Shows metrics only for the logged-in user — personal efficiency, "My Impact" chart comparing individual hours to team average.

Switch views with a toggle button; persist choice in local component state, NOT in Zustand.

## KPI Derivation Pattern
All KPIs derive from `useStoriesStore` and `useSprintsStore`. **Always compute in `useMemo`:**
```ts
const activeSprintId = sprints.find(s => s.status === 'active')?.id
const sprintStories = stories.filter(s => s.epicId /* or */ activeSprintId && sprint?.storyIds.includes(s.id))
const totalTasks = sprintStories.flatMap(s => s.tasks.filter(t => t.status !== 'archived'))
const completedTasks = totalTasks.filter(t => t.status === 'completed')
const completionRate = totalTasks.length > 0 ? Math.round((completedTasks.length / totalTasks.length) * 100) : 0
```

## Chart Libraries
- All charts use **Recharts** wrapped in `<ResponsiveContainer>`.
- `Cell` from recharts shows a deprecation warning — this is a known library issue and harmless.
- `DistributionChart` uses `PieChart` + `Pie` + `Cell` array from a `const COLORS` palette.
- `LoadAnalysisChart` uses `BarChart`.
- `PerformanceTimeline` uses `AreaChart`.

## Sprint Pulse Widget
`SprintPulseWidget` shows daily activity (hours logged) for the current sprint's duration. Group `timeLogs` by day: for each `log`, compute `(endedAt - startedAt) / 3600` and group by `new Date(log.startedAt).toLocaleDateString()`.

## Empty State
If no active sprint exists, show an empty state with a call-to-action to create a sprint. Use the pattern:
```tsx
{!activeSprint && (
  <div className="h-full flex flex-col items-center justify-center ...">
    <CalendarDays className="h-12 w-12 opacity-20" />
    <p>No hay sprint activo</p>
    <Button onClick={() => { void navigate('/sprints') }}>Crear Sprint</Button>
  </div>
)}
```

## Navigation
All `navigate()` calls must be wrapped: `void navigate('/...')` or `() => { void navigate('/...') }` inside event handlers to avoid `no-misused-promises` lint errors.
