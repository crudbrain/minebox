# Plan: Nested Layouts with Fixed Headers for Bank Accounts & Partners

## Goal

Convert the tab-based (`nuqs` query state) detail pages for `/ws/bank-accounts/[id]` and `/ws/partners/[id]` into proper Next.js nested routes with shared layouts. The layout acts as a fixed header showing entity info and a navigation menu, remaining visible across all sub-pages.

## Current State

- `app/ws/bank-accounts/[id]/page.tsx` — single page with `nuqs` `?tab=` switching between Transactions and Détails
- `app/ws/partners/[id]/page.tsx` — single page with `nuqs` `?tab=` switching between Transferts and Détails
- Both use `DetailTabsHeader` (antd `Menu` horizontal) with `onChange` callback

## Target State

### Bank Accounts (`/ws/bank-accounts/[id]`)

**New file: `app/ws/bank-accounts/[id]/layout.tsx`** — `'use client'`
- Fetch `bankAccount` via `useBankAccount(id)` from `use(params)`
- Display fixed header with:
  - `accountNumber`
  - `firstName` + `lastName`
  - `balance` (formatted with `formatCurrency` + `useCompany`)
- Navigation menu using `next/link` + `usePathname()` to highlight active route:
  - "Transactions" → `/ws/bank-accounts/[id]`
  - "Détails" → `/ws/bank-accounts/[id]/details`
- Loading state: `<Skeleton>`
- Not found state: "Compte non trouvé"
- Render `{children}` below the header/menu

**Modified: `app/ws/bank-accounts/[id]/page.tsx`**
- Remove `useBankAccount`, `useQueryState`, `DetailTabsHeader`, tab switching logic
- Simply render `<BankAccountTransactions accountId={id} />`
- Keep `'use client'` only if needed by `BankAccountTransactions` (it's already a client component)

**New file: `app/ws/bank-accounts/[id]/details/page.tsx`**
- `'use client'`
- Fetch `bankAccount` via `useBankAccount(id)` from `use(params)`
- Render `<BankAccountDetail bankAccount={bankAccount} />`
- Loading/not-found states

### Partners (`/ws/partners/[id]`)

**New file: `app/ws/partners/[id]/layout.tsx`** — `'use client'`
- Fetch `partner` via `usePartner(id)` from `use(params)`
- Display fixed header with:
  - `code`
  - `balance` (formatted with `formatCurrency` + `useCompany`)
- Navigation menu using `next/link` + `usePathname()` to highlight active route:
  - "Transferts" → `/ws/partners/[id]`
  - "Détails" → `/ws/partners/[id]/details`
- Loading state: `<Skeleton>`
- Not found state: "Partenaire non trouvé"
- Render `{children}` below the header/menu

**Modified: `app/ws/partners/[id]/page.tsx`**
- Remove `usePartner`, `useQueryState`, `DetailTabsHeader`, tab switching logic
- Simply render `<PartnerTransfers partnerId={id} />`

**New file: `app/ws/partners/[id]/details/page.tsx`**
- `'use client'`
- Fetch `partner` via `usePartner(id)` from `use(params)`
- Render `<PartnerDetail partner={partner} />`
- Loading/not-found states

### Shared Component: Update `DetailTabsHeader`

**Modified: `components/shared/detail-tabs-header.tsx`**
- Change props: replace `activeKey` + `onChange` with route-based navigation
- New props: `basePath: string`, `tabs: { key: string; label: string; path: string }[]`
- Use `usePathname()` to determine active tab
- Use `next/link` `Link` component for menu items instead of `onClick`

## Task List

1. Update `components/shared/detail-tabs-header.tsx` to support route-based navigation
2. Create `app/ws/bank-accounts/[id]/layout.tsx`
3. Modify `app/ws/bank-accounts/[id]/page.tsx` (transactions only)
4. Create `app/ws/bank-accounts/[id]/details/page.tsx`
5. Create `app/ws/partners/[id]/layout.tsx`
6. Modify `app/ws/partners/[id]/page.tsx` (transfers only)
7. Create `app/ws/partners/[id]/details/page.tsx`
8. Remove `nuqs` import dependencies from modified pages (no longer needed for tab state)

## Risks

- `nuqs` was keeping tab state in the URL (`?tab=`); moving to real routes means old URLs with `?tab=details` will need a redirect or will just default to transactions. Low risk — no explicit redirect needed.
- Both layouts fetch the entity data, and the `details/page.tsx` also fetches it. The data will be cached by react-query (`queryKey: ["bank-account", id]`) so no duplicate network requests.

## Validation

- Navigate to `/ws/bank-accounts/[id]` → see header with account info + Transactions page
- Click "Détails" menu → navigate to `/ws/bank-accounts/[id]/details` → header persists, details page shown
- Navigate to `/ws/partners/[id]` → see header with partner info + Transferts page
- Click "Détails" menu → navigate to `/ws/partners/[id]/details` → header persists, details page shown
- Active menu item highlights correctly on both routes
