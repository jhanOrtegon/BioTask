---
name: Technical Standard Compliance
description: Instructions for ensuring code quality (No any, <400 lines, English naming).
---

# Technical Standard Compliance Skill

Use this skill to audit and fix code that violates BioTask's premium standards.

## 1. No `any` Policy
- **Scan**: Search for `any` in the file.
- **Action**: Replace `any` with:
  - Specific Interface/Type.
  - `unknown` if the type is truly dynamic (and handle it with type guards).
  - Generics `<T>` if it's a utility function.
- **Tip**: Check the `types.ts` file of the corresponding feature for existing definitions.

## 2. Component Line Limit (< 400 lines)
- **Scan**: Check file length.
- **Action**: If > 400 lines, apply the following:
  - Extract **sub-components** to a `components/` sub-folder within the feature.
  - Move **business logic** to custom hooks (`hooks/use[Feature]Logic.ts`).
  - Move **pure utilities** to `utils.ts`.
  - Move **types** to `types.ts`.
- **Target**: Aim for files between 50-200 lines for maximum readability.

## 3. English Naming / Spanish UI Standard
- **Scan**: Look for Spanish words in variables, functions, or technical comments.
- **Action**: Translate to technical English.
- **Exception**: **Leave UI strings (JSX children, labels, placeholders) in Spanish.**
- **Common Translations (Code)**:
  - `tareas` -> `tasks` (variable)
  - `errorServidor` -> `serverError` (variable)
  - `manejarClick` -> `handleClick` (function)
- **Common UI (Stay Spanish)**:
  - `<span>Guardar</span>`
  - `label="Nombre del Proyecto"`

## 4. Best Practices Checklist
- [ ] Logic separated from UI.
- [ ] All props typed.
- [ ] No hardcoded styles (use Tailwind).
- [ ] Effective use of Zustand stores.
