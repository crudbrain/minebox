# Dashboard Redesign Plan

## Goal
Replace the current dashboard (`app/ws/(dashboard)/page.tsx`) with two sections displaying aggregated stats from bank accounts and partners, using server-side Prisma aggregates instead of client-side computation over paginated data.

## Tasks

### 1. Create API endpoint `app/api/dashboard/route.ts`
- Add GET handler with auth check (same pattern as other routes)
- Run 5 Prisma aggregate queries in `Promise.all`:
  - `bankAccount.aggregate({ where: { blocked: false }, _count: true })` → `numberOfAccounts`
  - `bankAccount.aggregate({ where: { blocked: false, balance: { gt: 0 } }, _sum: { balance: true } })` → `totalBanck`
  - `bankAccount.aggregate({ where: { blocked: false, balance: { lt: 0 } }, _sum: { balance: true } })` → `totalCredit`
  - `partner.aggregate({ where: { deleted: false }, _count: true })` → `numberOfPartners`
  - `partner.aggregate({ where: { deleted: false }, _sum: { balance: true } })` → `totalPartnersCredit`
- Return JSON: `{ bankAccounts: { numberOfAccounts, totalBanck, totalCredit }, partners: { numberOfPartners, totalPartnersCredit } }`
- Error handling: follow existing route patterns (NextResponse.json with status 500)

### 2. Create API client `lib/api/dashboard.ts`
- Export `getDashboardStats()` that fetches `/api/dashboard` and returns parsed JSON
- Follow same pattern as `lib/api/bank-accounts.ts`

### 3. Create React Query hook `lib/hooks/use-dashboard.ts`
- Export `useDashboardStats()` hook wrapping `getDashboardStats`
- Query key: `["dashboard"]`

### 4. Rewrite `app/ws/(dashboard)/page.tsx`
- Remove: transactions import/hook, transactions list, total balance stat
- Keep: `'use client'`, Ant Design Card/Statistic, useCompany hook, formatCurrency
- Add: `useDashboardStats` hook
- Layout: Two sections, each in a Card with a title
  - **Section 1 — "Comptes bancaires"**: 3 `Statistic` cards in a row
    - Clients (numberOfAccounts) with `BankOutlined` icon
    - Banque (totalBanck, formatted as currency) with `DollarOutlined` icon
    - Crédits (totalCredit, formatted as currency, will be negative) with `DollarOutlined` icon
  - **Section 2 — "Partenaires"**: 2 `Statistic` cards in a row
    - Partenaires (numberOfPartners) with `TeamOutlined` icon
    - Crédits (totalPartnersCredit, formatted as currency) with `DollarOutlined` icon

## Notes
- `blocked: false` on BankAccount matches existing API route filter
- `deleted: false` on Partner matches existing API route filter
- No `owner.deleted` filter needed — BankAccount has no `owner` relation in this schema (the user's reference code had it, but the actual schema doesn't have that relation)
- Aggregate `_sum.balance` can return `null` when no rows match — default to 0 in the response
