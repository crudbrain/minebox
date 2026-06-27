# Plan: Workspace Application - Full Implementation

## Context
Build the complete Minebox workspace application with protected routes, sidebar navigation, BankAccount and Partner management (list + individual pages with tabs), Company setup, and full API layer. Uses Ant Design 6, better-auth, Prisma (Neon), nuqs, React Query.

## Key Decisions
- **Company**: Unique in DB (first record). Setup via `/setup` if none exists. Hook `useCompany` with React Query.
- **Route protection**: `proxy.ts` (middleware) checks better-auth session cookie, redirects to `/` if missing. Matcher: `/ws/:path*`.
- **Auth**: better-auth only (no custom auth functions). Client hooks from `auth-client.ts`.
- **Tabs on individual pages**: Horizontal sub-menu (Ant Design Menu `mode="horizontal"`).
- **Pagination/filters**: `nuqs` for URL search params, API receives as query params.
- **Create/Edit forms**: Ant Design Modal.
- **Post-setup flow**: Redirect to `/login` (no auto-login).
- **Admin user**: Created automatically during `/setup` via `auth.api.signUp` server-side.
- **AccountNumber generation**: Dedicated API endpoint `GET /api/bank-accounts/generate-account-number` that auto-generates a unique account number based on current year prefix + sequential suffix (padded to 5 digits). Called by the form before/during creation.
- **balanceAfter calculation**: When fetching transactions for a BankAccount, always compute `balanceAfter` by running a cumulative balance over transactions ordered by date ASC. Same logic for transfers of a Partner. DEPOSIT → balanceAfter += amount; WITHDRAWAL/TRANSFER → balanceAfter -= amount. MONEY_TRANSFER → balanceAfter -= amount; GOLD_TRANSFER → balanceAfter += amount. This is a computed field, not stored in DB.

## File Structure

```
app/
  layout.tsx                          (root - minimal, no changes needed)
  page.tsx                            (landing page)
  login/page.tsx                      (login page with better-auth)
  setup/page.tsx                      (company setup + admin user creation)
  ws/
    layout.tsx                        (workspace layout with sidebar)
    dashboard/page.tsx                (dashboard)
    bank-accounts/
      page.tsx                        (list of BankAccounts)
      [id]/page.tsx                   (individual BankAccount - tabs)
    partners/
      page.tsx                        (list of Partners)
      [id]/page.tsx                   (individual Partner - tabs)
  api/
    auth/[...all]/route.ts            (existing - better-auth)
    company/route.ts                  (GET company, POST create/setup)
    bank-accounts/
      route.ts                        (GET list with pagination/filters, POST create)
      generate-account-number/
        route.ts                      (GET - auto-generate unique accountNumber)
      [id]/route.ts                   (GET one, PUT update, DELETE)
    partners/
      route.ts                        (GET list, POST create)
      [id]/route.ts                   (GET one, PUT update, DELETE)
    transactions/
      route.ts                        (GET list with filters, POST create)
      [id]/route.ts                   (PUT update, DELETE)
    transfers/
      route.ts                        (GET list with filters, POST create)
      [id]/route.ts                   (PUT update, DELETE)

components/
  providers.tsx                       (existing - add NuqsAdapter)
  ws/
    sidebar.tsx                       (sidebar: logo+company name top, menu, avatar bottom)
    user-dropdown.tsx                  (avatar dropdown: name, email, Déconnecter)
  bank-accounts/
    bank-account-table.tsx            (reusable table with pagination)
    bank-account-form-modal.tsx       (create/edit Modal form)
    bank-account-detail.tsx           (detail tab content + edit button)
    bank-account-transactions.tsx     (transactions tab content)
  partners/
    partner-table.tsx                  (reusable table with pagination)
    partner-form-modal.tsx            (create/edit Modal form)
    partner-detail.tsx                (detail tab content + edit button)
    partner-transfers.tsx             (transfers tab content)
  shared/
    detail-tabs-header.tsx            (horizontal sub-menu + title for individual pages)
    page-header.tsx                   (page title + action button pattern)

lib/
  auth.ts                             (existing)
  auth-client.ts                      (existing)
  prisma.ts                           (existing)
  api/
    bank-accounts.ts                  (client API functions)
    partners.ts                       (client API functions)
    transactions.ts                    (client API functions)
    transfers.ts                       (client API functions)
    company.ts                        (client API functions)
  hooks/
    use-company.ts                    (useCompany - React Query)
    use-session.ts                    (wrapper for better-auth useSession)
    use-bank-accounts.ts              (React Query hooks: list, detail, create, update, delete)
    use-partners.ts                   (React Query hooks)
    use-transactions.ts               (React Query hooks)
    use-transfers.ts                   (React Query hooks)
  schemas/
    bank-account.ts                   (Zod validation schema - accountNumber optional on create)
    partner.ts
    transaction.ts
    transfer.ts
    company.ts
    setup.ts                          (combined company + admin user schema)
  utils.ts                            (formatCurrency, formatDate, etc.)
```

