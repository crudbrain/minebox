# Sidebar: menu actif persistant sur les sous-pages

## Problème
`selectedKeys={[pathname]}` compare le pathname exact avec les clés du menu. Les sous-pages (ex: `/ws/bank-accounts/[id]/details`) ne correspondent jamais aux clés (ex: `/ws/bank-accounts`), donc le menu actif disparaît en navigation.

## Solution
Remplacer `selectedKeys={[pathname]}` par une logique de correspondance par préfixe : trouver la clé de menu la plus longue qui est un préfixe du `pathname` courant.

## Implémentation

Dans `components/ws/sidebar.tsx` :

1. Ajouter une fonction `getActiveKey` :
```ts
function getActiveKey(pathname: string, keys: string[]): string {
  let best = "/";
  for (const key of keys) {
    if (pathname === key || pathname.startsWith(key + "/")) {
      if (key.length > best.length) best = key;
    }
  }
  return best;
}
```

2. Extraire les clés du `menuItems` et les passer à `getActiveKey` :
```ts
const allKeys = menuItems.map((item) => item.key);
const activeKey = getActiveKey(pathname, allKeys);
```

3. Remplacer `selectedKeys={[pathname]}` par `selectedKeys={[activeKey]}`

## Cas couverts
| Pathname | Clé active |
|---|---|
| `/ws` | `/ws` |
| `/ws/bank-accounts` | `/ws/bank-accounts` |
| `/ws/bank-accounts/123` | `/ws/bank-accounts` |
| `/ws/bank-accounts/123/details` | `/ws/bank-accounts` |
| `/ws/partners` | `/ws/partners` |
| `/ws/partners/456/details` | `/ws/partners` |
| `/ws/settings` | `/ws/settings` |
| `/ws/settings/users` | `/ws/settings` |

## Validation
- Naviguer vers `/ws/bank-accounts` puis une sous-page → menu "Banque et crédits" reste actif
- Naviguer vers `/ws/partners/[id]/details` → menu "Partenaires" reste actif
- Dashboard reste actif uniquement sur `/ws` exact (pas sur les autres pages car `/ws/...` ne matche pas `/ws` sans suffixe `/`)
