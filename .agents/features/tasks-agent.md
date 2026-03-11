# Agente de Feature: Tasks

## Responsabilidad
Esta feature (`src/features/tasks/`) maneja TODO lo relacionado con escribir, editar y formatear la subtarea actual para exportarla a Jira.

## Contexto de la Feature
- **UI:** Editor de texto estructurado por bloques (Contexto, Criterios de Aceptación, Notas Técnicas).
- **Lógica Core:** Función que serializa los campos de la UI en un texto (Markdown o formato compatible con Jira) para copiar al portapapeles.
- **Estado:** Guarda el estado temporal de lo que el usuario está escribiendo usando Zustand.

## Límites de la IA (Tokens)
Si estás modificando esta feature:
- **DEBES** restringir tus lecturas (view_file) a la carpeta `frontend/src/features/tasks/` y ocasionalmente a `frontend/src/shared/ui/`. 
- **NO DEBES** leer `features/templates` ni `app/` a menos que exista un bug directo de integración.

## Archivos Clave a Modificar
- `ui/TaskEditor.tsx`: Interfaz principal.
- `store.ts`: Estado local de los campos del editor y qué plantilla está seleccionada.
- `utils.ts`: Toda la lógica de conversión a código Jira.
- `types.ts`: Interfaces (Ej. `TaskField`, `JiraFormatOptions`).
