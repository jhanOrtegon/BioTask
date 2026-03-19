---
name: analytics
description: Guide for the Analytics & Intelligence module — health, load, and performance metrics calculation plus chart patterns.
---

# Analytics & Intelligence Module

## Overview
The analytics module provides three tabbed sub-pages under `/analytics`:
- **Health** (`/analytics/health`): Sprint health metrics, completion rates, blocked task analysis.
- **Load** (`/analytics/load`): Developer workload distribution, hours per dev, relative load.
- **Performance** (`/analytics/performance`): Daily performance tracking, efficiency scores, developer insights.

## Key Files
- **Router/Layout**: `src/pages/analytics/AnalyticsPage.tsx` (tab routing) 
- **Health**: `src/pages/analytics/HealthPage.tsx`, `HealthHeader.tsx`, `HealthForecast.tsx`
- **Load**: `src/pages/analytics/LoadPage.tsx`, `LoadHeader.tsx`, `LoadTable.tsx`, `LoadCharts.tsx`
- **Performance**: `src/pages/analytics/PerformancePage.tsx`, `PerformancePodium.tsx`, `PerformanceTable.tsx`
- **Types**: `src/pages/analytics/types.ts` — `DevPerformance`

## DevPerformance Interface
```ts
interface DevPerformance {
  id: string
  name: string
  specialty: string
  avatar?: string
  totalHours: number
  todayHours: number
  completedTasks: number
  blockedTasks: number
  activeTasks: number
  efficiency: number      // 0-100, computed
  insight: string         // Human-readable insight string
  status: 'success' | 'warning' | 'danger' | 'neutral'
}
```

## Data Derivation (No Backend)
All metrics are derived in real-time from `useStoriesStore` and `useTeamStore`. **Never store computed metrics in Zustand.** Always compute in `useMemo`.

### Performance Calculation Pattern
```ts
const stats: Record<string, DevPerformance | undefined> = {}
members.forEach(m => { stats[m.id] = { ...initialValues } })
stories.forEach(s => s.tasks.forEach(t => {
  const dev = stats[t.assignedTo ?? '']
  if (!dev) return
  // accumulate hours, count tasks by status, etc.
}))
const result = (Object.values(stats).filter(Boolean) as DevPerformance[]).map(d => {
  d.efficiency = totalAssigned > 0 ? Math.round((d.completedTasks / totalAssigned) * 100) : 0
  // assign insight + status based on thresholds
  return d
})
```

## Insight Logic (Performance)
| Condition | Insight | Status |
|-----------|---------|--------|
| `blockedTasks > 1` | `Bloqueado en X frentes técnicos.` | `danger` |
| `todayHours > 5` | `Alta tracción. Superando media diaria.` | `success` |
| `activeTasks > 4` | `Sobrecarga de contexto (Multitasking).` | `warning` |
| `completedTasks > 0 && efficiency > 70` | `Cierre efectivo de objetivos.` | `success` |
| default | `Flujo Estable` | `neutral` |

## Chart Libraries
- Uses **Recharts**: `AreaChart`, `PieChart`, `RadarChart`, `BarChart`.
- `Cell` from recharts is deprecated (lint warning); this is a known issue with the library version. Use `fill` prop on `Pie` children as-is.
- Always wrap charts with `<ResponsiveContainer width="100%" height="...">`.
- For tooltips: use `contentStyle={{ borderRadius: '...' }}` for premium look.

## Table Layout Pattern (Fixed Header/Footer)
- `LoadTable` and `PerformanceTable` use: `h-full flex flex-col` on Card.
- Header card section: `shrink-0`.
- Table wrapper: `flex-1 overflow-auto custom-scrollbar`.
- `TableHeader`: `sticky top-0 z-10 bg-card backdrop-blur-md`.
- Pagination footer: `shrink-0 p-4 border-t`.

## Proactive Analysis Section
- The "Análisis Proactivo" panel in Health/Load computes: `bottleneckStory` (story with most blocked tasks), `overloadedDev` (dev with most active tasks), `healthScore`.
- Display results as cards with color-coded badges and insight text.
- Navigation back to main analytics uses `void navigate('/analytics')`.
