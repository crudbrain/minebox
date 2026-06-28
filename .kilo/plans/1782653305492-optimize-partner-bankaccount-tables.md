# Optimize PartnerTable & BankAccountTable

## Context
Both `components/partners/partner-table.tsx` and `components/bank-accounts/bank-account-table.tsx` have:
- Columns array recreated on every render (no `useMemo`)
- Handler functions recreated on every render (no `useCallback`)
- Redundant Action columns (Edit/Delete) that duplicate what the detail pages already provide
- No `React.memo` wrapper
- `any` types for record parameters

The codebase already follows better patterns in `bank-account-transactions.tsx` and `partner-transfers.tsx` (which use `useMemo`/`useCallback`), and in `detail-tabs-header.tsx` (which uses `memo`).

## Tasks

### 1. Remove Action columns
- **PartnerTable**: Delete the "Actions" column object (lines 46-67) containing EditOutlined/DeleteOutlined buttons
- **BankAccountTable**: Delete the "Actions" column object (lines 67-89) containing EditOutlined/DeleteOutlined buttons
- Both tables already navigate to detail pages on row click (`onRow`), where edit/delete actions exist

### 2. Clean up unused imports
- **PartnerTable**: Remove `Button`, `Space`, `EditOutlined`, `DeleteOutlined` imports
- **BankAccountTable**: Remove `Button`, `Space`, `EditOutlined`, `DeleteOutlined` imports
- Keep `SearchOutlined` (used in search input)

### 3. Wrap columns with `useMemo`
- **PartnerTable**: Wrap `columns` in `useMemo(() => [...], [company?.currency])`
- **BankAccountTable**: Wrap `columns` in `useMemo(() => [...], [company?.currency])`
- Add `useMemo` to React import

### 4. Wrap handlers with `useCallback`
- **onRow handler**: `useCallback((record) => ({ onClick: () => router.push(...), className: "cursor-pointer" }), [router])`
- **pagination onChange**: `useCallback((p, ps) => { setPage(p); if (ps !== currentPageSize) setPageSize(ps); }, [setPage, setPageSize, currentPageSize])`
- **search onChange**: `useCallback((e) => { setSearch(e.target.value || null); setPage(1); }, [setSearch, setPage])`
- Add `useCallback` to React import

### 5. Wrap components with `React.memo`
- `export const PartnerTable = memo(function PartnerTable() { ... })`
- `export const BankAccountTable = memo(function BankAccountTable() { ... })`
- Add `memo` to React import
- Named export (not default) — consistent with existing pattern in `DetailTabsHeader`

### 6. Replace `any` with proper types
- Define local interfaces for the API response records based on the zod schemas:

```ts
// In partner-table.tsx
interface PartnerRecord {
  id: string;
  code: string;
  balance: number;
}

// In bank-account-table.tsx
interface BankAccountRecord {
  id: string;
  accountNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  balance: number;
  blocked: boolean;
}
```

- Replace all `(_: any, record: any)` with `(_: unknown, record: PartnerRecord)` / `(_: unknown, record: BankAccountRecord)`
- Replace `(balance: number)` render params keep their type (already typed)

## Validation
- Run `npm run lint` and `npm run typecheck` (or equivalent) after changes
- Verify tables still render and row click navigation still works
- Verify no Action column appears in either table
