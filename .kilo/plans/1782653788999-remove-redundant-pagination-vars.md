# Remove redundant currentPage/currentPageSize variables and use nuqs defaultValue

## Context
Across 4 table components, `useQueryState` from nuqs is used for `page` and `pageSize` with parsers that already guarantee non-null defaults. However, redundant intermediate variables `currentPage = page || 1` and `currentPageSize = pageSize || 10` are created. Since nuqs supports `defaultValue`, these fallbacks are unnecessary and should be removed. Adding `defaultValue` also keeps URLs clean by not writing the default value when it matches.

## Files affected
1. `components/bank-accounts/bank-account-table.tsx`
2. `components/partners/partner-table.tsx`
3. `components/bank-accounts/bank-account-transactions.tsx`
4. `components/partners/partner-transfers.tsx`

## Changes per file

### 1. Add `defaultValue` to `useQueryState` calls
- `page`: add `defaultValue: 1`
- `pageSize`: add `defaultValue: 10`

Example:
```ts
const [page, setPage] = useQueryState("page", {
  defaultValue: 1,
  parse: (v) => Math.max(1, Number(v) || 1),
  serialize: String,
});
const [pageSize, setPageSize] = useQueryState("pageSize", {
  defaultValue: 10,
  parse: (v) => Math.max(1, Number(v) || 10),
  serialize: String,
});
```

### 2. Remove redundant variables
Delete:
```ts
const currentPage = page || 1;
const currentPageSize = pageSize || 10;
```

### 3. Replace all references
- `currentPage` -> `page`
- `currentPageSize` -> `pageSize`

This applies to:
- Hook call arguments (`page: currentPage` -> `page: page`)
- Pagination config (`current: currentPage` -> `current: page`, `pageSize: currentPageSize` -> `pageSize: pageSize`)
- `handlePaginationChange` callbacks (`if (ps !== currentPageSize)` -> `if (ps !== pageSize)`)
- `useCallback` dependency arrays (`currentPageSize` -> `pageSize`)

## Validation
- Run typecheck (`npx tsc --noEmit`) to confirm no type errors
- Verify no remaining references to `currentPage` or `currentPageSize` in the codebase
