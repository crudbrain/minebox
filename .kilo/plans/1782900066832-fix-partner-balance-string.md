# Fix: Partner creation - balance sent as string instead of number

## Problem
Creating a partner fails with `"Invalid input: expected number, received string"` for the `balance` field.

**Root cause:** In `components/partners/partner-form-modal.tsx:79`, the `balance` field uses `<Input type="number">`, which always submits a **string** value. The Zod schema in `lib/schemas/partner.ts:5` expects `z.number()`.

## Fix
In `components/partners/partner-form-modal.tsx`, convert `balance` to a number in `handleSubmit` before sending to the API:

```tsx
const handleSubmit = (values: any) => {
  const data = {
    ...values,
    balance: Number(values.balance),
  };
  // then use `data` instead of `values` in createMutation.mutate() / updateMutation.mutate()
};
```

Alternatively, change the schema to coerce: `z.coerce.number().default(0)` in `lib/schemas/partner.ts`, which would handle string-to-number coercion at the API level. This is more defensive but masks the real issue.

**Recommended approach:** Fix in the form handler (first option) — it's explicit and doesn't hide the type mismatch.

## Validation
- Create a partner with an initial balance and confirm no 400 error
- Edit a partner and confirm balance still works
