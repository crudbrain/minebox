# Plan: React Performance Optimization — Layouts, Pages & Related Components

## Scope

Optimize the recently created/modified nested-layout files and their closely related components for React rendering performance using `useMemo`, `useCallback`, and `React.memo`. Remove dead loading/not-found states from details pages (layout already blocks until data resolves).

## Files to Modify

| File | Change |
|---|---|
| `components/shared/detail-tabs-header.tsx` | `React.memo` wrapper + `useMemo` for Menu `items` |
| `app/ws/bank-accounts/[id]/layout.tsx` | `useMemo` for `tabs` array |
| `app/ws/bank-accounts/[id]/details/page.tsx` | Remove `isLoading`/`!bankAccount` dead branches; keep `useBankAccount` hook |
| `app/ws/partners/[id]/layout.tsx` | `useMemo` for `tabs` array |
| `app/ws/partners/[id]/details/page.tsx` | Remove `isLoading`/`!partner` dead branches; keep `usePartner` hook |
| `components/bank-accounts/bank-account-transactions.tsx` | `useMemo` for `columns`; `useCallback` for `handleDelete` and edit click handler |
| `components/partners/partner-transfers.tsx` | `useMemo` for `columns`; `useCallback` for `handleDelete` and edit click handler |

## Detailed Changes

### 1. `components/shared/detail-tabs-header.tsx`

- Wrap export with `React.memo` — prevents re-render when parent layout re-renders but `tabs` prop is referentially equal
- `useMemo` on `items` computation (the `tabs.map(...)` that creates Menu item objects with `<Link>` labels) — depends on `tabs`
- Remove `title` prop — it's no longer used by any consumer (both layouts render their own header above the tabs). If `title` is ever needed again, add it later.

### 2. `app/ws/bank-accounts/[id]/layout.tsx`

- `useMemo` for the `tabs` array — depends on `[id]`. Without this, every layout re-render creates a new array reference, breaking `React.memo` on `DetailTabsHeader`.
- Remove `Skeleton` import (no longer used after removing loading state from details pages? — keep it, layout still uses it for its own loading state).

### 3. `app/ws/bank-accounts/[id]/details/page.tsx`

- Remove `isLoading` branch (`<Skeleton>`) — layout already blocks rendering children until data is loaded
- Remove `!bankAccount` branch (`"Compte non trouvé"`) — layout already handles not-found
- Keep `useBankAccount(id)` call — react-query cache makes it instant; the hook is doing its job
- Remove `Skeleton` import (no longer needed)
- Simplify to: `const { data: bankAccount } = useBankAccount(id); return <BankAccountDetail bankAccount={bankAccount} />;`

### 4. `app/ws/partners/[id]/layout.tsx`

- `useMemo` for `tabs` array — depends on `[id]`

### 5. `app/ws/partners/[id]/details/page.tsx`

- Same simplification as bank-accounts details: remove dead branches, keep `usePartner` hook
- Remove `Skeleton` import
- Simplify to: `const { data: partner } = usePartner(id); return <PartnerDetail partner={partner} />;`

### 6. `components/bank-accounts/bank-account-transactions.tsx`

- `useCallback` for `handleDelete(id)` — depends on `[deleteMutation]`
- `useMemo` for `columns` array — depends on `[company?.currency, deleteMutation.isPending, handleDelete]`
  - Inline edit click handler inside `columns` uses `setEditingTransaction` (stable from `useState`) and `form.setFieldsValue` (stable from `Form.useForm`) — no need for separate `useCallback`
- Note: `deleteMutation.isPending` changes during delete operations, causing `columns` recomputation. This is acceptable — we want UI to reflect pending state, and it only recomputes during the brief delete operation, not during normal table browsing.

### 7. `components/partners/partner-transfers.tsx`

- Same pattern as bank-account-transactions: `useCallback` for `handleDelete`, `useMemo` for `columns`

## Task List

1. Rewrite `detail-tabs-header.tsx` — `React.memo` + `useMemo` for items, remove `title` prop
2. Add `useMemo` for `tabs` in `bank-accounts/[id]/layout.tsx`
3. Simplify `bank-accounts/[id]/details/page.tsx` — remove dead loading/not-found branches
4. Add `useMemo` for `tabs` in `partners/[id]/layout.tsx`
5. Simplify `partners/[id]/details/page.tsx` — remove dead loading/not-found branches
6. Add `useMemo` for `columns` + `useCallback` for `handleDelete` in `bank-account-transactions.tsx`
7. Add `useMemo` for `columns` + `useCallback` for `handleDelete` in `partner-transfers.tsx`
8. Run `npx next build` to verify

## Risks

- Removing `title` from `DetailTabsHeader` is a minor API change. Currently no consumer uses it (both layouts render headers directly). Safe to remove.
- `columns` `useMemo` with `deleteMutation.isPending` dependency means columns recompute during deletes. Acceptable — brief and infrequent.
- Removing dead loading/not-found states from details pages: if someone navigates directly to `/ws/bank-accounts/[id]/details` without the layout having loaded yet, the layout still handles loading first (it blocks `{children}` rendering). So the details page's own branches are truly dead code.

## Validation

- `npx next build` compiles without errors
- Navigate to `/ws/bank-accounts/[id]` → header + transactions render
- Navigate to `/ws/bank-accounts/[id]/details` → header persists, details render instantly (no skeleton flash)
- Navigate to `/ws/partners/[id]` → header + transfers render
- Navigate to `/ws/partners/[id]/details` → header persists, details render instantly
- No visual or behavioral changes from current implementation
