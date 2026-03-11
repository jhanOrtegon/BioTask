# Agente de Feature: Sprints

## Responsabilidad
Esta feature (`src/features/sprints/`) gestiona el ciclo de vida de los Sprints: creación, edición, cambios de estado (`planning` → `active` → `completed`) y la asignación/desasignación de Stories a cada Sprint.

## Contexto de la Feature
- **UI:** No tiene componentes propios en `ui/`. Toda la interfaz se encuentra en `src/pages/SprintsPage.tsx`.
- **Estado:** Un array de objetos `Sprint` administrado con Zustand + persist (`sprints-storage`).
- **Relación con Stories:** El Sprint almacena `storyIds: string[]`. La feature no lee ni modifica el store de `stories`; sólo guarda los IDs y confía en que `stories` resolverá los datos.

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
| `updateSprint(id, data)` | Actualiza campos de un sprint existente |
| `deleteSprint(id)` | Elimina un sprint |
| `addStoryToSprint(sprintId, storyId)` | Asigna un story al sprint (deduplicado) |
| `removeStoryFromSprint(sprintId, storyId)` | Desasigna un story del sprint |
