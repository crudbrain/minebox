# Fix: BankAccountLayout Hooks Order Violation

## Problem
`BankAccountLayout` (`app/ws/bank-accounts/[id]/layout.tsx`) calls `useMemo` (line 29) **after** conditional early returns (lines 22 and 26). This violates React's Rules of Hooks — hooks must be called in the same order on every render, unconditionally.

Error: `Rendered more hooks than during the previous render` because when `isLoading` is true, `useMemo` is skipped; when `isLoading` becomes false, `useMemo` runs, changing the hook count.

## Fix
Move the `useMemo` call **before** the conditional early returns, right after `useCompany()` on line 19.

### Before (broken)
```
const { data: company } = useCompany();

if (isLoading) { return <Skeleton .../>; }
if (!bankAccount) { return <div>...</div>; }

const tabs = useMemo(...);
```

### After (fixed)
```
const { data: company } = useCompany();

const tabs = useMemo(...);

if (isLoading) { return <Skeleton .../>; }
if (!bankAccount) { return <div>...</div>; }
```

## File to edit
- `app/ws/bank-accounts/[id]/layout.tsx` — move lines 29-35 (the `useMemo` block) to after line 19

## Validation
- Reload the page — the "Rendered more hooks" error should be gone
- Verify both the loading skeleton and the normal view render correctly
