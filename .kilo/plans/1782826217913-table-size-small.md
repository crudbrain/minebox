# Plan: Add `size="small"` to all Table components

## Context
All Ant Design `<Table>` components must have the `size="small"` prop.

## Current State
7 `<Table>` instances found. 2 already have `size="small"` (print-mode tables). 5 are missing it.

## Changes Required

Add `size="small"` to each of these 5 `<Table>` instances:

1. **`components/bank-accounts/bank-account-transactions.tsx:318`** — main transactions table
2. **`components/partners/partner-transfers.tsx:271`** — main transfers table
3. **`app/ws/settings/users/page.tsx:379`** — users table
4. **`components/partners/partner-table.tsx:91`** — partners table
5. **`components/bank-accounts/bank-account-table.tsx:120`** — bank accounts table

No other changes needed. The 2 print-mode tables at `bank-account-transactions.tsx:475` and `partner-transfers.tsx:405` already have `size="small"`.

## Validation
- Verify all 7 `<Table>` instances now have `size="small"` via grep.
- Run `npm run build` (or lint/typecheck) to confirm no regressions.
