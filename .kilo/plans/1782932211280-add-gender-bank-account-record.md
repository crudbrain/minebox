# Add gender to BankAccountRecord interface

## Context
The `gender` column was added to the bank account table component (`components/bank-accounts/bank-account-table.tsx:82-88`), but the TypeScript interface `BankAccountRecord` doesn't include `gender`. The Prisma model and API already return `gender` — no backend changes needed.

## Task
1. Add `gender: string` to the `BankAccountRecord` interface in `components/bank-accounts/bank-account-table.tsx:13-22`

## No other changes required
- Prisma model already has `gender` field (schema.prisma:140)
- API `GET /api/bank-accounts` already returns all fields (no `select` clause)
- Table column already renders `gender` (bank-account-table.tsx:82-88)
