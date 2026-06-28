# Plan: Server-side Auth & Company Checks for /login, /setup, and /

## Goal
Move authentication and company verification to the server side in `/login`, `/setup`, and `/` pages, performing redirects before rendering, and only rendering client components when no redirect is needed.

## Current State
- `/login/page.tsx` — `'use client'`, uses `useCompany()` (client fetch) and `authClient` for sign-in
- `/setup/page.tsx` — `'use client'`, uses `useCompany()` (client fetch) and `createCompany` API
- `/page.tsx` — `'use client'`, uses `useCompany()` + `useSession()` with client-side redirects
- `/ws/layout.tsx` — already does server-side auth + company checks with `redirect()` (correct pattern to follow)

## Changes

### 1. `/app/page.tsx` — Simple redirect
- Remove `'use client'` and all client code
- Make it a server component that does `redirect("/login")`
- No verification needed

### 2. `/app/login/page.tsx` — Server page + client component
- Remove `'use client'` from page.tsx
- Add server-side checks:
  - Get session via `auth.api.getSession({ headers: await headers() })`
  - Get company via `prisma.company.findFirst()`
  - If session AND company → `redirect("/ws/dashboard")`
  - If no company → `redirect("/setup")`
- If no redirect needed, render a new client component `<LoginForm />`
- Pass `hasCompany` boolean prop to `LoginForm` to conditionally show the "Configurer l'application" link

### 3. Create `/components/login/login-form.tsx` — Client component
- Move the entire login form UI and logic here as `'use client'`
- Accept `hasCompany: boolean` prop
- If `!hasCompany`, show the link to `/setup`
- Remove the `useCompany()` call (replaced by server prop)

### 4. `/app/setup/page.tsx` — Server page + client component
- Remove `'use client'` from page.tsx
- Add server-side check:
  - Get company via `prisma.company.findFirst()`
  - If company exists → `redirect("/login")`
- If no redirect needed, render a new client component `<SetupForm />`

### 5. Create `/components/setup/setup-form.tsx` — Client component
- Move the entire setup form UI and logic here as `'use client'`
- Remove the `useCompany()` hook and `useEffect` redirect (handled by server)
- Remove `if (isLoading)` and `if (company) return null` guards (no longer needed)

## Files to Create
- `components/login/login-form.tsx`
- `components/setup/setup-form.tsx`

## Files to Modify
- `app/page.tsx` — replace with server redirect
- `app/login/page.tsx` — convert to server component with checks + client render
- `app/setup/page.tsx` — convert to server component with checks + client render

## Pattern to Follow
Same as `app/ws/layout.tsx`:
```ts
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
```

## Validation
- Navigate to `/` → should redirect to `/login`
- Navigate to `/login` without session → should show login form
- Navigate to `/login` without company → should redirect to `/setup`
- Navigate to `/login` with session + company → should redirect to `/ws/dashboard`
- Navigate to `/setup` when company exists → should redirect to `/login`
- Navigate to `/setup` when no company → should show setup form
