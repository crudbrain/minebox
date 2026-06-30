# Plan : Réordonner l'affichage des noms (lastName, surname, firstName)

## Objectif
Changer l'ordre d'affichage des noms de `firstName, lastName, surname` vers `lastName, surname, firstName` partout dans l'application (tables, formulaires, détails, impressions, exports image/partage).

## Contexte
- `lastName` = Nom
- `surname` = Postnom / Surnom
- `firstName` = Prénom
- Ordre actuel : Prénom, Nom, Surnom → Nouvel ordre : Nom, Postnom, Prénom

## Changements par fichier

### 1. `components/bank-accounts/bank-account-table.tsx`
- Ligne 55 : `[record.firstName, record.lastName, record.surname]` → `[record.lastName, record.surname, record.firstName]`

### 2. `components/bank-accounts/bank-account-form-modal.tsx`
- Réordonner les Form.Item : Nom (lastName) en premier, Surnom/Postnom (surname) en deuxième, Prénom (firstName) en troisième

### 3. `components/bank-accounts/bank-account-detail.tsx`
- Réordonner les Descriptions.Item : Nom (lastName), Surnom (surname), Prénom (firstName)

### 4. `components/bank-accounts/bank-account-transactions.tsx`
- Ligne 124 : `acc.firstName ${acc.lastName}` → `${acc.lastName} ${acc.surname} ${acc.firstName}` (filter(Boolean).join)
- Ligne 197 : `record.account.firstName ${record.account.lastName}` → `${record.account.lastName} ${record.account.surname} ${record.account.firstName}` (filter(Boolean).join)
- Ligne 203 : idem pour WITHDRAWAL
- Ligne 209 : `record.fromAccount.firstName ${record.fromAccount.lastName}` → `${record.fromAccount.lastName} ${record.fromAccount.surname} ${record.fromAccount.firstName}` (filter(Boolean).join)
- Ligne 212 : idem pour toAccount
- Ligne 277 : `bankAccount.firstName ${bankAccount.lastName}` → `${bankAccount.lastName} ${bankAccount.surname} ${bankAccount.firstName}` (filter(Boolean).join)

### 5. `components/bank-accounts/transaction-detail-drawer.tsx`
- Lignes 32, 39 : `account.firstName ${account.lastName}` → `${account.lastName} ${account.surname} ${account.firstName}` (filter(Boolean).join)
- Lignes 45, 48 : idem pour fromAccount/toAccount
- Lignes 123-126 : Réordonner la construction de accountName pour le partage : lastName, surname, firstName

### 6. `app/ws/bank-accounts/[id]/layout.tsx`
- Ligne 44 : `{bankAccount.firstName} {bankAccount.lastName}` → `{bankAccount.lastName} {bankAccount.surname} {bankAccount.firstName}` (avec filtrage surname vide)

### 7. `lib/schemas/bank-account.ts`
- Aucun changement requis (l'ordre des clés Zod n'affecte pas l'affichage)

## Risques
- Aucune migration DB requise (changement d'affichage uniquement)
- Le schéma Zod et le modèle Prisma restent inchangés
- Les données existantes en DB ne sont pas affectées

## Validation
- Vérifier visuellement : table des comptes, formulaire création/édition, page détails, en-tête de page compte, transactions (intitulés), impression, export JPG, partage
