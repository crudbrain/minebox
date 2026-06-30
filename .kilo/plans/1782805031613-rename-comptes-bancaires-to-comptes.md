# Rename "Comptes bancaires" → "Comptes" / "compte bancaire" → "compte"

## Goal
Simplify UI labels: replace "Comptes bancaires" with "Comptes" and "compte bancaire" with "compte".

## Changes

### Source files (4 edits)

1. **`app/ws/(dashboard)/page.tsx:17`**
   - `title="Comptes bancaires"` → `title="Comptes"`

2. **`app/ws/bank-accounts/page.tsx:15`**
   - `title="Comptes bancaires"` → `title="Comptes"`

3. **`components/bank-accounts/bank-account-detail.tsx:109`**
   - `"Supprimer ce compte bancaire. Cette action est irréversible."` → `"Supprimer ce compte. Cette action est irréversible."`

4. **`components/bank-accounts/bank-account-detail.tsx:125`**
   - `` `le compte bancaire "${bankAccount.accountNumber}"` `` → `` `le compte "${bankAccount.accountNumber}"` ``

### Plan files — no changes (documentation only, not executable)

## Validation
- Visual check: dashboard card title, bank-accounts page header, detail danger zone text, and delete confirmation modal should all show "Comptes" / "compte" instead of "Comptes bancaires" / "compte bancaire".
