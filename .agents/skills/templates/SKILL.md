---
name: templates
description: Guide for the Templates module — task type templates, CRUD management, and integration with the dynamic editor.
---

# Templates Module

## Overview
Templates define reusable schemas for different task types (e.g., Backend API, Frontend Feature, QA Test). They power the `DynamicTaskEditor` by providing the structure for `SectionData`. The page is accessible only to `Manager` role users (for creation/deletion), while `Editor` role can view and use templates.

## Key Files
- **Feature store**: `src/features/templates/store.ts` — actions: `addTemplate`, `updateTemplate`, `deleteTemplate`, `getTemplateByType`.
- **Feature types**: `src/features/templates/types.ts` — `Template`, `TaskType`, `ServiceDetail`.
- **Page**: `src/pages/templates/TemplatesPage.tsx` (route: `/templates`)
- **Hook**: `src/pages/templates/hooks/useTemplatesLogic.ts`
- **Table**: `src/pages/templates/components/TemplateTable.tsx` — already has sticky header.
- **Dialogs**: `src/pages/templates/components/TemplateDialogs.tsx`

## Template Interface
```ts
interface Template {
  id: string
  type: TaskType          // 'backend' | 'frontend' | 'qa' | 'design' | etc.
  name: string
  description?: string
  defaultData: SectionData  // Pre-filled example content
  createdAt: string
  updatedAt: string
}

interface SectionData {
  objective: string
  services: ServiceDetail[]
  requirements: string[]
  validations: string[]
}

interface ServiceDetail {
  name: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint?: string
  description?: string
}
```

## TaskType Values
```ts
type TaskType = 'backend' | 'frontend' | 'qa' | 'design' | 'devops' | 'data' | 'security' | 'general'
```
Each type maps to a display name, icon, and color in the UI.

## TemplateTable Layout
`TemplateTable` already has the correct sticky-header/scrollable-body layout:
- Outer div: `flex-1 overflow-hidden flex flex-col`
- Inner scroll: `flex-1 overflow-auto`
- Header: `sticky top-0 z-10 bg-muted/40 backdrop-blur-xl`

## Role-Based Actions
- `Manager`: Can create, edit, and delete templates.
- `Editor`: Can view templates and use them in the editor. The "Create" button is hidden for editors.

Guard pattern:
```tsx
{role !== 'Editor' && (
  <Button onClick={onOpenCreate}>Nueva Plantilla</Button>
)}
```

## Integration with Editor
When the user selects a `TaskType` in the editor header, `DynamicTaskEditor` calls `getTemplateByType(type)` to load `defaultData` as starting content if the editor is empty (new document). If editing an existing task, `initialData` takes precedence.

## "Fill Example" Button
In `DynamicTaskEditor`, a "Fill Example" button sets the form to the template's `defaultData`. This button is **hidden** when `readOnly={true}`.
