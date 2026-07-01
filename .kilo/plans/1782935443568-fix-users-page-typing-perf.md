# Corriger erreur TypeScript et optimiser UsersPage

## Fichier unique : `app/ws/settings/users/page.tsx`

### 1. Ajouter imports manquants (ligne 3 et import antd)

```ts
import { useState, useMemo, useCallback } from "react";
```

Ajouter import du type :
```ts
import type { ColumnsType } from "antd/es/table";
```

(Correspond à la convention du projet — voir `bank-account-table.tsx:11`, `bank-account-transactions.tsx:24`)

### 2. Typer `columns` avec `ColumnsType<User>`

Remplacer :
```ts
const columns = [
```

Par :
```ts
const columns = useMemo<ColumnsType<User>>(
  () => [
```

Et fermer avec les dépendances : `), [adminCount, currentUserId]);`

Cela corrige l'erreur `Parameter 'record' implicitly has an 'any' type` — les fonctions `render` des colonnes recevront automatiquement le type `User` pour le paramètre `record`.

### 3. Supprimer les annotations de type redondantes dans les fonctions render

Une fois `ColumnsType<User>` appliqué, les types sont inférés :

- Ligne 291 : `render: (banned: boolean | null, record: User)` → `render: (banned, record)`
- Ligne 309 : `render: (_: any, record: User)` → `render: (_, record)`

### 4. Stabiliser `adminCount` avec `useMemo`

Remplacer :
```ts
const adminCount = users.filter(u => (u.role || "user") === "admin").length;
```

Par :
```ts
const adminCount = useMemo(
  () => users.filter(u => (u.role || "user") === "admin").length,
  [users]
);
```

### 5. Stabiliser les handlers avec `useCallback`

Chaque handler reçoit les dépendances appropriées :

| Handler | Dépendances |
|---|---|
| `handleSetRole` | `[users, adminCount, refetch]` |
| `handleBan` | `[refetch]` |
| `handleUnban` | `[refetch]` |
| `handleSetPassword` | `[]` |
| `handleRevokeSessions` | `[currentUserId]` |
| `handleImpersonate` | `[]` |
| `handleDelete` | `[]` |
| `handleConfirmDelete` | `[users, adminCount, currentUserId, refetch]` |
| `handleViewSessions` | `[]` |

Les handlers qui ne dépendent que de setters (`setDeleteUserId`, `setSessionsUser`, `setEditUser`) sont stables car les setters React ne changent pas.

### 6. Aucune autre modification

- Pas de changement de logique métier
- Pas de changement dans les sous-composants (`UserCreateDrawer`, `UserEditDrawer`, etc.)
- Pas de changement dans le composant `UserSessions`

## Validation

- Lancer `npx tsc --noEmit` pour vérifier qu'il n'y a plus d'erreurs `ts(7006)`
- Vérifier visuellement que la page fonctionne dans le navigateur (tableau, dropdown actions, drawers)
