---
name: team
description: Guide for the Team module — member management, roles, specialties, and usage across the app.
---

# Team Module

## Overview
The Team module manages the list of developers/collaborators. Team members are referenced by ID throughout the app (e.g., `task.assignedTo`, time log `memberId`). There are two roles: `Manager` and `Editor`.

## Key Files
- **Feature store**: `src/features/team/store.ts` — actions: `addMember`, `updateMember`, `removeMember`, `getMemberById`.
- **Feature types**: `src/features/team/types.ts` — `TeamMember`, `TeamRole`.
- **Page**: `src/pages/team/TeamPage.tsx` (route: `/team`)
- **Hook**: `src/pages/team/hooks/useTeamLogic.ts`
- **Components**: `src/pages/team/components/TeamCard.tsx`, `TeamDialogs.tsx`, `TeamHeader.tsx`

## TeamMember Interface
```ts
interface TeamMember {
  id: string
  name: string
  email?: string
  role: 'Manager' | 'Editor'
  specialty?: string    // e.g. 'Frontend', 'Backend', 'QA'
  avatarUrl?: string    // URL to avatar image
  createdAt: string
}
```

## getMemberById Usage
`getMemberById` is available from `useTeamStore`. Use it to resolve member names/avatars in any component:
```ts
const { getMemberById } = useTeamStore()
const member = getMemberById(task.assignedTo ?? '')
```
Always handle `null` return (member may have been removed): show a fallback icon or "Libre".

## Role-Based Access
- `Manager`: Full access to all pages and actions.
- `Editor`: Limited to `/templates`, `/editor`, `/tasks`. Filtered in sidebar and components.
- Access check pattern: `const { role } = useAuthStore()` → `if (role !== 'Editor') { ... }`.

## Avatar Display Pattern
```tsx
{member?.avatarUrl
  ? <img src={member.avatarUrl} className="h-6 w-6 rounded-full object-cover" />
  : <span className="text-[10px] font-black text-primary">{member?.name.charAt(0)}</span>
}
```

## Member Removal Caution
Removing a member does NOT clean up their references in tasks. Before removing:
1. Check if the member has any active tasks (`t.assignedTo === member.id && t.status !== 'archived'`).
2. Show a warning if they do.
3. Optionally unassign them from those tasks first.

## Specialty & Analytics Integration
The `specialty` field is used in `PerformanceTable` as a subtitle below the member's name (e.g., "Backend Engineer"). Keeping specialties consistent improves analytics display quality.
