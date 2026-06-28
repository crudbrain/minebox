# Update Partner Transfers Table Columns

## Goal
Replace the current table columns in `partner-transfers.tsx` with: Date, Expéditeur, Entrée, Sortie, Qté Or, Type de transfert, Solde, Note. The "Entrée" and "Sortie" columns display `amount` based on whether the transfer increases or decreases the partner balance.

## Balance Impact Logic (from `app/api/transfers/route.ts:14-15`)
- `GOLD_TRANSFER` → `balanceAfter += amount` → **Entrée** (amount shown in Entrée column, Sortie shows `-`)
- `MONEY_TRANSFER` → `balanceAfter -= amount` → **Sortie** (amount shown in Sortie column, Entrée shows `-`)

## Affected File

### MODIFY: `components/partners/partner-transfers.tsx`

Replace the `columns` useMemo (lines 103–153) with the new column definitions:

| Column Key | Title | Render |
|---|---|---|
| `date` | Date | `formatDate(date)` |
| `sender` | Expéditeur | `record.sender` (direct, no render needed — just `dataIndex`) |
| `entry` | Entrée | `formatCurrency(amount)` if `type === "GOLD_TRANSFER"`, else `"-"` |
| `exit` | Sortie | `formatCurrency(amount)` if `type === "MONEY_TRANSFER"`, else `"-"` |
| `goldQuantity` | Qté Or | `v \|\| "-"` (same as current) |
| `type` | Type de transfert | `"Transfert d'or"` for `GOLD_TRANSFER`, `"Transfert d'argent"` for `MONEY_TRANSFER` |
| `balanceAfter` | Solde | `formatCurrency(balanceAfter, company?.currency)` (same as current) |
| `message` | Note | `v \|\| "-"` |

**Columns to REMOVE** (not in new spec):
- "Type" (raw `dataIndex: "type"` showing `MONEY_TRANSFER`/`GOLD_TRANSFER` — replaced by "Type de transfert" with French labels)
- "Montant" (replaced by Entrée/Sortie split)
- "Opérateur" (removed from table; still shown in drawer under "Autres informations")

**No other changes needed.** The drawer, state, onRow, and form remain unchanged.

## Validation
- Run `npx tsc --noEmit`
