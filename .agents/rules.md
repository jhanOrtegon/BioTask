# Reglas Globales de TaskCraft

Este proyecto utiliza **Feature-Sliced Design (FSD)** adaptado para React + Vite con el fin de maximizar la mantenibilidad y **reducir drásticamente el uso de tokens de IA**.

## 🔴 REGLA MAESTRA (Ahorro de Tokens)
**NUNCA** leas el proyecto entero. Si modificas una Feature concreta, **SÓLO** debes referenciar la documentación específica de esa feature que se encuentra en `.agents/features/[nombre-feature]-agent.md`.
Si quieres entender la arquitectura base, lee este archivo (`rules.md`).

## Estándares del Código
1. **Lenguaje:** TypeScript (`.ts`, `.tsx`). NUNCA uses JavaScript puro.
2. **UI:** Utilizamos Shadcn UI y Tailwind CSS. Si necesitas un componente visual, primero intenta importarlo de `src/shared/ui/`.
   - NUNCA inventes nombres de clases CSS sueltas (como `.btn-primary`). Usa clases de Tailwind.
3. **Estado:** Usamos `Zustand`. Cada "feature" tiene su propio Store independiente en `src/features/[feature]/store.ts`. No uses Context API a menos que sea estrictamente necesario.
4. **Clean Code:** 
   - Funciones cortas y autodescriptivas.
   - Tipado estricto en interfaces en la carpeta `types.ts` de cada feature.
   - Los componentes de UI NO deben tener lógica de negocio pesada, delega la lógica en `utils.ts` o en custom hooks.

## Agentes de Feature Disponibles
| Feature | Archivo de Agente | Scope |
|---|---|---|
| Auth | `.agents/features/auth-agent.md` | Autenticación, guardias de ruta |
| Sprints | `.agents/features/sprints-agent.md` | Ciclo de vida de sprints, asignación de stories |
| Stories | `.agents/features/stories-agent.md` | CRUD de stories, tareas anidadas, timers, auditoría |
| Tasks | `.agents/features/tasks-agent.md` | Editor de tareas draft, generación Jira |
| Templates | `.agents/features/templates-agent.md` | Plantillas reutilizables para tareas |

## Estructura del Proyecto
```
src/
  features/          ← Cada feature es un módulo aislado
    auth/            ← Autenticación (store + guardias de ruta)
    sprints/         ← Gestión de sprints
    stories/         ← Agregado principal (stories + tasks + timers + audit)
    tasks/           ← Editor draft de tareas + exportación Jira
    templates/       ← Plantillas predefinidas de tareas
  pages/             ← Páginas que consumen features
  shared/ui/         ← Componentes reutilizables (Shadcn UI)
  shared/utils/      ← Utilidades compartidas
```

## Flujo para resolver un issue:
1. Identifica a qué Feature (`src/features/*`) o pieza compartida (`src/shared/*`) pertenece el cambio.
2. Lee el archivo `-agent.md` correspondiente en `.agents/features/`.
3. Edita ÚNICAMENTE los archivos de esa feature.
4. Si el cambio afecta una página, consulta `src/pages/` pero limita cambios al mínimo necesario.
5. Si necesitas un componente visual nuevo, primero verifica si existe en `src/shared/ui/`.
