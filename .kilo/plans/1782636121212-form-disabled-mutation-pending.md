# Add `disabled` prop to forms based on mutation pending state

## Context
Form components that use mutations (create/update/delete) should disable all form inputs while a mutation is in progress to prevent duplicate submissions or data conflicts.

## Changes

1. **`components/bank-accounts/bank-account-form-modal.tsx:77`**
   - Add `disabled={createMutation.isPending || updateMutation.isPending}` to `<Form>`

2. **`components/partners/partner-form-modal.tsx:65`**
   - Add `disabled={createMutation.isPending || updateMutation.isPending}` to `<Form>`

3. **`components/bank-accounts/bank-account-transactions.tsx:258`**
   - Add `disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}` to `<Form>`

4. **`components/partners/partner-transfers.tsx:217`**
   - Add `disabled={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}` to `<Form>`

## Validation
- Run `npm run lint` and `npm run typecheck` to verify no regressions.
