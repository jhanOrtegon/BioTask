# BioTask Global Rules

This project uses **Feature-Sliced Design (FSD)** adapted for React + Vite to maximize maintainability and **drastically reduce AI token usage**.

## 🔴 MASTER RULE (Token Saving)
**NEVER** read the entire project. If you modify a specific Feature, **ONLY** reference the specific documentation for that feature found in `.agents/features/[feature-name]-agent.md`.
To understand the base architecture, read this file (`rules.md`).

## 🛠 Technical Standards (Strict)
1.  **NO `any` TYPE:** The use of `any` is strictly prohibited. Always use specific interfaces, types, or `unknown` (if the type is truly dynamic).
2.  **MAX 400 LINES:** No component or file should exceed 400 lines. If it does, it **MUST** be refactored into smaller sub-components or utility functions.
3.  **ENGLISH CODE / SPANISH UI:**
    - All **code** (variable names, functions, classes, components, technical comments) must be in **English**.
    - All **UI text** (labels, buttons, placeholders, messages, notifications) must be in **Spanish**.
    - *Example:* `const taskList = ...` (English code) vs `<h2>Lista de Tareas</h2>` (Spanish UI).
4.  **Language & Framework:** TypeScript (`.ts`, `.tsx`) ONLY. Never use plain JavaScript.
5.  **UI:** Use Shadcn UI and Tailwind CSS.
    - NEVER create ad-hoc CSS classes. Use Tailwind utility classes.
    - Check `src/shared/ui/` before creating new UI elements.
6.  **State Management:** Use `Zustand`. Each feature has its own independent Store in `src/features/[feature]/store.ts`.
7.  **Clean Code:**
    - Short, self-descriptive functions.
    - Strict typing in `types.ts` within each feature folder.
    - UI components should NOT contain heavy business logic; delegate to `utils.ts` or custom hooks.

## Available Feature Agents
| Feature | Agent File | Scope |
|---|---|---|
| Auth | `.agents/features/auth-agent.md` | Authentication, route guards |
| Sprints | `.agents/features/sprints-agent.md` | Sprint lifecycle, story assignment |
| Stories | `.agents/features/stories-agent.md` | Stories CRUD, nested tasks, timers, audit |
| Tasks | `.agents/features/tasks-agent.md` | Task draft editor, Jira generation |
| Templates | `.agents/features/templates-agent.md` | Reusable task templates |
| Epics | `.agents/features/epics-agent.md` | Epic management |

## Project Structure
```
src/
  features/          ← Each feature is an isolated module
    auth/            ← Authentication
    sprints/         ← Sprint management
    stories/         ← Stories + tasks + timers
    tasks/           ← Draft editor + Jira export
    templates/       ← Predefined templates
    epics/           ← High-level planning
  pages/             ← Pages consuming features
  shared/ui/         ← UI components (Shadcn UI)
  shared/utils/      ← Shared utilities
```

## Workflow for Resolving Issues
1. Identify which Feature (`src/features/*`) or Shared piece (`src/shared/*`) the change belongs to.
2. Read the corresponding `-agent.md` file in `.agents/features/`.
3. Edit **ONLY** the files within that feature's scope.
4. If the change affects a page, check `src/pages/` but keep changes minimal.
5. If you need a new visual component, check `src/shared/ui/` first.