## Tasks (Ordered)

### 1. Install nuqs + zod
```bash
npm install nuqs zod
```

### 2. Update `proxy.ts` - extend matcher
Change matcher from `/dashboard` to `/ws/:path*` to protect all workspace routes.

### 3. Update `components/providers.tsx` - add NuqsAdapter
Wrap app with nuqs `NuqsAdapter` provider so nuqs parsers work in client components.

### 4. Create `lib/utils.ts`
Utility functions: `formatCurrency`, `formatDate`, `cn` (classname merger if needed).

### 5. Create Zod schemas (`lib/schemas/`)
- `company.ts`: Company create/update schema (name, code, currency required; rest optional)
- `setup.ts`: Combined schema for setup (company fields + admin user: name, email, password)
- `bank-account.ts`: BankAccount create/update. On create, `accountNumber` is **optional** (auto-generated if not provided). On update, `accountNumber` is read-only.
- `partner.ts`: Partner create/update (code required, required fields)
- `transaction.ts`: Transaction create/update
- `transfer.ts`: Transfer create/update

### 6. Create API routes (`app/api/`)
Each route uses Prisma directly, validates with Zod, and returns JSON. All routes except `/api/auth/*` and `/api/company` (POST for setup) must verify auth session using `auth.api.getSession()`.

**`api/company/route.ts`**:
- `GET`: Return first Company from DB (or 404). No auth required.
- `POST`: Create company. Uses better-auth `auth.api.signUp` to create admin user in same call. No auth required (setup flow). Transaction: create Company + sign up admin user.

**`api/bank-accounts/route.ts`**:
- `GET`: List with pagination (`page`, `pageSize`), filters (`search`, `blocked`, `gender`). Return `{ data, total, page, pageSize }`. Filter out deleted.
- `POST`: Create BankAccount. Validate with Zod. If `accountNumber` not provided, call generate logic.

