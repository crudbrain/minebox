# Remplacer "Surnom" par "Postnom" et imposer l'ordre Nom → Postnom → Prénom

## Contexte
- Les formulaires et vues affichent actuellement "Surnom" au lieu de "Postnom"
- L'ordre doit être : Nom → Postnom → Prénom
- Le champ DB reste `surname` — seul le label UI change

## Tâches

### 1. `components/bank-accounts/bank-account-form-drawer.tsx`
- Ligne 123 : changer label `"Surnom"` → `"Postnom"` et message `"Surnom requis"` → `"Postnom requis"`
- L'ordre des champs est déjà correct (Nom → Surnom → Prénom), aucun réordonnancement nécessaire

### 2. `components/bank-accounts/bank-account-detail.tsx`
- Ligne 67 : changer label `"Surnom"` → `"Postnom"`
- L'ordre est déjà correct (Nom → Surnom → Prénom)

### 3. `components/bank-accounts/bank-account-table.tsx`
- Aucun changement nécessaire : la colonne "Nom complet" concatène déjà `lastName surname firstName`, le label affiché reste "Nom complet"

### 4. `lib/schemas/bank-account.ts`
- Aucun changement : le nom de champ `surname` reste tel quel (pas de renommage DB)

## Notes
- Aucune migration Prisma requise
- Le nom de champ en base et dans le schema Zod reste `surname`
