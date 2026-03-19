---
description: How to onboard into a specific feature without wasting tokens.
---

# Feature Onboarding Workflow

// turbo-all
1.  **Identify Feature**: Determine which directory in `src/features/` is relevant.
2.  **Read Agent Doc**: View the specific agent documentation in `.agents/features/[feature]-agent.md`.
3.  **Read Types**: View the `types.ts` of that feature to understand the data structure.
4.  **Check Store**: View the `store.ts` to see the global state and actions.
5.  **Scan for Rules**: Run a quick check for line counts and `any` types in the feature directory.
6.  **Apply Logic**: Focus only on the requested change within that isolated scope.

> [!TIP]
> This workflow ensures you don't read the whole project, saving significantly on context usage.
