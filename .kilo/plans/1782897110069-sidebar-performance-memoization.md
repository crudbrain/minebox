# Sidebar performance — mémoïsation ciblée

## Contexte

`components/ws/sidebar.tsx` recrée à chaque rendu des valeurs dérivées qui ne changent que lorsque certaines dépendances changent. Cela provoque des re-rendus inutiles de `<Menu>` Ant Design (coûteux) et du sous-arbre JSX.

## Changements

Tous les changements sont dans `components/ws/sidebar.tsx`.

### 1. Mémoïser `menuItems` avec `useMemo`

**Dépendances** : `session?.user?.role` (conditionnel admin), le reste est statique.

```tsx
const menuItems = useMemo(() => [
  { key: "/ws", icon: <DashboardOutlined />, label: <Link href="/ws">Dashboard</Link> },
  { key: "/ws/bank-accounts", icon: <BankOutlined />, label: <Link href="/ws/bank-accounts">Banque et crédits</Link> },
  { key: "/ws/partners", icon: <TeamOutlined />, label: <Link href="/ws/partners">Partenaires et crédits</Link> },
  ...(session?.user?.role === "admin"
    ? [{ key: "/ws/settings", icon: <SettingOutlined />, label: <Link href="/ws/settings">Paramètres</Link> }]
    : []),
], [session?.user?.role]);
```

Ajouter l'import `useMemo` à la ligne 3.

### 2. Mémoïser `allKeys` + `activeKey` avec `useMemo`

**Dépendances** : `pathname` (pour `activeKey`), `menuItems` (pour `allKeys`). Extraire les clés statiques dans une constante hors composant pour éviter de dépendre de `menuItems`.

```tsx
const MENU_KEYS = ["/ws", "/ws/bank-accounts", "/ws/partners", "/ws/settings"];
```

Hors du composant (après `getActiveKey`). Puis dans le composant :

```tsx
const activeKey = useMemo(() => getActiveKey(pathname, MENU_KEYS), [pathname]);
```

Supprimer `const allKeys = menuItems.map(...)` qui devient inutile.

### 3. Mémoïser `handleMenuClick` avec `useCallback`

**Dépendances** : `isMobile`, `onMobileClose`.

```tsx
const handleMenuClick = useCallback(() => {
  if (isMobile && onMobileClose) {
    onMobileClose();
  }
}, [isMobile, onMobileClose]);
```

Ajouter l'import `useCallback` à la ligne 3.

## Imports à modifier

Ligne 3 : `import { useState } from "react"` → `import { useState, useMemo, useCallback } from "react"`

## Validation

- Navigation entre les pages du workspace : `activeKey` se met à jour correctement.
- Toggle admin : l'entrée Paramètres apparaît/disparaît selon le rôle.
- Mobile : le Drawer se ferme bien au clic menu.
- Pas de régression visuelle par rapport à l'état actuel.
