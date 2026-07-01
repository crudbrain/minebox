# Plan : Corriger la recherche sur /ws/bank-accounts — champ surname manquant

## Contexte
Sur la page /ws/bank-accounts, la recherche ne fonctionne que sur 2 des 3 champs de nom. Le nom complet affiché est `[lastName, surname, firstName].join(" ")`, mais la clause `where.OR` dans l'API omet `surname` (postnom).

## Tâches

1. **`app/api/bank-accounts/route.ts:27-32`** — Ajouter `{ surname: { contains: search, mode: "insensitive" } }` au tableau `where.OR` :
   ```ts
   where.OR = [
     { accountNumber: { contains: search, mode: "insensitive" } },
     { firstName: { contains: search, mode: "insensitive" } },
     { lastName: { contains: search, mode: "insensitive" } },
     { surname: { contains: search, mode: "insensitive" } },
     { phone: { contains: search, mode: "insensitive" } },
   ];
   ```

## Validation
- Lancer `npx tsc --noEmit`
