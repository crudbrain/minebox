# Update Bank Account Transactions Table Columns

## Goal
Replace the current table columns in `bank-account-transactions.tsx` with: Date, Intitulé, Entrée, Sortie, Solde, Note. The "Entrée" and "Sortie" columns display `amount` based on whether the transaction increases or decreases the bank account balance.

## Balance Impact Logic (from `app/api/transactions/route.ts:14-24`)

The table uses `useTransactions({ accountId })` which calls `/api/transactions?accountId=...`. That route's `computeTransactionBalances()` already correctly handles TRANSFER:

| Type | Condition | Impact | Column |
|---|---|---|---|
| DEPOSIT | (always) | `balanceAfter += amount` | **Entrée** |
| WITHDRAWAL | (always) | `balanceAfter -= amount` | **Sortie** |
| TRANSFER | `accountId === fromAccountId` | `balanceAfter -= amount` | **Sortie** |
| TRANSFER | `accountId === toAccountId` | `balanceAfter += amount` | **Entrée** |
| TRANSFER | `fromAccountId` is null or same as `accountId` (legacy) | `balanceAfter -= amount` | **Sortie** |

## "Intitulé" Column Logic

Reuse the same logic as `getIntitule()` in `transaction-detail-drawer.tsx:25-55`:

| Type | Intitulé |
|---|---|
| DEPOSIT | `Encaissement de {account.firstName} {account.lastName}` |
| WITHDRAWAL | `Décaissement de {account.firstName} {account.lastName}` |
| TRANSFER | `Transfert de {fromAccount.firstName} {fromAccount.lastName} à {toAccount.firstName} {toAccount.lastName}` |

The API already includes `account`, `fromAccount`, and `toAccount` in the response (see `route.ts:58`).

## Affected File

### MODIFY: `components/bank-accounts/bank-account-transactions.tsx`

Replace the `columns` useMemo (lines 127–194) with the new column definitions:

| Column Key | Title | Render |
|---|---|---|
| `date` | Date | `formatDate(date)` |
| `intitule` | Intitulé | See logic above (inline render using `record`) |
| `entry` | Entrée | `formatCurrency(amount)` if transaction increases balance (see table above), else `"-"` |
| `exit` | Sortie | `formatCurrency(amount)` if transaction decreases balance (see table above), else `"-"` |
| `balanceAfter` | Solde | `formatCurrency(balanceAfter, company?.currency)` (same as current) |
| `message` | Note | `v \|\| "-"` |

**Columns to REMOVE** (not in new spec):
- "Type" (raw `dataIndex: "type"` showing `DEPOSIT`/`WITHDRAWAL`/`TRANSFER` — replaced by "Intitulé" with French labels)
- "Montant" (replaced by Entrée/Sortie split)
- "Quantité d'or" (removed from table; still accessible in drawer)
- "Titre" (replaced by "Intitulé")
- "Transfert" (the from→to display — now shown in "Intitulé")
- "Opérateur" (removed from table; still shown in drawer under "Autres informations")

**No other changes needed.** The drawer, state, onRow, modal, and form remain unchanged. The `useMemo` dependency array stays `[company?.currency, accountId]` (add `accountId` since the Entrée/Sortie render logic now depends on it).

## Validation
- Run `npx tsc --noEmit`
