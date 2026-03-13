# Agente de Feature: Sprints

## Responsabilidad
Esta feature (`src/features/sprints/`) gestiona el ciclo de vida de los Sprints: creación, edición, cambios de estado (`planning` → `active` → `completed`) y la asignación/desasignación de Stories.

### Reglas Críticas (Business Logic)
- **Single Active Sprint:** Solo puede haber un sprint con estado `active` a la vez. Al activar uno nuevo, el anterior activo debe pasar a `completed` automáticamente.
- **Sprint Pulse:** El Dashboard (`Dashboard.tsx`) consume esta feature para mostrar el **Burndown Chart** y métricas de tiempo del sprint activo.

## Contexto de la Feature
- **UI:** No tiene componentes propios en `ui/`. Toda la interfaz se encuentra en `src/pages/SprintsPage.tsx`.
- **Estado:** Un array de objetos `Sprint` administrado con Zustand + persist (`sprints-storage`). Incluye `startDate`, `endDate`, `goal` y `storyIds`.
- **Relación con Stories:** El Sprint almacena `storyIds: string[]`. La feature no lee ni modifica el store de `stories`; sólo guarda los IDs. El filtrado de tareas en el board se basa en que la story pertenezca al sprint activo.

## Límites de la IA (Tokens)
- **DEBES** restringir tus lecturas a `src/features/sprints/` y ocasionalmente a `src/pages/SprintsPage.tsx`.
- **NO LEAS** `features/stories/` ni `features/tasks/` directamente. Si necesitas datos de stories, sólo referencia los `storyIds` del Sprint.

## Archivos Clave a Modificar
- `store.ts`: Estado de los sprints + acciones CRUD + `addStoryToSprint` / `removeStoryFromSprint`.
- `types.ts`: Interfaces `SprintStatus`, `Sprint`, `SprintsState`.

## Acciones del Store
| Acción | Descripción |
|---|---|
| `addSprint(data)` | Crea un nuevo sprint y lo retorna |
| `updateSprint(id, data)` | Actualiza campos. Implementa lógica de **single-active-sprint**. |
| `deleteSprint(id)` | Elimina un sprint |
| `setSprintStories(sprintId, storyIds)` | Reemplazo masivo de stories asignadas (usado en edición) |
| `addStoryToSprint(sprintId, storyId)` | Asigna un story al sprint (deduplicado) |
| `removeStoryFromSprint(sprintId, storyId)` | Desasigna un story del sprint |
