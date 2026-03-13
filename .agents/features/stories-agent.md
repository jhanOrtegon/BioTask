# Agente de Feature: Stories

## Responsabilidad
Esta feature (`src/features/stories/`) es el **agregado de dominio principal**. Administra el CRUD de Stories, las tareas anidadas dentro de cada Story, el tracking de tiempo por tarea y el registro de auditoría (audit log) de todos los eventos.

## Contexto de la Feature
- **UI:** `AuditTimeline.tsx` — componente de línea de tiempo que renderiza el historial de acciones con iconos y colores según el tipo de evento.
- **Estado:** Un array de objetos `Story` (cada uno con `tasks: TrackedTask[]` y `auditLog: AuditEntry[]`) administrado con Zustand + persist (`stories-storage`).
- **Timer:** Las operaciones de cronómetro (`start`, `pause`, `stop`, `reset`) se manejan aquí. El "Reset" limpia el `timeSpent` y el array de `timeLogs`.
- **Páginas asociadas:** `StoriesPage.tsx` (listado/CRUD), `StoryDetailPage.tsx` (detalle + tareas + timers + auditoría), `BoardPage.tsx` (kanban filtrado por sprint activo), `TasksPage.tsx` (tabla cross-story).

## Límites de la IA (Tokens)
- **DEBES** restringir tus lecturas a `src/features/stories/` y a las páginas que la consumen directamente.
- **NO LEAS** `features/templates/` ni `features/tasks/` a menos que haya un bug de integración directo.
- Si necesitas entender cómo se crea un draft de tarea, eso es responsabilidad de `features/tasks/`.

## Archivos Clave a Modificar
- `store.ts`: Estado de stories + acciones de CRUD de stories y tareas + acciones de timer + helper `getStoryById`.
- `types.ts`: Interfaces `SectionData`, `TimeLog`, `TrackedTask`, `AuditEntry`, `Story`.
- `ui/AuditTimeline.tsx`: Renderizado visual del audit log.

## Acciones del Store
| Acción | Descripción |
|---|---|
| `addStory(data)` | Crea una nueva story |
| `updateStory(id, data)` | Actualiza campos de una story |
| `archiveStory(id)` | Marca una story como archivada |
| `restoreStory(id)` | Restaura una story archivada |
| `addTaskToStory(storyId, task)` | Añade una tarea a una story |
| `updateTask(storyId, taskId, data)` | Actualiza una tarea dentro de una story |
| `archiveTask(storyId, taskId)` | Archiva una tarea |
| `startTaskTimer(storyId, taskId)` | Inicia el cronómetro de una tarea |
| `pauseTaskTimer(storyId, taskId)` | Pausa el cronómetro |
| `stopTaskTimer(storyId, taskId)` | Detiene el cronómetro y marca la tarea como completada |
| `getStoryById(id)` | Helper para obtener una story por ID |
