# UserDropdown performance — mémoïsation ciblée

## Contexte

`components/ws/user-dropdown.tsx` recrée `handleSignOut` et `items` à chaque rendu. Comme `items` contient une référence à `handleSignOut` et que les deux sont de nouveaux objets à chaque rendu, `<Dropdown menu={{ items }}>` reçoit toujours un prop `menu` neuf, forçant Ant Design à recalculer le contenu du dropdown inutilement.

## Changements

Tous les changements sont dans `components/ws/user-dropdown.tsx`.

### 1. Mémoïser `handleSignOut` avec `useCallback`

`authClient.signOut` est une référence stable (module-level). `window.location.reload` est un global. Dépendances : `[]`.

```tsx
const handleSignOut = useCallback(async () => {
  await authClient.signOut();
  window.location.reload();
}, []);
```

### 2. Mémoïser `items` avec `useMemo`

**Dépendances** : `session?.user?.name`, `session?.user?.email`, `handleSignOut`.

```tsx
const items = useMemo(
  () => [
    {
      key: "name",
      label: session?.user?.name || "Utilisateur",
      disabled: true,
    },
    {
      key: "email",
      label: session?.user?.email || "",
      disabled: true,
    },
    { key: "divider", type: "divider" as const },
    {
      key: "logout",
      label: "Déconnecter",
      onClick: handleSignOut,
    },
  ],
  [session?.user?.name, session?.user?.email, handleSignOut]
);
```

## Imports à modifier

Ligne 3 : `import { Dropdown, Avatar } from "antd"` reste inchangé. Ajouter :

```tsx
import { useMemo, useCallback } from "react";
```

## Hors périmètre

- Pas de `React.memo` sur le composant (décision explicite).
- Pas de modification à `sidebar.tsx` ou `workspace-shell.tsx`.

## Validation

- Cliquer sur l'avatar : le dropdown s'ouvre avec nom, email, et bouton déconnecter.
- Cliquer « Déconnecter » : la déconnexion fonctionne et la page recharge.
- Basculer le sidebar collapsed/uncollapsed : le dropdown s'affiche correctement dans les deux états.
