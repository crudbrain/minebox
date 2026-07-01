# Display French role labels in users table

## Context
The role column in `app/ws/settings/users/page.tsx` displays raw values (`admin`, `user`) instead of French labels (`Admin`, `Utilisateur`).

## Changes to `app/ws/settings/users/page.tsx`

1. **Line 249-251** — Update the role column render to map raw values to French labels:
   ```tsx
   render: (role?: string) => (
     <Tag color={role === "admin" ? "red" : "blue"}>
       {role === "admin" ? "Admin" : "Utilisateur"}
     </Tag>
   ),
   ```

2. **Line 89** — Update `handleSetRole` success message to use French label:
   ```tsx
   message.success(`Rôle mis à jour : ${role === "admin" ? "Admin" : "Utilisateur"}`);
   ```

## No other changes needed
- The raw `role` values (`"admin"`, `"user"`) must stay unchanged everywhere they're used for API calls, comparisons, and logic checks.
- Only the user-facing display strings change.
