# Plan: Date/Time Picker dd/MM/yyyy + heure sur les formulaires Transaction & Transfer

## Contexte

Actuellement les formulaires de création/modification de transactions et transferts utilisent un `<DatePicker>` Ant Design simple (sans heure). La date est stockée en `DateTime` dans Prisma/PostgreSQL. L'ordonnancement des enregistrements se fait par `orderBy: { date: "asc" }` — mais sans composant horloge, toutes les entrées du même jour ont la même date (minuit), ce qui rend l'ordonnancement imprécis.

## Objectif

1. Afficher les dates au format **dd/MM/yyyy HH:mm** dans l'UI (tableaux, drawers, partage, impression)
2. Ajouter la sélection de l'**heure** dans les formulaires (DatePicker + TimePicker via `showTime`)
3. Garantir que le tri API par `date: "asc"` utilise précisément la date+heure

## Changements requis

### 1. `lib/utils.ts` — Modifier `formatDate` pour afficher dd/MM/yyyy + heure

- Remplacer `formatDate` actuel par le format `dd/MM/yyyy HH:mm` (ex: `30/06/2026 14:30`)
- Conserver `formatDateTime` tel quel (ou le supprimer si `formatDate` le remplace)
- Utiliser `toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })`

### 2. `components/bank-accounts/bank-account-transactions.tsx` — Formulaire transaction

- Ligne 384 : `<DatePicker className="w-full" />` → `<DatePicker className="w-full" showTime format="DD/MM/YYYY HH:mm" />`
- Ligne 51 : lors du `setFieldsValue` pour édition, `dayjs(editingTransaction.date)` reste correct (dayjs préserve l'heure)

### 3. `components/partners/partner-transfers.tsx` — Formulaire transfert

- Ligne 336 : `<DatePicker className="w-full" />` → `<DatePicker className="w-full" showTime format="DD/MM/YYYY HH:mm" />`
- Ligne 48 : lors du `setFieldsValue` pour édition, `dayjs(editingTransfer.date)` reste correct

### 4. `components/bank-accounts/transaction-detail-drawer.tsx` — Affichage détail transaction

- `formatDate(transaction.date)` affichera déjà le nouveau format (dd/MM/yyyy HH:mm) après modification de `formatDate`

### 5. `components/partners/transfer-detail-drawer.tsx` — Affichage détail transfert

- `formatDate(transfer.date)` affichera déjà le nouveau format

### 6. `components/bank-accounts/bank-account-transactions.tsx` & `components/partners/partner-transfers.tsx` — Colonnes tableau + sous-titre impression

- Les colonnes "Date" utilisent `formatDate(date)` → seront automatiquement mises à jour
- Les sous-titres d'impression utilisent `formatDate(...)` → seront automatiquement mis à jour

### 7. Partage (transaction-detail-drawer.tsx) — Texte de partage

- Ligne 133 : `Date: *${formatDate(transaction.date)}*` → sera automatiquement mis à jour

## Fichiers impactés (par ordre d'exécution)

| # | Fichier | Changement |
|---|---------|-----------|
| 1 | `lib/utils.ts` | `formatDate` → format `dd/MM/yyyy HH:mm` (2-digit day/month/year + heure) |
| 2 | `components/bank-accounts/bank-account-transactions.tsx` | `DatePicker` → `showTime format="DD/MM/YYYY HH:mm"` |
| 3 | `components/partners/partner-transfers.tsx` | `DatePicker` → `showTime format="DD/MM/YYYY HH:mm"` |

**Aucune modification API ni Prisma requise** : le champ `date` est déjà `DateTime`, les payloads envoient déjà `values.date?.toISOString()`, l'API gère déjà `new Date(date)`. Le tri `orderBy: { date: "asc" }` fonctionne déjà avec la précision horloge.

## Validation

- Créer une transaction avec date 30/06/2026 14:30 → vérifier qu'elle apparaît à cette heure dans le tableau
- Créer une 2e transaction le même jour à 09:00 → vérifier qu'elle apparaît avant la 1ère dans le tableau (tri asc)
- Modifier une transaction existante → vérifier que l'heure est préservée dans le formulaire
- Vérifier l'affichage dans le drawer détail, le partage, l'impression
