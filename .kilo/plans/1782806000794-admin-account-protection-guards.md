# Protect Admin Account: Self-Delete/Self-Revoke & Last-Admin Guards

**Target file:** `app/ws/settings/users/page.tsx`

## Problem

The users management page allows an admin to:
1. Delete their own account (self-deletion → lockout)
2. Revoke their own sessions (self-revocation → logs themselves out)
3. Delete or demote the last remaining admin (system loses all admins)

## Implementation

### Step 1: Import `useSession` and derive current user ID

```ts
import { useSession } from "@/lib/hooks/use-session";
```

Inside `UsersPage`:
```ts
const { data: sessionData } = useSession();
const currentUserId = sessionData?.user?.id;
```

### Step 2: Compute admin count

```ts
const adminCount = users.filter(u => (u.role || "user") === "admin").length;
```

### Step 3: Guard dropdown menu items in Actions column render

In the `render` function of the `actions` column (around line 256), build the `items` array with conditional disabling:

- **Delete item** (`key: "delete"`): add `disabled: true` when:
  - `record.id === currentUserId` (self-deletion)
  - `record.role === "admin" && adminCount <= 1` (last admin deletion)

- **Revoke sessions item** (`key: "revoke"`): add `disabled: true` when:
  - `record.id === currentUserId` (self-revocation)

- **Role toggle item** (`key: "role-admin"`): add `disabled: true` when:
  - `record.role === "admin" && adminCount <= 1 && (record.role || "user") === "admin"` (demoting last admin — only applies when current role is admin and it's the last one)

### Step 4: Add defensive checks in handler functions

- **`handleConfirmDelete`**: before calling `removeUser`, check `deleteUserId === currentUserId` or if target user is the last admin. If so, `message.error(...)` and return early.
- **`handleRevokeSessions`**: before calling `revokeUserSessions`, check `userId === currentUserId`. If so, `message.error(...)` and return early.
- **`handleSetRole`**: if demoting to "user" and the target is the only admin, reject with `message.error(...)`.

### Disabled item tooltip guidance (optional but recommended)

For `disabled` menu items, add a `title` attribute or use Ant Design's `tooltip` on the Dropdown to explain why the action is disabled, e.g.:
- "Vous ne pouvez pas supprimer votre propre compte"
- "Impossible de supprimer le dernier administrateur"
- "Vous ne pouvez pas révoquer vos propres sessions"
- "Impossible de rétrograder le dernier administrateur"

## Validation

- As admin with other admins present: can delete/revoke/demote other admins, cannot delete/revoke self.
- As the only admin: cannot delete self, cannot revoke own sessions, cannot demote self.
- Non-admin users: all admin actions still work as before.
- Refresh the page after attempting restricted actions — none should have gone through.
