# Fix deprecated `.flatten()` calls — replace with `z.flattenError()`

## Context
Zod 4 (v4.4.3) deprecates the instance method `error.flatten()` on `ZodError`. The replacement is the top-level `z.flattenError(error)` function, which returns the identical shape `{ formErrors: string[], fieldErrors: Record<string, string[]> }`.

## Changes

For each of the 9 files below:
1. Add `import { z } from "zod"` to the imports (if not already present).
2. Replace `parsed.error.flatten()` with `z.flattenError(parsed.error)`.

### Files

| # | File | Line | Current | Replacement |
|---|------|------|---------|-------------|
| 1 | `app/api/company/route.ts` | 27 | `parsed.error.flatten()` | `z.flattenError(parsed.error)` |
| 2 | `app/api/bank-accounts/route.ts` | 70 | `parsed.error.flatten()` | `z.flattenError(parsed.error)` |
| 3 | `app/api/bank-accounts/[id]/route.ts` | 76 | `parsed.error.flatten()` | `z.flattenError(parsed.error)` |
| 4 | `app/api/partners/route.ts` | 63 | `parsed.error.flatten()` | `z.flattenError(parsed.error)` |
| 5 | `app/api/partners/[id]/route.ts` | 73 | `parsed.error.flatten()` | `z.flattenError(parsed.error)` |
| 6 | `app/api/transactions/route.ts` | 77 | `parsed.error.flatten()` | `z.flattenError(parsed.error)` |
| 7 | `app/api/transactions/[id]/route.ts` | 25 | `parsed.error.flatten()` | `z.flattenError(parsed.error)` |
| 8 | `app/api/transfers/route.ts` | 77 | `parsed.error.flatten()` | `z.flattenError(parsed.error)` |
| 9 | `app/api/transfers/[id]/route.ts` | 25 | `parsed.error.flatten()` | `z.flattenError(parsed.error)` |

## Validation
- Run `npx tsc --noEmit` (or the project's typecheck command) to confirm no type errors.
- Confirm no remaining `parsed.error.flatten()` or `.error.flatten()` calls via grep.
