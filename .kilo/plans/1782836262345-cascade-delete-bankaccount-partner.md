# Plan: Cascade Delete for BankAccount and Partner

## Context
Currently `BankAccount` and `Partner` use soft-delete (`blocked: true` / `deleted: true`). The goal is to switch to hard delete with `onDelete: Cascade` in the Prisma schema, so deleting a BankAccount or Partner automatically removes all linked records.

## Design Decisions
- **Hard delete + `onDelete: Cascade`** at the DB level
- **Remove `deleted` field** from `Transaction`, `Transfer`, `Partner` (no longer needed)
- **Keep `blocked` field** on `BankAccount` (business meaning: admin can block an account)
- **Interdire la suppression** d'un BankAccount s'il a des transactions TRANSFER référençant d'autres comptes (empêche les incohérences de solde sur les comptes tiers)
- **Partner delete** is safe: cascade deletes Transfers, Partner row + balance removed together

---

## Tasks

### 1. Schema changes — `prisma/schema.prisma`

- **Add `onDelete: Cascade`** on these relations:
  - `Transaction.account` → `BankAccount` (`transaction_account`, `accountId`)
  - `Transaction.fromAccount` → `BankAccount` (`transaction_from`, `fromAccountId`)
  - `Transaction.toAccount` → `BankAccount` (`transaction_to`, `toAccountId`)
  - `Transfer.partner` → `Partner` (`partnerId`)

- **Remove `deleted` field** from:
  - `Transaction` model (line 176: `deleted Boolean @default(false)`)
  - `Transfer` model (line 207: `deleted Boolean @default(false)`)
  - `Partner` model (line 188: `deleted Boolean @default(false)`)

### 2. API: `app/api/bank-accounts/[id]/route.ts` — DELETE handler

- Change `prisma.bankAccount.update({ where: { id }, data: { blocked: true } })` → `prisma.bankAccount.delete({ where: { id } })`
- **Add guard**: before deletion, check if the account has any TRANSFER transactions referencing other accounts:
  ```ts
  const transfersAsFrom = await prisma.transaction.findFirst({
    where: { fromAccountId: id, type: "TRANSFER", NOT: { toAccountId: id } },
  });
  const transfersAsTo = await prisma.transaction.findFirst({
    where: { toAccountId: id, type: "TRANSFER", NOT: { fromAccountId: id } },
  });
  if (transfersAsFrom || transfersAsTo) {
    return NextResponse.json(
      { error: "Cannot delete: account has active transfers with other accounts. Delete those transfers first." },
      { status: 409 }
    );
  }
  ```
- Remove `deleted: false` filter from GET handler (line 46): `where: { accountId: id }` (no `deleted` field anymore)

### 3. API: `app/api/partners/[id]/route.ts` — DELETE handler

- Change `prisma.partner.update({ where: { id }, data: { deleted: true } })` → `prisma.partner.delete({ where: { id } })`
- Remove `deleted: false` from GET handler `where` clause (line 32)

### 4. API: `app/api/transactions/[id]/route.ts`

- **DELETE handler**: Replace `update({ deleted: true })` with `prisma.transaction.delete({ where: { id } })`
- **DELETE handler**: Remove all `deleted: false` filters (lines 125, 139, 151)
- **DELETE handler**: Keep the balance-adjustment logic for DEPOSIT/WITHDRAWAL (adjusts the BankAccount balance before deleting the transaction). For TRANSFER, continue to handle the paired transaction and adjust both accounts' balances before deleting.
- **PUT handler**: Remove `deleted: false` from findUnique where clause (line 32) and paired query (line 60)

### 5. API: `app/api/transfers/[id]/route.ts`

- **DELETE handler**: Replace `update({ deleted: true })` with `prisma.transfer.delete({ where: { id } })`
- **DELETE handler**: Remove `deleted: false` from findUnique (line 94). Keep balance-adjustment logic (adjust Partner balance before deleting the transfer).
- **PUT handler**: Remove `deleted: false` from findUnique where clause (line 32)

### 6. API: `app/api/transactions/route.ts` — GET handler

- Remove `deleted: false` from the `where` clause (line 44)

### 7. API: `app/api/transfers/route.ts` — GET + POST handlers

- Remove `deleted: false` from GET `where` clause (line 35)
- Remove `deleted: false` from POST partner lookup (line 86)

### 8. API: `app/api/partners/route.ts` — GET handler

- Remove `deleted: false` from `where` clause (line 24)

### 9. API: `app/api/dashboard/route.ts`

- Remove `deleted: false` from Partner aggregate `where` clauses (lines 36, 40)
- BankAccount aggregates already use `blocked: false` which stays

### 10. Generate migration

- Run `npx prisma migrate dev --name add-cascade-delete-remove-soft-delete`
- This will:
  - Add `ON DELETE CASCADE` foreign keys at the DB level
  - Drop the `deleted` columns from `transaction`, `transfer`, `partner` tables
  - Hard-delete any existing soft-deleted rows (or handle manually)

### 11. Verify

- Run `npx prisma generate` and ensure the app compiles
- Test deletion of a BankAccount (with and without transfers)
- Test deletion of a Partner (cascade deletes transfers)
- Test deletion of a single Transaction and a single Transfer (balance adjustments still work)

---

## Risks & Edge Cases

- **Existing soft-deleted rows**: The migration dropping the `deleted` column will fail if there are rows with `deleted: true`. Must either hard-delete them first or handle in the migration SQL.
- **Transfer cross-account balance**: Guard prevents deleting a BankAccount with cross-account transfers, but individual Transaction deletion for TRANSFERs still needs to handle paired transaction balance adjustments.
- **Data loss**: Hard deletes are irreversible. Consider if backups are needed before migration.
