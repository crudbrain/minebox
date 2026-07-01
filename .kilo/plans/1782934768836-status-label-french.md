# Afficher le statut en français sur /ws/settings

## Contexte
La page `app/ws/settings/page.tsx` affiche le statut de l'entreprise en valeur brute (`ENABLED` / `DISABLED`) au lieu d'un label français.

## Enum `Status` (prisma/schema.prisma:10-13)
- `ENABLED` → **Activé**
- `DISABLED` → **Désactivé**

## Changement

### `app/ws/settings/page.tsx` — ligne 71

Remplacer :
```tsx
<Descriptions.Item label="Statut">{company.status}</Descriptions.Item>
```

Par :
```tsx
<Descriptions.Item label="Statut">{company.status === "ENABLED" ? "Activé" : "Désactivé"}</Descriptions.Item>
```

## Cohérence
Les labels `"Activé"` / `"Désactivé"` sont déjà utilisés dans `components/settings/company-edit-drawer.tsx` (lignes 145-146) — le changement est donc cohérent avec l'UI existante.

## Aucun autre changement
- Les valeurs brutes `"ENABLED"` / `"DISABLED"` restent inchangées dans le schéma Prisma, les API, les formulaires, et les validations Zod.
- Seul l'affichage de la page settings change.
