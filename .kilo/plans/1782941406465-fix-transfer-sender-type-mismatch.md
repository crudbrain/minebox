# Fix: Transfer `sender` type mismatch with Prisma

## Problem
`app/api/transfers/route.ts:101` — type error: `sender` is `string | undefined` from Zod but Prisma requires `string` (non-nullable).

**Root cause:** `sender` is defined as `z.string().optional()` in the Zod schema, producing `string | undefined`. The Prisma `Transfer` model declares `sender String` (required). Spreading `parsed.data` into `tx.transfer.create({ data: ... })` passes `sender: undefined`, which is incompatible.

## Fix

In `lib/schemas/transfer.ts`:

1. Line 8: Change `sender: z.string().optional()` → `sender: z.string().default("")` in `transferCreateSchema`
2. Line 17: Change `sender: z.string().optional()` → `sender: z.string().default("")` in `transferUpdateSchema`

This matches the existing pattern for `message` (Prisma `String` with Zod `.default("")`) and `goldQuantity` (Prisma `String?` with Zod `.optional()`).

## Validation
Run `npx tsc --noEmit` (or the project's typecheck command) to confirm the type error is resolved.
