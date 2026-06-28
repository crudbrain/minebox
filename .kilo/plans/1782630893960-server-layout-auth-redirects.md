# Plan: Convert WorkspaceLayout to Server Component with Auth Checks

## Context

`app/ws/layout.tsx` is currently a client component that checks authentication via `useSession()` (better-auth React hook) and company existence via `useCompany()` (React Query fetch). This means unauthenticated users see a brief flash of loading state before being redirected client-side. The goal is to make auth + company checks server-side so redirects happen before any client JS renders.

Additionally, `proxy.ts` exists with session cookie validation logic but is not a valid Next.js middleware (wrong file name, wrong export). It must be fixed for early-edge protection.

## Current State

- `app/ws/layout.tsx` — `'use client'`, uses `useSession()`, `useCompany()`, `useRouter()`, `useEffect()` for redirects
- `proxy.ts` — has `getSessionCookie` logic + matcher config, but not wired as Next.js middleware
- No `middleware.ts` at project root
- API routes already use `auth.api.getSession({ headers: request.headers })` server-side
- `lib/prisma.ts` — available for direct DB access in server components
- `components/ws/sidebar.tsx` — `'use client'`, uses `useCompany()`, `usePathname()`
- `components/ws/user-dropdown.tsx` — `'use client'`, uses `useSession()`

## Files to Modify

### 1. `proxy.ts` → rename/export as Next.js middleware

- Rename file to `middleware.ts` (Next.js convention at project root)
- Export a default function named `middleware` (or named export) that:
  - Calls `getSessionCookie(request)` from `better-auth/cookies`
  - If no session cookie → `NextResponse.redirect(new URL("/login", request.url))`
  - Otherwise → `NextResponse.next()`
- Keep the existing `config` export with `matcher: ["/ws/:path*"]`
- This provides edge-level auth check — blocks unauthenticated requests before they reach the layout

### 2. `app/ws/layout.tsx` → server component

- Remove `'use client'` directive
- Import `headers` from `next/headers`
- Import `redirect` from `next/navigation`
- Import `auth` from `@/lib/auth`
- Import `prisma` from `@/lib/prisma`
- Call `auth.api.getSession({ headers: await headers() })` to get session
- If no session → `redirect("/login")`
- Call `prisma.company.findFirst()` to check company existence
- If no company → `redirect("/setup")`
- Pass session + company data to a new client child component

### 3. New: `components/ws/workspace-shell.tsx` — client component

- `'use client'`
- Receives `session` and `company` as props
- Renders the Antd `Layout` + `Sidebar` + `Content` structure (currently in the layout)
- Pass `company` prop down to `Sidebar` to avoid redundant `useCompany()` fetch
- The `Sidebar` component still needs `usePathname()` so remains `'use client'`

### 4. `components/ws/sidebar.tsx` — accept optional `company` prop

- Add optional `company` prop to `Sidebar`
- If `company` prop is provided, skip the `useCompany()` fetch (avoid duplicate request)
- Keep `useCompany()` as fallback for when prop is not passed (backward compat)

## Data Flow After Changes

```
Request → middleware.ts (cookie check, redirect if missing) → layout.tsx (server)
  → auth.api.getSession() (no session → redirect /login)
  → prisma.company.findFirst() (no company → redirect /setup)
  → <WorkspaceShell session={session} company={company}>
      → <Sidebar company={company} /> (no extra fetch)
      → <Content>{children}</Content>
    </WorkspaceShell>
```

## Key Design Decisions

- **Middleware checks cookie only** — no Prisma call in middleware (would be slow at edge). Company check stays in server layout.
- **Layout uses `auth.api.getSession()`** — same pattern used in all API routes, validates the full session (not just cookie presence).
- **Company fetched via Prisma direct** — no HTTP fetch to `/api/company`. Direct DB call is faster in server component and avoids circular cookie-forwarding issues.
- **WorkspaceShell is a thin client wrapper** — only exists because Antd Layout + Sidebar need client-side interactivity. All auth/data logic stays server-side.
- **`redirect()` instead of `router.push()`** — server-side redirect is a proper HTTP redirect, no client flash.

## Validation

- `npx next build` compiles without errors
- Visiting `/ws/*` while unauthenticated → immediate redirect to `/login` (no flash)
- Visiting `/ws/*` with no company → redirect to `/setup`
- Visiting `/ws/*` while authenticated with company → normal render
- Sidebar renders company info correctly (no duplicate fetch)
