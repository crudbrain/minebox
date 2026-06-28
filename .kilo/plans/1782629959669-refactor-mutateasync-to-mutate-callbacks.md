# Plan: Refactor mutateAsync + try/catch to mutate() + onSuccess/onError

## Context

All mutation calls in components currently use `mutateAsync()` wrapped in `try/catch` blocks for UI feedback (messages, modal close, form reset). TanStack Query's idiomatic pattern is `mutate()` with `onSuccess`/`onError` callbacks at the call site — fire-and-forget with no unhandled rejection risk.

The hooks (`use-*.ts`) already define `onSuccess` for cache invalidation. Callbacks passed to `mutate()` run **in addition** to the hook-level ones, so both layers work correctly.

## Files to Modify

### 1. `components/bank-accounts/bank-account-form-modal.tsx`

- `handleSubmit` (line 43): remove `async`, remove `try/catch`, replace `mutateAsync` with `mutate` + callbacks
  - `createMutation.mutate(values, { onSuccess, onError })`
  - `updateMutation.mutateAsync({ id, data }, { onSuccess, onError })` → same pattern with `mutate`
  - `onSuccess`: `message.success(...)` + `onClose()`
  - `onError`: `message.error("Échec de l'opération")`

### 2. `components/bank-accounts/bank-account-transactions.tsx`

- `handleSubmit` (line 51): remove `async`, remove `try/catch`, replace `mutateAsync` with `mutate` + callbacks
  - `createMutation.mutate(payload, { onSuccess, onError })`
  - `updateMutation.mutate({ id, data }, { onSuccess, onError })`
  - `onSuccess`: `message.success(...)` + `setModalOpen(false)` + `setEditingTransaction(null)` + `form.resetFields()`
  - `onError`: `message.error("Échec de l'opération")`
- `handleDelete` (line 76): remove `async`, remove `try/catch`, replace `mutateAsync` with `mutate` + callbacks
  - `deleteMutation.mutate(id, { onSuccess, onError })`
  - `onSuccess`: `message.success("Transaction supprimée")`
  - `onError`: `message.error("Échec de la suppression")`
  - Remove `useCallback` wrapper since there is no longer an async closure (or keep for memo if dependencies justify it)

### 3. `components/partners/partner-form-modal.tsx`

- `handleSubmit` (line 31): remove `async`, remove `try/catch`, replace `mutateAsync` with `mutate` + callbacks
  - Same pattern as bank-account-form-modal.tsx
  - `onSuccess`: `message.success(...)` + `onClose()`
  - `onError`: `message.error("Échec de l'opération")`

### 4. `components/partners/partner-transfers.tsx`

- `handleSubmit` (line 49): remove `async`, remove `try/catch`, replace `mutateAsync` with `mutate` + callbacks
  - Same pattern as bank-account-transactions.tsx
  - `onSuccess`: `message.success(...)` + `setModalOpen(false)` + `setEditingTransfer(null)` + `form.resetFields()`
  - `onError`: `message.error("Échec de l'opération")`
- `handleDelete` (line 74): remove `async`, remove `try/catch`, replace `mutateAsync` with `mutate` + callbacks
  - Same pattern as bank-account-transactions.tsx handleDelete

## Hook Files — No Changes

The existing `onSuccess` callbacks in hooks handle cache invalidation only. They remain unchanged.

## Before/After Example

**Before:**
```tsx
const handleSubmit = async (values: any) => {
  try {
    if (isEdit) {
      await updateMutation.mutateAsync({ id: bankAccount.id, data: values });
      message.success("Compte mis à jour");
    } else {
      await createMutation.mutateAsync(values);
      message.success("Compte créé");
    }
    onClose();
  } catch {
    message.error("Échec de l'opération");
  }
};
```

**After:**
```tsx
const handleSubmit = (values: any) => {
  if (isEdit) {
    updateMutation.mutate(
      { id: bankAccount.id, data: values },
      {
        onSuccess: () => { message.success("Compte mis à jour"); onClose(); },
        onError: () => { message.error("Échec de l'opération"); },
      },
    );
  } else {
    createMutation.mutate(values, {
      onSuccess: () => { message.success("Compte créé"); onClose(); },
      onError: () => { message.error("Échec de l'opération"); },
    });
  }
};
```

## Validation

- `npx next build` compiles without errors
- Verify `isPending` still works correctly on submit buttons (TanStack Query tracks pending state regardless of `mutate` vs `mutateAsync`)
