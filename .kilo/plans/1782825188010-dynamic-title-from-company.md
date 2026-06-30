# Plan: Titre dynamique dans le workspace

## Contexte
- `app/layout.tsx` a un metadata statique `title: "Minebox"`
- `app/ws/layout.tsx` fetch déjà `company` via `prisma.company.findFirst()`
- Company a `name` (requis) et `shortName` (optionnel)
- Routes hors workspace (`/login`, `/setup`) : company peut ne pas exister

## Décisions
- **Emplacement** : `generateMetadata` dans `app/ws/layout.tsx` uniquement
- **Champ titre** : `company.shortName || company.name`
- **Fallback** : `"Minebox"` reste statique dans `app/layout.tsx` pour `/login`, `/setup`
- **Pas d'appel DB supplémentaire** : Next.js exécute `generateMetadata` et `default` dans le même rendu, Prisma peut déjà avoir la query en cache

## Tâches

### 1. Ajouter `generateMetadata` dans `app/ws/layout.tsx`
- Importer `Metadata` depuis `next`
- Ajouter la fonction `generateMetadata` qui appelle `prisma.company.findFirst()`
- Retourner `{ title: company?.shortName || company?.name || "Minebox" }`
- Garder le `default` function inchangé

### 2. Ne PAS modifier `app/layout.tsx`
- Garder `title: "Minebox"` comme fallback statique

## Risques
- Double appel DB (`generateMetadata` + `default`) : Next.js les exécute dans le même rendu de page, Prisma/Awal gère le caching au niveau de la transaction de requête. Impact négligeable.
- Si `shortName` est une chaîne vide `""` au lieu de `null` (le schema a `@default("")`), `shortName || name` utilisera `name` quand `shortName === ""`. C'est le comportement souhaité.

## Validation
- Vérifier que le titre de l'onglet change selon le shortName/name de la company
- Vérifier que `/login` et `/setup` affichent toujours "Minebox"
