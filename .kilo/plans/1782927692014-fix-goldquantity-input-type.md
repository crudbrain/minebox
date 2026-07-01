# Fix goldQuantity InputNumber → Input

**Problem**: `goldQuantity` is `z.string()` in the Zod schemas (`lib/schemas/transaction.ts`, `lib/schemas/transfer.ts`), but `<InputNumber>` returns a `number`, causing: `"Invalid input: expected string, received number"`.

**Fix**: Replace `<InputNumber>` with `<Input>` for the `goldQuantity` field in both transaction/transfer forms.

## Changes

1. **`components/bank-accounts/bank-account-transactions.tsx`** line 415:
   - Replace `<InputNumber min={0.01} step={0.01} className="w-full" />` with `<Input />`

2. **`components/partners/partner-transfers.tsx`** line 372:
   - Replace `<InputNumber min={0.01} step={0.01} className="w-full" />` with `<Input />`

Both files already import `Input` from antd. No schema changes needed — they already expect `z.string()`.

## Validation
- Submit a transaction with a goldQuantity value → should pass Zod validation (string, not number)
- Submit a transfer with goldQuantity → same
- Edit an existing transaction/transfer → same
