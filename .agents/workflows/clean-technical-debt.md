---
description: Steps to clean technical debt (remove any, split components).
---

# Technical Debt Cleaning Workflow

1.  **Select Target**: Identify a file or feature with high complexity (e.g., > 400 lines).
2.  **Audit Types**: Use `grep` to find instances of `any`:
    ```bash
    grep -r "any" src/features/[feature]
    ```
3.  **Refactor Props**: Replace `any` in component props with structured interfaces in `types.ts`.
4.  **Extract Components**: 
    - Identify logical blocks (e.g., Header, List, Item, Modal).
    - Move them to separate files.
    - Ensure they are smaller than 400 lines.
5.  **Translate**: Rename any Spanish variables or comments.
6.  **Verify**: Run the project and check for TypeScript errors.

// turbo
7.  **Final Check**: List the files to confirm all are under the 400-line threshold.
