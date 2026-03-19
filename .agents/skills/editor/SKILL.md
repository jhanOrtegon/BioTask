---
name: editor
description: Guide for the Advanced Document Editor — dynamic JSON-template rendering, preview panel, import/export flows.
---

# Advanced Document Editor Module

## Overview
The Editor provides a rich, task-type-aware document editor for creating detailed technical specifications (similar to Jira/Confluence). It renders a dynamic form driven by JSON templates, and supports Markdown preview, clipboard export, and JSON import/export.

## Key Files
- **Page**: `src/pages/editor/EditorPage.tsx` (route: `/editor`)
- **Hook**: `src/pages/editor/hooks/useEditorLogic.ts`
- **Components**:
  - `src/pages/editor/components/EditorHeader.tsx` — toolbar with type selector and actions.
  - `src/pages/editor/components/EditorDialogs.tsx` — confirm/export/import dialogs.
  - `src/pages/editor/components/PreviewSidePanel.tsx` — collapsible markdown preview panel.
  - `src/features/tasks/components/dynamic-editor/DynamicTaskEditor.tsx` — the core editor.

## DynamicTaskEditor Props
```ts
interface DynamicTaskEditorProps {
  taskType: TaskType
  initialData?: SectionData
  readOnly?: boolean      // When true: shows TaskVisualDetail, all inputs disabled
  onChange?: (data: SectionData) => void
}
```
- In **readOnly** mode (`readOnly={true}`): renders `TaskVisualDetail` with all fields non-interactive.
- `onChange` fires when any field changes — used to sync state to `useEditorLogic`.

## Template System
Templates define the schema for a task type. Located in `src/features/templates/`:
- **Types**: `src/features/templates/types.ts` — `Template`, `TaskType`, `ServiceDetail`.
- **Store**: `src/features/templates/store.ts` — actions: `addTemplate`, `updateTemplate`, `deleteTemplate`, `getTemplateByType`.
- Templates define sections (objective, services, requirements, validations) that map to `SectionData`.

## useEditorLogic
Key state managed by `useEditorLogic`:
- `selectedType: TaskType` — selected task type from the header dropdown.
- `data: SectionData` — current editor content.
- `importFileName: string | null` — name of imported file (used in dialog title).
- `showExportConfirm`, `showImportConfirm`, `showClearConfirm` — dialog flags.

## Export Flow
1. User clicks "Exportar" → `setShowExportConfirm(true)`.
2. On confirm → serialize `data` to JSON → create a `Blob` → trigger download via `<a>` element.
3. Also support clipboard copy of Markdown representation.

## Import Flow
1. User picks a JSON file via `<input type="file">`.
2. `FileReader` reads content → parse JSON → validate shape matches `SectionData`.
3. If valid, set `importFileName` (used in the confirm dialog template literal: `\`Importar ${importFileName || ''}\``).
4. On confirm → `setData(parsedData)`.

## EditorHeader Type Selector
The `Select` for task type uses `value={selectedType as string}` and `onValueChange={(v) => { setSelectedType(v as TaskType) }}`. The cast to `string` is needed due to Radix UI's generic Select component.

## readOnly Pattern (Task View)
When viewing a task (not editing), pass `readOnly={true}` to `DynamicTaskEditor`. This prevents all mutations while still displaying the structured data. All editing is done through the separate edit dialog flow in `StoryDetailPage`.
