# Fix React Error #310 on /ws/partners/[id]

## Problem
Visiting `/ws/partners/[id]` crashes with minified React error #310 ("Hooks called conditionally") after the skeleton loading state.

## Root Cause
In `app/ws/partners/[id]/layout.tsx`, the `useMemo` hook (line 29) is called **after** two conditional early returns:
- `if (isLoading) return <Skeleton .../>` (line 21)
- `if (!partner) return <div>...</div>` (line 25)

When either condition is true, `useMemo` never executes, breaking the Rules of Hooks (hooks must always be called in the same order on every render).

## Fix
Move the `useMemo` call **above** the conditional returns so it always runs.

### Before
```tsx
const { id } = use(params);
const { data: partner, isLoading } = usePartner(id);
const { data: company } = useCompany();

if (isLoading) {
  return <Skeleton active paragraph={{ rows: 8 }} />;
}

if (!partner) {
  return <div>Partenaire non trouvé</div>;
}

const tabs = useMemo(
  () => [
    { key: "transfers", label: "Transferts", path: `/ws/partners/${id}` },
    { key: "details", label: "Détails", path: `/ws/partners/${id}/details` },
  ],
  [id]
);
```

### After
```tsx
const { id } = use(params);
const { data: partner, isLoading } = usePartner(id);
const { data: company } = useCompany();

const tabs = useMemo(
  () => [
    { key: "transfers", label: "Transferts", path: `/ws/partners/${id}` },
    { key: "details", label: "Détails", path: `/ws/partners/${id}/details` },
  ],
  [id]
);

if (isLoading) {
  return <Skeleton active paragraph={{ rows: 8 }} />;
}

if (!partner) {
  return <div>Partenaire non trouvé</div>;
}
```

## Validation
- Load `/ws/partners/[id]` — page should render without error
- Verify skeleton shows during loading, then content appears
- Verify "Partenaire non trouvé" still shows when partner is null
