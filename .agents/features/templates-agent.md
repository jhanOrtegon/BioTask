# Agente de Feature: Templates

## Responsabilidad
Esta feature (`src/features/templates/`) administra la creación, edición y persistencia de las plantillas predefinidas que el usuario puede elegir para iniciar rápidamente una Tarea.

## Contexto de la Feature
- **UI:** Grillas de tarjetas (Template Cards) que muestran el nombre y resumen de una plantilla.
- **Estado:** Un array de objetos `Template` guardado globalmente con Zustand.
- **Persistencia:** (MVP: LocalStorage). Futuro: Supabase.

## Límites de la IA (Tokens)
- **DEBES** leer y escribir EXCLUSIVAMENTE en `frontend/src/features/templates/`.
- **NO LEAS** `features/tasks/`. Si una plantilla es seleccionada, esta feature simplemente actualiza el store global y confía en que `tasks` reaccionará.

## Archivos Clave a Modificar
- `ui/TemplateGrid.tsx`: Interfaz principal del listado.
- `ui/TemplateCard.tsx`: UI de una entidad individual.
- `store.ts`: Estado de las plantillas cargadas.
- `api.ts`: Funciones asíncronas para leer/guardar en memoria persistente.
