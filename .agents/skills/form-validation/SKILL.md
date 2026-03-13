---
name: Professional Form Validation
description: Standards for implementing form validation using react-hook-form and zod (Shadcn pattern).
---

# Form Validation Standards

All forms in this project must follow the professional pattern established by Shadcn UI using `react-hook-form` and `zod`.

## Core Principles

1.  **Schema First**: Define a Zod schema for every form to centralize validation logic.
2.  **Granular Feedback**: Error messages must appear directly below each field in red (`text-destructive`).
3.  **High-Contrast UI**: Use the project's premium design tokens (rounded corners, specific heights, bold fonts).
4.  **No Manual State**: Leverage `react-hook-form`'s state management instead of multiple `useState` calls for form fields.
5.  **No Sonner for Validations**: Never use `sonner` toasts for form validation messages. Use inline red text or a Dialog for critical logic errors.

## Implementation Pattern

### 1. Define Schema
```typescript
const formSchema = z.object({
  name: z.string().min(1, 'Required field'),
  // ...
})
```

### 2. Initialize Form
```typescript
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { /* ... */ },
})
```

### 3. Layout Structure
Use the following component hierarchy:
- `Form` (Provider)
  - `FormField`
    - `FormItem`
      - `FormLabel`
      - `FormControl` -> `Input` / `Textarea`
      - `FormMessage` (Shows errors)

## CSS Standards
- **Errors**: Use `text-destructive` (red) for error messages. DO NOT use toasts.
- **Rounding**: Use `rounded-xl` or `rounded-2xl` for inputs.
- **Spacing**: Use `space-y-6` for field isolation.