**`api/bank-accounts/generate-account-number/route.ts`**:
- `GET`: Auto-generate unique account number. Logic (adapted from user's reference):
  ```ts
  const currentYear = new Date().getFullYear();
  const prefix = String(currentYear).substring(2);
  const existing = await prisma.bankAccount.findMany({
    where: { accountNumber: { startsWith: prefix } },
    select: { accountNumber: true },
  });
  const suffixes = existing.map(e => Number(e.accountNumber.substring(2)));
  const maxSuffix = suffixes.length ? Math.max(...suffixes) : 0;
  const newSuffix = String(maxSuffix + 1).padStart(5, "0");
  const newAccountNumber = `${prefix}${newSuffix}`;
  // Verify uniqueness (safety check)
  const duplicate = await prisma.bankAccount.findUnique({
    where: { accountNumber: newAccountNumber },
  });
  if (duplicate) throw new Error("Generated account number not unique, retry.");
  return Response.json({ accountNumber: newAccountNumber });
  ```

**`api/bank-accounts/[id]/route.ts`**:
- `GET`: Single BankAccount with transactions (filtered: `deleted: false`). Each transaction includes computed `balanceAfter`:
  ```ts
  // Fetch transactions ordered by date ASC, filtered deleted: false
  const transactions = await prisma.transaction.findMany({
    where: { accountId, deleted: false },
    orderBy: { date: "asc" },
    include: { operator: true },
  });
  // Compute running balance
  let balanceAfter = 0;
  const transactionsWithBalance = transactions.map(t => {
    if (t.type === "DEPOSIT") balanceAfter += t.amount;
    else if (t.type === "WITHDRAWAL" || t.type === "TRANSFER") balanceAfter -= t.amount;
    return { ...t, balanceAfter };
  });
  ```
- `PUT`: Update BankAccount
- `DELETE`: Not applicable (use `blocked: true` instead of deletion)

**`api/partners/route.ts`**:
- `GET`: List with pagination/filters (`search`, `code`). Filter `deleted: false`. Return `{ data, total, page, pageSize }`.
- `POST`: Create Partner. Validate with Zod.

**`api/partners/[id]/route.ts`**:
- `GET`: Single Partner with transfers (all transfers, not filtered by deleted). Each transfer includes computed `balanceAfter`:
  ```ts
  const transfers = await prisma.transfer.findMany({
    where: { partnerId },
    orderBy: { date: "asc" },
    include: { operator: true },
  });
  let balanceAfter = 0;
  const transfersWithBalance = transfers.map(t => {
    if (t.type === "GOLD_TRANSFER") balanceAfter += t.amount;
    else if (t.type === "MONEY_TRANSFER") balanceAfter -= t.amount;
    return { ...t, balanceAfter };
  });
  ```
- `PUT`: Update Partner
- `DELETE`: Soft-delete (set `deleted: true`)

**`api/transactions/route.ts`**:
- `GET`: List with filters (`accountId`, `type`, `dateFrom`, `dateTo`). Filter `deleted: false`. Pagination. When `accountId` is provided, compute `balanceAfter` for each transaction using running cumulative balance (ordered by date ASC, same logic as `/api/bank-accounts/[id]`).
- `POST`: Create Transaction. Validate. Update BankAccount balance accordingly (DEPOSIT: +, WITHDRAWAL/TRANSFER: -).

**`api/transactions/[id]/route.ts`**:
- `PUT`: Update Transaction
- `DELETE`: Soft-delete (set `deleted: true`). Reverse balance impact on BankAccount.

**`api/transfers/route.ts`**:
- `GET`: List with filters (`partnerId`, `type`, `dateFrom`, `dateTo`). Pagination. When `partnerId` is provided, compute `balanceAfter` for each transfer using running cumulative balance (ordered by date ASC, same logic as `/api/partners/[id]`).
- `POST`: Create Transfer. Validate. Update Partner balance accordingly.

**`api/transfers/[id]/route.ts`**:
- `PUT`: Update Transfer
- `DELETE`: Hard delete. Reverse balance impact on Partner.

### 7. Create client API functions (`lib/api/`)
Functions that call fetch against the API routes. Typed return values. Example:
```ts
export async function getBankAccounts(params: { page: number; pageSize: number; search?: string }) {
  const sp = new URLSearchParams();
  sp.set('page', String(params.page));
  sp.set('pageSize', String(params.pageSize));
  if (params.search) sp.set('search', params.search);
  const res = await fetch(`/api/bank-accounts?${sp}`);
  if (!res.ok) throw new Error('Failed to fetch bank accounts');
  return res.json() as Promise<{ data: BankAccount[]; total: number; page: number; pageSize: number }>;
}

export async function generateAccountNumber() {
  const res = await fetch('/api/bank-accounts/generate-account-number');
  if (!res.ok) throw new Error('Failed to generate account number');
  return res.json() as Promise<{ accountNumber: string }>;
}
```

### 8. Create React Query hooks (`lib/hooks/`)
- `use-session.ts`: Export `useSession` wrapping `authClient.useSession` from better-auth
- `use-company.ts`: `useCompany` hook with `useQuery` calling `GET /api/company`
- `use-bank-accounts.ts`: `useBankAccounts` (list with nuqs params), `useBankAccount` (detail), `useCreateBankAccount`, `useUpdateBankAccount`, `useDeleteBankAccount` with `useMutation` + `useQueryClient` invalidation
- Same pattern for partners, transactions, transfers
- `use-generate-account-number.ts`: Hook to call `generateAccountNumber()` (used in BankAccountFormModal on mount in create mode)

### 9. Create shared components (`components/shared/`)
- `page-header.tsx`: Title + optional action button (e.g., "Nouveau compte"). Props: `title`, `action?: { label, icon, onClick }`
- `detail-tabs-header.tsx`: Horizontal Ant Design Menu with title, for individual pages. Props: `title`, `tabs: {key, label}[]`, `activeKey`, `onChange`

### 10. Create workspace sidebar components (`components/ws/`)
- `sidebar.tsx`: Ant Design Layout.Sider with:
  - Top: Company logo (if `company.logo` exists) + `company.name` (or `company.shortName`)
  - Middle: Menu items with `usePathname` for active:
    - Dashboard (`/ws/dashboard`, icon: DashboardOutlined)
    - Banque et crédits (`/ws/bank-accounts`, icon: BankOutlined)
    - Partenaires et crédits (`/ws/partners`, icon: TeamOutlined)
  - Bottom: User dropdown
  - Collapsible (optional)
- `user-dropdown.tsx`: Ant Design Dropdown with avatar trigger. Items: user name (disabled), email (disabled), divider, Déconnecter. Uses `useSession` + `authClient.signOut` (redirects to `/login` after sign out).

### 11. Create workspace layout (`app/ws/layout.tsx`)
Client component. Ant Design Layout with Sider (sidebar) + Content area. Uses `useCompany` and `useSession`. Shows loading skeleton while data loads. Redirects to `/login` if no session.

### 12. Create login page (`app/login/page.tsx`)
Client component. Ant Design Form (email, password). Uses `authClient.signIn.email` from better-auth. Redirect to `/ws/dashboard` on success. Link to `/setup` if no company exists.

### 13. Create setup page (`app/setup/page.tsx`)
Client component. Single form in Ant Design Card with two sections:
- Section 1: Company info (name, code, currency required; optional: shortName, country, province, city, address, phones, email, webSiteUrl, motto, description, logo, icon)
- Section 2: Admin user (name, email, password, confirm password)
- On submit: `POST /api/company` (creates company + admin user server-side via `auth.api.signUp`)
- Redirect to `/login` on success
- On mount: check if company exists (`GET /api/company`), redirect to `/login` if it does

### 14. Create dashboard page (`app/ws/dashboard/page.tsx`)
Client component. Summary using Ant Design Card/Statistic:
- Total BankAccounts count
- Total Partners count
- Total balance (BankAccounts)
- Recent transactions (last 5)
Uses React Query hooks.

### 15. Create BankAccount pages and components

**`app/ws/bank-accounts/page.tsx`**: List page with `PageHeader` ("Comptes bancaires", action: "Nouveau compte"), `BankAccountTable`, `BankAccountFormModal` for create.

**`components/bank-accounts/bank-account-table.tsx`**: Ant Design Table with columns (accountNumber, fullName, phone, balance, blocked status, actions). Pagination via nuqs (`page`, `pageSize`). Search input via nuqs (`search`). Row click navigates to `/ws/bank-accounts/[id]`.

**`components/bank-accounts/bank-account-form-modal.tsx`**: Ant Design Modal with Form. Props: `open`, `onClose`, `bankAccount?` (edit mode). On create mode: auto-fetch accountNumber via `useGenerateAccountNumber` and pre-fill. Uses `useCreateBankAccount` or `useUpdateBankAccount`.

**`app/ws/bank-accounts/[id]/page.tsx`**: Individual page with `DetailTabsHeader` (tabs: Transactions | Détails). Uses nuqs for active tab (`tab` search param).

**`components/bank-accounts/bank-account-detail.tsx`**: Ant Design Descriptions showing all BankAccount fields. Edit button opens `BankAccountFormModal` in edit mode.

**`components/bank-accounts/bank-account-transactions.tsx`**: Ant Design Table of transactions for this BankAccount. Pagination via nuqs. "Nouvelle transaction" button opens a Modal form. Columns: date, type, amount, goldQuantity, title, message, operator, **balanceAfter** (computed by API), actions (edit, delete/soft-delete).

### 16. Create Partner pages and components
Same pattern as BankAccount, adapted for Partner model.

**`app/ws/partners/page.tsx`**: List page with `PageHeader` ("Partenaires", action: "Nouveau partenaire").

**`components/partners/partner-table.tsx`**: Table with columns (code, balance, actions). Pagination + search via nuqs.

**`components/partners/partner-form-modal.tsx`**: Modal form for create/edit.

**`app/ws/partners/[id]/page.tsx`**: Individual page with `DetailTabsHeader` (tabs: Transferts | Détails).

**`components/partners/partner-detail.tsx`**: Ant Design Descriptions + edit button.

**`components/partners/partner-transfers.tsx`**: Table of transfers + "Nouveau transfert" button with Modal form. Columns: date, type, amount, goldQuantity, sender, message, operator, **balanceAfter** (computed by API), actions.

### 17. Update root `app/page.tsx`
Client component. Logic:
- Check if company exists (`useCompany`). If not, show link to `/setup`.
- Check if authenticated (`useSession`). If not, show link to `/login`.
- If authenticated, redirect to `/ws/dashboard`.
- Display Minebox branding.

### 18. Update `app/layout.tsx`
Adjust metadata: title "Minebox", description "Gestion de comptes bancaires et partenaires".

## Risks / Notes
- better-auth `auth.api.signUp` must be used server-side in the setup API to create the admin user with proper password hashing
- nuqs needs `NuqsAdapter` provider wrapping the app (add to `providers.tsx`)
- Ant Design 6 may have API differences from v5 - check components as needed
- The `proxy.ts` matcher uses Next.js middleware pattern - verify it works with the `/ws/:path*` glob
- All API routes need proper error handling and auth verification using `auth.api.getSession()` server-side
- Soft delete for Partner (model has `deleted` field) and Transaction (model has `deleted` field) - filter these out in GET queries by default
- Balance updates on Transaction/Transfer create/delete must be done in a Prisma transaction to ensure atomicity
- AccountNumber generation has a race condition risk - the uniqueness check at the end mitigates this but in high concurrency a retry mechanism may be needed
