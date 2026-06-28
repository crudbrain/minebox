# Plan: Replace deprecated `destroyOnClose` with `destroyOnHidden`

## Context

Antd v6.4.5 deprecated `Modal`'s `destroyOnClose` prop in favor of `destroyOnHidden`. The TypeScript deprecation notice confirms: `@deprecated — Please use destroyOnHidden instead`. The semantics are identical — both destroy the modal's DOM content when the modal is hidden/closed.

## Files to Modify

| # | File | Line |
|---|---|---|
| 1 | `components/bank-accounts/bank-account-form-modal.tsx` | 64 |
| 2 | `components/bank-accounts/bank-account-transactions.tsx` | 207 |
| 3 | `components/partners/partner-form-modal.tsx` | 52 |
| 4 | `components/partners/partner-transfers.tsx` | 203 |

## Change

In each file: replace `destroyOnClose` with `destroyOnHidden` on the `<Modal>` component. No other changes needed.

## Validation

- `npx next build` compiles without errors
- No deprecation warning for `destroyOnClose` in TypeScript
